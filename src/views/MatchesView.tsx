import React from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { Heart, Sparkles, MessageSquare, Flame, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const MatchesView: React.FC = () => {
  const { navigate, partner } = useApp();

  const matchesList = [
    {
      id: 'match-1',
      age: 26,
      distance: 'Gurgaon • 4 km away',
      compatibility: 94,
      sharedCount: 4,
      topics: ['Office Politics', 'Ghosting', 'Startup Drama', 'Situationships'],
      lastActive: 'Active 12m ago',
      isHot: true,
      opener: 'What\'s worse: being ghosted or slowly faded out?'
    },
    {
      id: 'match-2',
      age: 28,
      distance: 'Delhi NCR • 9 km away',
      compatibility: 88,
      sharedCount: 3,
      topics: ['Startup Life', 'Salary Comparison', 'Toxic Bosses'],
      lastActive: 'Active 1h ago',
      isHot: false,
      opener: 'Should coworkers ever be real friends outside work?'
    },
    {
      id: 'match-3',
      age: 25,
      distance: 'Mumbai • Nearby',
      compatibility: 86,
      sharedCount: 3,
      topics: ['Bollywood Controversies', 'Dating After 25', 'First Date Disasters'],
      lastActive: 'Active 3h ago',
      isHot: false,
      opener: 'What is your biggest dating red flag in 2026?'
    }
  ];

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#262626] pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-[#ccff00] fill-[#ccff00]" />
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

      {/* Match Cards List */}
      <div className="space-y-4">
        {matchesList.map(match => (
          <BrutalistCard key={match.id} isHot={match.isHot} className="space-y-3.5">
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
              <div className="font-mono text-[10px] text-gray-400 uppercase font-bold">Shared Affinities:</div>
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

            {/* Conversation Opener Prompt */}
            <div className="bg-[#111] border-l-2 border-[#ccff00] p-2.5 space-y-1">
              <div className="font-mono text-[10px] text-[#ccff00] font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#ccff00]" /> Suggested Conversation Opener
              </div>
              <p className="font-serif text-xs italic text-gray-300">
                "{match.opener}"
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#222]">
              <span className="font-mono text-[10px] text-gray-500">
                Level 0 Anonymity Active
              </span>

              <BrutalistButton
                variant="primary"
                size="sm"
                onClick={() => navigate('chat')}
                className="flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-black" />
                START CHAT
              </BrutalistButton>
            </div>
          </BrutalistCard>
        ))}
      </div>
    </div>
  );
};
