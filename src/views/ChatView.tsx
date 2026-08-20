import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { Send, Lock, Unlock, Sparkles } from 'lucide-react';
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatMessage(input);
    setInput('');
  };

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
    <div className="flex-1 flex flex-col justify-between p-4 bg-[#0e0e0e] min-h-[620px] select-none">
      
      {/* 1. TOP FRAME: MUTUAL IDENTITY UNMASKING */}
      <div className="bg-[#141414] border-2 border-[#2a2a2a] p-3.5 space-y-3 shadow-[4px_4px_0px_#a855f7] mb-3">
        
        {/* Header Title + Stage Badge */}
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

        {/* Dynamic Unmask Layer Box */}
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

        {/* Vault Anonymity Protocol / Decrypted Launcher Trigger */}
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

      {/* 2. CHATS BELOW: Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 max-h-[360px]">
        {chatMessages.map(msg => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="font-mono text-[10px] text-gray-500 bg-[#161616] px-3 py-1 border border-[#222]">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="font-mono text-[9px] text-gray-500 mb-0.5 px-1">
                {isMe ? 'You' : partner.handle} • {msg.timestamp}
              </div>
              <div
                className={`max-w-[85%] p-3 text-xs font-sans leading-relaxed border ${
                  isMe
                    ? 'bg-[#1a2414] border-[#ccff00] text-white shadow-[2px_2px_0px_#ccff00]'
                    : 'bg-[#181524] border-[#a855f7] text-[#e5e2e1] shadow-[2px_2px_0px_#a855f7]'
                }`}
              >
                {msg.text}
              </div>
              {msg.expiresInSeconds && (
                <div className="font-mono text-[8px] text-gray-600 mt-0.5">
                  Ephemeral expiry: ~5m
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Message Input Form */}
      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-[#262626]">
        <input
          type="text"
          placeholder="Send encrypted debate point..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-[#161616] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2 font-mono text-xs text-white outline-none rounded-none"
        />
        <BrutalistButton variant="primary" size="md" type="submit">
          <Send className="w-3.5 h-3.5 text-black" />
        </BrutalistButton>
      </form>

      {/* Merged Identity Decrypted Screen-Frame Modal */}
      <IdentityDecryptedModal
        isOpen={showDecryptedModal}
        onClose={() => setShowDecryptedModal(false)}
        partner={partner}
      />
    </div>
  );
};
