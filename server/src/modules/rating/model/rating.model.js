const ratingModel = {
    table: "rescuer_ratings",
    field: {
        ratingId: "rating_id",
        sosRequestId: "sos_request_id",
        victimId: "victim_id",
        rescuerId: "rescuer_id",
        rating: "rating",
        responseSpeed: "response_speed",
        attitude: "attitude",
        supportLevel: "support_level",
        sentiment: "sentiment",
        sentimentConfidence: "sentiment_confidence",
        isFlagged: "is_flagged",
        comment: "comment",
        createdAt: "created_at"
    }
};

module.exports = ratingModel;
