const { pool } = require('@/config/database.config');
const sos_requestModel = require('../model/sos_request.model')

class SosRequestRepository {
    constructor() {
        this.sos_requestModel = sos_requestModel
    }

    createSOS = async ({ sosRequestId, userId, victimLat, victimLng, description }) => {
        const query = `
                    INSERT INTO ${this.sos_requestModel.table} (
                        ${this.sos_requestModel.field.sosRequestId},
                        ${this.sos_requestModel.field.userId},
                        ${this.sos_requestModel.field.victimLat},
                        ${this.sos_requestModel.field.victimLng},
                        ${this.sos_requestModel.field.geohash}
                        ${this.sos_requestModel.field.description}
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                    `

        const result = await pool.query(query, [
            sosRequestId, userId, victimLat, victimLng, description
        ])

        return result.rows[0]
    }
}

module.exports = new SosRequestRepository()