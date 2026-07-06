/**
 * Mesh Warp Engine — Delaunay triangulation + affine transform face warping.
 * Uses MediaPipe FaceMesh landmarks (normalized 0-1) and procedure warp configs.
 */
import { loadScript } from './loadScript';

const DELAUNATOR_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/delaunator/5.0.0/delaunator.min.js';
let delaunatorPromise = null;

async function ensureDelaunator() {
  if (window.Delaunator) return;
  if (!delaunatorPromise) {
    delaunatorPromise = loadScript(DELAUNATOR_CDN);
  }
  await delaunatorPromise;
}

/** Safely parse warp_config (handles both object and JSON string) */
function parseWarpConfig(proc) {
  const config = proc.warp_config;
  if (!config) return null;
  if (typeof config === 'string') {
    try { return JSON.parse(config); } catch { return null; }
  }
  return config;
}

/**
 * Compute warped landmark positions from original landmarks + selected procedures.
 * Uses Gaussian falloff to propagate target displacements to nearby landmarks.
 *
 * @param {Array} landmarks - normalized {x, y, z} from FaceMesh
 * @param {Array} procedures - selected procedure objects
 * @param {number} intensity - 0.0 to 1.0
 * @param {number} w - canvas width
 * @param {number} h - canvas height
 * @returns {Array} warped pixel-coordinate points
 */
export function computeWarpedPoints(landmarks, procedures, intensity, w, h) {
  // Convert to pixel coordinates
  const px = landmarks.map(l => ({ x: l.x * w, y: l.y * h }));
  const warped = px.map(p => ({ x: p.x, y: p.y }));
  if (!procedures.length) return warped;

  const cx = w / 2;
  const allDisplacements = [];

  for (const proc of procedures) {
    const config = parseWarpConfig(proc);
    if (!config) continue;
    const maxShift = (config.max_intensity || 0.1) * intensity;
    if (maxShift < 0.001) continue;

    const targetIdxs = config.target_landmarks || [];
    const targets = targetIdxs.map(i => px[i]).filter(Boolean);
    if (!targets.length) continue;

    // Centroid of target points
    const tcx = targets.reduce((s, p) => s + p.x, 0) / targets.length;
    const tcy = targets.reduce((s, p) => s + p.y, 0) / targets.length;

    for (const idx of targetIdxs) {
      if (!px[idx]) continue;
      const pt = px[idx];
      let dx = 0, dy = 0;

      switch (config.warp_type) {
        case 'deflate':
          dx = (cx - pt.x) * maxShift * 0.5;
          dy = (tcy - pt.y) * maxShift * 0.3;
          break;
        case 'inflate':
          dx = (pt.x - tcx) * maxShift * 2;
          dy = (pt.y - tcy) * maxShift * 2;
          break;
        case 'lift':
        case 'lift_upper_lid':
          dy = -maxShift * h * 0.5;
          break;
        case 'pinch_lift':
          dx = (cx - pt.x) * maxShift * 0.5;
          dy = -maxShift * h * 0.4;
          break;
        case 'narrow':
        case 'slim_jaw':
          dx = (cx - pt.x) * maxShift;
          break;
        case 'project_forward':
          dy = maxShift * h * 0.15;
          break;
        case 'project_lateral':
          dx = (pt.x - tcx) * maxShift * 2;
          break;
        case 'lift_lateral':
          dy = -maxShift * h * 0.4;
          dx = (cx - pt.x) * maxShift * 0.2;
          break;
        case 'smooth_lower_lid':
          dy = -maxShift * h * 0.2;
          break;
        case 'smooth_wrinkle':
          // No displacement — handled separately via blur
          break;
        default:
          break;
      }

      allDisplacements.push({ idx, dx, dy });
    }
  }

  // Apply direct displacements to target landmarks
  for (const { idx, dx, dy } of allDisplacements) {
    warped[idx].x += dx;
    warped[idx].y += dy;
  }

  // Propagate to nearby non-target landmarks using Gaussian falloff
  const falloffRadius = Math.max(w, h) * 0.1;
  const sigma2 = 2 * (falloffRadius / 2) ** 2;
  const displacedIdxs = new Set(allDisplacements.map(d => d.idx));

  for (let i = 0; i < px.length; i++) {
    if (displacedIdxs.has(i)) continue;

    let totalDx = 0, totalDy = 0, totalWeight = 0;
    for (const { idx, dx, dy } of allDisplacements) {
      const tp = px[idx];
      const dist2 = (px[i].x - tp.x) ** 2 + (px[i].y - tp.y) ** 2;
      if (dist2 < falloffRadius * falloffRadius) {
        const weight = Math.exp(-dist2 / sigma2);
        totalDx += dx * weight;
        totalDy += dy * weight;
        totalWeight += weight;
      }
    }
    if (totalWeight > 0) {
      warped[i].x += totalDx / totalWeight;
      warped[i].y += totalDy / totalWeight;
    }
  }

  return warped;
}

/** Compute the 6-parameter affine transform mapping source triangle → dest triangle */
function computeAffineTransform(s1, s2, s3, d1, d2, d3) {
  const denom = s1.x * (s2.y - s3.y) - s2.x * (s1.y - s3.y) + s3.x * (s1.y - s2.y);
  if (Math.abs(denom) < 1e-10) return null;

  const a = (d1.x * (s2.y - s3.y) - d2.x * (s1.y - s3.y) + d3.x * (s1.y - s2.y)) / denom;
  const b = (d1.y * (s2.y - s3.y) - d2.y * (s1.y - s3.y) + d3.y * (s1.y - s2.y)) / denom;
  const c = (s1.x * (d2.x - d3.x) - s2.x * (d1.x - d3.x) + s3.x * (d1.x - d2.x)) / denom;
  const d = (s1.x * (d2.y - d3.y) - s2.x * (d1.y - d3.y) + s3.x * (d1.y - d2.y)) / denom;
  const e = (s1.x * (s2.y * d3.x - s3.y * d2.x) - s2.x * (s1.y * d3.x - s3.y * d1.x) + s3.x * (s1.y * d2.x - s2.y * d1.x)) / denom;
  const f = (s1.x * (s2.y * d3.y - s3.y * d2.y) - s2.x * (s1.y * d3.y - s3.y * d1.y) + s3.x * (s1.y * d2.y - s2.y * d1.y)) / denom;

  return [a, b, c, d, e, f];
}

/** Apply localized Gaussian blur to a region (for smooth_wrinkle / Botox) */
function applyLocalizedBlur(warpedCanvas, pixelLm, config, intensity, w, h) {
  const ctx = warpedCanvas.getContext('2d');
  const targets = (config.target_landmarks || []).map(i => pixelLm[i]).filter(Boolean);
  if (!targets.length) return;

  const padding = 30;
  const minX = Math.max(0, Math.min(...targets.map(p => p.x)) - padding);
  const maxX = Math.min(w, Math.max(...targets.map(p => p.x)) + padding);
  const minY = Math.max(0, Math.min(...targets.map(p => p.y)) - padding);
  const maxY = Math.min(h, Math.max(...targets.map(p => p.y)) + padding);

  const blurRadius = Math.max(1, (config.max_intensity || 0.07) * intensity * 8);

  // Use temp canvas to avoid drawing canvas to itself
  const temp = document.createElement('canvas');
  temp.width = w;
  temp.height = h;
  temp.getContext('2d').drawImage(warpedCanvas, 0, 0);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.beginPath();
  ctx.rect(minX, minY, maxX - minX, maxY - minY);
  ctx.clip();
  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(temp, 0, 0);
  ctx.filter = 'none';
  ctx.restore();
}

/**
 * Main warp render function. Draws original as base, then applies all procedure warps.
 * Must be called with canvases already sized to match the image.
 *
 * @param {HTMLCanvasElement} originalCanvas - stores unmodified photo
 * @param {HTMLCanvasElement} warpedCanvas - receives warped result
 * @param {Array} landmarks - normalized {x, y, z} from FaceMesh
 * @param {Array} procedures - selected procedure objects
 * @param {number} intensity - 0.0 to 1.0
 */
export async function renderWarp(originalCanvas, warpedCanvas, landmarks, procedures, intensity) {
  if (!originalCanvas || !warpedCanvas) return;

  const ctx = warpedCanvas.getContext('2d');
  const w = warpedCanvas.width;
  const h = warpedCanvas.height;

  // Step 1: Draw original as base (always start fresh — never warp an already-warped canvas)
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(originalCanvas, 0, 0, w, h);
  ctx.restore();

  if (!procedures.length || !landmarks?.length) return;

  // Convert landmarks to pixel coordinates
  const pixelLm = landmarks.map(l => ({ x: l.x * w, y: l.y * h }));

  // Separate blur procedures from warp procedures
  const blurProcs = procedures.filter(p => parseWarpConfig(p)?.warp_type === 'smooth_wrinkle');
  const warpProcs = procedures.filter(p => {
    const c = parseWarpConfig(p);
    return c && c.warp_type !== 'smooth_wrinkle';
  });

  // Step 2: Apply triangulation-based warps
  if (warpProcs.length > 0) {
    await ensureDelaunator();

    const warpedPoints = computeWarpedPoints(landmarks, warpProcs, intensity, w, h);

    // Triangulate using original landmark positions
    const flat = [];
    for (const p of pixelLm) flat.push(p.x, p.y);
    const delaunay = new window.Delaunator(flat);
    const triangles = delaunay.triangles;

    // Draw each triangle with affine transform from source → warped
    for (let i = 0; i < triangles.length; i += 3) {
      const i0 = triangles[i];
      const i1 = triangles[i + 1];
      const i2 = triangles[i + 2];

      const s1 = pixelLm[i0], s2 = pixelLm[i1], s3 = pixelLm[i2];
      const d1 = warpedPoints[i0], d2 = warpedPoints[i1], d3 = warpedPoints[i2];

      const transform = computeAffineTransform(s1, s2, s3, d1, d2, d3);
      if (!transform) continue;

      ctx.save();
      // Clip to destination triangle (in identity / device space)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.beginPath();
      ctx.moveTo(d1.x, d1.y);
      ctx.lineTo(d2.x, d2.y);
      ctx.lineTo(d3.x, d3.y);
      ctx.closePath();
      ctx.clip();
      // Apply affine transform and draw original canvas
      ctx.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
      ctx.drawImage(originalCanvas, 0, 0);
      ctx.restore();
    }
  }

  // Step 3: Apply blur procedures (Botox — smooth_wrinkle)
  for (const proc of blurProcs) {
    const config = parseWarpConfig(proc);
    if (config) applyLocalizedBlur(warpedCanvas, pixelLm, config, intensity, w, h);
  }
}