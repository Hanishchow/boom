import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from 'lucide-react';

const calcAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const ageToGroup = (age) => {
  if (age == null) return '';
  if (age < 20) return 'under_20';
  if (age < 30) return '20_30';
  if (age < 40) return '30_40';
  if (age < 50) return '40_50';
  return 'above_50';
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Shown AFTER the result is displayed. Collects name + DOB (+ email only if not signed in)
// so the user can save and track progress. A signed-in user is never asked for their email.
export default function SaveResultsPrompt({ profile, onSaved }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [signedInEmail, setSignedInEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        if (u?.email) setSignedInEmail(u.email);
      } catch (e) {}
    })();
  }, []);

  const emailValid = signedInEmail ? true : (email && isValidEmail(email));
  const canSubmit = name.trim() && dob && emailValid;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Please enter your name, date of birth and email.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const age = calcAge(dob);
      const update = {
        name: name.trim(),
        dob,
        calculated_age: age,
        age_group: ageToGroup(age),
        email: signedInEmail || email.trim()
      };
      await base44.entities.SkinProfile.update(profile.id, update);
      onSaved(update);
    } catch (e) {
      setError('Could not save. Please try again.');
    }
    setSaving(false);
  };

  const maxDate = new Date().toISOString().split('T')[0];
  const minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0];

  return (
    <div className="mx-4 mb-6 bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/40 rounded-3xl p-5">
      <h3 className="text-lg font-bold text-white mb-1">Save your results</h3>
      <p className="text-gray-400 text-xs mb-4">Save your name and date of birth to track progress and rescan later.</p>

      {signedInEmail && (
        <div className="mb-4 bg-gray-900/60 rounded-xl p-3 text-xs text-gray-300">
          Signed in as <span className="text-pink-300 font-medium">{signedInEmail}</span> — your results will be linked to this account.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label className="text-gray-300 text-sm mb-2 block">Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
          />
        </div>

        {!signedInEmail && (
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@email.com"
              className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
            />
          </div>
        )}

        <div>
          <Label className="text-gray-300 text-sm mb-2 block">Date of Birth *</Label>
          <input
            type="date"
            value={dob}
            min={minDate}
            max={maxDate}
            onChange={(e) => setDob(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-white h-12 rounded-xl px-4 text-sm focus:outline-none focus:border-pink-500 appearance-none"
            style={{ colorScheme: 'dark' }}
          />
          {dob && <p className="text-pink-400 text-xs mt-1">Age: {calcAge(dob)} years</p>}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
          className="w-full h-14 rounded-xl font-semibold text-white disabled:opacity-40"
          style={{ background: canSubmit ? '#FF69B4' : undefined }}>
          {saving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save my results</>}
        </Button>
      </div>
    </div>
  );
}