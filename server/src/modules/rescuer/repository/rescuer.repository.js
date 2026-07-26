const rescuer_incident_typesModel = require('../model/rescuer_incident_types.model')
const rescuerProfileModel = require("../model/rescuer_profile.model")
const userModel = require("@modules/user/model/user.model");
const { pool } = require('@/config/database.config');
const redis = require('@/config/redis.config');

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
        FROM ${this.rescuerProfileModel.table}
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
    isVerifiedRescuer = async (client, { userId }) => {
        const query = `
            UPDATE ${this.rescuerProfileModel.table}
            SET ${this.rescuerProfileModel.field.isVerified} = true
            WHERE ${this.rescuerProfileModel.field.userId} = $1
            RETURNING *;
        `;

        const result = await client.query(query, [userId]);

        return result.rows[0];
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

    // Khi người dùng offline, cập nhật member trong Redis
    offlineRedis = async ({ userId }) => {

        const removed = await redis.call(
            'ZREM',
            'rescuer_locations',
            userId
        );

        console.log(`ZREM result:`, removed);

        return removed;
    }

    updateLastSeen = async ({ userId }) => {
        const now = new Date().toISOString();
        await redis.hset('rescuer:last_seen', userId, now);
        console.log(`[REDIS] Cập nhật last_seen cho user ${userId} vào cache.`);
        return { user_id: userId, last_seen_at: now };
    }

    syncLastSeenToDB = async ({ userId }) => {
        const lastSeen = await redis.hget('rescuer:last_seen', userId);
        const timeToSync = lastSeen ? new Date(lastSeen) : new Date();

        const query = `
            UPDATE ${this.rescuerProfileModel.table}
            SET ${this.rescuerProfileModel.field.lastSeenAt} = $2
            WHERE ${this.rescuerProfileModel.field.userId} = $1
            RETURNING *
        `;

        const result = await pool.query(query, [userId, timeToSync]);
        console.log(`[DB SYNC] Đồng bộ lastSeenAt thành công từ Redis xuống DB cho user ${userId}:`, result.rows[0]);
        return result.rows[0];
    }

    // Matching service
    findNearbyRescuers = async ({
        lat,
        lng,
        radius
    }) => {

        const result = await redis.call(
            'GEOSEARCH',
            'rescuer_locations', // key của tập hợp địa lý trong Redis (đúng với key đã thêm ở updateLocation)
            'FROMLONLAT',
            String(lng),
            String(lat),
            'BYRADIUS',
            String(radius),
            'km',
            'WITHDIST',
            'ASC'
        );

        const count = await redis.call(
            'ZCARD',
            'active_rescuers'
        );

        return result;
    };

    getRescuersByIds = async (rescuerIds) => {

        if (!rescuerIds.length) {
            return [];
        }

        const result = await pool.query(
            `
        SELECT
            ${this.rescuerProfileModel.field.userId},
            ${this.rescuerProfileModel.field.status},
            ${this.rescuerProfileModel.field.lastSeenAt}
        FROM ${this.rescuerProfileModel.table}
        WHERE ${this.rescuerProfileModel.field.userId} = ANY($1)
        `,
            [rescuerIds]
        );

        return result.rows;
    };

    getRescuersIncidentTypes = async (rescuerIds) => {
        if (!rescuerIds.length) {
            return new Map();
        }

        const query = `
            SELECT 
                ${this.rescuer_incident_typesModel.field.userId},
                ${this.rescuer_incident_typesModel.field.incidentTypeId}
            FROM ${this.rescuer_incident_typesModel.table}
            WHERE ${this.rescuer_incident_typesModel.field.userId} = ANY($1)
        `;

        const result = await pool.query(query, [rescuerIds]);
        
        // Tạo Map: userId -> Set of incidentTypeIds
        const incidentTypesMap = new Map();
        result.rows.forEach(row => {
            const userId = row.user_id;
            const incidentTypeId = row.incident_type_id;
            
            if (!incidentTypesMap.has(userId)) {
                incidentTypesMap.set(userId, new Set());
            }
            incidentTypesMap.get(userId).add(incidentTypeId);
        });

        return incidentTypesMap;
    };

    getRescuerPerformanceAnalytics = async ({ page = 1, limit = 10, search = '' }) => {
        const offset = (page - 1) * limit;
        const searchPattern = `%${search}%`;

        const query = `
        SELECT 
            u.user_id,
            u.full_name,
            u.email,
            u.phone,
            u.avatar_url,
            u.status as user_status,
            rp.area,
            rp.is_verified,
            COUNT(DISTINCT sr.sos_request_id) FILTER (WHERE sr.status IN ('DONE', 'COMPLETED')) AS completed_count,
            COUNT(DISTINCT rh.rescuer_history_id) FILTER (WHERE rh.action = 'ACCEPTED') AS accepted_count,
            COUNT(DISTINCT rh.rescuer_history_id) FILTER (WHERE rh.action = 'REJECTED') AS rejected_count,
            COUNT(DISTINCT rh.rescuer_history_id) FILTER (WHERE rh.action = 'TIMEOUT') AS timeout_count,
            ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (sr.accepted_at - sr.assigned_at))) FILTER (WHERE sr.accepted_at IS NOT NULL AND sr.assigned_at IS NOT NULL), 0)::numeric, 1) AS avg_response_time_seconds,
            ROUND(COALESCE(AVG(rr.rating), 0)::numeric, 1) AS avg_rating,
            COUNT(DISTINCT rr.rating_id) AS total_ratings
        FROM users u
        JOIN rescuer_profiles rp ON u.user_id = rp.user_id
        LEFT JOIN sos_requests sr ON u.user_id = sr.rescuer_id
        LEFT JOIN rescuer_histories rh ON u.user_id = rh.rescuer_id
        LEFT JOIN rescuer_ratings rr ON u.user_id = rr.rescuer_id
        WHERE u.role = 'RESCUER'
          AND ($1 = '%%' OR u.full_name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)
        GROUP BY u.user_id, u.full_name, u.email, u.phone, u.avatar_url, u.status, rp.area, rp.is_verified
        ORDER BY completed_count DESC, avg_rating DESC, avg_response_time_seconds ASC
        LIMIT $2 OFFSET $3
        `;

        const countQuery = `
        SELECT COUNT(DISTINCT u.user_id) AS total
        FROM users u
        JOIN rescuer_profiles rp ON u.user_id = rp.user_id
        WHERE u.role = 'RESCUER'
          AND ($1 = '%%' OR u.full_name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)
        `;

        const overviewQuery = `
        SELECT
            COUNT(DISTINCT u.user_id) AS total_rescuers,
            COUNT(DISTINCT sr.sos_request_id) FILTER (WHERE sr.status IN ('DONE', 'COMPLETED')) AS total_completed_sos,
            ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (sr.accepted_at - sr.assigned_at))) FILTER (WHERE sr.accepted_at IS NOT NULL AND sr.assigned_at IS NOT NULL), 0)::numeric, 1) AS overall_avg_response_time,
            ROUND(COALESCE(AVG(rr.rating), 0)::numeric, 1) AS overall_avg_rating
        FROM users u
        JOIN rescuer_profiles rp ON u.user_id = rp.user_id
        LEFT JOIN sos_requests sr ON u.user_id = sr.rescuer_id
        LEFT JOIN rescuer_ratings rr ON u.user_id = rr.rescuer_id
        WHERE u.role = 'RESCUER'
        `;

        const [dataResult, countResult, overviewResult] = await Promise.all([
            pool.query(query, [searchPattern, limit, offset]),
            pool.query(countQuery, [searchPattern]),
            pool.query(overviewQuery)
        ]);

        const total = parseInt(countResult.rows[0].total, 10);
        const overview = overviewResult.rows[0] || {};

        return {
            data: dataResult.rows.map(row => {
                const accepted = parseInt(row.accepted_count, 10);
                const rejected = parseInt(row.rejected_count, 10);
                const timeout = parseInt(row.timeout_count, 10);
                const totalOffers = accepted + rejected + timeout;
                const responseRate = totalOffers > 0 ? Math.round((accepted / totalOffers) * 100) : 100;

                return {
                    userId: row.user_id,
                    fullName: row.full_name,
                    email: row.email,
                    phone: row.phone,
                    avatarUrl: row.avatar_url,
                    status: row.user_status,
                    area: row.area,
                    isVerified: row.is_verified,
                    completedCount: parseInt(row.completed_count, 10),
                    acceptedCount: accepted,
                    rejectedCount: rejected,
                    timeoutCount: timeout,
                    totalOffers,
                    responseRate,
                    avgResponseTimeSeconds: parseFloat(row.avg_response_time_seconds) || 0,
                    avgRating: parseFloat(row.avg_rating) || 0,
                    totalRatings: parseInt(row.total_ratings, 10)
                };
            }),
            total,
            page,
            totalPages: Math.ceil(total / limit),
            overview: {
                totalRescuers: parseInt(overview.total_rescuers || 0, 10),
                totalCompletedSos: parseInt(overview.total_completed_sos || 0, 10),
                overallAvgResponseTime: parseFloat(overview.overall_avg_response_time) || 0,
                overallAvgRating: parseFloat(overview.overall_avg_rating) || 0
            }
        };
    }

}

module.exports = new RescueRepository()