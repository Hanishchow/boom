import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// NOTE TO OWNER: Replace the placeholder Grievance Officer name and email below
// with your real designated officer details (required under India DPDP Act, 2023).
const GRIEVANCE_OFFICER_NAME = '[Grievance Officer Name]';
const GRIEVANCE_OFFICER_EMAIL = '[grievance email]';

export default function Grievance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-gray-900 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-900">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold">Grievance Officer</h1>
      </div>

      <div className="px-4 pt-6 space-y-6 text-sm leading-relaxed text-gray-300">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-xl font-bold text-white">Grievance Redressal</h2>
          <p>
            Under the Digital Personal Data Protection Act, 2023 (DPDP Act), Célure AI has designated a Grievance Officer to address complaints and concerns about your personal data.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Grievance Officer</p>
                <p className="text-white font-medium">{GRIEVANCE_OFFICER_NAME}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a href={`mailto:${GRIEVANCE_OFFICER_EMAIL}`} className="text-pink-400 font-medium break-all">
                  {GRIEVANCE_OFFICER_EMAIL}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Response time</p>
                <p className="text-white font-medium">Within 30 days of receiving a complaint</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-amber-300/80 text-xs leading-relaxed">
            The name and email above are placeholders. Please update them with your designated Grievance Officer's real details before publishing.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-white font-semibold">How to raise a grievance</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>Email the Grievance Officer with your name, the issue, and the date it occurred.</li>
            <li>Include any relevant details such as your account email or scan date.</li>
            <li>We will acknowledge your complaint and respond within the timeframes set by the DPDP Act.</li>
          </ul>
          <p className="text-gray-400 pt-1">
            If you are not satisfied with the resolution, you may also lodge a complaint with the Data Protection Board of India.
          </p>
        </motion.div>
      </div>
    </div>
  );
}