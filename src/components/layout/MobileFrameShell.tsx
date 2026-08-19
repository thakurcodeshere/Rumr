import React from 'react';
import { useApp } from '../../lib/store';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { ShaderBackground } from '../ui/ShaderBackground';
import { AiNudgeModal } from '../ui/AiNudgeModal';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const MobileFrameShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMobileFrame, currentView } = useApp();

  return (
    <div className="min-h-screen bg-[#070707] text-[#e5e2e1] flex flex-col items-center justify-start relative">
      <ShaderBackground />
      <AiNudgeModal />

      {/* Main Content Area */}
      {isMobileFrame ? (
        <div className="w-full max-w-[430px] my-0 sm:my-6 min-h-screen sm:min-h-[880px] bg-[#111111] sm:border-4 sm:border-[#2a2a2a] sm:shadow-[0_0_50px_rgba(0,0,0,0.9),8px_8px_0px_#a855f7] flex flex-col relative z-10 sm:rounded-[36px] overflow-hidden">
          
          {/* Simulated Mobile Status Bar on Desktop */}
          <div className="hidden sm:flex items-center justify-between px-6 pt-3 pb-1 bg-[#111111] text-xs font-mono text-gray-400 select-none">
            <span className="font-bold text-white">9:41</span>
            {/* Dynamic Island pill */}
            <div className="w-20 h-4 bg-black rounded-full border border-[#222]" />
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-white" />
              <Wifi className="w-3 h-3 text-white" />
              <BatteryMedium className="w-4 h-4 text-white" />
            </div>
          </div>

          <AppHeader />

          {/* Scrollable Viewport */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
            {children}
          </main>

          <BottomNav />

          {/* Simulated Home Indicator Bar */}
          <div className="hidden sm:flex justify-center pb-2 bg-[#0e0e0e]">
            <div className="w-32 h-1 bg-gray-600 rounded-full" />
          </div>
        </div>
      ) : (
        /* Full Desktop Layout */
        <div className="w-full max-w-6xl min-h-screen bg-[#111111] border-x border-[#222] flex flex-col relative z-10">
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
