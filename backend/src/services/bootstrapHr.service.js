const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const logger = require('../utils/logger');

const DEFAULT_BOOTSTRAP_HR_EMAIL = 'hr@gmail.com';
const DEFAULT_BOOTSTRAP_HR_PASSWORD = 'hr@123';
const DEFAULT_BOOTSTRAP_HR_NAME = 'HR Manager';
const DEFAULT_BOOTSTRAP_HR_ROLE = 'hr';

async function ensureBootstrapHrUser() {
  const email = (process.env.BOOTSTRAP_HR_EMAIL || DEFAULT_BOOTSTRAP_HR_EMAIL).trim().toLowerCase();
  const password = process.env.BOOTSTRAP_HR_PASSWORD || DEFAULT_BOOTSTRAP_HR_PASSWORD;
  const name = process.env.BOOTSTRAP_HR_NAME || DEFAULT_BOOTSTRAP_HR_NAME;
  const role = process.env.BOOTSTRAP_HR_ROLE || DEFAULT_BOOTSTRAP_HR_ROLE;

  const passwordHash = await bcrypt.hash(password, 12);

  await query(
    `INSERT INTO hr_users (name, email, password_hash, role, two_factor_enabled)
     VALUES ($1, $2, $3, $4, false)
     ON CONFLICT (email)
     DO UPDATE SET
       name = EXCLUDED.name,
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role,
       two_factor_enabled = false`,
    [name, email, passwordHash, role]
  );

  logger.info('Bootstrap HR user ensured', { email, role, otpBypassed: true });
}

module.exports = {
  ensureBootstrapHrUser,
  DEFAULT_BOOTSTRAP_HR_EMAIL,
};
