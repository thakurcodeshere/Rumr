import React from 'react';
import { X, Lock, Unlock, Shield, Sparkles, MessageSquare, Crosshair, Key, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { BrutalistButton } from './BrutalistButton';
import { BrutalistBadge } from './BrutalistBadge';

interface IdentityDecryptedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueChat?: () => void;
  partner?: {
    handle: string;
    realName?: string;
    realPhoto?: string;
    city?: string;
    role?: string;
    chaosIndex?: number;
  };
}

export const IdentityDecryptedModal: React.FC<IdentityDecryptedModalProps> = ({
  isOpen,
  onClose,
  onContinueChat,
  partner = {
    handle: 'cipher_vanguard',
    realName: 'Elena Rostova',
    realPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    city: 'San Francisco, CA',
    role: 'Staff ML Infrastructure Engineer',
    chaosIndex: 91
  }
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in select-none">
      <div className="bg-[#0e0e0e] border-4 border-[#ccff00] w-full max-w-sm max-h-[92vh] flex flex-col shadow-[10px_10px_0px_#a855f7] overflow-hidden text-left relative">
        
        {/* Header (Screen 6e342009 + a3450d4b) */}
        <div className="flex items-center justify-between p-3.5 border-b-2 border-[#262626] bg-[#0a0a0a]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-xl text-white">RUMR</span>
            <span className="font-mono text-[9px] bg-[#1a1726] border border-[#a855f7] text-[#ddb7ff] px-1.5 py-0.5 font-bold uppercase">
              PROFILE REVEAL MOMENT
            </span>
          </div>

          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">

          {/* Identity Unlocked Banner */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-[#141d0c] border border-[#ccff00] px-3 py-1 font-mono text-[10px] font-bold text-[#ccff00] uppercase tracking-wider">
              <Unlock className="w-3.5 h-3.5" />
              <span>IDENTITY UNLOCKED // THEY SHARED MORE</span>
            </div>

            <h2 className="font-serif text-3xl font-black text-white uppercase tracking-tight mt-2">
              MATCH SECURED
            </h2>
            <p className="font-mono text-[10px] text-gray-400 leading-relaxed">
              Anonymity protocol suspended. Connection strength optimal.
            </p>
          </div>

          {/* Unmasked High-Resolution Photo Card (Screen a3450d4b) */}
          <div className="bg-[#141414] border-2 border-[#333] overflow-hidden shadow-2xl">
            <div className="w-full h-52 bg-black relative overflow-hidden">
              <img 
                src={partner.realPhoto} 
                alt={partner.realName || partner.handle} 
                className="w-full h-full object-cover filter contrast-110"
              />
              <div className="absolute top-2 left-2 bg-black/80 border border-[#ccff00] px-2 py-0.5 font-mono text-[9px] text-[#ccff00] font-bold">
                ✓ VERIFIED HUMAN
              </div>
            </div>

            <div className="p-3.5 bg-[#121212] border-t-2 border-[#262626]">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-black text-white uppercase">
                  {partner.realName || 'ALEX'}
                </h3>
                <span className="font-mono text-[10px] text-[#a855f7] font-bold">
                  @{partner.handle}
                </span>
              </div>
              <div className="font-mono text-[10px] text-gray-400 mt-0.5">
                {partner.role} • {partner.city}
              </div>
              <div className="font-mono text-[9px] text-[#ccff00] font-bold uppercase mt-1">
                CONNECTION_ESTABLISHED
              </div>
            </div>
          </div>

          {/* Dual Metrics Grid (Screen a3450d4b) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Match Rate Box */}
            <div className="bg-[#141414] border-2 border-[#262626] p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-400 uppercase font-bold">
                <Crosshair className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>MATCH_RATE</span>
              </div>
              <div className="font-serif text-2xl font-black text-white">94%</div>
            </div>

            {/* Vault Level Box */}
            <div className="bg-[#141414] border-2 border-[#ccff00] p-3 space-y-1 shadow-[2px_2px_0px_#a855f7]">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#ccff00] uppercase font-bold">
                <Key className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>VAULT_LEVEL</span>
              </div>
              <div className="font-serif text-2xl font-black text-white uppercase">TIER II</div>
            </div>
          </div>

          {/* New Interests Revealed (Screen a3450d4b) */}
          <div className="bg-[#141414] border-2 border-[#262626] p-3 space-y-2">
            <span className="font-mono text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
              NEW_INTERESTS_REVEALED
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['CRYPTANALYSIS', 'INDUSTRIAL TECHNO', 'URBAN EXPLORATION', 'AI ALIGNMENT'].map(tag => (
                <span
                  key={tag}
                  className="bg-[#1b1724] border border-[#a855f7] text-[#ddb7ff] font-mono text-[10px] font-bold px-2 py-0.5 uppercase"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Shared Intellectual Friction (Screen 6e342009) */}
          <div className="bg-[#141414] border-2 border-[#262626] p-3 space-y-1.5">
            <span className="font-mono text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
              // SHARED INTELLECTUAL FRICTION
            </span>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
              <div className="bg-[#0e0e0e] border border-[#ccff00] p-2 text-[#ccff00] font-bold">
                Contrarian Systems
              </div>
              <div className="bg-[#0e0e0e] border border-[#333] p-2 text-gray-300">
                Stealth Whistleblowing
              </div>
            </div>
          </div>

          {/* Comm Channel Status */}
          <div className="bg-[#101010] border border-[#333] p-3 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-gray-400 text-[10px] uppercase block">COMM_CHANNEL</span>
              <span className="text-white font-bold">SECURE_CHAT_OPEN</span>
            </div>
            <Unlock className="w-4 h-4 text-[#ccff00]" />
          </div>

        </div>

        {/* Bottom Floating CTA Button */}
        <div className="p-3.5 border-t-2 border-[#262626] bg-[#0c0c0c]">
          <BrutalistButton
            variant="primary"
            size="lg"
            onClick={() => {
              if (onContinueChat) onContinueChat();
              onClose();
            }}
            className="w-full justify-center text-sm font-black shadow-[4px_4px_0px_#a855f7] flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            INITIATE_CONTACT (RETURN TO CHAT)
          </BrutalistButton>
        </div>

      </div>
    </div>
  );
};
