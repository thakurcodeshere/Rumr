import React, { useState } from 'react';
import { 
  Radio, 
  Mic, 
  MicOff, 
  Volume2, 
  Users, 
  ArrowLeft, 
  Send, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  X, 
  Hand,
  TrendingUp,
  Zap,
  Lock,
  Compass
} from 'lucide-react';
import { Topic } from '../../types';
import { BrutalistButton } from './BrutalistButton';
import { BrutalistBadge } from './BrutalistBadge';

interface TopicChatRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
}

interface RoomMessage {
  id: string;
  sender: string;
  isHost?: boolean;
  isMe?: boolean;
  text: string;
  timestamp: string;
  stance?: 'agree' | 'debate';
}

export const TopicChatRoomModal: React.FC<TopicChatRoomModalProps> = ({
  isOpen,
  onClose,
  topic
}) => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const [messages, setMessages] = useState<RoomMessage[]>([
    {
      id: 'm-1',
      sender: 'cipher_vanguard',
      isHost: true,
      text: 'Welcome everyone. This room is gated to users with verified interest in this domain.',
      timestamp: '14:02'
    },
    {
      id: 'm-2',
      sender: 'neo_contrarian',
      stance: 'debate',
      text: 'The mainstream narrative ignores the underlying compute cost dynamics.',
      timestamp: '14:03'
    },
    {
      id: 'm-3',
      sender: 'logic_gate_99',
      stance: 'agree',
      text: 'Agreed. The real bottleneck is executive prioritization, not tooling.',
      timestamp: '14:04'
    }
  ]);

  if (!isOpen || !topic) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: RoomMessage = {
      id: 'm-' + Date.now(),
      sender: 'anonymous_ghost_42',
      isMe: true,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  const handleSendQuickReaction = (reaction: string) => {
    setActiveReaction(reaction);
    setTimeout(() => setActiveReaction(null), 1500);

    const newMsg: RoomMessage = {
      id: 'm-' + Date.now(),
      sender: 'anonymous_ghost_42',
      isMe: true,
      text: `[Reaction: ${reaction}]`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const audienceProfile = topic.category === 'Tech'
    ? 'Engineers, AI Researchers & Tech Founders (≥85% Match)'
    : topic.category === 'Workplace'
    ? 'Corporate Professionals, HR Whistleblowers & Executives'
    : topic.category === 'Startups'
    ? 'Founders, Angel Investors & Early Stage Builders'
    : topic.category === 'Social'
    ? 'Contrarian Thinkers & Sociological Analysts'
    : 'Verified High-Chaos Debate Personas';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in select-none">
      <div className="bg-[#0e0e0e] border-4 border-[#ccff00] w-full max-w-xl flex flex-col shadow-[8px_8px_0px_#a855f7] overflow-hidden text-left relative max-h-[92vh]">
        
        {/* Top Room Banner */}
        <div className="bg-[#14121f] border-b-2 border-[#262626] p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#ccff00] text-black font-serif font-black text-base flex items-center justify-center border border-black shadow-[2px_2px_0px_#a855f7]">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
                <span className="font-mono text-xs text-[#ccff00] font-black uppercase tracking-wider">
                  LIVE TOPIC ROOM // {topic.category}
                </span>
                <span className="font-mono text-[9px] bg-[#a855f7] text-black font-bold px-1 py-0.5">
                  {topic.heatScore}° HEAT
                </span>
              </div>
              <h2 className="font-serif text-base sm:text-lg font-black text-white truncate max-w-[280px] sm:max-w-md">
                {topic.title}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white bg-[#181818] border border-[#333]"
            title="Leave Topic Room"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audience & Gate Specification Ribbon */}
        <div className="bg-[#181818] border-b border-[#2a2a2a] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Users className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Audience: <strong className="text-white">{audienceProfile}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-[#ccff00] font-bold">🟢 38 Active Debaters</span>
            <span>•</span>
            <span>Max Cap: 50</span>
          </div>
        </div>

        {/* Audio Stage / Speaker Podiums */}
        <div className="p-3.5 bg-[#0a0a0a] border-b border-[#222] space-y-2.5">
          <div className="flex items-center justify-between font-mono text-[10px] text-gray-400">
            <div className="flex items-center gap-1 uppercase font-bold text-[#a855f7]">
              <Radio className="w-3 h-3 text-[#ccff00] animate-pulse" />
              <span>LIVE AUDIO STAGE & SPEAKERS</span>
            </div>
            <span>Spatial WebRTC Mesh</span>
          </div>

          {/* Speakers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Host */}
            <div className="bg-[#141d0e] border-2 border-[#ccff00] p-2 flex flex-col justify-between shadow-[2px_2px_0px_#ccff00]">
              <div className="flex justify-between items-center mb-1">
                <span className="bg-[#ccff00] text-black font-mono text-[8px] font-black px-1">HOST</span>
                <Mic className="w-3 h-3 text-[#ccff00] animate-pulse" />
              </div>
              <div className="font-serif font-bold text-xs text-white truncate">cipher_vanguard</div>
              <div className="font-mono text-[9px] text-[#ccff00]">Speaking (Live)</div>
            </div>

            {/* Speaker 2 */}
            <div className="bg-[#181524] border border-[#a855f7] p-2 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="bg-[#a855f7] text-black font-mono text-[8px] font-black px-1">DEBATER</span>
                <Mic className="w-3 h-3 text-[#ddb7ff]" />
              </div>
              <div className="font-serif font-bold text-xs text-white truncate">neo_contrarian</div>
              <div className="font-mono text-[9px] text-gray-400">Resonance 91%</div>
            </div>

            {/* Speaker 3 */}
            <div className="bg-[#141414] border border-[#333] p-2 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="bg-[#2a2a2a] text-gray-300 font-mono text-[8px] font-bold px-1">STAGE</span>
                <MicOff className="w-3 h-3 text-gray-500" />
              </div>
              <div className="font-serif font-bold text-xs text-white truncate">logic_gate_99</div>
              <div className="font-mono text-[9px] text-gray-400">Muted</div>
            </div>

            {/* You */}
            <div className={`p-2 flex flex-col justify-between border-2 ${
              isMicActive 
                ? 'bg-[#141d0e] border-[#ccff00] shadow-[2px_2px_0px_#a855f7]'
                : 'bg-[#141414] border-[#333]'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className="bg-white text-black font-mono text-[8px] font-black px-1">YOU</span>
                {isMicActive ? (
                  <Mic className="w-3 h-3 text-[#ccff00] animate-pulse" />
                ) : (
                  <MicOff className="w-3 h-3 text-gray-500" />
                )}
              </div>
              <div className="font-serif font-bold text-xs text-white truncate">anonymous_ghost_42</div>
              <div className="font-mono text-[9px] text-gray-400">
                {isMicActive ? 'Mic Active' : 'Audience Listener'}
              </div>
            </div>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setIsMicActive(!isMicActive)}
              className={`flex-1 py-2 px-3 font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 border-2 transition-all ${
                isMicActive
                  ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[2px_2px_0px_#a855f7]'
                  : 'bg-[#181818] text-gray-300 border-[#333] hover:text-white hover:border-white'
              }`}
            >
              {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
              <span>{isMicActive ? 'SPEAKING (LIVE)' : 'UNMUTE MIC TO SPEAK'}</span>
            </button>

            <button
              onClick={() => setIsHandRaised(!isHandRaised)}
              className={`py-2 px-3 font-mono text-xs font-bold uppercase flex items-center gap-1 border-2 transition-all ${
                isHandRaised
                  ? 'bg-[#a855f7] text-black border-[#a855f7]'
                  : 'bg-[#181818] text-gray-400 border-[#333] hover:text-white'
              }`}
              title="Raise hand to request stage mic"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>{isHandRaised ? 'HAND RAISED' : 'RAISE HAND'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Ephemeral Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 max-h-56 sm:max-h-64">
          <div className="text-center">
            <span className="font-mono text-[9px] text-gray-500 bg-[#161616] px-2.5 py-0.5 border border-[#222]">
              ENCRYPTED TOPIC CHAT TUNNEL • EPHEMERAL DECAY ~5M
            </span>
          </div>

          {messages.map(msg => {
            const isMe = msg.isMe;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="font-mono text-[9px] text-gray-500 mb-0.5 flex items-center gap-1">
                  <span>{isMe ? 'You (@ghost_42)' : `@${msg.sender}`}</span>
                  {msg.isHost && (
                    <span className="bg-[#ccff00] text-black font-bold px-1 text-[8px]">HOST</span>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                <div className={`p-2.5 text-xs font-sans max-w-[85%] border leading-relaxed ${
                  isMe
                    ? 'bg-[#1a2414] border-[#ccff00] text-white shadow-[2px_2px_0px_#ccff00]'
                    : msg.stance === 'debate'
                    ? 'bg-[#221313] border-red-500/70 text-gray-200 shadow-[2px_2px_0px_rgba(239,68,68,0.3)]'
                    : 'bg-[#181524] border-[#a855f7] text-[#e5e2e1] shadow-[2px_2px_0px_#a855f7]'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Reaction Bar */}
        <div className="px-3.5 py-1.5 bg-[#121212] border-t border-[#222] flex items-center gap-1.5 overflow-x-auto">
          <span className="font-mono text-[9px] text-gray-400 font-bold uppercase shrink-0">REACT:</span>
          {['🔥 AGREE', '⚡ CONTRARIAN', '💡 DATA BACKED', '❌ SKEPTIC', '🎯 PINPOINT'].map(tag => (
            <button
              key={tag}
              onClick={() => handleSendQuickReaction(tag)}
              className="font-mono text-[10px] px-2 py-0.5 bg-[#1a1a1a] border border-[#333] hover:border-[#ccff00] text-gray-300 hover:text-white shrink-0 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Bottom Message Input Form */}
        <div className="p-3 bg-[#0a0a0a] border-t-2 border-[#262626]">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Transmit live topic argument / thought..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 bg-[#161616] border-2 border-[#333] focus:border-[#ccff00] px-3 py-2 font-mono text-xs text-white outline-none"
            />
            <BrutalistButton variant="primary" size="md" type="submit">
              <Send className="w-3.5 h-3.5 text-black" />
            </BrutalistButton>
          </form>
        </div>

      </div>
    </div>
  );
};
