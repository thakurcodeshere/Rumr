import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/store';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { 
  Shield, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Compass, 
  Check, 
  Mail, 
  Eye, 
  Globe, 
  KeyRound, 
  ShieldCheck, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const { completeOnboarding, continueAsGuest, userLocation, updateUserLocation } = useApp();
  
  // Pipeline State Machine:
  // 1. 'splash' (1.5s auto duration)
  // 2. 'getting_started' (Entry screen with Sign Up / Sign In buttons)
  // 3. 'email_input' (Gmail / Email input with 1-tap Google/Gmail & Guest options)
  // 4. 'email_verify' (6-digit verification code sent to email)
  // 5. 'account_done' (DONE: Account creation complete & verified checkpoint)
  // 6. 'basics' (Age, Gender, Intent)
  // 7. 'topic_select' (Pick 5+ topics)
  // 8. 'custom_topic' (3-word creator + AI guardrail)
  // 9. 'preview' (Topic profile card preview)
  // 10. 'live_location' (Live browser GPS location permission & city mesh lock)
  // 11. -> Feed (Topic cards discovery)
  const [step, setStep] = useState<
    | 'splash'
    | 'getting_started'
    | 'email_input'
    | 'email_verify'
    | 'account_done'
    | 'basics'
    | 'topic_select'
    | 'custom_topic'
    | 'preview'
    | 'live_location'
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

  // Auth & Email states
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('alex.cipher@gmail.com');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otp, setOtp] = useState(['4', '8', '2', '9', '1', '0']);
  const [resendTimer, setResendTimer] = useState(38);

  // Profile basics states
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<string>('Non-binary');
  const [intent, setIntent] = useState<string>('Conversations & Dating');
  
  // Topic selection states
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

  // Live Location states
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'granted' | 'denied'>('idle');
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeCity, setActiveCity] = useState<string>(userLocation.city || 'Gurgaon, NCR');
  const [showManualCityPicker, setShowManualCityPicker] = useState(false);

  const popularCities = [
    { name: 'Gurgaon, NCR', country: 'IN', label: 'Tech & Startup Hub' },
    { name: 'Bengaluru, KA', country: 'IN', label: 'Engineering Capital' },
    { name: 'Mumbai, MH', country: 'IN', label: 'Media & Entertainment' },
    { name: 'Delhi NCR', country: 'IN', label: 'National Capital Mesh' },
    { name: 'London, UK', country: 'GB', label: 'Financial & Media Nodes' },
    { name: 'San Francisco, CA', country: 'US', label: 'AI & Venture Capital' }
  ];

  const handleEmailSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEmailError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }
    setEmailError(null);
    setResendTimer(38);
    setStep('email_verify');
  };

  const handleQuickGmailLogin = () => {
    setEmail('alex.cipher@gmail.com');
    setEmailError(null);
    setStep('email_verify');
  };

  const handleVerifyOtp = () => {
    // Step 4 verification code submitted:
    // "after having verification code from email, we are done with account creation."
    setStep('account_done');
  };

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
    setStep('topic_select');
  };

  // Browser Geolocation API Trigger
  const handleRequestLiveLocation = () => {
    setIsRequestingLocation(true);
    setLocationStatus('detecting');

    if (!navigator.geolocation) {
      setIsRequestingLocation(false);
      setLocationStatus('denied');
      setShowManualCityPicker(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsRequestingLocation(false);
        setLocationStatus('granted');
        const { latitude, longitude } = pos.coords;
        setDetectedCoords({ lat: latitude, lng: longitude });

        // Approximate city based on coordinates
        let resolvedCity = 'Gurgaon, NCR';
        if (longitude > -125 && longitude < -115) {
          resolvedCity = 'San Francisco, CA';
        } else if (longitude > -5 && longitude < 5) {
          resolvedCity = 'London, UK';
        } else if (longitude > 72 && longitude < 74) {
          resolvedCity = 'Mumbai, MH';
        } else if (longitude > 77 && longitude < 78) {
          resolvedCity = latitude > 20 ? 'Delhi NCR' : 'Bengaluru, KA';
        }

        setActiveCity(resolvedCity);
        localStorage.setItem('rumr_location_permission', 'granted');
        localStorage.setItem('rumr_user_city', resolvedCity);
      },
      () => {
        setIsRequestingLocation(false);
        setLocationStatus('denied');
        setShowManualCityPicker(true);
        localStorage.setItem('rumr_location_permission', 'denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleFinishOnboarding = () => {
    const coordsToSave = detectedCoords || { lat: 28.4595, lng: 77.0266 };
    updateUserLocation(activeCity, coordsToSave);
    completeOnboarding('anonymous_ghost_42', email, {
      city: activeCity,
      coords: coordsToSave
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 justify-between min-h-[620px] bg-[#0c0c0c] select-none text-left">
      
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
            <span className="font-mono text-[11px] text-gray-400 block uppercase">
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
      {/* 2. SCREEN 02 — GETTING STARTED SCREEN (SCR-002) with SIGN UP & SIGN IN */}
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
              Find people who want to talk about the same things you do. Identity is defined by conversations and verified email anchors, not curated photos.
            </p>
          </div>

          {/* Action Buttons: Sign Up & Sign In */}
          <div className="space-y-3 pt-2">
            <BrutalistButton
              variant="primary"
              size="lg"
              onClick={() => {
                setAuthMode('signup');
                setStep('email_input');
              }}
              className="w-full justify-center text-base font-black shadow-[4px_4px_0px_#a855f7]"
            >
              SIGN UP (CREATE ACCOUNT) <ArrowRight className="w-4 h-4 ml-1" />
            </BrutalistButton>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setStep('email_input');
              }}
              className="w-full py-3 bg-[#181818] border-2 border-[#333] hover:border-white text-white font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#ccff00]" />
              Already have an account? Sign In
            </button>

            <button
              type="button"
              onClick={() => continueAsGuest()}
              className="w-full py-2.5 bg-[#121212] hover:bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#222] font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Continue As Guest (Preview Mode)
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SCREEN 03 — EMAIL / GMAIL INPUT SCREEN (SCR-003) */}
      {/* ========================================================================= */}
      {step === 'email_input' && (
        <div className="space-y-5 my-auto animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-[#ccff00]" />
              <BrutalistBadge variant="lime">
                STEP 2 // {authMode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
              </BrutalistBadge>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
              {authMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="font-mono text-xs text-gray-400 mt-1">
              Authenticate via Gmail or email address. Zero phone numbers required.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3 bg-[#141414] border-2 border-[#ccff00] p-4 shadow-[4px_4px_0px_#a855f7]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#ccff00] uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> ZERO-PII EMAIL AUTH
              </span>
              <span className="font-mono text-[10px] text-gray-500 uppercase">NO PHONE NEEDED</span>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-xs text-gray-300">Enter Gmail / Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2.5 font-mono text-sm text-white outline-none pl-9"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
              {emailError && (
                <div className="font-mono text-[11px] text-red-400 mt-1">{emailError}</div>
              )}
            </div>

            <BrutalistButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center text-xs font-black shadow-[2px_2px_0px_#a855f7]"
            >
              CONTINUE WITH EMAIL <ArrowRight className="w-4 h-4 ml-1" />
            </BrutalistButton>

            {/* Google / Gmail 1-Tap Option */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#333]" />
              <span className="flex-shrink mx-2 font-mono text-[10px] text-gray-500 uppercase">OR INSTANT GMAIL</span>
              <div className="flex-grow border-t border-[#333]" />
            </div>

            <button
              type="button"
              onClick={handleQuickGmailLogin}
              className="w-full py-2.5 bg-[#1b1726] hover:bg-[#231e33] border-2 border-[#a855f7] text-[#ddb7ff] font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_#a855f7]"
            >
              <Zap className="w-3.5 h-3.5 text-[#ccff00]" />
              Continue with Google / Gmail
            </button>

            <p className="font-mono text-[10px] text-gray-500 text-center leading-relaxed">
              We send a 6-digit verification code to your email. Your address is salted with SHA-256 and never shared.
            </p>
          </form>

          {/* Guest Option */}
          <div className="bg-[#121212] border border-[#222] p-3 text-center">
            <button
              type="button"
              onClick={() => continueAsGuest()}
              className="font-mono text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Want to browse first? Continue as Guest
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SCREEN 04 — 6-DIGIT EMAIL VERIFICATION CODE (SCR-004) */}
      {/* ========================================================================= */}
      {step === 'email_verify' && (
        <div className="space-y-6 my-auto animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-4 h-4 text-[#ccff00]" />
              <BrutalistBadge variant="lime">STEP 3 // VERIFY CODE</BrutalistBadge>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
              Enter 6-Digit Code
            </h2>
            <p className="font-mono text-xs text-gray-400 mt-1">
              Sent to <span className="text-[#ccff00] font-bold">{email}</span>
            </p>
          </div>

          {/* 6 Digit PIN Boxes */}
          <div className="flex justify-between gap-1.5 sm:gap-2">
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
                className="w-11 sm:w-12 h-14 bg-[#141414] border-2 border-[#333] focus:border-[#ccff00] text-center font-mono text-xl font-black text-[#ccff00] outline-none shadow-[2px_2px_0px_#a855f7]"
              />
            ))}
          </div>

          <div className="flex items-center justify-between font-mono text-xs text-gray-400">
            <span>Resend code in <strong className="text-white">0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong></span>
            <button 
              type="button" 
              onClick={() => setStep('email_input')} 
              className="text-[#a855f7] hover:underline font-bold"
            >
              Change Email
            </button>
          </div>

          <BrutalistButton
            variant="primary"
            size="lg"
            onClick={handleVerifyOtp}
            className="w-full justify-center font-black text-sm shadow-[4px_4px_0px_#a855f7]"
          >
            VERIFY CODE & FINISH ACCOUNT CREATION <ArrowRight className="w-4 h-4 ml-1" />
          </BrutalistButton>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SCREEN 05 — DONE: ACCOUNT CREATED CHECKPOINT (SCR-005) */}
      {/* ========================================================================= */}
      {step === 'account_done' && (
        <div className="space-y-6 my-auto animate-in fade-in">
          <div className="space-y-2">
            <BrutalistBadge variant="lime">STEP 4 // ACCOUNT CREATED</BrutalistBadge>
            <h2 className="font-serif text-3xl font-black text-white">
              Account Creation Complete!
            </h2>
            <p className="font-mono text-xs text-gray-400">
              Your email is verified and cryptographic identity secured.
            </p>
          </div>

          {/* Verification Badge Confirmation Card */}
          <div className="bg-[#141414] border-2 border-[#ccff00] p-5 space-y-3 shadow-[6px_6px_0px_#a855f7]">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#ccff00]" />
                <span className="font-mono text-xs font-bold text-white uppercase">STATUS: VERIFIED</span>
              </div>
              <span className="font-mono text-[10px] bg-[#222] text-[#ccff00] px-2 py-0.5 border border-[#333]">
                100% PHONE-FREE
              </span>
            </div>

            <div className="space-y-1 font-mono text-xs text-gray-300">
              <div>Authenticated Email: <strong className="text-white">{email}</strong></div>
              <div>Anonymous Hash ID: <strong className="text-[#ddb7ff]">anon_mesh_9482</strong></div>
              <div>Protection: <strong className="text-[#ccff00]">Zero-Knowledge DPDP Compliant</strong></div>
            </div>

            <div className="bg-[#0a0a0a] p-2.5 border border-[#222] text-[11px] font-mono text-gray-400">
              ✓ Account created and registered. Proceeding to calibrate discovery profile and live location mesh.
            </div>
          </div>

          <BrutalistButton
            variant="primary"
            size="lg"
            onClick={() => setStep('basics')}
            className="w-full justify-center font-black text-sm shadow-[4px_4px_0px_#a855f7]"
          >
            CALIBRATE DISCOVERY PROFILE <ArrowRight className="w-4 h-4 ml-1" />
          </BrutalistButton>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SCREEN 06 — PROFILE BASICS (SCR-006) */}
      {/* ========================================================================= */}
      {step === 'basics' && (
        <div className="space-y-5 my-auto animate-in fade-in">
          <div>
            <BrutalistBadge variant="purple">STEP 5 // BASICS</BrutalistBadge>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white mt-1">
              About You
            </h2>
            <p className="font-mono text-xs text-gray-400">
              Only non-PII matching anchors (No photos or bios required).
            </p>
          </div>

          <div className="space-y-4 bg-[#141414] border-2 border-[#262626] p-4">
            {/* Age Slider */}
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

            {/* Gender Identity */}
            <div className="space-y-1">
              <label className="font-mono text-xs text-gray-300">Gender Identity</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {['Woman', 'Man', 'Non-binary', 'Fluid'].map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGender(item)}
                    className={`font-mono text-[11px] p-2 border text-center font-bold transition-all ${
                      gender === item 
                        ? 'bg-[#ccff00] text-black border-[#ccff00]' 
                        : 'bg-[#181818] text-gray-400 border-[#333]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Intent */}
            <div className="space-y-1">
              <label className="font-mono text-xs text-gray-300">What are you looking for?</label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['Conversations & Dating', 'Friendship', 'Startup & Tech Debates', 'Open to Everything'].map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setIntent(item)}
                    className={`font-mono text-[11px] p-2 border text-left font-bold transition-all ${
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
          <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
            {availableTopics.map(topic => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
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
              type="button"
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
              className="w-full justify-center disabled:opacity-30 font-bold"
            >
              CONTINUE TO CARD PREVIEW <ArrowRight className="w-4 h-4 ml-1" />
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
      {/* 9. SCREEN 09 — TOPIC PROFILE CARD PREVIEW (SCR-009) */}
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
              <span className="font-mono text-xs text-gray-400">{activeCity} • {age}</span>
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
            onClick={() => setStep('live_location')}
            className="w-full justify-center text-sm font-black shadow-[4px_4px_0px_#a855f7]"
          >
            PROCEED TO LIVE LOCATION LOCK <ArrowRight className="w-4 h-4 ml-1" />
          </BrutalistButton>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. SCREEN 10 — LIVE LOCATION PERMISSION & MESH LOCK (SCR-010) */}
      {/* ========================================================================= */}
      {step === 'live_location' && (
        <div className="space-y-5 my-auto animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-[#ccff00]" />
              <BrutalistBadge variant="lime">STEP 9 // LIVE LOCATION LOCK</BrutalistBadge>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
              Enable Live Topic Radar
            </h2>
            <p className="font-mono text-xs text-gray-400 mt-1">
              Connect with whispers, debates, and audio stages in your immediate city.
            </p>
          </div>

          {/* Location Request Card */}
          <div className="bg-[#141414] border-2 border-[#ccff00] p-4 sm:p-5 space-y-4 shadow-[6px_6px_0px_#a855f7]">
            
            {/* GPS Radar Animation */}
            <div className="flex items-center gap-3 bg-[#0a0a0a] p-3 border border-[#262626]">
              <div className="w-12 h-12 bg-[#1b1726] border-2 border-[#a855f7] flex items-center justify-center shrink-0 relative">
                <Compass className={`w-6 h-6 text-[#ccff00] ${isRequestingLocation ? 'animate-spin' : ''}`} />
                {locationStatus === 'granted' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ccff00] rounded-full animate-ping" />
                )}
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="font-mono text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <span>GPS RADAR STATUS</span>
                  {locationStatus === 'granted' && (
                    <span className="text-[10px] bg-[#222] text-[#ccff00] px-1 font-bold">LOCKED</span>
                  )}
                </div>
                <div className="font-mono text-xs text-[#ccff00] truncate">
                  {locationStatus === 'granted'
                    ? `📍 ${activeCity} (${detectedCoords ? `${detectedCoords.lat.toFixed(2)}° N, ${detectedCoords.lng.toFixed(2)}° E` : 'Mesh Anchored'})`
                    : locationStatus === 'detecting'
                    ? 'Acquiring browser coordinates...'
                    : 'Awaiting permission to lock city mesh'}
                </div>
              </div>
            </div>

            {/* Privacy Promise */}
            <div className="space-y-1 font-mono text-[11px] text-gray-400 bg-[#0c0c0c] p-3 border border-[#222]">
              <div className="text-gray-300 font-bold mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#ccff00]" /> DPDP Zero-Knowledge Guarantee:
              </div>
              <div>• Real coordinates are hashed into local regional cells.</div>
              <div>• Zero continuous GPS tracking or background telemetry.</div>
              <div>• Instant connection to nearby active topic rooms.</div>
            </div>

            {/* Actions */}
            {!showManualCityPicker ? (
              <div className="space-y-2">
                <BrutalistButton
                  variant="primary"
                  size="md"
                  onClick={handleRequestLiveLocation}
                  disabled={isRequestingLocation || locationStatus === 'granted'}
                  className="w-full justify-center text-xs font-black shadow-[2px_2px_0px_#a855f7] flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  {locationStatus === 'granted'
                    ? '✓ LIVE LOCATION ACCESS GRANTED'
                    : isRequestingLocation
                    ? 'REQUESTING BROWSER ACCESS...'
                    : '📍 ALLOW BROWSER LOCATION ACCESS'}
                </BrutalistButton>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualCityPicker(true)}
                    className="bg-[#181818] border-2 border-[#333] hover:border-[#ccff00] text-gray-300 py-2 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#ccff00]" /> SELECT CITY
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCity('Gurgaon, NCR');
                      setLocationStatus('granted');
                    }}
                    className="bg-[#181818] border-2 border-[#333] hover:border-white text-gray-400 hover:text-white py-2 font-mono text-xs font-bold uppercase transition-all"
                  >
                    DEFAULT (NCR)
                  </button>
                </div>
              </div>
            ) : (
              /* Manual City Selector */
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="text-gray-300 font-bold uppercase">SELECT CITY MESH:</span>
                  <button 
                    type="button"
                    onClick={() => setShowManualCityPicker(false)}
                    className="text-[#ccff00] text-[10px] hover:underline"
                  >
                    ← Back
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {popularCities.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setActiveCity(c.name);
                        setLocationStatus('granted');
                        setShowManualCityPicker(false);
                      }}
                      className={`p-2 border text-left font-mono text-xs transition-all ${
                        activeCity === c.name 
                          ? 'bg-[#1b2414] border-[#ccff00] text-white' 
                          : 'bg-[#181818] border-[#333] text-gray-400 hover:border-white'
                      }`}
                    >
                      <strong className="text-white block">{c.name}</strong>
                      <span className="text-[9px] text-gray-500">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Complete Button: Launches into Topic Cards Discovery */}
          <BrutalistButton
            variant="primary"
            size="lg"
            onClick={handleFinishOnboarding}
            className="w-full justify-center text-sm font-black shadow-[4px_4px_0px_#a855f7]"
          >
            LOCK LOCATION & START DISCOVERING <ArrowRight className="w-4 h-4 ml-1" />
          </BrutalistButton>
        </div>
      )}

      {/* Footer Navigation Back if not on Splash */}
      {step !== 'splash' && step !== 'getting_started' && (
        <div className="pt-2 border-t border-[#222] flex justify-between items-center font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              if (step === 'email_input') setStep('getting_started');
              else if (step === 'email_verify') setStep('email_input');
              else if (step === 'account_done') setStep('email_verify');
              else if (step === 'basics') setStep('account_done');
              else if (step === 'topic_select') setStep('basics');
              else if (step === 'custom_topic') setStep('topic_select');
              else if (step === 'preview') setStep('topic_select');
              else if (step === 'live_location') setStep('preview');
            }}
            className="text-gray-400 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-gray-500">Rumr Topic Radar Funnel</span>
        </div>
      )}
    </div>
  );
};

export default OnboardingView;
