import React, { useState, useRef } from 'react';
import { Camera, Check, ArrowRight, RefreshCw, ScanLine } from 'lucide-react';

const ANGLES = [
  { key: 'front', label: 'Front View', desc: 'Face the camera directly' },
  { key: 'right', label: 'Right Profile', desc: 'Turn your head to the right' },
  { key: 'left', label: 'Left Profile', desc: 'Turn your head to the left' },
];

export default function MultiPhotoUpload({ scanPhotos, initialFrontPhoto, onPhotosReady }) {
  const [photos, setPhotos] = useState({
    front: initialFrontPhoto || null,
    right: null,
    left: null,
  });
  const fileInputRefs = useRef({});

  const allReady = photos.front && photos.right && photos.left;

  const handleFile = (angle, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotos(prev => ({ ...prev, [angle]: url }));
  };

  const handleUseScanPhotos = () => {
    if (!scanPhotos) return;
    setPhotos({
      front: scanPhotos.front || photos.front,
      right: scanPhotos.right || photos.right,
      left: scanPhotos.left || photos.left,
    });
  };

  const handleRetake = (angle) => {
    setPhotos(prev => ({ ...prev, [angle]: null }));
  };

  const hasScanPhotos = scanPhotos && (scanPhotos.front || scanPhotos.right || scanPhotos.left);

  return (
    <div className="px-4 pt-4 pb-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-lg font-semibold mb-1">Upload Your Photos</h2>
        <p className="text-sm text-gray-400">Three angles for comprehensive AI analysis</p>
      </div>

      {hasScanPhotos && (
        <button
          onClick={handleUseScanPhotos}
          className="w-full mb-6 h-12 bg-gray-800 border border-pink-500/30 rounded-full font-medium text-sm flex items-center justify-center gap-2 text-pink-400"
        >
          <ScanLine className="w-4 h-4" /> Use Photos from Recent Scan
        </button>
      )}

      <div className="space-y-4">
        {ANGLES.map(angle => {
          const photo = photos[angle.key];
          return (
            <div key={angle.key} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                {/* Photo slot */}
                <div className="flex-shrink-0">
                  {photo ? (
                    <div className="relative">
                      <img src={photo} alt={angle.label} className="w-20 h-20 rounded-xl object-cover" />
                      <button
                        onClick={() => handleRetake(angle.key)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center"
                      >
                        <RefreshCw className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-800 border border-dashed border-gray-700 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Label + upload */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {photo && <Check className="w-4 h-4 text-green-400" />}
                    <h3 className="text-sm font-medium">{angle.label}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{angle.desc}</p>
                  <input
                    ref={el => { fileInputRefs.current[angle.key] = el; }}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={e => handleFile(angle.key, e.target.files?.[0])}
                  />
                  <button
                    onClick={() => fileInputRefs.current[angle.key]?.click()}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300"
                  >
                    {photo ? 'Change' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onPhotosReady(photos)}
        disabled={!allReady}
        className="w-full mt-6 h-12 bg-pink-500 rounded-full font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        Analyze with AI <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-xs text-gray-600 text-center mt-4">
        Your photos stay on your device. They are not uploaded unless you explicitly share them with a clinic.
      </p>
    </div>
  );
}