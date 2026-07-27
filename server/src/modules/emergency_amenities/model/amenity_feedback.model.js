const amenityFeedbackModel = {
    table: 'amenity_feedbacks',
    field: {
        feedbackId: 'feedback_id',
        amenityId: 'amenity_id',
        userId: 'user_id',
        reason: 'reason',
        comment: 'comment',
        status: 'status',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
};

module.exports = amenityFeedbackModel;
