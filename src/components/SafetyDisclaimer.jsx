import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SafetyDisclaimer({ className = "" }) {
  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-sm text-amber-800">
        <strong>Medical Disclaimer:</strong> This is not medical advice. This app provides general skincare guidance only. 
        If you have severe skin conditions, persistent issues, or concerns, please consult a dermatologist immediately.
      </AlertDescription>
    </Alert>
  );
}