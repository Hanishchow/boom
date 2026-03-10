import React from 'react';
import { motion } from 'framer-motion';

const METRIC_CONFIG = {
  oily: { sebum: 72, pores: 'Moderate', acne: 'Mild', barrier: 'Fair' },
  combination: { sebum: 45, pores: 'Mild', acne: 'Minimal', barrier: 'Good' },
  dry: { sebum: 12, pores: 'Minimal', acne: 'Minimal', barrier: 'Compromised' },
  sensitive: { sebum: 20, pores: 'Minimal', acne: 'Mild', barrier: 'Weak' },
  normal: { sebum: 28, pores: 'Normal', acne: 'Clear', barrier: 'Healthy' }
};

const SEVERITY_COLOR = {
  'Clear': '#22c55e', 'Minimal': '#22c55e', 'Healthy': '#22c55e', 'Good': '#22c55e',
  'Mild': '#f59e0b', 'Normal': '#f59e0b', 'Fair': '#f59e0b',
  'Moderate': '#ef4444', 'Compromised': '#ef4444', 'Weak': '#ef4444'
};

function RadialGauge({ value, max = 100, label, color = '#FF69B4' }) {
  const percentage = Math.min(value / max, 1);
  const circumference = 2 * Math.PI * 28;
  const strokeDash = circumference * percentage;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#1f2937" strokeWidth="6" />
          <motion.circle
            cx="32" cy="32" r="28" fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - strokeDash }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-sm font-bold">{value}%</span>
        </div>
      </div>
      <span className="text-gray-400 text-xs text-center">{label}</span>
    </div>
  );
}

function StatusBadge({ label, value }) {
  const color = SEVERITY_COLOR[value] || '#f59e0b';
  return (
    <div className="bg-gray-900 rounded-2xl p-4 flex flex-col gap-2 border border-gray-800">
      <span className="text-gray-400 text-xs">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-white font-semibold text-sm">{value}</span>
      </div>
    </div>
  );
}

export default function SkinMetricsCard({ profile }) {
  const skinType = profile?.ai_adjusted_skin_type || profile?.skin_type || 'normal';
  const metrics = METRIC_CONFIG[skinType] || METRIC_CONFIG.normal;

  // Adjust based on concerns
  const concerns = profile?.primary_concerns || [];
  if (concerns.includes('acne')) metrics.acne = 'Moderate';
  if (concerns.includes('oiliness')) metrics.sebum = Math.min(metrics.sebum + 15, 95);

  const hydrationLevel = ['dry', 'sensitive'].includes(skinType) ? 38 : 65;
  const barrierScore = skinType === 'dry' ? 42 : skinType === 'sensitive' ? 48 : 72;

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">Scan Overview</h2>
          <p className="text-gray-400 text-sm capitalize">{skinType.replace('_', ' ')} Skin Detected</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30">
          <span className="text-pink-400 text-xs font-semibold">AI Analysis</span>
        </div>
      </div>

      {/* Radial Gauges */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <RadialGauge value={metrics.sebum} label="Excess Sebum" color="#FF69B4" />
        <RadialGauge value={hydrationLevel} label="Hydration" color="#818cf8" />
        <RadialGauge value={barrierScore} label="Barrier Health" color="#34d399" />
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatusBadge label="Enlarged Pores" value={metrics.pores} />
        <StatusBadge label="Active Acne" value={metrics.acne} />
        <StatusBadge label="Barrier Function" value={metrics.barrier} />
        <StatusBadge label="Inflammation" value={concerns.includes('sensitivity') ? 'Mild' : 'Clear'} />
      </div>

      {/* Detected Concerns from AI Image */}
      {profile?.ai_detected_concerns?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-gray-400 text-xs mb-3">Photo Analysis Detected</p>
          <div className="space-y-2">
            {profile.ai_detected_concerns.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-white text-sm capitalize">{c.concern?.replace('_', ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-pink-500"
                      style={{ width: `${c.confidence || 50}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-8">{c.confidence || 50}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}