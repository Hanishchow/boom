import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-gray-900 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-900">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold">Privacy Policy</h1>
      </div>

      <div className="px-4 pt-6 space-y-6 text-sm leading-relaxed text-gray-300">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-bold text-white">Célure AI — Privacy Policy</h2>
          </div>
          <p>Last updated: May 2026</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">1. Information We Collect</h3>
          <p>
            When you use Célure AI, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li><strong className="text-gray-200">Selfie images (3 angles):</strong> Front-facing, right profile, and left profile photos of your face. These are used exclusively for AI-powered skin analysis to detect visible skin concerns.</li>
            <li><strong className="text-gray-200">Questionnaire responses:</strong> Skin type, concerns, age group, location, diet, allergies, and budget preferences you voluntarily provide.</li>
            <li><strong className="text-gray-200">Account information:</strong> Name and email address used to identify your account and associate your skin profile with you.</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">2. How We Use Your Data</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li><strong className="text-gray-200">Skin analysis:</strong> Your selfie images are analyzed by artificial intelligence (Claude Sonnet) solely to detect visible skin characteristics such as acne, pigmentation, texture, oiliness, and hydration levels.</li>
            <li><strong className="text-gray-200">Personalized recommendations:</strong> We combine image analysis with your questionnaire responses to generate a customized skincare routine and product suggestions.</li>
            <li><strong className="text-gray-200">Improvement:</strong> Aggregated, anonymized data helps us improve analysis accuracy. Individual images are never used for training.</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">3. Data Storage & Security</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>Selfie images are stored in <strong className="text-gray-200">encrypted private storage</strong> — never in a public URL or accessible to other users.</li>
            <li>Access to your data is <strong className="text-gray-200">strictly scoped to your user account</strong>. Row-level security ensures no other user can access your information.</li>
            <li>Your Claude API analysis is processed in real-time and not stored by Anthropic beyond the immediate API call.</li>
            <li>All data is transmitted over HTTPS and encrypted at rest.</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">4. Biometric Data Notice (India DPDP Act 2023)</h3>
          <p>Under the Digital Personal Data Protection Act, 2023 (DPDP Act), your facial images qualify as <strong className="text-gray-200">sensitive personal data</strong>. We:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>Obtain your <strong className="text-gray-200">explicit consent</strong> before any face image is captured or uploaded.</li>
            <li>Process images <strong className="text-gray-200">only for the specific purpose</strong> of skin analysis you consented to.</li>
            <li>Allow you to <strong className="text-gray-200">withdraw consent at any time</strong> by deleting your data from your Profile page.</li>
            <li>Never share your biometric data with <strong className="text-gray-200">third parties</strong> for marketing, advertising, or any purpose other than skin analysis.</li>
            <li>Retain your images <strong className="text-gray-200">only as long as you have an active account</strong>. Deletion is permanent and irreversible.</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">5. Your Rights</h3>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li><strong className="text-gray-200">Access</strong> all data we hold about you.</li>
            <li><strong className="text-gray-200">Correct</strong> any inaccurate information.</li>
            <li><strong className="text-gray-200">Delete</strong> your entire data and images from the Profile page at any time.</li>
            <li><strong className="text-gray-200">Withdraw consent</strong> at any time without affecting the lawfulness of prior processing.</li>
            <li><strong className="text-gray-200">Complain</strong> to the Data Protection Board of India if you believe your rights are violated.</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">6. Data Retention</h3>
          <p>
            Your profile data and images are retained for as long as your account remains active. Upon account deletion or data deletion request, all associated records (profile, routine, products, analysis history, consent records, and uploaded images) are permanently erased from our systems.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">7. Contact</h3>
          <p>
            For privacy-related inquiries, data deletion requests, or concerns, please contact us at the email address associated with your account or reach out through our Contact page.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-amber-300/80 text-xs leading-relaxed">
            This privacy policy is provided for informational purposes and does not constitute legal advice. For comprehensive compliance with the DPDP Act 2023, we recommend consulting a qualified legal professional.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
