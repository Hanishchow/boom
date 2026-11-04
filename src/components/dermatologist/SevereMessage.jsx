import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SevereMessage({ onContinue }) {
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold mb-3">Severe acne detected</h2>
      <p className="text-gray-300 text-sm leading-relaxed mb-2 max-w-sm">
        Your scan shows signs of severe acne. We suggest you visit a nearby dermatologist for proper treatment.
      </p>
      <p className="text-gray-500 text-xs leading-relaxed mb-8 max-w-sm">
        Over-the-counter products may not be enough or safe for this level.
      </p>
      <Button
        onClick={onContinue}
        className="w-full h-14 rounded-xl font-semibold text-base"
        style={{ background: '#FF69B4' }}
      >
        <MapPin className="w-5 h-5 mr-2" />
        Find nearby dermatologists
      </Button>
    </div>
  );
}