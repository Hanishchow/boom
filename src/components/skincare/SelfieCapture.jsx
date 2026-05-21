import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Camera, ChevronLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ConsentGate from '@/components/security/ConsentGate';
import { validateImageFile } from '@/lib/inputSanitizer';
import { logAuditEvent } from '@/lib/auditLogger';

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

const CAPTURE_STEPS = [
  {
    id: 'front',
    title: 'Front Face',
    description: 'Look straight into the camera with a neutral expression',
    guide: 'Position your face in the oval',
    icon: '😐'
  },
  {
    id: 'right',
    title: 'Right Profile',
    description: 'Turn your head to show your right side',
    guide: 'Turn right — show your right cheek & jaw',
    icon: '➡️'
  },
  {
    id: 'left',
    title: 'Left Profile',
    description: 'Turn your head to show your left side',
    guide: 'Turn left — show your left cheek & jaw',
    icon: '⬅️'
  }
];

export default function SelfieCapture({ onImagesAnalyzed, onSkip, isAnalyzing }) {
  const [phase, setPhase] = useState('consent'); // consent | instructions | capture
  const [captureStep, setCaptureStep] = useState(0); // 0=front, 1=right, 2=left
  const [captured, setCaptured] = useState({ front: null, right: null, left: null });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const currentCapture = CAPTURE_STEPS[captureStep];
  const capturedKeys = Object.keys(captured).filter(k => captured[k]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate via sanitizer
    const validation = validateImageFile(file);
    if (!validation.valid) { setError(validation.error); return; }

    setError(null);
    setUploading(true);

    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      // Store private URI and base64 data for backend function analysis
      const file_url = file_uri;
      const data_url = await readFileAsDataURL(file);
      const key = currentCapture.id;
      const updated = { ...captured, [key]: { url: file_url, data: data_url } };
      setCaptured(updated);

      await logAuditEvent({
        action: 'selfie_uploaded',
        resourceType: 'selfie',
        metadata: { step: key },
        success: true
      });

      if (captureStep < CAPTURE_STEPS.length - 1) {
        setCaptureStep(captureStep + 1);
      }
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError('Upload failed. Please try again.');
      await logAuditEvent({ action: 'selfie_uploaded', resourceType: 'selfie', metadata: { step: currentCapture.id }, success: false });
    }
    setUploading(false);
  };

  const handleAnalyze = () => {
    onImagesAnalyzed(captured);
  };

  const allCaptured = captured.front && captured.right && captured.left;

  if (phase === 'consent') {
    return (
      <ConsentGate
        onConsent={() => setPhase('instructions')}
        onDecline={onSkip}
      />
    );
  }

  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col px-6 pt-10 pb-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-1" style={{ color: '#FF69B4' }}>Célure</h1>
          <p className="text-pink-300 text-xs tracking-widest mb-6">SKINCARE, PERFECTED BY AI</p>
          <h2 className="text-2xl font-bold mb-2">Face Scan Instructions</h2>
          <p className="text-gray-400 text-sm">Follow these steps for the most accurate skin analysis</p>
        </div>

        <div className="space-y-4 mb-8">
          {[
            { icon: '👓', text: 'Remove glasses or spectacles' },
            { icon: '☀️', text: 'Ensure you are in a well-lit room with natural lighting' },
            { icon: '🌑', text: 'Keep your face clearly visible without shadows' },
            { icon: '😐', text: 'Maintain a neutral facial expression' },
            { icon: '📸', text: 'We will capture 3 photos: front, right & left profile' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-4"
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <p className="text-sm text-gray-200 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-auto space-y-3">
          <Button
            onClick={() => setPhase('capture')}
            className="w-full h-14 rounded-xl font-semibold text-white text-base"
            style={{ background: '#FF69B4' }}
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Face Scan
          </Button>
          <Button
            variant="ghost"
            onClick={onSkip}
            className="w-full h-12 rounded-xl text-gray-400 hover:text-white"
          >
            Skip — Analyse without photo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 pt-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => captureStep > 0 ? setCaptureStep(captureStep - 1) : setPhase('instructions')}
          className="text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-lg font-bold">Photo {captureStep + 1} of 3</h2>
          <p className="text-gray-400 text-xs">{currentCapture.title}</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mb-6">
        {CAPTURE_STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-1.5 rounded-full transition-all ${
              i < captureStep ? 'bg-pink-500' : i === captureStep ? 'bg-pink-400' : 'bg-gray-700'
            }`} />
            <div className="flex items-center gap-1">
              {captured[s.id] ? (
                <CheckCircle className="w-3 h-3 text-green-400" />
              ) : (
                <div className={`w-3 h-3 rounded-full border ${i === captureStep ? 'border-pink-400' : 'border-gray-600'}`} />
              )}
              <span className="text-xs text-gray-400">{s.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Face Guide Area */}
      <div className="flex-1 flex flex-col items-center justify-center mb-6">
        <div className="relative flex items-center justify-center mb-4">
          {/* Face oval guide */}
          <div
            className="border-4 border-dashed rounded-full flex items-center justify-center"
            style={{
              width: 220,
              height: 280,
              borderColor: captured[currentCapture.id] ? '#22c55e' : '#FF69B4',
              opacity: 0.7
            }}
          >
            <span className="text-5xl">{currentCapture.icon}</span>
          </div>
          {captured[currentCapture.id] && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
          )}
        </div>

        <p className="text-white font-semibold text-lg text-center mb-1">{currentCapture.title}</p>
        <p className="text-gray-400 text-sm text-center">{currentCapture.description}</p>
        <p className="text-pink-400 text-xs text-center mt-1">{currentCapture.guide}</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/30 p-3 rounded-xl mb-4">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="space-y-3">
        {!allCaptured ? (
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isAnalyzing}
            className="w-full h-14 rounded-xl font-semibold text-white text-base"
            style={{ background: '#FF69B4' }}
          >
            {uploading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</>
            ) : captured[currentCapture.id] ? (
              <><Camera className="w-5 h-5 mr-2" /> Retake {currentCapture.title}</>
            ) : (
              <><Camera className="w-5 h-5 mr-2" /> Capture {currentCapture.title}</>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full h-14 rounded-xl font-semibold text-white text-base"
            style={{ background: '#FF69B4' }}
          >
            {isAnalyzing ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              '🔍 Analyse My Skin'
            )}
          </Button>
        )}

        {allCaptured && !isAnalyzing && (
          <p className="text-center text-green-400 text-sm">✓ All 3 photos captured successfully</p>
        )}

        <Button variant="ghost" onClick={onSkip} disabled={uploading || isAnalyzing}
          className="w-full h-10 text-gray-500 hover:text-gray-300 text-sm">
          Skip photo analysis
        </Button>
      </div>
    </div>
  );
}