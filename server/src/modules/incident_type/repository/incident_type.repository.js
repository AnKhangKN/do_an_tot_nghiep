const { pool } = require("@/config/database.config")
const incident_typeModel = require("../model/incident_type.model")
const { mapFields } = require("@utils/mapper.util")

class IncidentTypeRepository {
    constructor() {
        this.incident_typeModel = incident_typeModel
    }

    createIncidentType = async ({ incidentTypeId, incidentType }) => {
        const query = `
        INSERT INTO ${this.incident_typeModel.table}
            (${this.incident_typeModel.field.incidentTypeId},
             ${this.incident_typeModel.field.incidentType})
        VALUES ($1, $2)
        RETURNING *
    `;

        const result = await pool.query(query, [
            incidentTypeId,
            incidentType
        ]);

        return result.rows[0];
    }

    getIncidentTypeAdmin = async ({ page, limit }) => {

        const offset = (page - 1) * limit;

        const query = `
        SELECT 
            ${this.incident_typeModel.field.incidentTypeId},
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

    getIncidentType = async () => {
        const query = `
        SELECT
            ${this.incident_typeModel.field.incidentTypeId},
            ${this.incident_typeModel.field.incidentType}
        FROM ${this.incident_typeModel.table}
        WHERE ${this.incident_typeModel.field.status} = 'ACTIVE'
    `;

        const { rows } = await pool.query(query);

        return rows.map(row =>
            mapFields(row, this.incident_typeModel)
        );
    }
}

module.exports = new IncidentTypeRepository()