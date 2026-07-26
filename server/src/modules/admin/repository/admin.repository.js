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
}

module.exports = new AdminRepository();
