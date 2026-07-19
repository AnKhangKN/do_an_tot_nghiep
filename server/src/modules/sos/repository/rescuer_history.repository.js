const { pool } = require('@/config/database.config');
const rescuerHistoryModel = require('../model/rescuer_history.model');
const sosRequestModel = require('../model/sos_request.model');
const incidentTypeModel = require('@modules/incident_type/model/incident_type.model');
const userModel = require('@modules/user/model/user.model');

class RescuerHistoryRepository {
    constructor() {
        this.rescuerHistoryModel = rescuerHistoryModel;
        this.sosRequestModel = sosRequestModel;
    }

    createHistory = async (client, { historyId, rescuerId, sosRequestId, action }) => {
        const query = `
            INSERT INTO ${this.rescuerHistoryModel.table} (
                ${this.rescuerHistoryModel.field.rescuerHistoryId},
                ${this.rescuerHistoryModel.field.rescuerId},
                ${this.rescuerHistoryModel.field.sosRequestId},
                ${this.rescuerHistoryModel.field.action}
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const result = await client.query(query, [historyId, rescuerId, sosRequestId, action]);
        return result.rows[0];
    };

    findHistoryByRescuerId = async ({ rescuerId }) => {
        const query = `
            SELECT 
                rh.${this.rescuerHistoryModel.field.rescuerHistoryId},
                rh.${this.rescuerHistoryModel.field.rescuerId},
                rh.${this.rescuerHistoryModel.field.sosRequestId},
                rh.${this.rescuerHistoryModel.field.action},
                rh.${this.rescuerHistoryModel.field.createdAt} as interaction_at,
                s.description,
                s.victim_lat,
                s.victim_lng,
                s.status as sos_status,
                s.created_at as sos_created_at,
                t.incident_type,
                v.full_name as victim_name,
                v.phone as victim_phone,
                v.avatar_url as victim_avatar_url
            FROM ${this.rescuerHistoryModel.table} rh
            JOIN ${this.sosRequestModel.table} s ON rh.${this.rescuerHistoryModel.field.sosRequestId} = s.${this.sosRequestModel.field.sosRequestId}
            JOIN incident_types t ON s.${this.sosRequestModel.field.incidentTypeId} = t.incident_type_id
            LEFT JOIN users v ON s.${this.sosRequestModel.field.userId} = v.user_id
            WHERE rh.${this.rescuerHistoryModel.field.rescuerId} = $1
            ORDER BY rh.${this.rescuerHistoryModel.field.createdAt} DESC
        `;

        const result = await pool.query(query, [rescuerId]);
        return result.rows;
    };
}

module.exports = new RescuerHistoryRepository();
