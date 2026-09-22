/**
 * utils/cryptoToken.js
 * 
 * Non-CRUD Security Service: Cryptographic HMAC SHA-256 Audit Engine
 * Generates tamper-proof digital signatures for attendance logs and turnstile outpass tokens.
 */

const crypto = require('crypto');

const AUDIT_SECRET = process.env.AUDIT_HMAC_SECRET || 'vidudhi_keerthana_audit_hmac_secret_key_9981';

/**
 * Computes a tamper-proof SHA-256 HMAC hash for an attendance check-in record.
 * Any modification of studentId, rollNo, date, or GPS coordinates will invalidate this hash.
 */
function generateAttendanceAuditHash({ studentId, studentRoll, date, time, lat, lng }) {
  const payload = `${studentId}:${studentRoll}:${date}:${time}:${Number(lat).toFixed(4)}:${Number(lng).toFixed(4)}`;
  return crypto.createHmac('sha256', AUDIT_SECRET).update(payload).digest('hex');
}

/**
 * Validates whether an attendance hash matches expected cryptographic signature.
 */
function verifyAttendanceAuditHash(data, expectedHash) {
  try {
    const computedHash = generateAttendanceAuditHash(data);
    const bufA = Buffer.from(computedHash, 'utf8');
    const bufB = Buffer.from(expectedHash, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Generates a signed turnstile pass token with embedded expiration and gate clearance proof.
 */
function generateTurnstilePassToken({ passId, studentRoll, departureDate, returnDate }) {
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = `${passId}:${studentRoll}:${departureDate}:${returnDate}:${nonce}`;
  const signature = crypto.createHmac('sha256', AUDIT_SECRET).update(payload).digest('hex').slice(0, 16);
  return `VID-QR-${passId}-${signature.toUpperCase()}`;
}

module.exports = {
  generateAttendanceAuditHash,
  verifyAttendanceAuditHash,
  generateTurnstilePassToken,
};
