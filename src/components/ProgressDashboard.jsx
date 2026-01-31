import React, { useState, useMemo } from 'react';

function ProgressDashboard({ user }) {
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Calculate stats
  const stats = useMemo(() => {
    // Safety check: ensure workouts array exists
    if (!user || !user.workouts || !Array.isArray(user.workouts)) {
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        avgWorkoutTime: 0,
        exerciseMap: {},
        prs: {},
        uniqueExercises: 0
      };
    }
    
    const totalWorkouts = user.workouts.length;
    const totalVolume = user.workouts.reduce((sum, w) => {
      return sum + w.exercises.reduce((exSum, ex) => {
        return exSum + ex.sets.reduce((setSum, set) => {
          return setSum + (set.weight * set.reps);
        }, 0);
      }, 0);
    }, 0);
    
    const avgWorkoutTime = user.workouts
      .filter(w => w.totalDuration)
      .reduce((sum, w, _, arr) => sum + w.totalDuration / arr.length, 0);
    
    // Get unique exercises
    const exerciseMap = {};
    user.workouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        if (!exerciseMap[ex.name]) {
          exerciseMap[ex.name] = [];
        }
        ex.sets.forEach(set => {
          if (set.completed && set.weight > 0 && set.reps > 0) {
            exerciseMap[ex.name].push({
              date: workout.date,
              weight: set.weight,
              reps: set.reps,
              volume: set.weight * set.reps
            });
          }
        });
      });
    });
    
    // Calculate PRs
    const prs = {};
    Object.entries(exerciseMap).forEach(([name, sets]) => {
      if (sets.length > 0) {
        prs[name] = {
          maxWeight: Math.max(...sets.map(s => s.weight)),
          maxVolume: Math.max(...sets.map(s => s.volume)),
          totalSets: sets.length
        };
      }
    });
    
    return {
      totalWorkouts,
      totalVolume,
      avgWorkoutTime,
      exerciseMap,
      prs,
      uniqueExercises: Object.keys(exerciseMap).length
    };
  }, [user.workouts]);
  
  // Get last 30 days for calendar heatmap
  const last30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    const workouts = user?.workouts || [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasWorkout = workouts.some(w => w.date === dateStr);
      days.push({ date: dateStr, hasWorkout, day: date.getDate() });
    }
    return days;
  }, [user.workouts]);
  
  const exercises = Object.keys(stats.exerciseMap).sort();
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-700">
          <div className="text-3xl font-bold text-blue-400">{stats.totalWorkouts}</div>
          <div className="text-sm text-gray-400">Total Workouts</div>
        </div>
        
        <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-700">
          <div className="text-3xl font-bold text-purple-400">
            {(stats.totalVolume / 1000).toFixed(0)}k
          </div>
          <div className="text-sm text-gray-400">Pounds Lifted</div>
        </div>
        
        <div className="bg-green-900/30 backdrop-blur-sm rounded-xl p-4 border border-green-700">
          <div className="text-3xl font-bold text-green-400">{stats.uniqueExercises}</div>
          <div className="text-sm text-gray-400">Exercises Done</div>
        </div>
        
        <div className="bg-orange-900/30 backdrop-blur-sm rounded-xl p-4 border border-orange-700">
          <div className="text-3xl font-bold text-orange-400">
            {Math.floor(stats.avgWorkoutTime / 60)}m
          </div>
          <div className="text-sm text-gray-400">Avg Duration</div>
        </div>
      </div>
      
      {/* Activity Calendar Heatmap */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📅 Last 30 Days</h3>
        <div className="grid grid-cols-10 gap-2">
          {last30Days.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square rounded ${
                day.hasWorkout 
                  ? 'bg-green-600 hover:bg-green-500' 
                  : 'bg-gray-700 hover:bg-gray-600'
              } flex items-center justify-center text-xs text-white cursor-pointer transition-all`}
              title={`${day.date}${day.hasWorkout ? ' ✓' : ''}`}
            >
              {day.day}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-700 rounded"></div> Rest day
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div> Workout
          </span>
        </div>
      </div>
      
      {/* Personal Records */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">💪 Personal Records</h3>
        
        {exercises.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Complete some workouts to see your PRs!</p>
        ) : (
          <div className="space-y-3">
            {exercises.slice(0, 5).map(name => {
              // Safety check: ensure prs entry exists
              if (!stats.prs[name]) return null;
              
              return (
              <div
                key={name}
                className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900/70 transition-all cursor-pointer"
                onClick={() => setSelectedExercise(selectedExercise === name ? null : name)}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium text-white">{name}</div>
                  <div className="text-sm text-gray-400">
                    {stats.prs[name].totalSets} sets · Max: {stats.prs[name].maxWeight}lbs
                  </div>
                </div>
                
                {selectedExercise === name && stats.exerciseMap[name] && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">Recent Progress:</div>
                    <div className="space-y-1">
                      {stats.exerciseMap[name].slice(-5).reverse().map((set, idx) => (
                        <div key={idx} className="text-xs text-gray-500 flex justify-between">
                          <span>{set.date}</span>
                          <span>{set.weight}lbs × {set.reps} reps ({set.volume}lbs volume)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
            })}
            
            {exercises.length > 5 && (
              <p className="text-sm text-gray-400 text-center">+ {exercises.length - 5} more exercises</p>
            )}
          </div>
        )}
      </div>
      
      {/* Volume Over Time */}
      {user?.workouts?.length >= 3 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">📈 Volume Trend</h3>
          <div className="h-48 flex items-end justify-between gap-1">
            {user.workouts.slice(-10).map((workout, idx) => {
              const volume = workout.exercises?.reduce((sum, ex) => {
                return sum + (ex.sets?.reduce((exSum, set) => {
                  return exSum + ((set.weight || 0) * (set.reps || 0));
                }, 0) || 0);
              }, 0) || 0;
              
              const maxVolume = Math.max(...user.workouts.slice(-10).map(w => 
                w.exercises?.reduce((sum, ex) => 
                  sum + (ex.sets?.reduce((exSum, set) => exSum + ((set.weight || 0) * (set.reps || 0)), 0) || 0), 0
                ) || 1
              ), 1);
              
              const height = (volume / maxVolume) * 100;
              
              return (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-500 hover:to-blue-300 transition-all cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${new Date(workout.date).toLocaleDateString()}: ${(volume / 1000).toFixed(1)}k lbs`}
                />
              );
            })}
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">Last 10 workouts</div>
        </div>
      )}
    </div>
  );
}

export default ProgressDashboard;
