/**
 * Ingredient Safety Filter
 * Enforces clean beauty standards for all product recommendations.
 * Filters out toxic/harmful ingredients and validates routine-product alignment.
 */

// Ingredients to always avoid (clean beauty standards)
export const BANNED_INGREDIENTS = [
  // Parabens
  'methylparaben', 'propylparaben', 'butylparaben', 'ethylparaben', 'isobutylparaben',
  // Sulfates
  'sodium lauryl sulfate', 'sls', 'sodium laureth sulfate', 'sles', 'ammonium lauryl sulfate',
  // Phthalates
  'dibutyl phthalate', 'diethyl phthalate', 'dimethyl phthalate',
  // Formaldehyde releasers
  'dmdm hydantoin', 'quaternium-15', 'imidazolidinyl urea', 'diazolidinyl urea',
  'bronopol', '2-bromo-2-nitropropane-1,3-diol',
  // Harmful UV filters
  'oxybenzone', 'octinoxate', 'homosalate', 'octisalate',
  // Other concerning ingredients
  'mineral oil', 'petrolatum', 'coal tar', 'hydroquinone',
  'mercury', 'lead acetate', 'triclosan', 'toluene'
];

// Ingredients flagged for sensitive skin (warn, don't ban)
export const SENSITIVE_SKIN_FLAGS = [
  'alcohol denat', 'denatured alcohol', 'sd alcohol',
  'artificial fragrance', 'parfum', 'fragrance',
  'menthol', 'eucalyptus oil', 'peppermint oil',
  'witch hazel', 'lemon juice', 'lemon extract'
];

// Preferred clean & safe ingredients by concern
export const CLEAN_PREFERRED_INGREDIENTS = {
  acne: ['salicylic acid', 'niacinamide', 'benzoyl peroxide', 'azelaic acid', 'zinc pca', 'tea tree'],
  pigmentation: ['vitamin c', 'ethyl ascorbic acid', 'alpha arbutin', 'kojic acid', 'tranexamic acid', 'ferulic acid'],
  dryness: ['hyaluronic acid', 'glycerin', 'ceramides', 'squalane', 'beta glucan', 'panthenol', 'shea butter'],
  aging: ['retinol', 'peptides', 'vitamin c', 'niacinamide', 'hyaluronic acid', 'resveratrol'],
  sensitivity: ['ceramides', 'centella asiatica', 'oat extract', 'allantoin', 'panthenol', 'sepicalm'],
  oiliness: ['niacinamide', 'zinc pca', 'salicylic acid', 'pha', 'clay', 'silica'],
  texture: ['aha', 'bha', 'pha', 'retinol', 'niacinamide', 'glycolic acid', 'lactic acid'],
  sun_protection: ['zinc oxide', 'titanium dioxide', 'avobenzone', 'tinosorb s', 'tinosorb m', 'uvinul a plus']
};

// Safe UV filter whitelist (no oxybenzone/octinoxate)
export const SAFE_UV_FILTERS = [
  'zinc oxide', 'titanium dioxide', 'avobenzone', 'octocrylene',
  'tinosorb s', 'tinosorb m', 'uvinul a plus', 'mexoryl xl', 'mexoryl sx'
];

// Brand quality tier — brands known for transparency and clean formulations
export const CLEAN_BRAND_TIER = {
  high: ['minimalist', 'foxtale', 're\'equil', 'episoft', 'physiogel', 'sebamed', 'la shield', 'cetaphil'],
  medium: ['mamaearth', 'plum', 'dot & key', 'the derma co', 'ahaglow', 'venusia'],
  standard: ['ipca', 'glyco', 'kojivit', 'photostable', 'generic']
};

/**
 * Check if an ingredient list contains a target as a whole word (word-boundary match).
 * Prevents false positives from substring matches (e.g. "retinol" vs "retinyl palmitate").
 */
export function hasIngredientWord(ingredients, target) {
  if (!ingredients || !target) return false;
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return ingredients.some(i => regex.test(i));
}

/**
 * Check if a product has any banned ingredients.
 * Returns true if the product is safe, false if it should be excluded.
 */
export function isIngredientSafe(product, sensitivityScore = 'low') {
  const ingredientsLower = (product.active_ingredients || []).map(i => i.toLowerCase());
  const nameLower = product.name.toLowerCase();

  // Check banned ingredients
  for (const banned of BANNED_INGREDIENTS) {
    if (ingredientsLower.some(i => i.includes(banned))) {
      return false;
    }
  }

  // Cetaphil Gentle Skin Cleanser has SLS — flag it for sensitive/high sensitivity
  // (The product DB lists it as "mild" but it's still SLS)
  if (sensitivityScore === 'high' && nameLower.includes('cetaphil gentle skin cleanser')) {
    return false;
  }

  // For high sensitivity, also flag products with fragrance/alcohol
  if (sensitivityScore === 'high') {
    for (const flag of SENSITIVE_SKIN_FLAGS) {
      if (ingredientsLower.some(i => i.includes(flag))) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get brand quality score (higher = cleaner/more trusted).
 */
export function getBrandQualityScore(brand) {
  const brandLower = (brand || '').toLowerCase();
  if (CLEAN_BRAND_TIER.high.some(b => brandLower.includes(b))) return 3;
  if (CLEAN_BRAND_TIER.medium.some(b => brandLower.includes(b))) return 2;
  return 1;
}

/**
 * Validate a product against the specific routine step it's intended to fill.
 * Returns true if the product is consistent with the routine requirement.
 */
export function validateRoutineProductMatch(product, routineStep) {
  if (!routineStep) return true;

  const ingredientsLower = (product.active_ingredients || []).map(i => i.toLowerCase());
  const purposeLower = (routineStep.purpose || '').toLowerCase();
  const instructionsLower = (routineStep.instructions || '').toLowerCase();
  const productType = (product.product_type || '').toLowerCase();

  // SPF enforcement — if routine specifies SPF 50+, validate
  const spfMatch = purposeLower.match(/spf\s*(\d+)/i) || instructionsLower.match(/spf\s*(\d+)/i);
  if (spfMatch && productType === 'sunscreen') {
    const requiredSpf = parseInt(spfMatch[1]);
    const productSpfMatch = (product.product_name || '').match(/spf\s*(\d+)/i);
    if (productSpfMatch) {
      const productSpf = parseInt(productSpfMatch[1]);
      if (productSpf < requiredSpf) return false;
    }
  }

  // Vitamin C serum consistency
  if (purposeLower.includes('vitamin c') || purposeLower.includes('brighten')) {
    const hasVitC = ingredientsLower.some(i =>
      i.includes('vitamin c') || i.includes('ascorbic acid') || i.includes('ethyl ascorbic') ||
      i.includes('ascorbyl') || i.includes('sodium ascorbyl')
    );
    if (productType === 'serum' && !hasVitC) return false;
  }

  // Retinol serum consistency
  if (purposeLower.includes('retinol') || purposeLower.includes('cell turnover') || purposeLower.includes('anti-aging')) {
    // Retinol is optional — don't reject, just don't require
  }

  // Hydration serum — needs HA or similar
  if (purposeLower.includes('deep hydration') || purposeLower.includes('hyaluronic')) {
    const hasHydrator = ingredientsLower.some(i =>
      i.includes('hyaluronic') || i.includes('glycerin') || i.includes('beta glucan') || i.includes('panthenol')
    );
    if (productType === 'serum' && !hasHydrator) return false;
  }

  return true;
}

/**
 * Run final consistency validation across all recommendations.
 * Returns array of validation issues found (empty = all clear).
 */
export function runConsistencyValidation(products, routine) {
  const issues = [];
  const routineSteps = [
    ...(routine?.morning_routine || []),
    ...(routine?.evening_routine || [])
  ];

  // Check every routine step has a product
  const coveredTypes = products.map(p => p.product_type);
  routineSteps.forEach(step => {
    if (!coveredTypes.includes(step.product_type)) {
      issues.push({
        type: 'missing_product',
        step: step.product_type,
        message: `No product found for routine step: ${step.product_type}`
      });
    }
  });

  // Check for ingredient conflicts across the full set
  const allIngredients = products.flatMap(p => (p.active_ingredients || []));
  
  const conflictPairs = [
    { a: 'retinol', b: 'vitamin c', note: 'Use Vitamin C in AM, Retinol in PM only' },
    { a: 'retinol', b: 'benzoyl peroxide', note: 'Never use together — causes severe irritation' },
    { a: 'retinol', b: 'aha', note: 'Use on alternate days only' },
    { a: 'retinol', b: 'bha', note: 'Use on alternate days only' }
  ];

  conflictPairs.forEach(pair => {
    const hasA = hasIngredientWord(allIngredients, pair.a);
    const hasB = hasIngredientWord(allIngredients, pair.b);
    if (hasA && hasB) {
      issues.push({ type: 'ingredient_conflict', note: pair.note });
    }
  });

  return issues;
}