import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/store';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Lock, 
  EyeOff, 
  MapPin, 
  Flame, 
  AlertTriangle,
  Layers,
  Compass,
  Check,
  User,
  UserCheck,
  UserX,
  Phone,
  MessageSquare,
  Radio,
  Eye
} from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const { completeOnboarding, continueAsGuest, navigate } = useApp();
  
  // Step state machine:
  // 1. 'splash' (1.5s auto)
  // 2. 'getting_started' (Register vs Login)
  // 3. 'how_it_works' (Combined What Rumr Is / How It Works)
  // 4. 'auth_choice' (Register with Number vs Continue as Guest)
  // 5. 'otp_verify' (6-digit code)
  // 6. 'basics' (Age, Gender, City, Intent)
  // 7. 'topic_select' (Pick 5+ topics)
  // 8. 'custom_topic' (3-word creator + AI guard)
  // 9. 'preview' (Ready -> Enter)
  const [step, setStep] = useState<
    'splash' | 'getting_started' | 'how_it_works' | 'auth_choice' | 'otp_verify' | 'basics' | 'topic_select' | 'custom_topic' | 'preview'
  >('splash');

  // Splash 1.5-second timer
  const [splashTimer, setSplashTimer] = useState(1.5);

  useEffect(() => {
    if (step === 'splash') {
      const interval = setInterval(() => {
        setSplashTimer(prev => {
          if (prev <= 0.2) {
            clearInterval(interval);
            setStep('getting_started');
            return 0;
          }
          return parseFloat((prev - 0.1).toFixed(1));
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [step]);

  // Form states
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState(['4', '8', '2', '9', '1', '0']);
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<string>('Non-binary');
  const [city, setCity] = useState<string>('Gurgaon');
  const [intent, setIntent] = useState<string>('Conversations & Dating');
  
  // Topic selection
  const availableTopics = [
    'Office Politics', 'Ghosting', 'Startup Drama', 'Situationships',
    'Why People Ghost', 'First Date Disasters', 'Toxic Bosses', 'Bollywood Controversies',
    'Dating After 25', 'Unpopular Opinions', 'Salary Transparency', 'Metro Dating'
  ];
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Office Politics', 'Ghosting', 'Startup Drama', 'Situationships', 'Why People Ghost'
  ]);

  // Custom 3-word topic state
  const [customTopicInput, setCustomTopicInput] = useState('Why People Ghost');
  const [aiWarning, setAiWarning] = useState<string | null>(null);

  const toggleTopic = (t: string) => {
    if (selectedTopics.includes(t)) {
      setSelectedTopics(selectedTopics.filter(item => item !== t));
    } else {
      setSelectedTopics([...selectedTopics, t]);
    }
  };

  const handleCustomTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const words = customTopicInput.trim().split(/\s+/);
    if (words.length > 3) {
      setAiWarning('Hard constraint: Maximum 3 words allowed. Try: "Why People Ghost" or "Office Politics".');
      return;
    }

    const lower = customTopicInput.toLowerCase();
    if (lower.includes('rahul') || lower.includes('priya') || lower.includes('boss steals') || lower.includes('cheating on')) {
      setAiWarning('AI Policy Intercept: Personal accusations/targeting not permitted under DPDP Act & Safety Guardrails. Suggested: "Why People Cheat" or "Workplace Drama".');
      return;
    }

    setAiWarning(null);
    if (!selectedTopics.includes(customTopicInput)) {
      setSelectedTopics([...selectedTopics, customTopicInput]);
    }
    setStep('preview');
  };

  return (
    <div className="flex-1 flex flex-col p-5 justify-between min-h-[620px] bg-[#0c0c0c] select-none">
      
      {/* ========================================================================= */}
      {/* 1. SCREEN 01 — SPLASH SCREEN (SCR-001) - 1.5s Auto Duration */}
      {/* ========================================================================= */}
      {step === 'splash' && (
        <div className="my-auto text-center space-y-6 animate-in fade-in duration-500">
          <div className="w-24 h-24 mx-auto bg-[#ccff00] text-black font-serif font-black text-6xl flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_#a855f7] animate-pulse">
            R
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-4xl font-black text-white tracking-tight">
              RUMR
            </h1>
            <p className="font-serif text-base italic text-[#ccff00] font-bold">
              "Your Topics. Your People."
            </p>
          </div>

          <div className="max-w-xs mx-auto bg-[#141414] border-2 border-[#262626] p-3 space-y-2">
            <span className="font-mono text-[11px] text-gray-400 block">
              TOPIC-FIRST SOCIAL DISCOVERY
            </span>
            <div className="w-full bg-[#222] h-1.5 overflow-hidden">
              <div 
                className="bg-[#ccff00] h-full transition-all duration-100" 
                style={{ width: `${((1.5 - splashTimer) / 1.5) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[9px] text-gray-500">
              Launching in {splashTimer}s...
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SCREEN 02 — GETTING STARTED PAGE (SCR-002) */}
      {/* ========================================================================= */}
      {step === 'getting_started' && (
        <div className="my-auto py-4 space-y-6 animate-in fade-in">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#ccff00] text-black font-serif font-black text-xl flex items-center justify-center border-2 border-black">
                R
              </div>
              <BrutalistBadge variant="lime">STEP 1 // ENTRY</BrutalistBadge>
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-white leading-tight">
              DON'T SWIPE ON PEOPLE.<br />
              <span className="text-[#ccff00]">SWIPE ON TOPICS.</span>
            </h2>

            <p className="font-sans text-sm text-gray-300 leading-relaxed bg-[#141414] p-3 border-l-2 border-[#a855f7]">
              Find people who want to talk about the same things you do. Identity is defined by conversations, not curated photos.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <BrutalistButton
              variant="primary"
              size="lg"
              onClick={() => setStep('how_it_works')}
              className="w-full justify-center text-base"
            >
              GET STARTED <ArrowRight className="w-4 h-4 ml-1" />
            </BrutalistButton>

            <button
              onClick={() => setStep('auth_choice')}
              className="w-full py-3 bg-[#181818] border-2 border-[#333] hover:border-white text-white font-mono text-xs font-bold uppercase transition-colors"
            >
              Already have an account? Log In
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SCREEN 03 — WHAT RUMR IS & HOW IT WORKS (COMBINED OVERVIEW) (SCR-003) */}
      {/* ========================================================================= */}
      {step === 'how_it_works' && (
        <div className="space-y-5 my-auto animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#ccff00]" />
              <BrutalistBadge variant="purple">WHAT IS RUMR // HOW IT WORKS</BrutalistBadge>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
              The Topic-First Social Model
            </h2>
          </div>

          {/* 3 Core Pillars */}
          <div className="space-y-3">
            <div className="bg-[#141414] border-2 border-[#262626] p-3.5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-[#ccff00] text-black font-bold px-1.5 py-0.5">01</span>
                <h4 className="font-serif font-bold text-base text-white">Your Topics Are Your Profile</h4>
              </div>
              <p className="font-sans text-xs text-gray-300 pl-6">
                Instead of a bio and selfie, other people see what you want to discuss: <em>Office Politics, Ghosting, Startup Drama</em>.
              </p>
            </div>

            <div className="bg-[#141414] border-2 border-[#262626] p-3.5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-[#a855f7] text-black font-bold px-1.5 py-0.5">02</span>
                <h4 className="font-serif font-bold text-base text-white">Match on Shared Intellectual Chaos</h4>
              </div>
              <p className="font-sans text-xs text-gray-300 pl-6">
                Swipe right on topics you love. When there is mutual interest, a conversation opens with AI topic starter prompts.
              </p>
            </div>

            <div className="bg-[#141414] border-2 border-[#262626] p-3.5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-[#ddb7ff] text-black font-bold px-1.5 py-0.5">03</span>
                <h4 className="font-serif font-bold text-base text-white">Progressive Mutual Unmasking</h4>
              </div>
              <p className="font-sans text-xs text-gray-300 pl-6">
                Remain completely anonymous. Real names and verified photos are only unlocked if both people mutually agree.
              </p>
            </div>
          </div>

          {/* Bottom Next Button */}
          <div className="pt-2">
            <BrutalistButton
              variant="primary"
              size="lg"
              onClick={() => setStep('auth_choice')}
              className="w-full justify-center text-sm font-bold"
            >
              NEXT (CHOOSE HOW TO ENTER) <ArrowRight className="w-4 h-4 ml-1" />
            </BrutalistButton>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SCREEN 04 — REGISTER ACCOUNT OR CONTINUE AS GUEST (SCR-004) */}
      {/* ========================================================================= */}
      {step === 'auth_choice' && (
        <div className="space-y-6 my-auto animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-[#ccff00]" />
              <BrutalistBadge variant="lime">STEP 3 // AUTHENTICATION</BrutalistBadge>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
              Create Your Account
            </h2>
            <p className="font-mono text-xs text-gray-400 mt-1">
              Verify your number or browse preview mode as a Guest.
            </p>
          </div>

          {/* Primary Path A: Phone Number Registration */}
          <div className="bg-[#161616] border-2 border-[#ccff00] p-4 space-y-3 shadow-[4px_4px_0px_#a855f7]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#ccff00] uppercase">
                RECOMMENDED // FULL ACCESS
              </span>
              <UserCheck className="w-4 h-4 text-[#ccff00]" />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-xs text-gray-300">Enter Phone Number (+91)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2.5 font-mono text-sm text-white outline-none"
              />
            </div>

            <BrutalistButton
              variant="primary"
              size="md"
              onClick={() => setStep('otp_verify')}
              className="w-full justify-center"
            >
              SEND 6-DIGIT OTP <ArrowRight className="w-4 h-4 ml-1" />
            </BrutalistButton>
            <p className="font-mono text-[10px] text-gray-500 text-center">
              Internal KYC verification. Your number is never shown publicly.
            </p>
          </div>

          {/* Path B: Continue as Guest with defined restrictions */}
          <div className="bg-[#121212] border-2 border-[#262626] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-gray-400 uppercase">
                OR CONTINUE AS GUEST
              </span>
              <UserX className="w-4 h-4 text-gray-500" />
            </div>

            <div className="space-y-1.5 font-mono text-[11px] text-gray-400 bg-[#0a0a0a] p-2.5 border border-[#222]">
              <div className="text-gray-300 font-bold mb-1">Guest Mode Restrictions:</div>
              <div>✓ Browse Discover Feed & Topics overview</div>
              <div>✕ <span className="text-[#ff5555]">Locked:</span> Cannot chat, match gossip, or join audio rooms</div>
              <div>✕ <span className="text-[#ff5555]">Locked:</span> Cannot click into topic detail materials</div>
            </div>

            <button
              onClick={() => continueAsGuest()}
              className="w-full py-2.5 bg-[#1a1a1a] hover:bg-[#222] text-[#ddb7ff] border border-[#a855f7] font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Continue As Guest (Preview Mode)
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SCREEN 05 — 6-DIGIT OTP VERIFICATION (SCR-005) */}
      {/* ========================================================================= */}
      {step === 'otp_verify' && (
        <div className="space-y-6 my-auto animate-in fade-in">
          <div>
            <BrutalistBadge variant="lime">STEP 4 // VERIFY OTP</BrutalistBadge>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white mt-1">
              Enter 6-Digit Code
            </h2>
            <p className="font-mono text-xs text-gray-400 mt-1">
              Sent to <span className="text-[#ccff00] font-bold">{phone}</span>
            </p>
          </div>

          {/* 6 Digit Input Boxes */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => {
                  const newOtp = [...otp];
                  newOtp[idx] = e.target.value;
                  setOtp(newOtp);
                }}
                className="w-12 h-14 bg-[#141414] border-2 border-[#333] focus:border-[#ccff00] text-center font-mono text-xl font-black text-[#ccff00] outline-none shadow-[2px_2px_0px_#a855f7]"
              />
            ))}
          </div>

          <div className="flex items-center justify-between font-mono text-xs text-gray-400">
            <span>Resend code in <strong className="text-white">0:38</strong></span>
            <button className="text-[#a855f7] hover:underline">Change Number</button>
          </div>

          <BrutalistButton
            variant="primary"
            size="lg"
            onClick={() => setStep('basics')}
            className="w-full justify-center font-bold"
          >
            VERIFY & CONTINUE <ArrowRight className="w-4 h-4 ml-1" />
          </BrutalistButton>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SCREEN 06 — PROFILE BASICS SETUP (SCR-006) */}
      {/* ========================================================================= */}
      {step === 'basics' && (
        <div className="space-y-5 my-auto animate-in fade-in">
          <div>
            <BrutalistBadge variant="purple">STEP 5 // BASICS</BrutalistBadge>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white mt-1">
              About You
            </h2>
            <p className="font-mono text-xs text-gray-400">
              Only non-PII matching anchors (No photos/bios required).
            </p>
          </div>

          <div className="space-y-4 bg-[#141414] border-2 border-[#262626] p-4">
            {/* Age */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-300">Your Age</span>
                <span className="font-bold text-[#ccff00] text-sm">{age} years</span>
              </div>
              <input
                type="range"
                min={18}
                max={50}
                value={age}
                onChange={e => setAge(parseInt(e.target.value))}
                className="w-full accent-[#ccff00] cursor-pointer"
              />
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="font-mono text-xs text-gray-300">City / Location</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] px-3 py-2 font-mono text-xs text-white outline-none"
              >
                <option value="Gurgaon">Gurgaon (Delhi NCR)</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            {/* Intent */}
            <div className="space-y-1">
              <label className="font-mono text-xs text-gray-300">What are you looking for?</label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['Dating', 'Friendship', 'Conversations & Dating', 'Open to Everything'].map(item => (
                  <button
                    key={item}
                    onClick={() => setIntent(item)}
                    className={`font-mono text-[11px] p-2 border text-left font-bold ${
                      intent === item 
                        ? 'bg-[#ccff00] text-black border-[#ccff00]' 
                        : 'bg-[#181818] text-gray-400 border-[#333]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <BrutalistButton
            variant="primary"
            size="lg"
            onClick={() => setStep('topic_select')}
            className="w-full justify-center font-bold"
          >
            NEXT: PICK TOPICS <ArrowRight className="w-4 h-4 ml-1" />
          </BrutalistButton>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SCREEN 07 — TOPIC SELECTION MATRIX (SCR-007) */}
      {/* ========================================================================= */}
      {step === 'topic_select' && (
        <div className="space-y-4 my-auto animate-in fade-in">
          <div>
            <div className="flex items-center justify-between">
              <BrutalistBadge variant="lime">STEP 6 // TOPICS</BrutalistBadge>
              <span className="font-mono text-xs text-[#ccff00] font-bold">
                {selectedTopics.length} / 5 Selected
              </span>
            </div>
            <h2 className="font-serif text-2xl font-black text-white mt-1">
              What's Your Kind of Chaos?
            </h2>
            <p className="font-mono text-xs text-gray-400">
              Pick at least 5 topics to construct your initial matching graph.
            </p>
          </div>

          {/* Topics Chip Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
            {availableTopics.map(topic => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`p-2.5 text-left border-2 font-mono text-xs font-bold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1b1724] border-[#ccff00] text-[#ccff00] shadow-[2px_2px_0px_#a855f7]'
                      : 'bg-[#121212] border-[#262626] text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="truncate">#{topic}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#ccff00]" />}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setStep('custom_topic')}
              className="w-full py-2 bg-[#181818] border border-dashed border-[#a855f7] text-[#ddb7ff] hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-1"
            >
              + Create Your Own Topic (Max 3 Words)
            </button>

            <BrutalistButton
              variant="primary"
              size="lg"
              disabled={selectedTopics.length < 5}
              onClick={() => setStep('preview')}
              className="w-full justify-center disabled:opacity-30"
            >
              CONTINUE TO PREVIEW <ArrowRight className="w-4 h-4 ml-1" />
            </BrutalistButton>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SCREEN 08 — CUSTOM 3-WORD TOPIC CREATOR & AI GUARD (SCR-008) */}
      {/* ========================================================================= */}
      {step === 'custom_topic' && (
        <div className="space-y-5 my-auto animate-in fade-in">
          <div>
            <BrutalistBadge variant="purple">STEP 7 // CUSTOM TOPIC</BrutalistBadge>
            <h2 className="font-serif text-2xl font-black text-white mt-1">
              Create Your Own Topic
            </h2>
            <p className="font-mono text-xs text-gray-400">
              Hard constraint: Maximum 3 words. Screened by AI anti-targeting shield.
            </p>
          </div>

          <form onSubmit={handleCustomTopicSubmit} className="space-y-4 bg-[#141414] border-2 border-[#333] p-4">
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-300">Topic Title</span>
                <span className="text-[#a855f7] font-bold">
                  {customTopicInput.trim().split(/\s+/).filter(Boolean).length} / 3 words
                </span>
              </div>
              <input
                type="text"
                value={customTopicInput}
                onChange={e => {
                  setCustomTopicInput(e.target.value);
                  setAiWarning(null);
                }}
                placeholder="e.g. Why People Ghost"
                className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2.5 font-mono text-sm text-white outline-none"
              />
            </div>

            {aiWarning && (
              <div className="bg-[#241114] border-2 border-[#ff4444] p-3 text-xs text-red-200 font-mono space-y-1">
                <div className="font-bold flex items-center gap-1 text-[#ff4444]">
                  <AlertTriangle className="w-4 h-4" /> AI Policy Guard
                </div>
                <div>{aiWarning}</div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('topic_select')}
                className="flex-1 py-2.5 bg-[#181818] border border-[#333] text-gray-300 font-mono text-xs font-bold"
              >
                Back
              </button>
              <BrutalistButton
                type="submit"
                variant="primary"
                size="md"
                className="flex-1 justify-center"
              >
                ADD TOPIC
              </BrutalistButton>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. SCREEN 09 — TOPIC PROFILE PREVIEW & REGISTRATION COMPLETE (SCR-009) */}
      {/* ========================================================================= */}
      {step === 'preview' && (
        <div className="space-y-5 my-auto animate-in fade-in">
          <div>
            <BrutalistBadge variant="lime">STEP 8 // PROFILE READY</BrutalistBadge>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white mt-1">
              Your Topic Profile is Ready
            </h2>
            <p className="font-mono text-xs text-gray-400">
              This is what others will see when you appear in their Discovery Deck.
            </p>
          </div>

          {/* Generated Discovery Card Mock */}
          <div className="bg-[#161616] border-4 border-[#262626] p-5 space-y-4 shadow-[4px_4px_0px_#a855f7]">
            <div className="flex justify-between items-center">
              <BrutalistBadge variant="lime">YOUR ANONYMOUS CARD</BrutalistBadge>
              <span className="font-mono text-xs text-gray-400">{city} • {age}</span>
            </div>

            <div className="border-y border-[#262626] py-3">
              <span className="font-mono text-[9px] text-gray-500 uppercase">Primary Topic</span>
              <h3 className="font-serif text-2xl font-black text-white">
                "{selectedTopics[0] || 'Office Politics'}"
              </h3>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-[10px] text-gray-400 uppercase font-bold">Your Active Topics:</span>
              <div className="flex flex-wrap gap-1">
                {selectedTopics.map((t, idx) => (
                  <span key={idx} className="font-mono text-[11px] bg-[#1a1726] border border-[#a855f7] text-[#ddb7ff] px-2 py-0.5">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <BrutalistButton
            variant="primary"
            size="lg"
            onClick={() => completeOnboarding('anonymous_ghost_42')}
            className="w-full justify-center text-sm font-black shadow-[4px_4px_0px_#a855f7]"
          >
            START DISCOVERING (COMPLETE REGISTRATION) <ArrowRight className="w-4 h-4 ml-1" />
          </BrutalistButton>
        </div>
      )}

      {/* Footer Navigation Back if not on Splash */}
      {step !== 'splash' && step !== 'getting_started' && (
        <div className="pt-2 border-t border-[#222] flex justify-between items-center font-mono text-xs">
          <button
            onClick={() => {
              if (step === 'how_it_works') setStep('getting_started');
              else if (step === 'auth_choice') setStep('how_it_works');
              else if (step === 'otp_verify') setStep('auth_choice');
              else if (step === 'basics') setStep('otp_verify');
              else if (step === 'topic_select') setStep('basics');
              else if (step === 'custom_topic') setStep('topic_select');
              else if (step === 'preview') setStep('topic_select');
            }}
            className="text-gray-400 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-gray-500">Rumr Onboarding Funnel</span>
        </div>
      )}
    </div>
  );
};
