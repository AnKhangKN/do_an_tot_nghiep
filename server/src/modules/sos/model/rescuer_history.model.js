const rescuerHistoryModel = {
    table: "rescuer_histories",

    field: {
        rescuerHistoryId: 'rescuer_history_id',
        rescuerId: 'rescuer_id',
        sosRequestId: 'sos_request_id',
        action: 'action',
        createdAt: 'created_at'
    }
};

module.exports = rescuerHistoryModel;
