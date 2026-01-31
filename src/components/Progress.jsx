import React, { useState } from 'react';
import { getExerciseHistory, getTodayWorkout, getWeekSummary } from '../utils/storage';

function Progress({ user, onRefresh }) {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // days
  
  const exerciseHistory = getExerciseHistory(user);
  const todayWorkout = getTodayWorkout(user);
  const weekStats = getWeekSummary(user);

  // Get calendar data for last N days
  const getCalendarData = () => {
    const days = [];
    const today = new Date();
    const workouts = user?.workouts || [];
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const workout = workouts.find(w => w.date === dateStr);
      
      days.push({
        date: dateStr,
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        workout: workout,
        isToday: dateStr === today.toISOString().split('T')[0]
      });
    }
    
    return days;
  };

  const calendarData = getCalendarData();
  const workoutDays = calendarData.filter(d => d.workout).length;
  const consistency = Math.round((workoutDays / timeRange) * 100);

  const renderExerciseChart = (exercise) => {
    // Get data points for chart (last 10 sessions)
    const dataPoints = exercise.history.slice(-10);
    const maxWeight = Math.max(...dataPoints.map(h => h.maxWeight));
    const minWeight = Math.min(...dataPoints.map(h => h.maxWeight));
    const range = maxWeight - minWeight || 1;
    
    const firstSession = exercise.history[0];
    const lastSession = exercise.history[exercise.history.length - 1];
    const totalImprovement = lastSession.maxWeight - firstSession.maxWeight;
    const improvementPercent = firstSession.maxWeight > 0 
      ? ((totalImprovement / firstSession.maxWeight) * 100).toFixed(1)
      : 0;

    return (
      <div className="mt-4 space-y-6">
        {/* Key Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Start</div>
            <div className="text-lg font-bold text-white">{firstSession.maxWeight}</div>
            <div className="text-xs text-gray-500">lbs</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Current</div>
            <div className="text-lg font-bold text-green-400">{lastSession.maxWeight}</div>
            <div className="text-xs text-gray-500">lbs</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Gain</div>
            <div className="text-lg font-bold text-blue-400">+{totalImprovement}</div>
            <div className="text-xs text-gray-500">lbs</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Progress</div>
            <div className="text-lg font-bold text-purple-400">{improvementPercent}%</div>
            <div className="text-xs text-gray-500">increase</div>
          </div>
        </div>

        {/* Session by Session Progress - Bar Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Weight Progress (Last 10 Sessions)</h4>
          <div className="space-y-2">
            {dataPoints.map((session, idx) => {
              const prevSession = idx > 0 ? dataPoints[idx - 1] : null;
              const weightChange = prevSession ? session.maxWeight - prevSession.maxWeight : 0;
              const heightPercent = ((session.maxWeight - minWeight) / range) * 60 + 40; // 40-100%
              
              return (
                <div key={idx} className="flex items-end gap-2">
                  <div className="w-16 text-xs text-gray-500">
                    {new Date(session.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  <div className="flex-1 flex items-end gap-2">
                    {/* Weight Bar */}
                    <div className="flex-1 relative">
                      <div 
                        className={`rounded-t transition-all ${
                          weightChange > 0 ? 'bg-gradient-to-t from-green-600 to-green-500' :
                          weightChange < 0 ? 'bg-gradient-to-t from-red-600 to-red-500' :
                          'bg-gradient-to-t from-blue-600 to-blue-500'
                        }`}
                        style={{ height: `${heightPercent}px` }}
                      >
                        <div className="absolute -top-6 left-0 right-0 text-center">
                          <span className="text-xs font-semibold text-white bg-gray-900/80 px-2 py-0.5 rounded">
                            {session.maxWeight}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="w-32 text-xs text-gray-400 pb-1">
                      {session.sets} sets × {session.avgReps} reps
                      {weightChange !== 0 && (
                        <span className={`ml-2 font-semibold ${
                          weightChange > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {weightChange > 0 ? '+' : ''}{weightChange}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volume Trend */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Volume Trend (Weight × Reps)</h4>
          <div className="flex items-end gap-1 h-24">
            {dataPoints.map((session, idx) => {
              const maxVol = Math.max(...dataPoints.map(s => s.totalVolume));
              const heightPercent = (session.totalVolume / maxVol) * 100;
              
              return (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative">
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                    {session.totalVolume.toLocaleString()} lbs
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-500 rounded-t transition-all hover:from-purple-500 hover:to-purple-400"
                    style={{ height: `${heightPercent}%` }}
                  />
                  {idx % 2 === 0 && (
                    <div className="text-xs text-gray-600 mt-1 absolute -bottom-5">
                      {new Date(session.date).getDate()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar View */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">📅 Workout Calendar</h3>
            <p className="text-sm text-gray-400 mt-1">
              {workoutDays} workouts in last {timeRange} days • {consistency}% consistency
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange(14)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === 14 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              2 Weeks
            </button>
            <button
              onClick={() => setTimeRange(30)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === 30 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange(90)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === 90 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              3 Months
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarData.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square rounded-lg p-2 text-center transition-all ${
                day.workout
                  ? day.isToday
                    ? 'bg-gradient-to-br from-green-600 to-green-700 border-2 border-green-400'
                    : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
                  : day.isToday
                    ? 'bg-gray-700 border-2 border-gray-500'
                    : 'bg-gray-800 hover:bg-gray-750'
              } ${day.workout ? 'cursor-pointer' : ''}`}
              title={day.workout ? `${day.workout.exercises?.length || 0} exercises` : 'Rest day'}
            >
              <div className="text-xs text-gray-400">{day.dayName}</div>
              <div className={`text-lg font-bold ${
                day.workout ? 'text-white' : 'text-gray-600'
              }`}>
                {day.day}
              </div>
              {day.workout && (
                <div className="text-xs text-gray-200 mt-1">
                  {day.workout.exercises?.length || 0}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Week Summary */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📊 This Week's Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">{weekStats.workouts}</div>
            <div className="text-sm text-gray-400">Workouts</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400">{weekStats.exercises}</div>
            <div className="text-sm text-gray-400">Exercises</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">{weekStats.sets}</div>
            <div className="text-sm text-gray-400">Total Sets</div>
          </div>
        </div>
      </div>

      {/* Exercise Progress */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">💪 Exercise Progression</h3>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {exerciseHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-3">📈</div>
            <p>Complete workouts to see progression charts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exerciseHistory.map((exercise, idx) => (
              <div
                key={idx}
                className="bg-gray-700/50 border border-gray-600 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setSelectedExercise(
                    selectedExercise?.name === exercise.name ? null : exercise
                  )}
                  className="w-full p-4 text-left hover:bg-gray-700 transition-all flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg">{exercise.name}</h4>
                    <div className="text-sm text-gray-400 mt-1 flex gap-4">
                      <span>{exercise.totalSessions} sessions</span>
                      <span>•</span>
                      <span>{exercise.firstWeight} → {exercise.latestWeight} lbs</span>
                      <span>•</span>
                      <span className="text-green-400 font-semibold">
                        +{exercise.latestWeight - exercise.firstWeight} lbs
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      selectedExercise?.name === exercise.name ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {selectedExercise?.name === exercise.name && (
                  <div className="px-4 pb-4 border-t border-gray-600">
                    {renderExerciseChart(exercise)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Progress;
