import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { 
  GitBranch, 
  Play, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  MessageSquare, 
  Compass, 
  UserCheck, 
  UserX,
  Flame, 
  CheckCircle2, 
  Eye, 
  Zap, 
  HeartHandshake,
  Lock,
  ChevronRight,
  MonitorPlay,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { ViewType } from '../types';

export const WorkflowView: React.FC = () => {
  const { navigate, resetToBeforeRegister, setRegistered, isRegistered } = useApp();
  const [activeTab, setActiveTab] = useState<'before_reg' | 'after_reg'>('before_reg');
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);

  // 1. BEFORE REGISTERING AN ACCOUNT STEPS (Flows 01 - 02)
  const beforeRegSteps = [
    {
      num: '01',
      screenId: 'SCR-001',
      title: 'Splash Screen & Session Check',
      purpose: 'Brand intro (1.5s). Detects auth token. Missing token routes user straight to Onboarding.',
      userMindset: 'First impression: "What is Rumr? Why is it about topics rather than faces?"',
      actions: ['ACT_DETECT_SESSION (Auto-evaluates local JWT)', 'ACT_ROUTE_ONBOARDING'],
      targetView: 'onboarding' as ViewType,
      screens: ['SCR-001: Splash Screen', 'SCR-002: Web Landing Teaser']
    },
    {
      num: '02',
      screenId: 'SCR-003',
      title: 'Welcome & Value Proposition',
      purpose: 'Hooks the user with the core thesis: "Don\'t swipe on people. Swipe on topics."',
      userMindset: 'Curiosity ignited: Relieved they don\'t need to curate a fake bio or headshot.',
      actions: ['ACT_TAP_GET_STARTED', 'ACT_TAP_EXISTING_LOGIN'],
      targetView: 'onboarding' as ViewType,
      screens: ['SCR-003: Welcome Onboarding Hero']
    },
    {
      num: '03',
      screenId: 'SCR-004',
      title: 'How Topics Work (Interactive 3-Card Carousel)',
      purpose: 'Educates user on the matching loop: Pick Topics -> Match Without Bias -> Start Conversation.',
      userMindset: 'Understanding the mechanics: "I see what they want to talk about before seeing who they are."',
      actions: ['ACT_SWIPE_CAROUSEL_FRAME', 'ACT_TAP_CONTINUE'],
      targetView: 'onboarding' as ViewType,
      screens: ['SCR-004: How It Works Carousel (Frames A, B, C)']
    },
    {
      num: '04',
      screenId: 'SCR-005',
      title: 'Safety & DPDP Privacy Promise',
      purpose: 'Explicit trust agreement: progressive controlled reveal, anti-targeting rule, IT Act & DPDP compliance.',
      userMindset: 'Trust established: Reassured that personal gossip and harassment are strictly prohibited.',
      actions: ['ACT_READ_SAFETY_PROMISE', 'ACT_ACCEPT_AND_PROCEED'],
      targetView: 'onboarding' as ViewType,
      screens: ['SCR-005: Safety & Privacy Promise']
    },
    {
      num: '05',
      screenId: 'SCR-006',
      title: 'Phone Number & OTP Authentication',
      purpose: 'Internal KYC verification (+91 India OTP). The user is verified internally while appearing anonymous publicly.',
      userMindset: 'Authenticity check: Confident the platform has real, phone-verified people and no bots.',
      actions: ['ACT_INPUT_PHONE (+91)', 'ACT_SUBMIT_OTP_CODE', 'ACT_AUTO_VERIFY_JWT'],
      targetView: 'onboarding' as ViewType,
      screens: ['SCR-006: Phone Verification', 'SCR-007: 6-Digit OTP Entry']
    },
    {
      num: '06',
      screenId: 'SCR-008',
      title: 'Profile Basics Setup',
      purpose: 'Collects non-PII matching anchors: Age (26), Gender, Connection Intent, City (Gurgaon).',
      userMindset: 'Fast input: No tedious essay writing. Just core discovery filters.',
      actions: ['ACT_SELECT_AGE_SLIDER', 'ACT_SET_INTENT_RADIO', 'ACT_CONFIRM_CITY'],
      targetView: 'onboarding' as ViewType,
      screens: ['SCR-008: Profile Basics Form']
    },
    {
      num: '07',
      screenId: 'SCR-009',
      title: 'Topic Taxonomy Selection (Pick 5+)',
      purpose: 'Builds conversational identity: User selects 5+ topics from category chips (Dating, Workplace, Chaos).',
      userMindset: 'Self-expression: Picking topics they actually care about (Office Politics, Ghosting, Startup Drama).',
      actions: ['ACT_TOGGLE_TOPIC_CHIPS', 'ACT_UNLOCK_CREATOR_AT_5'],
      targetView: 'onboarding' as ViewType,
      screens: ['SCR-009: Topic Selection Matrix']
    },
    {
      num: '08',
      screenId: 'SCR-010',
      title: 'Custom <=3-Word Topic Creator & AI Guard',
      purpose: 'Enforces hard <=3-word constraint and real-time LLM intercept to block personal accusations.',
      userMindset: 'Creativity with safety: Typing "Why People Ghost" gets approved; "Rahul cheated" gets blocked & suggested alternative.',
      actions: ['ACT_TYPE_CUSTOM_TOPIC', 'ACT_AI_NORMALIZATION_VALIDATE', 'ACT_SAVE_CUSTOM_TOPIC'],
      targetView: 'onboarding' as ViewType,
      screens: ['SCR-010: 3-Word Creator', 'SCR-011: AI Moderation Nudge']
    },
    {
      num: '09',
      screenId: 'SCR-012',
      title: 'Topic Identity Preview & Milestone Transition',
      purpose: 'Displays user\'s generated Topic Discovery Card. Tapping [START DISCOVERING] completes registration!',
      userMindset: 'Excitement: "My profile is ready and I am anonymous. Time to see what others want to talk about!"',
      actions: ['ACT_REVIEW_TOPIC_CARD', 'ACT_COMPLETE_REGISTRATION (Flips session to Authenticated!)'],
      targetView: 'onboarding' as ViewType,
      screens: ['SCR-012: Topic Profile Preview', 'SCR-013: Chaos Identity Portfolio']
    }
  ];

  // 2. AFTER REGISTERING AN ACCOUNT STEPS (Flows 03 - 09)
  const afterRegSteps = [
    {
      num: '01',
      screenId: 'SCR-014',
      title: 'Tab 1: Discover Card Swipe Deck (The Daily Engine)',
      purpose: 'Hero discovery screen: Large topic typography ("OFFICE POLITICS"), Age 26, 4 shared overlaps, Pass/Like buttons.',
      userMindset: 'Curious swiping: Reading bold conversation topics and swiping right on shared intellectual chaos.',
      actions: ['ACT_SWIPE_LEFT (Pass)', 'ACT_SWIPE_RIGHT (Like)', 'ACT_TAP_TOPIC (Deep Dive)', 'ACT_OPEN_FILTER_SHEET'],
      targetView: 'feed' as ViewType,
      screens: ['SCR-014: Discover Card Deck', 'SCR-015: Dense Feed', 'SCR-016: Filters', 'SCR-017: Preferences']
    },
    {
      num: '02',
      screenId: 'SCR-018',
      title: 'Match Reveal Celebration & Mutual Signal',
      purpose: 'Pops when both users like each other\'s topics: "SAME CHAOS. SAME TOPICS." Lists 4 shared affinities.',
      userMindset: 'Intrigue & validation: "We both love discussing startup drama and office politics. Let\'s talk!"',
      actions: ['ACT_TRIGGER_CONFETTI', 'ACT_TAP_SAY_SOMETHING (Launches Chat)', 'ACT_TAP_MAYBE_LATER'],
      targetView: 'feed' as ViewType,
      screens: ['SCR-018: Match Reveal Modal', 'SCR-019: High-Tension Unmasking']
    },
    {
      num: '03',
      screenId: 'SCR-020',
      title: 'Tab 3: Matches Feed & Overlap Breakdown',
      purpose: 'Matrix of all active matches sorted by compatibility % (94%, 88%) with AI starter prompts.',
      userMindset: 'Reviewing matches without photo bias. Deciding who to message first.',
      actions: ['ACT_OPEN_MATCH_DETAIL', 'ACT_LAUNCH_TOPIC_OPENER', 'ACT_START_ENCRYPTED_TUNNEL'],
      targetView: 'matches' as ViewType,
      screens: ['SCR-020: Matches Feed', 'SCR-021: Match Detail', 'SCR-022: Starter Selector', 'SCR-023: Expiry Notice']
    },
    {
      num: '04',
      screenId: 'SCR-025',
      title: 'Tab 4: Progressive Chat & In-Flight Extraction',
      purpose: '1-on-1 encrypted chat with AI openers. AI suggests new topics mentioned in chat to add to profile.',
      userMindset: 'Engaging in real conversation about the topic instead of boring small talk ("hey").',
      actions: ['ACT_SEND_ENCRYPTED_MSG', 'ACT_EXTRACT_TOPIC_CHIP', 'ACT_REQUEST_IDENTITY_REVEAL'],
      targetView: 'chat' as ViewType,
      screens: ['SCR-025: Active Chat', 'SCR-026: In-Chat Topic Nudge', 'SCR-030: Ephemeral Timer']
    },
    {
      num: '05',
      screenId: 'SCR-027',
      title: 'Level 5 Mutual Identity Reveal (Unmasking)',
      purpose: 'Mutual consent sheet: When both users agree, photo and verified first name unblur with scanline animation.',
      userMindset: 'High-tension payoff: Mystery turns into real human connection by mutual choice.',
      actions: ['ACT_MUTUAL_ACCEPT_REVEAL', 'ACT_UNMASK_ANIMATION', 'ACT_VIEW_FULL_PROFILE'],
      targetView: 'chat' as ViewType,
      screens: ['SCR-027: Consent Sheet', 'SCR-028: Unmasking Animation', 'SCR-029: Level 5 Unmasked Chat']
    },
    {
      num: '06',
      screenId: 'SCR-031',
      title: 'Tab 2: Topics Universe, Threads & Live Audio Rooms',
      purpose: 'Explore public community discussions, post hot takes, and drop into anonymous live audio rooms.',
      userMindset: 'Broadening interests: Joining live rants about "Startup Chaos" or "Dating After 25".',
      actions: ['ACT_EXPLORE_TRENDING_TOPICS', 'ACT_REPLY_DISCUSSION_THREAD', 'ACT_JOIN_LIVE_AUDIO_ROOM'],
      targetView: 'topics' as ViewType,
      screens: ['SCR-031: Topics Explorer', 'SCR-032: Topic Detail', 'SCR-033: Thread Detail', 'SCR-036: Audio Room']
    },
    {
      num: '07',
      screenId: 'SCR-039',
      title: 'Tab 5: Me Profile & DPDP Privacy Controls',
      purpose: 'Manage active topics, view Chaos Index score, configure discovery range, and export personal data.',
      userMindset: 'Control & customization: Updating active topics and managing privacy settings.',
      actions: ['ACT_EDIT_TOPICS_PORTFOLIO', 'ACT_EXPORT_DATA_DPDP', 'ACT_SET_ANONYMITY_RADIUS'],
      targetView: 'profile' as ViewType,
      screens: ['SCR-039: My Topic Profile', 'SCR-040: Edit Topics', 'SCR-041: Settings', 'SCR-042: DPDP Export']
    },
    {
      num: '08',
      screenId: 'SCR-048',
      title: 'Monetization: Rumr Premium PRO & Topic Boosts',
      purpose: 'Attention monetization: Boost a topic for 30m/1h/3h to reach +1,200 compatible users & run AI Matchmaker.',
      userMindset: 'Power discovery: Surfacing personal topics to top of matching queue during peak hours.',
      actions: ['ACT_BOOST_SPECIFIC_TOPIC', 'ACT_VIEW_LIVE_SURGE_ANALYTICS', 'ACT_QUERY_AI_MATCHMAKER'],
      targetView: 'boost' as ViewType,
      screens: ['SCR-048: Premium PRO', 'SCR-049: Boost Selector', 'SCR-052: Analytics Surge', 'SCR-053: AI Matchmaker']
    }
  ];

  const currentSteps = activeTab === 'before_reg' ? beforeRegSteps : afterRegSteps;
  const currentStep = currentSteps[selectedStepIndex] || currentSteps[0];

  return (
    <div className="p-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141414] border-2 border-[#ccff00] p-4 shadow-[4px_4px_0px_#a855f7]">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#ccff00]" />
            <BrutalistBadge variant="lime">MASTER UX ARCHITECTURE</BrutalistBadge>
          </div>
          <span className="font-mono text-xs text-[#a855f7] font-bold">FLOWS 01 – 09</span>
        </div>
        <h2 className="font-serif text-2xl font-black text-white">
          Screen Flow & State Transitions
        </h2>
        <p className="font-mono text-xs text-gray-300 mt-1">
          Step-by-step interaction graph for Onboarding, Topic Setup, Discovery, and Progressive Chat.
        </p>
      </div>

      {/* Primary Flow Segment Switcher */}
      <div className="grid grid-cols-2 gap-2 bg-[#0c0c0c] p-1.5 border-2 border-[#262626]">
        <button
          onClick={() => {
            setActiveTab('before_reg');
            setSelectedStepIndex(0);
          }}
          className={`py-3 px-4 text-left border-2 transition-all flex items-center justify-between ${
            activeTab === 'before_reg'
              ? 'bg-[#1b1724] border-[#a855f7] shadow-[2px_2px_0px_#ccff00]'
              : 'bg-[#121212] border-[#222] text-gray-400 hover:text-white'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Compass className={`w-4 h-4 ${activeTab === 'before_reg' ? 'text-[#a855f7]' : 'text-gray-400'}`} />
              <span className="font-mono text-xs font-bold uppercase text-white">FLOW 01-02: ONBOARDING & SETUP</span>
            </div>
            <div className="font-mono text-[10px] text-gray-400">KYC, DPDP Safety & Topic Identity</div>
          </div>
          <span className="font-mono text-xs bg-[#222] px-2 py-1 text-[#ddb7ff] font-bold">9 Steps</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('after_reg');
            setSelectedStepIndex(0);
          }}
          className={`py-3 px-4 text-left border-2 transition-all flex items-center justify-between ${
            activeTab === 'after_reg'
              ? 'bg-[#161a12] border-[#ccff00] shadow-[2px_2px_0px_#a855f7]'
              : 'bg-[#121212] border-[#222] text-gray-400 hover:text-white'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame className={`w-4 h-4 ${activeTab === 'after_reg' ? 'text-[#ccff00]' : 'text-gray-400'}`} />
              <span className="font-mono text-xs font-bold uppercase text-white">FLOW 03-09: DISCOVERY & CHATS</span>
            </div>
            <div className="font-mono text-[10px] text-gray-400">5-Tab Daily Discovery & Progressive Unmasking</div>
          </div>
          <span className="font-mono text-xs bg-[#222] px-2 py-1 text-[#ccff00] font-bold">8 Steps</span>
        </button>
      </div>

      {/* Sequential Step Indicator */}
      <div className="bg-[#0e0e0e] border-2 border-[#262626] p-3 space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-gray-400 uppercase font-bold flex items-center gap-1.5">
            <MonitorPlay className="w-3.5 h-3.5 text-[#ccff00]" />
            Step Sequence Timeline ({activeTab === 'before_reg' ? 'Guest Onboarding Funnel' : 'Daily Authenticated Loop'})
          </span>
          <span className="text-[#ccff00] font-bold">
            Step {selectedStepIndex + 1} of {currentSteps.length}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
          {currentSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedStepIndex(idx)}
              className={`p-2 text-center border transition-all ${
                selectedStepIndex === idx
                  ? activeTab === 'before_reg' ? 'bg-[#a855f7] text-black border-[#a855f7] font-bold' : 'bg-[#ccff00] text-black border-[#ccff00] font-bold'
                  : 'bg-[#141414] text-gray-400 border-[#262626] hover:border-[#444]'
              }`}
            >
              <div className="font-mono text-[10px]">#{step.num}</div>
              <div className="font-mono text-[9px] truncate max-w-[80px]">{step.screenId}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Step Deep Dive Card */}
      <div className="bg-[#141414] border-2 border-[#333] p-5 space-y-5 shadow-[4px_4px_0px_#222]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#262626] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs bg-[#ccff00] text-black font-black px-2 py-0.5">
                STEP #{currentStep.num} // {currentStep.screenId}
              </span>
              <span className="font-mono text-xs text-[#ddb7ff] bg-[#1a1726] border border-[#a855f7] px-2 py-0.5 font-bold">
                {activeTab === 'before_reg' ? 'ONBOARDING' : 'DISCOVERY'}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-black text-white">
              {currentStep.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <BrutalistButton
              variant="primary"
              size="sm"
              onClick={() => {
                if (activeTab === 'before_reg') {
                  resetToBeforeRegister();
                } else {
                  setRegistered(true);
                  navigate(currentStep.targetView);
                }
              }}
              className="flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-black text-black" />
              SIMULATE THIS FRAME
            </BrutalistButton>
          </div>
        </div>

        {/* Purpose & User Mindset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111] border border-[#262626] p-3 space-y-1.5">
            <div className="font-mono text-[11px] font-bold text-[#ccff00] uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> UX Purpose & Screen Mechanics
            </div>
            <p className="font-sans text-xs text-gray-300 leading-relaxed">
              {currentStep.purpose}
            </p>
          </div>

          <div className="bg-[#111] border border-[#262626] p-3 space-y-1.5">
            <div className="font-mono text-[11px] font-bold text-[#ddb7ff] uppercase flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#a855f7]" /> User Psychological Mindset
            </div>
            <p className="font-sans text-xs text-gray-300 leading-relaxed italic">
              "{currentStep.userMindset}"
            </p>
          </div>
        </div>

        {/* Triggers & Associated Stitch Screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0c0c0c] border border-[#262626] p-3 space-y-2">
            <div className="font-mono text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#ccff00]" /> User Actions & Event Triggers
            </div>
            <div className="space-y-1">
              {currentStep.actions.map((act, aIdx) => (
                <div key={aIdx} className="font-mono text-xs text-gray-300 flex items-center gap-1.5">
                  <span className="text-[#a855f7] font-bold">►</span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-[#262626] p-3 space-y-2">
            <div className="font-mono text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#a855f7]" /> Stitch Screen Identifiers
            </div>
            <div className="space-y-1">
              {currentStep.screens.map((scr, sIdx) => (
                <div key={sIdx} className="font-mono text-xs text-gray-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#ccff00]" />
                  <span>{scr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex justify-between items-center pt-2 border-t border-[#222]">
          <button
            onClick={() => setSelectedStepIndex(Math.max(0, selectedStepIndex - 1))}
            disabled={selectedStepIndex === 0}
            className="font-mono text-xs px-3 py-1.5 bg-[#181818] text-gray-300 hover:text-white border border-[#333] disabled:opacity-30 flex items-center gap-1"
          >
            ◀ Previous Step
          </button>

          <button
            onClick={() => setSelectedStepIndex(Math.min(currentSteps.length - 1, selectedStepIndex + 1))}
            disabled={selectedStepIndex === currentSteps.length - 1}
            className="font-mono text-xs px-3 py-1.5 bg-[#ccff00] text-black font-bold hover:bg-white transition-colors disabled:opacity-30 flex items-center gap-1"
          >
            Next Step ▶
          </button>
        </div>
      </div>
    </div>
  );
};
