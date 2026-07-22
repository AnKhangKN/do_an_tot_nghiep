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
            SELECT s.*, it.incident_type as incident_type_name
            FROM ${this.sos_requestModel.table} s
            LEFT JOIN incident_types it ON s.${this.sos_requestModel.field.incidentTypeId} = it.incident_type_id
            WHERE s.${this.sos_requestModel.field.sosRequestId} = $1
        `

        const result = await pool.query(query, [sosId])
        return result.rows[0]
    }

    updateRescuerAndStatus = async (client, { sosRequestId, rescuerId, status, acceptedAt }) => {
        const query = `
            UPDATE ${this.sos_requestModel.table}
            SET 
                ${this.sos_requestModel.field.rescuerId} = $1,
                ${this.sos_requestModel.field.status} = $2,
                ${this.sos_requestModel.field.acceptedAt} = $3,
                ${this.sos_requestModel.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.sos_requestModel.field.sosRequestId} = $4
            RETURNING *
        `;

        const result = await client.query(query, [rescuerId, status, acceptedAt, sosRequestId]);
        return result.rows[0];
    }

    completeSOS = async (client, { sosRequestId, completedAt }) => {
        const query = `
            UPDATE ${this.sos_requestModel.table}
            SET 
                ${this.sos_requestModel.field.status} = 'DONE',
                ${this.sos_requestModel.field.completedAt} = $1,
                ${this.sos_requestModel.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.sos_requestModel.field.sosRequestId} = $2
            RETURNING *
        `;

        const result = await client.query(query, [completedAt, sosRequestId]);
        return result.rows[0];
    }

    findActiveSOSByUser = async ({ userId, role }) => {
        let query = '';
        if (role === 'RESCUER') {
            query = `
                SELECT s.*, it.incident_type as incident_type_name
                FROM ${this.sos_requestModel.table} s
                LEFT JOIN incident_types it ON s.${this.sos_requestModel.field.incidentTypeId} = it.incident_type_id
                WHERE s.${this.sos_requestModel.field.rescuerId} = $1
                  AND s.${this.sos_requestModel.field.status} = 'IN_PROGRESS'
                  AND s.${this.sos_requestModel.field.createdAt} > (CURRENT_TIMESTAMP - INTERVAL '24 hours')
                ORDER BY s.${this.sos_requestModel.field.createdAt} DESC
                LIMIT 1
            `;
        } else {
            query = `
                SELECT s.*, it.incident_type as incident_type_name
                FROM ${this.sos_requestModel.table} s
                LEFT JOIN incident_types it ON s.${this.sos_requestModel.field.incidentTypeId} = it.incident_type_id
                WHERE s.${this.sos_requestModel.field.userId} = $1
                  AND s.${this.sos_requestModel.field.status} IN ('PENDING', 'SEARCHING', 'ASSIGNED', 'IN_PROGRESS')
                  AND s.${this.sos_requestModel.field.createdAt} > (CURRENT_TIMESTAMP - INTERVAL '24 hours')
                ORDER BY s.${this.sos_requestModel.field.createdAt} DESC
                LIMIT 1
            `;
        }

        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    findSOSHistoryByVictimId = async ({ victimId }) => {
        const query = `
            SELECT 
                s.${this.sos_requestModel.field.sosRequestId},
                s.${this.sos_requestModel.field.userId},
                s.${this.sos_requestModel.field.incidentTypeId},
                s.${this.sos_requestModel.field.description},
                s.${this.sos_requestModel.field.victimLat},
                s.${this.sos_requestModel.field.victimLng},
                s.${this.sos_requestModel.field.status},
                s.${this.sos_requestModel.field.rescuerId},
                s.${this.sos_requestModel.field.acceptedAt},
                s.${this.sos_requestModel.field.completedAt},
                s.${this.sos_requestModel.field.cancelReason},
                s.${this.sos_requestModel.field.createdAt},
                s.${this.sos_requestModel.field.updatedAt},
                t.incident_type,
                r.full_name as rescuer_name,
                r.phone as rescuer_phone,
                r.avatar_url as rescuer_avatar_url
            FROM ${this.sos_requestModel.table} s
            JOIN incident_types t ON s.${this.sos_requestModel.field.incidentTypeId} = t.incident_type_id
            LEFT JOIN users r ON s.${this.sos_requestModel.field.rescuerId} = r.user_id
            WHERE s.${this.sos_requestModel.field.userId} = $1
            ORDER BY s.${this.sos_requestModel.field.createdAt} DESC
        `;

        const result = await pool.query(query, [victimId]);
        return result.rows;
    }

    updateStatusOnly = async ({ sosRequestId, status, cancelReason }) => {
        const query = `
            UPDATE ${this.sos_requestModel.table}
            SET 
                ${this.sos_requestModel.field.status} = $1,
                ${this.sos_requestModel.field.cancelReason} = $2,
                ${this.sos_requestModel.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.sos_requestModel.field.sosRequestId} = $3
              AND ${this.sos_requestModel.field.status} IN ('PENDING', 'SEARCHING', 'ASSIGNED', 'IN_PROGRESS')
            RETURNING *
        `;

        const result = await pool.query(query, [status, cancelReason, sosRequestId]);
        return result.rows[0];
    }
}

module.exports = new SosRequestRepository()