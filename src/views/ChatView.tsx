import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { Lock, Unlock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { IdentityDecryptedModal } from '../components/ui/IdentityDecryptedModal';

export const ChatView: React.FC = () => {
  const { 
    chatMessages, 
    partner, 
    sendChatMessage, 
    revealStage, 
    revealConsent, 
    requestRevealConsent, 
    advanceReveal, 
    resetReveal,
    navigate,
    isGuest,
    resetToBeforeRegister
  } = useApp();

  const [input, setInput] = useState('');
  const [showDecryptedModal, setShowDecryptedModal] = useState(false);

  if (isGuest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0e0e0e] text-center space-y-5 min-h-[500px]">
        <div className="w-16 h-16 bg-[#1a1726] border-2 border-[#a855f7] flex items-center justify-center text-[#ccff00] shadow-[4px_4px_0px_#a855f7]">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-xs">
          <BrutalistBadge variant="purple">GUEST RESTRICTION</BrutalistBadge>
          <h3 className="font-serif text-2xl font-black text-white mt-1">Encrypted Chat Locked</h3>
          <p className="font-sans text-xs text-gray-400 leading-relaxed">
            1-on-1 encrypted topic tunnels and progressive unmasking are reserved for phone-verified users.
          </p>
        </div>
        <BrutalistButton
          variant="primary"
          size="md"
          onClick={() => resetToBeforeRegister()}
          className="flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-black" />
          REGISTER WITH PHONE TO UNLOCK
        </BrutalistButton>
      </div>
    );
  }

  const handleRevealRequest = () => {
    requestRevealConsent();
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ccff00', '#a855f7', '#ffffff']
    });
  };

  return (
    <div className="p-4 bg-[#0e0e0e] min-h-[500px] flex flex-col justify-start">
      {/* Mutual Identity Unmasking Frame */}
      <div className="bg-[#141414] border border-[#2a2a2a] p-4 space-y-3 shadow-[4px_4px_0px_#a855f7]">
        {/* Stage Header */}
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-gray-300 font-bold uppercase tracking-wider">
            MUTUAL IDENTITY UNMASKING
          </span>
          <span className="font-mono text-xs bg-[#a855f7] text-black px-2.5 py-0.5 font-bold uppercase">
            STAGE {revealStage}/3
          </span>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className={`h-1.5 ${revealStage >= 1 ? 'bg-[#ccff00]' : 'bg-[#262626]'}`} />
          <div className={`h-1.5 ${revealStage >= 2 ? 'bg-[#ccff00]' : 'bg-[#262626]'}`} />
          <div className={`h-1.5 ${revealStage >= 3 ? 'bg-[#ccff00]' : 'bg-[#262626]'}`} />
        </div>

        {/* Dynamic Stage Content Box */}
        <div className="text-xs font-mono bg-[#1a1a1a] p-3 border border-[#333]">
          {revealStage === 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">All Identity Layers Encrypted</span>
              <button 
                onClick={handleRevealRequest}
                className="text-[#ccff00] font-bold hover:underline"
              >
                {revealConsent.me ? "Waiting for consent..." : "Request Layer 1 Reveal →"}
              </button>
            </div>
          )}

          {revealStage === 1 && (
            <div className="flex items-center justify-between">
              <span className="text-[#ddb7ff]">Layer 1: {partner.city} • {partner.role}</span>
              <button 
                onClick={advanceReveal}
                className="text-[#ccff00] font-bold hover:underline"
              >
                Request Bio →
              </button>
            </div>
          )}

          {revealStage === 2 && (
            <div className="flex items-center justify-between">
              <span className="text-[#ccff00]">Layer 2: "{partner.tagline}"</span>
              <button 
                onClick={() => { 
                  advanceReveal(); 
                  setShowDecryptedModal(true);
                  triggerCelebration(); 
                }}
                className="text-[#a855f7] font-bold hover:underline"
              >
                Full Unmasking →
              </button>
            </div>
          )}

          {revealStage === 3 && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img 
                  src={partner.realPhoto} 
                  alt={partner.realName} 
                  className="w-10 h-10 border-2 border-[#ccff00] object-cover" 
                />
                <div>
                  <div className="font-bold text-white text-sm">{partner.realName}</div>
                  <div className="text-[10px] text-gray-400">{partner.role} • {partner.city}</div>
                </div>
              </div>

              <button
                onClick={() => setShowDecryptedModal(true)}
                className="bg-[#ccff00] text-black font-mono text-[10px] font-black px-2.5 py-1 uppercase shadow-[2px_2px_0px_#a855f7] hover:bg-white transition-all flex items-center gap-1"
              >
                <Unlock className="w-3 h-3" />
                VIEW DECRYPTED
              </button>
            </div>
          )}
        </div>

        {/* Vault Anonymity Protocol / Decrypted Launcher */}
        <div className="pt-2 border-t border-[#222] flex items-center justify-between font-mono text-xs">
          <span className="text-gray-400">Vault Anonymity Protocol:</span>
          <button
            onClick={() => {
              setShowDecryptedModal(true);
              triggerCelebration();
            }}
            className="text-[#ccff00] font-bold hover:underline flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>THEY SHARED MORE (IDENTITY DECRYPTED) ↗</span>
          </button>
        </div>
      </div>

      {/* Merged Identity Decrypted Screen-Frame Modal */}
      <IdentityDecryptedModal
        isOpen={showDecryptedModal}
        onClose={() => setShowDecryptedModal(false)}
        partner={partner}
      />
    </div>
  );
};
