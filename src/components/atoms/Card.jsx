import React from 'react';

export function Card({ children, className = '', onClick }) {
  return (
    <div 
      className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 ${onClick ? 'cursor-pointer hover:bg-gray-800/70 transition-all' : ''} ${className}`}
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
