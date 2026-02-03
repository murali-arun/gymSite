import React from 'react';
import { variants, layout, gradients } from '../../config/designSystem';

/**
 * Container Component
 * Reusable content container with consistent styling
 * 
 * @param {string} variant - Container style: 'default', 'elevated', 'flat', 'glass'
 * @param {string} padding - Padding size: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} clickable - Whether container is interactive
 * @param {function} onClick - Click handler
 * @param {ReactNode} children - Container content
 */
export function Container({ 
  variant = 'default', 
  padding = 'md',
  clickable = false,
  onClick,
  className = '',
  children 
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const baseClass = variants.card[variant] || variants.card.default;
  const interactiveClass = clickable || onClick ? 'cursor-pointer hover:bg-gray-800/70 transition-all' : '';
  
  return (
    <div 
      className={`${baseClass} ${paddingClasses[padding]} ${interactiveClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * Section Component
 * Semantic section wrapper with optional title and description
 */
export function Section({ 
  title, 
  description,
  icon,
  action,
  children,
  className = '' 
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description || action) && (
        <div className="flex justify-between items-start">
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {icon && <span>{icon}</span>}
                {title}
              </h2>
            )}
            {description && (
              <p className="text-gray-400 mt-2">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * PageContainer Component
 * Full page layout wrapper
 */
export function PageContainer({ 
  size = 'md',
  gradient = true,
  className = '',
  children 
}) {
  const sizeClasses = {
    sm: layout.containerSm,
    md: layout.container,
    lg: layout.containerLg,
    full: 'w-full px-4 py-4'
  };

  const bgClass = gradient ? gradients.page : 'bg-gray-900';
  
  return (
    <div className={`min-h-screen ${bgClass} ${className}`}>
      <div className={sizeClasses[size]}>
        {children}
      </div>
    </div>
  );
}

/**
 * InfoBox Component
 * Display informational messages with different variants
 */
export function InfoBox({ 
  variant = 'info', 
  icon, 
  title, 
  children,
  className = '' 
}) {
  const boxClass = variants.infoBox[variant] || variants.infoBox.neutral;
  
  const defaultIcons = {
    success: '✅',
    info: '💡',
    warning: '⚠️',
    error: '❌',
    neutral: 'ℹ️'
  };
  
  const displayIcon = icon || defaultIcons[variant];
  
  return (
    <div className={`${boxClass} ${className}`}>
      <div className="flex gap-3">
        {displayIcon && <div className="text-2xl flex-shrink-0">{displayIcon}</div>}
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <div className="text-sm text-gray-300">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid Component
 * Responsive grid layout
 */
export function Grid({ 
  cols = 2,
  gap = 'md',
  className = '',
  children 
}) {
  const colsClasses = {
    1: 'grid grid-cols-1',
    2: layout.gridCols2,
    3: layout.gridCols3,
    4: layout.gridCols4
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };
  
  return (
    <div className={`${colsClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Stack Component
 * Vertical spacing utility
 */
export function Stack({ 
  spacing = 'md',
  className = '',
  children 
}) {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  };
  
  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
}
