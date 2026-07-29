const aiModerationModel = {
    table: "ai_moderation_logs",

    field: {
        logId: "log_id",
        entityType: "entity_type",
        entityId: "entity_id",
        aiScore: "ai_score",
        isFlagged: "is_flagged",
        flagReason: "flag_reason",
        actionTaken: "action_taken",
        reviewedBy: "reviewed_by",
        violatingPhrases: "violating_phrases",
        textContent: "text_content",
        createdAt: "created_at"
    }
};

module.exports = aiModerationModel;
