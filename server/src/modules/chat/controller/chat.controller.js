const chatService = require('../service/chat.service');

class ChatController {
    getOrCreateConversation = async (req, res, next) => {
        try {
            const userId = req.userId || req.user?.userId;
            const { partnerId, sosRequestId } = req.body;
            if (!partnerId) {
                return res.status(400).json({ status: 'error', message: 'partnerId là bắt buộc' });
            }
            const conversation = await chatService.getOrCreateConversation({ userId, partnerId, sosRequestId });
            return res.status(200).json({ status: 'success', data: conversation });
        } catch (error) {
            next(error);
        }
    }

    getUserConversations = async (req, res, next) => {
        try {
            const userId = req.userId || req.user?.userId;
            const conversations = await chatService.getUserConversations(userId);
            return res.status(200).json({ status: 'success', data: conversations });
        } catch (error) {
            next(error);
        }
    }

    getMessages = async (req, res, next) => {
        try {
            const userId = req.userId || req.user?.userId;
            const { conversationId } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const messages = await chatService.getMessages({ conversationId, userId, limit, offset });
            return res.status(200).json({ status: 'success', data: messages });
        } catch (error) {
            next(error);
        }
    }

    getOrCreateAdminSupportConversation = async (req, res, next) => {
        try {
            const userId = req.userId || req.user?.userId;
            const conversation = await chatService.getOrCreateAdminSupportConversation(userId);
            return res.status(200).json({ status: 'success', data: conversation });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChatController();
