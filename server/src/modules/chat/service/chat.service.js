const { generateUUID } = require('@/utils/uuid.util');
const chatRepository = require('../repository/chat.repository');
const userService = require('../../user/services/user.service');
const { transaction } = require('@/config/database.config');
const aiModerationService = require('@modules/ai_moderation/service/ai_moderation.service');

class ChatService {
    constructor() {
        this.chatRepository = chatRepository;
        this.userService = userService;
    }

    getOrCreateConversation = async ({ userId, partnerId, sosRequestId }) => {
        let conversation = null;
        let realPartnerId = partnerId;

        if (realPartnerId && !this.isUuidLike(realPartnerId)) {
            const adminUser = await this.userService.findActiveAdminUser();
            if (adminUser) {
                realPartnerId = adminUser.userId || adminUser.user_id;
            }
        }

        if (sosRequestId) {
            conversation = await this.chatRepository.findConversationBySosRequestId(sosRequestId);
        } else if (userId && realPartnerId && this.isUuidLike(realPartnerId)) {
            conversation = await this.chatRepository.findConversationByUsers(userId, realPartnerId, null);
        }

        // Khi có sosRequestId nhưng chưa có hội thoại của ca SOS: nếu đã tồn tại hội
        // thoại giữa 2 người (chưa gắn SOS) thì gắn luôn vào ca SOS thay vì tạo bản
        // thứ 2 — đảm bảo mỗi ca SOS chỉ có đúng 1 cuộc hội thoại.
        if (!conversation && sosRequestId && userId && realPartnerId && this.isUuidLike(realPartnerId)) {
            const pairConversation = await this.chatRepository.findConversationByUsers(userId, realPartnerId, null);
            if (pairConversation) {
                await this.chatRepository.updateConversationSosRequestId(pairConversation.conversation_id, sosRequestId);
                conversation = await this.chatRepository.findConversationById(pairConversation.conversation_id);
            }
        }

        if (!conversation && userId && realPartnerId && this.isUuidLike(realPartnerId)) {
            const conversationId = generateUUID();
            await transaction(async (client) => {
                await this.chatRepository.createConversation(client, {
                    conversationId,
                    user1Id: userId,
                    user2Id: realPartnerId,
                    sosRequestId: sosRequestId || null,
                });
            });
            conversation = await this.chatRepository.findConversationById(conversationId);
        }

        if (conversation) {
            const isUser1 = conversation.user1_id === userId;
            conversation.partner_id = isUser1 ? conversation.user2_id : conversation.user1_id;
            conversation.partner_name = isUser1 ? conversation.user2_name : conversation.user1_name;
            conversation.partner_phone = isUser1 ? conversation.user2_phone : conversation.user1_phone;
            conversation.partner_avatar = isUser1 ? conversation.user2_avatar : conversation.user1_avatar;
        }

        return conversation;
    }

    getUserConversations = async (userId) => {
        const userInfo = await this.userService.getUserInfoById({ userId });
        const isAdmin = userInfo?.role === 'ADMIN';
        return await this.chatRepository.getUserConversations(userId, isAdmin);
    }

    getOrCreateAdminSupportConversation = async (userId) => {
        console.log(`[CHAT DIAGNOSTIC] Running getOrCreateAdminSupportConversation for userId: ${userId}`);
        const userConversations = await this.chatRepository.getUserConversations(userId);
        const existingAdminConv = userConversations.find(c => c.partner_role === 'ADMIN');

        if (existingAdminConv) {
            console.log(`[CHAT DIAGNOSTIC] Existing admin conversation found: ${existingAdminConv.conversation_id} (partner: ${existingAdminConv.partner_id})`);
            return await this.getOrCreateConversation({ userId, partnerId: existingAdminConv.partner_id });
        }

        const adminUser = await this.userService.findActiveAdminUser();

        let adminId = adminUser ? (adminUser.userId || adminUser.user_id) : null;
        if (!adminId) {
            const anyUsers = await this.userService.getUsersAdmin({ page: 1, limit: 1 });
            if (anyUsers && anyUsers.data && anyUsers.data.length > 0) {
                adminId = anyUsers.data[0].userId || anyUsers.data[0].user_id;
            } else {
                adminId = '00000000-0000-0000-0000-000000000000';
            }
        }

        console.log(`[CHAT DIAGNOSTIC] Active Admin User ID resolved: ${adminId}`);
        return await this.getOrCreateConversation({ userId, partnerId: adminId });
    }

    getMessages = async ({ conversationId, userId, limit = 50, offset = 0 }) => {
        console.log(`[CHAT DIAGNOSTIC] getMessages called with conversationId: "${conversationId}", userId: "${userId}"`);
        const targetId = this.resolveConversationOrPartnerId(conversationId);
        let resolvedConversationId = targetId;

        if (!targetId) {
            throw new Error('Mã cuộc hội thoại không hợp lệ');
        }

        if (!this.isUuidLike(targetId)) {
            const cleanId = this.stripRolePrefix(targetId);
            if (cleanId && this.isUuidLike(cleanId)) {
                const conv = await this.getOrCreateConversation({ userId, partnerId: cleanId });
                resolvedConversationId = conv.conversation_id;
            } else if (cleanId && (cleanId.includes('admin') || cleanId.includes('support'))) {
                const conv = await this.getOrCreateAdminSupportConversation(userId);
                resolvedConversationId = conv.conversation_id;
            } else {
                console.error(`[CHAT DIAGNOSTIC ERROR] TargetId "${targetId}" is not a valid UUID or admin keyword.`);
                throw new Error('Mã cuộc hội thoại không hợp lệ');
            }
        }

        let conversation = await this.chatRepository.findConversationById(resolvedConversationId);
        if (!conversation) {
            const cleanId = this.stripRolePrefix(targetId);
            if (cleanId) {
                try {
                    if (cleanId.includes('admin') || cleanId.includes('support')) {
                        conversation = await this.getOrCreateAdminSupportConversation(userId);
                    } else {
                        conversation = await this.getOrCreateConversation({ userId, partnerId: cleanId });
                    }
                    if (conversation) {
                        resolvedConversationId = conversation.conversation_id;
                    }
                } catch (_) {}
            }
        }

        if (!conversation) {
            throw new Error('Cuộc hội thoại không tồn tại');
        }

        resolvedConversationId = conversation.conversation_id;

        const userInfo = await this.userService.getUserInfoById({ userId });
        const isUserAdmin = userInfo?.role === 'ADMIN';

        if (!isUserAdmin && conversation.user1_id !== userId && conversation.user2_id !== userId) {
            throw new Error('Bạn không có quyền xem cuộc hội thoại này');
        }

        // Tự động đánh dấu đã đọc
        await this.chatRepository.markMessagesAsRead(resolvedConversationId, userId);

        return await this.chatRepository.getMessagesByConversationId(resolvedConversationId, limit, offset);
    }

    sendMessage = async ({ conversationId, partnerId, senderId, content, messageType = 'TEXT' }) => {
        let conversation;
        let targetId = this.resolveConversationOrPartnerId(conversationId);
        const directPartnerId = this.resolveConversationOrPartnerId(partnerId);
        const fallbackPartnerId = this.stripRolePrefix(targetId);

        // Chỉ truy vấn theo conversationId khi đúng định dạng UUID.
        if (targetId && this.isUuidLike(targetId)) {
            conversation = await this.chatRepository.findConversationById(targetId);
        }

        // Nếu targetId là từ khóa admin/support
        if (!conversation && targetId && (targetId.includes('admin') || targetId.includes('support'))) {
            conversation = await this.getOrCreateAdminSupportConversation(senderId);
            if (conversation) {
                targetId = conversation.conversation_id;
            }
        }

        // Nếu conversationId không hợp lệ hoặc không tồn tại, thử resolve theo partnerId.
        if (!conversation && directPartnerId) {
            const candidatePartnerId = this.stripRolePrefix(directPartnerId) || fallbackPartnerId;
            if (candidatePartnerId && this.isUuidLike(candidatePartnerId)) {
                conversation = await this.getOrCreateConversation({ userId: senderId, partnerId: candidatePartnerId });
                targetId = conversation.conversation_id;
            } else if (candidatePartnerId && (candidatePartnerId.includes('admin') || candidatePartnerId.includes('support'))) {
                conversation = await this.getOrCreateAdminSupportConversation(senderId);
                if (conversation) {
                    targetId = conversation.conversation_id;
                }
            }
        }

        if (!conversation) {
            throw new Error('Cuộc hội thoại không tồn tại');
        }

        // Đảm bảo mã cuộc hội thoại là UUID conversation_id chuẩn
        targetId = conversation.conversation_id;

        const userInfo = await this.userService.getUserInfoById({ userId: senderId });
        const isUserAdmin = userInfo?.role === 'ADMIN';

        if (!isUserAdmin && conversation.user1_id !== senderId && conversation.user2_id !== senderId) {
            throw new Error('Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này');
        }

        if (!isUserAdmin && conversation.is_closed) {
            throw new Error('Ca cứu hộ đã hoàn thành hoặc bị hủy. Luồng trò chuyện này đã bị khóa.');
        }

        if (messageType === 'TEXT' && content) {
            const spamCheck = await aiModerationService.checkKnownSpamText(content);
            if (spamCheck.isBlocked) {
                throw new Error(`Tin nhắn bị từ chối: ${spamCheck.reason || 'Nội dung tin nhắn đã bị đánh dấu vi phạm tiêu chuẩn cộng đồng.'}`);
            }
        }

        const messageId = generateUUID();
        const now = new Date();

        let createdMessage;
        await transaction(async (client) => {
            createdMessage = await this.chatRepository.createMessage(client, {
                messageId,
                conversationId: targetId,
                senderId,
                content,
                messageType,
            });

            await this.chatRepository.updateConversationLastMessage(client, {
                conversationId: targetId,
                lastMessage: content,
                lastMessageAt: now,
            });
        });

        if (messageType === 'TEXT' && content) {
            aiModerationService.processModerationAsync("CHAT_MESSAGE", messageId, content);
        }

        const recipientId = conversation.user1_id === senderId ? conversation.user2_id : conversation.user1_id;

        return {
            message: createdMessage,
            recipientId,
            conversation,
            conversationId: targetId,
        };
    }

    closeConversationBySosRequestId = async (sosRequestId, client = null) => {
        if (!sosRequestId) return null;
        return await this.chatRepository.closeConversationBySosRequestId(client, sosRequestId);
    }

    stripRolePrefix = (value) => {
        if (!value || typeof value !== 'string') return null;
        return value.replace('victim_', '').replace('rescuer_', '').trim();
    }

    isUuidLike = (value) => {
        if (!value || typeof value !== 'string') return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    resolveConversationOrPartnerId = (value) => {
        const cleanValue = this.stripRolePrefix(value);
        if (!cleanValue) return null;
        return cleanValue;
    }
}

module.exports = new ChatService();
