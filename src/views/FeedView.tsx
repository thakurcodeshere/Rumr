import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { RumorBlurOverlay } from '../components/ui/RumorBlurOverlay';
import { 
  Flame, 
  MessageSquare, 
  ThumbsUp, 
  Radio, 
  Zap, 
  Sparkles, 
  Filter, 
  ShieldAlert, 
  X, 
  Heart, 
  RotateCcw, 
  Layers, 
  MapPin, 
  Compass,
  ArrowRight,
  GitBranch
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FeedView: React.FC = () => {
  const { 
    rumors, 
    topics, 
    toggleRumorAgree, 
    toggleRumorDebate, 
    decryptRumor, 
    navigate, 
    setActiveTopic 
  } = useApp();

  const [viewMode, setViewMode] = useState<'card_deck' | 'discussions'>('card_deck');
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [swipeFeedback, setSwipeFeedback] = useState<'like' | 'pass' | null>(null);
  const [showMatchModal, setShowMatchModal] = useState<boolean>(false);

  // Discovery Cards deck
  const discoveryCards = [
    {
      id: 'card-1',
      primaryTopic: 'OFFICE POLITICS',
      age: 26,
      subTopics: ['Situationships', 'Why People Ghost', 'Startup Drama'],
      sharedOverlapCount: 4,
      location: 'Gurgaon • 4 km away',
      compatibilityScore: 94,
      isHot: true,
      category: 'Workplace'
    },
    {
      id: 'card-2',
      primaryTopic: 'GHOSTING AFTER DATES',
      age: 24,
      subTopics: ['First Date Disasters', 'Dating After 25', 'Red Flags'],
      sharedOverlapCount: 3,
      location: 'Delhi NCR • 7 km away',
      compatibilityScore: 89,
      isHot: true,
      category: 'Dating'
    },
    {
      id: 'card-3',
      primaryTopic: 'STARTUP DRAMA',
      age: 28,
      subTopics: ['Toxic Bosses', 'Salary Transparency', 'Burnout Stories'],
      sharedOverlapCount: 4,
      location: 'Bangalore • 2 km away',
      compatibilityScore: 91,
      isHot: false,
      category: 'Startups'
    },
    {
      id: 'card-4',
      primaryTopic: 'UNPOPULAR OPINIONS',
      age: 27,
      subTopics: ['Metro Dating', 'Shaadi Pressure', 'Hostel Secrets'],
      sharedOverlapCount: 5,
      location: 'Mumbai • 5 km away',
      compatibilityScore: 96,
      isHot: true,
      category: 'Chaos'
    }
  ];

  const currentCard = discoveryCards[currentCardIndex % discoveryCards.length];

  const handleSwipe = (action: 'like' | 'pass') => {
    setSwipeFeedback(action);
    if (action === 'like') {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ccff00', '#a855f7', '#ffffff']
      });
      setTimeout(() => {
        setShowMatchModal(true);
      }, 300);
    }

    setTimeout(() => {
      setSwipeFeedback(null);
      setCurrentCardIndex(prev => prev + 1);
    }, 400);
  };

  return (
    <div className="p-4 space-y-5">
      {/* Top Header Mode Toggle */}
      <div className="flex items-center justify-between gap-2 border-b border-[#262626] pb-2">
        <div className="flex gap-1 bg-[#141414] p-1 border border-[#333]">
          <button
            onClick={() => setViewMode('card_deck')}
            className={`font-mono text-xs font-bold uppercase px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              viewMode === 'card_deck'
                ? 'bg-[#ccff00] text-black shadow-[2px_2px_0px_#a855f7]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Topic Cards
          </button>
          <button
            onClick={() => setViewMode('discussions')}
            className={`font-mono text-xs font-bold uppercase px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              viewMode === 'discussions'
                ? 'bg-[#ccff00] text-black shadow-[2px_2px_0px_#a855f7]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Discussions
          </button>
        </div>

        <button
          onClick={() => navigate('workflow')}
          className="font-mono text-[11px] bg-[#1a1726] border border-[#a855f7] text-[#ddb7ff] hover:text-white px-2.5 py-1.5 flex items-center gap-1"
          title="Inspect Screen Workflow Architecture"
        >
          <GitBranch className="w-3 h-3 text-[#ccff00]" /> Workflow Map
        </button>
      </div>

      {/* MODE 1: Topic Discovery Card Deck (SCR-010) */}
      {viewMode === 'card_deck' ? (
        <div className="space-y-4">
          {/* Card Deck Wrapper */}
          <div className="relative">
            {/* Discovery Card Frame */}
            <div className={`bg-[#161616] border-4 border-[#262626] p-6 space-y-6 transition-all duration-300 relative overflow-hidden ${
              swipeFeedback === 'like' ? 'border-[#ccff00] translate-x-4 rotate-2' : ''
            } ${
              swipeFeedback === 'pass' ? 'border-[#ff4444] -translate-x-4 -rotate-2' : ''
            }`}>
              
              {/* Category & Badge */}
              <div className="flex items-center justify-between">
                <BrutalistBadge variant="lime">{currentCard.category}</BrutalistBadge>
                <div className="font-mono text-xs font-bold text-[#ccff00] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {currentCard.compatibilityScore}% MATCH
                </div>
              </div>

              {/* Main Primary Topic Typography */}
              <div className="space-y-2 py-4 border-y-2 border-[#262626]">
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">
                  PRIMARY CONVERSATION SIGNAL
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight hover:text-[#ccff00] transition-colors">
                  "{currentCard.primaryTopic}"
                </h2>
              </div>

              {/* Age & Overlaps */}
              <div className="grid grid-cols-2 gap-3 bg-[#111] p-3 border border-[#222]">
                <div>
                  <span className="font-mono text-[10px] text-gray-500 uppercase">Age</span>
                  <div className="font-serif text-2xl font-black text-white">{currentCard.age}</div>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-gray-500 uppercase">Affinities</span>
                  <div className="font-mono text-xs font-bold text-[#a855f7] mt-1">
                    {currentCard.sharedOverlapCount} Shared Interests
                  </div>
                </div>
              </div>

              {/* Sub-Topics Chips */}
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] text-gray-400 uppercase font-bold block">
                  Also wants to discuss:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentCard.subTopics.map((sub, idx) => (
                    <span 
                      key={idx} 
                      className="font-mono text-xs font-semibold px-2.5 py-1 bg-[#1e1a2b] border border-[#a855f7] text-[#ddb7ff]"
                    >
                      #{sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location Badge & Anonymity Note */}
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span>{currentCard.location}</span>
                </div>
                <span className="text-[10px] text-gray-500">Level 0 Anonymity</span>
              </div>
            </div>

            {/* Swipe Feedback Overlay */}
            {swipeFeedback && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none z-20">
                <div className={`font-serif font-black text-3xl uppercase px-6 py-3 border-4 ${
                  swipeFeedback === 'like' ? 'text-[#ccff00] border-[#ccff00] rotate-12' : 'text-[#ff4444] border-[#ff4444] -rotate-12'
                }`}>
                  {swipeFeedback === 'like' ? 'LIKE ♥' : 'PASS ✕'}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Pass & Like */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={() => handleSwipe('pass')}
              className="flex-1 py-3.5 bg-[#1a1a1a] hover:bg-[#252525] border-2 border-[#444] hover:border-[#ff4444] text-[#ff4444] font-mono text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_#333]"
            >
              <X className="w-5 h-5" /> PASS
            </button>

            <button
              onClick={() => handleSwipe('like')}
              className="flex-1 py-3.5 bg-[#ccff00] hover:bg-[#d8ff33] text-black font-mono text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_#a855f7] active:translate-x-1 active:translate-y-1"
            >
              <Heart className="w-5 h-5 fill-black" /> LIKE
            </button>
          </div>
        </div>
      ) : (
        /* MODE 2: Discussion Posts Feed (SCR-014) */
        <div className="space-y-4">
          {rumors.map(rumor => (
            <BrutalistCard key={rumor.id} isHot={rumor.matchRate > 90} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BrutalistBadge variant="lime">{rumor.category}</BrutalistBadge>
                    <span className="font-mono text-[10px] text-gray-500">{rumor.timestamp}</span>
                  </div>
                  <h4 
                    onClick={() => {
                      const matchedTopic = topics.find(t => t.id === rumor.topicId);
                      if (matchedTopic) setActiveTopic(matchedTopic);
                      navigate('topics');
                    }}
                    className="font-serif text-lg font-bold text-white hover:text-[#ccff00] cursor-pointer transition-colors"
                  >
                    {rumor.topicTitle}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-[#ccff00]">{rumor.matchRate}%</div>
                  <div className="font-mono text-[9px] text-gray-500 uppercase">MATCH</div>
                </div>
              </div>

              <RumorBlurOverlay
                isEncrypted={rumor.isEncrypted}
                content={rumor.content}
                encryptedContent={rumor.encryptedContent}
                onDecrypt={() => decryptRumor(rumor.id)}
              />

              <div className="flex items-center justify-between pt-3 border-t border-[#222]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleRumorAgree(rumor.id)}
                    className="flex items-center gap-1 font-mono text-xs text-gray-400 hover:text-[#ccff00]"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{rumor.agrees}</span>
                  </button>
                  <button
                    onClick={() => toggleRumorDebate(rumor.id)}
                    className="flex items-center gap-1 font-mono text-xs text-gray-400 hover:text-[#a855f7]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{rumor.debates} debates</span>
                  </button>
                </div>

                <BrutalistButton 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('matches')}
                >
                  <Sparkles className="w-3 h-3 text-black" />
                  View Match
                </BrutalistButton>
              </div>
            </BrutalistCard>
          ))}
        </div>
      )}

      {/* Match Reveal Celebration Modal (SCR-013) */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#121212] border-4 border-[#ccff00] p-6 max-w-sm w-full space-y-4 shadow-[8px_8px_0px_#a855f7] text-center">
            <div className="font-mono text-xs font-bold text-[#a855f7] uppercase tracking-widest">
              MUTUAL SIGNAL CONFIRMED
            </div>
            
            <h3 className="font-serif text-3xl font-black text-white">
              IT'S A MATCH!
            </h3>
            
            <p className="font-serif text-sm text-[#ccff00] font-bold">
              "SAME CHAOS. SAME TOPICS."
            </p>

            <div className="bg-[#1a1726] border border-[#a855f7] p-3 text-left space-y-1">
              <div className="font-mono text-[10px] text-gray-400 uppercase">Shared Overlaps:</div>
              <div className="font-serif text-sm font-bold text-white">
                ● Office Politics<br />
                ● Ghosting After Dates<br />
                ● Startup Drama
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <BrutalistButton
                variant="primary"
                size="md"
                onClick={() => {
                  setShowMatchModal(false);
                  navigate('chat');
                }}
                className="w-full justify-center"
              >
                <MessageSquare className="w-4 h-4 text-black" />
                SAY SOMETHING (START CHAT)
              </BrutalistButton>

              <button
                onClick={() => setShowMatchModal(false)}
                className="w-full py-2 font-mono text-xs text-gray-400 hover:text-white"
              >
                Maybe later / Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
