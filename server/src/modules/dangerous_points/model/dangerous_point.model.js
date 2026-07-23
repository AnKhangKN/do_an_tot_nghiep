const dangerousPointModel = {
    table: 'dangerous_points',
    
    field: {
        dangerousPointId: 'dangerous_point_id',
        zoneName: 'zone_name',
        address: 'address',
        description: 'description',
        latitude: 'latitude',
        longitude: 'longitude',
        dangerLevel: 'danger_level',
        status: 'status',
        reportedBy: 'reported_by',
        approvedBy: 'approved_by',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}

module.exports = dangerousPointModel
