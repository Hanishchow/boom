import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

const CATEGORIES = ['All', 'Nose', 'Eyes', 'Jaw & Chin', 'Cheeks', 'Lips', 'Forehead & Brow', 'Full Face'];

function formatINR(n) {
  if (n >= 100000) {
    const lakhs = n / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  return `₹${(n / 1000).toFixed(0)}K`;
}

function RecoveryBadge({ days }) {
  if (days === 0) {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Same day</span>;
  }
  if (days <= 14) {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">1–2 weeks</span>;
  }
  return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">3+ weeks</span>;
}

export default function ProcedureSelector({
  procedures = [],
  selectedProcedures = [],
  onToggleProcedure,
  recommendedProcedureNames = []
}) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? procedures
    : procedures.filter(p => p.subcategory === activeCategory);

  const isSelected = (proc) => selectedProcedures.some(p => p.id === proc.id);

  return (
    <div>
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-pink-500 text-white'
                : 'bg-gray-900 border border-gray-800 text-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected chips */}
      {selectedProcedures.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 mb-4">
          {selectedProcedures.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 bg-pink-500/10 text-pink-400 px-3 py-1 rounded-full text-xs"
            >
              <span className="max-w-[180px] truncate">{p.procedure_name}</span>
              <button onClick={() => onToggleProcedure(p)}>
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Procedure cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {filtered.map(proc => {
          const selected = isSelected(proc);
          const recommended = recommendedProcedureNames.includes(proc.procedure_name);
          const maxReached = !selected && selectedProcedures.length >= 3;

          return (
            <button
              key={proc.id}
              onClick={() => !maxReached && onToggleProcedure(proc)}
              disabled={maxReached}
              className={`relative text-left rounded-2xl p-4 transition-all border-2 ${
                selected
                  ? 'bg-pink-500/10 border-pink-500'
                  : recommended
                    ? 'bg-gray-900 border-pink-500/40 animate-pulse'
                    : 'bg-gray-900 border-gray-800'
              } ${maxReached ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {/* Selected indicator */}
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Recommended tag */}
              {recommended && !selected && (
                <div className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-medium">
                  Recommended
                </div>
              )}

              {/* Category badge */}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full mb-2 inline-block ${
                proc.category === 'Surgical'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-blue-500/10 text-blue-400'
              }`}>
                {proc.category}
              </span>

              {/* Name */}
              <h4 className="text-sm font-semibold leading-tight mb-1 pr-4">
                {proc.procedure_name}
              </h4>

              {/* Description */}
              <p className="text-xs text-gray-400 leading-relaxed mb-2 line-clamp-2">
                {proc.description}
              </p>

              {/* Cost */}
              <p className="text-xs text-pink-400 font-medium mb-2">
                {formatINR(proc.average_cost_inr_min)} – {formatINR(proc.average_cost_inr_max)}
              </p>

              {/* Recovery */}
              <div className="mb-2">
                <RecoveryBadge days={proc.recovery_days} />
              </div>

              {/* Golden ratio metric */}
              <p className="text-[10px] text-gray-500 leading-tight line-clamp-1">
                {proc.golden_ratio_metric}
              </p>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No procedures in this category.
        </div>
      )}
    </div>
  );
}