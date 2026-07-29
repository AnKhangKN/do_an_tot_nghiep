const { pool } = require("@/config/database.config");
const aiModerationModel = require("../model/ai_moderation.model");
const { mapFields } = require("@utils/mapper.util");

class AiModerationRepository {
    constructor() {
        this.aiModerationModel = aiModerationModel;
        this.ensureTableStructure();
    }

    async ensureTableStructure() {
        try {
            await pool.query(`
                ALTER TABLE ${this.aiModerationModel.table} 
                ADD COLUMN IF NOT EXISTS ${this.aiModerationModel.field.textContent} TEXT;
            `);
        } catch (error) {
            console.error("[AiModerationRepository] Ensure table structure error:", error.message);
        }
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
                ${this.aiModerationModel.field.actionTaken},
                ${this.aiModerationModel.field.textContent}
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
            data.actionTaken || "NONE",
            data.textContent || null
        ];

        if (client) {
            const result = await client.query(query, values);
            return mapFields(result.rows[0], this.aiModerationModel);
        }

        const result = await pool.query(query, values);
        return mapFields(result.rows[0], this.aiModerationModel);
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
        return result.rows[0] ? mapFields(result.rows[0], this.aiModerationModel) : null;
    }

    // Tìm log kiểm duyệt gần nhất có cùng loại thực thể và cùng nội dung văn bản
    async findLogByTextContent(textContent, entityType) {
        if (!textContent || !textContent.trim()) return null;

        let query = `
            SELECT * FROM ${this.aiModerationModel.table}
            WHERE LOWER(TRIM(${this.aiModerationModel.field.textContent})) = LOWER(TRIM($1))
        `;
        const params = [textContent.trim()];

        if (entityType) {
            params.push(entityType);
            query += ` AND ${this.aiModerationModel.field.entityType} = $2`;
        }

        query += ` ORDER BY ${this.aiModerationModel.field.createdAt} DESC LIMIT 1;`;
        const result = await pool.query(query, params);
        return result.rows[0] ? mapFields(result.rows[0], this.aiModerationModel) : null;
    }

    // Lấy danh sách log kiểm duyệt cho Admin (phân trang + bộ lọc)
    async getLogsForAdmin({ entityType, isFlagged, actionTaken, page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;
        const conditions = [];
        const values = [];

        if (entityType) {
            values.push(entityType);
            conditions.push(`m.${this.aiModerationModel.field.entityType} = $${values.length}`);
        }

        if (typeof isFlagged === "boolean") {
            values.push(isFlagged);
            conditions.push(`m.${this.aiModerationModel.field.isFlagged} = $${values.length}`);
        }

        if (actionTaken) {
            values.push(actionTaken);
            conditions.push(`m.${this.aiModerationModel.field.actionTaken} = $${values.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const countQuery = `
            SELECT COUNT(*) FROM ${this.aiModerationModel.table} m
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
            data: dataResult.rows.map((row) => ({
                ...mapFields(row, this.aiModerationModel),
                reviewerName: row.reviewer_name || null
            }))
        };
    }

    // Cập nhật trạng thái duyệt từ Admin (Tự động gỡ cờ is_flagged = false nếu Admin bấm An toàn DISMISSED)
    async updateReviewStatus(logId, adminId, actionTaken) {
        let validAdminId = adminId || null;

        if (validAdminId) {
            try {
                const userCheck = await pool.query("SELECT user_id FROM users WHERE user_id = $1", [validAdminId]);
                if (!userCheck.rows[0]) {
                    validAdminId = null;
                }
            } catch (err) {
                validAdminId = null;
            }
        }

        // Lấy bản ghi log hiện tại
        const currentQuery = `SELECT * FROM ${this.aiModerationModel.table} WHERE ${this.aiModerationModel.field.logId} = $1;`;
        const currentRes = await pool.query(currentQuery, [logId]);
        if (!currentRes.rows[0]) return null;

        const current = currentRes.rows[0];
        let newIsFlagged = current.is_flagged;
        let newFlagReason = current.flag_reason;

        if (actionTaken === "APPROVED") {
            newIsFlagged = true;
            newFlagReason = current.flag_reason || "Quản trị viên đã duyệt xác nhận vi phạm";
        } else if (actionTaken === "DISMISSED") {
            newIsFlagged = false;
            newFlagReason = null;
        }

        const query = `
            UPDATE ${this.aiModerationModel.table}
            SET ${this.aiModerationModel.field.actionTaken} = $1,
                ${this.aiModerationModel.field.reviewedBy} = $2,
                ${this.aiModerationModel.field.isFlagged} = $3,
                ${this.aiModerationModel.field.flagReason} = $4
            WHERE ${this.aiModerationModel.field.logId} = $5
            RETURNING *;
        `;

        const result = await pool.query(query, [actionTaken, validAdminId, newIsFlagged, newFlagReason, logId]);
        return result.rows[0] ? mapFields(result.rows[0], this.aiModerationModel) : null;
    }
}

module.exports = new AiModerationRepository();
