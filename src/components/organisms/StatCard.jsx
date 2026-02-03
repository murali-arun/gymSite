import React from 'react';

/**
 * Stat Card Component
 * Display a single statistic with icon, value, and label
 */
export function StatCard({ 
  icon, 
  value, 
  label, 
  trend,
  variant = 'default',
  className = '' 
}) {
  const variants = {
    default: 'bg-gray-800/50 backdrop-blur-sm border-gray-700',
    success: 'bg-green-900/30 backdrop-blur-sm border-green-700',
    info: 'bg-blue-900/30 backdrop-blur-sm border-blue-700',
    warning: 'bg-orange-900/30 backdrop-blur-sm border-orange-700',
    danger: 'bg-red-900/30 backdrop-blur-sm border-red-700'
  };

  const textColors = {
    default: 'text-white',
    success: 'text-green-400',
    info: 'text-blue-400',
    warning: 'text-orange-400',
    danger: 'text-red-400'
  };

  const variantClass = variants[variant];
  const textClass = textColors[variant];
  
  return (
    <div className={`${variantClass} rounded-xl p-4 border ${className}`}>
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className={`text-3xl font-bold ${textClass} mb-1`}>
        {value}
        {trend && (
          <span className="text-sm ml-2 text-gray-400">{trend}</span>
        )}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

/**
 * Stats Grid Component
 * Display multiple stat cards in a grid
 */
export function StatsGrid({ stats, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
