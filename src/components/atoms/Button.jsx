import React from 'react';
import { variants as designVariants } from '../../config/designSystem';

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  type = 'button',
  fullWidth = false,
  className = '',
  pill = false,
  ...props 
}) {
  const baseStyles = 'font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: designVariants.button.primary,
    secondary: designVariants.button.secondary,
    danger: designVariants.button.danger,
    success: designVariants.button.success,
    ghost: designVariants.button.ghost,
    outline: designVariants.button.outline,
    energy: designVariants.button.energy || 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const radiusClass = pill || variant === 'primary' || variant === 'success' || variant === 'energy' ? 'rounded-full' : 'rounded-lg';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${radiusClass} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
