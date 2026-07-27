const { pool } = require("@/config/database.config");
const emergencyAmenityModel = require("../model/emergency_amenity.model");
const amenityCategoryModel = require("../model/amenity_category.model");
const { mapFields } = require("@utils/mapper.util");

class EmergencyAmenityRepository {
    constructor() {
        this.model = emergencyAmenityModel;
        this.categoryModel = amenityCategoryModel;
    }

    async getApprovedAmenities({ amenityCategoryId }) {
        let query = `
            SELECT 
                ea.*,
                ac.category_name,
                ac.icon_name
            FROM ${this.model.table} ea
            JOIN ${this.categoryModel.table} ac ON ea.${this.model.field.amenityCategoryId} = ac.${this.categoryModel.field.amenityCategoryId}
            WHERE ea.${this.model.field.status} = 'APPROVED'
              AND ac.${this.categoryModel.field.status} = 'ACTIVE'
        `;
        const params = [];
        if (amenityCategoryId) {
            params.push(amenityCategoryId);
            query += ` AND ea.${this.model.field.amenityCategoryId} = $1`;
        }
        query += ` ORDER BY ea.${this.model.field.createdAt} DESC`;

        const { rows } = await pool.query(query, params);
        return rows.map(row => ({
            ...mapFields(row, this.model),
            categoryName: row.category_name,
            iconName: row.icon_name
        }));
    }

    async createAmenity(data) {
        const query = `
            INSERT INTO ${this.model.table} (
                ${this.model.field.amenityId},
                ${this.model.field.amenityCategoryId},
                ${this.model.field.phone},
                ${this.model.field.latitude},
                ${this.model.field.longitude},
                ${this.model.field.openingHours},
                ${this.model.field.status},
                ${this.model.field.reportedBy},
                ${this.model.field.approvedBy}
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const params = [
            data.amenityId,
            data.amenityCategoryId,
            data.phone || null,
            data.latitude,
            data.longitude,
            data.openingHours || '07:00 - 21:00',
            data.status || 'PENDING',
            data.reportedBy || null,
            data.approvedBy || null
        ];
        const { rows } = await pool.query(query, params);
        return mapFields(rows[0], this.model);
    }

    async getAmenitiesAdmin({ page = 1, limit = 20, status, categoryId }) {
        const offset = (page - 1) * limit;
        let whereClause = `WHERE 1=1`;
        const params = [];

        if (status) {
            params.push(status);
            whereClause += ` AND ea.${this.model.field.status} = $${params.length}`;
        }

        if (categoryId) {
            params.push(categoryId);
            whereClause += ` AND ea.${this.model.field.amenityCategoryId} = $${params.length}`;
        }

        const dataParams = [...params, limit, offset];
        const query = `
            SELECT 
                ea.*,
                ac.category_name,
                ac.icon_name,
                u_reporter.full_name as reporter_name
            FROM ${this.model.table} ea
            JOIN ${this.categoryModel.table} ac ON ea.${this.model.field.amenityCategoryId} = ac.${this.categoryModel.field.amenityCategoryId}
            LEFT JOIN users u_reporter ON ea.${this.model.field.reportedBy} = u_reporter.user_id
            ${whereClause}
            ORDER BY ea.${this.model.field.createdAt} DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM ${this.model.table} ea
            ${whereClause}
        `;

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, dataParams),
            pool.query(countQuery, params)
        ]);

        const total = parseInt(countResult.rows[0].total, 10);
        return {
            data: dataResult.rows.map(row => ({
                ...mapFields(row, this.model),
                categoryName: row.category_name,
                iconName: row.icon_name,
                reporterName: row.reporter_name || (row.reported_by ? 'Người dùng' : 'Hệ thống')
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async updateStatus({ amenityId, status, approvedBy }) {
        const query = `
            UPDATE ${this.model.table}
            SET ${this.model.field.status} = $1,
                ${this.model.field.approvedBy} = $2,
                ${this.model.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.model.field.amenityId} = $3
            RETURNING *
        `;
        const { rows } = await pool.query(query, [status, approvedBy, amenityId]);
        return rows[0] ? mapFields(rows[0], this.model) : null;
    }

    async deleteAmenity(amenityId) {
        const query = `
            DELETE FROM ${this.model.table}
            WHERE ${this.model.field.amenityId} = $1
            RETURNING *
        `;
        const { rows } = await pool.query(query, [amenityId]);
        return rows.length > 0;
    }
}

module.exports = new EmergencyAmenityRepository();
