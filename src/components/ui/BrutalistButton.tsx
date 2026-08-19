import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'purple' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const BrutalistButton: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const base = "font-mono font-bold uppercase transition-all duration-150 active:translate-x-1 active:translate-y-1 rounded-none border-2 flex items-center justify-center gap-2 cursor-pointer";
  
  const variants = {
    primary: "bg-[#ccff00] text-black border-[#ccff00] hover:bg-white hover:border-white shadow-[4px_4px_0px_#a855f7] active:shadow-none",
    secondary: "bg-transparent text-white border-white hover:bg-white hover:text-black shadow-[4px_4px_0px_#ccff00] active:shadow-none",
    purple: "bg-[#a855f7] text-black border-[#a855f7] hover:bg-white shadow-[4px_4px_0px_#ccff00] active:shadow-none",
    danger: "bg-[#ff4444] text-white border-[#ff4444] shadow-[4px_4px_0px_#000000] active:shadow-none",
    ghost: "bg-[#1c1b1b] text-gray-300 border-[#2a2a2a] hover:border-[#ccff00] hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base"
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
