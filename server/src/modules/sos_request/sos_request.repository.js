const sos_requestModel = require('./sos_request.model')

class SosRequestRepository {
    constructor() {
        this.sos_request = sos_requestModel
    }

    createSos = async (client, {
        sosId,
        victimId,
        status,
        incidentType,
        victimLatitude,
        victimLongitude,
        description,
    }) => {
        const query = `
                    INSERT INTO ${this.sos_request.table} (
                        ${this.sos_request.field.sosId},
                        ${this.sos_request.field.victimId},
                        ${this.sos_request.field.status},
                        ${this.sos_request.field.incidentType},
                        ${this.sos_request.field.victimLat},
                        ${this.sos_request.field.victimLng},
                        ${this.sos_request.field.description}
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *
                    `

        const result = await client.query(query, [
            sosId,
            victimId,
            status,
            incidentType,
            victimLatitude,
            victimLongitude,
            description,
        ])

        return result.rows[0]
    }
}

module.exports = new SosRequestRepository()