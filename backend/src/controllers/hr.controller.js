const complaintModel = require('../models/complaint.model');
const verdictModel = require('../models/verdict.model');
const accusedModel = require('../models/accused.model');
const { decryptFields } = require('../services/encryption.service');
const { logAuditEvent } = require('../services/audit.service');

function priorityLabel(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function safeLocation(value) {
  return value && String(value).trim().length > 0 ? String(value) : 'Unassigned';
}

async function queue(req, res, next) {
  try {
    const complaints = await complaintModel.listForHr();
    const decrypted = complaints.map((item) => decryptFields(item, ['description', 'location']));
    const sanitized = decrypted.map(({ anon_user_id, ...rest }) => rest);
    return res.json({ success: true, data: sanitized });
  } catch (err) {
    return next(err);
  }
}

async function dashboardOverview(req, res, next) {
  try {
    const [summary, profileCount, alertStats] = await Promise.all([
      complaintModel.getHrDashboardSummary(),
      accusedModel.getAccusedProfileCount(),
      accusedModel.getPatternAlertStats(),
    ]);

    const metrics = summary.metrics || {
      total_today: 0,
      total_yesterday: 0,
      total_month: 0,
      under_hr_review: 0,
      under_committee_review: 0,
      resolved_cases: 0,
      rejected_cases: 0,
      high_risk_cases: 0,
      stale_cases: 0,
    };

    const weeklyTrend = (summary.weeklyTrend || []).map((row) => Number(row.count) || 0);
    const statusFunnel = {
      submitted: Number(metrics.under_hr_review) || 0,
      under_review: Number(metrics.under_committee_review) || 0,
      resolved: Number(metrics.resolved_cases) || 0,
      rejected: Number(metrics.rejected_cases) || 0,
    };

    const alerts = [
      {
        type: 'high_risk_open',
        label: 'High risk with open complaints',
        count: Number(alertStats.high_risk_open_count) || 0,
      },
      {
        type: 'repeat_no_verdict',
        label: 'Repeat accused profiles without verdict',
        count: Number(alertStats.repeat_without_verdict_count) || 0,
      },
      {
        type: 'high_guilty_rate',
        label: 'Accused profiles with >50% guilty rate',
        count: Number(alertStats.high_guilty_rate_count) || 0,
      },
    ];

    return res.json({
      success: true,
      data: {
        total_today: Number(metrics.total_today) || 0,
        total_yesterday: Number(metrics.total_yesterday) || 0,
        total_month: Number(metrics.total_month) || 0,
        under_hr_review: statusFunnel.submitted,
        under_committee_review: statusFunnel.under_review,
        active_cases: statusFunnel.submitted + statusFunnel.under_review,
        closed_cases: statusFunnel.resolved + statusFunnel.rejected,
        high_risk_cases: Number(metrics.high_risk_cases) || 0,
        stale_cases: Number(metrics.stale_cases) || 0,
        status_funnel: statusFunnel,
        weekly_trend: weeklyTrend,
        pattern_profile_count: Number(profileCount) || 0,
        alerts,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function dashboardDepartmentRisk(req, res, next) {
  try {
    const rows = await complaintModel.listForHrDepartmentRisk();
    const map = new Map();

    for (const item of rows) {
      const decrypted = decryptFields(item, ['location']);
      const key = safeLocation(decrypted.location);
      const existing = map.get(key) || { high: 0, medium: 0, low: 0 };
      const priority = priorityLabel(Number(item.severity_score) || 0);
      existing[priority] += 1;
      map.set(key, existing);
    }

    const data = Array.from(map.entries())
      .map(([name, levels]) => ({
        name,
        high: levels.high,
        medium: levels.medium,
        low: levels.low,
        total: levels.high + levels.medium + levels.low,
      }))
      .sort((a, b) => b.high * 3 + b.medium * 2 + b.low - (a.high * 3 + a.medium * 2 + a.low))
      .slice(0, 5);

    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function saveVerdict(req, res, next) {
  try {
    const { complaintId } = req.params;
    const complaint = await complaintModel.findByReferenceForUser(complaintId, req.user);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const verdict = await verdictModel.upsertVerdict({
      complaint_id: complaint.id,
      verdict: req.body.verdict,
      notes: req.body.notes || null,
      decided_by: req.user.id,
    });

    if (req.body.verdict === 'guilty') {
      await accusedModel.incrementGuiltyCount(complaint.accused_employee_hash);
    }

    await logAuditEvent({
      actorUserId: req.user.id,
      action: 'hr.verdict.upsert',
      userType: 'hr',
      metadata: { complaintCode: complaint.complaint_code, verdict: req.body.verdict },
    });

    return res.json({ success: true, data: verdict });
  } catch (err) {
    return next(err);
  }
}

async function getVerdict(req, res, next) {
  try {
    const verdict = await verdictModel.getVerdictByComplaint(req.params.complaintId, req.user);
    if (!verdict) return res.status(404).json({ success: false, message: 'Verdict not found' });

    return res.json({ success: true, data: verdict });
  } catch (err) {
    return next(err);
  }
}

async function accusedPatterns(req, res, next) {
  try {
    const list = await accusedModel.listAccusedPatterns();
    return res.json({ success: true, data: list });
  } catch (err) {
    return next(err);
  }
}

async function patternInsights(req, res, next) {
  try {
    const results = await Promise.allSettled([
      accusedModel.getRiskDistribution(),
      accusedModel.getStatusFunnel(),
      accusedModel.getSeverityRiskMatrix(),
      accusedModel.getAccusedConversion(),
      accusedModel.getMedianVerdictHours(),
      accusedModel.getHighRiskWatchlist(),
      accusedModel.getPatternAlertStats(),
    ]);

    const getArray = (index) =>
      results[index].status === 'fulfilled' && Array.isArray(results[index].value)
        ? results[index].value
        : [];
    const getValue = (index, fallback = null) =>
      results[index].status === 'fulfilled' ? results[index].value : fallback;

    const riskDistributionRows = getArray(0);
    const statusFunnelRows = getArray(1);
    const severityRiskMatrixRows = getArray(2);
    const accusedConversionRows = getArray(3);
    const medianVerdictHours = getValue(4, null);
    const watchlistRows = getArray(5);
    const alertStats = getValue(6, {
      high_risk_open_count: 0,
      repeat_without_verdict_count: 0,
      high_guilty_rate_count: 0,
    });

    const risk_distribution = {
      low: 0,
      medium: 0,
      high: 0,
    };
    for (const row of riskDistributionRows) {
      if (row.risk_level in risk_distribution) {
        risk_distribution[row.risk_level] = row.count;
      }
    }

    const status_funnel = {
      submitted: 0,
      under_review: 0,
      resolved: 0,
      rejected: 0,
    };
    for (const row of statusFunnelRows) {
      if (row.status in status_funnel) {
        status_funnel[row.status] = row.count;
      }
    }

    const severity_risk_matrix = severityRiskMatrixRows.map((row) => ({
      severity_bucket: row.severity_bucket,
      risk_level: row.risk_level,
      count: row.count,
    }));

    const accused_conversion = accusedConversionRows.map((row) => ({
      accused_employee_hash: row.accused_employee_hash,
      total_complaints: row.total_complaints,
      complaints_with_verdict: row.complaints_with_verdict,
      guilty_verdicts: row.guilty_verdicts,
      guilty_rate: row.guilty_rate === null ? null : Number(row.guilty_rate),
    }));

    const alerts = [
      {
        type: 'high_risk_open',
        label: 'High risk with open complaints',
        count: Number(alertStats.high_risk_open_count) || 0,
      },
      {
        type: 'repeat_no_verdict',
        label: 'Repeat accused profiles without verdict',
        count: Number(alertStats.repeat_without_verdict_count) || 0,
      },
      {
        type: 'high_guilty_rate',
        label: 'Accused profiles with >50% guilty rate',
        count: Number(alertStats.high_guilty_rate_count) || 0,
      },
    ];

    return res.json({
      success: true,
      data: {
        risk_distribution,
        status_funnel,
        severity_risk_matrix,
        accused_conversion,
        median_verdict_hours: medianVerdictHours === null ? null : Number(medianVerdictHours),
        watchlist: watchlistRows,
        alerts,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  queue,
  dashboardOverview,
  dashboardDepartmentRisk,
  saveVerdict,
  getVerdict,
  accusedPatterns,
  patternInsights,
};
