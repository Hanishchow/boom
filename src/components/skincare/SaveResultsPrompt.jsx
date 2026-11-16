import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from 'lucide-react';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Shown AFTER the result is displayed. Date of birth is already collected at
// the age gate, so here we only ask for name (+ email if not signed in) to save
// the results. A signed-in user is never asked for their email again.
export default function SaveResultsPrompt({ profile, onSaved }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
  const canSubmit = name.trim() && emailValid;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Please enter your name and email.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const update = {
        name: name.trim(),
        email: signedInEmail || email.trim()
      };
      await base44.entities.SkinProfile.update(profile.id, update);
      onSaved(update);
    } catch (e) {
      setError('Could not save. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="mx-4 mb-6 bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/40 rounded-3xl p-5">
      <h3 className="text-lg font-bold text-white mb-1">Save your results</h3>
      <p className="text-gray-400 text-xs mb-4">Save your name so you can track progress and rescan later.</p>

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