import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

import QuestionnaireForm from '@/components/skincare/QuestionnaireForm';
import ImageUpload from '@/components/skincare/ImageUpload';
import { 
  analyzeQuestionnaire, 
  analyzeImageWithAI, 
  synthesizeSkinProfile,
  generateRoutine,
  getProductRecommendations,
  validateSafetyRules
} from '@/components/skincare/SkinAnalysisEngine';

const STEPS = {
  QUESTIONNAIRE: 'questionnaire',
  IMAGE_UPLOAD: 'image_upload',
  ANALYZING: 'analyzing'
};

export default function SkinAnalysis() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.QUESTIONNAIRE);
  const [questionnaireData, setQuestionnaireData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');

  const handleQuestionnaireComplete = (data) => {
    setQuestionnaireData(data);
    setCurrentStep(STEPS.IMAGE_UPLOAD);
  };

  const handleImageAnalyzed = async (imageUrl) => {
    await processAnalysis(questionnaireData, imageUrl);
  };

  const handleSkipImage = async () => {
    await processAnalysis(questionnaireData, null);
  };

  const processAnalysis = async (qData, imageUrl) => {
    setIsAnalyzing(true);
    setCurrentStep(STEPS.ANALYZING);

    try {
      // Step 1: Analyze questionnaire
      setAnalysisProgress('Analyzing your responses...');
      const questionnaireAnalysis = analyzeQuestionnaire(qData);

      // Step 2: Analyze image if provided
      let imageAnalysis = null;
      if (imageUrl) {
        setAnalysisProgress('AI scanning your photo...');
        imageAnalysis = await analyzeImageWithAI(imageUrl, base44.integrations.Core.InvokeLLM);
      }

      // Step 3: Synthesize profile
      setAnalysisProgress('Creating your skin profile...');
      const skinProfile = synthesizeSkinProfile(questionnaireAnalysis, imageAnalysis);

      // Step 4: Generate routine
      setAnalysisProgress('Designing your routine...');
      const routine = generateRoutine(skinProfile);

      // Step 5: Get product recommendations
      setAnalysisProgress('Finding perfect products...');
      const products = getProductRecommendations(skinProfile, routine);

      // Step 6: Validate safety
      const safetyWarnings = validateSafetyRules(products);

      // Step 7: Save to database
      setAnalysisProgress('Saving your profile...');
      
      const profileData = {
        ...skinProfile,
        image_analysis_consent: !!imageUrl,
        face_image_url: imageUrl || '',
        is_complete: true
      };

      const savedProfile = await base44.entities.SkinProfile.create(profileData);

      const routineData = {
        profile_id: savedProfile.id,
        ...routine,
        generated_date: new Date().toISOString().split('T')[0]
      };

      await base44.entities.SkincareRoutine.create(routineData);

      // Save products
      for (const product of products) {
        await base44.entities.ProductRecommendation.create({
          profile_id: savedProfile.id,
          ...product
        });
      }

      // Save analysis history
      await base44.entities.AnalysisHistory.create({
        profile_id: savedProfile.id,
        analysis_type: imageUrl ? 'combined' : 'questionnaire',
        skin_type_detected: skinProfile.ai_adjusted_skin_type,
        concerns_detected: (skinProfile.ai_detected_concerns || []).map(c => ({
          concern: c.concern,
          confidence: c.confidence,
          severity: c.severity
        })),
        sensitivity_score: skinProfile.sensitivity_score,
        image_url: imageUrl || ''
      });

      // Navigate to results
      navigate(createPageUrl('Results') + `?profile=${savedProfile.id}`);

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
        {currentStep === STEPS.QUESTIONNAIRE && (
          <motion.div
            key="questionnaire"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuestionnaireForm 
              onComplete={handleQuestionnaireComplete}
              onBack={() => navigate(createPageUrl('Home'))}
            />
          </motion.div>
        )}

        {currentStep === STEPS.IMAGE_UPLOAD && (
          <motion.div
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ImageUpload 
              onImageAnalyzed={handleImageAnalyzed}
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
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
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

              <p className="text-gray-400 text-sm">
                This may take a few seconds...
              </p>

              <div className="flex justify-center gap-2 mt-8">
                {['Analyzing', 'Profiling', 'Matching', 'Done'].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ 
                      scale: 1, 
                      opacity: analysisProgress.toLowerCase().includes(step.toLowerCase()) ? 1 : 0.5 
                    }}
                    className={`w-2 h-2 rounded-full ${
                      analysisProgress.toLowerCase().includes(step.toLowerCase()) 
                        ? 'bg-pink-500' 
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}