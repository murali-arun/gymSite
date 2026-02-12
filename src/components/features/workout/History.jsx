import React, { useState, memo } from 'react';
import { EmptyState } from '../../molecules';
import { Badge } from '../../atoms';
import { deleteWorkout } from '../../../utils/storage';

const History = memo(function History({ user, onRefresh }) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState(null);
  const workouts = user?.workouts || [];

  const handleDeleteWorkout = async (workoutId, workoutDate) => {
    const confirmMessage = `Are you sure you want to delete the workout from ${new Date(workoutDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}?\n\nThis action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingWorkoutId(workoutId);
    try {
      await deleteWorkout(user.id, workoutId);
      if (onRefresh) {
        await onRefresh();
      }
      // Clear selected workout if it was the one deleted
      if (selectedWorkout?.id === workoutId) {
        setSelectedWorkout(null);
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout. Please try again.');
    } finally {
      setDeletingWorkoutId(null);
    }
  };

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
              className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-all"
            >
              <div className="flex justify-between items-start">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setSelectedWorkout(selectedWorkout?.id === workout.id ? null : workout)}
                >
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
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkout(workout.id, workout.date);
                    }}
                    disabled={deletingWorkoutId === workout.id}
                    className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    title="Delete this workout"
                  >
                    {deletingWorkoutId === workout.id ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Deleting...
                      </>
                    ) : (
                      <>
                        🗑️ Delete
                      </>
                    )}
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform cursor-pointer ${
                      selectedWorkout?.id === workout.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    onClick={() => setSelectedWorkout(selectedWorkout?.id === workout.id ? null : workout)}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
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

                  {/* Cardio Details */}
                  {workout.type === 'cardio' && workout.cardio && (
                    <div className="bg-gray-600/30 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">🏃 {workout.cardio.activity}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-700/50 rounded px-3 py-2">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-gray-300 ml-2 font-semibold">{workout.cardio.duration} min</span>
                        </div>
                        {workout.cardio.distance && (
                          <div className="bg-gray-700/50 rounded px-3 py-2">
                            <span className="text-gray-400">Distance:</span>
                            <span className="text-gray-300 ml-2 font-semibold">{workout.cardio.distance} miles</span>
                          </div>
                        )}
                        <div className="bg-gray-700/50 rounded px-3 py-2">
                          <span className="text-gray-400">Intensity:</span>
                          <span className="text-gray-300 ml-2 font-semibold capitalize">{workout.cardio.intensity}</span>
                        </div>
                        {workout.cardio.distance && workout.cardio.duration && (
                          <div className="bg-gray-700/50 rounded px-3 py-2">
                            <span className="text-gray-400">Pace:</span>
                            <span className="text-gray-300 ml-2 font-semibold">
                              {(parseFloat(workout.cardio.duration) / parseFloat(workout.cardio.distance)).toFixed(1)} min/mile
                            </span>
                          </div>
                        )}
                      </div>
                      {workout.cardio.notes && (
                        <div className="mt-3 text-sm text-gray-400 italic">
                          Notes: {workout.cardio.notes}
                        </div>
                      )}
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
});

export default History;
