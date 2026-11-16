/**
 * AgeGate
 * Shown BEFORE the questionnaire so we never collect personal data or photos
 * from anyone under 18. Collects date of birth only to verify age; the DOB is
 * passed on only if the user is an adult, and is not stored if they are a minor.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const calcAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default function AgeGate({ onPass, onBack }) {
  const [dob, setDob] = useState('');
  const age = calcAge(dob);
  const isAdult = age != null && age >= 18;

  const maxDate = new Date().toISOString().split('T')[0];
  const minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 pt-12 pb-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/30 mb-4">
          <Shield className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Before you start</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Célure AI is for adults. Please confirm your date of birth to continue.
        </p>
      </div>

      <div className="mb-6">
        <label className="text-gray-300 text-sm mb-2 block">Date of Birth</label>
        <input
          type="date"
          value={dob}
          min={minDate}
          max={maxDate}
          onChange={(e) => setDob(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-white h-14 rounded-xl px-4 text-base focus:outline-none focus:border-pink-500 appearance-none"
          style={{ colorScheme: 'dark' }}
        />
        {dob && age != null && (
          <p className={`text-xs mt-2 ${isAdult ? 'text-pink-400' : 'text-amber-400'}`}>
            Age: {age} years
          </p>
        )}
      </div>

      {dob && !isAdult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-5 mb-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold text-sm mb-1">Parent or guardian consent required</p>
              <p className="text-amber-300/80 text-xs leading-relaxed">
                You must be 18 or older to use Célure AI. If you are under 18, a parent or legal guardian must provide consent. No photos or personal data will be collected from you.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-auto space-y-3">
        <Button
          onClick={() => onPass(dob)}
          disabled={!isAdult}
          className="w-full h-14 rounded-xl font-semibold text-white text-base disabled:opacity-40"
          style={{ background: isAdult ? '#FF69B4' : undefined }}
        >
          Continue
        </Button>
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full h-12 rounded-xl text-gray-400 hover:text-white text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Go back
        </Button>
      </div>
    </div>
  );
}