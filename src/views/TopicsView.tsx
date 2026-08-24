import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { RumorBlurOverlay } from '../components/ui/RumorBlurOverlay';
import { 
  Compass, 
  Plus, 
  Users, 
  Flame, 
  Check, 
  Search, 
  MessageSquare, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  SlidersHorizontal,
  X,
  Target,
  ThumbsUp
} from 'lucide-react';
import { Topic, RumorPost } from '../types';
import { TopicChatRoomModal } from '../components/ui/TopicChatRoomModal';

export const TopicsView: React.FC = () => {
  const { 
    topics, 
    rumors,
    toggleSubscribeTopic, 
    createCustomTopic, 
    toggleRumorAgree,
    toggleRumorDebate,
    decryptRumor,
    navigate, 
    setActiveTopic 
  } = useApp();

  // Primary Segment Switcher inside Topics: 'matrix' vs 'discussions'
  const [topicSegment, setTopicSegment] = useState<'matrix' | 'discussions'>('matrix');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Custom Topic Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Topic['category']>('Tech');
  const [newDesc, setNewDesc] = useState('');
  const [newCapacity, setNewCapacity] = useState<number>(50);
  const [newAudience, setNewAudience] = useState<string>('similar_profile');
  const [newDebateMode, setNewDebateMode] = useState<string>('audio_chat');
  const [titleError, setTitleError] = useState<string | null>(null);

  // Active Chat Room State
  const [activeRoomTopic, setActiveRoomTopic] = useState<Topic | null>(null);

  const categories = ['All', 'Tech', 'Workplace', 'Startups', 'Social', 'Spicy'];

  const filteredTopics = topics.filter(t => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredRumors = rumors.filter(r => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesSearch = r.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const words = newTitle.trim().split(/\s+/);
    if (words.length > 3) {
      setTitleError('Hard Constraint: Topic title must be ≤ 3 words.');
      return;
    }
    setTitleError(null);

    createCustomTopic(newTitle.trim(), newCategory, newDesc || 'Community debate node initiated with gated audience resonance.');
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  const getAudienceLabel = (category: string) => {
    switch (category) {
      case 'Tech':
        return 'Engineers, AI Researchers & Tech Founders (≥85% Match)';
      case 'Workplace':
        return 'Corporate Professionals, HR Whistleblowers & Executives';
      case 'Startups':
        return 'Founders, Angel Investors & Early Stage Builders';
      case 'Social':
        return 'Contrarian Thinkers & Sociological Analysts';
      default:
        return 'Verified High-Resonance Profiles';
    }
  };

  return (
    <div className="p-3 sm:p-4 space-y-5">
      
      {/* Header & Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-black text-white">Topics & Rumrs</h2>
          <p className="font-mono text-xs text-gray-400">Explore topics and rooms, and decrypt verified rumrs and whispr</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#ccff00] text-black font-mono text-xs font-black px-3.5 py-2 border-2 border-black shadow-[3px_3px_0px_#a855f7] hover:bg-white hover:translate-x-0.5 hover:translate-y-0.5 transition-all uppercase flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>+ NEW TOPIC</span>
        </button>
      </div>

      {/* Segment Switcher inside Topics Tab */}
      <div className="flex gap-2 border-b border-[#262626] pb-2">
        <button
          onClick={() => setTopicSegment('matrix')}
          className={`font-mono text-xs font-black uppercase px-3.5 py-2 border-2 transition-all flex items-center gap-1.5 ${
            topicSegment === 'matrix'
              ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#a855f7]'
              : 'bg-[#161616] text-gray-400 border-[#333] hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>TOPICS AND ROOMS ({filteredTopics.length})</span>
        </button>

        <button
          onClick={() => setTopicSegment('discussions')}
          className={`font-mono text-xs font-black uppercase px-3.5 py-2 border-2 transition-all flex items-center gap-1.5 ${
            topicSegment === 'discussions'
              ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#a855f7]'
              : 'bg-[#161616] text-gray-400 border-[#333] hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>RUMRS AND WHISPR ({filteredRumors.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search debate nodes, whistleblows, rumors..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-[#161616] border-2 border-[#333] focus:border-[#ccff00] pl-9 pr-4 py-2.5 font-mono text-xs text-white outline-none"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`font-mono text-xs px-3 py-1 border uppercase font-bold shrink-0 transition-colors ${
              selectedCategory === cat
                ? 'bg-[#a855f7] text-black border-[#a855f7]'
                : 'bg-[#181818] text-gray-400 border-[#333] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: TOPIC MATRIX GRID */}
      {/* ========================================================================= */}
      {topicSegment === 'matrix' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
          {filteredTopics.map(topic => (
            <BrutalistCard key={topic.id} isHot={topic.isHot} className="flex flex-col justify-between space-y-3.5 p-4 sm:p-5">
              <div>
                {/* Category & Heat */}
                <div className="flex justify-between items-center mb-2">
                  <BrutalistBadge variant="purple">{topic.category}</BrutalistBadge>
                  <div className="flex items-center gap-1 text-[#ccff00] font-mono text-xs font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{topic.heatScore}° HEAT</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-serif text-lg font-bold text-white mb-1.5">
                  {topic.title}
                </h3>
                <p className="text-xs font-sans text-gray-300 leading-relaxed">
                  {topic.description}
                </p>

                {/* Chat Room Audience Details Ribbon */}
                <div className="mt-3 bg-[#0d0d0d] border border-[#222] p-2 space-y-1 font-mono text-[10px]">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Target className="w-3 h-3 text-[#ccff00] shrink-0" />
                    <span className="truncate">Audience: <strong className="text-white">{getAudienceLabel(topic.category)}</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-1 text-[#a855f7]">
                      <Users className="w-3 h-3" />
                      <span>{topic.debaterCount} Debaters</span>
                    </span>
                    <span className="text-[#ccff00] font-bold">🟢 38 Live in Room (Cap: 50)</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row: SUBSCRIBE + ENTER CHAT ROOM */}
              <div className="pt-3 border-t border-[#222] flex items-center justify-between gap-2">
                
                {/* Subscribe Button */}
                <BrutalistButton
                  variant={topic.isSubscribed ? 'ghost' : 'primary'}
                  size="sm"
                  onClick={() => toggleSubscribeTopic(topic.id)}
                  className="flex-1 justify-center text-[11px]"
                >
                  {topic.isSubscribed ? (
                    <>
                      <Check className="w-3 h-3 text-[#ccff00]" /> Subscribed
                    </>
                  ) : (
                    '+ Subscribe'
                  )}
                </BrutalistButton>

                {/* ENTER CHAT ROOM BUTTON (Beside Subscribe) */}
                <button
                  onClick={() => setActiveRoomTopic(topic)}
                  className="flex-1 bg-[#161324] hover:bg-[#a855f7] text-[#ccff00] hover:text-black border-2 border-[#a855f7] hover:border-[#ccff00] py-2 px-2.5 font-mono text-[11px] font-black uppercase transition-all shadow-[2px_2px_0px_#ccff00] flex items-center justify-center gap-1.5 group"
                  title="Enter Live Topic Chat & Audio Debate Room"
                >
                  <Radio className="w-3.5 h-3.5 text-[#ccff00] group-hover:text-black animate-pulse" />
                  <span>ENTER CHAT ROOM</span>
                </button>

              </div>
            </BrutalistCard>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TOPIC DISCUSSIONS & VERIFIED WHISPERS (Integrated from Discover) */}
      {/* ========================================================================= */}
      {topicSegment === 'discussions' && (
        <div className="space-y-4 animate-in fade-in">
          {filteredRumors.map(rumor => (
            <BrutalistCard key={rumor.id} isHot={rumor.matchRate > 90} className="space-y-3.5 p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BrutalistBadge variant="lime">{rumor.category}</BrutalistBadge>
                    <span className="font-mono text-[10px] text-gray-500">{rumor.timestamp}</span>
                  </div>
                  <h4 
                    onClick={() => {
                      const matchedTopic = topics.find(t => t.id === rumor.topicId);
                      if (matchedTopic) setActiveRoomTopic(matchedTopic);
                    }}
                    className="font-serif text-lg font-bold text-white hover:text-[#ccff00] cursor-pointer transition-colors"
                  >
                    #{rumor.topicTitle}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-[#ccff00]">{rumor.matchRate}%</div>
                  <div className="font-mono text-[9px] text-gray-500 uppercase">RESONANCE</div>
                </div>
              </div>

              {/* Cryptographic Blur to Text Reveal Overlay */}
              <RumorBlurOverlay
                isEncrypted={rumor.isEncrypted}
                content={rumor.content}
                encryptedContent={rumor.encryptedContent}
                onDecrypt={() => decryptRumor(rumor.id)}
              />

              {/* Interactions Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-[#222]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleRumorAgree(rumor.id)}
                    className="flex items-center gap-1 font-mono text-xs text-gray-400 hover:text-[#ccff00] transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{rumor.agrees} Agrees</span>
                  </button>
                  <button
                    onClick={() => toggleRumorDebate(rumor.id)}
                    className="flex items-center gap-1 font-mono text-xs text-gray-400 hover:text-[#a855f7] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{rumor.debates} Debates</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    const matchedTopic = topics.find(t => t.id === rumor.topicId) || {
                      id: rumor.topicId,
                      title: rumor.topicTitle,
                      category: rumor.category as any,
                      debaterCount: rumor.debates * 12,
                      heatScore: rumor.matchRate,
                      matchRate: rumor.matchRate,
                      description: rumor.content
                    };
                    setActiveRoomTopic(matchedTopic);
                  }}
                  className="bg-[#181818] border-2 border-[#333] hover:border-[#ccff00] text-gray-300 hover:text-[#ccff00] px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#a855f7]"
                >
                  <Radio className="w-3 h-3 text-[#ccff00]" />
                  <span>JOIN TOPIC ROOM</span>
                </button>
              </div>
            </BrutalistCard>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CREATE CUSTOM TOPIC NODE MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
          <div className="bg-[#0e0e0e] border-4 border-[#ccff00] p-5 sm:p-6 max-w-lg w-full shadow-[8px_8px_0px_#a855f7] space-y-4 max-h-[90vh] overflow-y-auto text-left">
            
            <div className="flex justify-between items-start border-b border-[#222] pb-3">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-white">Create Custom Topic Node</h3>
                <p className="font-mono text-xs text-gray-400 mt-1">
                  All created nodes are validated by the AI Toxicity Sentinel.
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              
              {/* TOPIC TITLE */}
              <div>
                <label className="font-mono text-xs text-[#ccff00] font-bold block mb-1">
                  TOPIC TITLE (≤ 3 WORDS)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI Agent Wrapper Bubble"
                  value={newTitle}
                  onChange={e => {
                    setNewTitle(e.target.value);
                    if (titleError) setTitleError(null);
                  }}
                  className="w-full bg-[#181818] border-2 border-[#333] focus:border-[#ccff00] p-2.5 font-mono text-xs text-white outline-none"
                  required
                />
                {titleError && (
                  <span className="text-red-400 font-mono text-[10px] block mt-1">{titleError}</span>
                )}
              </div>

              {/* CATEGORY */}
              <div>
                <label className="font-mono text-xs text-[#ccff00] font-bold block mb-1">CATEGORY</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as Topic['category'])}
                  className="w-full bg-[#181818] border-2 border-[#333] focus:border-[#ccff00] p-2.5 font-mono text-xs text-white outline-none"
                >
                  <option value="Tech">Tech</option>
                  <option value="Workplace">Workplace</option>
                  <option value="Startups">Startups</option>
                  <option value="Social">Social</option>
                  <option value="Spicy">Spicy</option>
                </select>
              </div>

              {/* CHAT ROOM CAPACITY & LIMIT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs text-[#ccff00] font-bold block mb-1">
                    ROOM CAPACITY
                  </label>
                  <select
                    value={newCapacity}
                    onChange={e => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-[#181818] border-2 border-[#333] focus:border-[#ccff00] p-2 font-mono text-xs text-white outline-none"
                  >
                    <option value={12}>12 Slots (Speed 1-on-1 Focus)</option>
                    <option value={25}>25 Slots (Roundtable Debate)</option>
                    <option value={50}>50 Slots (Standard Public Room)</option>
                    <option value={100}>100 Slots (Mega Stage Broadcast)</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-xs text-[#ccff00] font-bold block mb-1">
                    DEBATE FORMAT
                  </label>
                  <select
                    value={newDebateMode}
                    onChange={e => setNewDebateMode(e.target.value)}
                    className="w-full bg-[#181818] border-2 border-[#333] focus:border-[#ccff00] p-2 font-mono text-xs text-white outline-none"
                  >
                    <option value="audio_chat">Live Audio Stage + Chat</option>
                    <option value="text_only">Encrypted Text-Only Tunnel</option>
                  </select>
                </div>
              </div>

              {/* AUDIENCE & PROFILE AFFINITY GATE */}
              <div>
                <label className="font-mono text-xs text-[#ccff00] font-bold block mb-1">
                  WHO CAN JOIN (PROFILE INTEREST GATE)
                </label>
                <select
                  value={newAudience}
                  onChange={e => setNewAudience(e.target.value)}
                  className="w-full bg-[#181818] border-2 border-[#333] focus:border-[#ccff00] p-2 font-mono text-xs text-white outline-none"
                >
                  <option value="similar_profile">People with Similar Profile Interests (≥80% Resonance)</option>
                  <option value="contrarian_friction">Contrarian & Opposing Views (High-Friction Polarity)</option>
                  <option value="verified_professionals">Verified Industry Professionals Only</option>
                  <option value="open_mesh">Open Public Mesh (All Verified Rumr Users)</option>
                </select>
              </div>

              {/* DEBATE PROMPT / CONTEXT */}
              <div>
                <label className="font-mono text-xs text-[#ccff00] font-bold block mb-1">
                  DEBATE PROMPT / CONTEXT
                </label>
                <textarea
                  placeholder="Describe the central intellectual friction..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-[#181818] border-2 border-[#333] focus:border-[#ccff00] p-2.5 font-sans text-xs text-white outline-none h-20 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-[#181818] border-2 border-[#333] text-gray-300 hover:text-white px-4 py-2 font-mono text-xs font-bold uppercase transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-[#ccff00] text-black font-mono text-xs font-black px-5 py-2 border-2 border-black shadow-[3px_3px_0px_#a855f7] hover:bg-white transition-all uppercase"
                >
                  PUBLISH TOPIC NODE
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE TOPIC CHAT & AUDIO DEBATE ROOM MODAL */}
      {/* ========================================================================= */}
      <TopicChatRoomModal
        isOpen={activeRoomTopic !== null}
        onClose={() => setActiveRoomTopic(null)}
        topic={activeRoomTopic}
      />

    </div>
  );
};
