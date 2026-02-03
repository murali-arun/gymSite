import React from 'react';

export function EmptyState({ icon, title, description }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
