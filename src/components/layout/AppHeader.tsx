import React from 'react';
import { Shield, Sparkles, Smartphone, Monitor, Layers, Radio, GitBranch, Globe, MapPin } from 'lucide-react';
import { useApp } from '../../lib/store';
import { BrutalistBadge } from '../ui/BrutalistBadge';

export const AppHeader: React.FC = () => {
  const { 
    currentView, 
    navigate, 
    user, 
    isMobileFrame, 
    toggleMobileFrame, 
    activeAudioRoom,
    userLocation,
    openLocationPrompt
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
          {/* Location / City Radar Button */}
          <button
            onClick={openLocationPrompt}
            className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#141d0e] text-[#ccff00] border-2 border-[#ccff00] px-2 py-1.5 shadow-[2px_2px_0px_#a855f7] hover:bg-white hover:text-black transition-all"
            title="Configure Browser Location Radar"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[85px] sm:max-w-none">{userLocation.city}</span>
          </button>

          {/* Landing Page Website Link */}
          <a
            href="/landing.html"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold bg-[#181818] text-[#ccff00] border-2 border-[#333] hover:border-[#ccff00] px-2 py-1.5 transition-colors"
            title="Open Rumr Marketing & Discovery Website"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>LANDING SITE ↗</span>
          </a>
        </div>
      </div>
    </header>
  );
};
