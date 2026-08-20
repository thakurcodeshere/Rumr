import React from 'react';
import { X, Lock, Shield, MessageSquare, Zap } from 'lucide-react';
import { BrutalistButton } from './BrutalistButton';

interface EncryptedMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: () => void;
  matchRate?: number;
  partnerHandle?: string;
  overlappingTopics?: string[];
}

export const EncryptedMatchModal: React.FC<EncryptedMatchModalProps> = ({
  isOpen,
  onClose,
  onStartChat,
  matchRate = 88,
  partnerHandle = 'cipher_vanguard',
  overlappingTopics = ['Ghosting After Dates', 'Startup Drama', 'Office Politics', 'Dating Friction']
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in select-none">
      <div className="bg-[#0e0e0e] border-4 border-[#2a2a2a] w-full max-w-sm flex flex-col shadow-[10px_10px_0px_#a855f7] overflow-hidden text-center relative">
        
        {/* Top Location Bar */}
        <div className="flex items-center justify-between p-3 border-b border-[#222] bg-[#080808] font-mono text-xs">
          <div className="text-[#ccff00] font-bold tracking-widest uppercase">
            LONDON_UK // GURGAON_NCR
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 flex flex-col items-center justify-center">

          {/* Overlapping Glitched / Encrypted Avatar Cards */}
          <div className="relative my-2 w-48 h-36 flex items-center justify-center">
            {/* Background Layer (Purple) */}
            <div className="absolute w-32 h-32 bg-[#1b1526] border-2 border-[#a855f7] rotate-6 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#a855f7]/30 to-black filter blur-[2px]" />
            </div>

            {/* Foreground Layer (Lime + Glitched Avatar) */}
            <div className="absolute w-32 h-32 bg-[#121212] border-2 border-[#ccff00] -rotate-3 p-1.5 flex flex-col items-center justify-center shadow-2xl">
              <div className="w-full h-full bg-[#0a0a0a] border border-[#333] relative overflow-hidden flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80" 
                  alt="Encrypted Partner" 
                  className="w-full h-full object-cover filter grayscale contrast-200 blur-[8px] opacity-60"
                />
                {/* Lock Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                  <Lock className="w-6 h-6 text-[#ccff00] mb-1 animate-pulse" />
                  <span className="font-mono text-[9px] text-[#ccff00] font-black tracking-widest uppercase">
                    UNKNOWN_
                  </span>
                </div>
              </div>
            </div>

            {/* Sync Established Badge */}
            <div className="absolute -bottom-2 bg-black border-2 border-white px-3 py-1 font-mono text-[10px] text-white font-black uppercase tracking-wider z-10 shadow-[2px_2px_0px_#ccff00]">
              SYNC_ESTABLISHED
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1">
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              IT'S A MATCH!
            </h2>
            <div className="w-16 h-0.5 bg-[#333] mx-auto my-1.5" />
            <p className="font-mono text-xs text-[#ccff00] font-bold tracking-wider uppercase">
              "SAME CHAOS. SAME TOPICS."
            </p>
          </div>

          {/* Match Specs & Topic Overlaps Card */}
          <div className="w-full bg-[#141414] border-2 border-[#262626] p-3.5 space-y-3 text-left">
            <div className="flex justify-between items-center font-mono text-xs border-b border-[#222] pb-2">
              <span className="text-gray-400 font-bold">MATCH_RATE: <strong className="text-[#ccff00] text-sm">{matchRate}%</strong></span>
              <span className="text-[#ccff00] font-bold">{overlappingTopics.length} TOPIC OVERLAPS</span>
            </div>

            {/* Overlapping Topic Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {overlappingTopics.map((topic, i) => (
                <span
                  key={topic}
                  className={`font-mono text-[10px] px-2 py-1 font-bold uppercase ${
                    i === 0
                      ? 'bg-[#a855f7] text-black border border-[#a855f7]'
                      : i === 1
                      ? 'bg-transparent border border-[#ccff00] text-[#ccff00]'
                      : 'bg-[#1e1e1e] text-gray-300 border border-[#333]'
                  }`}
                >
                  {topic}
                </span>
              ))}
            </div>

            {/* Encrypted Notice */}
            <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-gray-500 border-t border-[#1f1f1f]">
              <Shield className="w-3 h-3 text-[#a855f7]" />
              <span>Identity & Real Face Encrypted (Vault Tier 0)</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full space-y-2 pt-1">
            <BrutalistButton
              variant="primary"
              size="lg"
              onClick={onStartChat}
              className="w-full justify-center text-sm font-black shadow-[4px_4px_0px_#a855f7] flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-black text-black" />
              SAY SOMETHING (START CHAT)
            </BrutalistButton>

            <button
              onClick={onClose}
              className="w-full py-2 font-mono text-xs text-gray-400 hover:text-white uppercase font-bold tracking-wider transition-colors"
            >
              MAYBE LATER / KEEP SWIPING
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
