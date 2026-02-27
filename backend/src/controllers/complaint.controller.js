const complaintModel = require('../models/complaint.model');
const accusedModel = require('../models/accused.model');
const generateComplaintId = require('../utils/generateComplaintId');
const { encryptFields, decryptFields } = require('../services/encryption.service');
const { scoreCredibility } = require('../services/credibility.service');
const { logAuditEvent } = require('../services/audit.service');

function toUserType(role) {
  return role === 'reporter' ? 'anon' : 'hr';
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
    return res.json({ success: true, data: decryptedRows });
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

    return res.json({ success: true, data: decrypted });
  } catch (err) {
    return next(err);
  }
}

async function updateComplaintStatus(req, res, next) {
  try {
    const updated = await complaintModel.updateStatusByHr(req.params.complaintId, req.body.status);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await logAuditEvent({
      actorUserId: req.user.id,
      action: 'complaint.status.update',
      userType: toUserType(req.user.role),
      metadata: { complaintCode: updated.complaint_code, status: req.body.status },
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
