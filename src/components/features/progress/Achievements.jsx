import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCoach } from '../../../contexts/CoachContext';

const BADGES = [
  { id: 'first_workout', name: 'First Step', description: 'Complete your first workout', icon: '🎯', requirement: (user) => user?.workouts?.length >= 1 },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day workout streak', icon: '🔥', requirement: (user) => getStreak(user) >= 7 },
  { id: 'month_master', name: 'Month Master', description: '30-day workout streak', icon: '💪', requirement: (user) => getStreak(user) >= 30 },
  { id: 'century', name: 'Century Club', description: '100 workouts completed', icon: '💯', requirement: (user) => user?.workouts?.length >= 100 },
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
  if (!user?.workouts?.length) return 0;
  
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
  if (!user?.workouts?.length || user.workouts.length < weeks * minWorkoutsPerWeek) return false;
  
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
  if (!user?.workouts?.length) return false;
  return user.workouts.some(workout => {
    const volume = workout.exercises?.reduce((total, ex) => {
      return total + (ex.sets?.reduce((exTotal, set) => {
        return exTotal + ((set.weight || 0) * (set.reps || 0));
      }, 0) || 0);
    }, 0) || 0;
    return volume >= targetVolume;
  });
}

function countPRs(user) {
  // This would need PR tracking implementation
  return 0; // Placeholder
}

function countMorningWorkouts(user) {
  if (!user?.workouts?.length) return 0;
  return user.workouts.filter(w => {
    const hour = new Date(w.completedAt).getHours();
    return hour >= 5 && hour < 12;
  }).length;
}

function countEveningWorkouts(user) {
  if (!user?.workouts?.length) return 0;
  return user.workouts.filter(w => {
    const hour = new Date(w.completedAt).getHours();
    return hour >= 18 && hour < 24;
  }).length;
}

function checkFastestWorkout(user, maxSeconds) {
  if (!user?.workouts?.length) return false;
  return user.workouts.some(w => w.totalDuration && w.totalDuration <= maxSeconds);
}

function checkLongestWorkout(user, minSeconds) {
  if (!user?.workouts?.length) return false;
  return user.workouts.some(w => w.totalDuration && w.totalDuration >= minSeconds);
}

function Achievements({ user }) {
  const { motivate } = useCoach();
  
  // Safety check: ensure user and workouts exist
  if (!user || !user.workouts || !Array.isArray(user.workouts)) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <p className="text-gray-400 text-center">No achievement data available.</p>
      </div>
    );
  }
  
  // Memoize expensive badge calculations
  const { earnedBadges, lockedBadges } = useMemo(() => {
    const earned = BADGES.filter(badge => badge.requirement(user));
    const locked = BADGES.filter(badge => !badge.requirement(user));
    return { earnedBadges: earned, lockedBadges: locked };
  }, [user.workouts]);
  const streak = getStreak(user);
  
  // Celebrate streak milestones on mount
  useEffect(() => {
    if (streak >= 7 && streak % 7 === 0) {
      motivate('streak');
    }
  }, [streak, motivate]);
  
  return (
    <div className="space-y-8">
      {/* Streak Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-orange-900/40 to-red-900/30 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/40 shadow-2xl shadow-orange-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent"></div>
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="text-4xl sm:text-5xl bg-gradient-to-br from-orange-500 to-red-500 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
              🔥
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">Current Streak</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">Keep the momentum going!</p>
            </div>
          </div>
          <div className="text-center bg-gradient-to-br from-gray-900/70 to-gray-900/50 rounded-2xl px-8 py-4 shadow-xl border border-orange-400/20">
            <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{streak}</div>
            <div className="text-xs sm:text-sm text-gray-400">days</div>
          </div>
        </div>
        
        {streak > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 p-3 bg-gray-900/60 rounded-xl flex items-center gap-2 border border-gray-800"
          >
            <span className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-8 h-8 flex items-center justify-center shrink-0 shadow-md">
              💪
            </span>
            <p className="text-xs sm:text-sm text-gray-300 leading-snug">
              {streak >= 7 ? `Amazing! ${streak} days strong!` : 
               streak >= 3 ? `Great work! ${7 - streak} days until week warrior!` :
               `${3 - streak} more day${3 - streak > 1 ? 's' : ''} to build a solid habit!`}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl sm:text-3xl bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full w-10 h-10 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              🏆
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Achievements ({earnedBadges.length}/{BADGES.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="relative bg-gradient-to-br from-yellow-500 to-amber-600 p-1 rounded-2xl shadow-xl shadow-yellow-500/50 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/60 transition-all duration-300 cursor-pointer"
              >
                <div className="bg-gray-900/90 rounded-xl p-4 text-center">
                  <div className="text-3xl sm:text-4xl mb-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto shadow-lg">
                    {badge.icon}
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm mb-1">{badge.name}</div>
                  <div className="text-xs text-gray-400 line-clamp-2 leading-snug">{badge.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl sm:text-3xl bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
              🔒
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Locked Achievements</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-gray-900/50 border border-gray-700 rounded-2xl p-4 text-center opacity-50 hover:opacity-70 hover:border-gray-600 transition-all duration-300 cursor-pointer"
              >
                <div className="text-3xl sm:text-4xl mb-2 grayscale bg-gray-800/70 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto">
                  {badge.icon}
                </div>
                <div className="font-bold text-gray-400 text-xs sm:text-sm mb-1">{badge.name}</div>
                <div className="text-xs text-gray-500 line-clamp-2 leading-snug">{badge.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Achievements;
