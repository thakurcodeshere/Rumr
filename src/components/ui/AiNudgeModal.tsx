import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../lib/store';
import { BrutalistButton } from './BrutalistButton';

export const AiNudgeModal: React.FC = () => {
  const { aiNudge, dismissNudge } = useApp();

  if (!aiNudge || !aiNudge.isOpen) return null;

  const isWarning = aiNudge.severity === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`max-w-md w-full bg-[#141414] border-2 ${isWarning ? 'border-[#ff4444]' : 'border-[#ccff00]'} p-6 shadow-[8px_8px_0px_#000000] relative`}>
        <button 
          onClick={dismissNudge}
          className="absolute top-3 right-3 text-gray-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          {isWarning ? (
            <div className="p-2 bg-[#ff4444] text-black">
              <AlertTriangle className="w-6 h-6" />
            </div>
          ) : (
            <div className="p-2 bg-[#ccff00] text-black">
              <Info className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="font-mono text-[11px] font-bold text-gray-400 uppercase">
              {isWarning ? 'AI SENTINEL // INTEGRITY CHECK' : 'SYSTEM LOG // NOTIFICATION'}
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              {isWarning ? 'Hostility Nudge Triggered' : 'Action Confirmed'}
            </h3>
          </div>
        </div>

        <p className="text-sm font-sans text-gray-300 leading-relaxed my-4 border-l-2 border-gray-700 pl-3">
          {aiNudge.message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <BrutalistButton 
            variant={isWarning ? 'danger' : 'primary'} 
            size="sm"
            onClick={dismissNudge}
          >
            Acknowledge & Dismiss
          </BrutalistButton>
        </div>
      </div>
    </div>
  );
};
