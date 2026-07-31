const conversationModel = {
    table: "conversations",
    field: {
        conversationId: "conversation_id",
        sosRequestId: "sos_request_id",
        user1Id: "user1_id",
        user2Id: "user2_id",
        lastMessage: "last_message",
        lastMessageAt: "last_message_at",
        isClosed: "is_closed",
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
};

module.exports = conversationModel;
