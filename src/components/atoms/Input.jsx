import React from 'react';

export function Input({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500';
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`${baseStyles} ${className}`}
      {...props}
    />
  );
}

export function TextArea({ 
  placeholder, 
  value, 
  onChange, 
  rows = 3,
  className = '',
  ...props 
}) {
  const baseStyles = 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none';
  
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`${baseStyles} ${className}`}
      {...props}
    />
  );
}

export function Select({ 
  value, 
  onChange, 
  children, 
  required = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`${baseStyles} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
