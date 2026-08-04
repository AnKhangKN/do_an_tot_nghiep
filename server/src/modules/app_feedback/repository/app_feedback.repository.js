const { generateUUID } = require("@/utils/uuid.util");
const { pool } = require("@/config/database.config");
const appFeedbackModel = require("../model/app_feedback.model");

class AppFeedbackRepository {
    constructor() {
        this.appFeedbackModel = appFeedbackModel;
        this.ensureTableStructure();
    }

    async ensureTableStructure() {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS ${this.appFeedbackModel.table} (
                    feedback_id UUID PRIMARY KEY,
                    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                    category VARCHAR(30) NOT NULL DEFAULT 'OTHER',
                    title VARCHAR(200) NOT NULL,
                    content TEXT NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                    admin_note TEXT,
                    handled_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_app_feedbacks_user_id ON app_feedbacks(user_id);
                CREATE INDEX IF NOT EXISTS idx_app_feedbacks_status ON app_feedbacks(status);
                CREATE INDEX IF NOT EXISTS idx_app_feedbacks_created_at ON app_feedbacks(created_at);
            `);
        } catch (error) {
            console.error("[AppFeedbackRepository] Ensure table structure error:", error.message);
        }
    }

    // User gửi báo cáo ứng dụng
    create = async (client, { userId, category, title, content }) => {
        const feedbackId = generateUUID();
        const query = `
            INSERT INTO ${this.appFeedbackModel.table}
                (${this.appFeedbackModel.field.id}, ${this.appFeedbackModel.field.userId},
                 ${this.appFeedbackModel.field.category}, ${this.appFeedbackModel.field.title},
                 ${this.appFeedbackModel.field.content})
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await client.query(query, [feedbackId, userId, category, title, content]);
        return result.rows[0];
    };

    // Lịch sử báo cáo của user
    findByUserId = async (userId, { page, limit }) => {
        const offset = (page - 1) * limit;
        const countQuery = `
            SELECT COUNT(*) FROM ${this.appFeedbackModel.table}
            WHERE ${this.appFeedbackModel.field.userId} = $1
        `;
        const countResult = await pool.query(countQuery, [userId]);
        const total = parseInt(countResult.rows[0].count, 10);

        const dataQuery = `
            SELECT * FROM ${this.appFeedbackModel.table}
            WHERE ${this.appFeedbackModel.field.userId} = $1
            ORDER BY ${this.appFeedbackModel.field.createdAt} DESC
            LIMIT $2 OFFSET $3
        `;
        const dataResult = await pool.query(dataQuery, [userId, limit, offset]);

        return {
            data: dataResult.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    };

    // Admin: danh sách báo cáo (lọc theo status/category, tìm kiếm)
    findAllAdmin = async ({ page, limit, status, category, search }) => {
        const conditions = [];
        const params = [];
        let idx = 1;

        if (status) {
            conditions.push(`f.${this.appFeedbackModel.field.status} = $${idx++}`);
            params.push(status);
        }
        if (category) {
            conditions.push(`f.${this.appFeedbackModel.field.category} = $${idx++}`);
            params.push(category);
        }
        if (search) {
            conditions.push(`(f.${this.appFeedbackModel.field.title} ILIKE $${idx} OR f.${this.appFeedbackModel.field.content} ILIKE $${idx} OR u.full_name ILIKE $${idx})`);
            params.push(`%${search}%`);
            idx++;
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const countQuery = `
            SELECT COUNT(*) FROM ${this.appFeedbackModel.table} f ${where}
        `;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        const offset = (page - 1) * limit;
        params.push(limit);
        params.push(offset);

        const dataQuery = `
            SELECT
                f.*,
                u.full_name AS user_name,
                u.email AS user_email,
                h.full_name AS handled_by_name
            FROM ${this.appFeedbackModel.table} f
            JOIN users u ON f.${this.appFeedbackModel.field.userId} = u.user_id
            LEFT JOIN users h ON f.${this.appFeedbackModel.field.handledBy} = h.user_id
            ${where}
            ORDER BY f.${this.appFeedbackModel.field.createdAt} DESC
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

    // Admin: thống kê số lượng theo trạng thái
    getStats = async () => {
        const query = `
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE ${this.appFeedbackModel.field.status} = 'PENDING')::int AS pending,
                COUNT(*) FILTER (WHERE ${this.appFeedbackModel.field.status} = 'IN_PROGRESS')::int AS in_progress,
                COUNT(*) FILTER (WHERE ${this.appFeedbackModel.field.status} = 'RESOLVED')::int AS resolved,
                COUNT(*) FILTER (WHERE ${this.appFeedbackModel.field.status} = 'REJECTED')::int AS rejected
            FROM ${this.appFeedbackModel.table}
        `;
        const result = await pool.query(query);
        return result.rows[0];
    };

    findById = async (id) => {
        const query = `
            SELECT
                f.*,
                u.full_name AS user_name,
                u.email AS user_email
            FROM ${this.appFeedbackModel.table} f
            JOIN users u ON f.${this.appFeedbackModel.field.userId} = u.user_id
            WHERE f.${this.appFeedbackModel.field.id} = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    };

    // Admin cập nhật trạng thái xử lý
    updateStatus = async (client, { id, status, adminNote, handledBy }) => {
        const query = `
            UPDATE ${this.appFeedbackModel.table}
            SET
                ${this.appFeedbackModel.field.status} = $2,
                ${this.appFeedbackModel.field.adminNote} = $3,
                ${this.appFeedbackModel.field.handledBy} = $4,
                ${this.appFeedbackModel.field.handledAt} = CURRENT_TIMESTAMP
            WHERE ${this.appFeedbackModel.field.id} = $1
            RETURNING *
        `;
        const result = await client.query(query, [id, status, adminNote, handledBy]);
        return result.rows[0];
    };
}

module.exports = new AppFeedbackRepository();
