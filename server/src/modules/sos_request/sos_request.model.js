const sosRequestModel = {
    table: "sos_requests",

    field: {
        sosId: 'sos_id',
        victimId: 'victim_id',

        // Cập nhật khi được người cứu hộ xác nhận
        rescuerId: 'rescuer_id',

        status: 'status',

        // Loại sự cố
        incidentType: 'incident_type',

        // Cập nhật khi được người cứu hộ xác nhận
        rescuerLatitude: 'rescuer_latitude',
        rescuerLongitude: 'rescuer_longitude',

        victimLatitude: 'victim_latitude',
        victimLongitude: 'victim_longitude',

        description: 'description',

        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}

module.exports = sosRequestModel;