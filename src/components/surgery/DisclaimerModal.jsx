import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';

/**
 * Full-screen disclaimer modal shown before accessing the Surgery Simulator.
 * Blocks until user confirms age 18+ and accepts the disclaimer.
 */
export default function DisclaimerModal({ userAge, onAccept, onGoBack }) {
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-pink-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-4">Before You Explore</h1>

        {/* Body */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            The Surgery Simulator is a visual preview tool only. Simulations do not
            represent guaranteed surgical outcomes. All procedures shown carry medical
            risks. Always consult a qualified, board-certified plastic surgeon before
            making any decisions.
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            This feature is for users aged 18 and above.
          </p>
        </div>

        {/* Warning banner */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80 leading-relaxed">
            For reference only — beauty is not defined by mathematics. Always consult a
            qualified medical professional.
          </p>
        </div>

        {/* Age checkbox */}
        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="w-5 h-5 rounded accent-pink-500"
          />
          <span className="text-sm text-gray-300">
            I confirm I am 18 years or older
          </span>
        </label>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={onAccept}
            disabled={!ageConfirmed}
            className="w-full h-12 bg-pink-500 rounded-full font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            I Understand — Continue
          </button>
          <button
            onClick={onGoBack}
            className="w-full h-12 bg-gray-900 border border-gray-800 rounded-full font-medium text-sm text-gray-400"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}