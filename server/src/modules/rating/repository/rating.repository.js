const { pool } = require("@/config/database.config");
const ratingModel = {
    table: "rescuer_ratings",
    field: {
        ratingId: "rating_id",
        sosRequestId: "sos_request_id",
        victimId: "victim_id",
        rescuerId: "rescuer_id",
        rating: "rating",
        comment: "comment",
        createdAt: "created_at"
    }
};

class RatingRepository {
    constructor() {
        this.ratingModel = ratingModel;
    }

    async createRating({ ratingId, sosRequestId, victimId, rescuerId, rating, comment }) {
        const query = `
            INSERT INTO rescuer_ratings (rating_id, sos_request_id, victim_id, rescuer_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await pool.query(query, [
            ratingId,
            sosRequestId,
            victimId,
            rescuerId,
            rating,
            comment || null
        ]);
        return result.rows[0];
    }

    async getRatingBySosId(sosRequestId) {
        const query = `
            SELECT r.*, u.full_name as victim_name, u.avatar_url as victim_avatar
            FROM rescuer_ratings r
            LEFT JOIN users u ON r.victim_id = u.user_id
            WHERE r.sos_request_id = $1
        `;
        const result = await pool.query(query, [sosRequestId]);
        return result.rows[0] || null;
    }

    async getRescuerRatingStats(rescuerId) {
        const query = `
            SELECT 
                COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0) as avg_rating,
                COUNT(*)::int as total_ratings
            FROM rescuer_ratings
            WHERE rescuer_id = $1
        `;
        const result = await pool.query(query, [rescuerId]);
        return result.rows[0] || { avg_rating: 0.0, total_ratings: 0 };
    }

    async getRatingsByRescuerId(rescuerId, { page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT r.*, u.full_name as victim_name, u.avatar_url as victim_avatar
            FROM rescuer_ratings r
            LEFT JOIN users u ON r.victim_id = u.user_id
            WHERE r.rescuer_id = $1
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [rescuerId, limit, offset]);
        return result.rows;
    }

    async getAllRatingsAdmin({ page = 1, limit = 20 } = {}) {
        const offset = (page - 1) * limit;
        const countQuery = `SELECT COUNT(*)::int as total FROM rescuer_ratings`;
        const dataQuery = `
            SELECT 
                r.*, 
                v.full_name as victim_name, v.avatar_url as victim_avatar,
                res.full_name as rescuer_name, res.avatar_url as rescuer_avatar
            FROM rescuer_ratings r
            LEFT JOIN users v ON r.victim_id = v.user_id
            LEFT JOIN users res ON r.rescuer_id = res.user_id
            ORDER BY r.created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const [countResult, dataResult] = await Promise.all([
            pool.query(countQuery),
            pool.query(dataQuery, [limit, offset])
        ]);

        return {
            total: countResult.rows[0]?.total || 0,
            page: Number(page),
            limit: Number(limit),
            ratings: dataResult.rows
        };
    }
}

module.exports = new RatingRepository();
