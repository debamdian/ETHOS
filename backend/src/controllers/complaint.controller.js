const complaintModel = require('../models/complaint.model');
const accusedModel = require('../models/accused.model');
const evidenceModel = require('../models/evidence.model');
const userModel = require('../models/user.model');
const generateComplaintId = require('../utils/generateComplaintId');
const { encryptFields, decryptFields } = require('../services/encryption.service');
const { scoreCredibility, calculateCredibilityDelta } = require('../services/credibility.service');
const { logAuditEvent } = require('../services/audit.service');
const { ApiError } = require('../middlewares/error.middleware');

const STRONG_EVIDENCE_MIN_FILES = 2;
const { evaluateAndPersistSuspiciousCluster } = require('../services/suspiciousCluster.service');

function toUserType(role) {
  return role === 'reporter' ? 'anon' : 'hr';
}

function sanitizeForReporter(complaint) {
  const { rejection_type, ...rest } = complaint;
  return rest;
}

function normalizeRejectionType(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

async function createComplaint(req, res, next) {
  try {
    const payload = req.body;

    const credibility = scoreCredibility({
      description: payload.description,
      evidenceCount: Number(payload.evidence_count || 0),
      hasWitness: Boolean(payload.has_witness),
    });

    const encryptedPayload = encryptFields(payload, ['description', 'location']);

    const complaint = await complaintModel.createComplaint({
      complaint_code: generateComplaintId(),
      anon_user_id: req.user.id,
      accused_employee_hash: payload.accused_employee_hash,
      incident_date: payload.incident_date,
      location: encryptedPayload.location || null,
      description: encryptedPayload.description,
      status: 'submitted',
      severity_score: credibility.score,
    });

    await accusedModel.incrementComplaintCount(payload.accused_employee_hash);
    await evaluateAndPersistSuspiciousCluster({
      complaintId: complaint.id,
      accusedEmployeeHash: payload.accused_employee_hash,
      deviceFingerprint: req.ipFingerprint || null,
    });

    await logAuditEvent({
      actorUserId: req.user.id,
      action: 'complaint.create',
      userType: 'anon',
      metadata: { complaintCode: complaint.complaint_code },
    });

    return res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (err) {
    return next(err);
  }
}

async function listComplaints(req, res, next) {
  try {
    const rows = req.user.role === 'reporter'
      ? await complaintModel.listForReporter(req.user.id)
      : await complaintModel.listForHr();

    const decryptedRows = rows.map((item) => decryptFields(item, ['description', 'location']));
    const responseRows = req.user.role === 'reporter'
      ? decryptedRows.map(sanitizeForReporter)
      : decryptedRows;
    return res.json({ success: true, data: responseRows });
  } catch (err) {
    return next(err);
  }
}

async function getComplaint(req, res, next) {
  try {
    const complaint = await complaintModel.findByReferenceForUser(req.params.complaintId, req.user);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const decrypted = decryptFields(complaint, ['description', 'location']);
    const responseData = req.user.role === 'reporter' ? sanitizeForReporter(decrypted) : decrypted;

    return res.json({ success: true, data: responseData });
  } catch (err) {
    return next(err);
  }
}

async function updateComplaintStatus(req, res, next) {
  try {
    const complaint = await complaintModel.findByReferenceForUser(req.params.complaintId, req.user);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const nextStatus = req.body.status;
    const rejectionType = normalizeRejectionType(req.body.rejection_type);

    if (nextStatus === 'rejected' && !rejectionType) {
      throw new ApiError(400, 'rejection_type is required when status is rejected');
    }

    if (nextStatus !== 'rejected' && rejectionType) {
      throw new ApiError(400, 'rejection_type must be null unless status is rejected');
    }

    const statusChanged = complaint.status !== nextStatus;
    const updated = await complaintModel.updateStatusByHr(
      req.params.complaintId,
      nextStatus,
      nextStatus === 'rejected' ? rejectionType : null
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    let credibilityDelta = 0;
    if (statusChanged && (nextStatus === 'resolved' || nextStatus === 'rejected')) {
      const evidenceCount = await evidenceModel.countEvidenceByComplaintId(updated.id);
      const strongEvidence = evidenceCount >= STRONG_EVIDENCE_MIN_FILES;
      credibilityDelta = calculateCredibilityDelta({
        nextStatus,
        rejectionType: nextStatus === 'rejected' ? rejectionType : null,
        strongEvidence,
      });

      if (credibilityDelta !== 0) {
        await userModel.adjustAnonCredibility(updated.anon_user_id, credibilityDelta);
      }
    }

    await logAuditEvent({
      actorUserId: req.user.id,
      action: 'complaint.status.update',
      userType: toUserType(req.user.role),
      metadata: {
        complaintCode: updated.complaint_code,
        status: nextStatus,
        rejectionType: nextStatus === 'rejected' ? rejectionType : null,
        credibilityDelta,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createComplaint,
  listComplaints,
  getComplaint,
  updateComplaintStatus,
};
