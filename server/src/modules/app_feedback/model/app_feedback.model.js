const appFeedbackModel = {
    table: "app_feedbacks",
    field: {
        id: "feedback_id",
        userId: "user_id",
        category: "category",
        title: "title",
        content: "content",
        status: "status",
        adminNote: "admin_note",
        handledBy: "handled_by",
        handledAt: "updated_at",
        createdAt: "created_at"
    },
};

module.exports = appFeedbackModel;
