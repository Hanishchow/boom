// AI Skin Analysis Engine - Questionnaire + Image Analysis Logic
import { INDIAN_PHARMACY_PRODUCTS, INGREDIENT_CONFLICTS, CLIMATE_ADJUSTMENTS, BUDGET_FILTERS } from './ProductDatabase';

// Skin concern mappings
const CONCERN_WEIGHTS = {
  acne: { severity_factors: ['frequency', 'type', 'scarring'], max_score: 10 },
  pigmentation: { severity_factors: ['coverage', 'depth', 'age'], max_score: 10 },
  dryness: { severity_factors: ['tightness', 'flaking', 'season'], max_score: 10 },
  oiliness: { severity_factors: ['shine_time', 'pore_visibility', 'breakouts'], max_score: 10 },
  sensitivity: { severity_factors: ['reactions', 'redness', 'products_tried'], max_score: 10 },
  aging: { severity_factors: ['fine_lines', 'elasticity', 'age_group'], max_score: 10 },
  texture: { severity_factors: ['roughness', 'bumps', 'scars'], max_score: 10 },
  redness: { severity_factors: ['frequency', 'triggers', 'visibility'], max_score: 10 }
};

// Climate zone mapping for Indian cities
const CITY_CLIMATE_MAP = {
  // Metro cities
  'mumbai': 'hot_humid',
  'delhi': 'hot_dry',
  'bangalore': 'moderate',
  'bengaluru': 'moderate',
  'chennai': 'hot_humid',
  'kolkata': 'hot_humid',
  'hyderabad': 'hot_dry',
  'pune': 'moderate',
  'ahmedabad': 'hot_dry',
  'jaipur': 'hot_dry',
  // Coastal
  'goa': 'hot_humid',
  'kochi': 'hot_humid',
  'visakhapatnam': 'hot_humid',
  // Northern
  'lucknow': 'hot_dry',
  'chandigarh': 'cold_dry',
  'shimla': 'cold_dry',
  'dehradun': 'cold_dry',
  // Default
  'default': 'moderate'
};

// Pollution levels by city (simplified)
const CITY_POLLUTION_MAP = {
  'delhi': 'high',
  'mumbai': 'moderate',
  'kolkata': 'high',
  'bangalore': 'moderate',
  'chennai': 'moderate',
  'hyderabad': 'moderate',
  'pune': 'moderate',
  'lucknow': 'high',
  'kanpur': 'high',
  'default': 'moderate'
};

// Analyze questionnaire responses
export function analyzeQuestionnaire(responses) {
  const {
    skin_type,
    concerns = [],
    sun_exposure,
    pollution_exposure,
    sleep_quality,
    location_city,
    budget_range,
    age_group,
    gender
  } = responses;

  // Determine climate zone
  const cityLower = (location_city || '').toLowerCase().trim();
  const climate_zone = CITY_CLIMATE_MAP[cityLower] || CITY_CLIMATE_MAP['default'];
  
  // Infer pollution if not provided
  const inferred_pollution = pollution_exposure || CITY_POLLUTION_MAP[cityLower] || 'moderate';

  // Calculate sensitivity score
  let sensitivityPoints = 0;
  if (concerns.includes('sensitivity')) sensitivityPoints += 3;
  if (concerns.includes('redness')) sensitivityPoints += 2;
  if (skin_type === 'sensitive') sensitivityPoints += 3;
  if (concerns.length > 4) sensitivityPoints += 1; // Many concerns = potentially sensitive
  
  const sensitivity_score = sensitivityPoints >= 5 ? 'high' : sensitivityPoints >= 3 ? 'medium' : 'low';

  // AI-adjusted skin type based on climate and concerns
  let ai_adjusted_skin_type = skin_type;
  if (climate_zone === 'hot_humid' && skin_type === 'normal') {
    ai_adjusted_skin_type = 'combination';
  } else if (climate_zone === 'cold_dry' && skin_type === 'normal') {
    ai_adjusted_skin_type = 'dry';
  } else if (climate_zone === 'hot_dry' && concerns.includes('oiliness')) {
    ai_adjusted_skin_type = 'combination'; // Dehydrated oily
  }

  // Prioritize concerns
  const concernPriority = prioritizeConcerns(concerns, age_group, climate_zone);

  return {
    skin_type,
    ai_adjusted_skin_type,
    primary_concerns: concernPriority.slice(0, 2),
    secondary_concerns: concernPriority.slice(2, 4),
    sensitivity_score,
    climate_zone,
    pollution_level: inferred_pollution,
    lifestyle_factors: {
      sun_exposure,
      pollution_exposure: inferred_pollution,
      sleep_quality
    },
    budget_range,
    age_group
  };
}

// Prioritize concerns based on severity and age
function prioritizeConcerns(concerns, age_group, climate_zone) {
  const priorityMap = {
    'under_20': ['acne', 'oiliness', 'texture', 'pigmentation'],
    '20_30': ['acne', 'pigmentation', 'oiliness', 'sensitivity'],
    '30_40': ['pigmentation', 'aging', 'dryness', 'texture'],
    '40_50': ['aging', 'pigmentation', 'dryness', 'texture'],
    'above_50': ['aging', 'dryness', 'pigmentation', 'sensitivity']
  };

  const ageBasedPriority = priorityMap[age_group] || priorityMap['20_30'];
  
  // Sort concerns based on age priority
  return concerns.sort((a, b) => {
    const aIndex = ageBasedPriority.indexOf(a);
    const bIndex = ageBasedPriority.indexOf(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

// Analyze image using AI (returns structured data)
export async function analyzeImageWithAI(imageUrl, invokeAI) {
  if (!imageUrl || !invokeAI) {
    return null;
  }

  const analysisPrompt = `Analyze this face image for skin concerns. You are a dermatology-trained AI assistant.

IMPORTANT: This is NOT a medical diagnosis. Only identify visible, common skin characteristics.

Analyze and identify:
1. Visible acne (pimples, blackheads, whiteheads) - location and approximate severity
2. Pigmentation (dark spots, uneven tone, melasma-like patterns)
3. Visible redness or inflammation
4. Texture issues (roughness, bumps, enlarged pores)
5. Oily/dry zones (T-zone shine, dry patches)
6. General skin condition observations

For each concern found, provide:
- Concern type
- Confidence level (0-100%)
- Severity (mild/moderate/severe)
- Location on face if applicable

Be conservative in assessments. If unsure, mark confidence as low.`;

  const schema = {
    type: "object",
    properties: {
      detected_concerns: {
        type: "array",
        items: {
          type: "object",
          properties: {
            concern: { type: "string", enum: ["acne", "pigmentation", "redness", "texture", "oiliness", "dryness", "enlarged_pores", "fine_lines"] },
            confidence: { type: "number" },
            severity: { type: "string", enum: ["mild", "moderate", "severe"] },
            location: { type: "string" },
            notes: { type: "string" }
          }
        }
      },
      overall_skin_assessment: {
        type: "object",
        properties: {
          estimated_skin_type: { type: "string", enum: ["dry", "oily", "combination", "normal", "sensitive"] },
          overall_condition: { type: "string", enum: ["healthy", "minor_concerns", "needs_attention"] },
          hydration_level: { type: "string", enum: ["dehydrated", "adequate", "well_hydrated"] }
        }
      },
      analysis_confidence: { type: "number" },
      disclaimer: { type: "string" }
    }
  };

  try {
    const result = await invokeAI({
      prompt: analysisPrompt,
      file_urls: [imageUrl],
      response_json_schema: schema
    });
    
    return {
      ...result,
      disclaimer: "This AI analysis is not a medical diagnosis. Please consult a dermatologist for personalized medical advice."
    };
  } catch (error) {
    console.error('Image analysis error:', error);
    return null;
  }
}

// Combine questionnaire and image analysis
export function synthesizeSkinProfile(questionnaireAnalysis, imageAnalysis) {
  const base = { ...questionnaireAnalysis };

  if (imageAnalysis && imageAnalysis.detected_concerns) {
    // Add AI-detected concerns
    base.ai_detected_concerns = imageAnalysis.detected_concerns;

    // Adjust skin type if image suggests differently with high confidence
    if (imageAnalysis.overall_skin_assessment && imageAnalysis.analysis_confidence > 70) {
      const imageSkinType = imageAnalysis.overall_skin_assessment.estimated_skin_type;
      if (imageSkinType !== base.skin_type) {
        // Create hybrid assessment
        base.ai_adjusted_skin_type = imageSkinType;
      }
    }

    // Add high-confidence image concerns to primary concerns
    const highConfidenceConcerns = imageAnalysis.detected_concerns
      .filter(c => c.confidence > 60)
      .map(c => c.concern);
    
    const allConcerns = [...new Set([...base.primary_concerns, ...highConfidenceConcerns])];
    base.primary_concerns = allConcerns.slice(0, 3);
    base.secondary_concerns = allConcerns.slice(3, 5);

    // Adjust sensitivity if redness detected
    const rednessDetected = imageAnalysis.detected_concerns.find(c => c.concern === 'redness' && c.confidence > 50);
    if (rednessDetected && base.sensitivity_score === 'low') {
      base.sensitivity_score = 'medium';
    }
  }

  return base;
}

// Generate personalized routine
export function generateRoutine(skinProfile) {
  const {
    ai_adjusted_skin_type,
    primary_concerns,
    secondary_concerns,
    sensitivity_score,
    climate_zone,
    age_group
  } = skinProfile;

  const morningRoutine = [];
  const eveningRoutine = [];
  const weeklyRoutine = [];
  const warnings = [];

  // Step 1: Morning Cleanser
  morningRoutine.push({
    step_number: 1,
    product_type: 'cleanser',
    purpose: 'Remove overnight oil and prep skin',
    instructions: sensitivity_score === 'high' 
      ? 'Use lukewarm water with gentle cleanser. Pat dry.'
      : 'Massage gently for 30-60 seconds. Rinse with lukewarm water.',
    dos: ['Use lukewarm water', 'Be gentle around eyes', 'Pat dry with clean towel'],
    donts: ['Use hot water', 'Scrub harshly', 'Leave cleanser on too long'],
    duration: '1-2 minutes'
  });

  // Step 2: Toner (optional for some skin types)
  if (ai_adjusted_skin_type === 'oily' || ai_adjusted_skin_type === 'combination') {
    morningRoutine.push({
      step_number: 2,
      product_type: 'toner',
      purpose: 'Balance skin pH and minimize pores',
      instructions: 'Apply with cotton pad or pat into skin with hands.',
      dos: ['Use alcohol-free toner', 'Apply while skin is slightly damp'],
      donts: ['Use toners with high alcohol content', 'Over-apply'],
      duration: '30 seconds'
    });
  }

  // Step 3: Serum (AM)
  if (primary_concerns.includes('pigmentation') || primary_concerns.includes('dullness')) {
    morningRoutine.push({
      step_number: morningRoutine.length + 1,
      product_type: 'serum',
      purpose: 'Target pigmentation and brighten skin',
      instructions: 'Apply 3-4 drops to face and neck. Allow to absorb.',
      dos: ['Apply to clean, slightly damp skin', 'Follow with sunscreen'],
      donts: ['Mix with retinol', 'Skip sunscreen after Vitamin C'],
      duration: '1-2 minutes for absorption'
    });
    warnings.push('Vitamin C serums increase sun sensitivity - sunscreen is mandatory');
  } else if (primary_concerns.includes('oiliness') || primary_concerns.includes('acne')) {
    morningRoutine.push({
      step_number: morningRoutine.length + 1,
      product_type: 'serum',
      purpose: 'Control oil and minimize pores',
      instructions: 'Apply thin layer of niacinamide serum.',
      dos: ['Start with lower concentration', 'Apply evenly'],
      donts: ['Layer too many actives'],
      duration: '1 minute'
    });
  }

  // Step 4: Moisturizer (AM)
  morningRoutine.push({
    step_number: morningRoutine.length + 1,
    product_type: 'moisturizer',
    purpose: 'Hydrate and protect skin barrier',
    instructions: climate_zone === 'hot_humid'
      ? 'Use lightweight gel or lotion formula.'
      : 'Use cream suitable for your skin type.',
    dos: ['Apply while skin is slightly damp', 'Include neck area'],
    donts: ['Skip this step even for oily skin', 'Use heavy creams in humid weather'],
    duration: '1 minute'
  });

  // Step 5: Sunscreen (AM) - MANDATORY
  morningRoutine.push({
    step_number: morningRoutine.length + 1,
    product_type: 'sunscreen',
    purpose: 'Protect from UV damage - most important anti-aging step',
    instructions: 'Apply generously (2 finger lengths for face). Reapply every 2-3 hours if outdoors.',
    dos: ['Apply as last skincare step', 'Reapply if sweating', 'Use SPF 30+'],
    donts: ['Skip on cloudy days', 'Use expired sunscreen', 'Apply too little'],
    duration: '1 minute application'
  });
  warnings.push('Sunscreen is NON-NEGOTIABLE. UV damage causes premature aging and worsens pigmentation.');

  // EVENING ROUTINE
  
  // Step 1: Cleanser (PM) - Double cleanse if wearing sunscreen
  eveningRoutine.push({
    step_number: 1,
    product_type: 'cleanser',
    purpose: 'Remove sunscreen, makeup, and day\'s grime',
    instructions: 'First use micellar water/cleansing oil, then regular cleanser.',
    dos: ['Double cleanse to remove sunscreen properly', 'Be thorough but gentle'],
    donts: ['Sleep with sunscreen on', 'Use harsh scrubbing motions'],
    duration: '2-3 minutes'
  });

  // Step 2: Treatment serum (PM)
  if (age_group === '30_40' || age_group === '40_50' || age_group === 'above_50') {
    if (sensitivity_score !== 'high') {
      eveningRoutine.push({
        step_number: 2,
        product_type: 'serum',
        purpose: 'Anti-aging and cell turnover',
        instructions: 'Start with low concentration retinol (0.3%). Use 2-3x per week initially.',
        dos: ['Start slow', 'Always follow with moisturizer', 'Use only at night'],
        donts: ['Use with AHA/BHA on same night', 'Use around eyes without specific eye retinol', 'Use daily initially'],
        duration: '1 minute'
      });
      warnings.push('Retinol increases sun sensitivity. Never skip morning sunscreen.');
      warnings.push('Do NOT use retinol with benzoyl peroxide or AHA/BHA on the same night.');
    }
  }

  if (primary_concerns.includes('acne') && sensitivity_score !== 'high') {
    eveningRoutine.push({
      step_number: eveningRoutine.length + 1,
      product_type: 'spot_treatment',
      purpose: 'Target active breakouts',
      instructions: 'Apply small amount directly on pimples only.',
      dos: ['Use on active spots only', 'Apply thin layer'],
      donts: ['Apply all over face', 'Use with retinol on same night'],
      duration: '30 seconds'
    });
  }

  if (primary_concerns.includes('dryness') || ai_adjusted_skin_type === 'dry') {
    eveningRoutine.push({
      step_number: eveningRoutine.length + 1,
      product_type: 'serum',
      purpose: 'Deep hydration',
      instructions: 'Apply hyaluronic acid serum to damp skin.',
      dos: ['Apply to damp skin', 'Follow with moisturizer to seal'],
      donts: ['Apply to dry skin', 'Use alone without moisturizer on top'],
      duration: '1 minute'
    });
  }

  // Night moisturizer
  eveningRoutine.push({
    step_number: eveningRoutine.length + 1,
    product_type: 'moisturizer',
    purpose: 'Overnight repair and hydration',
    instructions: 'Apply slightly richer moisturizer than morning.',
    dos: ['Be more generous at night', 'Include under-eye area gently'],
    donts: ['Use same thin texture as morning if skin is dry'],
    duration: '1-2 minutes'
  });

  // WEEKLY ROUTINE
  if (sensitivity_score !== 'high') {
    weeklyRoutine.push({
      day: 'Once or twice weekly',
      treatment_type: 'exfoliation',
      purpose: 'Remove dead skin cells, improve texture',
      instructions: 'Use chemical exfoliant (AHA/BHA) in evening. Skip retinol on exfoliation nights.',
      frequency: ai_adjusted_skin_type === 'sensitive' ? 'Once a week' : 'Twice a week max'
    });
    warnings.push('Do NOT use exfoliants and retinol on the same night - risk of over-exfoliation.');
  }

  if (primary_concerns.includes('dryness') || climate_zone === 'cold_dry') {
    weeklyRoutine.push({
      day: 'Once weekly',
      treatment_type: 'hydrating_mask',
      purpose: 'Deep hydration boost',
      instructions: 'Apply hydrating sheet mask or cream mask for 15-20 minutes.',
      frequency: 'Once a week'
    });
  }

  if (primary_concerns.includes('oiliness') || primary_concerns.includes('acne')) {
    weeklyRoutine.push({
      day: 'Once weekly',
      treatment_type: 'clay_mask',
      purpose: 'Deep cleanse pores and absorb excess oil',
      instructions: 'Apply thin layer, leave 10-15 minutes, rinse before fully dry.',
      frequency: 'Once a week'
    });
  }

  return {
    morning_routine: morningRoutine,
    evening_routine: eveningRoutine,
    weekly_routine: weeklyRoutine,
    ingredient_warnings: warnings
  };
}

// Get product recommendations
export function getProductRecommendations(skinProfile, routine) {
  const {
    ai_adjusted_skin_type,
    primary_concerns,
    secondary_concerns,
    sensitivity_score,
    budget_range,
    climate_zone
  } = skinProfile;

  const recommendations = [];
  const budgetFilter = BUDGET_FILTERS[budget_range] || BUDGET_FILTERS['mid-range'];
  const climatePrefs = CLIMATE_ADJUSTMENTS[climate_zone] || CLIMATE_ADJUSTMENTS['moderate'];

  // Helper function to find best product
  const findBestProduct = (category, productType, usageTime) => {
    const products = INDIAN_PHARMACY_PRODUCTS[category] || [];
    
    // Filter by skin type and budget
    let suitable = products.filter(p => {
      const skinMatch = p.suitable_for.includes(ai_adjusted_skin_type) || 
                        p.suitable_for.includes('all') ||
                        (sensitivity_score === 'high' && p.suitable_for.includes('sensitive'));
      const budgetMatch = p.price_max <= budgetFilter.max_price;
      const genericPref = budgetFilter.prefer_generic ? true : !p.is_generic || true;
      return skinMatch && budgetMatch && genericPref;
    });

    // Score by concerns addressed
    suitable = suitable.map(p => {
      let score = 0;
      primary_concerns.forEach(c => {
        if (p.addresses.some(a => a.toLowerCase().includes(c.toLowerCase()))) score += 3;
      });
      secondary_concerns.forEach(c => {
        if (p.addresses.some(a => a.toLowerCase().includes(c.toLowerCase()))) score += 1;
      });
      if (budgetFilter.prefer_generic && p.is_generic) score += 1;
      if (p.availability === 'high') score += 2;
      return { ...p, score };
    });

    // Sort by score
    suitable.sort((a, b) => b.score - a.score);

    if (suitable.length === 0) return null;

    const best = suitable[0];
    return {
      product_type: productType,
      product_name: best.name,
      brand: best.brand,
      active_ingredients: best.active_ingredients,
      why_recommended: generateWhyText(best, primary_concerns, ai_adjusted_skin_type),
      price_range_min: best.price_min,
      price_range_max: best.price_max,
      availability_confidence: best.availability,
      suitable_for_skin_types: best.suitable_for,
      addresses_concerns: best.addresses,
      usage_time: usageTime,
      is_pharmacy_generic: best.is_generic
    };
  };

  // Get products for each routine step
  const cleanserRec = findBestProduct('cleansers', 'cleanser', 'both');
  if (cleanserRec) recommendations.push(cleanserRec);

  // Toner for oily/combination
  if (ai_adjusted_skin_type === 'oily' || ai_adjusted_skin_type === 'combination') {
    const tonerRec = findBestProduct('toners', 'toner', 'both');
    if (tonerRec) recommendations.push(tonerRec);
  }

  // Serum based on concerns
  const serumRec = findBestProduct('serums', 'serum', 'both');
  if (serumRec) recommendations.push(serumRec);

  // Moisturizer
  const moisturizerRec = findBestProduct('moisturizers', 'moisturizer', 'both');
  if (moisturizerRec) recommendations.push(moisturizerRec);

  // Sunscreen - MANDATORY
  const sunscreenRec = findBestProduct('sunscreens', 'sunscreen', 'morning');
  if (sunscreenRec) recommendations.push(sunscreenRec);

  // Spot treatment for acne
  if (primary_concerns.includes('acne')) {
    const spotRec = findBestProduct('spot_treatments', 'spot_treatment', 'evening');
    if (spotRec) recommendations.push(spotRec);
  }

  // Exfoliator for non-sensitive skin
  if (sensitivity_score !== 'high') {
    const exfoliatorRec = findBestProduct('exfoliators', 'exfoliator', 'weekly');
    if (exfoliatorRec) recommendations.push(exfoliatorRec);
  }

  return recommendations;
}

function generateWhyText(product, concerns, skinType) {
  const addressedConcerns = product.addresses.filter(a => 
    concerns.some(c => a.toLowerCase().includes(c.toLowerCase()))
  );
  
  let text = `Recommended for ${skinType} skin. `;
  if (addressedConcerns.length > 0) {
    text += `Addresses your concerns: ${addressedConcerns.join(', ')}. `;
  }
  text += `Key ingredients: ${product.active_ingredients.slice(0, 2).join(', ')}. `;
  if (product.is_generic) {
    text += 'Pharmacy generic - excellent value.';
  } else {
    text += `${product.availability} availability in Indian pharmacies.`;
  }
  return text;
}

// Check for ingredient conflicts in recommendations
export function validateSafetyRules(recommendations) {
  const warnings = [];
  const ingredients = recommendations.flatMap(r => r.active_ingredients || []);

  INGREDIENT_CONFLICTS.forEach(conflict => {
    const has1 = ingredients.some(i => i.toLowerCase().includes(conflict.ingredient1.toLowerCase()));
    const has2 = ingredients.some(i => i.toLowerCase().includes(conflict.ingredient2.toLowerCase()));
    
    if (has1 && has2) {
      warnings.push({
        type: 'ingredient_conflict',
        ingredients: [conflict.ingredient1, conflict.ingredient2],
        reason: conflict.reason,
        recommendation: 'Use at different times of day or on alternate days.'
      });
    }
  });

  return warnings;
}

export default {
  analyzeQuestionnaire,
  analyzeImageWithAI,
  synthesizeSkinProfile,
  generateRoutine,
  getProductRecommendations,
  validateSafetyRules
};