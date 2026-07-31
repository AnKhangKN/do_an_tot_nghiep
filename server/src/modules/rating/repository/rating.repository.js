const { pool } = require("@/config/database.config");
const ratingModel = {
    table: "rescuer_ratings",
    field: {
        ratingId: "rating_id",
        sosRequestId: "sos_request_id",
        victimId: "victim_id",
        rescuerId: "rescuer_id",
        rating: "rating",
        responseSpeed: "response_speed",
        attitude: "attitude",
        supportLevel: "support_level",
        sentiment: "sentiment",
        sentimentConfidence: "sentiment_confidence",
        isFlagged: "is_flagged",
        comment: "comment",
        createdAt: "created_at"
    }
};

class RatingRepository {
    constructor() {
        this.ratingModel = ratingModel;
    }

    async createRating({ ratingId, sosRequestId, victimId, rescuerId, rating, responseSpeed, attitude, supportLevel, comment }) {
        const query = `
            INSERT INTO rescuer_ratings (rating_id, sos_request_id, victim_id, rescuer_id, rating, response_speed, attitude, support_level, comment)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const result = await pool.query(query, [
            ratingId,
            sosRequestId,
            victimId,
            rescuerId,
            rating,
            responseSpeed || null,
            attitude || null,
            supportLevel || null,
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
                COUNT(*)::int as total_ratings,
                COALESCE(ROUND(AVG(response_speed)::numeric, 1), 0.0) as avg_response_speed,
                COALESCE(ROUND(AVG(attitude)::numeric, 1), 0.0) as avg_attitude,
                COALESCE(ROUND(AVG(support_level)::numeric, 1), 0.0) as avg_support_level
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

    async getAllRatingsAdmin({ page = 1, limit = 20, ratingFilter = null, sentimentFilter = null } = {}) {
        const offset = (page - 1) * limit;

        const buildWhere = (startIndex) => {
            const clauses = [];
            const params = [];
            let idx = startIndex;

            if (ratingFilter && Number(ratingFilter) >= 1 && Number(ratingFilter) <= 5) {
                clauses.push(`r.rating = $${idx}`);
                params.push(Number(ratingFilter));
                idx += 1;
            }

            if (sentimentFilter && ["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(sentimentFilter)) {
                clauses.push(`r.sentiment = $${idx}`);
                params.push(sentimentFilter);
                idx += 1;
            }

            return {
                clause: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
                params
            };
        };

        const countWhere = buildWhere(1);
        const dataWhere = buildWhere(3);

        const countQuery = `
            SELECT 
                COUNT(*)::int as total,
                COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0) as avg_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END)::int as five_star_count,
                COALESCE(ROUND(AVG(response_speed)::numeric, 1), 0.0) as avg_response_speed,
                COALESCE(ROUND(AVG(attitude)::numeric, 1), 0.0) as avg_attitude,
                COALESCE(ROUND(AVG(support_level)::numeric, 1), 0.0) as avg_support_level
            FROM rescuer_ratings r
            ${countWhere.clause}
        `;
        const dataQuery = `
            SELECT 
                r.*, 
                v.full_name as victim_name, v.avatar_url as victim_avatar,
                res.full_name as rescuer_name, res.avatar_url as rescuer_avatar
            FROM rescuer_ratings r
            LEFT JOIN users v ON r.victim_id = v.user_id
            LEFT JOIN users res ON r.rescuer_id = res.user_id
            ${dataWhere.clause}
            ORDER BY r.created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const [countResult, dataResult] = await Promise.all([
            pool.query(countQuery, countWhere.params),
            pool.query(dataQuery, [limit, offset, ...dataWhere.params])
        ]);

        const statsRow = countResult.rows[0];

        return {
            total: statsRow?.total || 0,
            avgRating: parseFloat(statsRow?.avg_rating || 0.0),
            fiveStarCount: statsRow?.five_star_count || 0,
            aspectStats: {
                responseSpeed: parseFloat(statsRow?.avg_response_speed || 0.0),
                attitude: parseFloat(statsRow?.avg_attitude || 0.0),
                supportLevel: parseFloat(statsRow?.avg_support_level || 0.0)
            },
            page: Number(page),
            limit: Number(limit),
            ratings: dataResult.rows
        };
    }

    async getRatingTrends({ days = 7 } = {}) {
        const query = `
            WITH days AS (
                SELECT generate_series(
                    CURRENT_DATE - ($1::int - 1),
                    CURRENT_DATE,
                    '1 day'::interval
                )::date AS day
            )
            SELECT
                d.day AS date,
                COUNT(r.rating_id)::int AS total,
                COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS avg_rating,
                COALESCE(ROUND(AVG(r.response_speed)::numeric, 1), 0.0) AS avg_response_speed,
                COALESCE(ROUND(AVG(r.attitude)::numeric, 1), 0.0) AS avg_attitude,
                COALESCE(ROUND(AVG(r.support_level)::numeric, 1), 0.0) AS avg_support_level,
                COUNT(CASE WHEN r.sentiment = 'POSITIVE' THEN 1 END)::int AS positive_count,
                COUNT(CASE WHEN r.sentiment = 'NEUTRAL' THEN 1 END)::int AS neutral_count,
                COUNT(CASE WHEN r.sentiment = 'NEGATIVE' THEN 1 END)::int AS negative_count
            FROM days d
            LEFT JOIN rescuer_ratings r ON r.created_at::date = d.day
            GROUP BY d.day
            ORDER BY d.day ASC
        `;
        const result = await pool.query(query, [Number(days)]);
        return result.rows;
    }

    async updateRatingSentiment({ ratingId, sentiment, confidence }) {
        const query = `
            UPDATE rescuer_ratings
            SET sentiment = $2, sentiment_confidence = $3
            WHERE rating_id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [ratingId, sentiment, confidence]);
        return result.rows[0] || null;
    }

    async flagRating(ratingId) {
        const query = `
            UPDATE rescuer_ratings
            SET is_flagged = TRUE
            WHERE rating_id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [ratingId]);
        return result.rows[0] || null;
    }
}

module.exports = new RatingRepository();
