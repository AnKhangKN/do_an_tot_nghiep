const { generateUUID } = require("@/utils/uuid.util");
const appealModel = require("../model/appeal.model");
const { pool } = require("@/config/database.config");

class AppealRepository {
    constructor() {
        this.appealModel = appealModel;
    }

    create = async (client, { userId, reason }) => {
        const appealId = generateUUID();
        const query = `
            INSERT INTO ${this.appealModel.table}
                (${this.appealModel.field.id}, ${this.appealModel.field.userId}, ${this.appealModel.field.reason})
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await client.query(query, [appealId, userId, reason]);
        return result.rows[0];
    };

    findPendingByUserId = async (client, { userId }) => {
        const query = `
            SELECT * FROM ${this.appealModel.table}
            WHERE ${this.appealModel.field.userId} = $1
            AND ${this.appealModel.field.status} = 'PENDING'
        `;
        const executor = client || pool;
        const result = await executor.query(query, [userId]);
        return result.rows[0] || null;
    };

    countPendingByUserId = async (client, { userId }) => {
        const query = `
            SELECT COUNT(*)::int AS count FROM ${this.appealModel.table}
            WHERE ${this.appealModel.field.userId} = $1
            AND ${this.appealModel.field.status} = 'PENDING'
        `;
        const executor = client || pool;
        const result = await executor.query(query, [userId]);
        return parseInt(result.rows[0].count, 10);
    };

    countRejectedByUserId = async (client, { userId }) => {
        const query = `
            SELECT COUNT(*)::int AS count FROM ${this.appealModel.table}
            WHERE ${this.appealModel.field.userId} = $1
            AND ${this.appealModel.field.status} = 'REJECTED'
        `;
        const executor = client || pool;
        const result = await executor.query(query, [userId]);
        return parseInt(result.rows[0].count, 10);
    };

    updateUserPermanentBanReason = async (client, { userId, banReason }) => {
        const query = `
            UPDATE users
            SET ban_reason = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1
            RETURNING *
        `;
        const executor = client || pool;
        const result = await executor.query(query, [userId, banReason]);
        return result.rows[0];
    };

    findAll = async ({ page, limit, status }) => {
        const conditions = [];
        const params = [];
        let idx = 1;

        if (status) {
            conditions.push(`a.${this.appealModel.field.status} = $${idx++}`);
            params.push(status);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const countQuery = `
            SELECT COUNT(*) FROM ${this.appealModel.table} a ${where}
        `;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        const offset = (page - 1) * limit;
        params.push(limit);
        params.push(offset);

        const dataQuery = `
            SELECT
                a.*,
                u.full_name AS user_name,
                u.email AS user_email,
                u.ban_reason AS user_ban_reason,
                h.full_name AS handled_by_name
            FROM ${this.appealModel.table} a
            JOIN users u ON a.${this.appealModel.field.userId} = u.user_id
            LEFT JOIN users h ON a.${this.appealModel.field.handledBy} = h.user_id
            ${where}
            ORDER BY a.${this.appealModel.field.createdAt} DESC
            LIMIT $${idx++} OFFSET $${idx++}
        `;

        const dataResult = await pool.query(dataQuery, params);

        return {
            data: dataResult.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    };

    findById = async (id) => {
        const query = `
            SELECT
                a.*,
                u.full_name AS user_name,
                u.email AS user_email
            FROM ${this.appealModel.table} a
            JOIN users u ON a.${this.appealModel.field.userId} = u.user_id
            WHERE a.${this.appealModel.field.id} = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    };

    resolve = async (client, { id, status, adminNote, handledBy }) => {
        const query = `
            UPDATE ${this.appealModel.table}
            SET
                ${this.appealModel.field.status} = $2,
                ${this.appealModel.field.adminNote} = $3,
                ${this.appealModel.field.handledBy} = $4,
                ${this.appealModel.field.handledAt} = CURRENT_TIMESTAMP
            WHERE ${this.appealModel.field.id} = $1
            RETURNING *
        `;
        const result = await client.query(query, [id, status, adminNote, handledBy]);
        return result.rows[0];
    };
}

module.exports = new AppealRepository();
