import React from 'react';
import { Shield, Sparkles, Smartphone, Monitor, Layers, Radio, GitBranch } from 'lucide-react';
import { useApp } from '../../lib/store';
import { BrutalistBadge } from '../ui/BrutalistBadge';

export const AppHeader: React.FC = () => {
  const { 
    currentView, 
    navigate, 
    user, 
    isMobileFrame, 
    toggleMobileFrame, 
    activeAudioRoom
  } = useApp();

  return (
    <header className="bg-[#111111] border-b-2 border-[#262626] px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('feed')}>
          <div className="w-8 h-8 bg-[#ccff00] text-black font-serif font-black text-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#a855f7]">
            R
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-lg tracking-tight text-white">RUMR</span>
              <span className="font-mono text-[9px] bg-[#a855f7] text-black px-1.5 py-0.5 font-bold uppercase tracking-wider">
                TOPIC-FIRST
              </span>
            </div>
          </div>
        </div>

        {/* Live Audio Room Ticker if Active */}
        {activeAudioRoom && (
          <div 
            onClick={() => navigate('rooms')} 
            className="hidden sm:flex items-center gap-2 bg-[#1b1724] border border-[#a855f7] px-2.5 py-1 cursor-pointer animate-pulse"
          >
            <Radio className="w-3.5 h-3.5 text-[#ccff00]" />
            <span className="font-mono text-[11px] text-[#ddb7ff] font-bold truncate max-w-[140px]">
              LIVE: {activeAudioRoom.title}
            </span>
          </div>
        )}

        {/* Controls & Badges */}
        <div className="flex items-center gap-2">
          {/* Toggle Mobile Frame / Desktop View */}
          <button
            onClick={toggleMobileFrame}
            className="p-1.5 bg-[#181818] text-gray-300 border-2 border-[#333] hover:text-white hover:border-white transition-colors"
            title={isMobileFrame ? "Switch to Fullscreen Responsive" : "Switch to Mobile Device Frame"}
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
