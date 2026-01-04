import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  RefreshCw, 
  Download, 
  Share2, 
  ArrowLeft,
  Loader2,
  AlertTriangle,
  History,
  CheckCircle
} from 'lucide-react';

import SkinProfileCard from '@/components/skincare/SkinProfileCard';
import RoutineDisplay from '@/components/skincare/RoutineDisplay';
import ProductRecommendations from '@/components/skincare/ProductRecommendations';
import { validateSafetyRules } from '@/components/skincare/SkinAnalysisEngine';

export default function Results() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [routine, setRoutine] = useState(null);
  const [products, setProducts] = useState([]);
  const [safetyWarnings, setSafetyWarnings] = useState([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      // Get profile ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const profileId = urlParams.get('profile');

      if (!profileId) {
        // Try to get latest profile
        const profiles = await base44.entities.SkinProfile.list('-created_date', 1);
        if (profiles.length === 0) {
          navigate(createPageUrl('SkinAnalysis'));
          return;
        }
        loadProfileData(profiles[0].id);
      } else {
        await loadProfileData(profileId);
      }
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Failed to load your results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadProfileData = async (profileId) => {
    // Load profile
    const profiles = await base44.entities.SkinProfile.filter({ id: profileId });
    if (profiles.length === 0) {
      navigate(createPageUrl('SkinAnalysis'));
      return;
    }
    setProfile(profiles[0]);

    // Load routine
    const routines = await base44.entities.SkincareRoutine.filter({ profile_id: profileId });
    if (routines.length > 0) {
      setRoutine(routines[0]);
    }

    // Load products
    const prods = await base44.entities.ProductRecommendation.filter({ profile_id: profileId });
    setProducts(prods);

    // Validate safety
    const warnings = validateSafetyRules(prods);
    setSafetyWarnings(warnings);
  };

  const handleStartNew = () => {
    navigate(createPageUrl('SkinAnalysis'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 mx-auto text-rose-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleStartNew}>
              Start New Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <span className="font-semibold text-gray-800">Your Results</span>
          </div>

          <div className="flex items-center gap-2">
            <Link to={createPageUrl('History')}>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <History className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4 text-center"
      >
        <p className="flex items-center justify-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4" />
          Your personalized skincare routine is ready!
        </p>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Skin Profile */}
        {profile && (
          <SkinProfileCard profile={profile} />
        )}

        {/* Routine */}
        {routine && (
          <RoutineDisplay routine={routine} />
        )}

        {/* Products */}
        {products.length > 0 && (
          <ProductRecommendations 
            products={products} 
            warnings={safetyWarnings}
          />
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important Disclaimer</p>
                <p>
                  This is not medical advice. These recommendations are for general skincare guidance only. 
                  If you have persistent skin issues, allergic reactions, or medical conditions, 
                  please consult a qualified dermatologist.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={handleStartNew}
            variant="outline"
            className="flex-1 py-6"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Start New Analysis
          </Button>
          
          <Link to={createPageUrl('History')} className="flex-1">
            <Button
              variant="default"
              className="w-full py-6 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
            >
              <History className="w-5 h-5 mr-2" />
              View History
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>
            Products recommended are available at Indian pharmacies like Apollo, MedPlus, PharmEasy, and local medical stores.
          </p>
        </div>
      </footer>
    </div>
  );
}