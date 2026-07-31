const { pool } = require("@/config/database.config");
const amenityAutoActionModel = require("../model/amenity_auto_action.model");
const { mapFields } = require("@utils/mapper.util");

class AmenityAutoActionRepository {
    constructor() {
        this.model = amenityAutoActionModel;
    }

    async createAutoAction(client, { actionId, amenityId, targetAmenityId, actionType, status, reason, snapshotData }) {
        const query = `
            INSERT INTO ${this.model.table} (
                ${this.model.field.actionId},
                ${this.model.field.amenityId},
                ${this.model.field.targetAmenityId},
                ${this.model.field.actionType},
                ${this.model.field.status},
                ${this.model.field.reason},
                ${this.model.field.snapshotData}
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const params = [
            actionId,
            amenityId || null,
            targetAmenityId || null,
            actionType,
            status || 'PENDING',
            reason || null,
            snapshotData ? JSON.stringify(snapshotData) : null
        ];

        const result = client ? await client.query(query, params) : await pool.query(query, params);
        return mapFields(result.rows[0], this.model);
    }

    async getAutoActionsAdmin({ page = 1, limit = 10, status, actionType }) {
        const offset = (page - 1) * limit;
        const params = [];
        const conditions = [];

        if (status) {
            params.push(status);
            conditions.push(`aa.${this.model.field.status} = $${params.length}`);
        }

        if (actionType) {
            params.push(actionType);
            conditions.push(`aa.${this.model.field.actionType} = $${params.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const countQuery = `
            SELECT COUNT(*) FROM ${this.model.table} aa
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / limit) || 1;

        const pendingCountQuery = `
            SELECT COUNT(*) FROM ${this.model.table} WHERE status = 'PENDING'
        `;
        const pendingResult = await pool.query(pendingCountQuery);
        const pendingCount = parseInt(pendingResult.rows[0].count, 10);

        const dataQuery = `
            SELECT 
                aa.*,
                ac.category_name,
                ea.phone as amenity_phone,
                ea.latitude,
                ea.longitude
            FROM ${this.model.table} aa
            LEFT JOIN emergency_amenities ea ON aa.${this.model.field.amenityId} = ea.amenity_id
            LEFT JOIN amenity_categories ac ON ea.amenity_category_id = ac.amenity_category_id
            ${whereClause}
            ORDER BY aa.${this.model.field.createdAt} DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

        const mappedData = dataResult.rows.map((row) => ({
            ...mapFields(row, this.model),
            categoryName: row.category_name || 'Không xác định',
            amenityPhone: row.amenity_phone || null,
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
            snapshot: row.snapshot_data ? (typeof row.snapshot_data === 'string' ? JSON.parse(row.snapshot_data) : row.snapshot_data) : null
        }));

        return {
            data: mappedData,
            totalItems,
            totalPages,
            pendingCount,
            currentPage: page
        };
    }

    async updateActionStatus(client, { actionId, status, reason }) {
        const query = `
            UPDATE ${this.model.table}
            SET 
                ${this.model.field.status} = $1,
                ${this.model.field.reason} = COALESCE($2, ${this.model.field.reason}),
                ${this.model.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.model.field.actionId} = $3
            RETURNING *
        `;
        const params = [status, reason || null, actionId];
        const result = client ? await client.query(query, params) : await pool.query(query, params);
        if (result.rows.length === 0) return null;
        return mapFields(result.rows[0], this.model);
    }

    async getAutoActionById(actionId) {
        const query = `SELECT * FROM ${this.model.table} WHERE ${this.model.field.actionId} = $1`;
        const result = await pool.query(query, [actionId]);
        if (result.rows.length === 0) return null;
        return mapFields(result.rows[0], this.model);
    }
}

module.exports = new AmenityAutoActionRepository();
