import { createClientFromRequest } from "npm:@base44/sdk";

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const rateLimitMap = new Map();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  try {
    // Authenticate
    let base44;
    try {
      base44 = createClientFromRequest(req);
    } catch {
      return jsonResponse({ error: 'Unauthorized: invalid auth context' }, 401);
    }

    const user = await base44.auth.me();
    if (!user || !user.email) {
      return jsonResponse({ error: 'Unauthorized: authentication required' }, 401);
    }

    const userId = user.email;

    // Rate limit
    if (!checkRateLimit(userId)) {
      console.warn(`[analyze-skin] Rate limit exceeded for ${userId}`);
      return jsonResponse({ error: 'Rate limit exceeded. Max 3 analyses per hour.' }, 429);
    }

    const body = await req.json();
    const { frontImage, rightImage, leftImage } = body;

    // Validate input
    if (!frontImage) {
      return jsonResponse({ error: 'frontImage is required' }, 400);
    }

    const validationError = validateImages({ frontImage, rightImage, leftImage });
    if (validationError) {
      return jsonResponse({ error: validationError }, 400);
    }

    const content = buildContent(frontImage, rightImage, leftImage);
    const result = await callClaudeWithRetry(content);

    console.log(`[analyze-skin] Success for ${userId}: ${result.detected_concerns?.length || 0} concerns, confidence ${result.analysis_confidence}`);

    return jsonResponse(result);

  } catch (error) {
    console.error(`[analyze-skin] Error: ${error.message}`);
    return jsonResponse({ error: error.message, analysis: null }, 500);
  }
});

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
  });
}

function corsHeaders(req) {
  const origin = req?.headers?.get?.('Origin') || '';
  const ALLOWED_ORIGINS = [
    'https://app.base44.com',
    'https://www.base44.com',
    '',
    'null'
  ];

  const allowOrigin = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.base44.app')
    ? origin
    : 'null';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-base44-auth',
    'Access-Control-Max-Age': '86400'
  };
}

function checkRateLimit(userId) {
  const now = Date.now();
  const entries = rateLimitMap.get(userId) || [];
  const recent = entries.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) return false;

  recent.push(now);
  rateLimitMap.set(userId, recent);
  return true;
}

function validateImages(images) {
  for (const [key, dataUri] of Object.entries(images)) {
    if (!dataUri) continue;

    if (!dataUri.startsWith('data:image/')) {
      return `${key}: invalid image format — must be a data URI starting with data:image/`;
    }

    const base64Data = dataUri.split(',')[1];
    if (!base64Data) {
      return `${key}: empty image data`;
    }

    const sizeBytes = Math.ceil(base64Data.length * 0.75);
    if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
      return `${key}: image exceeds 10MB limit`;
    }
  }
  return null;
}

function buildContent(frontImage, rightImage, leftImage) {
  const images = [];

  function addImage(dataUri) {
    if (!dataUri) return;
    const mediaType = dataUri.split(';')[0].split(':')[1] || 'image/jpeg';
    const base64Data = dataUri.split(',')[1];
    if (!base64Data) return;
    images.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } });
  }

  addImage(frontImage);
  addImage(rightImage);
  addImage(leftImage);

  return [...images, { type: 'text', text: SYSTEM_PROMPT }];
}

const SYSTEM_PROMPT = `You are a senior dermatology AI with 15 years of clinical experience, specializing in Indian skin (Fitzpatrick IV–VI).

You are analyzing 3 selfie angles of ONE person: front, right profile, left profile.

## METHODOLOGY
1. First assess image quality — lighting, blur, shadows, obstructions. Flag issues in image_quality_notes.
2. Scan each angle systematically: forehead → temples → eyes → nose → cheeks → chin → jawline → neck
3. Cross-reference findings across all 3 angles — a concern visible on right profile but not front means it's real, not just a shadow
4. For each suspected concern, ask yourself: "Would I confidently tell a patient this to their face?" If no, lower confidence or skip.

## CLINICAL GUIDELINES FOR INDIAN SKIN (Fitzpatrick IV–VI)

### Pigmentation (most common concern)
- PIH (post-inflammatory hyperpigmentation): dark flat spots, usually where acne was. Most common concern.
- Melasma: symmetrical brown/grey patches on cheeks, forehead, upper lip. Worse with sun exposure.
- Sun spots / photo damage: scattered dark spots on sun-exposed areas (cheekbones, nose).
- Perioral pigmentation: darker skin around mouth — common in Indian skin.
- UNDER-diagnose pigmentation if lighting is uneven — shadows mimic dark spots.

### Acne
- Active acne: red papules, pustules, whiteheads/blackheads. Note whether inflammatory (red) or non-inflammatory (comedonal).
- In Indian skin, acne often presents as inflammatory papules with surrounding PIH.
- Rate severity: mild (<10 lesions), moderate (10-30), severe (>30 or cystic).
- Look at jawline and chin for hormonal acne pattern.

### Texture & Pores
- Enlarged pores: visible openings, typically on nose and cheeks (T-zone).
- Rough texture: uneven skin surface, bumpiness.
- Milia: small white keratin cysts — common around eyes in Indian skin.
- Differentiate between actual texture issues and camera compression artifacts.

### Oil & Hydration
- Oily: visible shine, especially T-zone (forehead, nose, chin).
- Dry: flaking, dull patches — more visible on cheeks.
- Dehydrated: fine lines, dullness, tight appearance — NOT the same as dry.
- Indian skin is often combination: oily T-zone with normal/dry cheeks.

### Redness & Sensitivity
- Active redness: diffuse or localized erythema.
- Rosacea: central face redness, flushing — less common in Indian skin but still possible.
- Differentiate between actual redness and skin tone variation.

### Fine Lines & Aging
- Look at crow's feet (outer eyes), forehead lines, nasolabial folds, marionette lines.
- For younger users (<30): focus on prevention. Fine lines are expected.
- For older users: distinguish between dynamic (expression) and static (always present) lines.

## EDGE CASES
- Makeup detected: note it in image_quality_notes and be conservative
- Glasses/spectacles: skip the lens-covered areas
- Facial hair: note coverage percentage — adjust severity expectations
- Poor lighting / motion blur: set analysis_confidence < 30
- Child/teen skin: expect higher oil production, lower aging concern

## SEVERITY RUBRIC
- mild: barely noticeable, only visible on close inspection, early stage
- moderate: clearly visible from conversation distance, warrants treatment
- severe: prominent, extensive coverage, likely affecting quality of life

## CONFIDENCE RUBRIC
- 80-100: clearly visible, confirmed across multiple angles, unambiguous
- 50-79: visible but subtle, or visible in some angles but not all
- 20-49: suspected but uncertain — could be lighting, shadow, or camera artifact
- 0-19: do not include

## OUTPUT RULES
- Return ONLY valid JSON. No greetings, no explanations, no markdown.
- If no concerns are confidently detectable, return an empty detected_concerns array.
- Be conservative. It is better to miss a subtle concern than to falsely identify one.
- For Indian skin: pigmentation over-diagnosis is the #1 error. Be extra careful with lighting.
- If all 3 images are excellent quality, omit image_quality_notes (return null) to save tokens.

## RESPONSE SCHEMA (strict)
{
  "detected_concerns": [
    {
      "concern": "acne" | "pigmentation" | "redness" | "texture" | "oiliness" | "dryness" | "enlarged_pores" | "fine_lines",
      "confidence": integer 0-100,
      "severity": "mild" | "moderate" | "severe",
      "location": string (max 100 chars, specific facial area),
      "notes": string (max 200 chars, clinical observation)
    }
  ],
  "overall_skin_assessment": {
    "estimated_skin_type": "dry" | "oily" | "combination" | "normal" | "sensitive",
    "overall_condition": "healthy" | "minor_concerns" | "needs_attention",
    "hydration_level": "dehydrated" | "adequate" | "well_hydrated"
  },
  "analysis_confidence": integer 0-100,
  "image_quality_notes": string | null
}`;

async function callClaudeWithRetry(content, maxRetries = 3) {
  const apiKey = Deno.env.get('CLAUDE_API_KEY');
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY not set. Configure via: base44 secrets set CLAUDE_API_KEY <your-key>');
  }

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.status === 429 && attempt < maxRetries) {
        const wait = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Claude API ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text || '';

      const parsed = extractJSON(text);
      return parsed;

    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError' && attempt === 0) {
        continue;
      }
      if (attempt >= maxRetries) break;
    }
  }

  throw lastError || new Error('All retries exhausted');
}

function extractJSON(text) {
  try {
    return JSON.parse(text);
  } catch {}

  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1].trim());
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return JSON.parse(objectMatch[0]);
  }

  throw new Error('No valid JSON found in Claude response');
}
