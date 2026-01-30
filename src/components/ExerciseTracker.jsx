import React, { useState, useEffect } from 'react';
import { sendWorkoutFeedback, generateProgressSummary } from '../services/api';
import { saveWorkoutToUser, clearCurrentWorkout, addConversationMessage, shouldSummarize, updateSummary, getUser } from '../utils/storage';

function ExerciseTracker({ user, workout, onComplete, onRegenerate, onCancel }) {
  const [exercises, setExercises] = useState(workout.exercises || []);
  const [completing, setCompleting] = useState(false);

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const toggleSetComplete = (exerciseIndex, setIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex].completed = !updated[exerciseIndex].sets[setIndex].completed;
    setExercises(updated);
  };

  const addSet = (exerciseIndex) => {
    const updated = [...exercises];
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0,
      completed: false
    });
    setExercises(updated);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const completedWorkout = {
        ...workout,
        exercises,
        completedAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };

      // Send feedback to AI
      const feedback = await sendWorkoutFeedback(user, completedWorkout);
      completedWorkout.aiFeedback = feedback;

      // Add workout completion to conversation history
      const workoutSummary = exercises.map(e => 
        `${e.name}: ${e.sets.filter(s => s.completed).length}/${e.sets.length} sets completed`
      ).join(', ');
      await addConversationMessage(user.id, 'user', `Completed workout: ${workoutSummary}`);
      await addConversationMessage(user.id, 'assistant', feedback);

      // Save to user's history
      await saveWorkoutToUser(user.id, completedWorkout);
      await clearCurrentWorkout(user.id);

      // Check if we should summarize progress (every 7 workouts)
      const updatedUser = await getUser(user.id);
      if (shouldSummarize(updatedUser)) {
        console.log('🔄 Triggering progress summarization...');
        try {
          const summary = await generateProgressSummary(updatedUser);
          await updateSummary(user.id, summary);
          console.log('✅ Progress summarized successfully!');
        } catch (err) {
          console.error('⚠️ Failed to generate summary, continuing anyway:', err);
        }
      }

      onComplete();
    } catch (err) {
      console.error('Error completing workout:', err);
      alert('Failed to save workout. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white">Today's Workout</h2>
          <span className="text-sm text-gray-400">
            {completedSets}/{totalSets} sets completed
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500"
            style={{ width: `${(completedSets / totalSets) * 100}%` }}
          />
        </div>
      </div>

      {/* AI Suggestion */}
      {workout.aiSuggestion && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">🤖 AI Suggestion</h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {workout.aiSuggestion}
          </p>
        </div>
      )}

      {/* Exercises */}
      {exercises.map((exercise, exIndex) => (
        <div
          key={exIndex}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-4">{exercise.name}</h3>
          
          <div className="space-y-3">
            {exercise.sets.map((set, setIndex) => (
              <div
                key={setIndex}
                className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                  set.completed
                    ? 'bg-green-900/30 border border-green-700'
                    : 'bg-gray-700/50 border border-gray-600'
                }`}
              >
                <button
                  onClick={() => toggleSetComplete(exIndex, setIndex)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    set.completed
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-500 hover:border-gray-400'
                  }`}
                >
                  {set.completed && (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 mb-1">Weight (lbs)</label>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 mb-1">Reps</label>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="text-sm font-medium text-gray-300">
                  Set {setIndex + 1}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => addSet(exIndex)}
            className="mt-4 w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all text-sm font-medium"
          >
            + Add Set
          </button>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRegenerate}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 px-6 rounded-lg transition-all"
          title="Generate a new workout"
        >
          🔄 Regenerate
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleComplete}
          disabled={completing || completedSets === 0}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/50"
        >
          {completing ? 'Saving...' : '✓ Complete Workout'}
        </button>
      </div>
    </div>
  );
}

export default ExerciseTracker;
