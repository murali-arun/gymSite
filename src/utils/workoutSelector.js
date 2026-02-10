// Smart Workout Selector
// Intelligently selects the best workout from history based on multiple factors

import { getWorkoutHistory } from './workoutHistory';
import { getUser } from './storage';

/**
 * Calculate days since last workout
 */
function daysSince(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get muscle groups worked in recent workouts
 */
function getRecentlyWorkedMuscles(recentWorkouts, days = 3) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const muscleGroups = new Set();
  
  recentWorkouts.forEach(workout => {
    const workoutDate = new Date(workout.completedAt || workout.date);
    if (workoutDate > cutoff) {
      workout.exercises?.forEach(exercise => {
        // Extract muscle groups from exercise data
        if (exercise.muscleGroup) {
          muscleGroups.add(exercise.muscleGroup.toLowerCase());
        }
      });
    }
  });
  
  return Array.from(muscleGroups);
}

/**
 * Calculate recovery score for muscle groups
 * Higher score = better recovered
 */
function calculateRecoveryScore(workout, recentlyWorkedMuscles) {
  const muscleGroups = workout.metadata.muscleGroups;
  
  // If no recent muscle data, neutral score
  if (!recentlyWorkedMuscles || recentlyWorkedMuscles.length === 0) {
    return 0.5;
  }
  
  // Count overlapping muscle groups
  const overlap = muscleGroups.filter(muscle => 
    recentlyWorkedMuscles.includes(muscle)
  ).length;
  
  // More overlap = lower score (less recovered)
  const overlapRatio = muscleGroups.length > 0 
    ? overlap / muscleGroups.length 
    : 0;
  
  // Invert so high overlap = low score
  return 1 - overlapRatio;
}

/**
 * Calculate day-of-week match score
 * Some workouts work better on certain days
 */
function calculateDayMatchScore(workout, currentDay) {
  const workoutDay = workout.metadata.dayOfWeek;
  
  // Exact day match
  if (workoutDay === currentDay) {
    return 1.0;
  }
  
  // Similar days (e.g., Monday and Tuesday)
  const dayDiff = Math.abs(workoutDay - currentDay);
  if (dayDiff <= 1 || dayDiff >= 6) {
    return 0.7;
  }
  
  return 0.3;
}

/**
 * Calculate effort balance score
 * Alternates between high and low intensity based on recent workouts
 */
function calculateEffortBalanceScore(workout, recentCompleted) {
  if (!recentCompleted || recentCompleted.length === 0) {
    return 0.5; // Neutral if no history
  }
  
  // Get last 3 workouts' intensity
  const recentIntensities = recentCompleted
    .slice(0, 3)
    .map(w => {
      const volume = w.exercises?.reduce((sum, ex) => {
        return sum + (ex.sets?.reduce((s, set) => {
          if (!set.completed) return s;
          const weight = parseFloat(set.weight) || 0;
          const reps = parseInt(set.reps) || 0;
          return s + (weight * reps);
        }, 0) || 0);
      }, 0) || 0;
      
      // Classify intensity
      if (volume > 5000) return 'high';
      if (volume < 2000) return 'low';
      return 'medium';
    });
  
  const lastIntensity = recentIntensities[0];
  const workoutIntensity = workout.metadata.intensity;
  
  // If last workout was high intensity, prefer medium/low
  if (lastIntensity === 'high') {
    if (workoutIntensity === 'low') return 1.0;
    if (workoutIntensity === 'medium') return 0.8;
    return 0.3;
  }
  
  // If last workout was low intensity, prefer medium/high
  if (lastIntensity === 'low') {
    if (workoutIntensity === 'high') return 1.0;
    if (workoutIntensity === 'medium') return 0.8;
    return 0.3;
  }
  
  // Last was medium, any is okay
  return 0.6;
}

/**
 * Calculate variety score
 * Prefers workouts not used recently
 */
function calculateVarietyScore(workout) {
  const timesUsed = workout.effectiveness.timesUsed || 0;
  const daysSinceLastUse = workout.effectiveness.lastUsed 
    ? daysSince(workout.effectiveness.lastUsed)
    : 999;
  
  // Penalize frequently used workouts
  let score = 1.0;
  
  if (timesUsed > 5) score -= 0.3;
  if (timesUsed > 10) score -= 0.3;
  
  // Boost workouts not used recently
  if (daysSinceLastUse > 14) score += 0.3;
  if (daysSinceLastUse > 30) score += 0.2;
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate effectiveness score
 * Prefers workouts that were completed and rated well
 */
function calculateEffectivenessScore(workout) {
  let score = 0.5; // Neutral base
  
  // Boost if marked as completed
  if (workout.effectiveness.completed) {
    score += 0.2;
  }
  
  // Boost based on user rating
  if (workout.effectiveness.userRating) {
    score += (workout.effectiveness.userRating - 3) * 0.15; // -0.3 to +0.3
  }
  
  // Slight boost if used multiple times (proven valuable)
  if (workout.effectiveness.timesUsed > 2 && workout.effectiveness.timesUsed < 8) {
    score += 0.1;
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Main function: Select best workout from history
 * 
 * @param {string} userId - User ID
 * @param {Object} preferences - Optional preferences (type, focus, intensity)
 * @param {Object} weights - Custom weights for scoring factors
 * @returns {Object|null} - Selected workout or null if none available
 */
export async function selectBestWorkout(userId, preferences = {}, weights = {}) {
  try {
    // Get workout history and user data
    const history = await getWorkoutHistory(userId);
    const user = await getUser(userId);
    
    if (!history || history.length === 0) {
      console.log('No workout history available');
      return null;
    }
    
    const today = new Date().getDay(); // 0-6
    const recentCompleted = user?.workouts?.slice(0, 5) || [];
    const recentlyWorkedMuscles = getRecentlyWorkedMuscles(recentCompleted);
    
    console.log('📊 Selection context:', {
      historySize: history.length,
      recentWorkouts: recentCompleted.length,
      recentlyWorkedMuscles,
      dayOfWeek: today,
      preferences
    });
    
    // Default weights for scoring
    const defaultWeights = {
      recovery: 0.25,      // Muscle recovery importance
      dayMatch: 0.15,      // Day-of-week match
      effortBalance: 0.20, // Intensity balance
      variety: 0.20,       // Workout variety
      effectiveness: 0.20, // Past effectiveness
    };
    
    const finalWeights = { ...defaultWeights, ...weights };
    
    // Filter workouts by preferences
    let candidates = history;
    
    if (preferences.type) {
      candidates = candidates.filter(w => w.type === preferences.type);
    }
    
    if (preferences.focus) {
      candidates = candidates.filter(w => 
        w.focus?.toLowerCase().includes(preferences.focus.toLowerCase()) ||
        w.metadata.muscleGroups.some(mg => 
          mg.toLowerCase().includes(preferences.focus.toLowerCase())
        )
      );
    }
    
    if (preferences.intensity) {
      candidates = candidates.filter(w => 
        w.metadata.intensity === preferences.intensity
      );
    }
    
    if (preferences.maxDuration) {
      candidates = candidates.filter(w => 
        w.metadata.duration <= preferences.maxDuration
      );
    }
    
    if (candidates.length === 0) {
      console.log('No workouts match preferences');
      return null;
    }
    
    console.log(`🔍 Evaluating ${candidates.length} candidate workouts`);
    
    // Score each workout
    const scored = candidates.map(workout => {
      const scores = {
        recovery: calculateRecoveryScore(workout, recentlyWorkedMuscles),
        dayMatch: calculateDayMatchScore(workout, today),
        effortBalance: calculateEffortBalanceScore(workout, recentCompleted),
        variety: calculateVarietyScore(workout),
        effectiveness: calculateEffectivenessScore(workout),
      };
      
      // Calculate weighted total
      const totalScore = Object.entries(scores).reduce((sum, [key, score]) => {
        return sum + (score * finalWeights[key]);
      }, 0);
      
      return {
        workout,
        scores,
        totalScore,
      };
    });
    
    // Sort by total score (descending)
    scored.sort((a, b) => b.totalScore - a.totalScore);
    
    // Log top 3 for debugging
    console.log('🏆 Top 3 workouts:');
    scored.slice(0, 3).forEach((item, i) => {
      console.log(`${i + 1}. Score: ${item.totalScore.toFixed(3)}`, {
        id: item.workout.id.slice(-8),
        type: item.workout.type,
        intensity: item.workout.metadata.intensity,
        muscles: item.workout.metadata.muscleGroups.join(', '),
        scores: Object.entries(item.scores).map(([k, v]) => `${k}:${v.toFixed(2)}`).join(' ')
      });
    });
    
    // Return the best match
    return scored[0]?.workout || null;
    
  } catch (error) {
    console.error('Error selecting workout:', error);
    return null;
  }
}

/**
 * Get multiple workout recommendations
 */
export async function getWorkoutRecommendations(userId, count = 3, preferences = {}) {
  try {
    const history = await getWorkoutHistory(userId);
    const user = await getUser(userId);
    
    if (!history || history.length === 0) {
      return [];
    }
    
    const today = new Date().getDay();
    const recentCompleted = user?.workouts?.slice(0, 5) || [];
    const recentlyWorkedMuscles = getRecentlyWorkedMuscles(recentCompleted);
    
    // Score all workouts
    const scored = history.map(workout => {
      const scores = {
        recovery: calculateRecoveryScore(workout, recentlyWorkedMuscles),
        dayMatch: calculateDayMatchScore(workout, today),
        effortBalance: calculateEffortBalanceScore(workout, recentCompleted),
        variety: calculateVarietyScore(workout),
        effectiveness: calculateEffectivenessScore(workout),
      };
      
      const totalScore = (
        scores.recovery * 0.25 +
        scores.dayMatch * 0.15 +
        scores.effortBalance * 0.20 +
        scores.variety * 0.20 +
        scores.effectiveness * 0.20
      );
      
      return { workout, totalScore, scores };
    });
    
    // Sort and return top N
    scored.sort((a, b) => b.totalScore - a.totalScore);
    
    return scored.slice(0, count).map(item => ({
      ...item.workout,
      recommendationScore: item.totalScore,
      scoreBreakdown: item.scores,
    }));
    
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

/**
 * Quick helper: Get workout for today
 */
export async function getTodaysWorkout(userId, preferences = {}) {
  return await selectBestWorkout(userId, preferences);
}
