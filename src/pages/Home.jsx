import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, Trash2, Stethoscope, Camera } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="text-center pt-12 pb-2 px-6">
        <h1 className="text-5xl font-bold mb-2" style={{ color: '#FF69B4' }}>Célure AI</h1>
        <p className="text-pink-300 text-sm tracking-widest">SKINCARE, PERFECTED BY AI</p>
      </div>

      {/* Hero / promise */}
      <div className="px-6 pt-6 pb-4 text-center">
        <h2 className="text-2xl font-bold mb-3 leading-tight">Skincare made 

        </h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          A personalised skincare routine built for Indian skin, climate and budget.
        </p>
        <button
          onClick={() => navigate(createPageUrl('SkinAnalysis'))}
          className="w-full max-w-sm mx-auto h-14 rounded-full font-semibold text-white text-base flex items-center justify-center gap-2"
          style={{ background: '#FF69B4' }}>
          
          <Camera className="w-5 h-5" />
          Start free skin scan
        </button>
      </div>

      {/* Sample report */}
      <div className="px-6 mt-10">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Sample skin report</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700">SAMPLE</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Illustrative example — your report is generated from your own scan.</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-950 rounded-xl p-3">
              <span className="text-sm text-gray-300">Skin type</span>
              <span className="text-sm text-pink-300">Combination</span>
            </div>
            <div className="flex items-center justify-between bg-gray-950 rounded-xl p-3">
              <span className="text-sm text-gray-300">Top concern</span>
              <span className="text-sm text-pink-300">Acne</span>
            </div>
            <div className="flex items-center justify-between bg-gray-950 rounded-xl p-3">
              <span className="text-sm text-gray-300">Suggested routine</span>
              <span className="text-sm text-pink-300">Cleanser → Serum → Sunscreen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust points */}
      <div className="px-6 mt-8 space-y-3">
        <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <Shield className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-200">Your photos stay private — stored securely, never shown publicly.</p>
        </div>
        <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <Trash2 className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-200">Delete your data anytime — one tap removes your scans and profile.</p>
        </div>
        <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <Stethoscope className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-200">Cosmetic guidance, not a medical diagnosis — see a dermatologist for any concern.</p>
        </div>
      </div>
    </div>);

}