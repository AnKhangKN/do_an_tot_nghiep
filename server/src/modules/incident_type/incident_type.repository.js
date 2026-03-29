const { pool } = require("@/config/database.config")
const incident_typeModel = require("./incident_type.model")

class IncidentTypeRepository {
    constructor() {
        this.incident_type = incident_typeModel
    }

    createIncidentType = async ({incidentId, incidentType}) => {
        const query = `INSERT INTO ${this.incident_type.table} (${this.incident_type.field.incidentId}, ${this.incident_type.field.incidentType})
        VALUES ($1, $2)
        RETURNING *`

        const result = await pool.query(query, [incidentId, incidentType])

        return result.rows[0]
    }

    getIncidentTypes = async () => {
        const query = `
            SELECT 
                incident_id,
                incident_type
            FROM ${this.incident_type.table}
        `;

        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = new IncidentTypeRepository()