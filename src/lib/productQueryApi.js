/**
 * productQueryApi.js
 * Read-only helpers the recommendation engine (and any ML service) can call
 * to fetch products from the Product entity by skin concern.
 *
 * Usage:
 *   import { getProductsByConcern, getProductsForProfile } from '@/lib/productQueryApi';
 *
 *   const matches = await getProductsByConcern('Acne');
 *   const routine  = await getProductsForProfile(['Acne', 'Dryness/Dehydration'], { routineStep: 'AM' });
 */

import { base44 } from '@/api/base44Client';

/**
 * Returns all products whose skin_concerns_treated array includes the given concern.
 * Optionally filter by routineStep ('AM' | 'PM' | 'Both') and/or prescriptionStrength.
 */
export async function getProductsByConcern(concern, { routineStep, prescriptionStrength } = {}) {
  const all = await base44.entities.Product.list('-created_date', 200);
  return all.filter(p => {
    const concerns = p.skin_concerns_treated || [];
    if (!concerns.includes(concern)) return false;
    if (routineStep && p.routine_step !== routineStep && p.routine_step !== 'Both') return false;
    if (prescriptionStrength !== undefined && p.prescription_strength !== prescriptionStrength) return false;
    return true;
  });
}

/**
 * Given an array of detected concerns (from the 14-biomarker scoring),
 * returns a deduplicated, ranked list of products sorted by coverage (most concerns matched first).
 * Appends a dermatologist note to any Rx-strength product.
 *
 * @param {string[]} detectedConcerns  — e.g. ['Acne', 'Oily Skin/Excess Sebum']
 * @param {{ routineStep?: string }}  — optional AM/PM filter
 * @returns {Array<Product & { matchedConcerns: string[], matchScore: number, rxNote?: string }>}
 */
export async function getProductsForProfile(detectedConcerns, { routineStep } = {}) {
  if (!detectedConcerns?.length) return [];

  const all = await base44.entities.Product.list('-created_date', 200);

  const scored = all
    .map(product => {
      const concerns = product.skin_concerns_treated || [];
      const matched = detectedConcerns.filter(c => concerns.includes(c));
      return { ...product, matchedConcerns: matched, matchScore: matched.length };
    })
    .filter(p => p.matchScore > 0)
    .filter(p => !routineStep || p.routine_step === routineStep || p.routine_step === 'Both')
    .sort((a, b) => b.matchScore - a.matchScore);

  // Append Rx note for prescription-strength products
  return scored.map(p => ({
    ...p,
    rxNote: p.prescription_strength
      ? 'This product contains prescription-strength active ingredients. Consult a dermatologist before use.'
      : null,
  }));
}