const ratingModel = {
    table: "rescuer_ratings",
    field: {
        ratingId: "rating_id",
        sosRequestId: "sos_request_id",
        victimId: "victim_id",
        rescuerId: "rescuer_id",
        rating: "rating",
        comment: "comment",
        createdAt: "created_at"
    }
};

module.exports = ratingModel;
