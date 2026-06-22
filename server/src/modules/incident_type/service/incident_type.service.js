const { generateUUID } = require('@/utils/uuid.util')
const incident_typeRepository = require('../repository/incident_type.repository')
const { mapFields } = require('@utils/mapper.util') // hoặc đường dẫn của bạn
const incident_typeModel = require("../model/incident_type.model")

class IncidentTypeService {
    constructor() {
        this.incident_typeRepository = incident_typeRepository
        this.incident_typeModel = incident_typeModel
    }

    createIncidentType = async ({ incidentType }) => {
        const incidentTypeId = generateUUID()

        const row = await this.incident_typeRepository.createIncidentType({ incidentTypeId, incidentType });
        return mapFields(row, this.incident_typeModel); // trả về camelCase khi tạo 1 field
    }

    getIncidentTypeAdmin = async ({ page, limit }) => {

        const rows = await this.incident_typeRepository.getIncidentTypeAdmin({ page, limit });

        return {
            data: rows.data.map(row => mapFields(row, this.incident_typeModel)),
            total: rows.total,
            page: rows.page,
            totalPages: rows.totalPages
        } // trả về camelCase nhiều field
    }

    getIncidentType = async () => {
        return this.incident_typeRepository.getIncidentType();
    }
}

module.exports = new IncidentTypeService()