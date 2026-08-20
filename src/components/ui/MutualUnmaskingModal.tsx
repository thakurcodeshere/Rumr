import React, { useState } from 'react';
import { X, Lock, Unlock, Shield, Sparkles, Check, ArrowRight, UserCheck, Eye, Zap, MapPin, Briefcase, Award } from 'lucide-react';
import { BrutalistButton } from './BrutalistButton';
import { BrutalistBadge } from './BrutalistBadge';
import confetti from 'canvas-confetti';

interface MutualUnmaskingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFullReveal: () => void;
  partner?: {
    handle: string;
    realName?: string;
    realPhoto?: string;
    city?: string;
    role?: string;
    tagline?: string;
    chaosIndex?: number;
  };
  currentStage: number;
  onAdvanceStage: () => void;
}

export const MutualUnmaskingModal: React.FC<MutualUnmaskingModalProps> = ({
  isOpen,
  onClose,
  onFullReveal,
  partner = {
    handle: 'cipher_vanguard',
    realName: 'Elena Rostova',
    realPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    city: 'San Francisco, CA',
    role: 'Staff ML Infrastructure Engineer',
    tagline: 'Contrarian systems architect • AI safety cynic',
    chaosIndex: 91
  },
  currentStage,
  onAdvanceStage
}) => {
  const [activeStep, setActiveStep] = useState<number>(currentStage || 1);
  const [myConsent, setMyConsent] = useState<{ [key: number]: boolean }>({
    1: currentStage >= 1,
    2: currentStage >= 2,
    3: currentStage >= 3
  });

  if (!isOpen) return null;

  const handleGrantConsent = (step: number) => {
    setMyConsent(prev => ({ ...prev, [step]: true }));
    onAdvanceStage();

    if (step === 3) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ccff00', '#a855f7', '#ffffff']
      });
      setTimeout(() => {
        onClose();
        onFullReveal();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in select-none">
      <div className="bg-[#0e0e0e] border-4 border-[#2a2a2a] w-full max-w-sm flex flex-col shadow-[10px_10px_0px_#a855f7] overflow-hidden text-left relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b-2 border-[#262626] bg-[#0a0a0a]">
          <div>
            <span className="font-serif font-black text-lg text-white block">
              MUTUAL IDENTITY UNMASKING
            </span>
            <span className="font-mono text-[9px] text-[#ccff00] uppercase font-bold tracking-widest">
              3-LAYER CRYPTOGRAPHIC CONSENT
            </span>
          </div>

          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Step Progress Bar Header */}
        <div className="bg-[#141414] p-3 border-b border-[#222] space-y-2">
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-gray-400">UNMASKING PROGRESS:</span>
            <span className="text-[#ccff00] font-black uppercase">
              LAYER {activeStep} OF 3
            </span>
          </div>

          {/* Stepper Dots / Bars */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(step => (
              <button
                key={step}
                onClick={() => setActiveStep(step)}
                className={`h-2 border transition-all ${
                  myConsent[step]
                    ? 'bg-[#ccff00] border-[#ccff00] shadow-[1px_1px_0px_#a855f7]'
                    : activeStep === step
                    ? 'bg-[#a855f7] border-[#a855f7]'
                    : 'bg-[#222] border-[#333]'
                }`}
              />
            ))}
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-1 pt-1 font-mono text-[9px] text-center">
            <span className={activeStep === 1 ? 'text-[#ccff00] font-bold' : 'text-gray-500'}>1. Signals</span>
            <span className={activeStep === 2 ? 'text-[#ccff00] font-bold' : 'text-gray-500'}>2. Persona</span>
            <span className={activeStep === 3 ? 'text-[#ccff00] font-bold' : 'text-gray-500'}>3. Decrypt</span>
          </div>
        </div>

        {/* Modal Body: Active Step View */}
        <div className="p-4 sm:p-5 space-y-4 flex-1">

          {/* ------------------------------------------------------------- */}
          {/* STEP 1: DEMOGRAPHIC SIGNALS (City & Role) */}
          {/* ------------------------------------------------------------- */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#ddb7ff] font-mono text-[10px] font-bold uppercase">
                  <Shield className="w-3.5 h-3.5" />
                  <span>LAYER 1 OF 3: DEMOGRAPHIC MASK</span>
                </div>
                <h3 className="font-serif text-xl font-black text-white">
                  Location & Professional Signals
                </h3>
                <p className="font-mono text-[11px] text-gray-400">
                  Reveals basic city and engineering discipline without revealing full identity or photos.
                </p>
              </div>

              {/* Reveal Box */}
              <div className="bg-[#141414] border-2 border-[#262626] p-3.5 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#222] pb-2">
                  <span className="text-gray-400">City / Location:</span>
                  {myConsent[1] ? (
                    <strong className="text-white flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#ccff00]" /> {partner.city}
                    </strong>
                  ) : (
                    <span className="text-[#a855f7] font-bold">🔒 ENCRYPTED HASH</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Role / Domain:</span>
                  {myConsent[1] ? (
                    <strong className="text-white flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-[#ccff00]" /> {partner.role}
                    </strong>
                  ) : (
                    <span className="text-[#a855f7] font-bold">🔒 ENCRYPTED HASH</span>
                  )}
                </div>
              </div>

              {/* Action */}
              {!myConsent[1] ? (
                <BrutalistButton
                  variant="primary"
                  size="md"
                  onClick={() => handleGrantConsent(1)}
                  className="w-full justify-center text-xs font-black"
                >
                  <Unlock className="w-3.5 h-3.5 text-black" />
                  CONSENT & UNLOCK LAYER 1
                </BrutalistButton>
              ) : (
                <div className="space-y-2">
                  <div className="bg-[#131d0e] border border-[#ccff00] p-2 text-center text-[#ccff00] font-mono text-[11px] font-bold">
                    ✓ LAYER 1 MUTUALLY UNLOCKED
                  </div>
                  <BrutalistButton
                    variant="purple"
                    size="md"
                    onClick={() => setActiveStep(2)}
                    className="w-full justify-center text-xs font-black flex items-center gap-1"
                  >
                    CONTINUE TO LAYER 2 <ArrowRight className="w-3.5 h-3.5" />
                  </BrutalistButton>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: CHAOS PERSONA & PHILOSOPHY (Tagline & Chaos Index) */}
          {/* ------------------------------------------------------------- */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#ccff00] font-mono text-[10px] font-bold uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>LAYER 2 OF 3: RESONANCE & BIO</span>
                </div>
                <h3 className="font-serif text-xl font-black text-white">
                  Tagline & Chaos Metrics
                </h3>
                <p className="font-mono text-[11px] text-gray-400">
                  Reveals partner's worldview statement and mutual intellectual friction score.
                </p>
              </div>

              {/* Reveal Box */}
              <div className="bg-[#141414] border-2 border-[#262626] p-3.5 space-y-2.5 font-mono text-xs">
                <div className="space-y-1 border-b border-[#222] pb-2">
                  <span className="text-gray-400 block text-[10px] uppercase">Tagline & Bio:</span>
                  {myConsent[2] ? (
                    <blockquote className="font-serif italic text-white text-sm bg-[#0e0e0e] p-2 border-l-2 border-[#ccff00]">
                      "{partner.tagline}"
                    </blockquote>
                  ) : (
                    <div className="text-[#a855f7] font-bold py-1">🔒 LOCKED PERSONA BIO</div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Chaos Score Resonance:</span>
                  {myConsent[2] ? (
                    <strong className="text-[#ccff00] font-bold text-sm">
                      {partner.chaosIndex}% ALIGNMENT
                    </strong>
                  ) : (
                    <span className="text-[#a855f7] font-bold">🔒 LOCKED</span>
                  )}
                </div>
              </div>

              {/* Action */}
              {!myConsent[2] ? (
                <BrutalistButton
                  variant="primary"
                  size="md"
                  onClick={() => handleGrantConsent(2)}
                  className="w-full justify-center text-xs font-black"
                >
                  <Unlock className="w-3.5 h-3.5 text-black" />
                  CONSENT & UNLOCK LAYER 2
                </BrutalistButton>
              ) : (
                <div className="space-y-2">
                  <div className="bg-[#131d0e] border border-[#ccff00] p-2 text-center text-[#ccff00] font-mono text-[11px] font-bold">
                    ✓ LAYER 2 MUTUALLY UNLOCKED
                  </div>
                  <BrutalistButton
                    variant="purple"
                    size="md"
                    onClick={() => setActiveStep(3)}
                    className="w-full justify-center text-xs font-black flex items-center gap-1"
                  >
                    CONTINUE TO FINAL UNMASKING <ArrowRight className="w-3.5 h-3.5" />
                  </BrutalistButton>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3: FULL BIOMETRIC & IDENTITY UNMASKING */}
          {/* ------------------------------------------------------------- */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#ccff00] font-mono text-[10px] font-bold uppercase">
                  <Zap className="w-3.5 h-3.5 fill-[#ccff00]" />
                  <span>LAYER 3 OF 3: FINAL UNMASKING</span>
                </div>
                <h3 className="font-serif text-xl font-black text-white">
                  Full Decryption & Verified Profile
                </h3>
                <p className="font-mono text-[11px] text-gray-400">
                  Suspends the anonymity protocol and renders verified photo, full name, and Tier II communication channels.
                </p>
              </div>

              {/* Preview Box */}
              <div className="bg-[#141414] border-2 border-[#ccff00] p-4 text-center space-y-2 shadow-[4px_4px_0px_#a855f7]">
                <div className="w-12 h-12 mx-auto bg-[#1b1526] border border-[#a855f7] flex items-center justify-center text-[#ccff00]">
                  <Award className="w-6 h-6" />
                </div>
                <div className="font-serif font-black text-lg text-white">
                  THEY SHARED MORE
                </div>
                <p className="font-mono text-[10px] text-gray-400">
                  Both participants have authorized Layer 3 unmasking.
                </p>
              </div>

              <BrutalistButton
                variant="primary"
                size="lg"
                onClick={() => handleGrantConsent(3)}
                className="w-full justify-center text-xs font-black shadow-[4px_4px_0px_#a855f7] flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-black text-black" />
                REVEAL DECRYPTED IDENTITY ⚡
              </BrutalistButton>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
