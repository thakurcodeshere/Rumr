import React from 'react';

export const ShaderBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#202020_1px,transparent_1px),linear-gradient(to_bottom,#202020_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      {/* Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#a855f7]/15 rounded-full blur-3xl" />
      {/* CRT Scanline overlay */}
      <div className="scanlines absolute inset-0 pointer-events-none opacity-40" />
    </div>
  );
};
