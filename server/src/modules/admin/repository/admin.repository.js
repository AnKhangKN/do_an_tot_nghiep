const { pool } = require("@/config/database.config");

class AdminRepository {
  getSummaryStats = async () => {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'VICTIM') AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'RESCUER') AS total_rescuers,
        (SELECT COUNT(*) FROM rescuer_profiles WHERE is_verified = false) AS pending_rescuers,
        (SELECT COUNT(*) FROM sos_requests) AS total_sos,
        (SELECT COUNT(*) FROM sos_requests WHERE DATE(created_at) = CURRENT_DATE) AS today_sos,
        (SELECT COUNT(*) FROM sos_requests WHERE status IN ('PENDING', 'SEARCHING', 'ASSIGNED', 'IN_PROGRESS')) AS active_sos,
        (SELECT COUNT(*) FROM sos_requests WHERE status = 'DONE') AS completed_sos,
        (SELECT COUNT(*) FROM sos_requests WHERE status = 'CANCELLED') AS cancelled_sos,
        (SELECT COUNT(*) FROM sos_requests WHERE rescuer_id IS NOT NULL) AS matched_sos,
        (SELECT COUNT(*) FROM incident_types WHERE status = 'ACTIVE') AS total_incident_types
    `;
    const result = await pool.query(query);
    return result.rows[0];
  };

  getSosStatusBreakdown = async () => {
    const query = `
      SELECT status, COUNT(*)::int AS count
      FROM sos_requests
      GROUP BY status
    `;
    const result = await pool.query(query);
    return result.rows;
  };

  getIncidentTypeStats = async () => {
    const query = `
      SELECT 
        it.incident_type_id,
        it.incident_type,
        COUNT(s.sos_request_id)::int AS count
      FROM incident_types it
      LEFT JOIN sos_requests s ON it.incident_type_id = s.incident_type_id
      GROUP BY it.incident_type_id, it.incident_type
      ORDER BY count DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  };

  getDailySosStats = async (days = 7) => {
    const query = `
      SELECT 
        TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
        COUNT(s.sos_request_id)::int AS total,
        COUNT(CASE WHEN s.status = 'DONE' THEN 1 END)::int AS completed,
        COUNT(CASE WHEN s.status = 'CANCELLED' THEN 1 END)::int AS cancelled
      FROM (
        SELECT generate_series(CURRENT_DATE - (INTERVAL '1 day' * ($1 - 1)), CURRENT_DATE, '1 day'::interval)::date AS day
      ) d
      LEFT JOIN sos_requests s ON DATE(s.created_at) = d.day
      GROUP BY d.day
      ORDER BY d.day ASC
    `;
    const result = await pool.query(query, [days]);
    return result.rows;
  };

  getRecentSosRequests = async (limit = 6) => {
    const query = `
      SELECT 
        s.sos_request_id,
        s.description,
        s.victim_lat,
        s.victim_lng,
        s.status,
        s.created_at,
        u.full_name AS victim_name,
        u.phone AS victim_phone,
        r.full_name AS rescuer_name,
        it.incident_type
      FROM sos_requests s
      LEFT JOIN users u ON s.user_id = u.user_id
      LEFT JOIN users r ON s.rescuer_id = r.user_id
      LEFT JOIN incident_types it ON s.incident_type_id = it.incident_type_id
      ORDER BY s.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  };

  getSosHeatmapPoints = async () => {
    const query = `
      SELECT 
        s.sos_request_id,
        s.victim_lat AS lat,
        s.victim_lng AS lng,
        s.status,
        it.incident_type,
        s.created_at
      FROM sos_requests s
      LEFT JOIN incident_types it ON s.incident_type_id = it.incident_type_id
      WHERE s.victim_lat IS NOT NULL 
        AND s.victim_lng IS NOT NULL 
        AND s.victim_lat != 0 
        AND s.victim_lng != 0
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  };

  banUser = async (client, { userId, reason, bannedBy }) => {
    const query = `
      UPDATE users
      SET status = 'BANNED',
          ban_reason = $2,
          banned_at = CURRENT_TIMESTAMP,
          banned_by = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING user_id, status, ban_reason, banned_at, banned_by
    `;
    const result = await client.query(query, [userId, reason, bannedBy]);
    return result.rows[0];
  };

  unbanUser = async (client, { userId }) => {
    const query = `
      UPDATE users
      SET status = 'ACTIVE',
          ban_reason = NULL,
          banned_at = NULL,
          banned_by = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING user_id, status
    `;
    const result = await client.query(query, [userId]);
    return result.rows[0];
  };

  getBannedUsers = async ({ page, limit }) => {
    const offset = (page - 1) * limit;

    const query = `
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.avatar_url,
        u.ban_reason,
        u.banned_at,
        u.banned_by,
        u.created_at,
        u.updated_at,
        b.full_name AS banned_by_name
      FROM users u
      LEFT JOIN users b ON u.banned_by = b.user_id
      WHERE u.status = 'BANNED'
      ORDER BY u.banned_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users
      WHERE status = 'BANNED'
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);

    const total = parseInt(countResult.rows[0].total, 10);

    return {
      data: dataResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  };

  getAppeals = async ({ page, limit, status }) => {
    const offset = (page - 1) * limit;
    let whereClause = '';
    let countWhereClause = '';
    const params = [limit, offset];
    if (status) {
      whereClause = 'WHERE ba.status = $3';
      countWhereClause = 'WHERE status = $1';
      params.push(status);
    }

    const query = `
      SELECT
        ba.appeal_id AS id,
        ba.user_id,
        ba.reason,
        ba.status,
        ba.created_at,
        ba.updated_at AS handled_at,
        ba.reviewed_by,
        rb.full_name AS handled_by_name,
        ba.admin_note,
        u.full_name AS user_name,
        u.email AS user_email,
        u.ban_reason
      FROM ban_appeals ba
      LEFT JOIN users u ON ba.user_id = u.user_id
      LEFT JOIN users rb ON ba.reviewed_by = rb.user_id
      ${whereClause}
      ORDER BY ba.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) AS total FROM ban_appeals ${countWhereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      status ? pool.query(countQuery, [status]) : pool.query(countQuery)
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total, 10) / limit)
    };
  };

  getAppealById = async (appealId) => {
    const query = `SELECT * FROM ban_appeals WHERE appeal_id = $1`;
    try {
      const result = await pool.query(query, [appealId]);
      return result.rows[0] || null;
    } catch {
      return null;
    }
  };

  updateAppealStatus = async (client, appealId, status, reviewedBy, adminNote = null) => {
    const query = `
      UPDATE ban_appeals
      SET status = $2, reviewed_by = $3, admin_note = $4, updated_at = CURRENT_TIMESTAMP
      WHERE appeal_id = $1
      RETURNING *
    `;
    const result = await client.query(query, [appealId, status, reviewedBy, adminNote]);
    return result.rows[0];
  };

  getExportSosData = async (days = 30) => {
    const query = `
      SELECT 
        s.sos_request_id,
        u_victim.full_name AS victim_name,
        u_victim.phone AS victim_phone,
        it.incident_type,
        s.status,
        u_rescuer.full_name AS rescuer_name,
        u_rescuer.phone AS rescuer_phone,
        s.victim_lat AS lat,
        s.victim_lng AS lng,
        s.created_at,
        s.updated_at
      FROM sos_requests s
      LEFT JOIN users u_victim ON s.user_id = u_victim.user_id
      LEFT JOIN users u_rescuer ON s.rescuer_id = u_rescuer.user_id
      LEFT JOIN incident_types it ON s.incident_type_id = it.incident_type_id
      WHERE s.created_at >= CURRENT_DATE - (INTERVAL '1 day' * $1)
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query, [days]);
    return result.rows;
  };
}

module.exports = new AdminRepository();
