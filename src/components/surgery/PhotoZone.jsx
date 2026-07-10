import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useFaceMesh } from '@/hooks/useFaceMesh';
import { computeGoldenRatios } from '@/lib/goldenRatio';
import { renderWarp } from '@/lib/warpEngine';
import { Camera, Upload, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';

const PhotoZone = forwardRef(({
  procedures = [],
  intensity = 0.6,
  showLandmarks = false,
  analysisPhotoUrl = null,
  photoUrl = null,
  onGoldenRatioComputed = null
}, ref) => {
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [noFaceDetected, setNoFaceDetected] = useState(false);
  const [dividerPos, setDividerPos] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const originalCanvasRef = useRef(null);
  const warpedCanvasRef = useRef(null);
  const displayCanvasRef = useRef(null);
  const landmarksRef = useRef(null);
  const imageRef = useRef(null);
  const blobUrlRef = useRef(null);
  const fileInputRef = useRef(null);
  const warpRafRef = useRef(null);

  // Keep latest props in refs for use in stable callbacks
  const proceduresRef = useRef(procedures);
  const intensityRef = useRef(intensity);
  useEffect(() => { proceduresRef.current = procedures; }, [procedures]);
  useEffect(() => { intensityRef.current = intensity; }, [intensity]);

  // --- Display rendering (split view + divider + landmarks) ---
  const renderDisplay = useCallback(() => {
    const display = displayCanvasRef.current;
    const original = originalCanvasRef.current;
    const warped = warpedCanvasRef.current;
    if (!display || !original || !warped) return;

    const ctx = display.getContext('2d');
    const w = display.width;
    const h = display.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Left: original
    ctx.drawImage(original, 0, 0, w, h);

    // Right: warped (clipped)
    const splitX = w * dividerPos;
    ctx.save();
    ctx.beginPath();
    ctx.rect(splitX, 0, w - splitX, h);
    ctx.clip();
    ctx.drawImage(warped, 0, 0, w, h);
    ctx.restore();

    // Divider line + handle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(splitX - 2, 0, 4, h);
    ctx.beginPath();
    ctx.arc(splitX, h / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⟷', splitX, h / 2);

    // Landmark overlay
    if (showLandmarks && landmarksRef.current) {
      ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
      for (const pt of landmarksRef.current) {
        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [dividerPos, showLandmarks]);

  // --- Warp rendering (delegated to warpEngine) ---
  const runWarp = useCallback(async () => {
    const original = originalCanvasRef.current;
    const warped = warpedCanvasRef.current;
    const lm = landmarksRef.current;
    if (!original || !warped || !lm) return;

    await renderWarp(original, warped, lm, proceduresRef.current, intensityRef.current);
    renderDisplay();
  }, [renderDisplay]);

  // Keep runWarp ref current without triggering the warp effect on every render
  const runWarpRef = useRef(runWarp);
  useEffect(() => { runWarpRef.current = runWarp; });

  // Re-run warp only when procedures or intensity change (not on divider/landmark-toggle)
  useEffect(() => {
    if (!landmarksRef.current) return;
    if (warpRafRef.current) cancelAnimationFrame(warpRafRef.current);
    warpRafRef.current = requestAnimationFrame(() => runWarpRef.current());
  }, [procedures, intensity]);

  // Re-render display when divider or landmark toggle changes
  useEffect(() => {
    renderDisplay();
  }, [dividerPos, showLandmarks, renderDisplay]);

  // --- FaceMesh results handler ---
  const onFaceMeshResults = useCallback((results) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      setNoFaceDetected(true);
      return;
    }

    setNoFaceDetected(false);
    const landmarks = results.multiFaceLandmarks[0];
    landmarksRef.current = landmarks;

    // Compute golden ratios
    const canvas = originalCanvasRef.current;
    if (canvas && onGoldenRatioComputed) {
      const report = computeGoldenRatios(landmarks, canvas.width, canvas.height);
      onGoldenRatioComputed(report);
    }

    // Trigger initial warp
    runWarp();
  }, [onGoldenRatioComputed, runWarp]);

  const { status: faceMeshStatus, detectFace } = useFaceMesh(onFaceMeshResults);

  // --- Load image element from URL (shared by both paths) ---
  // Does NOT depend on faceMeshStatus — always calls detectFace (no-op if not ready).
  // The useEffect below handles detection when FaceMesh becomes ready later.
  const loadImageElement = useCallback((url, useCrossOrigin = false) => {
    const img = new Image();
    if (useCrossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;

      const isMobile = window.innerWidth < 768;
      const maxDim = isMobile ? 400 : 800;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      [originalCanvasRef, warpedCanvasRef, displayCanvasRef].forEach(ref => {
        if (ref.current) {
          ref.current.width = w;
          ref.current.height = h;
        }
      });

      const oCtx = originalCanvasRef.current.getContext('2d');
      oCtx.drawImage(img, 0, 0, w, h);

      setPhotoLoaded(true);

      // Attempt face detection — no-op if FaceMesh isn't ready yet
      detectFace(img);
    };
    img.onerror = () => {
      setLoadError('Failed to load image. Please try a different photo.');
    };
    img.src = url;
  }, [detectFace]);

  // --- Load photo from File object (camera/upload) ---
  const loadPhotoFromFile = useCallback((file) => {
    setLoadError(null);
    setNoFaceDetected(false);

    // Revoke previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    loadImageElement(url, false);
  }, [loadImageElement]);

  // --- Load photo from external URL (analysis photo, Results page) ---
  const loadPhotoFromUrl = useCallback(async (src) => {
    setLoadError(null);
    setNoFaceDetected(false);

    // Revoke previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    try {
      // Try fetch → blob to avoid CORS / canvas tainting
      const response = await fetch(src);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;
      loadImageElement(blobUrl, false);
    } catch {
      // Fallback: direct load with crossOrigin (may taint canvas if CORS fails)
      loadImageElement(src, true);
    }
  }, [loadImageElement]);

  // Auto-load photo from URL param (Results page)
  useEffect(() => {
    if (photoUrl) loadPhotoFromUrl(photoUrl);
  }, [photoUrl, loadPhotoFromUrl]);

  // Detect face when FaceMesh becomes ready (if photo already loaded)
  useEffect(() => {
    if (faceMeshStatus === 'ready' && photoLoaded && imageRef.current && !landmarksRef.current) {
      detectFace(imageRef.current);
    }
  }, [faceMeshStatus, photoLoaded, detectFace]);

  // --- Divider drag handlers ---
  const updateDivider = useCallback((clientX) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    setDividerPos(Math.max(0.05, Math.min(0.95, x)));
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateDivider(clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateDivider(clientX);
  };

  const handlePointerUp = () => setIsDragging(false);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  // --- Expose composite image generation via ref ---
  useImperativeHandle(ref, () => ({
    getCompositeDataUrl: (procedureNames, harmonyScore) => {
      const original = originalCanvasRef.current;
      const warped = warpedCanvasRef.current;
      if (!original || !warped) return null;

      const w = original.width;
      const h = original.height;
      const padding = 30;
      const headerH = 70;
      const footerH = 80;
      const compositeW = w * 2 + padding * 3;
      const compositeH = h + headerH + footerH + padding * 2;

      const canvas = document.createElement('canvas');
      canvas.width = compositeW;
      canvas.height = compositeH;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, compositeW, compositeH);

      // Header
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Célure AI — Surgery Simulator', compositeW / 2, 42);

      // Labels
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('Before', padding + w / 2, headerH + padding - 8);
      ctx.fillStyle = '#ec4899';
      ctx.fillText('After', padding * 2 + w + w / 2, headerH + padding - 8);

      // Images
      ctx.drawImage(original, padding, headerH + padding, w, h);
      ctx.drawImage(warped, padding * 2 + w, headerH + padding, w, h);

      // Procedures + Score
      ctx.fillStyle = '#ffffff';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Procedures: ${procedureNames.join(', ')}`, padding, headerH + padding + h + 25);
      ctx.fillText(`Facial Harmony Score: ${harmonyScore}/100`, padding, headerH + padding + h + 48);

      // Footer watermark
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        'This is a visual simulation. Results may vary. Consult a qualified plastic surgeon before any procedure.',
        compositeW / 2, compositeH - 25
      );

      return canvas.toDataURL('image/jpeg', 0.9);
    }
  }));

  // --- Loading state ---
  if (faceMeshStatus === 'loading' && photoLoaded) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading face analysis engine...</p>
        </div>
      </div>
    );
  }

  // --- FaceMesh error state (before photo upload) ---
  if (faceMeshStatus === 'error' && !photoLoaded) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Analysis Engine Unavailable</h3>
          <p className="text-sm text-gray-400">The face analysis engine could not be loaded. You can still upload a photo, but simulation features will be limited.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) loadPhotoFromFile(file);
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-12 bg-pink-500 rounded-full font-medium text-sm flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" /> Upload Photo Anyway
        </button>
      </div>
    );
  }

  // --- Error state: no face detected ---
  if (noFaceDetected) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-gray-300 mb-1">Face not detected</p>
          <p className="text-xs text-gray-500 mb-4">Ensure good lighting and look directly at the camera.</p>
          <button
            onClick={() => { setNoFaceDetected(false); setPhotoLoaded(false); landmarksRef.current = null; }}
            className="inline-flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Retake
          </button>
        </div>
      </div>
    );
  }

  // --- No photo: capture/upload UI ---
  if (!photoLoaded) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Upload a Photo</h3>
          <p className="text-sm text-gray-400">Upload a clear, front-facing photo to begin simulation</p>
        </div>

        {loadError && (
          <p className="text-xs text-red-400 text-center mb-4">{loadError}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) loadPhotoFromFile(file);
          }}
        />

        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-12 bg-pink-500 rounded-full font-medium text-sm flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" /> Take / Upload Photo
          </button>

          {analysisPhotoUrl && (
            <button
              onClick={() => loadPhotoFromUrl(analysisPhotoUrl)}
              className="w-full h-12 bg-gray-800 border border-gray-700 rounded-full font-medium text-sm flex items-center justify-center gap-2 text-gray-300"
            >
              <Upload className="w-4 h-4" /> Use My Analysis Photo
            </button>
          )}
        </div>

        <p className="text-xs text-gray-600 text-center mt-4">
          Your photo stays on your device. It is not uploaded unless you explicitly share it with a clinic.
        </p>
      </div>
    );
  }

  // --- Photo loaded: split canvas view ---
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
      <canvas
        ref={originalCanvasRef}
        className="hidden"
      />
      <canvas
        ref={warpedCanvasRef}
        className="hidden"
      />
      <canvas
        ref={displayCanvasRef}
        className="w-full h-auto block touch-none cursor-ew-resize"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />

      {/* Labels */}
      <div className="absolute top-3 left-3 text-xs font-medium text-white/70 bg-black/50 px-2 py-1 rounded-full">
        Before
      </div>
      <div className="absolute top-3 right-3 text-xs font-medium text-pink-400 bg-black/50 px-2 py-1 rounded-full">
        After
      </div>

      {/* Retake button */}
      <button
        onClick={() => {
          setPhotoLoaded(false);
          landmarksRef.current = null;
          onGoldenRatioComputed?.(null);
        }}
        className="absolute bottom-3 right-3 bg-black/60 p-2 rounded-full"
      >
        <RefreshCw className="w-4 h-4 text-white" />
      </button>
    </div>
  );
});

export default PhotoZone;