import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Users, Calendar } from 'lucide-react';

const STEPS = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: "Let's start with some basic information to personalize your experience"
  },
  {
    id: 'skin_profile',
    title: 'Skin Profile',
    description: 'Tell us about your skin to help us provide better recommendations'
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    description: 'Your diet can significantly impact your skin health'
  }
];

export default function QuestionnaireForm({ onComplete, onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    name: '',
    email: '',
    gender: '',
    age_group: '',
    exact_age: '',
    skin_type: '',
    allergies: '',
    diet_type: ''
  });

  const step = STEPS[currentStep];

  const canProceed = () => {
    if (currentStep === 0) {
      return data.name && data.email && data.gender && (data.age_group || data.exact_age);
    }
    if (currentStep === 1) {
      return data.skin_type;
    }
    if (currentStep === 2) {
      return data.diet_type;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const finalData = {
        ...data,
        age_group: data.exact_age ? `exact_${data.exact_age}` : data.age_group,
        concerns: [],
        sun_exposure: 'moderate',
        pollution_exposure: 'moderate',
        sleep_quality: 'average',
        location_city: '',
        pincode: '',
        budget_range: 'mid-range'
      };
      onComplete(finalData);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2" style={{ color: '#FF69B4' }}>Célure</h1>
        <p className="text-pink-300 text-sm tracking-widest">SKINCARE, PERFECTED BY AI</p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentStep ? 'w-8 bg-pink-500' : idx < currentStep ? 'w-2 bg-pink-500' : 'w-2 bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">{step.title}</h2>
            <p className="text-gray-400 text-sm">{step.description}</p>
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <Label className="text-white mb-2 block">Name</Label>
                <Input
                  placeholder="Enter your name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12"
                />
              </div>

              <div>
                <Label className="text-white mb-3 block">Gender</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'male', label: 'Male', icon: UserIcon },
                    { value: 'female', label: 'Female', icon: Users },
                    { value: 'other', label: 'Other', icon: Users }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, gender: option.value })}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        data.gender === option.value
                          ? 'bg-pink-500 border-pink-500'
                          : 'bg-gray-900 border-gray-800'
                      }`}
                    >
                      <option.icon className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-sm font-medium">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-white mb-3 block">Age</Label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { value: 'under_20', label: 'Under 18' },
                    { value: '20_30', label: '18-24' },
                    { value: '30_40', label: '25-34' },
                    { value: '40_50', label: '35-44' },
                    { value: 'above_50', label: '45-54' },
                    { value: 'above_50', label: '55+' }
                  ].map((option) => (
                    <button
                      key={option.value + option.label}
                      onClick={() => setData({ ...data, age_group: option.value, exact_age: '' })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        data.age_group === option.value && !data.exact_age
                          ? 'bg-pink-500 border-pink-500'
                          : 'bg-gray-900 border-gray-800'
                      }`}
                    >
                      <p className="text-sm font-medium">{option.label}</p>
                    </button>
                  ))}
                </div>
                <p className="text-center text-gray-400 text-sm my-3">OR</p>
                <Input
                  type="number"
                  placeholder="Enter your exact age"
                  value={data.exact_age}
                  onChange={(e) => setData({ ...data, exact_age: e.target.value, age_group: '' })}
                  className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12"
                />
              </div>
            </div>
          )}

          {/* Step 2: Skin Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-white mb-3 block">Skin Type</Label>
                <div className="space-y-3">
                  {[
                    { value: 'dry', label: 'Dry' },
                    { value: 'oily', label: 'Oily' },
                    { value: 'combination', label: 'Combination' },
                    { value: 'sensitive', label: 'Sensitive' },
                    { value: 'normal', label: 'Normal' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, skin_type: option.value })}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                        data.skin_type === option.value
                          ? 'bg-pink-500 border-pink-500'
                          : 'bg-gray-900 border-gray-800'
                      }`}
                    >
                      <p className="font-medium">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">Allergies (optional)</Label>
                <Input
                  placeholder="e.g. fragrance, nuts, latex (comma separate)"
                  value={data.allergies}
                  onChange={(e) => setData({ ...data, allergies: e.target.value })}
                  className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12"
                />
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-white mb-3 block">Diet Type</Label>
                <div className="space-y-3">
                  {[
                    { 
                      value: 'healthy', 
                      label: 'Healthy',
                      description: 'Balanced diet with fruits, vegetables, and whole foods'
                    },
                    { 
                      value: 'semi_healthy', 
                      label: 'Semi-Healthy',
                      description: 'Mix of healthy foods and occasional processed foods'
                    },
                    { 
                      value: 'junk_food', 
                      label: 'Junk Food',
                      description: 'Mostly processed foods, high in sugar and fat'
                    }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, diet_type: option.value })}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                        data.diet_type === option.value
                          ? 'bg-pink-500 border-pink-500'
                          : 'bg-gray-900 border-gray-800'
                      }`}
                    >
                      <p className="font-semibold mb-1">{option.label}</p>
                      <p className="text-sm text-gray-300">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="fixed bottom-20 left-0 right-0 px-6 flex gap-3">
        <Button
          onClick={handlePrev}
          variant="outline"
          className="flex-1 h-14 rounded-full border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10"
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex-1 h-14 rounded-full bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-50 disabled:bg-gray-700"
        >
          {currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}