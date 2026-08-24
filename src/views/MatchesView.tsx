import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { 
  Heart, 
  Sparkles, 
  MessageSquare, 
  Flame, 
  ArrowLeft, 
  ArrowRight,
  Send, 
  Lock, 
  Unlock, 
  ChevronRight, 
  Shield, 
  Zap,
  Users
} from 'lucide-react';
import { IdentityDecryptedModal } from '../components/ui/IdentityDecryptedModal';
import { MutualUnmaskingModal } from '../components/ui/MutualUnmaskingModal';

interface MatchItem {
  id: string;
  handle: string;
  age: number;
  distance: string;
  compatibility: number;
  sharedCount: number;
  topics: string[];
  lastActive: string;
  isHot: boolean;
  opener: string;
  firstPeerMessage?: string;
  firstMyMessage?: string;
}

export const MatchesView: React.FC = () => {
  const { 
    navigate, 
    partner, 
    chatMessages, 
    sendChatMessage, 
    revealStage, 
    advanceReveal 
  } = useApp();

  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showUnmaskModal, setShowUnmaskModal] = useState(false);
  const [showDecryptedModal, setShowDecryptedModal] = useState(false);

  const matchesList: MatchItem[] = [
    {
      id: 'match-1',
      handle: 'cipher_vanguard',
      age: 26,
      distance: 'Gurgaon • 4 km away',
      compatibility: 94,
      sharedCount: 4,
      topics: ['Office Politics', 'Ghosting', 'Startup Drama', 'Situationships'],
      lastActive: 'Active 12m ago',
      isHot: true,
      opener: 'What\'s worse: being ghosted or slowly faded out?',
      firstPeerMessage: 'Most people blaming AI for headcount cuts are ignoring margin compressions in cloud infra.',
      firstMyMessage: 'True, but middle management is using LLMs as cover to offload contractor blame without severance.'
    },
    {
      id: 'match-2',
      handle: 'logic_gate_99',
      age: 28,
      distance: 'Delhi NCR • 9 km away',
      compatibility: 88,
      sharedCount: 3,
      topics: ['Startup Life', 'Salary Comparison', 'Toxic Bosses'],
      lastActive: 'Active 1h ago',
      isHot: false,
      opener: 'Should coworkers ever be real friends outside work?',
      firstPeerMessage: 'The boundary between work colleague and real friend depends entirely on shared crisis bonding.',
      firstMyMessage: 'Agreed, once you survive a toxic sprint together, you skip 6 months of small talk.'
    },
    {
      id: 'match-3',
      handle: 'neo_contrarian',
      age: 25,
      distance: 'Mumbai • Nearby',
      compatibility: 86,
      sharedCount: 3,
      topics: ['Bollywood Controversies', 'Dating After 25', 'First Date Disasters'],
      lastActive: 'Active 3h ago',
      isHot: false,
      opener: 'What is your biggest dating red flag in 2026?',
      firstPeerMessage: 'Dating apps optimizing for session retention killed spontaneous romance.',
      firstMyMessage: 'Exactly why matching on raw intellectual friction is the only antidote.'
    },
    {
      id: 'match-4',
      handle: 'quantum_phantom',
      age: 29,
      distance: 'Bengaluru • Active now',
      compatibility: 96,
      sharedCount: 4,
      topics: ['AI Wrapper Bubble', 'Burn Rates', 'Stealth Building', 'Tech Compensation'],
      lastActive: 'Active 2m ago',
      isHot: true,
      opener: 'Is 2026 the year AI wrapper businesses get completely commoditized?',
      firstPeerMessage: 'Unless you own proprietary vector distribution, wrappers have zero defensive moat.',
      firstMyMessage: 'Distribution always beats pure algorithm novelty in the enterprise game.'
    }
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="p-3 sm:p-4 space-y-4 flex-1 flex flex-col justify-between">
      
      {/* ========================================================================= */}
      {/* OPTION A: MATCHES LIST (Default View) */}
      {/* ========================================================================= */}
      {!selectedMatch ? (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-[#ccff00] fill-[#ccff00]" />
                <BrutalistBadge variant="lime">TAB 3 // MATCHES MATRIX</BrutalistBadge>
              </div>
              <h2 className="font-serif text-2xl font-black text-white">Topic Overlap Matches</h2>
              <p className="font-mono text-xs text-gray-400">People who want to talk about the same chaos you do.</p>
            </div>

            <button
              onClick={() => navigate('feed')}
              className="font-mono text-xs text-[#a855f7] hover:text-white flex items-center gap-1 border border-[#333] px-2.5 py-1.5 bg-[#141414]"
            >
              <Flame className="w-3.5 h-3.5 text-[#ccff00]" /> Find More
            </button>
          </div>

          {/* Matches List Grid */}
          <div className="space-y-4">
            {matchesList.map(match => (
              <BrutalistCard key={match.id} isHot={match.isHot} className="space-y-3.5 p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif text-2xl font-black text-white">{match.age}</span>
                      <BrutalistBadge variant={match.isHot ? 'lime' : 'purple'}>
                        {match.sharedCount} SHARED TOPICS
                      </BrutalistBadge>
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                      {match.distance} • <span className="text-[#a855f7]">{match.lastActive}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-base font-black text-[#ccff00]">
                      {match.compatibility}%
                    </div>
                    <div className="font-mono text-[9px] text-gray-500 uppercase">COMPATIBILITY</div>
                  </div>
                </div>

                {/* Shared Topics Chips */}
                <div className="space-y-1.5">
                  <div className="font-mono text-[10px] text-gray-400 uppercase font-bold">SHARED AFFINITIES:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {match.topics.map((t, idx) => (
                      <span 
                        key={idx} 
                        className="font-mono text-xs font-bold px-2 py-1 bg-[#1b1724] border border-[#a855f7] text-[#ddb7ff]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggested Conversation Opener Prompt */}
                <div className="bg-[#111] border-l-2 border-[#ccff00] p-2.5 space-y-1">
                  <div className="font-mono text-[10px] text-[#ccff00] font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#ccff00]" /> SUGGESTED CONVERSATION OPENER
                  </div>
                  <p className="font-serif text-xs italic text-gray-300 leading-relaxed">
                    "{match.opener}"
                  </p>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                  <span className="font-mono text-[10px] text-gray-500">
                    Level 0 Anonymity Active
                  </span>

                  {/* START CHAT BUTTON (Opens Chat Segment directly inside Matches) */}
                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="bg-[#ccff00] text-black font-mono text-xs font-black px-4 py-2 border-2 border-black shadow-[3px_3px_0px_#a855f7] hover:bg-white hover:translate-x-0.5 hover:translate-y-0.5 transition-all uppercase flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-black" />
                    <span>START CHAT</span>
                  </button>
                </div>
              </BrutalistCard>
            ))}
          </div>

        </div>
      ) : (

        /* ========================================================================= */
        /* OPTION B: ACTIVE CHAT & MUTUAL UNMASKING TUNNEL (Merged inside Matches) */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col justify-between space-y-3 animate-in fade-in">
          
          <div>
            {/* Top Navigation Row: Back to Match List (Clicking it shows Matches segment) */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#222]">
              <button
                onClick={() => setSelectedMatch(null)}
                className="font-mono text-xs text-[#ccff00] hover:text-white font-black flex items-center gap-1.5 transition-colors uppercase tracking-wider bg-[#161616] border border-[#333] px-2.5 py-1"
                title="Return to Matches List"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>← MATCH LIST ({matchesList.length})</span>
              </button>

              <div className="font-mono text-[10px] text-gray-400 flex items-center gap-1.5">
                <span>@{selectedMatch.handle}</span>
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              </div>
            </div>

            {/* 1. TOP FRAME: MUTUAL IDENTITY UNMASKING (Clickable 3-Layer Trigger) */}
            <div 
              onClick={() => {
                if (revealStage >= 3) {
                  setShowDecryptedModal(true);
                } else {
                  setShowUnmaskModal(true);
                }
              }}
              className="bg-[#121212] border-2 border-[#a855f7] p-3.5 brutalist-shadow-purple cursor-pointer hover:border-[#ccff00] transition-colors group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs font-black text-white tracking-wider uppercase">
                  MUTUAL IDENTITY UNMASKING
                </span>
                <span className="font-mono text-[10px] bg-[#a855f7] text-black font-bold px-2 py-0.5 uppercase">
                  STAGE {revealStage}/3
                </span>
              </div>

              {/* Progress 3-Stage Indicator */}
              <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                <div className={`h-1.5 transition-colors ${revealStage >= 1 ? 'bg-[#ccff00]' : 'bg-[#2a2a2a]'}`} />
                <div className={`h-1.5 transition-colors ${revealStage >= 2 ? 'bg-[#ccff00]' : 'bg-[#2a2a2a]'}`} />
                <div className={`h-1.5 transition-colors ${revealStage >= 3 ? 'bg-[#ccff00]' : 'bg-[#2a2a2a]'}`} />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-[#ccff00] group-hover:underline">
                  <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span>
                    {revealStage === 0 && "Tap to start 3-Layer Identity Unmasking →"}
                    {revealStage === 1 && "Layer 1 Unlocked: Tap for Layer 2 Resonance →"}
                    {revealStage === 2 && "Layer 2 Unlocked: Tap for Full Identity Decryption →"}
                    {revealStage >= 3 && "Identity Decrypted: View Full Verified Profile →"}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#ccff00] transition-colors" />
              </div>
            </div>
          </div>

          {/* 2. CHATS BELOW: Message Stream */}
          <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 min-h-[260px]">
            {/* System Announcement */}
            <div className="text-center my-2">
              <span className="font-mono text-[10px] text-gray-400 bg-[#161616] px-3 py-1 border border-[#222]">
                Encrypted Topic Tunnel initiated. Topic: {selectedMatch.topics[0]}. Match Rate: {selectedMatch.compatibility}%.
              </span>
            </div>

            {/* Peer Initial Message */}
            {selectedMatch.firstPeerMessage && (
              <div className="flex flex-col items-start">
                <div className="font-mono text-[9px] text-gray-500 mb-0.5 px-1">
                  @{selectedMatch.handle} • 4:42
                </div>
                <div className="max-w-[85%] p-3 text-xs font-sans leading-relaxed border bg-[#181524] border-[#a855f7] text-[#e5e2e1] shadow-[2px_2px_0px_#a855f7]">
                  {selectedMatch.firstPeerMessage}
                </div>
                <div className="font-mono text-[8px] text-gray-600 mt-0.5 px-1">
                  Ephemeral expiry: ~5m
                </div>
              </div>
            )}

            {/* My Initial Message */}
            {selectedMatch.firstMyMessage && (
              <div className="flex flex-col items-end">
                <div className="font-mono text-[9px] text-gray-500 mb-0.5 px-1">
                  You • 4:45
                </div>
                <div className="max-w-[85%] p-3 text-xs font-sans leading-relaxed border bg-[#1a2414] border-[#ccff00] text-white shadow-[2px_2px_0px_#ccff00]">
                  {selectedMatch.firstMyMessage}
                </div>
                <div className="font-mono text-[8px] text-gray-600 mt-0.5 px-1">
                  Ephemeral expiry: ~5m
                </div>
              </div>
            )}

            {/* Dynamic Store Chat Messages */}
            {chatMessages.filter(m => m.sender !== 'system').map(msg => {
              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="font-mono text-[9px] text-gray-500 mb-0.5 px-1">
                    {isMe ? 'You' : `@${selectedMatch.handle}`} • {msg.timestamp}
                  </div>
                  <div
                    className={`max-w-[85%] p-3 text-xs font-sans leading-relaxed border ${
                      isMe
                        ? 'bg-[#1a2414] border-[#ccff00] text-white shadow-[2px_2px_0px_#ccff00]'
                        : 'bg-[#181524] border-[#a855f7] text-[#e5e2e1] shadow-[2px_2px_0px_#a855f7]'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.expiresInSeconds && (
                    <div className="font-mono text-[8px] text-gray-600 mt-0.5 px-1">
                      Ephemeral expiry: ~5m
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. Message Input Form (Matching Image 2 with yellow/lime send button) */}
          <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-[#262626]">
            <input
              type="text"
              placeholder="Send encrypted debate point..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 bg-[#161616] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2 font-mono text-xs text-white outline-none rounded-none"
            />
            <button
              type="submit"
              className="bg-[#ccff00] hover:bg-white text-black p-2.5 border-2 border-black shadow-[2px_2px_0px_#a855f7] transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </form>

        </div>
      )}

      {/* 3-Step Mutual Unmasking Protocol Modal */}
      <MutualUnmaskingModal
        isOpen={showUnmaskModal}
        onClose={() => setShowUnmaskModal(false)}
        onFullReveal={() => {
          setShowUnmaskModal(false);
          setShowDecryptedModal(true);
        }}
        currentStage={revealStage}
        onAdvanceStage={advanceReveal}
        partner={partner}
      />

      {/* Final Identity Decrypted Screen-Frame Modal */}
      <IdentityDecryptedModal
        isOpen={showDecryptedModal}
        onClose={() => setShowDecryptedModal(false)}
        partner={partner}
      />

    </div>
  );
};
