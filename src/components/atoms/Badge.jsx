import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-700 text-gray-300',
    success: 'bg-green-900/50 text-green-400',
    info: 'bg-blue-900/50 text-blue-400',
    warning: 'bg-yellow-900/50 text-yellow-400',
    manual: 'bg-purple-900/50 text-purple-400'
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
