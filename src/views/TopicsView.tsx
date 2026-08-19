import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { Compass, Plus, Users, Flame, Check, Search } from 'lucide-react';
import { Topic } from '../types';

export const TopicsView: React.FC = () => {
  const { topics, toggleSubscribeTopic, createCustomTopic, navigate, setActiveTopic } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Topic['category']>('Tech');
  const [newDesc, setNewDesc] = useState('');

  const categories = ['All', 'Tech', 'Workplace', 'Startups', 'Social', 'Spicy'];

  const filteredTopics = topics.filter(t => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createCustomTopic(newTitle, newCategory, newDesc || 'Community debate node initiated.');
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="p-4 space-y-5">
      {/* Header & Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-black text-white">Topic Matrix</h2>
          <p className="font-mono text-xs text-gray-400">Select debate vectors to calibrate match engine</p>
        </div>
        <BrutalistButton size="sm" variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-3.5 h-3.5 text-black" /> New Topic
        </BrutalistButton>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search debate nodes, whistleblows, rumors..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-[#161616] border-2 border-[#333] focus:border-[#ccff00] pl-9 pr-4 py-2.5 font-mono text-xs text-white outline-none"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`font-mono text-xs px-3 py-1 border uppercase font-bold shrink-0 transition-colors ${
              selectedCategory === cat
                ? 'bg-[#a855f7] text-black border-[#a855f7]'
                : 'bg-[#181818] text-gray-400 border-[#333] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredTopics.map(topic => (
          <BrutalistCard key={topic.id} isHot={topic.isHot} className="flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <BrutalistBadge variant="purple">{topic.category}</BrutalistBadge>
                <div className="flex items-center gap-1 text-[#ccff00] font-mono text-xs font-bold">
                  <Flame className="w-3 h-3" />
                  <span>{topic.heatScore}° HEAT</span>
                </div>
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-1.5">
                {topic.title}
              </h3>
              <p className="text-xs font-sans text-gray-400 leading-relaxed">
                {topic.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400">
                <Users className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>{topic.debaterCount} Debaters</span>
              </div>

              <BrutalistButton
                variant={topic.isSubscribed ? 'ghost' : 'primary'}
                size="sm"
                onClick={() => toggleSubscribeTopic(topic.id)}
              >
                {topic.isSubscribed ? (
                  <>
                    <Check className="w-3 h-3 text-[#ccff00]" /> Subscribed
                  </>
                ) : (
                  '+ Subscribe'
                )}
              </BrutalistButton>
            </div>
          </BrutalistCard>
        ))}
      </div>

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141414] border-2 border-[#ccff00] p-6 max-w-md w-full shadow-[8px_8px_0px_#a855f7]">
            <h3 className="font-serif text-xl font-bold text-white mb-2">Create Custom Topic Node</h3>
            <p className="font-mono text-xs text-gray-400 mb-4">
              All created nodes are validated by the AI Toxicity Sentinel.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="font-mono text-xs text-[#ccff00] font-bold block mb-1">TOPIC TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. AI Agent Wrapper Bubble"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] focus:border-[#ccff00] p-2.5 font-mono text-xs text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-xs text-[#ccff00] font-bold block mb-1">CATEGORY</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as Topic['category'])}
                  className="w-full bg-[#181818] border border-[#333] p-2.5 font-mono text-xs text-white outline-none"
                >
                  <option value="Tech">Tech</option>
                  <option value="Workplace">Workplace</option>
                  <option value="Startups">Startups</option>
                  <option value="Social">Social</option>
                  <option value="Spicy">Spicy</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-xs text-[#ccff00] font-bold block mb-1">DEBATE PROMPT / CONTEXT</label>
                <textarea
                  placeholder="Describe the central intellectual friction..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] focus:border-[#ccff00] p-2.5 font-sans text-xs text-white outline-none h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <BrutalistButton variant="ghost" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </BrutalistButton>
                <BrutalistButton variant="primary" size="sm" type="submit">
                  Publish Topic Node
                </BrutalistButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
