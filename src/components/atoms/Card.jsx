import React from 'react';

export function Card({ children, className = '', onClick, variant = 'default', hover = true }) {
  const variants = {
    default: 'bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-black/20',
    elevated: 'bg-gray-800/95 backdrop-blur-xl border border-gray-700 shadow-2xl',
    glass: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl',
    active: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-green-500/30 shadow-2xl shadow-green-500/20'
  };
  
  const hoverStyles = hover ? 'hover:shadow-green-500/10 hover:-translate-y-1' : '';
  const clickStyles = onClick ? 'cursor-pointer transition-all duration-300' : 'transition-all duration-300';
  
  return (
    <div 
      className={`rounded-2xl ${variants[variant]} ${clickStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}
