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
  Globe, 
  KeyRound, 
  ShieldCheck, 
  Zap, 
  AlertTriangle,
  User,
  Lock,
  Calendar,
  Phone,
  MapPin
} from 'lucide-react';

import { api } from '../lib/api';

export const OnboardingView: React.FC = () => {
  const { completeOnboarding, userLocation, updateUserLocation, user, purchaseBoost } = useApp();
  
  // Pipeline State Machine:
  // 1. 'splash' (1.5s auto duration)
  // 2. 'getting_started' (Entry screen with Create An Account / Already Have An Account)
  // 3. 'email_input' (Gmail / Email input)
  // 4. 'email_verify' (6-digit verification code sent to email)
  // 5. 'profile_details' (Name, locked Gmail, Age via Calendar/YMD, Optional Phone)
  // 6. 'account_done' (DONE: Account creation complete & verified checkpoint)
  // 7. 'basics' (Gender, Intent)
  // 8. 'topic_select' (Pick 5+ topics)
  // 9. 'custom_topic' (3-word creator + AI guardrail)
  // 10. 'preview' (Topic profile card preview)
  // 11. 'live_location' (Live browser GPS location permission & city mesh lock)
  // 12. -> Feed (Topic cards discovery)
  const [step, setStep] = useState<
    | 'splash'
    | 'getting_started'
    | 'email_input'
    | 'email_verify'
    | 'profile_details'
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
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);

  // Profile Details states (Step 4: Name, Locked Gmail, Age via Calendar/YMD, Optional Phone)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Calendar / Date of Birth states (for age calculation)
  const currentYear = new Date().getFullYear();
  const [birthYear, setBirthYear] = useState<number>(currentYear - 26);
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthDay, setBirthDay] = useState<number>(1);

  const monthsList = [
    { value: 1, name: '01 - Jan' },
    { value: 2, name: '02 - Feb' },
    { value: 3, name: '03 - Mar' },
    { value: 4, name: '04 - Apr' },
    { value: 5, name: '05 - May' },
    { value: 6, name: '06 - Jun' },
    { value: 7, name: '07 - Jul' },
    { value: 8, name: '08 - Aug' },
    { value: 9, name: '09 - Sep' },
    { value: 10, name: '10 - Oct' },
    { value: 11, name: '11 - Nov' },
    { value: 12, name: '12 - Dec' }
  ];

  const yearsList = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const calculateAgeFromDOB = (year: number, month: number, day: number) => {
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let calculated = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculated--;
    }
    return Math.max(0, calculated);
  };

  const handleDateChange = (dateStr: string) => {
    if (!dateStr) return;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        setBirthYear(y);
        setBirthMonth(m);
        setBirthDay(d);
        const calculatedAge = calculateAgeFromDOB(y, m, d);
        setAge(calculatedAge);
      }
    }
  };

  const handleYearChange = (y: number) => {
    setBirthYear(y);
    const maxDays = getDaysInMonth(y, birthMonth);
    const validDay = Math.min(birthDay, maxDays);
    if (validDay !== birthDay) setBirthDay(validDay);
    const calculatedAge = calculateAgeFromDOB(y, birthMonth, validDay);
    setAge(calculatedAge);
  };

  const handleMonthChange = (m: number) => {
    setBirthMonth(m);
    const maxDays = getDaysInMonth(birthYear, m);
    const validDay = Math.min(birthDay, maxDays);
    if (validDay !== birthDay) setBirthDay(validDay);
    const calculatedAge = calculateAgeFromDOB(birthYear, m, validDay);
    setAge(calculatedAge);
  };

  const handleDayChange = (d: number) => {
    setBirthDay(d);
    const calculatedAge = calculateAgeFromDOB(birthYear, birthMonth, d);
    setAge(calculatedAge);
  };

  const handleProfileDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setDetailsError('Please enter your First Name.');
      return;
    }
    if (!lastName.trim()) {
      setDetailsError('Please enter your Last Name.');
      return;
    }
    if (age < 18) {
      setDetailsError('You must be at least 18 years old to join Rumr.');
      return;
    }
    setDetailsError(null);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    try {
      if (api.getToken()) {
        await api.users.updateMe({
          realName: fullName,
          age: age
        });
      }
    } catch (err) {
      console.warn('Could not update profile details immediately:', err);
    }

    setStep('account_done');
  };

  // Profile basics states
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<string>('Non-binary');
  const [genderPreference, setGenderPreference] = useState<string>('Everyone');
  const [intent, setIntent] = useState<string>('Conversations & Dating');

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
    if (selectedGender === 'Man') {
      setGenderPreference('Women');
    } else if (selectedGender === 'Woman') {
      setGenderPreference('Men');
    } else {
      setGenderPreference('Everyone');
    }
  };
  
  // Topic selection states
  const DEFAULT_TOPICS = [
    'Office Politics', 'Ghosting', 'Startup Drama', 'Situationships',
    'Why People Ghost', 'First Date Disasters', 'Toxic Bosses', 'Bollywood Controversies',
    'Dating After 25', 'Unpopular Opinions', 'Salary Transparency', 'Metro Dating'
  ];
  const [createdTopics, setCreatedTopics] = useState<string[]>([]);
  const [hasUnlockedTopicPass, setHasUnlockedTopicPass] = useState<boolean>(false);
  const [showTopicPaywall, setShowTopicPaywall] = useState<boolean>(false);
  const [topicLimitWarning, setTopicLimitWarning] = useState<string | null>(null);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Office Politics', 'Ghosting', 'Startup Drama', 'Situationships', 'Why People Ghost'
  ]);

  const allAvailableTopics = [
    ...createdTopics,
    ...DEFAULT_TOPICS.filter(t => !createdTopics.includes(t))
  ];

  // Custom 3-word topic state (starts blank for clean user input)
  const [customTopicInput, setCustomTopicInput] = useState('');
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

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEmailError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }
    setEmailError(null);
    try {
      const res = await api.auth.sendOtp(cleanEmail);
      if (res && res.previewCode) {
        setSandboxCode(res.previewCode);
        setOtp(res.previewCode.split(''));
      } else {
        setSandboxCode(null);
        setOtp(['', '', '', '', '', '']);
      }
      setResendTimer(60);
      setStep('email_verify');
    } catch (err: any) {
      setEmailError(err.message || 'Failed to dispatch code');
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    try {
      await api.auth.verifyOtp(email, code);
      setStep('profile_details');
    } catch (err: any) {
      setEmailError(err.message || 'Invalid or expired verification code.');
    }
  };

  const toggleTopic = (t: string) => {
    if (selectedTopics.includes(t)) {
      setSelectedTopics(selectedTopics.filter(item => item !== t));
      setTopicLimitWarning(null);
    } else {
      if (selectedTopics.length >= 5) {
        setTopicLimitWarning('Maximum 5 topics reached. Please deselect a topic first to choose another.');
        return;
      }
      setTopicLimitWarning(null);
      setSelectedTopics([...selectedTopics, t]);
    }
  };

  const handleOpenCustomTopicCreator = () => {
    const isBoosted = user.boostTier || hasUnlockedTopicPass;
    if (createdTopics.length >= 2 && !isBoosted) {
      setShowTopicPaywall(true);
      return;
    }
    if (createdTopics.length >= 5) {
      setTopicLimitWarning('Maximum 5 custom topic cards created (mesh limit reached).');
      return;
    }
    setCustomTopicInput('');
    setAiWarning(null);
    setStep('custom_topic');
  };

  const handleCustomTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTopic = customTopicInput.trim();
    if (!cleanTopic) {
      setAiWarning('Please enter a topic title (1-3 words).');
      return;
    }

    const words = cleanTopic.split(/\s+/).filter(Boolean);
    if (words.length > 3) {
      setAiWarning('Hard constraint: Maximum 3 words allowed. Try: "Why People Ghost" or "Office Politics".');
      return;
    }

    const lower = cleanTopic.toLowerCase();
    if (lower.includes('rahul') || lower.includes('priya') || lower.includes('boss steals') || lower.includes('cheating on')) {
      setAiWarning('AI Policy Intercept: Personal accusations/targeting not permitted under DPDP Act & Safety Guardrails. Suggested: "Why People Cheat" or "Workplace Drama".');
      return;
    }

    const isBoosted = user.boostTier || hasUnlockedTopicPass;
    if (createdTopics.length >= 2 && !isBoosted) {
      setShowTopicPaywall(true);
      return;
    }

    setAiWarning(null);

    // 1. Add to createdTopics list if not already present
    if (!createdTopics.includes(cleanTopic)) {
      setCreatedTopics(prev => [cleanTopic, ...prev]);
    }

    // 2. Add to selectedTopics (ensuring max 5 topics total)
    if (!selectedTopics.includes(cleanTopic)) {
      if (selectedTopics.length < 5) {
        setSelectedTopics(prev => [cleanTopic, ...prev]);
      } else {
        // If 5 topics already selected, replace the 5th topic so total remains exactly 5!
        setSelectedTopics(prev => [cleanTopic, ...prev.slice(0, 4)]);
      }
    }

    setTopicLimitWarning(null);
    setCustomTopicInput('');
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
    if (typeof window !== 'undefined') {
      const prefMap: Record<string, string> = {
        'Men': 'men',
        'Women': 'women',
        'Everyone': 'everyone',
        'Non-binary': 'everyone'
      };
      localStorage.setItem('rumr_gender_preference', prefMap[genderPreference] || 'everyone');
    }
    completeOnboarding(
      'anonymous_ghost_42',
      email,
      { city: activeCity, coords: coordsToSave },
      selectedTopics,
      customTopicInput
    );
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

          {/* Action Buttons: Create An Account & Already Have An Account */}
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
              CREATE AN ACCOUNT <ArrowRight className="w-4 h-4 ml-1" />
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
              Already have an account
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
                STEP 2 // {authMode === 'signup' ? 'CREATE AN ACCOUNT' : 'ALREADY HAVE AN ACCOUNT'}
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


            <p className="font-mono text-[10px] text-gray-500 text-center leading-relaxed">
              We send a 6-digit verification code to your email. Your address is salted with SHA-256 and never shared.
            </p>
          </form>

          {/* Back Option */}
          <div className="bg-[#121212] border border-[#222] p-3 text-center">
            <button
              type="button"
              onClick={() => {
                setStep('getting_started');
                setEmailError(null);
              }}
              className="font-mono text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Back
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

          {/* Sandbox Verification Protocol Banner for Unverified Resend Domains */}
          {sandboxCode && (
            <div className="bg-[#181818] border-2 border-[#ccff00] p-3 space-y-2 shadow-[4px_4px_0px_#a855f7] animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#ccff00] font-bold uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> SANDBOX VERIFICATION PROTOCOL
                </span>
                <span className="font-mono text-[9px] text-gray-400 uppercase">UNVERIFIED DOMAIN MODE</span>
              </div>
              <div className="flex items-center justify-between bg-black p-2 border border-[#333]">
                <span className="font-mono text-xs text-gray-300">
                  Verification Code: <strong className="text-[#ccff00] tracking-widest text-sm">{sandboxCode}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setOtp(sandboxCode.split(''))}
                  className="px-2.5 py-1 bg-[#ccff00] text-black font-mono text-[10px] font-bold uppercase hover:bg-white transition-colors"
                >
                  Auto-Fill
                </button>
              </div>
              <p className="font-mono text-[9px] text-gray-500 leading-tight">
                Direct inbox delivery requires DNS domain verification at resend.com. Code is generated and pre-filled for instant verification.
              </p>
            </div>
          )}

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
            VERIFY CODE & CONTINUE <ArrowRight className="w-4 h-4 ml-1" />
          </BrutalistButton>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SCREEN 04 — USER PROFILE DETAILS (SCR-004B) */}
      {/* ========================================================================= */}
      {step === 'profile_details' && (
        <div className="space-y-4 my-auto animate-in fade-in py-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-[#ccff00]" />
              <BrutalistBadge variant="lime">STEP 4 // PROFILE DETAILS</BrutalistBadge>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
              Complete Your Profile
            </h2>
            <p className="font-mono text-xs text-gray-400 mt-1">
              Set your identity anchor. Verified email cannot be edited.
            </p>
          </div>

          <form onSubmit={handleProfileDetailsSubmit} className="space-y-3 bg-[#141414] border-2 border-[#ccff00] p-4 shadow-[4px_4px_0px_#a855f7]">
            {/* 1. Name: First Name + Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-xs text-gray-300 block">
                  First Name <span className="text-[#ccff00]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => {
                      setFirstName(e.target.value);
                      setDetailsError(null);
                    }}
                    placeholder="First Name"
                    className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2 font-mono text-sm text-white outline-none pl-8"
                  />
                  <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-xs text-gray-300 block">
                  Last Name <span className="text-[#ccff00]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => {
                      setLastName(e.target.value);
                      setDetailsError(null);
                    }}
                    placeholder="Last Name"
                    className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2 font-mono text-sm text-white outline-none pl-8"
                  />
                  <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>

            {/* 2. Registered Gmail / Email (Already filled, cannot be edited) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-gray-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#ccff00]" /> Registered Gmail / Email
                </label>
                <span className="font-mono text-[10px] text-gray-400 bg-[#1c1c1c] border border-[#333] px-1.5 py-0.5 uppercase flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-[#ccff00]" /> Can't be edited
                </span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  disabled
                  value={email}
                  className="w-full bg-[#070707] border-2 border-[#262626] text-gray-400 px-3 py-2 font-mono text-sm outline-none cursor-not-allowed pl-8 select-none"
                />
                <Lock className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-3" />
              </div>
              <span className="font-mono text-[10px] text-gray-500">
                Verified anchor from OTP session. Locked to this account.
              </span>
            </div>

            {/* 3. Filling Age: Calendar Date Picker & Year/Month/Day Selectors */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#ccff00]" /> Date of Birth & Age
                </label>
                <span className="font-mono text-[11px] text-[#ccff00] uppercase font-bold">
                  {age >= 18 ? `Age: ${age} Years` : 'Age: Under 18'}
                </span>
              </div>

              {/* Native Calendar Picker */}
              <div className="relative">
                <input
                  type="date"
                  value={`${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`}
                  max={`${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
                  min="1920-01-01"
                  onChange={e => handleDateChange(e.target.value)}
                  className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2 font-mono text-sm text-white outline-none pl-8 [color-scheme:dark]"
                />
                <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3 pointer-events-none" />
              </div>

              {/* Year, Month, Day Dropdowns */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-mono text-[10px] text-gray-400 block mb-0.5">Day</label>
                  <select
                    value={birthDay}
                    onChange={e => handleDayChange(parseInt(e.target.value, 10))}
                    className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-2 py-1.5 font-mono text-xs text-white outline-none"
                  >
                    {Array.from({ length: getDaysInMonth(birthYear, birthMonth) }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>
                        {d < 10 ? `0${d}` : d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-gray-400 block mb-0.5">Month</label>
                  <select
                    value={birthMonth}
                    onChange={e => handleMonthChange(parseInt(e.target.value, 10))}
                    className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-2 py-1.5 font-mono text-xs text-white outline-none"
                  >
                    {monthsList.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-gray-400 block mb-0.5">Year</label>
                  <select
                    value={birthYear}
                    onChange={e => handleYearChange(parseInt(e.target.value, 10))}
                    className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-2 py-1.5 font-mono text-xs text-white outline-none"
                  >
                    {yearsList.map(y => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calculated Age Feedback */}
              <div className="flex items-center justify-between p-2 bg-[#090909] border border-[#222] font-mono text-xs">
                <span className="text-gray-400">
                  Calculated: <strong className="text-white">{age} years old</strong>
                </span>
                {age >= 18 ? (
                  <span className="text-[#ccff00] text-[10px] font-bold">
                    ✓ 18+ REQUIREMENT MET
                  </span>
                ) : (
                  <span className="text-red-400 text-[10px] font-bold">
                    ⚠️ MUST BE AT LEAST 18
                  </span>
                )}
              </div>
            </div>

            {/* 4. Phone Number (Optional) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-gray-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#ccff00]" /> Phone Number
                </label>
                <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">OPTIONAL</span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210 (Optional)"
                  className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2 font-mono text-sm text-white outline-none pl-8"
                />
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
              </div>
              <span className="font-mono text-[10px] text-gray-500">
                Optional recovery channel. You can leave this blank.
              </span>
            </div>

            {detailsError && (
              <div className="font-mono text-xs text-red-400 p-2 bg-red-950/40 border border-red-800">
                {detailsError}
              </div>
            )}

            <BrutalistButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center text-xs font-black shadow-[2px_2px_0px_#a855f7]"
            >
              SAVE DETAILS & CREATE ACCOUNT <ArrowRight className="w-4 h-4 ml-1" />
            </BrutalistButton>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SCREEN 05 — DONE: ACCOUNT CREATED CHECKPOINT (SCR-005) */}
      {/* ========================================================================= */}
      {step === 'account_done' && (
        <div className="space-y-6 my-auto animate-in fade-in">
          <div className="space-y-2">
            <BrutalistBadge variant="lime">STEP 5 // ACCOUNT CREATED</BrutalistBadge>
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
                {phoneNumber.trim() ? 'SECURED ANCHOR' : '100% PHONE-FREE'}
              </span>
            </div>

            <div className="space-y-1 font-mono text-xs text-gray-300">
              {firstName && (
                <div>Name: <strong className="text-white">{firstName} {lastName}</strong></div>
              )}
              <div>Authenticated Email: <strong className="text-white">{email}</strong></div>
              <div>Age: <strong className="text-[#ccff00]">{age} Years</strong></div>
              {phoneNumber.trim() && (
                <div>Phone: <strong className="text-gray-300">{phoneNumber}</strong></div>
              )}
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
            <BrutalistBadge variant="purple">STEP 6 // BASICS</BrutalistBadge>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white mt-1">
              About You
            </h2>
            <p className="font-mono text-xs text-gray-400">
              Only non-PII matching anchors (No photos or bios required).
            </p>
          </div>

          <div className="space-y-4 bg-[#141414] border-2 border-[#262626] p-4 shadow-[4px_4px_0px_#a855f7]">
            {/* Gender Identity & Gender Preference Side-by-Side (Opposite) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender Identity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-gray-300 font-bold uppercase">
                    Gender Identity
                  </label>
                  <span className="font-mono text-[10px] text-[#ccff00] uppercase font-bold">
                    I am: {gender}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {['Woman', 'Man', 'Non-binary', 'Fluid'].map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleGenderSelect(item)}
                      className={`font-mono text-[11px] p-2.5 border text-center font-bold transition-all ${
                        gender === item 
                          ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[2px_2px_0px_#a855f7]' 
                          : 'bg-[#181818] text-gray-400 border-[#333] hover:border-gray-400 hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Preference (Opposite Column Beside Gender Identity) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-gray-300 font-bold uppercase">
                    Gender Preference
                  </label>
                  <span className="font-mono text-[10px] text-[#a855f7] uppercase font-bold">
                    Seeking: {genderPreference}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {['Men', 'Women', 'Everyone', 'Non-binary'].map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setGenderPreference(item)}
                      className={`font-mono text-[11px] p-2.5 border text-center font-bold transition-all ${
                        genderPreference === item 
                          ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-[2px_2px_0px_#ccff00]' 
                          : 'bg-[#181818] text-gray-400 border-[#333] hover:border-gray-400 hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Intent */}
            <div className="space-y-1 pt-2 border-t border-[#222]">
              <label className="font-mono text-xs text-gray-300 font-bold uppercase">
                What are you looking for?
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['Conversations & Dating', 'Friendship', 'Startup & Tech Debates', 'Open to Everything'].map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setIntent(item)}
                    className={`font-mono text-[11px] p-2.5 border text-left font-bold transition-all ${
                      intent === item 
                        ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[2px_2px_0px_#a855f7]' 
                        : 'bg-[#181818] text-gray-400 border-[#333] hover:border-gray-400 hover:text-white'
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
            className="w-full justify-center font-bold shadow-[4px_4px_0px_#a855f7]"
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
              <BrutalistBadge variant="lime">STEP 7 // TOPICS</BrutalistBadge>
              <span className={`font-mono text-xs font-bold ${selectedTopics.length === 5 ? 'text-[#ccff00]' : 'text-gray-300'}`}>
                {selectedTopics.length} / 5 Selected {selectedTopics.length === 5 ? '(Max Limit)' : ''}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-black text-white mt-1">
              What's Your Kind of Chaos?
            </h2>
            <p className="font-mono text-xs text-gray-400">
              Choose up to 5 topics (including mentioned options or your created topics).
            </p>
          </div>

          {/* Topic limit warning banner */}
          {topicLimitWarning && (
            <div className="bg-[#241712] border-2 border-[#ff9900] p-2.5 text-xs text-yellow-200 font-mono flex items-center justify-between animate-in fade-in">
              <span>⚠️ {topicLimitWarning}</span>
              <button 
                type="button" 
                onClick={() => setTopicLimitWarning(null)}
                className="text-white hover:text-[#ff9900] ml-2 font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Topics Chip Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
            {allAvailableTopics.map(topic => {
              const isSelected = selectedTopics.includes(topic);
              const isCustom = createdTopics.includes(topic);
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
                  <div className="flex items-center gap-1.5 truncate mr-1">
                    <span className="truncate">#{topic}</span>
                    {isCustom && (
                      <span className="font-mono text-[9px] bg-[#a855f7] text-white px-1 py-0.5 border border-[#c084fc] font-bold uppercase shrink-0">
                        CREATED
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#ccff00] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleOpenCustomTopicCreator}
              className="w-full py-2.5 bg-[#181818] border border-dashed border-[#a855f7] hover:border-[#ccff00] text-[#ddb7ff] hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>+ Create Your Own Topic (Max 3 Words)</span>
              <span className="text-[10px] bg-[#24172e] border border-[#a855f7] px-1.5 py-0.5 text-[#ccff00] font-bold">
                {createdTopics.length >= 2 && !hasUnlockedTopicPass && !user.boostTier
                  ? '2/2 FREE USED • PRO FOR 3-5'
                  : `${createdTopics.length}/2 FREE`}
              </span>
            </button>

            <BrutalistButton
              variant="primary"
              size="lg"
              disabled={selectedTopics.length === 0 || selectedTopics.length > 5}
              onClick={() => setStep('preview')}
              className="w-full justify-center disabled:opacity-30 font-bold"
            >
              CONTINUE TO CARD PREVIEW ({selectedTopics.length}/5) <ArrowRight className="w-4 h-4 ml-1" />
            </BrutalistButton>
          </div>

          {/* Custom Topic 3-5 Paywall Modal */}
          {showTopicPaywall && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#141414] border-2 border-[#ccff00] p-5 max-w-sm w-full space-y-4 shadow-[6px_6px_0px_#a855f7]">
                <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#ccff00]" />
                    <span className="font-mono text-xs font-bold text-white uppercase">TOPIC CREATOR PASS</span>
                  </div>
                  <span className="font-mono text-[10px] bg-[#a855f7] text-white px-1.5 py-0.5 font-bold">
                    PRO FEATURE
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-white">
                    Create 3 to 5 Custom Topics
                  </h3>
                  <p className="font-mono text-xs text-gray-300 leading-relaxed">
                    Free tier includes up to <strong className="text-[#ccff00]">2 custom topics</strong> (already used: {createdTopics.length}/2). Creating 3 to 5 custom topic cards requires the Topic Creator Pass.
                  </p>
                </div>

                <div className="bg-[#0a0a0a] p-3 border border-[#262626] space-y-1.5 font-mono text-xs text-gray-400">
                  <div className="flex justify-between text-white font-bold pb-1 border-b border-[#222]">
                    <span>Creator Pass</span>
                    <span className="text-[#ccff00] text-sm">₹199 / $4.99</span>
                  </div>
                  <div className="text-[11px] flex items-center gap-1.5 text-gray-300 pt-1">
                    ✓ Unlock up to 5 custom topic cards
                  </div>
                  <div className="text-[11px] flex items-center gap-1.5 text-gray-300">
                    ✓ Pinned in regional debate radar
                  </div>
                  <div className="text-[11px] flex items-center gap-1.5 text-gray-300">
                    ✓ Priority bilateral matching
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <BrutalistButton
                    variant="primary"
                    size="md"
                    className="w-full justify-center text-xs font-black"
                    onClick={async () => {
                      try {
                        await purchaseBoost('Topic Pulse');
                      } catch (err) {
                        console.warn('Boost charge simulation:', err);
                      }
                      setHasUnlockedTopicPass(true);
                      setShowTopicPaywall(false);
                      setCustomTopicInput('');
                      setStep('custom_topic');
                    }}
                  >
                    <Zap className="w-3.5 h-3.5" /> UNLOCK 3–5 TOPICS PASS ($4.99)
                  </BrutalistButton>

                  <button
                    type="button"
                    onClick={() => setShowTopicPaywall(false)}
                    className="w-full py-2 bg-[#181818] border border-[#333] hover:border-white text-gray-400 hover:text-white font-mono text-xs transition-colors"
                  >
                    Keep 2 Free Topics (Cancel)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SCREEN 08 — CUSTOM 3-WORD TOPIC CREATOR & AI GUARD (SCR-008) */}
      {/* ========================================================================= */}
      {step === 'custom_topic' && (
        <div className="space-y-5 my-auto animate-in fade-in">
          <div>
            <div className="flex items-center justify-between">
              <BrutalistBadge variant="purple">STEP 8 // CUSTOM TOPIC</BrutalistBadge>
              <span className="font-mono text-xs text-[#ccff00] font-bold">
                {hasUnlockedTopicPass || user.boostTier
                  ? `Topic ${createdTopics.length + 1} / 5 (Pro Pass)`
                  : `Topic ${createdTopics.length + 1} / 2 (Free Tier)`}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-black text-white mt-1">
              Create Your Own Topic
            </h2>
            <p className="font-mono text-xs text-gray-400">
              Hard constraint: Maximum 3 words. Added directly to your topic selection.
            </p>
          </div>

          <form onSubmit={handleCustomTopicSubmit} className="space-y-4 bg-[#141414] border-2 border-[#333] p-4 shadow-[4px_4px_0px_#a855f7]">
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-300">Topic Title (Max 3 Words)</span>
                <span className="text-[#a855f7] font-bold">
                  {customTopicInput.trim().split(/\s+/).filter(Boolean).length} / 3 words
                </span>
              </div>
              <input
                type="text"
                autoFocus
                value={customTopicInput}
                onChange={e => {
                  setCustomTopicInput(e.target.value);
                  setAiWarning(null);
                }}
                placeholder="e.g. AI Ethics Debate"
                className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2.5 font-mono text-sm text-white outline-none"
              />
              <span className="font-mono text-[10px] text-gray-500 block">
                Up to 2 custom topics free. Charge applies for creating 3 to 5 custom topics.
              </span>
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
                Back to Topics
              </button>
              <BrutalistButton
                type="submit"
                variant="primary"
                size="md"
                className="flex-1 justify-center"
              >
                ADD TOPIC <ArrowRight className="w-4 h-4 ml-1" />
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
            <BrutalistBadge variant="lime">STEP 9 // PROFILE READY</BrutalistBadge>
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
            LOCATION PERMISSION <ArrowRight className="w-4 h-4 ml-1" />
          </BrutalistButton>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. SCREEN 10 — LOCATION PERMISSION (MINIMAL TINDER-STYLE) */}
      {/* ========================================================================= */}
      {step === 'live_location' && (
        <div className="space-y-6 my-auto animate-in fade-in max-w-sm mx-auto text-center py-4">
          {/* Minimal Central MapPin with subtle pulse ring */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full border border-[#ccff00]/20 ${locationStatus === 'detecting' || isRequestingLocation ? 'animate-ping' : ''}`} />
            <div className="w-20 h-20 bg-[#161616] border-2 border-[#ccff00] rounded-full flex items-center justify-center shadow-[4px_4px_0px_#a855f7]">
              {locationStatus === 'granted' ? (
                <CheckCircle2 className="w-9 h-9 text-[#ccff00]" />
              ) : (
                <MapPin className={`w-9 h-9 text-[#ccff00] ${isRequestingLocation ? 'animate-bounce' : ''}`} />
              )}
            </div>
          </div>

          {/* Minimal Headline & 1-line Subtitle */}
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-black text-white">
              Location Permission
            </h2>
            <p className="font-mono text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
              We need your location to show people and active topics near you.
            </p>
          </div>

          {/* Minimal Permission Action / Status */}
          {!showManualCityPicker ? (
            <div className="space-y-3 pt-2">
              {locationStatus === 'granted' ? (
                <div className="inline-flex items-center gap-2 bg-[#141414] border border-[#ccff00] px-4 py-2 font-mono text-xs text-white">
                  <span className="text-[#ccff00] font-bold">📍 {activeCity}</span>
                  <button
                    type="button"
                    onClick={() => setShowManualCityPicker(true)}
                    className="text-gray-400 hover:text-white underline text-[10px] ml-1"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <BrutalistButton
                    variant="primary"
                    size="md"
                    onClick={handleRequestLiveLocation}
                    disabled={isRequestingLocation}
                    className="w-full justify-center text-xs font-black shadow-[2px_2px_0px_#a855f7]"
                  >
                    {isRequestingLocation ? 'REQUESTING ACCESS...' : 'ALLOW LOCATION'}
                  </BrutalistButton>

                  <button
                    type="button"
                    onClick={() => setShowManualCityPicker(true)}
                    className="text-gray-400 hover:text-white font-mono text-xs transition-colors py-1 block mx-auto underline"
                  >
                    Select city manually
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Manual City Picker */
            <div className="space-y-2 bg-[#141414] border-2 border-[#333] p-3 text-left animate-in fade-in">
              <div className="flex justify-between items-center font-mono text-xs border-b border-[#262626] pb-2">
                <span className="text-white font-bold">SELECT CITY</span>
                <button
                  type="button"
                  onClick={() => setShowManualCityPicker(false)}
                  className="text-gray-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
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
                        ? 'bg-[#1b2414] border-[#ccff00] text-[#ccff00]'
                        : 'bg-[#0a0a0a] border-[#262626] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="block font-bold truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Button: Just "START DISCOVERING" */}
          <div className="pt-2">
            <BrutalistButton
              variant="primary"
              size="lg"
              onClick={handleFinishOnboarding}
              className="w-full justify-center text-sm font-black shadow-[4px_4px_0px_#a855f7]"
            >
              START DISCOVERING
            </BrutalistButton>
          </div>
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
              else if (step === 'profile_details') setStep('email_verify');
              else if (step === 'account_done') setStep('profile_details');
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
