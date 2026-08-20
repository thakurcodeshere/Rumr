import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { ALL_66_SCREENS } from '../lib/mock-data';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { Layers, Search, Filter, ArrowRight, ExternalLink } from 'lucide-react';
import { CatalogScreenItem } from '../types';

export const CatalogView: React.FC = () => {
  const { selectCatalogScreen } = useApp();
  const [filterCat, setFilterCat] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'Onboarding', 'Discovery', 'Feed', 'Matching', 'Chat', 'Rooms', 'Profile', 'Boost', 'Safety', 'Shader'];

  const filtered = ALL_66_SCREENS.filter(s => {
    const matchesCat = filterCat === 'All' || s.category.toLowerCase() === filterCat.toLowerCase();
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.id.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-[#ccff00]" />
          <BrutalistBadge variant="lime">MASTER CATALOG // {ALL_66_SCREENS.length} SCREENS</BrutalistBadge>
        </div>
        <h2 className="font-serif text-2xl font-black text-white">Stitch Design Catalog</h2>
        <p className="font-mono text-xs text-gray-400">Interactive live renderer and mapping for all {ALL_66_SCREENS.length} project screens</p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
          <input
            type="text"
            placeholder={`Filter ${ALL_66_SCREENS.length} screens by title or ID...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#161616] border-2 border-[#333] focus:border-[#ccff00] pl-9 pr-4 py-2.5 font-mono text-xs text-white outline-none"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`font-mono text-[11px] px-3 py-1 border uppercase font-bold shrink-0 transition-colors ${
                filterCat === cat
                  ? 'bg-[#ccff00] text-black border-[#ccff00]'
                  : 'bg-[#181818] text-gray-400 border-[#333] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of all 66 screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(screen => (
          <div 
            key={screen.index} 
            className="bg-[#141414] border border-[#262626] hover:border-[#ccff00] transition-all p-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono text-[10px] bg-[#a855f7] text-black font-bold px-1.5 py-0.5">
                  #{screen.index.toString().padStart(2, '0')}
                </span>
                <span className="font-mono text-[10px] text-gray-500">
                  {screen.category}
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm text-white mb-1">
                {screen.title}
              </h4>
              <div className="font-mono text-[10px] text-gray-400">
                Resolution: {screen.width} × {screen.height}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#222] flex justify-between items-center">
              <button
                onClick={() => selectCatalogScreen(screen)}
                className="font-mono text-[11px] font-bold text-[#ccff00] hover:underline flex items-center gap-1"
              >
                Launch Live UI <ArrowRight className="w-3 h-3" />
              </button>
              <span className="font-mono text-[9px] text-gray-600">
                {screen.htmlFile.split('/').pop()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
