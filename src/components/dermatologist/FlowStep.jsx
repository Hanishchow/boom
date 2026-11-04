import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function FlowStep({ title, stepLabel, onBack, children, footer }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-gray-900 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-full bg-gray-900 hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="font-semibold">{title}</span>
        {stepLabel && <span className="ml-auto text-xs text-gray-500">{stepLabel}</span>}
      </div>
      <div className="flex-1 px-4 py-6 overflow-y-auto pb-24">
        {children}
      </div>
      {footer && <div className="px-4 pb-8 pt-2">{footer}</div>}
    </div>
  );
}