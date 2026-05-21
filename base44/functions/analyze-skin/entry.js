const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const { frontImage, rightImage, leftImage } = body;

    if (!frontImage) {
      return new Response(
        JSON.stringify({ error: 'At least frontImage is required', analysis: null }),
        { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    const content = buildContent(frontImage, rightImage, leftImage);
    const result = await callClaudeWithRetry(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, analysis: null }),
      { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    );
  }
});

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-base44-auth'
  };
}

function buildContent(frontImage, rightImage, leftImage) {
  const images = [];

  function addImage(dataUri, label) {
    if (!dataUri) return;
    const mediaType = dataUri.split(';')[0].split(':')[1] || 'image/jpeg';
    const base64Data = dataUri.split(',')[1];
    if (!base64Data) return;
    images.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } });
  }

  addImage(frontImage, 'front');
  addImage(rightImage, 'right');
  addImage(leftImage, 'left');

  return [...images, { type: 'text', text: SYSTEM_PROMPT }];
}

const SYSTEM_PROMPT = `You are a dermatology-trained AI assistant specializing in Indian skin types (Fitzpatrick IV-VI).

Three face angles are provided: front, right profile, left profile. Cross-reference all three for holistic analysis.

For each concern found, return:
- concern: acne|pigmentation|redness|texture|oiliness|dryness|enlarged_pores|fine_lines
- confidence: 0-100 (conservative)
- severity: mild|moderate|severe
- location: specific facial area
- notes: brief clinical observation

CONSIDER:
- Pigmentation patterns common in Indian skin: PIH from acne, melasma, sun spots
- Acne presentation in darker skin tones (often more inflammatory PIH)
- Texture variation across T-zone vs cheeks
- Hydration levels relative to climate exposure

RULES:
1. Be conservative — if not clearly visible, low confidence or skip
2. Cross-reference all 3 angles (some concerns visible only from profile)
3. Note image quality issues in image_quality_notes field
4. Return ONLY valid JSON — no markdown, no commentary

Return:
{
  "detected_concerns": [{ "concern": string, "confidence": number, "severity": string, "location": string, "notes": string }],
  "overall_skin_assessment": { "estimated_skin_type": string, "overall_condition": string, "hydration_level": string },
  "analysis_confidence": number,
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
