import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { 
  Flame, 
  Sparkles, 
  Filter, 
  X, 
  Heart, 
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DiscoveryFiltersModal } from '../components/ui/DiscoveryFiltersModal';
import { EncryptedMatchModal } from '../components/ui/EncryptedMatchModal';

export const FeedView: React.FC = () => {
  const { 
    navigate, 
    isGuest,
    triggerGuestLock
  } = useApp();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({
    minAge: 18,
    maxAge: 45,
    gender: 'everyone',
    proximity: 'nearby',
    radius: 25,
    similarityMode: 'balanced'
  });
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [swipeFeedback, setSwipeFeedback] = useState<'like' | 'pass' | null>(null);
  const [showMatchModal, setShowMatchModal] = useState<boolean>(false);

  // Discovery Cards deck
  const discoveryCards = [
    {
      id: 'card-1',
      primaryTopic: 'OFFICE POLITICS',
      category: 'Workplace',
      age: 26,
      sharedOverlapCount: 4,
      compatibilityScore: 94,
      location: 'Gurgaon • 4 km away',
      subTopics: ['Situationships', 'Why People Ghost', 'Startup Drama']
    },
    {
      id: 'card-2',
      primaryTopic: 'AI WRAPPER BUBBLE',
      category: 'Tech',
      age: 28,
      sharedOverlapCount: 5,
      compatibilityScore: 97,
      location: 'Gurgaon • 2 km away',
      subTopics: ['VC Burn Rates', 'Remote Work Friction', 'Seed Funding']
    },
    {
      id: 'card-3',
      primaryTopic: 'ORGANIC DATING IS DEAD',
      category: 'Social',
      age: 24,
      sharedOverlapCount: 3,
      compatibilityScore: 89,
      location: 'Delhi NCR • 8 km away',
      subTopics: ['First Date Red Flags', 'Dating After 25', 'Ghosting Culture']
    },
    {
      id: 'card-4',
      primaryTopic: 'GHOST PROMOTIONS',
      category: 'Workplace',
      age: 29,
      sharedOverlapCount: 4,
      compatibilityScore: 92,
      location: 'Cyber City • 1 km away',
      subTopics: ['Quiet Quitting', 'Salary Transparency', 'Toxic Managers']
    }
  ];

  const currentCard = discoveryCards[currentCardIndex % discoveryCards.length];

  const handleSwipe = (direction: 'like' | 'pass') => {
    if (isGuest && direction === 'like') {
      triggerGuestLock('Topic Swiping & Matching', 'Register to match with people based on shared debate friction.');
      return;
    }

    setSwipeFeedback(direction);

    if (direction === 'like') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ccff00', '#a855f7', '#ffffff']
      });

      // Show encrypted match modal every other like
      if (currentCardIndex % 2 === 0) {
        setTimeout(() => {
          setShowMatchModal(true);
        }, 300);
      }
    }

    setTimeout(() => {
      setSwipeFeedback(null);
      setCurrentCardIndex(prev => prev + 1);
    }, 400);
  };

  return (
    <div className="p-3 sm:p-4 space-y-4">
      {/* Top Header Bar with Filter Trigger */}
      <div className="flex items-center justify-between gap-2 border-b border-[#262626] pb-2">
        <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-white tracking-wider">
          <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
          <Flame className="w-4 h-4 text-[#ccff00]" />
          <span>TOPIC CARDS DISCOVERY</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="font-mono text-[11px] bg-[#161616] border border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-bold px-3 py-1.5 flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#a855f7]"
            title="Open Combined Discovery Filters & Preferences"
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* Active Filter Parameters Bar */}
      {activeFilters && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono select-none">
          <span className="text-gray-500 uppercase shrink-0">ACTIVE:</span>
          <span className="bg-[#141414] border border-[#333] px-2 py-0.5 text-gray-300 shrink-0">
            {activeFilters.minAge}-{activeFilters.maxAge} YRS
          </span>
          <span className="bg-[#141414] border border-[#333] px-2 py-0.5 text-gray-300 shrink-0 uppercase">
            {activeFilters.gender}
          </span>
          <span className="bg-[#1b1724] border border-[#a855f7] px-2 py-0.5 text-[#ddb7ff] shrink-0 font-bold uppercase">
            {activeFilters.similarityMode} MODE
          </span>
          <span className="bg-[#141414] border border-[#333] px-2 py-0.5 text-gray-300 shrink-0">
            {activeFilters.radius} MI ({Math.round(activeFilters.radius * 1.6)} KM)
          </span>
        </div>
      )}

      {/* Topic Discovery Card Deck */}
      <div className="space-y-4">
        {/* Card Deck Wrapper */}
        <div className="relative">
          {/* Discovery Card Frame */}
          <div className={`bg-[#161616] border-4 border-[#262626] p-5 sm:p-6 space-y-5 transition-all duration-300 relative overflow-hidden shadow-[4px_4px_0px_#a855f7] ${
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

      {/* Redesigned After-Match Screen (Screen fb0fcae2 + Encrypted Identity) */}
      <EncryptedMatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        onStartChat={() => {
          setShowMatchModal(false);
          navigate('matches');
        }}
        matchRate={88}
        overlappingTopics={['Ghosting After Dates', 'Startup Drama', 'Office Politics', 'Dating Friction']}
      />

      {/* Merged Discovery Filters & Preferences Screen-Frame Modal */}
      <DiscoveryFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
        }}
      />
    </div>
  );
};
