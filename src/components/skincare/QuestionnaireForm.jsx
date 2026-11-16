import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from 'lucide-react';
import { sanitizeQuestionnaireData } from '@/lib/inputSanitizer';
import { useGenderTheme } from '@/lib/GenderThemeContext';

const DRAFT_KEY = 'celure_q_draft';

const SKIN_TYPES = [
  { value: 'dry', label: 'Dry', desc: 'Tight, flaky, dull' },
  { value: 'oily', label: 'Oily', desc: 'Shiny, enlarged pores' },
  { value: 'combination', label: 'Combination', desc: 'Oily T-zone, dry cheeks' },
  { value: 'sensitive', label: 'Sensitive', desc: 'Easily irritated, redness' },
  { value: 'normal', label: 'Normal', desc: 'Balanced, few issues' }
];

const SKIN_CONCERNS = [
  { value: 'acne', label: 'Acne' },
  { value: 'blackheads', label: 'Blackheads' },
  { value: 'whiteheads', label: 'Whiteheads' },
  { value: 'excess_oil', label: 'Excess Oil' },
  { value: 'large_pores', label: 'Large Pores' },
  { value: 'dryness', label: 'Dryness' },
  { value: 'redness', label: 'Redness' },
  { value: 'wrinkles', label: 'Wrinkles' },
  { value: 'hyperpigmentation', label: 'Hyperpigmentation' },
  { value: 'uneven_tone', label: 'Uneven Tone' }
];

// Indian-context diet labels. Values stay mapped to the entity enum for backend compatibility.
const DIET_OPTIONS = [
  { value: 'healthy', label: 'Mostly home-cooked', desc: 'Fresh, home-prepared meals' },
  { value: 'semi_healthy', label: 'Mixed', desc: 'Home-cooked plus some outside food' },
  { value: 'junk_food', label: 'Mostly outside / fried food', desc: 'Frequent restaurant, fried or processed food' }
];

const FOOD_PREFERENCE = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non_vegetarian', label: 'Non-vegetarian' },
  { value: 'vegan', label: 'Vegan' }
];

const DAIRY_INTAKE = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' }
];

// Flow order: skin type -> concerns (+ lifestyle) -> city -> [consent/selfies handled by SelfieCapture] -> result
const STEPS = [
  { id: 'skin', title: 'Your Skin', description: 'Select all that apply — you can have more than one skin type' },
  { id: 'concerns', title: 'Concerns & Lifestyle', description: 'Tell us about your skin and daily habits' },
  { id: 'city', title: 'Your City', description: 'For AQI & pollution-based recommendations' }
];

const defaultData = {
  skin_types: [],
  skin_type: '',
  gender: '',
  allergies: '',
  concerns: [],
  diet_type: '',
  food_preference: '',
  dairy_intake: '',
  monthly_budget_inr: '',
  location_city: '',
  pincode: ''
};

export default function QuestionnaireForm({ onComplete, onBack, prefillData }) {
  const { applyGenderTheme } = useGenderTheme();

  // Restore in-progress draft so a refresh / dropped connection does not lose it.
  const draft = (() => {
    try { const s = localStorage.getItem(DRAFT_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  })();

  const [currentStep, setCurrentStep] = useState(() => {
    const s = draft?._step;
    return typeof s === 'number' && s >= 0 && s <= STEPS.length - 1 ? s : 0;
  });
  const [data, setData] = useState(() => ({
    ...defaultData,
    ...(draft || prefillData || {})
  }));

  // Persist on every change.
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, _step: currentStep })); } catch (e) {}
  }, [data, currentStep]);

  const step = STEPS[currentStep];

  const toggleSkinType = (value) => {
    const current = data.skin_types || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : current.length < 4 ? [...current, value] : current;
    setData({ ...data, skin_types: updated, skin_type: updated[0] || '' });
  };

  const toggleConcern = (value) => {
    const current = data.concerns || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setData({ ...data, concerns: updated });
  };

  // Returns the specific reason Next is disabled for the current step (empty when OK).
  const missingReason = () => {
    if (currentStep === 0) {
      if (!(data.skin_types || []).length) return 'Please select at least one skin type';
    }
    if (currentStep === 1) {
      if (!(data.concerns || []).length) return 'Please select at least one skin concern';
      if (!data.diet_type) return 'Please select your diet type';
      if (!data.food_preference) return 'Please select your food preference';
      if (!data.dairy_intake) return 'Please select your dairy intake';
      if (!data.monthly_budget_inr) return 'Please enter your monthly skincare budget';
    }
    if (currentStep === 2) {
      if (!data.location_city) return 'Please enter your city';
    }
    return '';
  };
  const canProceed = () => !missingReason();
  const reason = missingReason();

  const handleNext = () => {
    if (!canProceed()) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const sanitized = sanitizeQuestionnaireData(data);
      // Clear the in-progress draft once submitted.
      try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
      onComplete({
        ...sanitized,
        gender: data.gender || '',
        food_preference: data.food_preference || '',
        dairy_intake: data.dairy_intake || '',
        monthly_budget_inr: data.monthly_budget_inr ? Number(data.monthly_budget_inr) : null,
        budget_range: 'mid-range',
        budget_amount: data.monthly_budget_inr ? Number(data.monthly_budget_inr) : 1500,
        primary_concerns: sanitized.concerns.slice(0, 3),
        secondary_concerns: sanitized.concerns.slice(3)
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="text-center pt-10 pb-4 px-6">
        <h1 className="text-4xl font-bold mb-1" style={{ color: '#FF69B4' }}>Célure AI</h1>
        <p className="text-pink-300 text-xs tracking-widest">SKINCARE, PERFECTED BY AI</p>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2 px-6 mb-6">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentStep ? 'w-8 bg-pink-500' : idx < currentStep ? 'w-2 bg-pink-500' : 'w-2 bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">{step.title}</h2>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </div>

            {/* STEP 1: Skin Type */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">Skin Type(s) * <span className="text-gray-500">(select 1–4)</span></Label>
                  <p className="text-xs text-gray-500 mb-3">You can have multiple skin types</p>
                  <div className="space-y-3">
                    {SKIN_TYPES.map((opt) => {
                      const selected = (data.skin_types || []).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          onClick={() => toggleSkinType(opt.value)}
                          className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${
                            selected ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                          }`}>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-white bg-white' : 'border-gray-600'
                          }`}>
                            {selected && <span className="text-pink-500 text-xs font-bold">✓</span>}
                          </div>
                          <div>
                            <p className="font-semibold">{opt.label}</p>
                            <p className="text-xs text-gray-300">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-3 block">Gender (optional)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer_not_to_say', label: 'Skip' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setData({ ...data, gender: opt.value }); applyGenderTheme(opt.value === 'prefer_not_to_say' ? '' : opt.value); }}
                        className={`p-3 rounded-2xl border-2 transition-all text-xs font-semibold ${
                          data.gender === opt.value ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Allergies (Optional)</Label>
                  <p className="text-xs text-gray-500 mb-2">Separate multiple with commas</p>
                  <Input
                    placeholder="e.g. fragrance, retinol, nuts, latex"
                    value={data.allergies}
                    onChange={(e) => setData({ ...data, allergies: e.target.value })}
                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Concerns + Lifestyle */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">Skin Concerns * <span className="text-gray-500">(select all that apply)</span></Label>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {SKIN_CONCERNS.map((opt) => {
                      const selected = (data.concerns || []).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          onClick={() => toggleConcern(opt.value)}
                          className={`p-2 rounded-xl border-2 transition-all flex items-center gap-1.5 text-left min-h-0 ${
                            selected ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                          }`}>
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-white bg-white' : 'border-gray-600'
                          }`}>
                            {selected && <span className="text-pink-500 text-xs">✓</span>}
                          </div>
                          <span className="text-xs font-medium leading-tight">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-3 block">Diet Type *</Label>
                  <div className="space-y-3">
                    {DIET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setData({ ...data, diet_type: opt.value })}
                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                          data.diet_type === opt.value ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                        }`}>
                        <p className="font-semibold">{opt.label}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-3 block">Food Preference *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {FOOD_PREFERENCE.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setData({ ...data, food_preference: opt.value })}
                        className={`p-3 rounded-2xl border-2 transition-all text-xs font-semibold ${
                          data.food_preference === opt.value ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-3 block">Dairy Intake *</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {DAIRY_INTAKE.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setData({ ...data, dairy_intake: opt.value })}
                        className={`p-3 rounded-2xl border-2 transition-all text-xs font-semibold ${
                          data.dairy_intake === opt.value ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Monthly Skincare Budget (₹) *</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <Input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="e.g. 1500"
                      value={data.monthly_budget_inr}
                      onChange={(e) => setData({ ...data, monthly_budget_inr: e.target.value })}
                      className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Per month, in rupees</p>
                </div>
              </div>
            )}

            {/* STEP 3: City */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">City *</Label>
                  <Input
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                    value={data.location_city}
                    onChange={(e) => setData({ ...data, location_city: e.target.value })}
                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-2">We use AQI & pollution data to adjust your routine</p>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Pincode (Optional)</Label>
                  <Input
                    placeholder="e.g., 400001"
                    value={data.pincode}
                    onChange={(e) => setData({ ...data, pincode: e.target.value })}
                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
                  <p className="text-pink-400 text-sm font-semibold mb-3">Profile Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Skin Type(s)</p>
                      <p className="text-white capitalize">{(data.skin_types || []).join(', ') || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Concerns</p>
                      <p className="text-white">{(data.concerns || []).length} selected</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Diet</p>
                      <p className="text-white capitalize">{data.diet_type ? DIET_OPTIONS.find(d => d.value === data.diet_type)?.label : '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Budget</p>
                      <p className="text-white">{data.monthly_budget_inr ? `₹${data.monthly_budget_inr}/mo` : '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="bg-gradient-to-t px-6 fixed bottom-2 left-0 right-0 from-black via-black/90 to-transparent">
        <div className="flex gap-3">
          <Button
            onClick={() => currentStep > 0 ? setCurrentStep((p) => p - 1) : onBack?.()}
            variant="outline"
            className="flex-1 h-14 rounded-xl border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10 bg-transparent font-semibold">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-[2] h-14 rounded-xl font-semibold text-white disabled:opacity-40 disabled:bg-gray-800"
            style={{ background: canProceed() ? '#FF69B4' : undefined }}>
            {currentStep === STEPS.length - 1 ? '🚀 Start My Analysis' : 'Next →'}
          </Button>
        </div>
        {/* Inline missing-field message when Next is disabled */}
        {!canProceed() && reason && (
          <p className="text-center text-amber-400 text-xs mt-2">{reason}</p>
        )}
      </div>
    </div>
  );
}