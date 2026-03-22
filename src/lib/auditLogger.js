/**
 * Audit Logger
 * Logs sensitive user actions to AuditLog entity for security monitoring.
 * Only logs metadata — never raw PII, image URLs, or sensitive field values.
 */
import { base44 } from '@/api/base44Client';

/**
 * Log a security-relevant action.
 * Safe to call fire-and-forget (does not throw).
 */
export async function logAuditEvent({ action, resourceType = '', resourceId = '', metadata = {}, success = true }) {
  try {
    const user = await base44.auth.me();
    const safeMetadata = sanitizeMetadataForLog(metadata);

    await base44.entities.AuditLog.create({
      user_id: user?.id || 'unknown',
      user_email: user?.email || 'unknown',
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: JSON.stringify(safeMetadata),
      success
    });
  } catch (_) {
    // Audit logging must never break the main flow
  }
}

/**
 * Strip any fields that could contain PII or sensitive data from audit metadata.
 */
function sanitizeMetadataForLog(obj) {
  const BLOCKED_KEYS = [
    'email', 'dob', 'date_of_birth', 'name', 'full_name',
    'face_image_url', 'front_image_url', 'right_image_url', 'left_image_url',
    'file_url', 'signed_url', 'image_url',
    'password', 'token', 'api_key'
  ];
  const safe = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (!BLOCKED_KEYS.includes(k.toLowerCase())) {
      safe[k] = typeof v === 'object' ? '[object]' : v;
    }
  }
  return safe;
}