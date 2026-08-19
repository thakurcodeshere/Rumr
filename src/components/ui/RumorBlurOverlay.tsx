import React, { useState } from 'react';
import { Lock, Unlock, Zap } from 'lucide-react';
import { BrutalistButton } from './BrutalistButton';

interface RumorBlurOverlayProps {
  isEncrypted: boolean;
  content: string;
  encryptedContent?: string;
  onDecrypt?: () => void;
}

export const RumorBlurOverlay: React.FC<RumorBlurOverlayProps> = ({
  isEncrypted,
  content,
  encryptedContent,
  onDecrypt
}) => {
  const [decrypting, setDecrypting] = useState(false);

  const handleDecrypt = () => {
    setDecrypting(true);
    setTimeout(() => {
      setDecrypting(false);
      if (onDecrypt) onDecrypt();
    }, 900);
  };

  if (!isEncrypted) {
    return (
      <div className="text-sm font-sans text-[#e5e2e1] leading-relaxed py-1">
        {content}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden my-2 border border-[#a855f7]/40 bg-[#16131c]/60 p-3">
      {/* Blurred background text */}
      <div className={`select-none filter ${decrypting ? 'blur-sm animate-pulse' : 'blur-md'} text-sm font-mono text-gray-400 opacity-60`}>
        {encryptedContent || content}
      </div>

      {/* Decrypting Overlay */}
      <div className="absolute inset-0 bg-[#0e0e0e]/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center">
        {decrypting ? (
          <div className="flex items-center gap-2 text-[#ccff00] font-mono text-xs font-bold uppercase tracking-wider animate-pulse">
            <Zap className="w-4 h-4 animate-spin text-[#ccff00]" />
            <span>Decrypting Cryptographic Hash...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-[#a855f7] font-mono text-[11px] font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Topic Locked // Verified Whispers Only</span>
            </div>
            <BrutalistButton variant="primary" size="sm" onClick={handleDecrypt}>
              <Unlock className="w-3 h-3 text-black" />
              <span>Unmask Rumor</span>
            </BrutalistButton>
          </div>
        )}
      </div>
    </div>
  );
};
