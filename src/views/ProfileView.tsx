import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { 
  Shield, 
  Sparkles, 
  Flame, 
  Eye, 
  EyeOff, 
  Lock, 
  Activity, 
  RefreshCw, 
  Zap, 
  MapPin, 
  User, 
  CreditCard, 
  Globe, 
  Bell, 
  LogOut, 
  Plus, 
  X, 
  Check, 
  ChevronRight, 
  SlidersHorizontal,
  Settings,
  Brain
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, topics, navigate, resetToBeforeRegister } = useApp();

  // Tab state: 'chaos_profile' vs 'profile_settings'
  const [activeTab, setActiveTab] = useState<'chaos_profile' | 'profile_settings'>('chaos_profile');

  // Chaos Profile States
  const [activeRumors, setActiveRumors] = useState<string[]>([
    'CYBERNETICS', 'NEO_TOKYO_NIGHTS', 'ENCRYPTED_COMMS', 'OFFICE_POLITICS'
  ]);
  const [injectInput, setInjectInput] = useState('');
  const [geoBroadcasting, setGeoBroadcasting] = useState<'approximate' | 'precise'>('approximate');
  const [injectError, setInjectError] = useState<string | null>(null);

  // Profile Settings States
  const [ghostMode, setGhostMode] = useState<boolean>(true);
  const [globalRadius, setGlobalRadius] = useState<number>(50);
  const [showPersonalModal, setShowPersonalModal] = useState<boolean>(false);
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  const handleInjectTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!injectInput.trim()) return;
    const words = injectInput.trim().split(/\s+/);
    if (words.length > 3) {
      setInjectError('Constraint: Max 3 words allowed.');
      return;
    }
    const formatted = injectInput.trim().toUpperCase().replace(/\s+/g, '_');
    if (!activeRumors.includes(formatted)) {
      setActiveRumors([...activeRumors, formatted]);
    }
    setInjectInput('');
    setInjectError(null);
    setShowSuccessToast(`Injected #${formatted} into your resonance graph`);
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  const removeRumor = (rumor: string) => {
    setActiveRumors(activeRumors.filter(r => r !== rumor));
  };

  return (
    <div className="p-4 space-y-5 select-none">

      {/* Top Location & Dual Tab Switcher */}
      <div className="space-y-3 border-b-2 border-[#262626] pb-3">
        <div className="flex items-center justify-between font-mono text-xs text-gray-400">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <MapPin className="w-3.5 h-3.5 text-[#ccff00]" />
            <span className="tracking-widest uppercase font-serif">LONDON_UK / GURGAON_NCR</span>
          </div>
          <BrutalistBadge variant="lime">SYS_ACTIVE</BrutalistBadge>
        </div>

        {/* Dual Segment Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-[#0c0c0c] p-1 border-2 border-[#333]">
          <button
            onClick={() => setActiveTab('chaos_profile')}
            className={`py-2 px-3 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'chaos_profile'
                ? 'bg-[#ccff00] text-black shadow-[2px_2px_0px_#a855f7]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Chaos Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('profile_settings')}
            className={`py-2 px-3 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'profile_settings'
                ? 'bg-[#a855f7] text-black shadow-[2px_2px_0px_#ccff00]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="bg-[#1b1724] border-2 border-[#ccff00] p-2.5 text-xs font-mono text-[#ccff00] flex items-center justify-between animate-in fade-in">
          <span>✓ {showSuccessToast}</span>
          <button onClick={() => setShowSuccessToast(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VIEW KIND A: TOPIC / CHAOS PROFILE (Merged 9c8a0e15 & 1c6f13b3) */}
      {/* ========================================================================= */}
      {activeTab === 'chaos_profile' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Header Identity & Connections Matrix */}
          <div className="bg-[#141414] border-2 border-[#2a2a2a] p-5 space-y-4 shadow-[6px_6px_0px_#a855f7] relative">
            <div className="flex items-center justify-between">
              {/* Photo Frame with 26 Age Overlay */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-[#0a0a0a] border-2 border-white overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80" 
                      alt="Avatar" 
                      className="w-full h-full object-cover filter grayscale contrast-125"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-black border border-white px-1.5 py-0.5 font-serif font-black text-xs text-[#ccff00]">
                    26
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl font-black text-white">{user.handle}</h2>
                    <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                  </div>
                  <p className="font-mono text-[10px] text-[#a855f7] uppercase font-bold tracking-wider">
                    ID_AUTHORIZED // SYS_ACTIVE
                  </p>
                </div>
              </div>

              {/* Chaos Score */}
              <div className="text-right">
                <div className="font-serif text-3xl font-black text-[#ccff00] leading-none">
                  {user.chaosIndex}%
                </div>
                <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">CHAOS SCORE</span>
              </div>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#262626]">
              <div className="bg-[#0e0e0e] border border-[#222] p-3">
                <div className="font-serif text-3xl font-black text-white">1,402</div>
                <div className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Connections</div>
              </div>
              <div className="bg-[#0e0e0e] border border-[#222] p-3">
                <div className="font-serif text-3xl font-black text-white">8</div>
                <div className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Communities</div>
              </div>
            </div>
          </div>

          {/* Section: My Topics (Data_Index: 04) */}
          <div className="bg-[#141414] border-2 border-[#262626] p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#222] pb-2">
              <h3 className="font-serif text-lg font-black text-white uppercase tracking-wide">
                MY TOPICS
              </h3>
              <span className="font-mono text-[10px] bg-[#1a1726] border border-[#a855f7] text-[#ddb7ff] px-2 py-0.5 font-bold">
                DATA_INDEX: 04
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeRumors.map(rumor => (
                <div
                  key={rumor}
                  className="bg-[#1b1724] border-2 border-[#a855f7] text-[#ddb7ff] font-mono text-xs px-3 py-1.5 flex items-center gap-2 font-bold shadow-[2px_2px_0px_#222]"
                >
                  <span>#{rumor}</span>
                  <button onClick={() => removeRumor(rumor)} className="hover:text-[#ff4444] transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              
              <div className="bg-[#121212] border border-[#333] text-gray-500 font-mono text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>REDACTED</span>
              </div>
            </div>
          </div>

          {/* Section: Inject Your Own (Max 3 Words) */}
          <div className="bg-[#141414] border-2 border-[#333] p-4 space-y-3">
            <div>
              <span className="font-mono text-xs text-[#ccff00] font-bold uppercase tracking-wider block">
                INJECT YOUR OWN (MAX 3 WORDS)
              </span>
              <p className="font-mono text-[11px] text-gray-400 mt-0.5">
                SYS_MSG: Configure your thematic resonance graph.
              </p>
            </div>

            <form onSubmit={handleInjectTopic} className="space-y-2">
              <input
                type="text"
                value={injectInput}
                onChange={e => {
                  setInjectInput(e.target.value);
                  setInjectError(null);
                }}
                placeholder="E.G. DIGITAL_NOMAD_LIFE"
                className="w-full bg-[#0a0a0a] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2.5 font-mono text-sm text-white outline-none uppercase"
              />

              {injectError && (
                <p className="font-mono text-xs text-[#ff5555]">{injectError}</p>
              )}

              <BrutalistButton
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center text-xs font-black tracking-wider"
              >
                INJECT TOPIC ⚡
              </BrutalistButton>
            </form>
          </div>

          {/* Section: Geospatial Broadcasting */}
          <div className="bg-[#141414] border-2 border-[#262626] p-4 space-y-3">
            <span className="font-mono text-xs text-gray-300 font-bold uppercase tracking-wider block">
              GEOSPATIAL BROADCASTING
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGeoBroadcasting('approximate')}
                className={`py-2 px-3 font-mono text-xs font-bold uppercase border-2 transition-all ${
                  geoBroadcasting === 'approximate'
                    ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[2px_2px_0px_#a855f7]'
                    : 'bg-[#121212] text-gray-400 border-[#333] hover:text-white'
                }`}
              >
                APPROXIMATE LOCATION
              </button>

              <button
                onClick={() => setGeoBroadcasting('precise')}
                className={`py-2 px-3 font-mono text-xs font-bold uppercase border-2 transition-all ${
                  geoBroadcasting === 'precise'
                    ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[2px_2px_0px_#a855f7]'
                    : 'bg-[#121212] text-gray-400 border-[#333] hover:text-white'
                }`}
              >
                PRECISE CITY
              </button>
            </div>

            <p className="font-mono text-[10px] text-gray-500">
              * Approximate blurs geographic discovery radius to 50 km for enhanced DPDP privacy.
            </p>
          </div>

          {/* Section: Locked Topic Vault */}
          <div className="bg-[#0f0e13] border-2 border-[#a855f7]/40 p-6 text-center space-y-2">
            <div className="w-10 h-10 mx-auto bg-[#1a1726] border border-[#a855f7] flex items-center justify-center text-[#ccff00]">
              <Lock className="w-5 h-5" />
            </div>
            <div className="font-serif font-black text-white text-base">TOPIC LOCKED</div>
            <p className="font-mono text-[10px] text-gray-400 max-w-xs mx-auto">
              Unlock 5 additional topic slots through Rumr Pro or mutual Level 5 reveal milestones.
            </p>
            <button
              onClick={() => navigate('boost')}
              className="font-mono text-xs text-[#ccff00] hover:underline font-bold"
            >
              UPGRADE TO PRO TO UNLOCK +5 SLOTS ↗
            </button>
          </div>

          {/* Topic Affinity Matrix (From Existing Me Section) */}
          <BrutalistCard className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-base font-bold text-white">Topic Resonance Matrix</h3>
              <BrutalistBadge variant="purple">{topics.length} ACTIVE</BrutalistBadge>
            </div>

            <div className="space-y-2">
              {topics.map(topic => (
                <div key={topic.id} className="flex justify-between items-center p-2.5 bg-[#181818] border border-[#222]">
                  <div>
                    <span className="font-mono text-xs text-white font-bold">{topic.title}</span>
                    <span className="font-mono text-[10px] text-gray-500 block">{topic.category}</span>
                  </div>
                  <span className="font-mono text-xs text-[#ccff00] font-bold">{topic.matchRate}% Match</span>
                </div>
              ))}
            </div>
          </BrutalistCard>

          {/* Chaos Telemetry Logs */}
          <BrutalistCard className="space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#a855f7] font-bold">
              <Activity className="w-4 h-4" />
              <span>CHAOS NORMALIZATION TELEMETRY</span>
            </div>
            <div className="bg-[#0e0e0e] p-3 border border-[#2a2a2a] text-gray-400 space-y-1 text-[11px]">
              <div>[LOG 04:12] Seed Vector: Normal Distribution (μ=88.4, σ=3.2)</div>
              <div>[LOG 04:09] AI Distance Matrix computed against 142 peer nodes</div>
              <div>[LOG 03:55] SHA-256 phone hash rotated successfully</div>
              <div className="text-[#ccff00]">[STATUS] Zero unhashed telemetry detected.</div>
            </div>
          </BrutalistCard>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW KIND B: PROFILE SETTINGS & APP DATA CONTROL (Merged 1e83f25f) */}
      {/* ========================================================================= */}
      {activeTab === 'profile_settings' && (
        <div className="space-y-5 animate-in fade-in">

          {/* User Banner & Manage Identity */}
          <div className="bg-[#141414] border-2 border-[#333] p-5 space-y-4 shadow-[4px_4px_0px_#a855f7]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1a1a1a] rounded-full border-2 border-[#ccff00] p-0.5 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full filter grayscale"
                />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-black text-white">
                  USER_9482
                </h3>
                <span className="font-mono text-[11px] text-[#ccff00] font-bold uppercase tracking-wider">
                  STATUS: VERIFIED
                </span>
              </div>
            </div>

            <BrutalistButton
              variant="primary"
              size="md"
              onClick={() => setActiveTab('chaos_profile')}
              className="w-full justify-center font-black tracking-wider text-xs"
            >
              MANAGE IDENTITY ⚡
            </BrutalistButton>
          </div>

          {/* GROUP 1: ACCOUNT DYNAMICS */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-[#ddb7ff] font-bold uppercase tracking-wider block">
              ACCOUNT DYNAMICS
            </span>
            <div className="bg-[#141414] border-2 border-[#262626] divide-y divide-[#222]">
              <button
                onClick={() => setShowPersonalModal(true)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#181818] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-serif font-bold text-sm text-white">Personal Information</div>
                    <div className="font-mono text-[10px] text-gray-500">Phone (+91), Age (26), City</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>

              <button
                onClick={() => setShowTransactionModal(true)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#181818] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-serif font-bold text-sm text-white">Transaction History</div>
                    <div className="font-mono text-[10px] text-gray-500">Topic Boosts & Rumr Pro subscriptions</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* GROUP 2: DISCOVERY VECTORS */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-[#ddb7ff] font-bold uppercase tracking-wider block">
              DISCOVERY VECTORS
            </span>
            <div className="bg-[#141414] border-2 border-[#262626] divide-y divide-[#222]">
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="font-serif font-bold text-sm text-white">Global Radius</span>
                  </div>
                  <span className="font-mono text-xs text-[#ccff00] font-bold">{globalRadius} KM</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={150}
                  value={globalRadius}
                  onChange={e => setGlobalRadius(parseInt(e.target.value))}
                  className="w-full accent-[#ccff00] cursor-pointer"
                />
              </div>

              <button
                onClick={() => navigate('feed')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#181818] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  <span className="font-serif font-bold text-sm text-white">Content Filters</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* GROUP 3: ENCRYPTION & SAFETY */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-[#ddb7ff] font-bold uppercase tracking-wider block">
              ENCRYPTION & SAFETY
            </span>
            <div className="bg-[#141414] border-2 border-[#262626] divide-y divide-[#222]">
              {/* Ghost Mode Toggle */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {ghostMode ? <EyeOff className="w-4 h-4 text-[#ccff00]" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  <div>
                    <div className="font-serif font-bold text-sm text-white">Ghost Mode</div>
                    <div className="font-mono text-[10px] text-gray-500">Hide online status across active topics</div>
                  </div>
                </div>

                <button
                  onClick={() => setGhostMode(!ghostMode)}
                  className={`w-12 h-6 border p-0.5 transition-colors flex items-center ${
                    ghostMode ? 'bg-[#ccff00] border-[#ccff00] justify-end' : 'bg-[#222] border-[#444] justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-black" />
                </button>
              </div>

              {/* Blocked Entities */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="font-serif font-bold text-sm text-white">Blocked Entities</span>
                </div>
                <span className="font-mono text-xs text-[#ff5555] font-bold">3 BLOCKED</span>
              </div>

              {/* Feature Locked Vault */}
              <div className="p-3.5 bg-[#0a0a0a] text-center space-y-1">
                <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                  🔒 FEATURE LOCKED
                </div>
                <p className="font-mono text-[9px] text-gray-600">
                  Biometric Face Unlock requires native app installation.
                </p>
              </div>
            </div>
          </div>

          {/* GROUP 4: COMMS SETTINGS */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-[#ddb7ff] font-bold uppercase tracking-wider block">
              COMMS SETTINGS
            </span>
            <div className="bg-[#141414] border-2 border-[#262626]">
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-serif font-bold text-sm text-white">Push Alerts</div>
                    <div className="font-mono text-[10px] text-gray-500">Instant notifications for mutual topic matches</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Bottom Action: Terminate Session */}
          <div className="pt-2">
            <button
              onClick={() => resetToBeforeRegister()}
              className="w-full py-3 bg-[#181416] hover:bg-[#281418] border-2 border-[#ff4444] text-[#ff6666] font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> TERMINATE SESSION (LOG OUT)
            </button>
          </div>

        </div>
      )}

      {/* Personal Info Modal */}
      {showPersonalModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#121212] border-4 border-[#ccff00] p-6 max-w-sm w-full space-y-4 shadow-[8px_8px_0px_#a855f7]">
            <div className="flex justify-between items-center border-b border-[#262626] pb-2">
              <h3 className="font-serif text-lg font-bold text-white">Personal Information</h3>
              <button onClick={() => setShowPersonalModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 font-mono text-xs text-gray-300">
              <div>Phone: <strong className="text-white">+91 98765 43210 (Verified)</strong></div>
              <div>Age: <strong className="text-white">26 Years</strong></div>
              <div>City: <strong className="text-white">Gurgaon (Delhi NCR)</strong></div>
              <div>DPDP Compliance: <strong className="text-[#ccff00]">Encrypted & Anonymized</strong></div>
            </div>
            <BrutalistButton variant="primary" size="sm" onClick={() => setShowPersonalModal(false)} className="w-full justify-center">
              CLOSE
            </BrutalistButton>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#121212] border-4 border-[#a855f7] p-6 max-w-sm w-full space-y-4 shadow-[8px_8px_0px_#ccff00]">
            <div className="flex justify-between items-center border-b border-[#262626] pb-2">
              <h3 className="font-serif text-lg font-bold text-white">Transaction History</h3>
              <button onClick={() => setShowTransactionModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 font-mono text-xs text-gray-300">
              <div className="bg-[#181818] p-2 border border-[#333]">
                <div className="flex justify-between text-white font-bold">
                  <span>Topic Boost 30M</span>
                  <span className="text-[#ccff00]">₹149</span>
                </div>
                <div className="text-[10px] text-gray-500">Aug 20, 2026 • Successful</div>
              </div>
            </div>
            <BrutalistButton variant="purple" size="sm" onClick={() => setShowTransactionModal(false)} className="w-full justify-center">
              CLOSE
            </BrutalistButton>
          </div>
        </div>
      )}

    </div>
  );
};
