import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Golden Ratio insight panel.
 * Collapsed: overall score arc. Expanded: 8 metric bars.
 */
export default function GoldenRatioPanel({
  report,
  onMetricTap,
  isExpanded,
  onToggleExpand
}) {
  if (!report) return null;

  const { overallScore, metrics } = report;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallScore / 100) * circumference;

  // Score color
  const scoreColor = overallScore >= 75 ? '#22c55e' : overallScore >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-4 p-4"
      >
        {/* Score arc */}
        <div className="flex-shrink-0 relative">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f1f1f" strokeWidth="7" />
            <circle
              cx="50" cy="50" r={radius}
              fill="none" stroke={scoreColor} strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: scoreColor }}>{overallScore}</span>
            <span className="text-[9px] text-gray-500">/ 100</span>
          </div>
        </div>

        <div className="flex-1 text-left">
          <h3 className="text-sm font-semibold">Facial Harmony Score</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isExpanded ? 'Tap to collapse' : 'Tap to see breakdown'}
          </p>
        </div>

        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded metrics */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="h-px bg-gray-800 mb-3" />

          {metrics.map((metric, idx) => {
            const barColor = metric.score >= 75 ? '#22c55e' : metric.score >= 50 ? '#eab308' : '#ef4444';
            const idealPercent = 100; // ideal is always "full bar" conceptually

            return (
              <button
                key={idx}
                onClick={() => metric.relatedProcedure && onMetricTap(metric.relatedProcedure)}
                className={`w-full text-left ${metric.relatedProcedure ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">{metric.name}</span>
                  <span className="text-xs font-medium" style={{ color: barColor }}>
                    {metric.score}
                  </span>
                </div>

                {/* Bar */}
                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all"
                    style={{ width: `${metric.score}%`, backgroundColor: barColor }}
                  />
                  {/* Ideal marker */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/40"
                    style={{ left: `${idealPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-gray-600">
                    Ratio: {metric.ratio} · Ideal: {metric.ideal}
                  </span>
                  {metric.relatedProcedure && (
                    <span className="text-[10px] text-pink-500 truncate ml-2">
                      → {metric.relatedProcedure}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Footnote */}
          <p className="text-[10px] text-gray-600 leading-relaxed mt-3">
            Based on classical golden ratio (φ=1.618), neoclassical canons, and facial
            thirds/fifths. For reference only — beauty is not defined by mathematics.
          </p>
        </div>
      )}
    </div>
  );
}