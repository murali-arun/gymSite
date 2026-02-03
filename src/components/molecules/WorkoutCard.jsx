import React from 'react';
import { Badge } from '../atoms';

export function WorkoutCard({ workout, onClick, isExpanded }) {
  return (
    <div
      className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-white">
              {new Date(workout.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <Badge variant="success">Completed</Badge>
            {workout.isManualLog && (
              <Badge variant="manual" className="flex items-center gap-1">
                📝 Manual Log
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {workout.type === 'cardio' ? (
              <>
                {workout.cardio.activity} • {workout.cardio.duration} min
                {workout.cardio.distance && ` • ${workout.cardio.distance} miles`}
                {' • '}{workout.cardio.intensity} intensity
              </>
            ) : (
              <>
                {workout.exercises?.length || 0} exercises • {' '}
                {workout.exercises?.reduce((sum, ex) => sum + ex.sets.length, 0) || 0} total sets
              </>
            )}
          </div>
          {workout.description && (
            <div className="text-sm text-gray-500 mt-1 italic">
              {workout.description}
            </div>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
