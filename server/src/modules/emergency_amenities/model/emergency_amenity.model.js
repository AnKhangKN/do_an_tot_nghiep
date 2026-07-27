const emergencyAmenityModel = {
    table: 'emergency_amenities',
    field: {
        amenityId: 'amenity_id',
        amenityCategoryId: 'amenity_category_id',
        phone: 'phone',
        latitude: 'latitude',
        longitude: 'longitude',
        openingHours: 'opening_hours',
        status: 'status',
        reportedBy: 'reported_by',
        approvedBy: 'approved_by',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
};

module.exports = emergencyAmenityModel;
