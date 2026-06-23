import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * SkinCameraCapture — live camera frame capture for skin analysis.
 *
 * Uses navigator.mediaDevices.getUserMedia to stream the front camera,
 * overlays an oval face guide, and on "Capture" extracts a JPEG frame
 * via canvas. Optionally polls in "live preview" mode (1 frame / 3s).
 *
 * Props:
 *   onCapture({url, data}) — called with private file URI + base64 JPEG
 *   onLiveAnalysis(data)    — optional, called with live-poll result
 *   liveMode                — if true, poll backend every 3s before capture
 *   onError(msg)            — optional error callback
 */
export default function SkinCameraCapture({ onCapture, onLiveAnalysis, liveMode = false, onError }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const pollRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [liveConcern, setLiveConcern] = useState(null);

  // Stop all video tracks and release the camera
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  }, []);

  // Extract a single frame from the video element to a base64 JPEG
  const extractFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    // Create canvas in memory — never append to DOM
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  // Start the camera stream
  const startCamera = useCallback(async () => {
    setError(null);
    // getUserMedia requires HTTPS or localhost
    if (
      typeof window !== 'undefined' &&
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      const msg = 'Camera access requires a secure (HTTPS) connection. Please use photo upload instead.';
      setError(msg);
      onError?.(msg);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = 'No camera detected. Use photo upload instead.';
      setError(msg);
      onError?.(msg);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreaming(true);
    } catch (err) {
      let msg;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera access denied. Please allow camera permission in your browser settings, or use photo upload instead.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera detected. Use photo upload instead.';
      } else {
        msg = 'Camera unavailable. Use photo upload instead.';
      }
      setError(msg);
      onError?.(msg);
    }
  }, [onError]);

  // Handle capture button
  const handleCapture = useCallback(async () => {
    setCapturing(true);
    const dataUrl = extractFrame();
    // Stop polling if active
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    // Stop the stream to release the camera
    stopStream();
    if (dataUrl) {
      try {
        // Upload the captured frame to private storage
        const blob = await (await fetch(dataUrl)).blob();
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: blob });
        onCapture?.({ url: file_uri, data: dataUrl });
      } catch (e) {
        // Fallback: pass data URL directly without private storage
        onCapture?.({ url: dataUrl, data: dataUrl });
      }
    } else {
      const msg = 'Failed to capture frame. Please try again or use photo upload.';
      setError(msg);
      onError?.(msg);
    }
    setCapturing(false);
  }, [extractFrame, onCapture, stopStream, onError]);

  // Live preview polling (optional) — max 1 frame / 3 seconds
  useEffect(() => {
    if (!streaming || !liveMode) return;
    pollRef.current = setInterval(async () => {
      const frame = extractFrame();
      if (!frame) return;
      try {
        const result = await base44.functions.invoke('analyze-skin', {
          frontImage: frame,
          livePreview: true,
        });
        if (result?.detected_concerns?.length) {
          const top = [...result.detected_concerns].sort((a, b) => b.confidence - a.confidence)[0];
          setLiveConcern(top?.concern || null);
          onLiveAnalysis?.(result);
        }
      } catch (e) {
        // Silent — live preview is best-effort
      }
    }, 3000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [streaming, liveMode, extractFrame, onLiveAnalysis]);

  // Start camera on mount, stop on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Camera viewport */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden mb-4">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover -scale-x-100"
        />
        {/* Oval face guide overlay */}
        {streaming && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <ellipse
              cx="50"
              cy="45"
              rx="28"
              ry="38"
              fill="none"
              stroke="var(--color-primary, #ec4899)"
              strokeWidth="0.8"
              strokeDasharray="3 2"
              opacity="0.4"
            />
          </svg>
        )}
        {/* Live indicator */}
        {liveMode && streaming && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-medium">Live</span>
          </div>
        )}
        {/* Live concern display */}
        {liveMode && liveConcern && (
          <div className="absolute bottom-3 left-3 right-3 bg-black/60 px-3 py-1.5 rounded-lg">
            <p className="text-white text-xs">
              Detected: <span className="font-semibold capitalize">{liveConcern}</span>
            </p>
          </div>
        )}
        {/* Error / loading overlay */}
        {!streaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <CameraOff className="w-10 h-10 text-gray-500 mb-3" />
            <p className="text-gray-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {!error && (
        <Button
          onClick={handleCapture}
          disabled={!streaming || capturing}
          className="w-full max-w-sm h-14 rounded-xl font-semibold text-white text-base"
          style={{ background: 'var(--color-primary, #FF69B4)' }}
        >
          {capturing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Capturing...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-2" /> Capture Photo
            </>
          )}
        </Button>
      )}
    </div>
  );
}