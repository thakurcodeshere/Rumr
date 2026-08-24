import React from 'react';
import { useApp } from '../../lib/store';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { ShaderBackground } from '../ui/ShaderBackground';
import { AiNudgeModal } from '../ui/AiNudgeModal';
import { GuestRestrictionModal } from '../ui/GuestRestrictionModal';

export const MobileFrameShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#070707] text-[#e5e2e1] flex flex-col items-center justify-start relative select-none">
      <ShaderBackground />
      <AiNudgeModal />
      <GuestRestrictionModal />

      {/* Main Responsive Fit-to-Screen Container */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl min-h-screen flex flex-col bg-[#111111] sm:border-x sm:border-[#262626] sm:shadow-[0_0_50px_rgba(0,0,0,0.8),4px_0_20px_rgba(168,85,247,0.15)] relative z-10">
        
        {/* Sticky App Header */}
        <AppHeader />

        {/* Scrollable Viewport - Seamless Vertical Scrolling */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative bg-[#111111] pb-4">
          {children}
        </main>

        {/* Sticky Bottom Navigation */}
        <BottomNav />

      </div>
    </div>
  );
};
