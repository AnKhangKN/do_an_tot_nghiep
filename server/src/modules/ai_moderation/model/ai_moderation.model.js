const aiModerationModel = {
    table: "ai_moderation_logs",

    field: {
        logId: "log_id",
        entityType: "entity_type",
        entityId: "entity_id",
        aiScore: "ai_score",
        isFlagged: "is_flagged",
        flagReason: "flag_reason",
        suggestedCategory: "suggested_category",
        actionTaken: "action_taken",
        reviewedBy: "reviewed_by",
        textContent: "text_content",
        createdAt: "created_at"
    }
};

module.exports = aiModerationModel;
