const rescuer_incident_typesModel = require('../model/rescuer_incident_types.model')
const rescuerProfileModel = require("../model/rescuer_profile.model")
const userModel = require("@modules/user/model/user.model");
const { pool } = require('@/config/database.config');

class RescueRepository {
    constructor() {
        this.rescuer_incident_typesModel = rescuer_incident_typesModel;
        this.rescuerProfileModel = rescuerProfileModel;
        this.userModel = userModel
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
        INSERT INTO ${this.rescuer_incident_typesModel.table} (
            ${this.rescuer_incident_typesModel.field.userId}, 
            ${this.rescuer_incident_typesModel.field.incidentTypeId}
        )
        VALUES ($1, $2)
        RETURNING *
        `

        const result = await client.query(query, [userId, incidentTypeId]);
        return result.rows[0];
    };

    rescuerRegister = async (client, {
        userId,
        gender,
        area
    }) => {
        const query = `
        INSERT INTO ${this.rescuerProfileModel.table} (
            ${this.rescuerProfileModel.field.userId},
            ${this.rescuerProfileModel.field.gender},
            ${this.rescuerProfileModel.field.area}
        )
        VALUES ($1, $2, $3) 
        RETURNING *
    `;

        const result = await client.query(query, [
            userId,
            gender,
            area
        ]);

        return result.rows[0];
    };

    getRescuerAuthInfo = async (client, { userId }) => {
        const query = `
        SELECT
            ${this.rescuerProfileModel.field.isVerified}
        FROM ${this.rescuerProfileModel.table}
        WHERE ${this.rescuerProfileModel.field.userId} = $1
    `;

        const result = await client.query(query, [userId]);
        return result.rows[0] ? result.rows[0] : null;
    }

    // Admin
    getRescuer = async ({ page, limit }) => {
        const offset = (page - 1) * limit;

        const query = `
            SELECT
                u.${this.userModel.field.userId},
                u.${this.userModel.field.fullName},
                u.${this.userModel.field.email},
                u.${this.userModel.field.phone},
                rp.${this.rescuerProfileModel.field.isVerified},
                rp.${this.rescuerProfileModel.field.status},
                rp.${this.rescuerProfileModel.field.createdAt}
            FROM ${this.rescuerProfileModel.table} rp
            JOIN ${this.userModel.table} u
                ON rp.${this.rescuerProfileModel.field.userId}
                = u.${this.userModel.field.userId}
            ORDER BY rp.${this.rescuerProfileModel.field.createdAt} DESC
            LIMIT $1 OFFSET $2
        `

        const countQuery = `
        SELECT COUNT(*) AS total
        FROM ${this.rescuerModel.table}
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

    // Admin
    isVerifiedRescuer = async ({ userId }) => {
        const query = `
            UPDATE ${this.rescuerProfileModel.table}
            SET ${this.rescuerProfileModel.field.isVerified} = true
            WHERE ${this.rescuerProfileModel.field.userId} = $1
            RETURNING *;
        `;

        const result = await pool.query(query, [userId]);

        return result.rows[0];
    }

    getRescuerDetail = async () => {

    }

    // Khi rescuer bật online
    findRescuerByUserId = async ({ userId }) => {
        const query = `
            SELECT 1
            FROM ${this.rescuerProfileModel.table}
            WHERE ${this.rescuerProfileModel.field.userId} = $1
        `;

        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    checkRescuerOnline = async ({ userId }) => {
        const query = `
        SELECT ${this.rescuerProfileModel.field.status}
        FROM ${this.rescuerProfileModel.table}
        WHERE ${this.rescuerProfileModel.field.userId} = $1
    `;

        const result = await pool.query(query, [userId]);

        if (!result.rows[0]) {
            return null; // không tồn tại
        }

        return result.rows[0].status === 'ACTIVE'; // true nếu online, false nếu offline
    }

    updateStatus = async ({ userId, status }) => {
        const query = `
            UPDATE ${this.rescuerProfileModel.table}
            SET ${this.rescuerProfileModel.field.status} = $2
            WHERE ${this.rescuerProfileModel.field.userId} = $1
            RETURNING *
        `;

        const result = await pool.query(query, [userId, status]);
        return result.rows[0]
    }

    updateLastSeen = async ({ userId }) => {
        const query = `
            UPDATE ${this.rescuerProfileModel.table}
            SET ${this.rescuerProfileModel.field.lastSeenAt} = NOW()
            WHERE ${this.rescuerProfileModel.field.userId} = $1
            RETURNING *
        `;

        const result = await pool.query(query, [userId]);
        return result.rows[0];
    };

    checkRescuerOnlineStatus = async ({ userId }) => {
        const query = `
            SELECT ${this.rescuerProfileModel.field.status}
            FROM ${this.rescuerProfileModel.table}
            WHERE ${this.rescuerProfileModel.field.userId} = $1
        `;

        const result = await pool.query(query, [userId]);
        return result.rows[0]?.status;
    }

    checkLastSeen = async ({ userId }) => {
        const query = `
            SELECT ${this.rescuerProfileModel.field.lastSeenAt}
            FROM ${this.rescuerProfileModel.table}
            WHERE ${this.rescuerProfileModel.field.userId} = $1
        `;

        const result = await pool.query(query, [userId]);

        return result.rows[0]?.lastseenat;
    }

    // Người dùng tự bấm offline
    goOffline = async ({ userId }) => {
        const query = `
            UPDATE ${this.rescuerProfileModel.table}
            SET ${this.rescuerProfileModel.field.status} = 'offline'
            WHERE ${this.rescuerProfileModel.field.userId} = $1
            RETURNING *
        `;

        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }
}

module.exports = new RescueRepository()