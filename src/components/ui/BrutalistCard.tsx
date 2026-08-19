import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isHot?: boolean;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const BrutalistCard: React.FC<CardProps> = ({
  children,
  className = '',
  isHot = false,
  onClick,
  hoverEffect = true
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#141414] border-2 ${isHot ? 'border-[#ccff00]' : 'border-[#262626]'} p-4 rounded-none transition-all duration-200 ${
        hoverEffect ? 'hover:border-[#ccff00] hover:shadow-[4px_4px_0px_#a855f7] hover:-translate-x-0.5 hover:-translate-y-0.5' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
