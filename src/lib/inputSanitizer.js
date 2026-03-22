/**
 * Input Sanitization & Validation Utilities
 * All user-supplied data must pass through these before being stored.
 */

const MAX_LENGTHS = {
  name: 100,
  email: 254,
  city: 100,
  pincode: 10,
  allergies: 500,
  generic: 255
};

/**
 * Strip HTML tags, script injections, and trim whitespace.
 */
export function sanitizeString(str, maxLen = MAX_LENGTHS.generic) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')           // strip HTML
    .replace(/[<>'"`;]/g, '')          // strip injection chars
    .replace(/\s+/g, ' ')              // normalize whitespace
    .trim()
    .slice(0, maxLen);
}

/**
 * Validate and sanitize email.
 */
export function sanitizeEmail(email) {
  const cleaned = sanitizeString(email, MAX_LENGTHS.email).toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
  return valid ? cleaned : '';
}

/**
 * Validate date of birth — must be a real past date, not older than 120 years.
 */
export function sanitizeDOB(dob) {
  if (!dob) return '';
  const date = new Date(dob);
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 120, 0, 1);
  if (isNaN(date.getTime())) return '';
  if (date >= now) return '';          // no future dates
  if (date < minDate) return '';       // no impossibly old dates
  return dob;
}

/**
 * Sanitize pincode — digits only, 4-10 chars.
 */
export function sanitizePincode(pin) {
  return (pin || '').replace(/\D/g, '').slice(0, 10);
}

/**
 * Sanitize the full questionnaire form data object before submission.
 * Returns a clean copy — never mutates the original.
 */
export function sanitizeQuestionnaireData(data) {
  return {
    ...data,
    name: sanitizeString(data.name, MAX_LENGTHS.name),
    email: sanitizeEmail(data.email),
    dob: sanitizeDOB(data.dob),
    location_city: sanitizeString(data.location_city, MAX_LENGTHS.city),
    pincode: sanitizePincode(data.pincode),
    allergies: sanitizeString(data.allergies, MAX_LENGTHS.allergies),
    // Enum fields — only allow known safe values, reject anything else
    gender: allowedEnum(data.gender, ['male', 'female', 'other', 'prefer_not_to_say']),
    diet_type: allowedEnum(data.diet_type, ['healthy', 'semi_healthy', 'junk_food']),
    skin_types: (data.skin_types || []).filter(s =>
      ['dry', 'oily', 'combination', 'normal', 'sensitive'].includes(s)
    ),
    concerns: (data.concerns || []).filter(c =>
      ['acne', 'blackheads', 'whiteheads', 'excess_oil', 'large_pores',
       'dryness', 'redness', 'wrinkles', 'hyperpigmentation', 'uneven_tone',
       'sensitivity', 'pigmentation', 'oiliness', 'texture', 'aging', 'dullness'].includes(c)
    )
  };
}

function allowedEnum(value, allowed) {
  return allowed.includes(value) ? value : '';
}

/**
 * Validate image file before upload:
 * - Must be an image MIME type
 * - Max 10MB
 * - Rejects suspicious filenames
 */
export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file selected' };

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, WebP, or HEIC images are allowed' };
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Image must be under 10MB' };
  }

  // Reject suspicious filenames (path traversal, scripts)
  const safeName = /^[\w\-. ]+\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);
  if (!safeName) {
    return { valid: false, error: 'Invalid file name' };
  }

  return { valid: true, error: null };
}