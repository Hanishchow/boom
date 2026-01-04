import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronRight, 
  ChevronLeft, 
  Droplets, 
  Sun, 
  Wind, 
  Moon, 
  MapPin, 
  Wallet,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const QUESTIONS = [
  {
    id: 'skin_type',
    title: 'What is your skin type?',
    description: 'Select the option that best describes your skin on most days',
    icon: Droplets,
    type: 'single',
    options: [
      { value: 'dry', label: 'Dry', description: 'Feels tight, may flake, rarely oily' },
      { value: 'oily', label: 'Oily', description: 'Shiny throughout the day, visible pores' },
      { value: 'combination', label: 'Combination', description: 'Oily T-zone, dry/normal cheeks' },
      { value: 'normal', label: 'Normal', description: 'Balanced, rarely too oily or dry' },
      { value: 'sensitive', label: 'Sensitive', description: 'Easily irritated, reactive to products' }
    ]
  },
  {
    id: 'concerns',
    title: 'What are your main skin concerns?',
    description: 'Select all that apply (we\'ll prioritize for you)',
    icon: Sparkles,
    type: 'multiple',
    options: [
      { value: 'acne', label: 'Acne & Breakouts' },
      { value: 'pigmentation', label: 'Dark Spots & Pigmentation' },
      { value: 'dryness', label: 'Dryness & Dehydration' },
      { value: 'oiliness', label: 'Excess Oil & Shine' },
      { value: 'sensitivity', label: 'Sensitivity & Redness' },
      { value: 'aging', label: 'Fine Lines & Aging' },
      { value: 'texture', label: 'Rough Texture & Bumps' },
      { value: 'dullness', label: 'Dullness & Uneven Tone' }
    ]
  },
  {
    id: 'sun_exposure',
    title: 'How much sun exposure do you get daily?',
    description: 'Think about your typical day',
    icon: Sun,
    type: 'single',
    options: [
      { value: 'minimal', label: 'Minimal', description: 'Mostly indoors, less than 1 hour outside' },
      { value: 'moderate', label: 'Moderate', description: '1-3 hours outside daily' },
      { value: 'high', label: 'High', description: 'More than 3 hours outside daily' }
    ]
  },
  {
    id: 'pollution_exposure',
    title: 'What\'s your pollution exposure level?',
    description: 'Based on your city and daily commute',
    icon: Wind,
    type: 'single',
    options: [
      { value: 'low', label: 'Low', description: 'Clean air area, minimal traffic exposure' },
      { value: 'moderate', label: 'Moderate', description: 'Average city environment' },
      { value: 'high', label: 'High', description: 'High traffic, industrial area, or metro cities like Delhi' }
    ]
  },
  {
    id: 'sleep_quality',
    title: 'How would you rate your sleep quality?',
    description: 'Sleep affects skin health significantly',
    icon: Moon,
    type: 'single',
    options: [
      { value: 'poor', label: 'Poor', description: 'Less than 5 hours or very disturbed' },
      { value: 'average', label: 'Average', description: '5-7 hours, sometimes disturbed' },
      { value: 'good', label: 'Good', description: '7+ hours of quality sleep' }
    ]
  },
  {
    id: 'location',
    title: 'Where do you live?',
    description: 'Helps us understand your climate and product availability',
    icon: MapPin,
    type: 'location',
    options: []
  },
  {
    id: 'demographics',
    title: 'A bit about you',
    description: 'Helps us personalize recommendations',
    icon: User,
    type: 'demographics',
    options: []
  },
  {
    id: 'budget_range',
    title: 'What\'s your skincare budget?',
    description: 'Per product, not entire routine',
    icon: Wallet,
    type: 'single',
    options: [
      { value: 'budget', label: 'Budget-Friendly', description: 'Up to ₹400 per product' },
      { value: 'mid-range', label: 'Mid-Range', description: '₹400-700 per product' },
      { value: 'premium', label: 'Premium', description: 'Up to ₹1500 per product' }
    ]
  }
];

export default function QuestionnaireForm({ onComplete, onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    skin_type: '',
    concerns: [],
    sun_exposure: '',
    pollution_exposure: '',
    sleep_quality: '',
    location_city: '',
    pincode: '',
    age_group: '',
    gender: '',
    budget_range: ''
  });

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleSingleSelect = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleMultipleSelect = (value) => {
    setAnswers(prev => {
      const current = prev[currentQuestion.id] || [];
      if (current.includes(value)) {
        return { ...prev, [currentQuestion.id]: current.filter(v => v !== value) };
      }
      return { ...prev, [currentQuestion.id]: [...current, value] };
    });
  };

  const canProceed = () => {
    if (currentQuestion.type === 'single') {
      return !!answers[currentQuestion.id];
    }
    if (currentQuestion.type === 'multiple') {
      return (answers[currentQuestion.id] || []).length > 0;
    }
    if (currentQuestion.type === 'location') {
      return !!answers.location_city;
    }
    if (currentQuestion.type === 'demographics') {
      return !!answers.age_group;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const IconComponent = currentQuestion.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-100" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-rose-100 to-amber-100">
                    <IconComponent className="w-6 h-6 text-rose-600" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-800">
                    {currentQuestion.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  {currentQuestion.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Single Select */}
                {currentQuestion.type === 'single' && (
                  <RadioGroup 
                    value={answers[currentQuestion.id]} 
                    onValueChange={handleSingleSelect}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          answers[currentQuestion.id] === option.value
                            ? 'border-rose-400 bg-rose-50/50'
                            : 'border-gray-100 hover:border-rose-200 hover:bg-gray-50'
                        }`}
                      >
                        <RadioGroupItem value={option.value} className="mt-1" />
                        <div>
                          <p className="font-medium text-gray-800">{option.label}</p>
                          {option.description && (
                            <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                )}

                {/* Multiple Select */}
                {currentQuestion.type === 'multiple' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = (answers[currentQuestion.id] || []).includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-rose-400 bg-rose-50/50'
                              : 'border-gray-100 hover:border-rose-200 hover:bg-gray-50'
                          }`}
                        >
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => handleMultipleSelect(option.value)}
                          />
                          <span className="font-medium text-gray-800">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Location Input */}
                {currentQuestion.type === 'location' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="city" className="text-gray-700">City</Label>
                      <Input
                        id="city"
                        placeholder="e.g., Mumbai, Delhi, Bangalore"
                        value={answers.location_city}
                        onChange={(e) => setAnswers(prev => ({ ...prev, location_city: e.target.value }))}
                        className="mt-2 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="text-gray-700">Pincode (Optional)</Label>
                      <Input
                        id="pincode"
                        placeholder="e.g., 400001"
                        value={answers.pincode}
                        onChange={(e) => setAnswers(prev => ({ ...prev, pincode: e.target.value }))}
                        className="mt-2 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                      />
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Used to understand climate and product availability in your area
                    </p>
                  </div>
                )}

                {/* Demographics */}
                {currentQuestion.type === 'demographics' && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-gray-700 mb-3 block">Age Group</Label>
                      <RadioGroup 
                        value={answers.age_group} 
                        onValueChange={(value) => setAnswers(prev => ({ ...prev, age_group: value }))}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                      >
                        {[
                          { value: 'under_20', label: 'Under 20' },
                          { value: '20_30', label: '20-30' },
                          { value: '30_40', label: '30-40' },
                          { value: '40_50', label: '40-50' },
                          { value: 'above_50', label: 'Above 50' }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${
                              answers.age_group === option.value
                                ? 'border-rose-400 bg-rose-50/50'
                                : 'border-gray-100 hover:border-rose-200'
                            }`}
                          >
                            <RadioGroupItem value={option.value} className="sr-only" />
                            <span className="font-medium text-gray-800">{option.label}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-gray-700 mb-3 block">Gender (Optional)</Label>
                      <RadioGroup 
                        value={answers.gender} 
                        onValueChange={(value) => setAnswers(prev => ({ ...prev, gender: value }))}
                        className="grid grid-cols-2 gap-2"
                      >
                        {[
                          { value: 'female', label: 'Female' },
                          { value: 'male', label: 'Male' },
                          { value: 'other', label: 'Other' },
                          { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              answers.gender === option.value
                                ? 'border-rose-400 bg-rose-50/50'
                                : 'border-gray-100 hover:border-rose-200'
                            }`}
                          >
                            <RadioGroupItem value={option.value} className="sr-only" />
                            <span className="text-gray-800">{option.label}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={handlePrev}
            className="text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-6 disabled:opacity-50"
          >
            {currentStep === QUESTIONS.length - 1 ? 'Get My Analysis' : 'Continue'}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}