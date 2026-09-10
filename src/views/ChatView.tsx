import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { 
  Send, 
  Lock, 
  Unlock, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight,
  MessageSquare, 
  Clock, 
  Shield, 
  Search, 
  Zap,
  Users
} from 'lucide-react';
import { IdentityDecryptedModal } from '../components/ui/IdentityDecryptedModal';
import { MutualUnmaskingModal } from '../components/ui/MutualUnmaskingModal';

interface MatchChannel {
  id: string;
  handle: string;
  topic: string;
  compatibility: number;
  unmaskStage: number;
  lastMessage: string;
  lastActive: string;
  isOnline: boolean;
  avatarSeed: string;
}

export const ChatView: React.FC = () => {
  const { 
    chatMessages, 
    partner, 
    sendChatMessage, 
    revealStage, 
    advanceReveal, 
    isGuest,
    resetToBeforeRegister,
    matches,
    activeMatchId,
    setActiveMatchId
  } = useApp();

  const [input, setInput] = useState('');
  const [showUnmaskModal, setShowUnmaskModal] = useState(false);
  const [showDecryptedModal, setShowDecryptedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected match for chat frame (null = Match List Inbox)
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(activeMatchId || (matches?.[0]?.id) || 'cipher_vanguard');

  const fallbackChannels: MatchChannel[] = [
    {
      id: 'cipher_vanguard',
      handle: 'cipher_vanguard',
      topic: 'AI Layoffs vs Reality',
      compatibility: 94,
      unmaskStage: revealStage,
      lastMessage: 'Most people blaming AI for headcount cuts are ignoring margin compressions in cloud infra.',
      lastActive: 'Active now',
      isOnline: true,
      avatarSeed: 'cipher'
    },
    {
      id: 'neon_nomad_88',
      handle: 'neon_nomad_88',
      topic: 'Office Politics & Reorgs',
      compatibility: 91,
      unmaskStage: 1,
      lastMessage: 'Middle management was completely restructured last Tuesday.',
      lastActive: '12m ago',
      isOnline: true,
      avatarSeed: 'neon'
    },
    {
      id: 'kernel_panic',
      handle: 'kernel_panic',
      topic: 'Startup Burn Rate 2026',
      compatibility: 88,
      unmaskStage: 0,
      lastMessage: 'VCs are demanding 80% gross margins on agentic architectures.',
      lastActive: '45m ago',
      isOnline: false,
      avatarSeed: 'kernel'
    },
    {
      id: 'stealth_whistle',
      handle: 'stealth_whistle',
      topic: 'Stealth Whistleblowing',
      compatibility: 85,
      unmaskStage: 0,
      lastMessage: 'Did you see the internal security audit leak this morning?',
      lastActive: '2h ago',
      isOnline: false,
      avatarSeed: 'stealth'
    }
  ];

  const matchChannels: MatchChannel[] = matches && matches.length > 0
    ? matches.map(m => ({
        id: m.id,
        handle: m.handle,
        topic: m.topics?.[0] || 'AI Layoffs vs Reality',
        compatibility: m.compatibility || 94,
        unmaskStage: m.unmaskStage || revealStage,
        lastMessage: m.lastMessage || 'Active topic tunnel established.',
        lastActive: m.lastActive || 'Active now',
        isOnline: true,
        avatarSeed: m.avatarSeed || 'cipher'
      }))
    : fallbackChannels;

  if (isGuest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0e0e0e] text-center space-y-5 min-h-[500px]">
        <div className="w-16 h-16 bg-[#1a1726] border-2 border-[#a855f7] flex items-center justify-center text-[#ccff00] shadow-[4px_4px_0px_#a855f7]">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-xs">
          <BrutalistBadge variant="purple">GUEST RESTRICTION</BrutalistBadge>
          <h3 className="font-serif text-2xl font-black text-white mt-1">Encrypted Chat Locked</h3>
          <p className="font-sans text-xs text-gray-400 leading-relaxed">
            1-on-1 encrypted topic tunnels and progressive unmasking are reserved for verified accounts.
          </p>
        </div>
        <BrutalistButton
          variant="primary"
          size="md"
          onClick={() => resetToBeforeRegister()}
          className="flex items-center gap-1.5 font-bold"
        >
          <Sparkles className="w-4 h-4 text-black" />
          CREATE ACCOUNT TO UNLOCK
        </BrutalistButton>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatMessage(input);
    setInput('');
  };

  const selectedChannel = matchChannels.find(m => m.id === selectedMatchId) || matchChannels[0];

  const filteredChannels = matchChannels.filter(c => 
    c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-[#0e0e0e] min-h-[640px] select-none">
      
      {/* ========================================================================= */}
      {/* OPTION A: MATCH LIST INBOX (When selectedMatchId === null) */}
      {/* ========================================================================= */}
      {selectedMatchId === null ? (
        <div className="space-y-4 animate-in fade-in flex-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#262626] pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5 text-[#ccff00]" />
                <BrutalistBadge variant="lime">ENCRYPTED INBOX</BrutalistBadge>
              </div>
              <h2 className="font-serif text-2xl font-black text-white">Matched Conversations</h2>
              <p className="font-mono text-xs text-gray-400">Select any mutual topic match to enter their encrypted tunnel</p>
            </div>

            <span className="font-mono text-xs bg-[#1a1726] border border-[#a855f7] text-[#ddb7ff] px-2.5 py-1 font-bold">
              {matchChannels.length} ACTIVE
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search matched topics or handles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border-2 border-[#333] focus:border-[#ccff00] pl-9 pr-3 py-2 font-mono text-xs text-white outline-none"
            />
          </div>

          {/* Match Channels List */}
          <div className="space-y-2.5">
            {filteredChannels.map(channel => (
              <div
                key={channel.id}
                onClick={() => {
                  setSelectedMatchId(channel.id);
                  setActiveMatchId(channel.id);
                }}
                className="bg-[#141414] border-2 border-[#262626] hover:border-[#ccff00] p-3.5 space-y-2 cursor-pointer transition-all shadow-[2px_2px_0px_#111] hover:shadow-[4px_4px_0px_#a855f7] group"
              >
                {/* Channel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar Mask */}
                    <div className="w-9 h-9 bg-[#1b1726] border-2 border-[#a855f7] group-hover:border-[#ccff00] flex items-center justify-center font-serif font-black text-sm text-[#ccff00]">
                      {channel.handle.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-bold text-sm text-white group-hover:text-[#ccff00] transition-colors">
                          @{channel.handle}
                        </span>
                        {channel.isOnline && (
                          <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">
                        Topic: <strong className="text-[#ddb7ff]">#{channel.topic}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Match Stats & Stage */}
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#ccff00] block">
                      {channel.compatibility}% MATCH
                    </span>
                    <span className="font-mono text-[9px] bg-[#1e1e1e] border border-[#333] text-gray-300 px-1.5 py-0.5 uppercase">
                      STAGE {channel.unmaskStage}/3
                    </span>
                  </div>
                </div>

                {/* Last Message Snippet */}
                <div className="bg-[#0e0e0e] p-2 border border-[#222] font-sans text-xs text-gray-300 truncate">
                  "{channel.lastMessage}"
                </div>

                {/* Footer Active Time & Action */}
                <div className="flex items-center justify-between font-mono text-[10px] text-gray-500 pt-0.5">
                  <span>{channel.lastActive}</span>
                  <span className="text-[#ccff00] font-bold group-hover:underline flex items-center gap-1">
                    ENTER ENCRYPTED TUNNEL <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (

        /* ========================================================================= */
        /* OPTION B: ACTIVE CHAT FRAME (As shown in screenshot) */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col justify-between space-y-3 animate-in fade-in">
          
          <div>
            {/* Top Navigation Row: Back to Match List */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#222]">
              <button
                onClick={() => setSelectedMatchId(null)}
                className="font-mono text-xs text-[#ccff00] hover:text-white font-bold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>MATCH LIST ({matchChannels.length})</span>
              </button>

              <div className="font-mono text-[10px] text-gray-400 flex items-center gap-1.5">
                <span>@{selectedChannel.handle}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
              </div>
            </div>

            {/* 1. TOP FRAME: MUTUAL IDENTITY UNMASKING (Clickable 3-Layer Trigger) */}
            <div 
              onClick={() => setShowUnmaskModal(true)}
              className="bg-[#141414] border-2 border-[#2a2a2a] hover:border-[#ccff00] p-3.5 space-y-2.5 shadow-[4px_4px_0px_#a855f7] cursor-pointer transition-all group"
            >
              {/* Header Title + Stage Badge */}
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-200 font-bold uppercase tracking-wider group-hover:text-[#ccff00] transition-colors">
                  MUTUAL IDENTITY UNMASKING
                </span>
                <span className="font-mono text-xs bg-[#a855f7] text-black px-2.5 py-0.5 font-bold uppercase">
                  STAGE {revealStage}/3
                </span>
              </div>

              {/* 3 Progress Bars */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className={`h-1.5 ${revealStage >= 1 ? 'bg-[#ccff00]' : 'bg-[#262626]'}`} />
                <div className={`h-1.5 ${revealStage >= 2 ? 'bg-[#ccff00]' : 'bg-[#262626]'}`} />
                <div className={`h-1.5 ${revealStage >= 3 ? 'bg-[#ccff00]' : 'bg-[#262626]'}`} />
              </div>

              {/* Action Prompt */}
              <div className="flex items-center justify-between font-mono text-[11px] text-gray-400 pt-0.5">
                <span className="text-[#ccff00] font-bold group-hover:underline flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#ccff00]" />
                  {revealStage === 0 && "Tap to start 3-Layer Identity Unmasking →"}
                  {revealStage === 1 && "Layer 1 unlocked. Tap for Layer 2 →"}
                  {revealStage === 2 && "Layer 2 unlocked. Tap for Final Decryption →"}
                  {revealStage === 3 && "✓ All Layers Unlocked. Tap to View Decrypted ID →"}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#ccff00] transition-colors" />
              </div>
            </div>
          </div>

          {/* 2. CHATS BELOW: Message Stream */}
          <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 min-h-[280px]">
            {chatMessages.map(msg => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="font-mono text-[10px] text-gray-500 bg-[#161616] px-3 py-1 border border-[#222]">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="font-mono text-[9px] text-gray-500 mb-0.5 px-1">
                    {isMe ? 'You' : selectedChannel.handle} • {msg.timestamp}
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
                    <div className="font-mono text-[8px] text-gray-600 mt-0.5">
                      Ephemeral expiry: ~5m
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. Message Input Form */}
          <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-[#262626]">
            <input
              type="text"
              placeholder="Send encrypted debate point..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-[#161616] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2 font-mono text-xs text-white outline-none rounded-none"
            />
            <BrutalistButton variant="primary" size="md" type="submit">
              <Send className="w-3.5 h-3.5 text-black" />
            </BrutalistButton>
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
