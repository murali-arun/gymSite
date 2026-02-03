import React, { useState } from 'react';
import { generateWorkout } from '../services/api';
import { setCurrentWorkout, addConversationMessage } from '../utils/storage';
import { useCoach } from '../contexts/CoachContext';

function WorkoutGenerator({ user, onWorkoutGenerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState({
    focus: '',
    equipment: '',
    notes: ''
  });
  const { coachType, motivate } = useCoach();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const workout = await generateWorkout(user, preferences, coachType);
      
      // Save to user's current workout
      await setCurrentWorkout(user.id, workout);
      
      // Add to conversation history
      let userMessage = 'Generate today\'s workout.';
      if (preferences.focus || preferences.equipment || preferences.notes) {
        userMessage += ' Preferences:';
        if (preferences.focus) userMessage += ` Focus: ${preferences.focus}.`;
        if (preferences.equipment) userMessage += ` Equipment: ${preferences.equipment}.`;
        if (preferences.notes) userMessage += ` Notes: ${preferences.notes}.`;
      }
      await addConversationMessage(user.id, 'user', userMessage);
      await addConversationMessage(user.id, 'assistant', workout.aiResponse);
      
      // Show coach motivation
      motivate('workoutGenerated');
      
      onWorkoutGenerated(workout);
    } catch (err) {
      setError(err.message || 'Failed to generate workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-2">Ready to Train?</h2>
        <p className="text-gray-400 mb-6">Let AI suggest your workout for today</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Focus Area (optional)
            </label>
            <input
              type="text"
              placeholder="e.g., chest, legs, back, full body"
              value={preferences.focus}
              onChange={(e) => setPreferences({ ...preferences, focus: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Available Equipment (optional)
            </label>
            <input
              type="text"
              placeholder="e.g., dumbbells, barbell, machines"
              value={preferences.equipment}
              onChange={(e) => setPreferences({ ...preferences, equipment: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes (optional)
            </label>
            <textarea
              placeholder="e.g., feeling tired, want intense workout"
              value={preferences.notes}
              onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              '🎯 Generate Today\'s Workout'
            )}
          </button>
        </div>
      </div>

      {/* Stats Card */}
      {user.workouts.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400">{user.workouts.length}</div>
              <div className="text-sm text-gray-400">Total Workouts</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400">
                {user.workouts[0]?.date === new Date().toISOString().split('T')[0] ? '✓' : '-'}
              </div>
              <div className="text-sm text-gray-400">Today's Status</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutGenerator;
