const { pool } = require("@/config/database.config");
const amenityFeedbackModel = require("../model/amenity_feedback.model");
const { mapFields } = require("@utils/mapper.util");

class AmenityFeedbackRepository {
    constructor() {
        this.model = amenityFeedbackModel;
    }

    async createFeedback({ feedbackId, amenityId, userId, reason, comment }) {
        const query = `
            INSERT INTO ${this.model.table} (
                ${this.model.field.feedbackId},
                ${this.model.field.amenityId},
                ${this.model.field.userId},
                ${this.model.field.reason},
                ${this.model.field.comment}
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query, [feedbackId, amenityId, userId, reason, comment || null]);
        return mapFields(result.rows[0], this.model);
    }

    async getFeedbacksAdmin({ page = 1, limit = 10, status }) {
        const offset = (page - 1) * limit;
        const params = [];
        let whereClause = "";

        if (status) {
            params.push(status);
            whereClause = `WHERE af.${this.model.field.status} = $${params.length}`;
        }

        const countQuery = `
            SELECT COUNT(*) FROM ${this.model.table} af
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / limit) || 1;

        const dataQuery = `
            SELECT 
                af.*,
                u.full_name as reporter_name,
                u.email as reporter_email,
                ac.category_name,
                ea.latitude,
                ea.longitude,
                ea.phone as amenity_phone,
                ea.status as amenity_status
            FROM ${this.model.table} af
            JOIN users u ON af.${this.model.field.userId} = u.user_id
            JOIN emergency_amenities ea ON af.${this.model.field.amenityId} = ea.amenity_id
            JOIN amenity_categories ac ON ea.amenity_category_id = ac.amenity_category_id
            ${whereClause}
            ORDER BY af.${this.model.field.createdAt} DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

        const mappedData = dataResult.rows.map((row) => ({
            ...mapFields(row, this.model),
            reporterName: row.reporter_name,
            reporterEmail: row.reporter_email,
            categoryName: row.category_name,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            amenityPhone: row.amenity_phone,
            amenityStatus: row.amenity_status
        }));

        return {
            data: mappedData,
            totalItems,
            totalPages,
            currentPage: page
        };
    }

    async updateFeedbackStatus({ feedbackId, status }) {
        const query = `
            UPDATE ${this.model.table}
            SET ${this.model.field.status} = $1, ${this.model.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.model.field.feedbackId} = $2
            RETURNING *
        `;
        const result = await pool.query(query, [status, feedbackId]);
        if (result.rows.length === 0) return null;
        return mapFields(result.rows[0], this.model);
    }

}

module.exports = new AmenityFeedbackRepository();
