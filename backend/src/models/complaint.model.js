const { query } = require('../config/db');

async function createComplaint(payload) {
  const result = await query(
    `INSERT INTO complaints (
      complaint_code,
      anon_user_id,
      accused_employee_hash,
      incident_date,
      location,
      description,
      status,
      severity_score
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      payload.complaint_code,
      payload.anon_user_id,
      payload.accused_employee_hash,
      payload.incident_date,
      payload.location,
      payload.description,
      payload.status,
      payload.severity_score,
    ]
  );

  return result.rows[0];
}

async function listForReporter(anonUserId) {
  const result = await query(
    `SELECT * FROM complaints
     WHERE anon_user_id = $1
     ORDER BY created_at DESC`,
    [anonUserId]
  );

  return result.rows;
}

async function listForHr() {
  const result = await query('SELECT * FROM complaints ORDER BY created_at DESC');
  return result.rows;
}

async function listForHrDepartmentRisk() {
  const result = await query(
    `SELECT location, severity_score
     FROM complaints
     ORDER BY created_at DESC`
  );
  return result.rows;
}

async function getHrDashboardSummary() {
  const [metricsResult, weeklyTrendResult] = await Promise.all([
    query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::int AS total_today,
         COUNT(*) FILTER (
           WHERE created_at >= (CURRENT_DATE - INTERVAL '1 day')
             AND created_at < CURRENT_DATE
         )::int AS total_yesterday,
         COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW()))::int AS total_month,
         COUNT(*) FILTER (WHERE status = 'submitted')::int AS under_hr_review,
         COUNT(*) FILTER (WHERE status = 'under_review')::int AS under_committee_review,
         COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved_cases,
         COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_cases,
         COUNT(*) FILTER (
           WHERE severity_score >= 70
             AND status NOT IN ('resolved', 'rejected')
         )::int AS high_risk_cases,
         COUNT(*) FILTER (
           WHERE status NOT IN ('resolved', 'rejected')
             AND created_at < (NOW() - INTERVAL '7 days')
         )::int AS stale_cases
       FROM complaints`
    ),
    query(
      `SELECT
         gs.day::date AS day,
         COALESCE(c.count, 0)::int AS count
       FROM GENERATE_SERIES(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS gs(day)
       LEFT JOIN (
         SELECT DATE(created_at) AS day, COUNT(*)::int AS count
         FROM complaints
         WHERE created_at >= (CURRENT_DATE - INTERVAL '6 days')
         GROUP BY DATE(created_at)
       ) c ON c.day = gs.day::date
       ORDER BY gs.day ASC`
    ),
  ]);

  return {
    metrics: metricsResult.rows[0] || null,
    weeklyTrend: weeklyTrendResult.rows || [],
  };
}

async function findByReferenceForUser(reference, user) {
  const isHr = ['hr', 'committee', 'admin'].includes(user.role);
  const result = await query(
    `SELECT * FROM complaints
     WHERE (complaint_code = $1 OR id::text = $1)
       AND ($2::boolean = true OR anon_user_id = $3)
     LIMIT 1`,
    [reference, isHr, user.id]
  );

  return result.rows[0] || null;
}

async function updateStatusByHr(reference, status) {
  const result = await query(
    `UPDATE complaints
     SET status = $2,
         updated_at = NOW()
     WHERE complaint_code = $1 OR id::text = $1
     RETURNING *`,
    [reference, status]
  );

  return result.rows[0] || null;
}

module.exports = {
  createComplaint,
  listForReporter,
  listForHr,
  listForHrDepartmentRisk,
  getHrDashboardSummary,
  findByReferenceForUser,
  updateStatusByHr,
};
