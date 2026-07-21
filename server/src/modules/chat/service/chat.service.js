const { generateUUID } = require('@/utils/uuid.util');
const chatRepository = require('../repository/chat.repository');
const { transaction } = require('@/config/database.config');

class ChatService {
    constructor() {
        this.chatRepository = chatRepository;
    }

    getOrCreateConversation = async ({ userId, partnerId, sosRequestId }) => {
        let conversation = null;

        if (sosRequestId) {
            conversation = await this.chatRepository.findConversationBySosRequestId(sosRequestId);
        } else if (userId && partnerId) {
            conversation = await this.chatRepository.findConversationByUsers(userId, partnerId, null);
        }

        if (!conversation && userId && partnerId) {
            const conversationId = generateUUID();
            await transaction(async (client) => {
                await this.chatRepository.createConversation(client, {
                    conversationId,
                    user1Id: userId,
                    user2Id: partnerId,
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
        return await this.chatRepository.getUserConversations(userId);
    }

    getMessages = async ({ conversationId, userId, limit = 50, offset = 0 }) => {
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
            } else {
                throw new Error('Mã cuộc hội thoại không hợp lệ');
            }
        }

        let conversation = await this.chatRepository.findConversationById(resolvedConversationId);
        if (!conversation) {
            const cleanId = this.stripRolePrefix(targetId);
            if (cleanId) {
                try {
                    conversation = await this.getOrCreateConversation({ userId, partnerId: cleanId });
                    if (conversation) {
                        resolvedConversationId = conversation.conversation_id;
                    }
                } catch (_) {}
            }
        }

        if (!conversation) {
            throw new Error('Cuộc hội thoại không tồn tại');
        }
        if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
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

        // Nếu conversationId không hợp lệ hoặc không tồn tại, thử resolve theo partnerId.
        if (!conversation && directPartnerId) {
            const candidatePartnerId = this.stripRolePrefix(directPartnerId) || fallbackPartnerId;
            if (candidatePartnerId && this.isUuidLike(candidatePartnerId)) {
                conversation = await this.getOrCreateConversation({ userId: senderId, partnerId: candidatePartnerId });
                targetId = conversation.conversation_id;
            }
        }

        if (!conversation) {
            throw new Error('Cuộc hội thoại không tồn tại');
        }
        if (conversation.user1_id !== senderId && conversation.user2_id !== senderId) {
            throw new Error('Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này');
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

        const recipientId = conversation.user1_id === senderId ? conversation.user2_id : conversation.user1_id;

        return {
            message: createdMessage,
            recipientId,
            conversation,
            conversationId: targetId,
        };
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
