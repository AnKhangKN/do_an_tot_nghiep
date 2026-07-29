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

    async getAllRatingsAdmin({ page = 1, limit = 20, ratingFilter = null } = {}) {
        const offset = (page - 1) * limit;
        let whereClause = "";
        const queryParams = [limit, offset];

        if (ratingFilter && Number(ratingFilter) >= 1 && Number(ratingFilter) <= 5) {
            whereClause = "WHERE r.rating = $3";
            queryParams.push(Number(ratingFilter));
        }

        const countQuery = `
            SELECT 
                COUNT(*)::int as total,
                COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0) as avg_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END)::int as five_star_count
            FROM rescuer_ratings r
            ${whereClause}
        `;
        const dataQuery = `
            SELECT 
                r.*, 
                v.full_name as victim_name, v.avatar_url as victim_avatar,
                res.full_name as rescuer_name, res.avatar_url as rescuer_avatar
            FROM rescuer_ratings r
            LEFT JOIN users v ON r.victim_id = v.user_id
            LEFT JOIN users res ON r.rescuer_id = res.user_id
            ${whereClause}
            ORDER BY r.created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const [countResult, dataResult] = await Promise.all([
            pool.query(countQuery, ratingFilter ? [Number(ratingFilter)] : []),
            pool.query(dataQuery, queryParams)
        ]);

        const statsRow = countResult.rows[0];

        return {
            total: statsRow?.total || 0,
            avgRating: parseFloat(statsRow?.avg_rating || 0.0),
            fiveStarCount: statsRow?.five_star_count || 0,
            page: Number(page),
            limit: Number(limit),
            ratings: dataResult.rows
        };
    }
}

module.exports = new RatingRepository();
