import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sun, Wind, Moon, Wallet, AlertCircle } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'concerns',
    title: 'What are your main skin concerns?',
    description: 'Select all that apply (we\'ll prioritize for you)',
    icon: AlertCircle,
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

export default function DetailedQuestionnaire({ onComplete, onBack, initialData }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    concerns: [],
    sun_exposure: '',
    sleep_quality: '',
    budget_range: 'mid-range'
  });

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const IconComponent = question.icon;

  const handleSingleSelect = (value) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleMultipleSelect = (value) => {
    setAnswers(prev => {
      const current = prev[question.id] || [];
      if (current.includes(value)) {
        return { ...prev, [question.id]: current.filter(v => v !== value) };
      }
      return { ...prev, [question.id]: [...current, value] };
    });
  };

  const canProceed = () => {
    if (question.type === 'single') {
      return !!answers[question.id];
    }
    if (question.type === 'multiple') {
      return true; // Allow empty concerns
    }
    return true;
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete({ ...initialData, ...answers });
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
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
        {QUESTIONS.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentQuestion ? 'w-8 bg-pink-500' : idx < currentQuestion ? 'w-2 bg-pink-500' : 'w-2 bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 rounded-xl bg-pink-500/10">
              <IconComponent className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">{question.title}</h2>
              <p className="text-gray-400 text-sm">{question.description}</p>
            </div>
          </div>

          {/* Single Select */}
          {question.type === 'single' && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSingleSelect(option.value)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                    answers[question.id] === option.value
                      ? 'bg-pink-500 border-pink-500'
                      : 'bg-gray-900 border-gray-800'
                  }`}
                >
                  <p className="font-semibold mb-1">{option.label}</p>
                  {option.description && (
                    <p className="text-sm text-gray-300">{option.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Multiple Select */}
          {question.type === 'multiple' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((option) => {
                const isSelected = (answers[question.id] || []).includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-pink-500 border-pink-500'
                        : 'bg-gray-900 border-gray-800'
                    }`}
                  >
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => handleMultipleSelect(option.value)}
                      className="border-gray-600"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                );
              })}
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
          {currentQuestion === QUESTIONS.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}