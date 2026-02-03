import React, { useState, useEffect, useRef } from 'react';
import { sendWorkoutFeedback, generateProgressSummary } from '../../../services/api';
import { saveWorkoutToUser, clearCurrentWorkout, addConversationMessage, shouldSummarize, updateSummary, getUser } from '../../../utils/storage';
import { useCoach } from '../../../contexts/CoachContext';

function ExerciseTracker({ user, workout, onComplete, onRegenerate, onCancel }) {
  const [exercises, setExercises] = useState(workout.exercises || []);
  const [completing, setCompleting] = useState(false);
  const { motivate, celebrate } = useCoach();
  
  // Workout execution state
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [setTimestamps, setSetTimestamps] = useState([]);
  const timerRef = useRef(null);
  
  // Pre-workout status
  const [showPreWorkout, setShowPreWorkout] = useState(false);
  const [preWorkoutData, setPreWorkoutData] = useState({
    energyLevel: 7,
    sleepHours: 7,
    sleepQuality: 'good',
    stressLevel: 5,
    soreness: '',
    mealsToday: '',
    notes: ''
  });
  
  // Post-workout feedback
  const [showPostWorkout, setShowPostWorkout] = useState(false);
  const [postWorkoutData, setPostWorkoutData] = useState({
    difficulty: 7,
    overallFeeling: 'good',
    predictedSoreness: 'moderate',
    notes: ''
  });
  
  // Set-level tracking
  const [showAdvancedTracking, setShowAdvancedTracking] = useState(false);
  
  // Core exercise selector
  const [showCoreSelector, setShowCoreSelector] = useState(false);
  const [coreExerciseIndex, setCoreExerciseIndex] = useState(null);
  
  // Core exercise variations
  const coreExerciseOptions = [
    'Dead Bug',
    'Toe Touches',
    'Bicycle Crunches',
    'Plank',
    'Side Plank',
    'Mountain Climbers',
    'Russian Twists',
    'Leg Raises',
    'Bird Dogs',
    'Hollow Body Hold'
  ];
  
  // Helper function to detect bodyweight exercises
  const isBodyweightExercise = (exercise) => {
    const bodyweightKeywords = ['plank', 'push-up', 'pull-up', 'dip', 'burpee', 'jump', 'crunch', 'sit-up', 'ab', 'core', 'dead bug', 'toe touch', 'bicycle', 'mountain climber', 'russian twist', 'leg raise', 'bird dog', 'hollow'];
    const exerciseName = exercise.name.toLowerCase();
    return bodyweightKeywords.some(keyword => exerciseName.includes(keyword)) || 
           (exercise.sets && exercise.sets.every(set => set.weight === 0));
  };

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
    setShowPreWorkout(true);
  };
  
  const confirmStartWorkout = () => {
    setShowPreWorkout(false);
    
    // Show coach motivation when starting workout!
    motivate('workoutStart');
    
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
    if (!updated[exerciseIndex].sets[setIndex]) {
      updated[exerciseIndex].sets[setIndex] = {};
    }
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const toggleSetComplete = (exerciseIndex, setIndex) => {
    const updated = [...exercises];
    const wasCompleted = updated[exerciseIndex].sets[setIndex].completed;
    updated[exerciseIndex].sets[setIndex].completed = !wasCompleted;
    setExercises(updated);
    
    // Motivate on set completion
    if (!wasCompleted) {
      // Check if this is a PR (weight increase)
      const currentWeight = updated[exerciseIndex].sets[setIndex].weight;
      const exerciseName = updated[exerciseIndex].name;
      
      // Simple PR detection - check if this weight is higher than previous workouts
      const isPotentialPR = user.workouts?.some(w => {
        const sameExercise = w.exercises?.find(e => e.name === exerciseName);
        if (sameExercise) {
          const maxWeight = Math.max(...sameExercise.sets.map(s => s.weight || 0));
          return currentWeight > maxWeight;
        }
        return false;
      });
      
      if (isPotentialPR && currentWeight > 0) {
        celebrate(`🎉 NEW PR on ${exerciseName}! ${currentWeight}lbs! CRUSHING IT!`, 'pr');
      } else {
        motivate('setComplete');
      }
      
      // Check if exercise is complete
      const allSetsComplete = updated[exerciseIndex].sets.every(s => s.completed);
      if (allSetsComplete) {
        setTimeout(() => motivate('exerciseComplete'), 1000);
      }
    }
  };

  const addSet = (exerciseIndex) => {
    const updated = [...exercises];
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0,
      completed: false,
      rpe: null,
      rir: null,
      toFailure: false,
      formBreakdown: false,
      pain: false,
      notes: ''
    });
    setExercises(updated);
  };

  const handleCompleteClick = () => {
    setShowPostWorkout(true);
  };
  
  const handleComplete = async () => {
    setShowPostWorkout(false);
    setCompleting(true);
    try {
      const completedWorkout = {
        ...workout,
        exercises,
        completedAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        setTimestamps,
        totalDuration: elapsedTime,
        preWorkout: preWorkoutData,
        postWorkout: postWorkoutData
      };

      // Send feedback to AI
      const feedback = await sendWorkoutFeedback(user, completedWorkout);
      completedWorkout.aiFeedback = feedback;

      // Calculate timing insights
      const totalDuration = elapsedTime;
      const avgRestTime = setTimestamps.length > 1 
        ? Math.round(setTimestamps.slice(1).reduce((sum, ts, idx) => {
            return sum + (ts.elapsedSeconds - setTimestamps[idx].elapsedSeconds);
          }, 0) / (setTimestamps.length - 1))
        : 0;

      // Build detailed workout summary with individual exercise timing
      let detailedSummary = 'Completed workout:\n';
      
      // Add pre-workout status if provided
      if (preWorkoutData.energyLevel || preWorkoutData.sleepHours) {
        detailedSummary += `\nPre-workout: Energy ${preWorkoutData.energyLevel}/10, Sleep ${preWorkoutData.sleepHours}h (${preWorkoutData.sleepQuality}), Stress ${preWorkoutData.stressLevel}/10`;
        if (preWorkoutData.soreness) detailedSummary += `\nSoreness: ${preWorkoutData.soreness}`;
        if (preWorkoutData.mealsToday) detailedSummary += `\nNutrition: ${preWorkoutData.mealsToday}`;
        if (preWorkoutData.notes) detailedSummary += `\nNotes: ${preWorkoutData.notes}`;
      }
      
      exercises.forEach((exercise, exIdx) => {
        const completedSetsForEx = exercise.sets.filter(s => s.completed);
        detailedSummary += `\n\n${exercise.name}: ${completedSetsForEx.length}/${exercise.sets.length} sets`;
        
        // Add set details with weights, reps, and RPE/RIR
        const setDetails = completedSetsForEx.map((set, setIdx) => {
          let detail = `${set.weight}lbs x ${set.reps}`;
          if (set.rpe) detail += ` @RPE${set.rpe}`;
          if (set.rir !== null && set.rir !== undefined) detail += ` (${set.rir}RIR)`;
          if (set.toFailure) detail += ' [failure]';
          if (set.formBreakdown) detail += ' [form breakdown]';
          if (set.pain) detail += ' [pain]';
          if (set.notes) detail += ` - ${set.notes}`;
          return detail;
        }).join('\n  ');
        if (setDetails) {
          detailedSummary += `\n  ${setDetails}`;
        }
        
        // Add timing for this exercise's sets if available
        if (setTimestamps.length > 0) {
          const exerciseTimes = setTimestamps.filter(ts => ts.exerciseIndex === exIdx);
          if (exerciseTimes.length > 0) {
            const restTimes = exerciseTimes.slice(1).map((ts, idx) => {
              const prevTime = idx === 0 && exIdx > 0 
                ? setTimestamps.find(t => t.exerciseIndex === exIdx - 1 && t.setIndex === exercises[exIdx - 1].sets.length - 1)?.elapsedSeconds || exerciseTimes[0].elapsedSeconds
                : exerciseTimes[idx].elapsedSeconds;
              return formatTime(ts.elapsedSeconds - prevTime);
            });
            
            if (restTimes.length > 0) {
              detailedSummary += `\n  Rest: ${restTimes.join(', ')}`;
            }
          }
        }
      });
      
      const timingInfo = workoutStarted && totalDuration > 0
        ? `\n\nTotal duration: ${formatTime(totalDuration)}${avgRestTime > 0 ? `\nAvg rest: ${formatTime(avgRestTime)}` : ''}`
        : '';
      
      // Add post-workout feedback if provided
      let postWorkoutInfo = '';
      if (postWorkoutData.difficulty || postWorkoutData.overallFeeling) {
        postWorkoutInfo += `\n\nPost-workout: Difficulty ${postWorkoutData.difficulty}/10, Feeling: ${postWorkoutData.overallFeeling}`;
        if (postWorkoutData.predictedSoreness) postWorkoutInfo += `, Expected soreness: ${postWorkoutData.predictedSoreness}`;
        if (postWorkoutData.notes) postWorkoutInfo += `\nNotes: ${postWorkoutData.notes}`;
      }
      
      await addConversationMessage(user.id, 'user', `${detailedSummary}${timingInfo}${postWorkoutInfo}`);
      await addConversationMessage(user.id, 'assistant', feedback);

      // Save to user's history
      await saveWorkoutToUser(user.id, completedWorkout);
      await clearCurrentWorkout(user.id);

      // Celebrate workout completion!
      motivate('workoutComplete');

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
      {/* Core Exercise Selector Modal */}
      {showCoreSelector && coreExerciseIndex !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-2">Choose Core Exercise</h3>
            <p className="text-gray-400 text-sm mb-4">Select an alternative for this set</p>
            
            <div className="grid grid-cols-2 gap-2 mb-6 max-h-[60vh] overflow-y-auto">
              {coreExerciseOptions.map((exerciseName) => (
                <button
                  key={exerciseName}
                  onClick={() => {
                    const updated = [...exercises];
                    updated[coreExerciseIndex].name = exerciseName;
                    setExercises(updated);
                    setShowCoreSelector(false);
                    setCoreExerciseIndex(null);
                  }}
                  className="py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all active:scale-95"
                >
                  {exerciseName}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                setShowCoreSelector(false);
                setCoreExerciseIndex(null);
              }}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Pre-Workout Modal */}
      {showPreWorkout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Pre-Workout Check-in</h3>
            <p className="text-gray-400 text-sm mb-6">Optional: Help the AI understand your readiness</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Energy Level</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={preWorkoutData.energyLevel}
                    onChange={(e) => setPreWorkoutData({...preWorkoutData, energyLevel: e.target.value})}
                    className="w-full"
                  />
                  <div className="text-center text-white font-bold">{preWorkoutData.energyLevel}/10</div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Stress Level</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={preWorkoutData.stressLevel}
                    onChange={(e) => setPreWorkoutData({...preWorkoutData, stressLevel: e.target.value})}
                    className="w-full"
                  />
                  <div className="text-center text-white font-bold">{preWorkoutData.stressLevel}/10</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Sleep Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={preWorkoutData.sleepHours}
                    onChange={(e) => setPreWorkoutData({...preWorkoutData, sleepHours: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Sleep Quality</label>
                  <select
                    value={preWorkoutData.sleepQuality}
                    onChange={(e) => setPreWorkoutData({...preWorkoutData, sleepQuality: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="excellent">Excellent</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Current Soreness/Recovery</label>
                <input
                  type="text"
                  placeholder="e.g., legs still sore, feeling fresh"
                  value={preWorkoutData.soreness}
                  onChange={(e) => setPreWorkoutData({...preWorkoutData, soreness: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Meals/Nutrition Today</label>
                <input
                  type="text"
                  placeholder="e.g., 3 meals, high protein, ate 2h ago"
                  value={preWorkoutData.mealsToday}
                  onChange={(e) => setPreWorkoutData({...preWorkoutData, mealsToday: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Additional Notes</label>
                <textarea
                  placeholder="Anything else to mention?"
                  value={preWorkoutData.notes}
                  onChange={(e) => setPreWorkoutData({...preWorkoutData, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={confirmStartWorkout}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg"
              >
                Start Workout
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Post-Workout Modal */}
      {showPostWorkout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Post-Workout Feedback</h3>
            <p className="text-gray-400 text-sm mb-6">Optional: Help the AI learn from this session</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Overall Difficulty</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={postWorkoutData.difficulty}
                  onChange={(e) => setPostWorkoutData({...postWorkoutData, difficulty: e.target.value})}
                  className="w-full"
                />
                <div className="text-center text-white font-bold">{postWorkoutData.difficulty}/10</div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">How Do You Feel?</label>
                <select
                  value={postWorkoutData.overallFeeling}
                  onChange={(e) => setPostWorkoutData({...postWorkoutData, overallFeeling: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="exhausted">Exhausted</option>
                  <option value="tired">Tired</option>
                  <option value="good">Good</option>
                  <option value="great">Great</option>
                  <option value="amazing">Amazing - could do more!</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Expected Soreness</label>
                <select
                  value={postWorkoutData.predictedSoreness}
                  onChange={(e) => setPostWorkoutData({...postWorkoutData, predictedSoreness: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="none">None/Minimal</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe/Very sore</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Notes</label>
                <textarea
                  placeholder="Exercises that felt good/bad, any concerns, etc."
                  value={postWorkoutData.notes}
                  onChange={(e) => setPostWorkoutData({...postWorkoutData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPostWorkout(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg"
              >
                Skip
              </button>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-lg"
              >
                {completing ? 'Saving...' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-4xl font-bold text-white">
                {exercises[currentExerciseIndex].name}
              </h2>
              {isBodyweightExercise(exercises[currentExerciseIndex]) && 
               exercises[currentExerciseIndex].name.toLowerCase().includes('core') && (
                <button
                  onClick={() => {
                    setCoreExerciseIndex(currentExerciseIndex);
                    setShowCoreSelector(true);
                  }}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all"
                  title="Change core exercise"
                >
                  🔄 Change
                </button>
              )}
            </div>
            <div className="text-2xl text-gray-300">
              Set {currentSetIndex + 1} of {exercises[currentExerciseIndex].sets.length}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
            {/* Weight Selection - Hidden for bodyweight exercises */}
            {!isBodyweightExercise(exercises[currentExerciseIndex]) && (
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 mb-2">Weight (lbs)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[-5, 0, 5].map((offset) => {
                    const currentWeight = exercises[currentExerciseIndex].sets[currentSetIndex].weight || 0;
                    const baseWeight = currentSetIndex > 0 
                      ? exercises[currentExerciseIndex].sets[0].weight || 0
                      : currentWeight;
                    const weightOption = Math.max(0, baseWeight + offset);
                    const isSelected = currentWeight === weightOption;
                    
                    return (
                      <button
                        key={offset}
                        onClick={() => updateSet(currentExerciseIndex, currentSetIndex, 'weight', weightOption)}
                        className={`py-3 px-3 rounded-lg font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:scale-95'
                        }`}
                      >
                        <div className="text-lg">{weightOption}</div>
                        <div className="text-xs opacity-70 mt-0.5">
                          {offset === 0 ? 'same' : `${offset > 0 ? '+' : ''}${offset} lb`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Bodyweight indicator */}
            {isBodyweightExercise(exercises[currentExerciseIndex]) && (
              <div className="mb-5 py-3 px-4 bg-blue-900/20 border border-blue-700/50 rounded-lg text-center">
                <span className="text-sm text-blue-400">🏋️ Bodyweight Exercise</span>
              </div>
            )}

            {/* Reps Selection */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">Reps</label>
              <div className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-2">
                <button
                  onClick={() => {
                    const currentReps = exercises[currentExerciseIndex].sets[currentSetIndex].reps || 0;
                    updateSet(currentExerciseIndex, currentSetIndex, 'reps', Math.max(0, currentReps - 1));
                  }}
                  className="w-10 h-10 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white rounded-md font-bold text-lg transition-all active:scale-95"
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <div className="text-3xl font-bold text-white">
                    {exercises[currentExerciseIndex].sets[currentSetIndex].reps || 0}
                  </div>
                  <div className="text-xs text-gray-400">reps</div>
                </div>
                <button
                  onClick={() => {
                    const currentReps = exercises[currentExerciseIndex].sets[currentSetIndex].reps || 0;
                    updateSet(currentExerciseIndex, currentSetIndex, 'reps', currentReps + 1);
                  }}
                  className="w-10 h-10 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white rounded-md font-bold text-lg transition-all active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Advanced Tracking Toggle */}
            <button
              onClick={() => setShowAdvancedTracking(!showAdvancedTracking)}
              className="w-full text-sm text-blue-400 hover:text-blue-300 mb-3"
            >
              {showAdvancedTracking ? '− Hide' : '+ Show'} Advanced Tracking (RPE, RIR, Notes)
            </button>
            
            {showAdvancedTracking && (
              <div className="space-y-3 mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">RPE (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Optional"
                      value={exercises[currentExerciseIndex].sets[currentSetIndex].rpe || ''}
                      onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'rpe', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">RIR (0-5)</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      placeholder="Optional"
                      value={exercises[currentExerciseIndex].sets[currentSetIndex].rir ?? ''}
                      onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'rir', e.target.value !== '' ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exercises[currentExerciseIndex].sets[currentSetIndex].toFailure || false}
                      onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'toFailure', e.target.checked)}
                      className="rounded"
                    />
                    To Failure
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exercises[currentExerciseIndex].sets[currentSetIndex].formBreakdown || false}
                      onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'formBreakdown', e.target.checked)}
                      className="rounded"
                    />
                    Form Breakdown
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exercises[currentExerciseIndex].sets[currentSetIndex].pain || false}
                      onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'pain', e.target.checked)}
                      className="rounded"
                    />
                    Pain/Discomfort
                  </label>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="Any observations about this set..."
                    value={exercises[currentExerciseIndex].sets[currentSetIndex].notes || ''}
                    onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'notes', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            )}

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
          
          <div className="space-yClick-3">
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

                <div className={`flex-1 grid gap-2 ${isBodyweightExercise(exercise) ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {!isBodyweightExercise(exercise) && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Weight</label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateSet(exIndex, setIndex, 'weight', Math.max(0, (set.weight || 0) - 5))}
                          className="w-7 h-7 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white rounded text-xs font-bold transition-all active:scale-95"
                        >
                          −5
                        </button>
                        <div className="flex-1 px-2 py-1.5 bg-gray-600 rounded text-white text-center text-sm font-semibold">
                          {set.weight || 0}
                        </div>
                        <button
                          onClick={() => updateSet(exIndex, setIndex, 'weight', (set.weight || 0) + 5)}
                          className="w-7 h-7 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white rounded text-xs font-bold transition-all active:scale-95"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{isBodyweightExercise(exercise) ? 'Reps / Duration (sec)' : 'Reps'}</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateSet(exIndex, setIndex, 'reps', Math.max(0, (set.reps || 0) - 1))}
                        className="w-7 h-7 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white rounded text-sm font-bold transition-all active:scale-95"
                      >
                        −
                      </button>
                      <div className="flex-1 px-2 py-1.5 bg-gray-600 rounded text-white text-center text-sm font-semibold">
                        {set.reps || 0}
                      </div>
                      <button
                        onClick={() => updateSet(exIndex, setIndex, 'reps', (set.reps || 0) + 1)}
                        className="w-7 h-7 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white rounded text-sm font-bold transition-all active:scale-95"
                      >
                        +
                      </button>
                    </div>
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
