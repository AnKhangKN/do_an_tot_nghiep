const { pool } = require("@/config/database.config")
const dangerousPointModel = require("../model/dangerous_point.model")
const { mapFields } = require("@utils/mapper.util")

class DangerousPointRepository {
    constructor() {
        this.dangerousPointModel = dangerousPointModel
    }

    async createDangerousPoint(client, data) {
        const query = `
        INSERT INTO ${this.dangerousPointModel.table}
            (${this.dangerousPointModel.field.dangerousPointId},
             ${this.dangerousPointModel.field.zoneName},
             ${this.dangerousPointModel.field.address},
             ${this.dangerousPointModel.field.description},
             ${this.dangerousPointModel.field.latitude},
             ${this.dangerousPointModel.field.longitude},
             ${this.dangerousPointModel.field.dangerLevel},
             ${this.dangerousPointModel.field.reportedBy})
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;

        const result = await client.query(query, [
            data.dangerousPointId,
            data.zoneName,
            data.address,
            data.description,
            data.latitude,
            data.longitude,
            data.dangerLevel,
            data.reportedBy
        ]);

        return result.rows[0];
    }

    async getDangerousPointsAdmin({ page, limit }) {
        const offset = (page - 1) * limit;

        const query = `
        SELECT 
            dp.*,
            u_reporter.full_name as reporter_name,
            u_approver.full_name as approver_name
        FROM ${this.dangerousPointModel.table} dp
        LEFT JOIN users u_reporter ON dp.${this.dangerousPointModel.field.reportedBy} = u_reporter.user_id
        LEFT JOIN users u_approver ON dp.${this.dangerousPointModel.field.approvedBy} = u_approver.user_id
        ORDER BY dp.${this.dangerousPointModel.field.createdAt} DESC
        LIMIT $1 OFFSET $2
        `;

        const countQuery = `
        SELECT COUNT(*) AS total
        FROM ${this.dangerousPointModel.table}
        `

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, [limit, offset]),
            pool.query(countQuery)
        ])

        const total = parseInt(countResult.rows[0].total, 10);

        return {
            data: dataResult.rows.map(row => ({
                ...mapFields(row, this.dangerousPointModel),
                reporterName: row.reporter_name,
                approverName: row.approver_name
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getApprovedDangerousPoints() {
        const query = `
        SELECT *
        FROM ${this.dangerousPointModel.table}
        WHERE ${this.dangerousPointModel.field.status} = 'APPROVED'
        ORDER BY ${this.dangerousPointModel.field.createdAt} DESC
        `;

        const { rows } = await pool.query(query);

        return rows.map(row => mapFields(row, this.dangerousPointModel));
    }

    async getDangerousPointById(dangerousPointId) {
        const query = `
        SELECT *
        FROM ${this.dangerousPointModel.table}
        WHERE ${this.dangerousPointModel.field.dangerousPointId} = $1
        `;

        const { rows } = await pool.query(query, [dangerousPointId]);
        return rows[0] ? mapFields(rows[0], this.dangerousPointModel) : null;
    }

    async updateStatus(client, { dangerousPointId, status, approvedBy }) {
        let query = `
        UPDATE ${this.dangerousPointModel.table}
        SET ${this.dangerousPointModel.field.status} = $1,
            ${this.dangerousPointModel.field.updatedAt} = CURRENT_TIMESTAMP
        `;

        const params = [status, dangerousPointId];
        
        if (approvedBy) {
            query += `, ${this.dangerousPointModel.field.approvedBy} = $2`;
            params.splice(1, 0, approvedBy);
        }

        query += ` WHERE ${this.dangerousPointModel.field.dangerousPointId} = $${params.length} RETURNING *`;

        const result = await client.query(query, params);
        return result.rows[0];
    }
}

module.exports = new DangerousPointRepository()
