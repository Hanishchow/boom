import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Camera, Package, ChevronRight } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [selfieUrl, setSelfieUrl] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      const userName = currentUser?.full_name || currentUser?.email || '';

      // Check if this user has completed onboarding
      const onboardingKey = `onboardingComplete_${userName}`;
      const onboardingDone = localStorage.getItem(onboardingKey);
      if (!onboardingDone) {
        // First time — redirect to onboarding
        navigate(createPageUrl('SkinAnalysis'));
        return;
      }

      setUser(currentUser);

      // Load only THIS user's data (filtered by email)
      const [analyses, profiles] = await Promise.all([
        base44.entities.AnalysisHistory.filter({ created_by: currentUser.email }, '-created_date', 1),
        base44.entities.SkinProfile.filter({ created_by: currentUser.email }, '-created_date', 1)
      ]);

      if (analyses.length > 0) setLatestAnalysis(analyses[0]);
      if (profiles.length > 0) {
        if (profiles[0].name) setUser(prev => ({ ...prev, full_name: profiles[0].name || prev?.full_name }));
        if (profiles[0].face_image_url) setSelfieUrl(profiles[0].face_image_url);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="text-center pt-8 mb-6">
        <h1 className="text-5xl font-bold mb-2" style={{ color: '#FF69B4' }}>Célure</h1>
        <p className="text-pink-300 text-sm tracking-widest">SKINCARE, PERFECTED BY AI</p>
      </div>

      {/* Hero Carousel Placeholder */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl p-6 h-48 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">Mama Earth Vitamin C Serum</p>
            <p className="text-sm text-gray-300">Brighten your skin with 10% Vitamin C & Turmeric</p>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-pink-500" />
          <div className="w-2 h-2 rounded-full bg-gray-600" />
          <div className="w-2 h-2 rounded-full bg-gray-600" />
        </div>
      </div>

      {/* Greeting */}
      <div className="px-4 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0 border-2 border-pink-500">
          {selfieUrl ? (
            <img src={selfieUrl} alt="You" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">👤</span>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold">
            Hello, <span style={{ color: '#FF69B4' }}>{user?.full_name?.split(' ')[0] || 'there'}!</span>
          </h2>
          <p className="text-gray-400 text-sm">Your personalized skincare journey awaits</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="px-4 space-y-4">
        <Link to={createPageUrl('SkinAnalysis')}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-pink-500/10">
                <Camera className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Skin Scan</h3>
                <p className="text-sm text-gray-400">Analyze your skin and get personalized recommendations</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-pink-500 flex-shrink-0" />
          </div>
        </Link>

        <Link to={createPageUrl('Products')}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-pink-500/10">
                <Package className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Shop Products</h3>
                <p className="text-sm text-gray-400">Browse our curated selection of skincare products</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-pink-500 flex-shrink-0" />
          </div>
        </Link>
      </div>

      {/* Latest Analysis */}
      {latestAnalysis && (
        <div className="px-4 mt-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-1">Your Latest Skin Analysis</h3>
            <p className="text-sm text-gray-400 mb-4">
              {new Date(latestAnalysis.created_date).toLocaleDateString()}
            </p>
            
            <div className="space-y-2 mb-4">
              {latestAnalysis.concerns_detected?.slice(0, 3).map((concern, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    concern.severity === 'high' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-sm capitalize">{concern.concern?.replace('_', ' ')}</span>
                </div>
              ))}
              {(latestAnalysis.concerns_detected?.length || 0) > 3 && (
                <p className="text-sm text-gray-400">+{latestAnalysis.concerns_detected.length - 3} more issues</p>
              )}
            </div>

            <Link to={createPageUrl('Results') + `?profile=${latestAnalysis.profile_id}`}>
              <Button className="w-full bg-pink-500 hover:bg-pink-600 rounded-full h-12">
                View Full Analysis
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Featured Brands */}
      <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Featured Brands</h3>
          <button className="text-sm text-pink-500">See All</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {['Mama Earth', 'Minimalist', 'Foxtale'].map((brand) => (
            <div key={brand} className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-xl px-6 py-4">
              <p className="text-pink-500 font-semibold text-center">{brand}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}