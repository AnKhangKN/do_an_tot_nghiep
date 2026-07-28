const { pool } = require("@/config/database.config");
const aiModerationModel = require("../model/ai_moderation.model");
const { mapFields } = require("@utils/mapper.util");

class AiModerationRepository {
    constructor() {
        this.aiModerationModel = aiModerationModel;
    }

    // Tạo bản ghi log phân loại AI (dùng transaction client nếu có)
    async createModerationLog(client, data) {
        const query = `
            INSERT INTO ${this.aiModerationModel.table} (
                ${this.aiModerationModel.field.logId},
                ${this.aiModerationModel.field.entityType},
                ${this.aiModerationModel.field.entityId},
                ${this.aiModerationModel.field.aiScore},
                ${this.aiModerationModel.field.isFlagged},
                ${this.aiModerationModel.field.flagReason},
                ${this.aiModerationModel.field.suggestedCategory},
                ${this.aiModerationModel.field.actionTaken}
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;

        const values = [
            data.logId,
            data.entityType,
            data.entityId,
            data.aiScore || 0.0,
            data.isFlagged || false,
            data.flagReason || null,
            data.suggestedCategory || "KHÁC",
            data.actionTaken || "NONE"
        ];

        if (client) {
            const result = await client.query(query, values);
            return mapFields(result.rows[0], this.aiModerationModel.field);
        }

        const result = await pool.query(query, values);
        return mapFields(result.rows[0], this.aiModerationModel.field);
    }

    // Lấy log kiểm duyệt theo entity
    async findLogByEntity(entityType, entityId) {
        const query = `
            SELECT * FROM ${this.aiModerationModel.table}
            WHERE ${this.aiModerationModel.field.entityType} = $1
              AND ${this.aiModerationModel.field.entityId} = $2
            LIMIT 1;
        `;
        const result = await pool.query(query, [entityType, entityId]);
        return result.rows[0] ? mapFields(result.rows[0], this.aiModerationModel.field) : null;
    }

    // Lấy danh sách log kiểm duyệt cho Admin (phân trang + bộ lọc)
    async getLogsForAdmin({ entityType, isFlagged, actionTaken, page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;
        const conditions = [];
        const values = [];

        if (entityType) {
            values.push(entityType);
            conditions.push(`${this.aiModerationModel.field.entityType} = $${values.length}`);
        }

        if (typeof isFlagged === "boolean") {
            values.push(isFlagged);
            conditions.push(`${this.aiModerationModel.field.isFlagged} = $${values.length}`);
        }

        if (actionTaken) {
            values.push(actionTaken);
            conditions.push(`${this.aiModerationModel.field.actionTaken} = $${values.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const countQuery = `
            SELECT COUNT(*) FROM ${this.aiModerationModel.table}
            ${whereClause};
        `;
        const countResult = await pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].count, 10);

        const dataQuery = `
            SELECT m.*, u.full_name AS reviewer_name
            FROM ${this.aiModerationModel.table} m
            LEFT JOIN users u ON m.${this.aiModerationModel.field.reviewedBy} = u.user_id
            ${whereClause}
            ORDER BY m.${this.aiModerationModel.field.createdAt} DESC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2};
        `;

        const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

        return {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data: dataResult.rows.map((row) => mapFields(row, this.aiModerationModel.field))
        };
    }

    // Cập nhật trạng thái duyệt từ Admin
    async updateReviewStatus(logId, adminId, actionTaken) {
        const query = `
            UPDATE ${this.aiModerationModel.table}
            SET ${this.aiModerationModel.field.actionTaken} = $1,
                ${this.aiModerationModel.field.reviewedBy} = $2
            WHERE ${this.aiModerationModel.field.logId} = $3
            RETURNING *;
        `;

        const result = await pool.query(query, [actionTaken, adminId, logId]);
        return result.rows[0] ? mapFields(result.rows[0], this.aiModerationModel.field) : null;
    }
}

module.exports = new AiModerationRepository();
