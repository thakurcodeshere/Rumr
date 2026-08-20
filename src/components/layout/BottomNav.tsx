import React from 'react';
import { Flame, Compass, Heart, MessageSquare, User } from 'lucide-react';
import { useApp } from '../../lib/store';
import { ViewType } from '../../types';

export const BottomNav: React.FC = () => {
  const { currentView, navigate, isRegistered } = useApp();

  const tabs: { id: ViewType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'feed', label: 'Discover', icon: Flame },
    { id: 'topics', label: 'Topics', icon: Compass },
    { id: 'matches', label: 'Matches', icon: Heart },
    { id: 'chat', label: 'Chats', icon: MessageSquare },
    { id: 'profile', label: 'Me', icon: User },
  ];

  if (!isRegistered || currentView === 'onboarding') return null;

  return (
    <nav className="bg-[#0e0e0e] border-t-2 border-[#262626] px-2 py-2 sticky bottom-0 z-30">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 transition-all ${
                isActive 
                  ? 'text-[#ccff00] font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className={`p-1 ${isActive ? 'bg-[#ccff00]/10 border-b-2 border-[#ccff00]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#ccff00]' : 'text-gray-400'}`} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
