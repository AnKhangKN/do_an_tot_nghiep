const incidentTypeModel = {
    table: 'incident_types',
    
    field: {
        incidentId: 'incident_id',
        incidentType: 'incident_type',
        status: 'status', // ACTIVE | INACTIVE

        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}

module.exports = incidentTypeModel