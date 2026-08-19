import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lime' | 'purple' | 'grey' | 'danger';
  className?: string;
}

export const BrutalistBadge: React.FC<BadgeProps> = ({
  children,
  variant = 'purple',
  className = ''
}) => {
  const variants = {
    lime: 'bg-[#ccff00] text-black',
    purple: 'bg-[#a855f7] text-black',
    grey: 'bg-[#2a2a2a] text-[#e5e2e1]',
    danger: 'bg-[#ff4444] text-black'
  };

  return (
    <span className={`inline-block font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-none ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
