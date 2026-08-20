import React, { useState } from 'react';
import { X, RotateCcw, Crosshair, Share2, Scale, Zap, Check, Plus, SlidersHorizontal, MapPin } from 'lucide-react';
import { BrutalistButton } from './BrutalistButton';
import { BrutalistBadge } from './BrutalistBadge';

interface DiscoveryFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export const DiscoveryFiltersModal: React.FC<DiscoveryFiltersModalProps> = ({
  isOpen,
  onClose,
  onApply
}) => {
  // 1. Age Range
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(45);

  // 2. Gender Preference
  const [gender, setGender] = useState<'everyone' | 'women' | 'men'>('everyone');

  // 3. Proximity & Radius
  const [proximity, setProximity] = useState<'nearby' | 'city' | 'anywhere'>('nearby');
  const [radius, setRadius] = useState(25);

  // 4. Topic Similarity Algorithm Mode
  const [similarityMode, setSimilarityMode] = useState<'exact' | 'related' | 'balanced' | 'exploratory'>('balanced');

  // 5. Intent Vectors
  const [intents, setIntents] = useState<{ dating: boolean; conversation: boolean; friendship: boolean }>({
    dating: true,
    conversation: true,
    friendship: false
  });

  // 6. Language Protocols
  const [languages, setLanguages] = useState<string[]>(['English', 'Hinglish']);

  // 7. Mandatory Topics
  const [mandatoryTopics, setMandatoryTopics] = useState<string[]>(['TECH_POLICY', 'STARTUP_CHAOS']);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicText, setNewTopicText] = useState('');

  if (!isOpen) return null;

  const toggleIntent = (key: keyof typeof intents) => {
    setIntents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (languages.length > 1) {
        setLanguages(languages.filter(l => l !== lang));
      }
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicText.trim()) return;
    const formatted = newTopicText.trim().toUpperCase().replace(/\s+/g, '_');
    if (!mandatoryTopics.includes(formatted)) {
      setMandatoryTopics([...mandatoryTopics, formatted]);
    }
    setNewTopicText('');
    setIsAddingTopic(false);
  };

  const removeMandatoryTopic = (topic: string) => {
    setMandatoryTopics(mandatoryTopics.filter(t => t !== topic));
  };

  const handleReset = () => {
    setMinAge(18);
    setMaxAge(45);
    setGender('everyone');
    setProximity('nearby');
    setRadius(25);
    setSimilarityMode('balanced');
    setIntents({ dating: true, conversation: true, friendship: false });
    setLanguages(['English', 'Hinglish']);
    setMandatoryTopics(['TECH_POLICY']);
  };

  const handleApply = () => {
    onApply({
      minAge,
      maxAge,
      gender,
      proximity,
      radius,
      similarityMode,
      intents,
      languages,
      mandatoryTopics
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in select-none">
      <div className="bg-[#111111] border-4 border-[#2a2a2a] w-full max-w-md max-h-[92vh] flex flex-col shadow-[10px_10px_0px_#a855f7] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#262626] bg-[#0c0c0c]">
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white bg-[#181818] border border-[#333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="font-serif text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
              DISCOVERY FILTERS
            </h2>
            <span className="font-mono text-[9px] text-[#ccff00] uppercase font-bold tracking-widest">
              PARAMETERS & PREFERENCES
            </span>
          </div>

          <button
            onClick={handleReset}
            className="font-mono text-xs font-bold text-[#ccff00] hover:text-white uppercase transition-colors px-2 py-1 bg-[#1a1726] border border-[#a855f7]"
          >
            RESET
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-6 flex-1 text-white">

          {/* SECTION 1: WHO CAN APPEAR & DEMOGRAPHICS */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-black text-white border-b border-[#262626] pb-1">
              Who can appear?
            </h3>

            {/* Age Range Slider */}
            <div className="bg-[#161616] border-2 border-[#262626] p-3.5 space-y-2">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-gray-400 uppercase font-bold tracking-wider">AGE RANGE</span>
                <span className="text-[#ccff00] font-black text-sm">{minAge} — {maxAge} YRS</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={18}
                  max={maxAge - 1}
                  value={minAge}
                  onChange={e => setMinAge(parseInt(e.target.value))}
                  className="w-full accent-[#ccff00] cursor-pointer"
                />
                <input
                  type="range"
                  min={minAge + 1}
                  max={60}
                  value={maxAge}
                  onChange={e => setMaxAge(parseInt(e.target.value))}
                  className="w-full accent-[#ccff00] cursor-pointer"
                />
              </div>
            </div>

            {/* Gender Segmented Selector */}
            <div className="bg-[#161616] border-2 border-[#262626] p-3.5 space-y-2">
              <span className="font-mono text-xs text-gray-400 uppercase font-bold tracking-wider">
                GENDER
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'everyone', label: 'EVERYONE' },
                  { id: 'women', label: 'WOMEN' },
                  { id: 'men', label: 'MEN' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setGender(item.id as any)}
                    className={`py-2 font-mono text-xs font-bold uppercase border-2 transition-all ${
                      gender === item.id
                        ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[2px_2px_0px_#a855f7]'
                        : 'bg-[#121212] text-gray-400 border-[#333] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Proximity & Distance Radius */}
            <div className="bg-[#161616] border-2 border-[#262626] p-3.5 space-y-3">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-gray-400 uppercase font-bold tracking-wider">PROXIMITY & RADIUS</span>
                <span className="text-[#ccff00] font-bold">{radius} MILES ({Math.round(radius * 1.6)} KM)</span>
              </div>

              {/* 3 Modes */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'nearby', label: 'NEARBY' },
                  { id: 'city', label: 'CITY' },
                  { id: 'anywhere', label: 'ANYWHERE' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setProximity(item.id as any)}
                    className={`py-1.5 font-mono text-xs font-bold uppercase border transition-all ${
                      proximity === item.id
                        ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[1px_1px_0px_#a855f7]'
                        : 'bg-[#121212] text-gray-400 border-[#333] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Radius Slider */}
              <input
                type="range"
                min={5}
                max={100}
                value={radius}
                onChange={e => setRadius(parseInt(e.target.value))}
                className="w-full accent-[#ccff00] cursor-pointer"
              />
            </div>
          </div>

          {/* SECTION 2: TOPIC SIMILARITY MATCHING ENGINE */}
          <div className="space-y-3">
            <div>
              <h3 className="font-serif text-lg font-black text-white">
                Topic similarity
              </h3>
              <p className="font-mono text-[11px] text-gray-400">
                How closely should we match your active tags?
              </p>
            </div>

            {/* 4 Mode Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { 
                  id: 'exact', 
                  title: 'Exact', 
                  desc: '100% Match only', 
                  icon: Crosshair 
                },
                { 
                  id: 'related', 
                  title: 'Related', 
                  desc: 'Overlapping tags', 
                  icon: Share2 
                },
                { 
                  id: 'balanced', 
                  title: 'Balanced', 
                  desc: 'Optimal mix (Default)', 
                  icon: Scale 
                },
                { 
                  id: 'exploratory', 
                  title: 'Exploratory', 
                  desc: 'Broad semantic reach', 
                  icon: Zap 
                }
              ].map(mode => {
                const Icon = mode.icon;
                const isSelected = similarityMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSimilarityMode(mode.id as any)}
                    className={`p-3 text-left border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1b1724] border-[#ccff00] text-white shadow-[3px_3px_0px_#a855f7]'
                        : 'bg-[#141414] border-[#262626] text-gray-400 hover:text-white hover:border-[#444]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#ccff00]' : 'text-gray-400'}`} />
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#ccff00]" />}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm text-white">{mode.title}</div>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5">{mode.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: INTENT VECTORS */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-gray-400 uppercase font-bold tracking-wider">
              INTENT_VECTORS
            </span>
            <div className="space-y-1.5">
              {[
                { id: 'dating', label: 'DATING' },
                { id: 'conversation', label: 'CONVERSATION & DEBATE' },
                { id: 'friendship', label: 'FRIENDSHIP & NETWORKING' }
              ].map(item => {
                const isChecked = intents[item.id as keyof typeof intents];
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleIntent(item.id as keyof typeof intents)}
                    className={`w-full p-2.5 text-left border-2 transition-all flex items-center justify-between font-mono text-xs font-bold ${
                      isChecked
                        ? 'bg-[#161616] border-[#ccff00] text-white'
                        : 'bg-[#101010] border-[#262626] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 border flex items-center justify-center ${
                        isChecked ? 'bg-[#ccff00] border-[#ccff00] text-black' : 'border-[#444]'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: LANGUAGE PROTOCOLS */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-gray-400 uppercase font-bold tracking-wider">
              LANGUAGE_PROTOCOLS
            </span>
            <div className="flex flex-wrap gap-2">
              {['English', 'Hinglish', 'Hindi', 'Tamil', 'Kannada'].map(lang => {
                const isSelected = languages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 transition-all ${
                      isSelected
                        ? 'bg-[#a855f7] text-black border-[#a855f7] shadow-[2px_2px_0px_#ccff00]'
                        : 'bg-[#141414] text-gray-400 border-[#333] hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: MANDATORY TOPICS */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-gray-400 uppercase font-bold tracking-wider">
              MANDATORY_TOPICS (HARD OVERLAPS)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {mandatoryTopics.map(topic => (
                <div
                  key={topic}
                  className="bg-[#1a1726] border-2 border-[#a855f7] text-[#ddb7ff] font-mono text-xs px-2.5 py-1 flex items-center gap-1.5 font-bold shadow-[2px_2px_0px_#222]"
                >
                  <span>#{topic}</span>
                  <button
                    onClick={() => removeMandatoryTopic(topic)}
                    className="hover:text-[#ff4444] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {isAddingTopic ? (
                <form onSubmit={handleAddTopic} className="flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="TOPIC_NAME"
                    value={newTopicText}
                    onChange={e => setNewTopicText(e.target.value)}
                    className="bg-[#0c0c0c] border border-[#ccff00] px-2 py-1 font-mono text-xs text-white outline-none w-32"
                  />
                  <button
                    type="submit"
                    className="bg-[#ccff00] text-black font-mono text-xs px-2 py-1 font-bold"
                  >
                    ADD
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingTopic(true)}
                  className="border-2 border-dashed border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-mono text-xs px-2.5 py-1 flex items-center gap-1 font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Floating Bottom Action CTA */}
        <div className="p-4 border-t-2 border-[#262626] bg-[#0c0c0c]">
          <BrutalistButton
            variant="primary"
            size="lg"
            onClick={handleApply}
            className="w-full justify-center text-sm font-black shadow-[4px_4px_0px_#a855f7] flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            APPLY_PARAMETERS ⚡
          </BrutalistButton>
        </div>

      </div>
    </div>
  );
};
