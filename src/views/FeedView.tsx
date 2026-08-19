import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { RumorBlurOverlay } from '../components/ui/RumorBlurOverlay';
import { Flame, MessageSquare, ThumbsUp, Radio, Zap, Sparkles, Filter, ShieldAlert } from 'lucide-react';

export const FeedView: React.FC = () => {
  const { rumors, topics, toggleRumorAgree, toggleRumorDebate, decryptRumor, navigate, setActiveTopic, triggerNudge } = useApp();
  const [activeTab, setActiveTab] = useState<'trending' | 'rumors' | 'spicy'>('trending');

  return (
    <div className="p-4 space-y-5">
      {/* Top Action Filter Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-[#262626]">
        <div className="flex gap-1.5">
          {(['trending', 'rumors', 'spicy'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-mono text-xs font-bold uppercase px-3 py-1.5 border transition-all ${
                activeTab === tab 
                  ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[2px_2px_0px_#a855f7]' 
                  : 'bg-[#181818] text-gray-400 border-[#333] hover:text-white'
              }`}
            >
              {tab === 'trending' && '🔥 '}
              {tab === 'rumors' && '🤫 '}
              {tab === 'spicy' && '⚡ '}
              {tab}
            </button>
          ))}
        </div>

        <button 
          onClick={() => navigate('topics')}
          className="font-mono text-[11px] text-[#a855f7] hover:text-white flex items-center gap-1 shrink-0"
        >
          <Filter className="w-3.5 h-3.5" /> Filter Matrix
        </button>
      </div>

      {/* Featured Live Room Banner */}
      <div 
        onClick={() => navigate('rooms')}
        className="bg-gradient-to-r from-[#1c1626] to-[#121612] border-2 border-[#a855f7] p-3 cursor-pointer hover:border-[#ccff00] transition-colors relative overflow-hidden"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
            <span className="font-mono text-[10px] font-bold text-[#ccff00] uppercase">LIVE AUDIO ROOM ACTIVE</span>
          </div>
          <BrutalistBadge variant="purple">182 LISTENING</BrutalistBadge>
        </div>
        <h3 className="font-serif font-bold text-base text-white mt-1">
          Startup Chaos // The 2026 Burn Rate Reckoning
        </h3>
        <p className="font-mono text-[11px] text-gray-400 mt-0.5">
          Host: seed_survivor • Tap to drop in anonymously
        </p>
      </div>

      {/* Rumor Posts Feed */}
      <div className="space-y-4">
        {rumors.map(rumor => (
          <BrutalistCard key={rumor.id} isHot={rumor.matchRate > 90} className="space-y-3">
            {/* Header metadata */}
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
                <div className="font-mono text-xs font-bold text-[#ccff00]">
                  {rumor.matchRate}%
                </div>
                <div className="font-mono text-[9px] text-gray-500 uppercase">MATCH RATE</div>
              </div>
            </div>

            {/* Rumor Content / Blur Overlay */}
            <RumorBlurOverlay
              isEncrypted={rumor.isEncrypted}
              content={rumor.content}
              encryptedContent={rumor.encryptedContent}
              onDecrypt={() => decryptRumor(rumor.id)}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-1 pt-1">
              {rumor.tags.map(tag => (
                <span key={tag} className="font-mono text-[10px] text-[#a855f7] bg-[#1a1524] px-1.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>

            {/* Interactive Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#222]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleRumorAgree(rumor.id)}
                  className="flex items-center gap-1 font-mono text-xs text-gray-400 hover:text-[#ccff00] transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{rumor.agrees}</span>
                </button>
                <button
                  onClick={() => toggleRumorDebate(rumor.id)}
                  className="flex items-center gap-1 font-mono text-xs text-gray-400 hover:text-[#a855f7] transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{rumor.debates} debates</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <BrutalistButton 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('matchmaker')}
                >
                  <Sparkles className="w-3 h-3 text-black" />
                  Debate Match
                </BrutalistButton>
              </div>
            </div>
          </BrutalistCard>
        ))}
      </div>
    </div>
  );
};
