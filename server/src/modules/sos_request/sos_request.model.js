const sosRequestModel = {
    table: "sos_requests",

    field: {
        sosId: 'sos_id',
        victimId: 'victim_id',

        // Cập nhật khi được người cứu hộ xác nhận
        rescuerId: 'rescuer_id',

        status: 'status',

        // Loại sự cố
        incidentTypeId: 'incident_type_id',

        // Cập nhật khi được người cứu hộ xác nhận
        rescuerLat: 'rescuer_lat',
        rescuerLng: 'rescuer_lng',

        victimLat: 'victim_lat',
        victimLng: 'victim_lng',

        description: 'description',

        // Tự tạo khi tạo
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}

module.exports = sosRequestModel;