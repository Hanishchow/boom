import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { createPageUrl } from '../utils';
import QuestionnaireStep from '../components/assessment/QuestionnaireStep';
import ImageUpload from '../components/assessment/ImageUpload';
import SafetyDisclaimer from '../components/SafetyDisclaimer';

export default function Assessment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    age_group: '',
    gender: '',
    skin_type: '',
    skin_concerns: [],
    sun_exposure: '',
    pollution_exposure: '',
    sleep_quality: '',
    location_city: '',
    pincode: '',
    budget_range: '',
    image_analysis_consent: false,
    face_image_url: null
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { title: 'Basic Information', description: 'Tell us about yourself' },
    { title: 'Skin Type', description: 'What type of skin do you have?' },
    { title: 'Skin Concerns', description: 'What issues would you like to address?' },
    { title: 'Lifestyle Factors', description: 'Your daily environment and habits' },
    { title: 'Location & Budget', description: 'Help us find products near you' },
    { title: 'Image Upload (Optional)', description: 'For enhanced AI analysis' }
  ];

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = () => {
    switch(currentStep) {
      case 1:
        if (!formData.age_group) {
          toast.error('Please select your age group');
          return false;
        }
        return true;
      case 2:
        if (!formData.skin_type) {
          toast.error('Please select your skin type');
          return false;
        }
        return true;
      case 3:
        if (!formData.skin_concerns || formData.skin_concerns.length === 0) {
          toast.error('Please select at least one skin concern');
          return false;
        }
        return true;
      case 4:
        if (!formData.sun_exposure || !formData.pollution_exposure || !formData.sleep_quality) {
          toast.error('Please answer all lifestyle questions');
          return false;
        }
        return true;
      case 5:
        if (!formData.location_city || !formData.budget_range) {
          toast.error('Please provide your city and budget preference');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);
    
    try {
      // Step 1: Process questionnaire and generate AI-adjusted profile
      const analysisPrompt = `Analyze this skincare questionnaire and provide a comprehensive skin assessment:

USER DATA:
- Age Group: ${formData.age_group}
- Self-reported Skin Type: ${formData.skin_type}
- Skin Concerns: ${formData.skin_concerns.join(', ')}
- Sun Exposure: ${formData.sun_exposure}
- Pollution Exposure: ${formData.pollution_exposure}
- Sleep Quality: ${formData.sleep_quality}
- Location: ${formData.location_city}${formData.pincode ? ` (${formData.pincode})` : ''}
- Budget: ${formData.budget_range}

TASK:
1. Validate or adjust the skin type based on concerns and lifestyle
2. Categorize concerns into primary (top 2-3) and secondary
3. Assign sensitivity score (low/medium/high) based on all factors
4. Infer climate zone from location
5. Consider environmental factors (pollution, sun) impact

Return assessment following this exact structure.`;

      const profileAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            ai_adjusted_skin_type: { 
              type: 'string',
              enum: ['dry', 'oily', 'combination', 'normal', 'sensitive']
            },
            primary_concerns: { 
              type: 'array',
              items: { type: 'string' }
            },
            secondary_concerns: { 
              type: 'array',
              items: { type: 'string' }
            },
            sensitivity_score: { 
              type: 'string',
              enum: ['low', 'medium', 'high']
            },
            climate_zone: { type: 'string' },
            adjustment_reason: { type: 'string' }
          },
          required: ['ai_adjusted_skin_type', 'primary_concerns', 'sensitivity_score']
        }
      });

      // Step 2: Optional image analysis
      let imageAnalysisResults = null;
      if (formData.image_analysis_consent && formData.face_image_url) {
        const imagePrompt = `Analyze this face image for skincare concerns. Detect:
- Acne and breakouts (location, severity)
- Pigmentation and dark spots
- Redness and inflammation
- Texture issues
- Oily/dry zones
- Open pores

For each detected concern, provide:
- concern name
- confidence score (0-1)
- severity (mild/moderate/severe)

Only include concerns with confidence > 0.6`;

        imageAnalysisResults = await base44.integrations.Core.InvokeLLM({
          prompt: imagePrompt,
          file_urls: [formData.face_image_url],
          response_json_schema: {
            type: 'object',
            properties: {
              detected_concerns: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    concern: { type: 'string' },
                    confidence: { type: 'number' },
                    severity: { type: 'string' }
                  }
                }
              }
            }
          }
        });
      }

      // Step 3: Create skin profile
      const skinProfile = await base44.entities.SkinProfile.create({
        ...formData,
        ai_adjusted_skin_type: profileAnalysis.ai_adjusted_skin_type,
        primary_concerns: profileAnalysis.primary_concerns,
        secondary_concerns: profileAnalysis.secondary_concerns || [],
        sensitivity_score: profileAnalysis.sensitivity_score,
        climate_zone: profileAnalysis.climate_zone,
        ai_detected_concerns: imageAnalysisResults?.detected_concerns || [],
        is_complete: true
      });

      // Step 4: Generate personalized routine
      const routinePrompt = `Create a comprehensive skincare routine for this profile:

SKIN PROFILE:
- Type: ${profileAnalysis.ai_adjusted_skin_type}
- Primary Concerns: ${profileAnalysis.primary_concerns.join(', ')}
- Secondary Concerns: ${(profileAnalysis.secondary_concerns || []).join(', ')}
- Sensitivity: ${profileAnalysis.sensitivity_score}
- Sun Exposure: ${formData.sun_exposure}
- Pollution: ${formData.pollution_exposure}
- Climate: ${profileAnalysis.climate_zone}

REQUIREMENTS:
- Morning routine (4-6 steps)
- Evening routine (5-7 steps)
- Weekly treatments (1-3 treatments)
- Must include: cleanser, moisturizer, sunscreen (AM only)
- Each step needs: product_type, purpose, instructions, dos, donts, duration
- Identify ingredient conflicts to avoid
- Keep it simple and affordable for Indian users

SAFETY RULES:
- NO prescription drugs
- Avoid retinol + benzoyl peroxide combination
- Warn about over-exfoliation
- Gentle products for sensitive skin`;

      const routine = await base44.integrations.Core.InvokeLLM({
        prompt: routinePrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            morning_routine: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step_number: { type: 'number' },
                  product_type: { type: 'string' },
                  purpose: { type: 'string' },
                  instructions: { type: 'string' },
                  dos: { type: 'array', items: { type: 'string' } },
                  donts: { type: 'array', items: { type: 'string' } },
                  duration: { type: 'string' }
                }
              }
            },
            evening_routine: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step_number: { type: 'number' },
                  product_type: { type: 'string' },
                  purpose: { type: 'string' },
                  instructions: { type: 'string' },
                  dos: { type: 'array', items: { type: 'string' } },
                  donts: { type: 'array', items: { type: 'string' } },
                  duration: { type: 'string' }
                }
              }
            },
            weekly_routine: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  treatment_type: { type: 'string' },
                  purpose: { type: 'string' },
                  instructions: { type: 'string' },
                  frequency: { type: 'string' }
                }
              }
            },
            ingredient_warnings: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      const savedRoutine = await base44.entities.SkincareRoutine.create({
        profile_id: skinProfile.id,
        ...routine,
        generated_date: new Date().toISOString().split('T')[0]
      });

      // Step 5: Generate product recommendations
      const productsPrompt = `Recommend skincare products available in Indian pharmacies for this routine:

PROFILE:
- Skin Type: ${profileAnalysis.ai_adjusted_skin_type}
- Concerns: ${profileAnalysis.primary_concerns.join(', ')}
- Sensitivity: ${profileAnalysis.sensitivity_score}
- Budget: ${formData.budget_range}
- Location: ${formData.location_city}

ROUTINE STEPS NEEDING PRODUCTS:
Morning: ${routine.morning_routine.map(s => s.product_type).join(', ')}
Evening: ${routine.evening_routine.map(s => s.product_type).join(', ')}

STRICT REQUIREMENTS:
- Only products available in Indian pharmacies
- Brands: Cetaphil, Simple, Minimalist, Re'equil, Episoft, La Shield, Neutrogena, Bioderma, Sebamed, Plum, Dot & Key, Derma Co, pharmacy generics
- Budget ranges (INR): budget (100-500), mid-range (500-1500), premium (1500+)
- NO luxury brands, NO prescription drugs
- High availability confidence for common products
- Match sensitivity level

For each product provide:
- product_name, brand, product_type
- active_ingredients (array)
- why_recommended
- price_range_min, price_range_max (in INR)
- availability_confidence (high/medium/low)
- suitable_for_skin_types (array)
- addresses_concerns (array)
- usage_time (morning/evening/both/weekly)
- is_pharmacy_generic (boolean)

Provide 8-12 products covering all routine steps.`;

      const productsResponse = await base44.integrations.Core.InvokeLLM({
        prompt: productsPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_name: { type: 'string' },
                  brand: { type: 'string' },
                  product_type: { type: 'string' },
                  active_ingredients: { type: 'array', items: { type: 'string' } },
                  why_recommended: { type: 'string' },
                  price_range_min: { type: 'number' },
                  price_range_max: { type: 'number' },
                  availability_confidence: { type: 'string' },
                  suitable_for_skin_types: { type: 'array', items: { type: 'string' } },
                  addresses_concerns: { type: 'array', items: { type: 'string' } },
                  usage_time: { type: 'string' },
                  is_pharmacy_generic: { type: 'boolean' }
                }
              }
            }
          }
        }
      });

      // Save products
      const productPromises = productsResponse.products.map(product =>
        base44.entities.ProductRecommendation.create({
          profile_id: skinProfile.id,
          routine_step: product.product_type,
          ...product
        })
      );
      await Promise.all(productPromises);

      // Step 6: Save analysis history
      await base44.entities.AnalysisHistory.create({
        profile_id: skinProfile.id,
        analysis_type: formData.face_image_url ? 'combined' : 'questionnaire',
        skin_type_detected: profileAnalysis.ai_adjusted_skin_type,
        concerns_detected: imageAnalysisResults?.detected_concerns || [],
        sensitivity_score: profileAnalysis.sensitivity_score,
        image_url: formData.face_image_url,
        notes: profileAnalysis.adjustment_reason || ''
      });

      toast.success('Analysis complete! Redirecting to your results...');
      
      // Navigate to results page
      setTimeout(() => {
        navigate(createPageUrl('Analysis') + `?profile=${skinProfile.id}`);
      }, 1000);

    } catch (error) {
      console.error('Assessment error:', error);
      toast.error('Failed to process assessment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Skin Assessment</h1>
            <div className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {currentStep <= 5 ? (
            <QuestionnaireStep
              step={currentStep}
              data={formData}
              onChange={handleFieldChange}
              title={steps[currentStep - 1].title}
              description={steps[currentStep - 1].description}
            />
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{steps[currentStep - 1].title}</h2>
                <p className="text-gray-600">{steps[currentStep - 1].description}</p>
              </div>
              <ImageUpload
                onImageUploaded={(url) => handleFieldChange('face_image_url', url)}
                consent={formData.image_analysis_consent}
                onConsentChange={(checked) => handleFieldChange('image_analysis_consent', checked)}
              />
            </div>
          )}
        </div>

        {/* Safety Disclaimer on first step */}
        {currentStep === 1 && (
          <div className="mb-6">
            <SafetyDisclaimer />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || processing}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={processing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : currentStep === totalSteps ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze My Skin
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx + 1 === currentStep 
                  ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600' 
                  : idx + 1 < currentStep
                  ? 'w-2 bg-blue-600'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}