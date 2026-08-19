import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { Shield, Sparkles, ArrowRight, CheckCircle2, Lock, EyeOff } from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const { completeOnboarding, navigate } = useApp();
  const [step, setStep] = useState<'welcome' | 'phone' | 'otp' | 'persona'>('welcome');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [otp, setOtp] = useState(['4', '8', '2', '9', '1', '0']);
  const [handle, setHandle] = useState('quantum_anomaly');
  const [avatarSeed, setAvatarSeed] = useState('rogue_1');

  const avatarSeeds = ['rogue_1', 'cipher_x', 'void_zen', 'neon_core', 'shadow_dev'];

  return (
    <div className="flex-1 flex flex-col p-6 justify-between min-h-[600px] bg-[#0e0e0e]">
      {/* Top Banner */}
      <div className="flex justify-between items-center border-b border-[#262626] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#ccff00] text-black font-serif font-black text-xs flex items-center justify-center">R</div>
          <span className="font-serif font-black text-sm text-white">RUMR ONBOARDING</span>
        </div>
        <BrutalistBadge variant="purple">STAGE: {step.toUpperCase()}</BrutalistBadge>
      </div>

      {/* Step 1: Welcome & Philosophy */}
      {step === 'welcome' && (
        <div className="my-auto py-6 space-y-6">
          <div className="space-y-2">
            <BrutalistBadge variant="lime">PHILOSOPHY // TOPIC &gt; PERSON</BrutalistBadge>
            <h1 className="font-serif text-4xl font-black text-white leading-none">
              Welcome to the Clean Chaos.
            </h1>
            <p className="text-sm font-sans text-gray-400 leading-relaxed pt-2">
              Forget curated bios and superficial swipes. Connect through intellectual friction, encrypted debate nodes, and anonymous whispers.
            </p>
          </div>

          <div className="space-y-3 bg-[#161616] p-4 border border-[#262626]">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-300">
                <strong className="text-white">Zero Identity Leaks:</strong> You start 100% anonymous.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-300">
                <strong className="text-white">Topic-First Matching:</strong> AI pairs you with your sharpest contrarians.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <EyeOff className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-300">
                <strong className="text-white">Mutual Unmasking:</strong> Only reveal identities when both agree.
              </div>
            </div>
          </div>

          <BrutalistButton fullWidth size="lg" onClick={() => setStep('phone')}>
            Enter the Network <ArrowRight className="w-4 h-4" />
          </BrutalistButton>
        </div>
      )}

      {/* Step 2: Phone Verification */}
      {step === 'phone' && (
        <div className="my-auto py-6 space-y-6">
          <div className="space-y-2">
            <BrutalistBadge variant="purple">STEP 01 // PROOF OF HUMANITY</BrutalistBadge>
            <h2 className="font-serif text-3xl font-black text-white">
              Verify Your Access Key.
            </h2>
            <p className="text-xs font-mono text-gray-400">
              Phone numbers are SHA-256 hashed and discarded. We never store raw credentials.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-[#ccff00] font-bold">MOBILE TERMINAL NUMBER</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#161616] border-2 border-[#333] focus:border-[#ccff00] px-4 py-3 font-mono text-white text-base outline-none rounded-none"
            />
          </div>

          <BrutalistButton fullWidth size="lg" onClick={() => setStep('otp')}>
            Request Cryptographic OTP
          </BrutalistButton>
        </div>
      )}

      {/* Step 3: OTP Verification */}
      {step === 'otp' && (
        <div className="my-auto py-6 space-y-6">
          <div className="space-y-2">
            <BrutalistBadge variant="lime">STEP 02 // 6-DIGIT CHALLENGE</BrutalistBadge>
            <h2 className="font-serif text-3xl font-black text-white">
              Confirm Security Node.
            </h2>
            <p className="text-xs font-mono text-gray-400">
              Sent 6-digit challenge code to <span className="text-white">{phone}</span>
            </p>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => {
                  const val = e.target.value;
                  setOtp(prev => {
                    const next = [...prev];
                    next[i] = val;
                    return next;
                  });
                }}
                className="w-full h-12 bg-[#161616] border-2 border-[#ccff00] text-center font-mono font-bold text-xl text-white outline-none"
              />
            ))}
          </div>

          <BrutalistButton fullWidth size="lg" onClick={() => setStep('persona')}>
            Verify & Unlock Persona <CheckCircle2 className="w-4 h-4 text-black" />
          </BrutalistButton>
        </div>
      )}

      {/* Step 4: Persona Setup */}
      {step === 'persona' && (
        <div className="my-auto py-6 space-y-6">
          <div className="space-y-2">
            <BrutalistBadge variant="purple">STEP 03 // ANONYMOUS MASK</BrutalistBadge>
            <h2 className="font-serif text-3xl font-black text-white">
              Claim Your Ghost Handle.
            </h2>
            <p className="text-xs font-mono text-gray-400">
              This pseudonymous mask represents you across all debate nodes until mutual unmasking.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-[#ccff00] font-bold">PSEUDONYM HANDLE</label>
            <input
              type="text"
              value={handle}
              onChange={e => setHandle(e.target.value)}
              className="w-full bg-[#161616] border-2 border-[#ccff00] px-4 py-3 font-mono text-white text-base outline-none rounded-none"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-gray-400 font-bold">SELECT CIPHER AVATAR GLYPH</label>
            <div className="flex gap-2">
              {avatarSeeds.map(seed => (
                <button
                  key={seed}
                  onClick={() => setAvatarSeed(seed)}
                  className={`w-12 h-12 border-2 ${avatarSeed === seed ? 'border-[#ccff00] bg-[#ccff00]/20' : 'border-[#333] bg-[#1a1a1a]'} flex items-center justify-center font-mono text-xs font-bold`}
                >
                  {seed.slice(0, 2).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <BrutalistButton fullWidth size="lg" onClick={() => completeOnboarding(handle)}>
            Launch Rumr Discovery
          </BrutalistButton>
        </div>
      )}

      <div className="text-center font-mono text-[10px] text-gray-600 border-t border-[#222] pt-3">
        RUMR SECURITY PROTOCOL v2.6 // AES-GCM 256
      </div>
    </div>
  );
};
