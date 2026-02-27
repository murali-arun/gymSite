import React, { useMemo, useState } from 'react';
import { checkWorkoutMuscleCoverage } from '../../../services/api';
import { useCoach } from '../../../contexts/CoachContext';

const EXERCISE_LIBRARY = {
  Neck: [
    'Neck Isometric Holds (front/back/sides)',
    'Prone Neck Extension',
    'Supine Chin Tuck',
    'Wall Chin Retraction',
    'Resistance Band Neck Flexion'
  ],
  Shoulders: [
    'Pike Push-Up',
    'Dumbbell Lateral Raise',
    'Dumbbell Arnold Press',
    'Band Face Pull',
    'Rear Delt Fly'
  ],
  Chest: [
    'Push-Up',
    'Decline Push-Up',
    'Dumbbell Floor Press',
    'Dumbbell Squeeze Press',
    'Band Chest Fly'
  ],
  Back: [
    'Inverted Row (table/bar)',
    'One-Arm Dumbbell Row',
    'Band Lat Pulldown',
    'Superman Hold',
    'Band Pull-Apart'
  ],
  Biceps: [
    'Dumbbell Hammer Curl',
    'Alternating Dumbbell Curl',
    'Band Curl',
    'Zottman Curl',
    'Concentration Curl'
  ],
  Triceps: [
    'Chair Dips',
    'Diamond Push-Up',
    'Overhead Dumbbell Triceps Extension',
    'Band Triceps Pushdown',
    'Close-Grip Push-Up'
  ],
  Forearms: [
    'Wrist Curl',
    'Reverse Wrist Curl',
    'Farmer Carry',
    'Towel Grip Hold',
    'Plate Pinch Hold'
  ],
  Core: [
    'Dead Bug',
    'Plank Shoulder Taps',
    'Hollow Body Hold',
    'Russian Twist',
    'Leg Raise'
  ],
  Glutes: [
    'Hip Thrust',
    'Single-Leg Glute Bridge',
    'Bulgarian Split Squat',
    'Banded Lateral Walk',
    'Step-Up'
  ],
  Quads: [
    'Goblet Squat',
    'Reverse Lunge',
    'Split Squat',
    'Wall Sit',
    'Cyclist Squat'
  ],
  Hamstrings: [
    'Romanian Deadlift (DB)',
    'Single-Leg Romanian Deadlift',
    'Hamstring Walkout',
    'Sliding Leg Curl',
    'Good Morning (band/bodyweight)'
  ],
  Calves: [
    'Standing Calf Raise',
    'Single-Leg Calf Raise',
    'Seated Calf Raise (DB on knee)',
    'Tempo Calf Raise',
    'Jump Rope Calf Bounce'
  ]
};

function createDefaultExercise(exerciseName) {
  return {
    name: exerciseName,
    perSide: false,
    recommendedRest: 60,
    sets: [
      { weight: 0, reps: 10, completed: false },
      { weight: 0, reps: 10, completed: false },
      { weight: 0, reps: 10, completed: false }
    ]
  };
}

export default function CustomWorkoutBuilder({ user, onStartWorkout }) {
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [targetMuscles, setTargetMuscles] = useState('');
  const [customExerciseInput, setCustomExerciseInput] = useState('');
  const [customExercises, setCustomExercises] = useState([]);
  const [checkingCoverage, setCheckingCoverage] = useState(false);
  const [coverageResult, setCoverageResult] = useState(null);
  const { motivate } = useCoach();

  const allExercises = useMemo(() => {
    return [...selectedExercises, ...customExercises.filter(Boolean)];
  }, [selectedExercises, customExercises]);

  const toggleExercise = (exerciseName) => {
    setCoverageResult(null);
    setSelectedExercises(prev => {
      if (prev.includes(exerciseName)) {
        return prev.filter(item => item !== exerciseName);
      }
      return [...prev, exerciseName];
    });
  };

  const addCustomExercise = () => {
    const trimmed = customExerciseInput.trim();
    if (!trimmed) return;

    const lowerCaseNames = allExercises.map(name => name.toLowerCase());
    if (lowerCaseNames.includes(trimmed.toLowerCase())) {
      alert('Exercise already added.');
      return;
    }

    setCustomExercises(prev => [...prev, trimmed]);
    setCustomExerciseInput('');
    setCoverageResult(null);
  };

  const removeCustomExercise = (exerciseName) => {
    setCustomExercises(prev => prev.filter(item => item !== exerciseName));
    setCoverageResult(null);
  };

  const runCoverageCheck = async () => {
    if (!targetMuscles.trim()) {
      alert('Please add your target muscles description first.');
      return;
    }

    if (allExercises.length === 0) {
      alert('Please select at least one exercise first.');
      return;
    }

    setCheckingCoverage(true);
    try {
      const result = await checkWorkoutMuscleCoverage(user, targetMuscles, allExercises);
      setCoverageResult(result);
    } finally {
      setCheckingCoverage(false);
    }
  };

  const startCustomWorkout = () => {
    if (allExercises.length === 0) {
      alert('Select at least one exercise to create your workout.');
      return;
    }

    const workout = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'strength',
      exercises: allExercises.map(createDefaultExercise),
      aiSuggestion: targetMuscles.trim()
        ? `Target muscles: ${targetMuscles.trim()}`
        : 'Custom workout created from selected exercises',
      aiResponse: 'Custom workout created by you.',
      generatedAt: new Date().toISOString(),
      fromCustomBuilder: true,
      description: targetMuscles.trim() || 'Custom workout'
    };

    motivate('workoutGenerated');
    onStartWorkout(workout);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create Your Own Workout</h2>
        <p className="text-gray-400 mb-6">Pick from intermediate, home-friendly exercises by body part. Use AI only to verify muscle coverage.</p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Target muscles description</label>
          <textarea
            value={targetMuscles}
            onChange={(event) => {
              setTargetMuscles(event.target.value);
              setCoverageResult(null);
            }}
            rows={3}
            placeholder="Example: chest, front delts, triceps and core"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="space-y-4">
          {Object.entries(EXERCISE_LIBRARY).map(([bodyPart, exercises]) => (
            <div key={bodyPart} className="bg-gray-700/40 border border-gray-600 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">{bodyPart}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {exercises.map(exerciseName => (
                  <label
                    key={exerciseName}
                    className="flex items-start gap-3 px-3 py-2 rounded-lg bg-gray-800/60 hover:bg-gray-700/80 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExercises.includes(exerciseName)}
                      onChange={() => toggleExercise(exerciseName)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-200">{exerciseName}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-gray-700/40 border border-gray-600 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Add Custom Exercise</h3>
          <div className="flex gap-2">
            <input
              value={customExerciseInput}
              onChange={(event) => setCustomExerciseInput(event.target.value)}
              placeholder="Type your exercise name"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addCustomExercise}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              Add
            </button>
          </div>
          {customExercises.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {customExercises.map(exerciseName => (
                <div key={exerciseName} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-200 text-sm">
                  {exerciseName}
                  <button
                    type="button"
                    onClick={() => removeCustomExercise(exerciseName)}
                    className="text-blue-200 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={runCoverageCheck}
            disabled={checkingCoverage}
            className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingCoverage ? 'Checking...' : '🤖 Check Muscle Coverage'}
          </button>
          <button
            type="button"
            onClick={startCustomWorkout}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all"
          >
            ✓ Start Custom Workout ({allExercises.length})
          </button>
        </div>
      </div>

      {coverageResult && (
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-5 space-y-3">
          <h3 className="text-blue-300 font-semibold">AI Coverage Check</h3>
          <p className="text-gray-200 text-sm">{coverageResult.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-3">
              <div className="text-green-300 text-sm font-medium mb-1">Covered</div>
              <div className="text-xs text-gray-200">{coverageResult.coveredMuscles?.length ? coverageResult.coveredMuscles.join(', ') : 'None detected'}</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3">
              <div className="text-yellow-300 text-sm font-medium mb-1">Weak Coverage</div>
              <div className="text-xs text-gray-200">{coverageResult.weakCoverage?.length ? coverageResult.weakCoverage.join(', ') : 'None'}</div>
            </div>
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3">
              <div className="text-red-300 text-sm font-medium mb-1">Missing</div>
              <div className="text-xs text-gray-200">{coverageResult.missingMuscles?.length ? coverageResult.missingMuscles.join(', ') : 'None'}</div>
            </div>
          </div>

          {coverageResult.suggestions?.length > 0 && (
            <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-3">
              <div className="text-gray-200 text-sm font-medium mb-1">Suggested additions</div>
              <ul className="text-xs text-gray-300 space-y-1">
                {coverageResult.suggestions.map(suggestion => (
                  <li key={suggestion}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
