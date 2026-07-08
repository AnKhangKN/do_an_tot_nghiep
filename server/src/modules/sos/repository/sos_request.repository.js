const { pool } = require('@/config/database.config');
const sos_requestModel = require('../model/sos_request.model')

class SosRequestRepository {
    constructor() {
        this.sos_requestModel = sos_requestModel
    }

    createSOS = async (client, {sosRequestId, userId, incidentTypeId, description, victimLat, victimLng, geohash}) => {
        const query = `
                    INSERT INTO ${this.sos_requestModel.table} (
                        ${this.sos_requestModel.field.sosRequestId},
                        ${this.sos_requestModel.field.userId},
                        ${this.sos_requestModel.field.incidentTypeId},
                        ${this.sos_requestModel.field.description},
                        ${this.sos_requestModel.field.victimLat},
                        ${this.sos_requestModel.field.victimLng},
                        ${this.sos_requestModel.field.geohash}
                        
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *
                    `

        const result = await client.query(query, [
            sosRequestId, userId, incidentTypeId, description, victimLat, victimLng, geohash
        ])

        return result.rows[0]
    }

    findSOSById = async (sosId) => {
        const query = `
            SELECT *
            FROM ${this.sos_requestModel.table}
            WHERE ${this.sos_requestModel.field.sosRequestId} = $1
        `

        const result = await pool.query(query, [sosId])
        return result.rows[0]
    }
}

module.exports = new SosRequestRepository()