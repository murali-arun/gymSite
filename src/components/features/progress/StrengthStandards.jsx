import React, { useState, useMemo } from 'react';
import { getBest1RM, getStrengthLevel } from '../../../utils/strengthCalculator';
import { getExerciseHistory } from '../../../utils/storage';

const StrengthStandards = ({ user }) => {
  const [bodyweight, setBodyweight] = useState(180);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const exerciseHistory = useMemo(() => getExerciseHistory(user), [user?.workouts]);

  // Focus on main lifts
  const mainLifts = useMemo(() => {
    const liftNames = ['squat', 'bench', 'deadlift', 'press', 'row'];
    return exerciseHistory.filter(ex => 
      liftNames.some(lift => ex.name.toLowerCase().includes(lift))
    );
  }, [exerciseHistory]);

  // Calculate 1RMs and strength levels
  const liftData = useMemo(() => {
    return mainLifts.map(exercise => {
      const best = getBest1RM(exercise.history);
      const level = best ? getStrengthLevel(exercise.name, best.oneRepMax, bodyweight) : null;
      
      return {
        exercise: exercise.name,
        best,
        level,
        history: exercise.history
      };
    }).filter(data => data.best && data.level?.found);
  }, [mainLifts, bodyweight]);

  if (liftData.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="text-center">
          <div className="text-5xl mb-3">💪</div>
          <h3 className="text-xl font-bold text-white mb-2">Strength Standards</h3>
          <p className="text-gray-400 text-sm">
            Complete workouts with compound lifts (squat, bench, deadlift, etc.) to see your strength level
          </p>
        </div>
      </div>
    );
  }

  const levelColors = {
    untrained: 'bg-gray-600',
    novice: 'bg-blue-600',
    intermediate: 'bg-green-600',
    advanced: 'bg-purple-600',
    elite: 'bg-yellow-500'
  };

  const levelEmojis = {
    untrained: '🌱',
    novice: '💪',
    intermediate: '🔥',
    advanced: '⚡',
    elite: '👑'
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Strength Standards</h2>
          <p className="text-sm text-gray-400 mt-1">Estimated 1RM and strength levels</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Bodyweight:</label>
          <input
            type="number"
            value={bodyweight}
            onChange={(e) => setBodyweight(parseInt(e.target.value) || 180)}
            className="w-20 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="100"
            max="400"
          />
          <span className="text-sm text-gray-400">lbs</span>
        </div>
      </div>

      <div className="space-y-4">
        {liftData.map(({ exercise, best, level }) => (
          <div key={exercise} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">{exercise}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-bold text-blue-400">{best.oneRepMax} lbs</span>
                  <span className="text-sm text-gray-500">estimated 1RM</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl">{levelEmojis[level.level]}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white capitalize ${levelColors[level.level]}`}>
                  {level.level}
                </span>
              </div>
            </div>

            {/* Progress bar showing position in strength standards */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Untrained</span>
                <span className="font-semibold text-white">{level.percentage}%</span>
                <span>Elite</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
                {level.allLevels.map((lvl, idx) => {
                  const isActive = level.allLevels.indexOf(level.level) >= idx;
                  return (
                    <div
                      key={lvl}
                      className={`flex-1 transition-all ${isActive ? levelColors[lvl] : 'bg-gray-700'}`}
                      style={{
                        opacity: isActive ? 
                          (level.level === lvl ? 1 : 0.5) : 
                          0.3
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Next goal */}
            {level.level !== 'elite' && (
              <div className="text-sm text-gray-400 bg-gray-800/50 rounded px-3 py-2">
                <span className="font-semibold text-white">Next: {level.nextLevel}</span>
                {' • '}
                Need <span className="font-semibold text-green-400">+{level.gap} lbs</span>
                {' • '}
                Target: <span className="font-semibold text-white">{level.nextTarget} lbs</span>
              </div>
            )}

            {/* Training weights button */}
            <button
              onClick={() => setSelectedExercise(selectedExercise === exercise ? null : exercise)}
              className="mt-3 w-full text-sm text-blue-400 hover:text-blue-300 transition-all flex items-center justify-center gap-2"
            >
              {selectedExercise === exercise ? '▼' : '▶'} Training Weights
            </button>

            {/* Training weights table */}
            {selectedExercise === exercise && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {Object.entries(best.trainingWeights).map(([percentage, weight]) => (
                  <div key={percentage} className="bg-gray-800/70 rounded px-3 py-2 flex justify-between">
                    <span className="text-gray-400">{percentage}</span>
                    <span className="font-semibold text-white">{weight} lbs</span>
                  </div>
                ))}
              </div>
            )}

            {/* Based on info */}
            <div className="mt-2 text-xs text-gray-500">
              Based on {best.basedOn.maxWeight} lbs × {Math.round(best.basedOn.avgReps)} reps
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex flex-wrap gap-3 justify-center text-xs">
          {Object.entries(levelEmojis).map(([level, emoji]) => (
            <div key={level} className="flex items-center gap-1.5">
              <span>{emoji}</span>
              <span className="capitalize text-gray-400">{level}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          Standards based on ExRx.net for male lifters at {bodyweight} lbs bodyweight
        </p>
      </div>
    </div>
  );
};

export default StrengthStandards;
