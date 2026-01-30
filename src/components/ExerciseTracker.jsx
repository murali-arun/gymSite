import React, { useState, useEffect, useRef } from 'react';
import { sendWorkoutFeedback, generateProgressSummary } from '../services/api';
import { saveWorkoutToUser, clearCurrentWorkout, addConversationMessage, shouldSummarize, updateSummary, getUser } from '../utils/storage';

function ExerciseTracker({ user, workout, onComplete, onRegenerate, onCancel }) {
  const [exercises, setExercises] = useState(workout.exercises || []);
  const [completing, setCompleting] = useState(false);
  
  // Workout execution state
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [setTimestamps, setSetTimestamps] = useState([]);
  const timerRef = useRef(null);

  // Timer effect for elapsed time
  useEffect(() => {
    if (workoutStartTime && workoutStarted && countdown === null) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [workoutStartTime, workoutStarted, countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWorkout = () => {
    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setWorkoutStartTime(Date.now());
          setWorkoutStarted(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNextSet = () => {
    const timestamp = {
      exerciseIndex: currentExerciseIndex,
      setIndex: currentSetIndex,
      time: Date.now(),
      elapsedSeconds: Math.floor((Date.now() - workoutStartTime) / 1000)
    };
    setSetTimestamps(prev => [...prev, timestamp]);

    // Mark current set as completed
    const updated = [...exercises];
    updated[currentExerciseIndex].sets[currentSetIndex].completed = true;
    setExercises(updated);

    // Move to next set or exercise
    const currentExercise = exercises[currentExerciseIndex];
    if (currentSetIndex < currentExercise.sets.length - 1) {
      // Next set in same exercise
      setCurrentSetIndex(currentSetIndex + 1);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
      } else {
        // Workout complete
        setWorkoutStarted(false);
      }
    }
  };

  const getRestTime = (exerciseIdx, setIdx) => {
    const currentTimestamp = setTimestamps.find(
      t => t.exerciseIndex === exerciseIdx && t.setIndex === setIdx
    );
    if (!currentTimestamp) return null;

    const prevTimestamp = setTimestamps[setTimestamps.length - 2];
    if (!prevTimestamp) return 0;

    return currentTimestamp.elapsedSeconds - prevTimestamp.elapsedSeconds;
  };

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
      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-9xl font-bold text-white mb-4 animate-pulse">
              {countdown}
            </div>
            <div className="text-2xl text-gray-300">Get Ready!</div>
          </div>
        </div>
      )}

      {/* Timer Display */}
      {workoutStarted && countdown === null && (
        <div className="fixed top-20 right-4 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 z-40">
          <div className="text-xs text-gray-400 mb-1">Elapsed Time</div>
          <div className="text-2xl font-bold text-white font-mono">{formatTime(elapsedTime)}</div>
        </div>
      )}

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

      {/* Start Workout Button */}
      {!workoutStarted && countdown === null && completedSets === 0 && (
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-700">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start?</h3>
            <p className="text-gray-300 mb-6">Click play to begin your workout with a 5-second countdown</p>
            <button
              onClick={handleStartWorkout}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 px-12 rounded-full transition-all shadow-lg shadow-blue-900/50 text-xl"
            >
              ▶ Start Workout
            </button>
          </div>
        </div>
      )}

      {/* Active Exercise View (When workout started) */}
      {workoutStarted && countdown === null && currentExerciseIndex < exercises.length && (
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-600">
          <div className="text-center mb-6">
            <div className="text-sm text-blue-400 mb-2">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              {exercises[currentExerciseIndex].name}
            </h2>
            <div className="text-2xl text-gray-300">
              Set {currentSetIndex + 1} of {exercises[currentExerciseIndex].sets.length}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Weight (lbs)</label>
                <input
                  type="number"
                  value={exercises[currentExerciseIndex].sets[currentSetIndex].weight}
                  onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'weight', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reps</label>
                <input
                  type="number"
                  value={exercises[currentExerciseIndex].sets[currentSetIndex].reps}
                  onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'reps', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {setTimestamps.length > 0 && (
              <div className="text-center text-sm text-gray-400">
                Last rest: {getRestTime(currentExerciseIndex, currentSetIndex) !== null 
                  ? formatTime(getRestTime(currentExerciseIndex, currentSetIndex))
                  : formatTime(setTimestamps[setTimestamps.length - 1]?.elapsedSeconds || 0)} since last set
              </div>
            )}
          </div>

          <button
            onClick={handleNextSet}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-6 px-8 rounded-xl transition-all shadow-lg shadow-green-900/50 text-xl"
          >
            {currentSetIndex < exercises[currentExerciseIndex].sets.length - 1 
              ? '✓ Complete Set' 
              : currentExerciseIndex < exercises.length - 1 
                ? '✓ Complete Set & Next Exercise' 
                : '✓ Complete Final Set'}
          </button>
        </div>
      )}

      {/* AI Suggestion */}
      {workout.aiSuggestion && !workoutStarted && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">🤖 AI Suggestion</h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {workout.aiSuggestion}
          </p>
        </div>
      )}

      {/* Exercises Overview (When not in active workout mode) */}
      {!workoutStarted && exercises.map((exercise, exIndex) => (
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
        {!workoutStarted && (
          <button
            onClick={onRegenerate}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 px-6 rounded-lg transition-all"
            title="Generate a new workout"
          >
            🔄 Regenerate
          </button>
        )}
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all"
        >
          {workoutStarted ? 'Exit Workout' : 'Cancel'}
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
