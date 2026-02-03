import React, { useState } from 'react';

function History({ user, onRefresh }) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const workouts = user?.workouts || [];

  if (workouts.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-white mb-2">No Workouts Yet</h2>
        <p className="text-gray-400">Complete your first workout to see your progress here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Workout History</h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="space-y-3">
          {workouts.map((workout, index) => (
            <div
              key={workout.id || index}
              className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-all cursor-pointer"
              onClick={() => setSelectedWorkout(selectedWorkout?.id === workout.id ? null : workout)}
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
                    <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded">
                      Completed
                    </span>
                    {workout.isManualLog && (
                      <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-400 rounded flex items-center gap-1">
                        📝 Manual Log
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {workout.exercises?.length || 0} exercises • {' '}
                    {workout.exercises?.reduce((sum, ex) => sum + ex.sets.length, 0) || 0} total sets
                  </div>
                  {workout.description && (
                    <div className="text-sm text-gray-500 mt-1 italic">
                      {workout.description}
                    </div>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedWorkout?.id === workout.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {selectedWorkout?.id === workout.id && (
                <div className="mt-4 pt-4 border-t border-gray-600 space-y-4">
                  {/* AI Feedback */}
                  {workout.aiFeedback && (
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-400 mb-2">🤖 AI Feedback</h4>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{workout.aiFeedback}</p>
                    </div>
                  )}

                  {/* Exercises */}
                  {workout.exercises?.map((exercise, exIndex) => (
                    <div key={exIndex} className="bg-gray-600/30 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">{exercise.name}</h4>
                      <div className="space-y-2">
                        {exercise.sets?.map((set, setIndex) => (
                          <div
                            key={setIndex}
                            className="flex items-center justify-between text-sm bg-gray-700/50 rounded px-3 py-2"
                          >
                            <span className="text-gray-400">Set {setIndex + 1}</span>
                            <div className="flex gap-4 text-gray-300">
                              <span>{set.weight} lbs</span>
                              <span>×</span>
                              <span>{set.reps} reps</span>
                              {set.completed && (
                                <span className="text-green-400">✓</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;
