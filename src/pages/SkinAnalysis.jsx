import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

import QuestionnaireForm from '@/components/skincare/QuestionnaireForm';
import SelfieCapture from '@/components/skincare/SelfieCapture';
import { 
  analyzeQuestionnaire, 
  synthesizeSkinProfile,
  generateRoutine,
  getProductRecommendations,
  validateSafetyRules,
  deriveBudget
} from '@/components/skincare/SkinAnalysisEngine';
import { logAuditEvent } from '@/lib/auditLogger';
import { useGenderTheme } from '@/lib/GenderThemeContext';
import { useAqi } from '@/hooks/useAqi';

const STEPS = {
  LOADING: 'loading',
  QUESTIONNAIRE: 'questionnaire',
  IMAGE_UPLOAD: 'image_upload',
  ANALYZING: 'analyzing'
};

export default function SkinAnalysis() {
  const navigate = useNavigate();
  const { applyGenderTheme } = useGenderTheme();
  const { aqiData, fetchAqi } = useAqi();
  const [currentStep, setCurrentStep] = useState(STEPS.LOADING);
  const [questionnaireData, setQuestionnaireData] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');

  useEffect(() => {
    loadExistingProfile();
    fetchAqi();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const currentUser = await base44.auth.me();
      const userName = currentUser?.full_name || currentUser?.email || '';
      // Try to load THIS user's latest profile to pre-fill form
      const profiles = await base44.entities.SkinProfile.filter({ created_by: currentUser.email }, '-created_date', 1);
      if (profiles.length > 0) {
        const p = profiles[0];
        setPrefillData({
          name: p.name || '',
          email: p.email || '',
          gender: p.gender || '',
          age_group: p.age_group || '',
          skin_type: p.skin_type || '',
          skin_types: p.skin_types || (p.skin_type ? [p.skin_type] : []),
          diet_type: p.diet_type || '',
          allergies: p.allergies || '',
          location_city: p.location_city || '',
          pincode: p.pincode || '',
          budget_range: p.budget_range || 'mid-range',
          budget_amount: p.budget_amount || 1500,
          concerns: p.primary_concerns || []
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
    setCurrentStep(STEPS.QUESTIONNAIRE);
  };

  const handleQuestionnaireComplete = (data) => {
    setQuestionnaireData(data);
    setCurrentStep(STEPS.IMAGE_UPLOAD);
  };

  const handleImagesAnalyzed = async (images) => {
    // images = { front: {url, data}, right: {url, data}, left: {url, data} }
    await processAnalysis(questionnaireData, images);
  };

  const handleSkipImage = async () => {
    await processAnalysis(questionnaireData, null);
  };

  const processAnalysis = async (qData, images) => {
    setIsAnalyzing(true);
    setCurrentStep(STEPS.ANALYZING);

    const frontImageUrl = images?.front?.url || null;

    try {
      setAnalysisProgress('Analyzing your responses...');
      const questionnaireAnalysis = analyzeQuestionnaire(qData);

      let imageAnalysis = null;
      if (images?.front?.data) {
        setAnalysisProgress('AI scanning your photos...');
        try {
          const result = await base44.functions.invoke('analyze-skin', {
            frontImage: images.front.data,
            rightImage: images.right?.data || null,
            leftImage: images.left?.data || null,
            // Full GNN input payload (Section 6)
            gender: qData.gender || null,
            age_years: qData.calculated_age || null,
            diet_type: qData.diet_type || null,
            skin_concerns: qData.concerns || [],
            aqi_index: aqiData?.aqi_index ?? null,
            pm25: aqiData?.pm25 ?? null,
            pm10: aqiData?.pm10 ?? null,
            no2: aqiData?.no2 ?? null,
          });
          imageAnalysis = result?.detected_concerns ? result : null;
        } catch (invokeErr) {
          console.error('Claude analysis failed, falling back to questionnaire-only:', invokeErr);
          imageAnalysis = null;
        }
      }

      setAnalysisProgress('Creating your skin profile...');
      const skinProfile = synthesizeSkinProfile(questionnaireAnalysis, imageAnalysis);

      setAnalysisProgress('Designing your routine...');
      const routine = generateRoutine(skinProfile);

      setAnalysisProgress('Finding perfect products...');
      const products = getProductRecommendations(skinProfile, routine);

      const safetyWarnings = validateSafetyRules(products, routine);

      // Derive budget from profile — AI-driven, not user-entered
      const budgetData = deriveBudget(qData, skinProfile);

      setAnalysisProgress('Saving your profile...');
      await logAuditEvent({ action: 'analysis_completed', resourceType: 'SkinProfile', metadata: { has_image: !!(images?.front) }, success: true });

      // Get user_id for linking records
      let userId = '';
      try {
        const currentUser = await base44.auth.me();
        userId = currentUser?.id || currentUser?.email || '';
      } catch (e) {}

      const profileData = {
        // Identity
        user_id: userId,
        name: qData.name || '',
        email: qData.email || '',
        dob: qData.dob || '',
        calculated_age: qData.calculated_age || null,
        gender: qData.gender || '',
        age_group: qData.age_group || '',
        // Skin data
        ...skinProfile,
        skin_types: qData.skin_types || [],
        diet_type: qData.diet_type || '',
        allergies: qData.allergies || '',
        // Location
        location_city: qData.location_city || '',
        pincode: qData.pincode || '',
        // AI-derived budget (never manually set)
        budget_range: budgetData.budget_range,
        budget_min_inr: budgetData.budget_min_inr,
        budget_max_inr: budgetData.budget_max_inr,
        budget_reasoning: budgetData.budget_reasoning,
        // Image references (private storage)
        image_analysis_consent: !!(images?.front?.url),
        face_image_url: frontImageUrl || '',
        front_image_url: images?.front?.url || '',
        right_image_url: images?.right?.url || '',
        left_image_url: images?.left?.url || '',
        // AI image assessment extras
        overall_skin_condition: imageAnalysis?.overall_skin_assessment?.overall_condition || '',
        hydration_level: imageAnalysis?.overall_skin_assessment?.hydration_level || '',
        analysis_confidence: imageAnalysis?.analysis_confidence || null,
        is_complete: true
      };

      // Apply gender theme immediately upon profile creation
      if (qData.gender) applyGenderTheme(qData.gender);

      // Save to database — non-critical, should not block navigation
      let savedProfileId = null;
      try {
        const savedProfile = await base44.entities.SkinProfile.create(profileData);
        savedProfileId = savedProfile.id;

        await base44.entities.SkincareRoutine.create({
          profile_id: savedProfile.id,
          ...routine,
          generated_date: new Date().toISOString().split('T')[0]
        });

        for (const product of products) {
          await base44.entities.ProductRecommendation.create({
            profile_id: savedProfile.id,
            ...product
          });
        }

        await base44.entities.AnalysisHistory.create({
          profile_id: savedProfile.id,
          analysis_type: frontImageUrl ? 'combined' : 'questionnaire',
          skin_type_detected: skinProfile.ai_adjusted_skin_type,
          concerns_detected: (skinProfile.ai_detected_concerns || []).map(c => ({
            concern: c.concern,
            confidence: c.confidence,
            severity: c.severity
          })),
          sensitivity_score: skinProfile.sensitivity_score,
          notes: [
            `Budget: ${budgetData.budget_range} (₹${budgetData.budget_min_inr}–₹${budgetData.budget_max_inr}/mo)`,
            budgetData.budget_reasoning,
            skinProfile.climate_zone ? `Climate: ${skinProfile.climate_zone}` : ''
          ].filter(Boolean).join(' | '),
          image_url: frontImageUrl || ''
        });

        // Mark onboarding complete for this user
        try {
          const currentUser = await base44.auth.me();
          const userName = currentUser?.full_name || currentUser?.email || '';
          localStorage.setItem(`onboardingComplete_${userName}`, 'true');
          localStorage.setItem('currentProfileName', userName);
        } catch (e) {}

        await logAuditEvent({ action: 'profile_created', resourceType: 'SkinProfile', resourceId: savedProfile.id, success: true });
      } catch (saveErr) {
        console.error('Profile save failed, continuing to analysis:', saveErr);
      }

      // Always navigate to results — a failed save should not block the user
      navigate(createPageUrl('Results') + (savedProfileId ? `?profile=${savedProfileId}` : ''));

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisProgress('Something went wrong. Please try again.');
      setTimeout(() => {
        setCurrentStep(STEPS.QUESTIONNAIRE);
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">

        {currentStep === STEPS.LOADING && (
          <motion.div key="loading" className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </motion.div>
        )}

        {currentStep === STEPS.QUESTIONNAIRE && (
          <motion.div key="questionnaire" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuestionnaireForm 
              onComplete={handleQuestionnaireComplete}
              onBack={() => navigate(createPageUrl('Home'))}
              prefillData={prefillData}
            />
          </motion.div>
        )}

        {currentStep === STEPS.IMAGE_UPLOAD && (
          <motion.div key="image" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SelfieCapture
              onImagesAnalyzed={handleImagesAnalyzed}
              onSkip={handleSkipImage}
              isAnalyzing={isAnalyzing}
            />
          </motion.div>
        )}

        {currentStep === STEPS.ANALYZING && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-black flex items-center justify-center p-4"
          >
            <div className="text-center max-w-sm w-full">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-pink-500/10 mb-8"
              >
                <Sparkles className="w-12 h-12 text-pink-500" />
              </motion.div>

              <Loader2 className="w-8 h-8 mx-auto text-pink-500 animate-spin mb-4" />

              <motion.p
                key={analysisProgress}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-medium text-white mb-2"
              >
                {analysisProgress}
              </motion.p>
              <p className="text-gray-400 text-sm mb-8">This may take a few seconds...</p>

              {/* AQI badge */}
              {aqiData?.badge && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 mb-6">
                  <span className={`w-2 h-2 rounded-full ${
                    aqiData.badge.color === 'green' ? 'bg-green-500' :
                    aqiData.badge.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs text-gray-300">{aqiData.badge.label}</span>
                </div>
              )}

              <div className="space-y-3">
                {[
                  { label: 'Analyzing responses', done: true },
                  { label: 'Calculating AQI impact', done: analysisProgress.includes('skin profile') },
                  { label: 'Generating routine', done: analysisProgress.includes('products') },
                  { label: 'Matching products', done: analysisProgress.includes('Saving') }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      item.done ? 'bg-pink-500 border-pink-500' : 'border-gray-700'
                    }`}>
                      {item.done && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={item.done ? 'text-white' : 'text-gray-600'}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}