import React, { useState } from 'react';
import { useCoach } from '../contexts/CoachContext';

function ManualWorkoutLog({ user, onWorkoutLogged, onCancel }) {
  const [workoutDetails, setWorkoutDetails] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    exercises: [{ name: '', sets: '', reps: '', weight: '' }]
  });
  const [loading, setLoading] = useState(false);
  const { motivate } = useCoach();

  const addExercise = () => {
    setWorkoutDetails({
      ...workoutDetails,
      exercises: [...workoutDetails.exercises, { name: '', sets: '', reps: '', weight: '' }]
    });
  };

  const removeExercise = (index) => {
    const newExercises = workoutDetails.exercises.filter((_, i) => i !== index);
    setWorkoutDetails({ ...workoutDetails, exercises: newExercises });
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...workoutDetails.exercises];
    newExercises[index][field] = value;
    setWorkoutDetails({ ...workoutDetails, exercises: newExercises });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty exercises
      const validExercises = workoutDetails.exercises
        .filter(ex => ex.name.trim() !== '')
        .map(ex => ({
          name: ex.name,
          sets: Array.from({ length: parseInt(ex.sets) || 1 }, (_, i) => ({
            weight: ex.weight || '0',
            reps: ex.reps || '0',
            completed: true,
            setNumber: i + 1
          }))
        }));

      const workout = {
        id: Date.now(),
        date: workoutDetails.date,
        exercises: validExercises,
        aiSuggestion: `Manual workout log: ${workoutDetails.description || 'Workout logged manually'}`,
        isManualLog: true,
        description: workoutDetails.description,
        completedAt: new Date().toISOString()
      };

      motivate('workoutCompleted');
      await onWorkoutLogged(workout);
    } catch (error) {
      console.error('Error logging workout:', error);
      alert('Failed to log workout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Log Manual Workout</h2>
            <p className="text-gray-400">Track workouts you did outside the app</p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Workout Date
            </label>
            <input
              type="date"
              value={workoutDetails.date}
              onChange={(e) => setWorkoutDetails({ ...workoutDetails, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Workout Description (optional)
            </label>
            <textarea
              placeholder="e.g., Morning gym session, outdoor run, home workout"
              value={workoutDetails.description}
              onChange={(e) => setWorkoutDetails({ ...workoutDetails, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-300">
                Exercises
              </label>
              <button
                type="button"
                onClick={addExercise}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm"
              >
                + Add Exercise
              </button>
            </div>

            {workoutDetails.exercises.map((exercise, index) => (
              <div key={index} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <input
                    type="text"
                    placeholder="Exercise name"
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, 'name', e.target.value)}
                    required
                    className="flex-1 px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {workoutDetails.exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Sets</label>
                    <input
                      type="number"
                      placeholder="Sets"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                      min="1"
                      required
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Reps</label>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                      min="1"
                      required
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Weight (lbs)</label>
                    <input
                      type="text"
                      placeholder="Weight"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/50"
            >
              {loading ? 'Getting AI Feedback...' : '✓ Log Workout'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="text-blue-400 font-semibold mb-1">Track Everything</h3>
            <p className="text-gray-300 text-sm">
              Log workouts from the gym, outdoor activities, or home training. We'll account for all your progress!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualWorkoutLog;
