/**
 * Surgery Analysis — Local fallback generator for AI analysis.
 * Used when InvokeLLM is unavailable (credits exhausted, network error, etc.)
 * Generates a professional analysis from golden ratio metrics without any API call.
 */

/**
 * Generate a local AI-style analysis from golden ratio report + selected procedures.
 * @param {Object} report - { overallScore, metrics }
 * @param {Array} procedures - selected procedure objects
 * @returns {string} analysis text
 */
export function generateLocalAnalysis(report, procedures) {
  if (!report) return 'Waiting for facial analysis to complete...';

  const { overallScore, metrics } = report;
  const weakMetrics = (metrics || []).filter(m => m.score < 70 && m.relatedProcedure);
  const strongMetrics = (metrics || []).filter(m => m.score >= 75);

  let parts = [];

  // Overall assessment
  if (overallScore >= 80) {
    parts.push(`Your facial harmony score of ${overallScore}/100 indicates excellent overall facial proportion with strong alignment to classical golden ratio principles.`);
  } else if (overallScore >= 60) {
    parts.push(`Your facial harmony score of ${overallScore}/100 shows good facial proportion with a few areas that could be enhanced for optimal balance.`);
  } else {
    parts.push(`Your facial harmony score of ${overallScore}/100 suggests some facial features could benefit from aesthetic refinement to achieve better proportion.`);
  }

  // Highlight areas for improvement
  if (weakMetrics.length > 0) {
    const areas = weakMetrics.map(m => m.name.toLowerCase()).slice(0, 3);
    parts.push(`Analysis identifies ${areas.join(', ')} as areas with potential for improvement.`);
  } else if (strongMetrics.length > 0) {
    parts.push(`Your facial features show strong symmetry and proportion across all measured metrics.`);
  }

  // Recommend procedures
  if (procedures && procedures.length > 0) {
    const procNames = procedures.slice(0, 3).map(p => p.procedure_name);
    parts.push(`Based on your analysis, ${procNames.join(', ')} ${procedures.length === 1 ? 'is' : 'are'} suggested as potential options. We recommend consulting with a qualified plastic surgeon to discuss realistic outcomes.`);
  }

  return parts.join(' ');
}

/**
 * Build the InvokeLLM prompt for online-enhanced AI analysis.
 * Uses add_context_from_internet to pull real procedure data.
 */
export function buildLLMPrompt(report, procedures, userAge) {
  const metricsSummary = (report?.metrics || [])
    .filter(m => m.relatedProcedure)
    .map(m => `${m.name}: score ${m.score}/100 (ratio ${m.ratio}, ideal ${m.ideal})`)
    .join('; ');

  const procNames = (procedures || []).slice(0, 3).map(p => p.procedure_name).join(', ');

  return `You are a cosmetic surgery consultant AI for the Célure app. 
A user${userAge ? ` aged ${userAge}` : ''} has completed a facial golden ratio analysis with an overall harmony score of ${report?.overallScore}/100.

Key metrics: ${metricsSummary}

Suggested procedures: ${procNames || 'None yet'}

Provide a brief, professional 2-3 sentence analysis of the facial features and recommend the most beneficial procedures. Search online for current information about these procedures including typical recovery times and expected outcomes. Be conservative and prioritize natural-looking results. Do not recommend unnecessary procedures. Keep it concise.`;
}