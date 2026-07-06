/**
 * Clinic Matching — Haversine distance + procedure overlap filtering.
 */

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * @param {Array} clinics - all PartnerClinics records
 * @param {number} userLat
 * @param {number} userLon
 * @param {Array} selectedProcedures - selected procedure objects (with subcategory)
 * @returns {{ clinics: Array, note: string|null }}
 */
export function findNearestClinics(clinics, userLat, userLon, selectedProcedures) {
  if (!clinics || !clinics.length) return { clinics: [], note: 'No partner clinics available yet.' };

  const subcategories = (selectedProcedures || []).map(p => p.subcategory).filter(Boolean);

  const withDistance = clinics
    .filter(c => c.is_active !== false)
    .map(c => ({
      ...c,
      distance: haversine(userLat, userLon, c.lat, c.lon),
      matchingProcedures: (c.procedures_offered || []).filter(p => subcategories.includes(p))
    }))
    .sort((a, b) => a.distance - b.distance);

  // First: clinics offering matching procedures within 100km
  const matched = withDistance
    .filter(c => c.matchingProcedures.length > 0 && c.distance <= 100)
    .slice(0, 3);

  if (matched.length > 0) {
    return { clinics: matched, note: null };
  }

  // Fallback: nearest clinics regardless of procedure match
  return {
    clinics: withDistance.slice(0, 3),
    note: 'No specialist clinic near you yet — these are the closest partners'
  };
}