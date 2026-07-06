/**
 * Golden Ratio Analysis Engine
 * Computes 8 facial ratio metrics from MediaPipe FaceMesh landmarks.
 * All measurements use normalized (0-1) landmark coords multiplied by canvas dimensions.
 */

const PHI = 1.618;

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * @param {Array} landmarks - Array of {x, y, z} normalized 0-1 from FaceMesh
 * @param {number} canvasW - canvas width in pixels
 * @param {number} canvasH - canvas height in pixels
 * @returns {{ overallScore: number, metrics: Array }} or null if insufficient landmarks
 */
export function computeGoldenRatios(landmarks, canvasW, canvasH) {
  if (!landmarks || landmarks.length < 468) return null;

  // Convert to pixel coordinates
  const lm = landmarks.map(l => ({
    x: l.x * canvasW,
    y: l.y * canvasH
  }));

  const dist = (a, b) => Math.abs(a - b);
  const scoreFromDeviation = (val, ideal, multiplier = 100) =>
    clampScore(100 - Math.abs(val - ideal) * multiplier);

  const metrics = [];

  // 1. Face Proportion (overall harmony)
  const faceLength = dist(lm[152].y, lm[10].y);
  const faceWidth = dist(lm[454].x, lm[234].x);
  const ratio1 = faceWidth > 0 ? faceLength / faceWidth : 0;
  metrics.push({
    name: 'Face Proportion',
    ratio: parseFloat(ratio1.toFixed(3)),
    ideal: PHI,
    score: scoreFromDeviation(ratio1, PHI),
    relatedProcedure: null
  });

  // 2. Vertical Thirds (balance)
  const upperThird = dist(lm[70].y, lm[10].y);
  const middleThird = dist(lm[4].y, lm[70].y);
  const lowerThird = dist(lm[152].y, lm[4].y);
  const maxT = Math.max(upperThird, middleThird, lowerThird);
  const minT = Math.min(upperThird, middleThird, lowerThird);
  const deviation = minT > 0 ? maxT / minT : 1;
  metrics.push({
    name: 'Vertical Thirds',
    ratio: parseFloat(deviation.toFixed(3)),
    ideal: 1.0,
    score: clampScore(100 - (deviation - 1.0) * 80),
    relatedProcedure: null
  });

  // 3. Horizontal Fifths (eye symmetry)
  const faceWidthPx = dist(lm[454].x, lm[234].x);
  const eyeWidthPx = dist(lm[133].x, lm[33].x);
  const fifthsRatio = eyeWidthPx > 0 ? faceWidthPx / eyeWidthPx : 0;
  metrics.push({
    name: 'Horizontal Fifths',
    ratio: parseFloat(fifthsRatio.toFixed(3)),
    ideal: 5.0,
    score: scoreFromDeviation(fifthsRatio, 5.0, 20),
    relatedProcedure: null
  });

  // 4. Nasal Width (key rhinoplasty metric)
  const alarWidth = dist(lm[64].x, lm[294].x);
  const intercanthalDist = dist(lm[133].x, lm[362].x);
  const ratio4 = intercanthalDist > 0 ? alarWidth / intercanthalDist : 0;
  metrics.push({
    name: 'Nasal Width',
    ratio: parseFloat(ratio4.toFixed(3)),
    ideal: 1.0,
    score: scoreFromDeviation(ratio4, 1.0),
    relatedProcedure: 'Rhinoplasty — Alar Width Reduction'
  });

  // 5. Nasal Width to Mouth Width
  const mouthWidth = dist(lm[61].x, lm[291].x);
  const ratio5 = mouthWidth > 0 ? alarWidth / mouthWidth : 0;
  metrics.push({
    name: 'Nasal-to-Mouth Width',
    ratio: parseFloat(ratio5.toFixed(3)),
    ideal: 0.618,
    score: scoreFromDeviation(ratio5, 0.618),
    relatedProcedure: 'Rhinoplasty — Alar Width Reduction'
  });

  // 6. Chin Projection
  const lowerFaceHeight = dist(lm[2].y, lm[152].y);
  const chinYDelta = dist(lm[152].y, lm[175].y);
  const ratio6 = lowerFaceHeight > 0 ? chinYDelta / lowerFaceHeight : 0;
  metrics.push({
    name: 'Chin Projection',
    ratio: parseFloat(ratio6.toFixed(3)),
    ideal: 0.618,
    score: scoreFromDeviation(ratio6, 0.618),
    relatedProcedure: 'Chin Augmentation — Genioplasty'
  });

  // 7. Lip Ratio
  const upperLipH = dist(lm[0].y, lm[13].y);
  const lowerLipH = dist(lm[14].y, lm[17].y);
  const ratio7 = lowerLipH > 0 ? upperLipH / lowerLipH : 0;
  metrics.push({
    name: 'Lip Ratio',
    ratio: parseFloat(ratio7.toFixed(3)),
    ideal: 0.618,
    score: scoreFromDeviation(ratio7, 0.618),
    relatedProcedure: 'Dermal Fillers — Lip Augmentation'
  });

  // 8. Eye Opening (blepharoplasty metric)
  const eyeHeight = dist(lm[159].y, lm[145].y);
  const eyeWidth = dist(lm[133].x, lm[33].x);
  const ratio8 = eyeWidth > 0 ? eyeHeight / eyeWidth : 0;
  metrics.push({
    name: 'Eye Opening',
    ratio: parseFloat(ratio8.toFixed(3)),
    ideal: 0.26,
    score: scoreFromDeviation(ratio8, 0.26, 200),
    relatedProcedure: 'Blepharoplasty — Upper Eyelid Lift'
  });

  const overallScore = Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length);

  return { overallScore, metrics };
}