import React from 'react';
import { useApp } from '../../lib/store';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { ShaderBackground } from '../ui/ShaderBackground';
import { AiNudgeModal } from '../ui/AiNudgeModal';
import { GuestRestrictionModal } from '../ui/GuestRestrictionModal';
import { SCREEN_FRAME_SPECS } from '../../lib/frame-specs';
import { Wifi, BatteryMedium, Signal, Info, Smartphone } from 'lucide-react';

export const MobileFrameShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMobileFrame, selectedFrame, currentView } = useApp();
  const frameSpec = SCREEN_FRAME_SPECS[selectedFrame] || SCREEN_FRAME_SPECS['iphone-16-pro'];

  return (
    <div className="min-h-screen bg-[#070707] text-[#e5e2e1] flex flex-col items-center justify-start relative">
      <ShaderBackground />
      <AiNudgeModal />
      <GuestRestrictionModal />

      {/* Main Content Area */}
      {isMobileFrame && selectedFrame !== 'fluid' ? (
        <div className="flex flex-col items-center my-4 sm:my-8 px-2 w-full">
          
          {/* Active Screen Frame Container */}
          <div 
            style={{ 
              width: `${frameSpec.width}px`,
              maxWidth: '100%',
              minHeight: `${Math.min(frameSpec.height, 860)}px`,
              borderRadius: `${frameSpec.cornerRadius}px`
            }}
            className="bg-[#111111] border-4 border-[#2a2a2a] shadow-[0_0_60px_rgba(0,0,0,0.95),8px_8px_0px_#a855f7] flex flex-col relative z-10 overflow-hidden transition-all duration-300"
          >
            {/* Simulated Mobile Status Bar */}
            <div className="flex items-center justify-between px-6 pt-3 pb-1.5 bg-[#111111] text-xs font-mono text-gray-400 select-none border-b border-[#1c1c1c]">
              <span className="font-bold text-white text-[11px]">9:41</span>
              
              {/* Dynamic Island or Notch or Punch Hole */}
              {frameSpec.notchType === 'dynamic-island' && (
                <div className="w-24 h-5 bg-black rounded-full border border-[#222] flex items-center justify-end px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-[#333]" />
                </div>
              )}
              {frameSpec.notchType === 'punch-hole' && (
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-[#333]" />
              )}
              {frameSpec.notchType === 'none' && (
                <span className="font-mono text-[9px] text-[#a855f7] font-bold">RUMR_OS</span>
              )}

              <div className="flex items-center gap-1.5">
                <Signal className="w-3 h-3 text-white" />
                <Wifi className="w-3 h-3 text-white" />
                <BatteryMedium className="w-4 h-4 text-white" />
              </div>
            </div>

            <AppHeader />

            {/* Scrollable Viewport */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative bg-[#111111]">
              {children}
            </main>

            <BottomNav />

            {/* Simulated Home Indicator Bar */}
            <div className="flex justify-center pb-2 pt-1 bg-[#0e0e0e] border-t border-[#1c1c1c]">
              <div className="w-32 h-1 bg-gray-600 rounded-full" />
            </div>
          </div>

          {/* Under-frame specification readout */}
          <div className="mt-3 font-mono text-[11px] text-gray-400 bg-[#121212] border border-[#262626] px-4 py-1.5 flex items-center gap-3">
            <span className="text-[#ccff00] font-bold">FRAME: {frameSpec.name}</span>
            <span className="text-gray-600">•</span>
            <span>Target: {frameSpec.width} × {frameSpec.height} px</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">{frameSpec.ratio}</span>
          </div>
        </div>
      ) : (
        /* Full Desktop Layout */
        <div className="w-full max-w-6xl min-h-screen bg-[#111111] border-x border-[#222] flex flex-col relative z-10 my-4">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            {children}
          </main>
          <BottomNav />
        </div>
      )}
    </div>
  );
};
