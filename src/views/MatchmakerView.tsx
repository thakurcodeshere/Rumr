import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { Sparkles, MessageSquare, Zap, Shield, Target, ArrowRight } from 'lucide-react';

export const MatchmakerView: React.FC = () => {
  const { partner, navigate } = useApp();
  const [matchingStep, setMatchingStep] = useState<'analyzing' | 'revealed'>('revealed');

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <BrutalistBadge variant="lime">AI DISTANCE ENGINE // ACTIVE</BrutalistBadge>
          <h2 className="font-serif text-2xl font-black text-white mt-1">Contrarian Match</h2>
          <p className="font-mono text-xs text-gray-400">Paired based on intellectual tension & debate compatibility</p>
        </div>
      </div>

      {/* Match Score Card */}
      <div className="bg-[#141414] border-2 border-[#ccff00] p-6 shadow-[6px_6px_0px_#a855f7] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="font-mono text-[10px] text-gray-400 uppercase">PSEUDONYM TARGET</span>
            <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
              {partner.handle}
              <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
            </h3>
            <p className="font-sans text-xs text-[#ddb7ff] mt-0.5">{partner.tagline}</p>
          </div>
          <div className="text-right">
            <div className="font-serif text-4xl font-black text-[#ccff00] leading-none">
              94%
            </div>
            <span className="font-mono text-[9px] text-gray-400 uppercase">MATCH INDEX</span>
          </div>
        </div>

        {/* Compatibility Distance Radar Breakdown */}
        <div className="space-y-2 py-3 border-y border-[#262626] my-4">
          <div className="font-mono text-xs text-[#a855f7] font-bold uppercase">DEBATE COMPATIBILITY VECTORS</div>
          {partner.affinities.map(aff => (
            <div key={aff.topic} className="space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-gray-300">{aff.topic}</span>
                <span className="text-[#ccff00] font-bold">{aff.score}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#222]">
                <div 
                  className="h-full bg-gradient-to-r from-[#a855f7] to-[#ccff00]" 
                  style={{ width: `${aff.score}%` }} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mask Level Indicator */}
        <div className="flex items-center justify-between bg-[#1a1a1a] p-3 border border-[#333] mb-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#ccff00]" />
            <div>
              <div className="font-mono text-[11px] text-white font-bold">IDENTITY ENCRYPTION: 100%</div>
              <div className="font-mono text-[10px] text-gray-500">Real name, photo & company hidden</div>
            </div>
          </div>
          <BrutalistBadge variant="purple">STAGE 0 / 3</BrutalistBadge>
        </div>

        {/* Start Chat CTA */}
        <BrutalistButton 
          fullWidth 
          size="lg" 
          variant="primary"
          onClick={() => navigate('chat')}
        >
          <MessageSquare className="w-4 h-4 text-black" />
          Enter Encrypted Debate Room
        </BrutalistButton>
      </div>

      {/* Alternative Matches Feed */}
      <div className="space-y-2 pt-2">
        <div className="font-mono text-xs text-gray-400 font-bold">ACTIVE QUEUE CANDIDATES</div>
        {[
          { handle: 'syntax_cynic', match: '91%', topic: 'Remote Work Surveillance' },
          { handle: 'macro_bear_99', match: '87%', topic: 'VC Valuation Illusions' }
        ].map((m, idx) => (
          <div key={idx} className="bg-[#141414] border border-[#262626] p-3 flex justify-between items-center">
            <div>
              <div className="font-mono text-xs font-bold text-white">{m.handle}</div>
              <div className="font-mono text-[10px] text-gray-400">{m.topic}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#ccff00] font-bold">{m.match}</span>
              <BrutalistButton size="sm" variant="ghost" onClick={() => navigate('chat')}>
                Chat
              </BrutalistButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
