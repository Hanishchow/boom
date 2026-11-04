import { base44 } from '@/api/base44Client';

// Rule set: Acne Severity Triage Guide (uploaded reference file)
export const TRIAGE_GUIDE_TEXT = `# Acne Severity Triage Guide
Purpose: after a face scan, classify acne into exactly one tier so the app routes the user down ONE path only.

## Tiers
### Tier 1: MILD (route: off-the-shelf suggestions)
- Mostly blackheads/whiteheads (comedones), occasional small red bumps
- Fewer than ~20 lesions total on the face
- No visible swelling, no deep lumps, no scarring
- Skin otherwise intact

### Tier 2: MODERATE (route: off-the-shelf suggestions + soft note)
- Many papules and pustules, roughly 20-50 lesions
- Spread across more than one facial zone (cheeks + forehead + chin)
- Mild redness or post-acne marks, no deep lumps

### Tier 3: SEVERE (route: dermatologist flow ONLY)
Classify as SEVERE if ANY of these are visible:
- Nodules or cysts (large, deep, swollen, painful-looking lumps)
- 50+ inflammatory lesions
- Widespread inflammation or intense redness across large facial areas
- Active scarring (pitted/ice-pick, boxcar, or raised scars) alongside active breakouts
- Lesions that look infected (yellow crusting, oozing, spreading redness)
- Acne covering face and extending to neck/jawline heavily

## Rules
1. When unsure between Moderate and Severe, choose SEVERE (be conservative).
2. Never show off-the-shelf product suggestions for Tier 3.
3. Never show dermatologist/map/booking for Tier 1.
4. Tier 2 shows products plus the soft dermatologist note (no map, no booking).
5. The scan is a screening aid, not a medical diagnosis. Always include a disclaimer.

## Required output format
{ condition, severity_tier, lesion_estimate, key_findings, affected_zones, confidence }`;

const SCHEMA = {
  type: 'object',
  properties: {
    condition: { type: 'string' },
    severity_tier: { type: 'string', enum: ['mild', 'moderate', 'severe'] },
    lesion_estimate: { type: 'number' },
    key_findings: { type: 'array', items: { type: 'string' } },
    affected_zones: { type: 'array', items: { type: 'string' } },
    topics_to_discuss: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number' }
  },
  required: ['severity_tier']
};

/**
 * Classify acne severity using the triage guide as the rule set.
 * Uses the LLM with the front scan image when available; otherwise falls back
 * to deriving a tier from the detected concerns.
 *
 * @param {Object} params
 * @param {string} [params.frontImageSignedUrl] - signed URL of the front scan photo
 * @param {Array}  [params.detectedConcerns]    - AI-detected concerns with severity
 * @param {Object} [params.questionnaireData]   - questionnaire responses
 * @returns {Promise<Object>} triage result
 */
export async function classifyAcneSeverity({ frontImageSignedUrl, detectedConcerns = [], questionnaireData = null }) {
  if (frontImageSignedUrl) {
    try {
      const prompt = `You are an acne severity triage assistant. Look at the attached face photo and classify the acne into exactly one tier: mild, moderate, or severe. Use ONLY the rules in the TRIAGE GUIDE below. When unsure between moderate and severe, choose SEVERE (be conservative). Return only the JSON object.

TRIAGE GUIDE:
${TRIAGE_GUIDE_TEXT}

User-reported skin concerns: ${JSON.stringify((questionnaireData?.concerns) || [])}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [frontImageSignedUrl],
        response_json_schema: SCHEMA
      });

      if (result?.severity_tier) {
        return {
          severity_tier: result.severity_tier,
          lesion_estimate: result.lesion_estimate ?? 0,
          key_findings: result.key_findings || [],
          affected_zones: result.affected_zones || [],
          topics_to_discuss: result.topics_to_discuss || [],
          confidence: result.confidence ?? 0,
          scan_date: new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn('Severity LLM classification failed, using fallback:', err);
    }
  }
  return deriveFromConcerns(detectedConcerns, questionnaireData);
}

function deriveFromConcerns(detectedConcerns = [], questionnaireData = null) {
  const concerns = detectedConcerns.map(c => (c.concern || '').toLowerCase());
  const severities = detectedConcerns.map(c => (c.severity || '').toLowerCase());
  const hasAcne = concerns.some(c => /acne|pimple|cyst|nodule|comedo|blackhead|whitehead/.test(c));
  const hasSevere = severities.includes('severe');
  const hasModerate = severities.includes('moderate');
  const userConcernsAcne = (questionnaireData?.concerns || []).some(c => /acne/i.test(c));

  let tier = 'mild';
  if (hasSevere) tier = 'severe';
  else if (hasModerate || (hasAcne && userConcernsAcne)) tier = 'moderate';
  else if (hasAcne) tier = 'moderate';

  return {
    severity_tier: tier,
    lesion_estimate: tier === 'severe' ? 50 : tier === 'moderate' ? 25 : 10,
    key_findings: hasAcne ? ['Acne-related lesions detected'] : ['No severe acne indicators detected'],
    affected_zones: detectedConcerns.map(c => c.location).filter(Boolean).slice(0, 5),
    topics_to_discuss: tier === 'severe'
      ? ['Possible nodulocystic acne', 'Scarring risk', 'Prescription treatment options']
      : [],
    confidence: 0.5,
    scan_date: new Date().toISOString()
  };
}