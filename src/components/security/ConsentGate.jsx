/**
 * ConsentGate
 * Shown before the camera opens. Plain-language explanation of what is
 * collected, why, where it is processed, and how to delete it. Requires an
 * explicit, non-pre-ticked tick. Stores a consent record (UserConsent) with
 * timestamp (created_date) and policy version. Age is verified earlier by
 * AgeGate, so age_verified_18 is recorded as true here.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { logAuditEvent } from '@/lib/auditLogger';

const POLICY_VERSION = '2026-11';

export default function ConsentGate({ onConsent, onDecline }) {
  const [agreed, setAgreed] = useState(false); // not pre-ticked
  const [submitting, setSubmitting] = useState(false);

  const persistConsent = async (granted) => {
    try {
      const user = await base44.auth.me();
      await base44.entities.UserConsent.create({
        user_id: user?.id || '',
        consent_type: 'image_analysis',
        granted,
        granted_at: new Date().toISOString(),
        consent_version: POLICY_VERSION,
        age_verified_18: true
      });
    } catch (err) {
      console.error('Failed to persist consent:', err);
    }
  };

  const handleGrant = async () => {
    setSubmitting(true);
    await persistConsent(true);
    await logAuditEvent({
      action: 'consent_granted',
      resourceType: 'selfie',
      metadata: { consent_type: 'image_analysis', policy_version: POLICY_VERSION },
      success: true
    });
    onConsent();
  };

  const handleDecline = async () => {
    await persistConsent(false);
    await logAuditEvent({
      action: 'consent_denied',
      resourceType: 'selfie',
      metadata: { consent_type: 'image_analysis' },
      success: true
    });
    onDecline();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-black text-white flex flex-col px-6 pt-10 pb-10"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/30 mb-4">
          <Shield className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Photo Privacy & Consent</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Please review how your photos are handled before we begin.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {[
          {
            icon: <Eye className="w-5 h-5 text-pink-400" />,
            title: 'What we collect',
            desc: 'Up to 3 face photos: front, right profile and left profile.'
          },
          {
            icon: <Lock className="w-5 h-5 text-pink-400" />,
            title: 'Why & where it is processed',
            desc: 'Your photos are sent to Anthropic (Claude), a third-party AI provider, to detect visible skin concerns. They are stored privately in your account — never on a public URL.'
          },
          {
            icon: <Shield className="w-5 h-5 text-pink-400" />,
            title: 'Only for skin analysis',
            desc: 'Your images are used only for your skin analysis and not shared for marketing or any other purpose.'
          },
          {
            icon: <Trash2 className="w-5 h-5 text-pink-400" />,
            title: 'How to delete',
            desc: 'Delete everything — photos, profile and history — anytime from your Profile page using "Delete All My Data".'
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-4"
          >
            <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">{item.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Explicit tick — not pre-ticked */}
      <button
        onClick={() => setAgreed(!agreed)}
        className="flex items-start gap-3 mb-6 text-left"
      >
        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
          agreed ? 'bg-pink-500 border-pink-500' : 'border-gray-600 bg-transparent'
        }`}>
          {agreed && <CheckCircle className="w-4 h-4 text-white" />}
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          I understand my photos will be sent to Anthropic (Claude) for AI skin analysis, stored privately in my account, and that I can delete them anytime.
        </p>
      </button>

      <div className="space-y-3 mt-auto">
        <Button
          onClick={handleGrant}
          disabled={!agreed || submitting}
          className="w-full h-14 rounded-xl font-semibold text-white text-base disabled:opacity-40"
          style={{ background: agreed ? '#FF69B4' : undefined }}
        >
          I Consent — Start Face Scan
        </Button>
        <Button
          variant="ghost"
          onClick={handleDecline}
          className="w-full h-12 rounded-xl text-gray-400 hover:text-white text-sm"
        >
          Decline — Analyse without photo
        </Button>
      </div>
    </motion.div>
  );
}