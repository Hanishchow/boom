import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-gray-900 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-900">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold">Refund Policy</h1>
      </div>

      <div className="px-4 pt-6 space-y-6 text-sm leading-relaxed text-gray-300">
        <div className="flex items-center gap-3 mb-2">
          <Receipt className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-bold text-white">Célure AI — Refund Policy</h2>
        </div>
        <p>Last updated: November 2026</p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">1. Free Scan</h3>
          <p>The first skin scan and routine are free. There is nothing to refund for the free tier.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">2. Rescan Pack (₹99 one-time)</h3>
          <p>
            The Rescan Pack is a one-time purchase of 3 rescans with no auto-renewal. Since the scans are delivered and available immediately after purchase, Rescan Packs are <strong className="text-gray-200">non-refundable</strong> once the scans have been used. If you are charged in error or could not use any of the scans due to a technical issue on our side, contact our Grievance Officer within 7 days and we will review your case.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">3. Premium (₹149/month)</h3>
          <p>
            Premium is a monthly subscription that you can cancel anytime. You keep access until the end of the current paid month. Monthly fees are <strong className="text-gray-200">non-refundable</strong> once charged, except where a charge is clearly in error. Cancel from your account before the next billing date to avoid the next charge.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">4. How to Request a Review</h3>
          <p>
            To request a review of an erroneous charge, contact our Grievance Officer (see the Grievance page) within 7 days of the charge, with the date and amount. Approved reviews will be refunded to the original payment method within 7–10 business days.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold">5. Payments Not Yet Enabled</h3>
          <p>If payments are not yet enabled on your account, no purchases are available and no charges are made.</p>
        </motion.div>
      </div>
    </div>
  );
}