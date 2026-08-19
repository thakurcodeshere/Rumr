import React from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { Zap, TrendingUp, Check, ShieldCheck, Sparkles, BarChart3 } from 'lucide-react';

export const BoostView: React.FC = () => {
  const { user, purchaseBoost } = useApp();

  const plans = [
    {
      id: 'tier-pulse',
      name: 'Topic Pulse',
      price: '$4.99',
      multiplier: '3x Impressions',
      features: ['Priority in regional Discovery Feed', 'Encrypted fast-lane AI matching', 'Badge: Verified Whisperer']
    },
    {
      id: 'tier-supercharged',
      name: 'Supercharged Node',
      price: '$12.99',
      multiplier: '10x Impressions',
      isPopular: true,
      features: ['Pinned to Top Debate Carousel for 48h', 'Unlimited mutual unmasking requests', 'Access to Private Audio Rooms', 'Deep AI Telemetry Analytics']
    },
    {
      id: 'tier-dominance',
      name: 'Network Dominance',
      price: '$29.99',
      multiplier: '25x Global Reach',
      features: ['Global Syndicate Feed Distribution', 'Host Multi-speaker Public Rooms', 'Custom Cipher Badge', 'Zero Message Rate Limiting']
    }
  ];

  return (
    <div className="p-4 space-y-5">
      <div>
        <BrutalistBadge variant="lime">MONETIZATION // PRO ACCESS</BrutalistBadge>
        <h2 className="font-serif text-2xl font-black text-white mt-1">Topic Amplifier</h2>
        <p className="font-mono text-xs text-gray-400">Boost debate velocity and pair with high-profile contrarians</p>
      </div>

      {/* Active Boost Status if any */}
      {user.boostTier && (
        <div className="bg-[#192414] border-2 border-[#ccff00] p-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] text-[#ccff00] font-bold uppercase">CURRENT STATUS</div>
            <div className="font-serif text-lg font-bold text-white">{user.boostTier} Active</div>
          </div>
          <BrutalistBadge variant="lime">24H REMAINING</BrutalistBadge>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="space-y-4">
        {plans.map(plan => (
          <BrutalistCard 
            key={plan.id} 
            isHot={plan.isPopular}
            className={`space-y-4 relative ${plan.isPopular ? 'border-[#ccff00]' : 'border-[#333]'}`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 right-4 bg-[#ccff00] text-black font-mono text-[10px] font-bold uppercase px-2 py-0.5">
                MOST POPULAR
              </div>
            )}

            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">{plan.name}</h3>
                <span className="font-mono text-xs text-[#a855f7] font-bold">{plan.multiplier}</span>
              </div>
              <div className="font-serif text-2xl font-black text-white">
                {plan.price}
              </div>
            </div>

            <ul className="space-y-2 border-y border-[#262626] py-3 text-xs font-sans text-gray-300">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <BrutalistButton 
              fullWidth 
              variant={plan.isPopular ? 'primary' : 'purple'}
              onClick={() => purchaseBoost(plan.name)}
            >
              <Zap className="w-3.5 h-3.5 text-black" />
              Unlock {plan.name}
            </BrutalistButton>
          </BrutalistCard>
        ))}
      </div>
    </div>
  );
};
