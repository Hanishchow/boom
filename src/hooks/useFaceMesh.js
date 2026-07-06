/**
 * useFaceMesh — loads MediaPipe FaceMesh from CDN, manages lifecycle and processing lock.
 * Returns { status: 'loading'|'ready'|'error', detectFace: (imageElement) => Promise<boolean> }
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { loadScript } from '@/lib/loadScript';

const FACEMESH_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
const CAMERA_UTILS_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';

export function useFaceMesh(onResults) {
  const [status, setStatus] = useState('loading');
  const faceMeshRef = useRef(null);
  const processingLockRef = useRef(false);
  const onResultsRef = useRef(onResults);

  // Keep callback ref current
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  // Initialize FaceMesh on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Load scripts sequentially: face_mesh.js first, then camera_utils.js
        await loadScript(FACEMESH_CDN);
        await loadScript(CAMERA_UTILS_CDN);
        if (cancelled || !window.FaceMesh) throw new Error('FaceMesh failed to load');

        // Detect low-memory devices and disable refineLandmarks as fallback
        const refineLandmarks = !navigator.deviceMemory || navigator.deviceMemory >= 4;

        const fm = new window.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        fm.setOptions({
          maxNumFaces: 1,
          refineLandmarks,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5
        });

        fm.onResults((results) => {
          processingLockRef.current = false;
          onResultsRef.current(results);
        });

        faceMeshRef.current = fm;
        if (!cancelled) setStatus('ready');
      } catch (err) {
        if (!cancelled) setStatus('error');
      }
    }

    init();

    // Cleanup: close FaceMesh and free WASM memory
    return () => {
      cancelled = true;
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close(); } catch (e) { /* ignore */ }
        faceMeshRef.current = null;
      }
    };
  }, []);

  // Send an image to FaceMesh for detection (non-re-entrant via processing lock)
  const detectFace = useCallback(async (imageElement) => {
    if (!faceMeshRef.current || processingLockRef.current) return false;
    processingLockRef.current = true;
    try {
      await faceMeshRef.current.send({ image: imageElement });
      return true;
    } catch (err) {
      processingLockRef.current = false;
      return false;
    }
  }, []);

  return { status, detectFace };
}