import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertTriangle, History, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';
import { validateSafetyRules } from '@/components/skincare/SkinAnalysisEngine';
import { logAuditEvent } from '@/lib/auditLogger';
import SkinMetricsCard from '@/components/skincare/SkinMetricsCard';
import RoutineDisplay from '@/components/skincare/RoutineDisplay';
import ProductRecommendations from '@/components/skincare/ProductRecommendations';

const TABS = ['Overview', 'Routine', 'Products'];

export default function Results() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [routine, setRoutine] = useState(null);
  const [products, setProducts] = useState([]);
  const [safetyWarnings, setSafetyWarnings] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => { loadResults(); }, []);

  const loadResults = async () => {
    setLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('profile');

    let id = profileId;
    if (!id) {
      const profiles = await base44.entities.SkinProfile.list('-created_date', 1);
      if (profiles.length === 0) { navigate(createPageUrl('SkinAnalysis')); return; }
      id = profiles[0].id;
    }

    const profiles = await base44.entities.SkinProfile.filter({ id });
    if (profiles.length === 0) { navigate(createPageUrl('SkinAnalysis')); return; }
    setProfile(profiles[0]);

    const routines = await base44.entities.SkincareRoutine.filter({ profile_id: id });
    if (routines.length > 0) setRoutine(routines[0]);

    const prods = await base44.entities.ProductRecommendation.filter({ profile_id: id });
    setProducts(prods);
    setSafetyWarnings(validateSafetyRules(prods));
    setLoading(false);

    logAuditEvent({
      action: 'results_viewed',
      resourceType: 'SkinProfile',
      resourceId: id,
      metadata: { has_image: !!profiles[0]?.face_image_url },
      success: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 mx-auto text-pink-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  const skinType = profile?.ai_adjusted_skin_type || profile?.skin_type || 'normal';
  const concerns = profile?.primary_concerns || [];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-gray-900 px-4 py-4 flex items-center justify-between">
        <button onClick={() => navigate(createPageUrl('Home'))} className="p-2 rounded-full bg-gray-900">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span className="font-semibold">Your Analysis</span>
        </div>
        <Link to={createPageUrl('History')}>
          <button className="p-2 rounded-full bg-gray-900">
            <History className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
      </div>

      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-600 to-purple-600 py-3 px-4 text-center text-sm"
      >
        ✨ Your personalized skincare routine is ready!
      </motion.div>

      {/* Profile Summary */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-pink-500/10 border-2 border-pink-500/30 flex items-center justify-center text-2xl">
            {skinType === 'oily' ? '✨' : skinType === 'dry' ? '💧' : skinType === 'sensitive' ? '🌸' : '🌿'}
          </div>
          <div>
            <h2 className="text-xl font-bold capitalize">{skinType.replace('_', ' ')} Skin</h2>
            <p className="text-gray-400 text-sm">
              {profile?.name && `${profile.name} · `}
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Concern Tags */}
        {concerns.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {concerns.map(c => (
              <span key={c} className="px-3 py-1 rounded-full text-xs bg-gray-900 border border-gray-800 text-pink-300 capitalize">
                {c.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex mx-4 bg-gray-900 rounded-2xl p-1 mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-pink-500 text-white' : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4">
        {activeTab === 'Overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <SkinMetricsCard profile={profile} />

            {/* Issues Detail */}
            {concerns.length > 0 && (
              <div className="bg-gray-950 border border-gray-800 rounded-3xl p-5">
                <h3 className="text-white font-bold mb-4">Skin Issues Detected</h3>
                <div className="space-y-3">
                  {concerns.map((concern, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-red-400' : 'bg-amber-400'}`} />
                        <span className="text-white capitalize text-sm">{concern.replace('_', ' ')}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${i === 0 ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {i === 0 ? 'Primary' : 'Secondary'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History CTA */}
            <button
              onClick={() => navigate(createPageUrl('History'))}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-pink-500" />
                <span className="text-sm text-white">View Analysis History</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>

            {/* Disclaimer */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-300/80 text-xs leading-relaxed">
                This is not medical advice. For persistent skin issues, consult a qualified dermatologist.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'Routine' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {routine ? (
              <RoutineDisplay routine={routine} />
            ) : (
              <div className="text-center py-12 text-gray-500">No routine data available</div>
            )}
          </motion.div>
        )}

        {activeTab === 'Products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {products.length > 0 ? (
              <ProductRecommendations products={products} warnings={safetyWarnings} />
            ) : (
              <div className="text-center py-12 text-gray-500">No product recommendations yet</div>
            )}
          </motion.div>
        )}
      </div>

      {/* Action */}
      <div className="px-4 mt-8">
        <Button
          onClick={() => navigate(createPageUrl('SkinAnalysis'))}
          variant="outline"
          className="w-full h-14 rounded-full border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10 bg-transparent"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Start New Scan
        </Button>

        {/* Surgery Simulator CTA */}
        <button
          onClick={() => navigate(`/surgery-simulator${profile?.face_image_url ? `?photo=${encodeURIComponent(profile.face_image_url)}` : ''}`)}
          className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full h-14 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Sparkles className="w-5 h-5" />
          Explore what cosmetic procedures could enhance your features →
        </button>
      </div>
    </div>
  );
}