import React from 'react';
import { useApp } from '../../lib/store';
import { BrutalistButton } from './BrutalistButton';
import { BrutalistBadge } from './BrutalistBadge';
import { Lock, ShieldAlert, Sparkles, X, ArrowRight, UserCheck } from 'lucide-react';

export const GuestRestrictionModal: React.FC = () => {
  const { guestLock, dismissGuestLock, resetToBeforeRegister } = useApp();

  if (!guestLock || !guestLock.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="bg-[#121212] border-4 border-[#ccff00] p-6 max-w-sm w-full space-y-4 shadow-[8px_8px_0px_#a855f7] relative">
        <button
          onClick={dismissGuestLock}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white bg-[#1a1a1a] border border-[#333]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#a855f7] text-black">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] bg-[#222] text-[#ccff00] font-bold px-1.5 py-0.5 uppercase">
              GUEST MODE RESTRICTION
            </span>
            <h3 className="font-serif text-lg font-black text-white mt-0.5">
              {guestLock.featureName}
            </h3>
          </div>
        </div>

        <p className="font-sans text-xs text-gray-300 bg-[#181818] p-3 border-l-2 border-[#ccff00] leading-relaxed">
          {guestLock.description || 'You are browsing in Guest Mode. Create an account with your email to unlock live chat tunnels, topic matching, and community debates.'}
        </p>

        <div className="space-y-2 pt-2">
          <BrutalistButton
            variant="primary"
            size="md"
            onClick={() => {
              dismissGuestLock();
              resetToBeforeRegister();
            }}
            className="w-full justify-center flex items-center gap-1.5 font-bold"
          >
            <UserCheck className="w-4 h-4 text-black" />
            CREATE ACCOUNT WITH EMAIL
          </BrutalistButton>

          <button
            onClick={dismissGuestLock}
            className="w-full py-2 font-mono text-xs text-gray-400 hover:text-white transition-colors"
          >
            Continue Browsing as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
