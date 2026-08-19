import React from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { Shield, Sparkles, Flame, Eye, Lock, Activity, RefreshCw, Zap } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, topics, navigate } = useApp();

  return (
    <div className="p-4 space-y-5">
      {/* Header Profile Card */}
      <div className="bg-[#141414] border-2 border-[#ccff00] p-5 shadow-[6px_6px_0px_#a855f7] relative">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#ccff00] text-black font-serif font-black text-2xl flex items-center justify-center border-2 border-black">
              {user.handle.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif text-xl font-bold text-white">{user.handle}</h2>
                <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
              </div>
              <p className="font-mono text-xs text-gray-400">Anonymous Cryptographic Mask</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-serif text-3xl font-black text-[#ccff00] leading-none">
              {user.chaosIndex}%
            </div>
            <span className="font-mono text-[9px] text-gray-500 uppercase">CHAOS SCORE</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#262626] text-center font-mono">
          <div className="bg-[#1a1a1a] p-2 border border-[#2a2a2a]">
            <div className="text-base font-bold text-white">18</div>
            <div className="text-[9px] text-gray-400 uppercase">Debates</div>
          </div>
          <div className="bg-[#1a1a1a] p-2 border border-[#2a2a2a]">
            <div className="text-base font-bold text-[#ccff00]">94%</div>
            <div className="text-[9px] text-gray-400 uppercase">Avg Match</div>
          </div>
          <div className="bg-[#1a1a1a] p-2 border border-[#2a2a2a]">
            <div className="text-base font-bold text-[#a855f7]">4</div>
            <div className="text-[9px] text-gray-400 uppercase">Unmasks</div>
          </div>
        </div>
      </div>

      {/* Topic Affinity Matrix */}
      <BrutalistCard className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-base font-bold text-white">Topic Affinities & Subscriptions</h3>
          <BrutalistBadge variant="purple">{user.subscribedTopicIds.length} ACTIVE</BrutalistBadge>
        </div>

        <div className="space-y-2">
          {topics.map(topic => (
            <div key={topic.id} className="flex justify-between items-center p-2 bg-[#181818] border border-[#222]">
              <div>
                <span className="font-mono text-xs text-white font-bold">{topic.title}</span>
                <span className="font-mono text-[10px] text-gray-500 block">{topic.category}</span>
              </div>
              <span className="font-mono text-xs text-[#ccff00] font-bold">{topic.matchRate}% Match</span>
            </div>
          ))}
        </div>
      </BrutalistCard>

      {/* Normalization Logs & Telemetry */}
      <BrutalistCard className="space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#a855f7] font-bold">
          <Activity className="w-4 h-4" />
          <span>CHAOS NORMALIZATION TELEMETRY</span>
        </div>
        <div className="bg-[#0e0e0e] p-3 border border-[#2a2a2a] text-gray-400 space-y-1 text-[11px]">
          <div>[LOG 04:12] Seed Vector: Normal Distribution (μ=88.4, σ=3.2)</div>
          <div>[LOG 04:09] AI Distance Matrix computed against 142 peer nodes</div>
          <div>[LOG 03:55] SHA-256 phone hash rotated successfully</div>
          <div className="text-[#ccff00]">[STATUS] Zero unhashed telemetry detected.</div>
        </div>
      </BrutalistCard>

      {/* Pro Boost CTA */}
      <div className="bg-gradient-to-r from-[#1e1528] to-[#121212] border-2 border-[#a855f7] p-4 flex justify-between items-center">
        <div>
          <div className="font-mono text-[10px] text-[#ccff00] font-bold uppercase">RUMR PRO ENGINE</div>
          <h4 className="font-serif text-lg font-bold text-white">Supercharge Topic Reach</h4>
        </div>
        <BrutalistButton variant="primary" size="sm" onClick={() => navigate('boost')}>
          <Zap className="w-3.5 h-3.5 text-black" /> Boost
        </BrutalistButton>
      </div>
    </div>
  );
};
