const sosRequestModel = {
    table: "sos_requests",

    field: {
        sosRequestId: 'sos_request_id',
        userId: 'user_id',
        incidentTypeId: 'incident_type_id',
        description: 'description',

        victimLat: 'victim_lat',
        victimLng: 'victim_lng',

        status: 'status', 
        // PENDING → SEARCHING → ASSIGNED → IN_PROGRESS → DONE

        // rescuerId chỉ tồn tại từ ASSIGNED trở đi 
        // acceptedAt chỉ tồn tại khi IN_PROGRESS
        // completedAt chỉ tồn tại khi DONE

        // Được cập nhật sau khi người dùng được nhận cứu hộ
        rescuerId: 'rescuer_id',

        // server gán rescuer vào SOS (có thể cancel hoặc accept)
        assignedAt: 'assigned_at',

        // rescuer bấm “accept”
        acceptedAt: 'accepted_at',

        // Hoàn thành cứu hộ
        completedAt: 'completed_at',

        cancelReason: 'cancel_reason',

        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}

module.exports = sosRequestModel