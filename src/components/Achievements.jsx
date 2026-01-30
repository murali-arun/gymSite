import React from 'react';

const BADGES = [
  { id: 'first_workout', name: 'First Step', description: 'Complete your first workout', icon: '🎯', requirement: (user) => user.workouts.length >= 1 },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day workout streak', icon: '🔥', requirement: (user) => getStreak(user) >= 7 },
  { id: 'month_master', name: 'Month Master', description: '30-day workout streak', icon: '💪', requirement: (user) => getStreak(user) >= 30 },
  { id: 'century', name: 'Century Club', description: '100 workouts completed', icon: '💯', requirement: (user) => user.workouts.length >= 100 },
  { id: 'consistent', name: 'Consistency King', description: '4 weeks of 3+ workouts/week', icon: '👑', requirement: (user) => checkConsistency(user, 4, 3) },
  { id: 'volume_10k', name: '10K Club', description: 'Move 10,000 lbs in one workout', icon: '🏋️', requirement: (user) => checkMaxVolume(user, 10000) },
  { id: 'volume_50k', name: '50K Beast', description: 'Move 50,000 lbs in one workout', icon: '🦍', requirement: (user) => checkMaxVolume(user, 50000) },
  { id: 'volume_100k', name: '100K Titan', description: 'Move 100,000 lbs in one workout', icon: '⚡', requirement: (user) => checkMaxVolume(user, 100000) },
  { id: 'pr_hunter', name: 'PR Hunter', description: 'Set 10 personal records', icon: '🎖️', requirement: (user) => countPRs(user) >= 10 },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete 10 morning workouts', icon: '🌅', requirement: (user) => countMorningWorkouts(user) >= 10 },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete 10 evening workouts', icon: '🌙', requirement: (user) => countEveningWorkouts(user) >= 10 },
  { id: 'speedster', name: 'Speedster', description: 'Complete workout in under 30 minutes', icon: '⚡', requirement: (user) => checkFastestWorkout(user, 1800) },
  { id: 'endurance', name: 'Endurance', description: 'Complete 90+ minute workout', icon: '🏃', requirement: (user) => checkLongestWorkout(user, 5400) },
];

function getStreak(user) {
  if (!user.workouts.length) return 0;
  
  const sortedDates = [...new Set(user.workouts.map(w => w.date))].sort().reverse();
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const workoutDate = new Date(sortedDates[i]);
    workoutDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === i) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function checkConsistency(user, weeks, minWorkoutsPerWeek) {
  if (user.workouts.length < weeks * minWorkoutsPerWeek) return false;
  
  const now = new Date();
  const weeksAgo = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  
  const recentWorkouts = user.workouts.filter(w => new Date(w.date) >= weeksAgo);
  const weekGroups = {};
  
  recentWorkouts.forEach(w => {
    const weekKey = getWeekKey(new Date(w.date));
    weekGroups[weekKey] = (weekGroups[weekKey] || 0) + 1;
  });
  
  const weekCounts = Object.values(weekGroups);
  return weekCounts.length >= weeks && weekCounts.every(count => count >= minWorkoutsPerWeek);
}

function getWeekKey(date) {
  const year = date.getFullYear();
  const week = Math.ceil((date - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
}

function checkMaxVolume(user, targetVolume) {
  return user.workouts.some(workout => {
    const volume = workout.exercises.reduce((total, ex) => {
      return total + ex.sets.reduce((exTotal, set) => {
        return exTotal + (set.weight * set.reps);
      }, 0);
    }, 0);
    return volume >= targetVolume;
  });
}

function countPRs(user) {
  // This would need PR tracking implementation
  return 0; // Placeholder
}

function countMorningWorkouts(user) {
  return user.workouts.filter(w => {
    const hour = new Date(w.completedAt).getHours();
    return hour >= 5 && hour < 12;
  }).length;
}

function countEveningWorkouts(user) {
  return user.workouts.filter(w => {
    const hour = new Date(w.completedAt).getHours();
    return hour >= 18 && hour < 24;
  }).length;
}

function checkFastestWorkout(user, maxSeconds) {
  return user.workouts.some(w => w.totalDuration && w.totalDuration <= maxSeconds);
}

function checkLongestWorkout(user, minSeconds) {
  return user.workouts.some(w => w.totalDuration && w.totalDuration >= minSeconds);
}

function Achievements({ user }) {
  const earnedBadges = BADGES.filter(badge => badge.requirement(user));
  const lockedBadges = BADGES.filter(badge => !badge.requirement(user));
  const streak = getStreak(user);
  
  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">🔥 Current Streak</h3>
            <p className="text-gray-300 text-sm">Keep the momentum going!</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-400">{streak}</div>
            <div className="text-sm text-gray-400">days</div>
          </div>
        </div>
        
        {streak > 0 && (
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-300">
              {streak >= 7 ? `Amazing! ${streak} days strong! 💪` : 
               streak >= 3 ? `Great work! ${7 - streak} days until week warrior!` :
               `${3 - streak} more day${3 - streak > 1 ? 's' : ''} to build a solid habit!`}
            </p>
          </div>
        )}
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">🏆 Achievements ({earnedBadges.length}/{BADGES.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earnedBadges.map(badge => (
              <div
                key={badge.id}
                className="bg-gradient-to-br from-yellow-900/30 to-yellow-700/30 border border-yellow-600 rounded-xl p-4 text-center"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="font-bold text-white text-sm mb-1">{badge.name}</div>
                <div className="text-xs text-gray-400">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">🔒 Locked Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {lockedBadges.map(badge => (
              <div
                key={badge.id}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center opacity-60"
              >
                <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                <div className="font-bold text-gray-400 text-sm mb-1">{badge.name}</div>
                <div className="text-xs text-gray-500">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Achievements;
