const rescuer_incident_typesModel = require('../model/rescuer_incident_types.model')
const rescuerModel = require("../model/rescuer.model")

class RescueRepository {
    constructor() {
        this.rescuer_incident_typesModel = rescuer_incident_typesModel;
        this.rescuerModel = rescuerModel;
    }

    rescuerIncidentTypeExists = async (client, { userId, incidentTypeId }) => {
        const query = `
        SELECT EXISTS (
            SELECT 1 
            FROM ${this.rescuer_incident_typesModel.table}
            WHERE ${this.rescuer_incident_typesModel.field.userId} = $1
              AND ${this.rescuer_incident_typesModel.field.incidentTypeId} = $2
        ) AS exists
    `;

        const result = await client.query(query, [userId, incidentTypeId]);
        return result.rows[0].exists;
    };

    addNewRescuerIncidentType = async (client, { userId, incidentTypeId }) => {
        const query = `
        INSERT INTO ${this.rescuer_incident_typesModel.table} 
        (${this.rescuer_incident_typesModel.field.userId}, 
         ${this.rescuer_incident_typesModel.field.incidentTypeId})
        VALUES ($1, $2)
        RETURNING *
    `;

        const result = await client.query(query, [userId, incidentTypeId]);
        return result.rows[0];
    };

    rescuerRegister = async (client, {
        userId,
        phone,
        gender,
        area,
        isVerified
    }) => {
        const query = `
        INSERT INTO ${this.rescuerModel.table} (
            ${this.rescuerModel.field.userId},
            ${this.rescuerModel.field.phone},
            ${this.rescuerModel.field.gender},
            ${this.rescuerModel.field.area},
            ${this.rescuerModel.field.isVerified}
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

        const result = await client.query(query, [
            userId,
            phone,
            gender,
            area,
            isVerified ?? false
        ]);

        return result.rows[0];
    };
}

module.exports = new RescueRepository()