const { generateUUID, isValidUUID } = require('@/utils/generate_uuid.util')
const incident_typeRepository = require('./incident_type.repository')
const throwError = require('@/utils/throw_error.util')

class IncidentTypeService {
    constructor() {
        this.incident_typeRepository = incident_typeRepository
    }

    createIncidentType = async ({ incidentType }) => {
        const incidentId = generateUUID()

        return await this.incident_typeRepository.createIncidentType({ incidentId, incidentType });
    }

    getIncidentTypes = async () => {
        return await this.incident_typeRepository.getIncidentTypes()
    }
}

module.exports = new IncidentTypeService()