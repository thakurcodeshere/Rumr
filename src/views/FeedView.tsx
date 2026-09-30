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
  MapPin,
  Users,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DiscoveryFiltersModal } from '../components/ui/DiscoveryFiltersModal';
import { EncryptedMatchModal } from '../components/ui/EncryptedMatchModal';
import { api } from '../lib/api';

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
  const [cards, setCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [swipeFeedback, setSwipeFeedback] = useState<'like' | 'pass' | null>(null);
  const [showMatchModal, setShowMatchModal] = useState<boolean>(false);
  const [latestMatch, setLatestMatch] = useState<{ matchRate: number; partnerHandle: string; overlappingTopics: string[] }>({
    matchRate: 0,
    partnerHandle: '',
    overlappingTopics: []
  });

  React.useEffect(() => {
    const loadCards = async () => {
      try {
        const res = await api.discovery.getFeed(activeFilters);
        if (res.cards && res.cards.length > 0) {
          setCards(res.cards);
        }
      } catch (err) {
        console.error('Error fetching discovery cards:', err);
      }
    };
    loadCards();
  }, [activeFilters]);

  const currentCard = cards.length > 0 && currentCardIndex < cards.length ? cards[currentCardIndex] : null;

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (!currentCard || !currentCard.targetUserId) return;

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

      try {
        const targetId = currentCard.targetUserId;
        const res = await api.discovery.swipe(targetId, 'like');
        if (res.isMatch) {
          setLatestMatch({
            matchRate: res.matchRate || 94,
            partnerHandle: res.partnerHandle || 'anonymous_debater',
            overlappingTopics: res.overlappingTopics || ['Shared Topics']
          });
          setTimeout(() => {
            setShowMatchModal(true);
          }, 300);
        }
      } catch (err) {
        console.error('Swipe error:', err);
      }
    } else {
      try {
        const targetId = currentCard.targetUserId;
        await api.discovery.swipe(targetId, 'pass');
      } catch (err) {
        console.error('Pass error:', err);
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
      {!currentCard ? (
        <div className="bg-[#161616] border-4 border-[#262626] p-8 space-y-4 text-center shadow-[4px_4px_0px_#333]">
          <div className="w-12 h-12 rounded-full bg-[#1b1724] border border-[#a855f7] flex items-center justify-center mx-auto text-[#a855f7]">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-black text-white">
              {cards.length === 0 ? 'NO DEBATERS IN THIS ZONE' : 'ALL CARDS REVIEWED'}
            </h3>
            <p className="font-mono text-xs text-gray-400 max-w-sm mx-auto">
              {cards.length === 0
                ? 'No active debaters match your current topic criteria or location filters. Check back soon or broaden your search criteria.'
                : 'You have swiped through all available candidates in this cycle.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            {cards.length === 0 ? (
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="font-mono text-xs bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#ccff00] border border-[#ccff00] px-4 py-2 font-bold uppercase transition-all flex items-center gap-2"
              >
                <Filter className="w-3.5 h-3.5" /> Adjust Filter Parameters
              </button>
            ) : (
              <button
                onClick={() => setCurrentCardIndex(0)}
                className="font-mono text-xs bg-[#ccff00] hover:bg-[#d8ff33] text-black px-4 py-2 font-bold uppercase transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Review Deck Again
              </button>
            )}
          </div>
        </div>
      ) : (
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
                  {currentCard.subTopics.map((sub: string, idx: number) => (
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
      )}

      {/* Redesigned After-Match Screen (Screen fb0fcae2 + Encrypted Identity) */}
      <EncryptedMatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        onStartChat={() => {
          setShowMatchModal(false);
          navigate('matches');
        }}
        matchRate={latestMatch.matchRate}
        partnerHandle={latestMatch.partnerHandle}
        overlappingTopics={latestMatch.overlappingTopics}
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
