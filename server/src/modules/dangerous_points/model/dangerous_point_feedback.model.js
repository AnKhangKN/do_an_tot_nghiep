const dangerousPointFeedbackModel = {
    table: 'dangerous_point_feedbacks',

    field: {
        feedbackId: 'feedback_id',
        dangerousPointId: 'dangerous_point_id',
        userId: 'user_id',
        feedbackType: 'feedback_type', // 'VERIFY_REAL', 'REPORT_FAKE', 'MARKED_RESOLVED', 'STILL_DANGEROUS'
        comment: 'comment',
        createdAt: 'created_at'
    }
};

module.exports = dangerousPointFeedbackModel;
