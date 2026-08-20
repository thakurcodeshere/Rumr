import React from 'react';
import { useApp } from '../../lib/store';
import { SCREEN_FRAME_SPECS } from '../../lib/frame-specs';
import { ScreenFrameId } from '../../types';
import { 
  Smartphone, 
  Layers, 
  Copy, 
  ExternalLink, 
  Columns, 
  Check, 
  Figma, 
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';

export const FigmaToolbar: React.FC = () => {
  const { 
    selectedFrame, 
    setSelectedFrame, 
    compareFrame, 
    setCompareFrame,
    copyFigmaTokens, 
    copyCurrentScreenCode,
    copyToast,
    isMobileFrame,
    toggleMobileFrame,
    currentView
  } = useApp();

  const currentSpec = SCREEN_FRAME_SPECS[selectedFrame];
  const frameKeys: ScreenFrameId[] = ['iphone-16-pro', 'iphone-14-15', 'pixel-8', 'galaxy-s24', 'iphone-se', 'fluid'];

  return (
    <div className="w-full bg-[#111111] border-b-2 border-[#2a2a2a] text-white z-50 px-3 py-2 sm:px-6 sm:py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.8)] sticky top-0">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Brand + Frame Selector */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 bg-[#1b1526] border border-[#a855f7] px-2.5 py-1">
            <span className="font-mono font-black text-xs text-[#ccff00]">FIGMA</span>
            <span className="font-mono text-[10px] text-[#ddb7ff] hidden sm:inline">FRAME SELECTOR</span>
          </div>

          {/* Frame Dropdown / Pill selector */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {frameKeys.map(key => {
              const spec = SCREEN_FRAME_SPECS[key];
              const isSelected = selectedFrame === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedFrame(key);
                    if (key === 'fluid' && isMobileFrame) toggleMobileFrame();
                    if (key !== 'fluid' && !isMobileFrame) toggleMobileFrame();
                  }}
                  className={`font-mono text-[11px] px-2.5 py-1 font-bold transition-all border shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[2px_2px_0px_#a855f7]'
                      : 'bg-[#181818] text-gray-300 border-[#333] hover:text-white hover:border-gray-500'
                  }`}
                  title={`${spec.name} (${spec.width}x${spec.height}) - ${spec.description}`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>{spec.name.replace(' / Compact', '').replace(' / 9', '')}</span>
                  <span className="text-[9px] opacity-70 font-normal">({spec.width}w)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Specs Info Badge */}
        <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] bg-[#0c0c0c] border border-[#222] px-3 py-1 text-gray-300">
          <div className="flex items-center gap-1 text-[#ccff00]">
            <span className="font-bold">{currentSpec.width} × {currentSpec.height} px</span>
          </div>
          <span className="text-gray-600">|</span>
          <div>Ratio: <span className="text-white font-bold">{currentSpec.ratio}</span></div>
          <span className="text-gray-600">|</span>
          <div>Safe Top: <span className="text-[#ddb7ff] font-bold">{currentSpec.safeAreaTop}px</span></div>
        </div>

        {/* Right: Figma Bridge Actions */}
        <div className="flex items-center gap-2">
          {/* Copy Figma Tokens Button */}
          <button
            onClick={copyFigmaTokens}
            className="font-mono text-xs bg-[#1a1524] border border-[#a855f7] hover:border-[#ccff00] text-[#ddb7ff] hover:text-white font-bold px-2.5 py-1 flex items-center gap-1.5 transition-colors"
            title="Copy tokens Studio / Figma Variables JSON"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
            <span className="hidden sm:inline">Copy</span> Tokens
          </button>

          {/* Copy Link for html.to.design Figma Plugin */}
          <button
            onClick={copyCurrentScreenCode}
            className="font-mono text-xs bg-[#181818] border border-[#444] hover:border-[#ccff00] text-gray-200 hover:text-white font-bold px-2.5 py-1 flex items-center gap-1.5 transition-colors"
            title="Copy URL for Figma html.to.design plugin"
          >
            <Copy className="w-3.5 h-3.5 text-[#ccff00]" />
            <span className="hidden sm:inline">Figma</span> Link
          </button>

          {/* 66-Screen Master Canvas link */}
          <a
            href="/screens_workspace.html"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs bg-[#ccff00] text-black font-black px-3 py-1 flex items-center gap-1.5 hover:bg-white transition-colors"
            title="Open all 66 Stitch screens sequence in a visual workspace"
          >
            <Layers className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">All 66</span> Screens
            <ExternalLink className="w-3 h-3 text-black" />
          </a>
        </div>
      </div>

      {/* Interactive Toast Notification */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#ccff00] text-black border-2 border-black font-mono text-xs font-bold px-4 py-2.5 shadow-[4px_4px_0px_#a855f7] animate-bounce flex items-center gap-2">
          <Check className="w-4 h-4 text-black" />
          {copyToast}
        </div>
      )}
    </div>
  );
};
