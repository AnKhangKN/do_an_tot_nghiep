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
                reporterName: row.reporter_name || (row.reported_by === null ? '⚡ Hệ thống (Crowd-Sourced)' : '--'),
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

    /// Quét các cụm SOS có >= minSosCount ca trong bán kính radiusMeters
    async detectSosClusters(radiusMeters = 200, minSosCount = 3) {
        const query = `
        SELECT 
            ROUND(s1.victim_lat::numeric, 4) AS cluster_lat,
            ROUND(s1.victim_lng::numeric, 4) AS cluster_lng,
            COUNT(DISTINCT s2.sos_request_id) AS sos_count,
            AVG(s2.victim_lat) AS avg_lat,
            AVG(s2.victim_lng) AS avg_lng
        FROM sos_requests s1
        JOIN sos_requests s2 ON (
            (6371000 * 2 * ASIN(SQRT(
                POWER(SIN(RADIANS(s2.victim_lat - s1.victim_lat) / 2), 2) +
                COS(RADIANS(s1.victim_lat)) * COS(RADIANS(s2.victim_lat)) *
                POWER(SIN(RADIANS(s2.victim_lng - s1.victim_lng) / 2), 2)
            ))) <= $1
        )
        GROUP BY ROUND(s1.victim_lat::numeric, 4), ROUND(s1.victim_lng::numeric, 4)
        HAVING COUNT(DISTINCT s2.sos_request_id) >= $2
        ORDER BY sos_count DESC
        `;

        const { rows } = await pool.query(query, [radiusMeters, minSosCount]);
        return rows.map(r => ({
            avgLat: parseFloat(r.avg_lat),
            avgLng: parseFloat(r.avg_lng),
            sosCount: parseInt(r.sos_count, 10)
        }));
    }

    /// Kiểm tra xem đã có điểm nguy hiểm nào gần tọa độ (lat, lng) trong bán kính radiusMeters chưa
    async findNearbyDangerousPoint(lat, lng, radiusMeters = 300) {
        const query = `
        SELECT dangerous_point_id
        FROM dangerous_points
        WHERE (6371000 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS(latitude - $1) / 2), 2) +
            COS(RADIANS($1)) * COS(RADIANS(latitude)) *
            POWER(SIN(RADIANS(longitude - $2) / 2), 2)
        ))) <= $3
        LIMIT 1
        `;

        const { rows } = await pool.query(query, [lat, lng, radiusMeters]);
        return rows.length > 0;
    }

    /// Tạo điểm nguy hiểm do hệ thống tự phát hiện (reported_by = NULL)
    async createSystemDangerousPoint(client, data) {
        const query = `
        INSERT INTO dangerous_points (
            dangerous_point_id, zone_name, address, description,
            latitude, longitude, danger_level, status, reported_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', NULL)
        RETURNING *
        `;

        const result = await client.query(query, [
            data.dangerousPointId,
            data.zoneName,
            data.address,
            data.description,
            data.latitude,
            data.longitude,
            data.dangerLevel
        ]);

        return result.rows[0];
    }
}

module.exports = new DangerousPointRepository()
