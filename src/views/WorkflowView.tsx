import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { 
  GitBranch, 
  Play, 
  ArrowRight, 
  ArrowDown, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  MessageSquare, 
  Compass, 
  UserCheck, 
  Flame, 
  CheckCircle2, 
  Eye, 
  Zap, 
  HeartHandshake,
  Lock,
  ChevronRight,
  MonitorPlay
} from 'lucide-react';
import { ViewType } from '../types';

interface WorkflowNode {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  screens: string[];
  viewTarget: ViewType;
  category: 'onboarding' | 'discovery' | 'social' | 'matching' | 'chat' | 'profile' | 'monetization' | 'safety';
  description: string;
  keyActions: string[];
  outgoingNodes: string[];
  rules: string[];
}

export const WorkflowView: React.FC = () => {
  const { navigate } = useApp();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-discovery');
  const [simStepIndex, setSimStepIndex] = useState<number>(3);

  const workflowNodes: WorkflowNode[] = [
    {
      id: 'node-splash',
      stepNumber: '01',
      title: 'Splash & Onboarding',
      subtitle: 'Brand philosophy & safety contract',
      screens: ['SCR-000: Splash', 'SCR-001: Welcome', 'SCR-002: How Topics Work', 'SCR-003: Safety Promise'],
      viewTarget: 'onboarding',
      category: 'onboarding',
      description: 'Introduction to Topic-First Discovery. Focuses on topics as human signal rather than photos/bios.',
      keyActions: ['ACT_TAP_GET_STARTED', 'ACT_SWIPE_CAROUSEL', 'ACT_ACCEPT_SAFETY_PROMISE'],
      outgoingNodes: ['node-auth'],
      rules: ['No profile photo upload at entry', 'DPDP Act & IT Act Section 79 intermediary notice displayed']
    },
    {
      id: 'node-auth',
      stepNumber: '02',
      title: 'Auth & Verification',
      subtitle: 'Real-identity backend verification',
      screens: ['SCR-004: Phone OTP', 'SCR-005: 6-Digit Code', 'SCR-006: Profile Basics (Age, City, Intent)'],
      viewTarget: 'onboarding',
      category: 'onboarding',
      description: 'Verifies user authenticity via OTP. Users appear anonymous publicly while internally KYC-verified.',
      keyActions: ['ACT_SEND_OTP', 'ACT_CONFIRM_CODE', 'ACT_SET_AGE_AND_CITY'],
      outgoingNodes: ['node-topic-setup'],
      rules: ['Phone +91 verification mandatory', 'Age confirmation (18+)', 'Zero public PII leakage']
    },
    {
      id: 'node-topic-setup',
      stepNumber: '03',
      title: 'Topic Setup & AI Guard',
      subtitle: '3-word constraint & anti-target normalizer',
      screens: ['SCR-007: Topic Selector (Pick 5)', 'SCR-008: Create Topic (<=3 words)', 'SCR-008-MOD: AI Nudge', 'SCR-009: Chaos Profile Preview'],
      viewTarget: 'topics',
      category: 'discovery',
      description: 'Users build their conversational identity. Enforces <= 3 words and AI filters out personal targeting gossip.',
      keyActions: ['ACT_SELECT_CHIPS', 'ACT_CREATE_CUSTOM_TOPIC', 'ACT_AI_VALIDATE_NORMALIZATION'],
      outgoingNodes: ['node-discovery'],
      rules: ['Hard <=3 words rule', 'Block person names/accusations (e.g. Rahul is cheating -> Why people cheat)']
    },
    {
      id: 'node-discovery',
      stepNumber: '04',
      title: 'Discovery Hub (Deck)',
      subtitle: 'Topic card swipe state machine',
      screens: ['SCR-010: Discovery Feed', 'SCR-011: Filters', 'SCR-012: Algorithmic Preferences', 'SCR-013: Match Reveal'],
      viewTarget: 'feed',
      category: 'discovery',
      description: 'The core card engine. Shows Topic, Age, Overlaps & Distance. Swiping left passes; swiping right registers like.',
      keyActions: ['ACT_SWIPE_LEFT (Pass)', 'ACT_SWIPE_RIGHT (Like)', 'ACT_TAP_TOPIC_DETAILS', 'ACT_OPEN_FILTER_SHEET'],
      outgoingNodes: ['node-matches', 'node-topics-hub'],
      rules: ['Level 0 anonymity (Topic + Age + Overlaps)', 'Instant mutual-like resolution via Redis set']
    },
    {
      id: 'node-topics-hub',
      stepNumber: '05',
      title: 'Tab 2: Topics Universe',
      subtitle: 'Trending, discussion threads & live rooms',
      screens: ['SCR-014: Topics Explorer', 'SCR-015: Topic Detail', 'SCR-016: Ghosting Thread', 'SCR-017: Rooms Hub', 'SCR-018: Startup Chaos Live'],
      viewTarget: 'topics',
      category: 'social',
      description: 'Public community space for micro-discussions, audio rooms, and topic following.',
      keyActions: ['ACT_JOIN_ROOM', 'ACT_POST_THREAD_OPINION', 'ACT_SUBSCRIBE_TOPIC', 'ACT_TOGGLE_MIC'],
      outgoingNodes: ['node-discovery', 'node-matches'],
      rules: ['Anonymous take vs. Topic profile toggle', 'Real-time WebSocket audio/text stream']
    },
    {
      id: 'node-matches',
      stepNumber: '06',
      title: 'Tab 3: Matches Feed',
      subtitle: 'Topic overlaps & affinity breakdown',
      screens: ['SCR-020: Matches Feed', 'SCR-013: Match Reveal High-Tension Unmasking'],
      viewTarget: 'matches',
      category: 'matching',
      description: 'Displays mutual topic matches with 86%+ compatibility scores, shared topic badges, and starter openers.',
      keyActions: ['ACT_OPEN_MATCH_DETAIL', 'ACT_LAUNCH_TOPIC_OPENER', 'ACT_START_ENCRYPTED_TUNNEL'],
      outgoingNodes: ['node-chat'],
      rules: ['Shows shared conversation affinities', 'No identity reveal until Level 5 consent']
    },
    {
      id: 'node-chat',
      stepNumber: '07',
      title: 'Tab 4: Progressive Chat',
      subtitle: 'Level 0 -> Level 5 mutual unmasking',
      screens: ['SCR-021: Active Chat', 'SCR-022: Identity Reveal Permission', 'SCR-023: Animated Unmasking'],
      viewTarget: 'chat',
      category: 'chat',
      description: '1-on-1 encrypted chat with AI prompts and mutual permission-based progressive reveal from Level 0 to Level 5.',
      keyActions: ['ACT_SEND_MESSAGE', 'ACT_REQUEST_REVEAL', 'ACT_MUTUAL_ACCEPT_REVEAL', 'ACT_EXTRACT_TOPIC_TO_PROFILE'],
      outgoingNodes: ['node-profile', 'node-safety'],
      rules: ['Progressive Reveal: Level 0 (Topic) -> Level 4 (Chat) -> Level 5 (Avatar/Name)', 'Ephemeral messaging support']
    },
    {
      id: 'node-profile',
      stepNumber: '08',
      title: 'Tab 5: Chaos Profile',
      subtitle: 'Topic portfolio & DPDP privacy',
      screens: ['SCR-024: Edit Topics', 'SCR-025: App Settings & Privacy', 'SCR-009: Chaos Identity'],
      viewTarget: 'profile',
      category: 'profile',
      description: 'Manage your active topics, visibility settings, Chaos index, and DPDP Act data rights/export.',
      keyActions: ['ACT_EDIT_TOPICS', 'ACT_REORDER_TOPICS', 'ACT_EXPORT_DATA_DPDP', 'ACT_SET_VISIBILITY'],
      outgoingNodes: ['node-boost'],
      rules: ['Instant topic revocation', 'DPDP Act compliance tools']
    },
    {
      id: 'node-boost',
      stepNumber: '09',
      title: 'Monetization: Topic Boost',
      subtitle: 'Attention monetization (30m/1h/3h)',
      screens: ['SCR-026: Rumr Premium PRO', 'SCR-027: Topic Boost Selector', 'SCR-028: Checkout', 'SCR-029: Live Boost Surge', 'SCR-030: AI Matchmaker'],
      viewTarget: 'boost',
      category: 'monetization',
      description: 'Monetizes topic discovery rather than gating conversation. Boosts reach to +1,200 compatible users.',
      keyActions: ['ACT_SELECT_BOOST_TOPIC', 'ACT_PURCHASE_BOOST_TIER', 'ACT_VIEW_LIVE_SURGE_ANALYTICS'],
      outgoingNodes: ['node-discovery'],
      rules: ['Basic conversation is always free', 'Boost multiplies impressions in topic cluster']
    },
    {
      id: 'node-safety',
      stepNumber: '10',
      title: 'Safety, Trust & Admin',
      subtitle: 'Moderation queue & IT Act compliance',
      screens: ['SCR-031: Report User', 'SCR-032: Moderation Warning', 'SCR-033: User Reports Queue', 'SCR-034: Flagged Content', 'SCR-036: System Health'],
      viewTarget: 'safety',
      category: 'safety',
      description: 'Reporting, instant blocking, and human-in-the-loop AI moderation queue protecting user safety.',
      keyActions: ['ACT_SUBMIT_REPORT', 'ACT_INSTANT_BLOCK', 'ACT_APPEAL_DECISION', 'ACT_VIEW_SYSTEM_HEALTH'],
      outgoingNodes: ['node-discovery'],
      rules: ['Immediate sender quarantine upon harassment flag', 'IT Act Section 79 intermediary due-diligence logs']
    }
  ];

  const selectedNode = workflowNodes.find(n => n.id === selectedNodeId) || workflowNodes[0];

  const handleSimStep = (direction: 'next' | 'prev') => {
    let nextIdx = direction === 'next' ? simStepIndex + 1 : simStepIndex - 1;
    if (nextIdx < 0) nextIdx = 0;
    if (nextIdx >= workflowNodes.length) nextIdx = workflowNodes.length - 1;
    setSimStepIndex(nextIdx);
    setSelectedNodeId(workflowNodes[nextIdx].id);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141414] border-2 border-[#ccff00] p-4 shadow-[4px_4px_0px_#a855f7]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#ccff00]" />
            <BrutalistBadge variant="lime">ARCHITECTURE BLUEPRINT // STATE MACHINE</BrutalistBadge>
          </div>
          <span className="font-mono text-xs text-[#a855f7] font-bold">43+ SCREENS LINKED</span>
        </div>
        <h2 className="font-serif text-2xl font-black text-white">
          Rumr Screen Workflow & State Architecture
        </h2>
        <p className="font-mono text-xs text-gray-300 mt-1">
          Interactive state machine diagram. Click any phase node to inspect its screens, transitions, and launch the live screen frame.
        </p>
      </div>

      {/* Visual Workflow Flowchart Card */}
      <div className="bg-[#0d0d0d] border-2 border-[#262626] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-bold text-[#ccff00] uppercase tracking-wider flex items-center gap-2">
            <MonitorPlay className="w-4 h-4 text-[#ccff00]" />
            Master User Journey Flowchart
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSimStep('prev')}
              disabled={simStepIndex === 0}
              className="font-mono text-[10px] bg-[#1a1a1a] text-gray-300 hover:text-white px-2 py-1 border border-[#333] disabled:opacity-30"
            >
              ◀ Prev
            </button>
            <span className="font-mono text-[10px] bg-[#222] px-2 py-1 text-[#ccff00] font-bold">
              {simStepIndex + 1} / {workflowNodes.length}
            </span>
            <button
              onClick={() => handleSimStep('next')}
              disabled={simStepIndex === workflowNodes.length - 1}
              className="font-mono text-[10px] bg-[#1a1a1a] text-[#ccff00] hover:bg-[#ccff00] hover:text-black px-2 py-1 border border-[#ccff00] font-bold disabled:opacity-30"
            >
              Next ▶
            </button>
          </div>
        </div>

        {/* ASCII Flowchart Box */}
        <pre className="font-mono text-[11px] text-[#e0d2ff] bg-[#14121a] p-3 border border-[#a855f7] overflow-x-auto leading-relaxed select-all">
{`1. SPLASH / ONBOARDING ──► 2. AUTH & VERIFY ──► 3. TOPIC SETUP (<=3 words + AI Guard)
                                                            │
                                                            ▼
                                                4. DISCOVERY HUB (Topic Cards)
                                                            │
             ┌──────────────────────────────┬───────────────┴──────────────┬─────────────────────────────┐
             ▼                              ▼                              ▼                             ▼
   [Tab 1: Discover Feed]         [Tab 2: Topics Hub]            [Tab 3: Matches Feed]         [Tab 5: Chaos Profile]
   • Swipe Left (Pass)            • Trending / For You           • Overlaps & Affinity         • Manage Topic Tags
   • Swipe Right (Like)           • Topic Detail (Office Drama)  • Mutual Reveal State         • Privacy Toggles
   • Filter / Similarity Mode     • Live Chat Streams            • 1-on-1 Progressive Chat     • Settings & Export
                                  • Communities Hub                 (Level 0 -> Level 5)`}
        </pre>

        {/* Node Grid Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {workflowNodes.map((node, idx) => {
            const isSelected = node.id === selectedNodeId;
            return (
              <button
                key={node.id}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  setSimStepIndex(idx);
                }}
                className={`p-2.5 text-left border-2 transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-[#1a1824] border-[#ccff00] shadow-[2px_2px_0px_#a855f7]' 
                    : 'bg-[#121212] border-[#262626] hover:border-[#444]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-mono text-[10px] font-bold px-1 ${isSelected ? 'bg-[#ccff00] text-black' : 'bg-[#222] text-gray-400'}`}>
                      #{node.stepNumber}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-ping" />}
                  </div>
                  <div className="font-serif text-xs font-bold text-white line-clamp-1">
                    {node.title}
                  </div>
                </div>
                <span className="font-mono text-[9px] text-gray-500 uppercase mt-1">
                  {node.screens.length} Screens
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Detailed Inspector */}
      <div className="bg-[#141414] border-2 border-[#333] p-5 space-y-4 relative overflow-hidden">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs bg-[#a855f7] text-black font-bold px-2 py-0.5">
                PHASE #{selectedNode.stepNumber}
              </span>
              <span className="font-mono text-xs text-gray-400 uppercase">
                CATEGORY: {selectedNode.category}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-black text-white">
              {selectedNode.title}
            </h3>
            <p className="font-mono text-xs text-[#ccff00] mt-0.5">
              {selectedNode.subtitle}
            </p>
          </div>

          <BrutalistButton
            variant="primary"
            size="md"
            onClick={() => navigate(selectedNode.viewTarget)}
            className="flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-black text-black" />
            LAUNCH THIS VIEW ({selectedNode.viewTarget.toUpperCase()})
          </BrutalistButton>
        </div>

        <p className="font-sans text-sm text-gray-300 leading-relaxed border-l-2 border-[#ccff00] pl-3 py-1 bg-[#111]">
          {selectedNode.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Associated Stitch Screens */}
          <div className="bg-[#0d0d0d] border border-[#262626] p-3 space-y-2">
            <div className="font-mono text-[11px] font-bold text-[#ddb7ff] uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#a855f7]" />
              Associated Stitch Screen IDs
            </div>
            <div className="space-y-1">
              {selectedNode.screens.map((scr, sIdx) => (
                <div key={sIdx} className="font-mono text-xs text-gray-300 flex items-center gap-2 py-0.5">
                  <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-none" />
                  <span>{scr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Actions & State Triggers */}
          <div className="bg-[#0d0d0d] border border-[#262626] p-3 space-y-2">
            <div className="font-mono text-[11px] font-bold text-[#ccff00] uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#ccff00]" />
              State Machine Triggers (ACT)
            </div>
            <div className="space-y-1">
              {selectedNode.keyActions.map((act, aIdx) => (
                <div key={aIdx} className="font-mono text-xs text-gray-300 flex items-center gap-2 py-0.5">
                  <span className="font-bold text-[#a855f7]">►</span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Business Rules & Compliance */}
        <div className="bg-[#111111] border border-[#333] p-3 space-y-1.5">
          <div className="font-mono text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
            Product Rules & Compliance Guardrails
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {selectedNode.rules.map((rule, rIdx) => (
              <div key={rIdx} className="font-mono text-[11px] text-gray-300 flex items-start gap-1.5">
                <span className="text-[#ccff00] font-bold">✓</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The 5-Tab Architecture Matrix Reference */}
      <div className="bg-[#141414] border-2 border-[#262626] p-4 space-y-3">
        <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#ccff00]" />
          5-Tab Mobile Shell State Routing
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {[
            { tab: 'Tab 1: Discover', target: 'feed', desc: 'Card deck swipe + like/pass + match popup' },
            { tab: 'Tab 2: Topics', target: 'topics', desc: 'Trending topics + rooms + 3-word creator' },
            { tab: 'Tab 3: Matches', target: 'matches', desc: 'Mutual topic matches & compatibility' },
            { tab: 'Tab 4: Chats', target: 'chat', desc: '1-on-1 encrypted progressive unmasking' },
            { tab: 'Tab 5: Me', target: 'profile', desc: 'Topic portfolio & DPDP privacy settings' },
          ].map(item => (
            <div 
              key={item.tab} 
              onClick={() => navigate(item.target as ViewType)}
              className="bg-[#1a1a1a] border border-[#333] p-2.5 hover:border-[#ccff00] cursor-pointer transition-colors space-y-1"
            >
              <div className="font-mono text-xs font-bold text-[#ccff00]">{item.tab}</div>
              <div className="font-mono text-[10px] text-gray-400 leading-tight">{item.desc}</div>
              <div className="pt-1 text-[10px] font-mono text-[#a855f7] font-bold">Launch ➔</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
