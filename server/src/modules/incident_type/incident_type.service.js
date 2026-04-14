const { generateUUID } = require('@/utils/generate_uuid.util')
const incident_typeRepository = require('./incident_type.repository')
const { mapFields } = require('@utils/mapper.util') // hoặc đường dẫn của bạn
const incident_typeModel = require("./incident_type.model")

class IncidentTypeService {
    constructor() {
        this.incident_typeRepository = incident_typeRepository
        this.incident_typeModel = incident_typeModel
    }

    createIncidentType = async ({ incidentType }) => {
        const incidentId = generateUUID()

        const row = await this.incident_typeRepository.createIncidentType({ incidentId, incidentType });
        return mapFields(row, this.incident_typeModel); // trả về camelCase khi tạo 1 field
    }

    getIncidentTypes = async ({ page, limit }) => {

        const rows = await this.incident_typeRepository.getIncidentTypes({ page, limit });

        return {
            data: rows.data.map(row => mapFields(row, this.incident_typeModel)),
            total: rows.total,
            page: rows.page,
            totalPages: rows.totalPages
        } // trả về camelCase nhiều field
    }
}

module.exports = new IncidentTypeService()