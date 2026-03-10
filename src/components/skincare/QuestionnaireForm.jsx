import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { User as UserIcon, Users, ChevronLeft } from 'lucide-react';

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

const STEPS = [
  { id: 'personal', title: 'Personal Info', description: "Let's personalize your experience" },
  { id: 'skin', title: 'Skin Profile', description: 'Select all that apply — we support multiple skin types' },
  { id: 'concerns', title: 'Skin Concerns & Diet', description: 'What are your main skin concerns?' },
  { id: 'location', title: 'Your Location', description: 'For AQI & pollution-based recommendations' }
];

export default function QuestionnaireForm({ onComplete, onBack, prefillData }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    name: prefillData?.name || '',
    email: prefillData?.email || '',
    gender: prefillData?.gender || '',
    age_group: prefillData?.age_group || '',
    exact_age: '',
    budget_range: prefillData?.budget_range || 'mid-range',
    budget_amount: prefillData?.budget_amount || 1500,
    skin_types: prefillData?.skin_types || [],
    skin_type: prefillData?.skin_type || '',
    allergies: prefillData?.allergies || '',
    concerns: prefillData?.concerns || [],
    diet_type: prefillData?.diet_type || '',
    location_city: prefillData?.location_city || '',
    pincode: prefillData?.pincode || ''
  });

  const step = STEPS[currentStep];

  const toggleSkinType = (value) => {
    const current = data.skin_types || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : current.length < 4 ? [...current, value] : current;
    setData({ ...data, skin_types: updated, skin_type: updated[0] || '' });
  };

  const toggleConcern = (value) => {
    const current = data.concerns || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setData({ ...data, concerns: updated });
  };

  const getBudgetLabel = (amount) => {
    if (amount <= 700) return 'budget';
    if (amount <= 1500) return 'mid-range';
    return 'premium';
  };

  const canProceed = () => {
    if (currentStep === 0) return data.name && data.gender && (data.age_group || data.exact_age);
    if (currentStep === 1) return data.skin_types?.length > 0;
    if (currentStep === 2) return data.concerns?.length > 0 && data.diet_type;
    if (currentStep === 3) return data.location_city;
    return true;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete({
        ...data,
        age_group: data.exact_age
          ? (parseInt(data.exact_age) < 20 ? 'under_20' : parseInt(data.exact_age) < 30 ? '20_30' : parseInt(data.exact_age) < 40 ? '30_40' : parseInt(data.exact_age) < 50 ? '40_50' : 'above_50')
          : data.age_group,
        budget_range: getBudgetLabel(data.budget_amount),
        primary_concerns: data.concerns.slice(0, 3),
        secondary_concerns: data.concerns.slice(3)
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="text-center pt-10 pb-4 px-6">
        <h1 className="text-4xl font-bold mb-1" style={{ color: '#FF69B4' }}>Célure</h1>
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
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">{step.title}</h2>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </div>

            {/* STEP 1: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Full Name *</Label>
                  <Input
                    placeholder="e.g. Priya Sharma"
                    value={data.name}
                    onChange={e => setData({ ...data, name: e.target.value })}
                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Email (optional)</Label>
                  <Input
                    type="email"
                    placeholder="yourname@email.com"
                    value={data.email}
                    onChange={e => setData({ ...data, email: e.target.value })}
                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-3 block">Gender *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'male', label: '♂ Male' },
                      { value: 'female', label: '♀ Female' },
                      { value: 'other', label: '⚧ Other' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setData({ ...data, gender: opt.value })}
                        className={`p-4 rounded-2xl border-2 transition-all text-sm font-semibold ${
                          data.gender === opt.value ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-3 block">Age *</Label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { value: 'under_20', label: 'Under 18' },
                      { value: '20_30', label: '18–24' },
                      { value: '30_40', label: '25–34' },
                      { value: '40_50', label: '35–44' },
                      { value: 'above_50', label: '45+' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setData({ ...data, age_group: opt.value, exact_age: '' })}
                        className={`p-3 rounded-xl border-2 transition-all text-sm ${
                          data.age_group === opt.value && !data.exact_age ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    placeholder="Or enter exact age"
                    value={data.exact_age}
                    onChange={e => setData({ ...data, exact_age: e.target.value, age_group: '' })}
                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">
                    Monthly Skincare Budget: <span className="text-pink-400 font-bold">₹{data.budget_amount}</span>
                  </Label>
                  <div className="px-2 py-4">
                    <Slider
                      value={[data.budget_amount]}
                      onValueChange={([val]) => setData({ ...data, budget_amount: val })}
                      min={500}
                      max={5000}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>₹500</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        data.budget_amount <= 700 ? 'bg-blue-500/20 text-blue-400' :
                        data.budget_amount <= 1500 ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {data.budget_amount <= 700 ? 'Budget' : data.budget_amount <= 1500 ? 'Mid-Range' : 'Premium'}
                      </span>
                      <span>₹5000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Skin Profile */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">Skin Type(s) * <span className="text-gray-500">(select 1–4)</span></Label>
                  <p className="text-xs text-gray-500 mb-3">You can have multiple skin types</p>
                  <div className="space-y-3">
                    {SKIN_TYPES.map(opt => {
                      const selected = (data.skin_types || []).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          onClick={() => toggleSkinType(opt.value)}
                          className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${
                            selected ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                          }`}
                        >
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
                  <Label className="text-gray-300 text-sm mb-2 block">Allergies (Optional)</Label>
                  <p className="text-xs text-gray-500 mb-2">Separate multiple with commas</p>
                  <Input
                    placeholder="e.g. fragrance, retinol, nuts, latex"
                    value={data.allergies}
                    onChange={e => setData({ ...data, allergies: e.target.value })}
                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Concerns + Diet */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">Skin Concerns * <span className="text-gray-500">(select all that apply)</span></Label>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {SKIN_CONCERNS.map(opt => {
                      const selected = (data.concerns || []).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          onClick={() => toggleConcern(opt.value)}
                          className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 text-left ${
                            selected ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-white bg-white' : 'border-gray-600'
                          }`}>
                            {selected && <span className="text-pink-500 text-xs">✓</span>}
                          </div>
                          <span className="text-sm font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-3 block">Diet *</Label>
                  <div className="space-y-3">
                    {[
                      { value: 'healthy', label: '🥗 Balanced', desc: 'Fruits, vegetables & whole foods' },
                      { value: 'semi_healthy', label: '🍱 Semi-Healthy', desc: 'Mix of healthy & occasional processed' },
                      { value: 'junk_food', label: '🍔 Mostly Junk', desc: 'High sugar, fried & processed foods' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setData({ ...data, diet_type: opt.value })}
                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                          data.diet_type === opt.value ? 'bg-pink-500 border-pink-500' : 'bg-gray-900 border-gray-800'
                        }`}
                      >
                        <p className="font-semibold">{opt.label}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Location */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">City *</Label>
                  <Input
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                    value={data.location_city}
                    onChange={e => setData({ ...data, location_city: e.target.value })}
                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-2">🌫️ We use AQI & pollution data to adjust your routine</p>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Pincode (Optional)</Label>
                  <Input
                    placeholder="e.g., 400001"
                    value={data.pincode}
                    onChange={e => setData({ ...data, pincode: e.target.value })}
                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
                  <p className="text-pink-400 text-sm font-semibold mb-3">Profile Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Name</p>
                      <p className="text-white">{data.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Skin Type(s)</p>
                      <p className="text-white capitalize">{(data.skin_types || []).join(', ') || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Budget</p>
                      <p className="text-white">₹{data.budget_amount}/mo</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Concerns</p>
                      <p className="text-white">{(data.concerns || []).length} selected</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Navigation Buttons - positioned above bottom nav */}
      <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-6">
        <div className="flex gap-3">
          <Button
            onClick={() => currentStep > 0 ? setCurrentStep(p => p - 1) : onBack?.()}
            variant="outline"
            className="flex-1 h-14 rounded-xl border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10 bg-transparent font-semibold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-[2] h-14 rounded-xl font-semibold text-white disabled:opacity-40 disabled:bg-gray-800"
            style={{ background: canProceed() ? '#FF69B4' : undefined }}
          >
            {currentStep === STEPS.length - 1 ? '🚀 Start My Analysis' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  );
}