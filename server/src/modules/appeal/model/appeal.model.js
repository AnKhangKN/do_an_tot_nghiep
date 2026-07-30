const appealModel = {
    table: "ban_appeals",
    field: {
        id: "appeal_id",
        userId: "user_id",
        reason: "reason",
        status: "status",
        createdAt: "created_at",
        handledBy: "reviewed_by",
        handledAt: "updated_at",
        adminNote: "admin_note"
    },
};

module.exports = appealModel;
