import React from 'react';
import { useNavigate } from 'react-router-dom';
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
          <p>Last updated: November 2026</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">1. Information We Collect</h3>
          <p>When you use Célure AI, we collect:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li><strong className="text-gray-200">Selfie images (up to 3 angles):</strong> Front-facing, right profile, and left profile photos of your face, used for AI-powered skin analysis to detect visible skin concerns.</li>
            <li><strong className="text-gray-200">Questionnaire responses:</strong> Skin type, concerns, gender, location, diet, food preference, dairy intake, allergies, and monthly budget you voluntarily provide.</li>
            <li><strong className="text-gray-200">Account information:</strong> Your name, date of birth and email address, used to identify your account and link your skin profile to you.</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">2. How Your Photos Are Processed</h3>
          <p>
            Your selfie images are analysed by <strong className="text-gray-200">Anthropic (Claude), a third-party AI provider</strong>, via their API. When you submit a scan, your images are sent to Anthropic's servers to detect visible skin characteristics such as acne, pigmentation, texture, oiliness and hydration. The analysis result is returned to Célure AI and stored with your profile.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li><strong className="text-gray-200">Personalized recommendations:</strong> We combine the image analysis with your questionnaire responses to generate a skincare routine and product suggestions.</li>
            <li><strong className="text-gray-200">Cosmetic guidance only:</strong> The analysis is cosmetic guidance, not a medical diagnosis. It does not replace a consultation with a qualified dermatologist.</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">3. Data Storage & Security</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>Selfie images are stored in <strong className="text-gray-200">private storage</strong> — they are not published to a public URL and are not accessible to other users.</li>
            <li>Access to your data is <strong className="text-gray-200">scoped to your user account</strong>. Row-level security ensures no other user can read or change your information.</li>
            <li>Data is transmitted over HTTPS.</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">4. Biometric Data Notice (India DPDP Act, 2023)</h3>
          <p>Under the Digital Personal Data Protection Act, 2023, your facial images qualify as <strong className="text-gray-200">sensitive personal data</strong>. We:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>Obtain your <strong className="text-gray-200">explicit consent</strong> before any face image is captured or uploaded.</li>
            <li>Process images <strong className="text-gray-200">only for the specific purpose</strong> of skin analysis that you consented to.</li>
            <li>Allow you to <strong className="text-gray-200">withdraw consent at any time</strong> by deleting your data from your Profile page.</li>
            <li>Share your images with <strong className="text-gray-200">Anthropic only for the purpose of skin analysis</strong>, and not for marketing, advertising or any other purpose.</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">5. Your Rights</h3>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li><strong className="text-gray-200">Access</strong> the data we hold about you.</li>
            <li><strong className="text-gray-200">Correct</strong> inaccurate information.</li>
            <li><strong className="text-gray-200">Delete</strong> your data and images at any time from the Profile page.</li>
            <li><strong className="text-gray-200">Withdraw consent</strong> at any time.</li>
            <li><strong className="text-gray-200">Lodge a grievance</strong> with our Grievance Officer (see the Grievance page) or with the Data Protection Board of India.</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">6. Data Retention</h3>
          <p>
            Your profile data and images are retained for as long as your account is active. When you delete your data, the associated records (profile, routine, product recommendations, analysis history, consent records and uploaded images) are erased.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">7. Contact</h3>
          <p>
            For privacy-related inquiries, data deletion requests, or concerns, contact our Grievance Officer (see the Grievance page) or reach out through the Contact page.
          </p>
        </motion.div>
      </div>
    </div>
  );
}