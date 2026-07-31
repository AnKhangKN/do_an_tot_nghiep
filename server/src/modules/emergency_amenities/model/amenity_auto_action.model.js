const amenityAutoActionModel = {
    table: 'amenity_auto_actions',
    field: {
        actionId: 'action_id',
        amenityId: 'amenity_id',
        targetAmenityId: 'target_amenity_id',
        actionType: 'action_type',
        status: 'status',
        reason: 'reason',
        snapshotData: 'snapshot_data',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
};

module.exports = amenityAutoActionModel;
