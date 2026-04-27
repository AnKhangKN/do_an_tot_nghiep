const { pool } = require("@/config/database.config")
const incident_typeModel = require("../model/incident_type.model")

class IncidentTypeRepository {
    constructor() {
        this.incident_typeModel = incident_typeModel
    }

    createIncidentType = async ({ incidentId, incidentType }) => {
        const query = `
        INSERT INTO ${this.incident_typeModel.table} 
            (${this.incident_typeModel.field.incidentId}, 
            ${this.incident_typeModel.field.incidentType})
        VALUES ($1, $2)
        RETURNING *
        `

        const result = await pool.query(query, [incidentId, incidentType])
        return result.rows[0]
    }

    getIncidentTypes = async ({ page, limit }) => {

        const offset = (page - 1) * limit;

        const query = `
        SELECT 
            ${this.incident_typeModel.field.incidentId},
            ${this.incident_typeModel.field.incidentType},
            ${this.incident_typeModel.field.status},
            ${this.incident_typeModel.field.createdAt},
            ${this.incident_typeModel.field.updatedAt}
        FROM ${this.incident_typeModel.table}
        ORDER BY ${this.incident_typeModel.field.createdAt} DESC
        LIMIT $1 OFFSET $2
        `;

        const countQuery = `
        SELECT COUNT(*) AS total
        FROM ${this.incident_typeModel.table}
        `

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, [limit, offset]),
            pool.query(countQuery)
        ])

        const total = parseInt(countResult.rows[0].total, 10) // Số 10 = hệ thập phân (decimal)

        return {
            data: dataResult.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}

module.exports = new IncidentTypeRepository()