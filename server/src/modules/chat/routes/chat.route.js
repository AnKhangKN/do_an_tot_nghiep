const express = require('express');
const router = express.Router();
const chatController = require('../controller/chat.controller');
const { verifyToken } = require('@/middlewares/auth.middleware');

router.use(verifyToken);

router.post('/conversations', chatController.getOrCreateConversation);
router.post('/conversations/admin-support', chatController.getOrCreateAdminSupportConversation);
router.get('/conversations', chatController.getUserConversations);
router.get('/conversations/:conversationId/messages', chatController.getMessages);

module.exports = router;
