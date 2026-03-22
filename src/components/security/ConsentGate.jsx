/**
 * ConsentGate
 * Displayed before any selfie capture. User must explicitly grant consent
 * before images are captured or uploaded. Logs consent decision to AuditLog.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logAuditEvent } from '@/lib/auditLogger';

export default function ConsentGate({ onConsent, onDecline }) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGrant = async () => {
    setSubmitting(true);
    await logAuditEvent({
      action: 'consent_granted',
      resourceType: 'selfie',
      metadata: { consent_type: 'image_analysis' },
      success: true
    });
    onConsent();
  };

  const handleDecline = async () => {
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
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/30 mb-4">
          <Shield className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Photo Privacy & Consent</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Before we capture your photos, please review how we handle your images.
        </p>
      </div>

      {/* Promises */}
      <div className="space-y-3 mb-8">
        {[
          {
            icon: <Lock className="w-5 h-5 text-pink-400" />,
            title: 'Encrypted private storage',
            desc: 'Your selfies are stored in a private, encrypted bucket — never in a public URL.'
          },
          {
            icon: <Eye className="w-5 h-5 text-pink-400" />,
            title: 'Used only for skin analysis',
            desc: 'Images are processed by AI solely to detect visible skin concerns. They are not shared with third parties.'
          },
          {
            icon: <Trash2 className="w-5 h-5 text-pink-400" />,
            title: 'You can delete at any time',
            desc: 'Delete your account and all images from your Profile page. We permanently erase all your data.'
          },
          {
            icon: <Shield className="w-5 h-5 text-pink-400" />,
            title: 'Isolated to your account',
            desc: 'Your data is strictly scoped to your user ID. No other user can access it.'
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

      {/* Agreement checkbox */}
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
          I understand and agree that my facial photos will be stored securely and used only for AI skin analysis within Célure.
        </p>
      </button>

      {/* Actions */}
      <div className="space-y-3 mt-auto">
        <Button
          onClick={handleGrant}
          disabled={!agreed || submitting}
          className="w-full h-14 rounded-xl font-semibold text-white text-base disabled:opacity-40"
          style={{ background: agreed ? '#FF69B4' : undefined }}
        >
          ✅ I Consent — Start Face Scan
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