const messageModel = {
    table: "messages",
    field: {
        messageId: "message_id",
        conversationId: "conversation_id",
        senderId: "sender_id",
        content: "content",
        messageType: "message_type",
        isRead: "is_read",
        createdAt: "created_at"
    }
};

module.exports = messageModel;
