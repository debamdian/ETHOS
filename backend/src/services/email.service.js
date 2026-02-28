const { Resend } = require('resend');
const { ApiError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');

const resendApiKey = process.env.RESEND_API_KEY;
let resendClient = null;

if (resendApiKey) {
  resendClient = new Resend(resendApiKey);
} else {
  logger.warn('RESEND_API_KEY is not configured; HR OTP emails are disabled.');
}

function getExpiryMinutes(expiresAt) {
  const deltaMs = expiresAt - Date.now();
  const minutes = Math.ceil(deltaMs / 60000);
  return minutes > 0 ? minutes : 1;
}

function buildOtpEmailBodies({ name, otp, expiresAt }) {
  const friendlyName = name || 'HR team';
  const expiresInMinutes = getExpiryMinutes(expiresAt);
  const minutesLabel = `${expiresInMinutes} minute${expiresInMinutes === 1 ? '' : 's'}`;

  const textBody = `Hi ${friendlyName},\n\n` +
    `To complete your sign-in, please use the One-Time Password (OTP) below:\n\n` +
    `${otp}\n\n` +
    `This code is valid for ${minutesLabel}.\n\n` +
    `For security reasons, please do not share this code with anyone.\n` +
    `If you did not request this verification, you can safely ignore this email.\n\n` +
    `If you need assistance, feel free to contact our support team.\n\n` +
    `Best regards,\n` +
    `Team ETHOS\n` +
    `ethos@mimosa.chat`;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f5f7fb; padding:32px 0;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:16px; border-top:5px solid #2563eb; box-shadow:0 15px 35px rgba(15,23,42,0.12); padding:32px 36px; color:#0f172a;">
        <p style="font-size:15px; color:#475569; margin:0 0 16px;">Hi ${friendlyName},</p>
        <p style="font-size:16px; margin:0 0 20px;">To complete your sign-in, please use the One-Time Password (OTP) below:</p>
        <div style="background:linear-gradient(135deg,#1d4ed8,#0f172a); color:#f8fafc; font-size:30px; font-weight:600; letter-spacing:10px; text-align:center; padding:20px 0; border-radius:12px; margin-bottom:24px;">${otp}</div>
        <p style="margin:0 0 16px;">This code is valid for <strong>${minutesLabel}</strong>.</p>
        <p style="margin:0 0 16px;">For security reasons, please do not share this code with anyone. If you did not request this verification, you can safely ignore this email.</p>
        <p style="margin:0 0 24px;">If you need assistance, feel free to contact our support team.</p>
        <p style="margin:0; font-size:15px; color:#475569;">Best regards,<br/><strong>Team ETHOS</strong><br/><a href="mailto:ethos@mimosa.chat" style="color:#2563eb; text-decoration:none;">ethos@mimosa.chat</a></p>
      </div>
    </div>
  `;

  return { textBody, htmlBody };
}

async function sendHrOtpEmail({ to, otp, expiresAt, name }) {
  if (!resendClient) {
    throw new ApiError(500, 'OTP email service is not configured.');
  }

  const from = process.env.HR_OTP_FROM_EMAIL;
  if (!from) {
    logger.error('HR_OTP_FROM_EMAIL is not configured; cannot send OTP emails.');
    throw new ApiError(500, 'OTP email sender is not configured.');
  }

  if (!to) {
    throw new ApiError(400, 'Recipient email address is required.');
  }

  const subject = process.env.HR_OTP_EMAIL_SUBJECT || 'Your ETHOS login verification code';
  const { textBody, htmlBody } = buildOtpEmailBodies({ name, otp, expiresAt });

  try {
    await resendClient.emails.send({
      from,
      to,
      subject,
      text: textBody,
      html: htmlBody,
    });
  } catch (error) {
    logger.error('Failed to send HR OTP email via Resend.', {
      error: error.message,
      name: error.name,
      statusCode: error.statusCode,
    });
    throw new ApiError(502, 'Failed to deliver OTP email. Please try again.');
  }
}

module.exports = {
  sendHrOtpEmail,
};
