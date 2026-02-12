// Workout History Storage System
// Stores all generated workouts with detailed metadata for smart retrieval

/**
 * Workout structure stored in history:
 * {
 *   id: string,
 *   userId: string,
 *   generatedAt: timestamp,
 *   type: 'strength' | 'cardio' | 'stretching' | 'mixed',
 *   exercises: [...],
 *   cardio: {...},
 *   metadata: {
 *     dayOfWeek: 0-6,
 *     totalSets: number,
 *     totalReps: number,
 *     totalVolume: number (weight * reps),
 *     muscleGroups: ['chest', 'back', ...],
 *     equipment: string[],
 *     intensity: 'low' | 'medium' | 'high',
 *     duration: number (estimated minutes),
 *     focus: string,
 *   },
 *   effectiveness: {
 *     timesUsed: number,
 *     lastUsed: timestamp,
 *     userRating: number (1-5) or null,
 *     completed: boolean,
 *   },
 *   source: 'llm' | 'plan' | 'manual',
 *   aiResponse: string,
 *   aiSuggestion: string,
 * }
 */

const STORAGE_KEY = 'workoutHistory';

// Muscle group mapping for exercises
const MUSCLE_GROUP_MAP = {
  // Push exercises
  'bench press': ['chest', 'triceps', 'shoulders'],
  'push up': ['chest', 'triceps', 'shoulders'],
  'overhead press': ['shoulders', 'triceps'],
  'shoulder press': ['shoulders', 'triceps'],
  'dumbbell press': ['chest', 'triceps', 'shoulders'],
  'tricep': ['triceps'],
  'chest fly': ['chest'],
  'dips': ['chest', 'triceps'],
  
  // Pull exercises
  'pull up': ['back', 'biceps'],
  'row': ['back', 'biceps'],
  'lat pulldown': ['back', 'biceps'],
  'deadlift': ['back', 'legs', 'core'],
  'bicep curl': ['biceps'],
  'chin up': ['back', 'biceps'],
  
  // Legs
  'squat': ['legs', 'glutes'],
  'lunge': ['legs', 'glutes'],
  'leg press': ['legs', 'glutes'],
  'leg curl': ['legs'],
  'leg extension': ['legs'],
  'calf raise': ['calves'],
  'hip thrust': ['glutes'],
  
  // Core
  'plank': ['core'],
  'crunch': ['core'],
  'sit up': ['core'],
  'ab': ['core'],
  'russian twist': ['core'],
  
  // Full body
  'burpee': ['full body'],
  'mountain climber': ['full body', 'core'],
  'thruster': ['full body'],
};

/**
 * Extract muscle groups from exercises
 */
function extractMuscleGroups(exercises) {
  const muscleGroups = new Set();
  
  if (!exercises || !Array.isArray(exercises)) return [];
  
  exercises.forEach(exercise => {
    const name = exercise.name.toLowerCase();
    
    // Check each muscle group mapping
    for (const [keyword, groups] of Object.entries(MUSCLE_GROUP_MAP)) {
      if (name.includes(keyword)) {
        groups.forEach(group => muscleGroups.add(group));
      }
    }
  });
  
  return Array.from(muscleGroups);
}

/**
 * Calculate workout metadata
 */
function calculateMetadata(workout) {
  const metadata = {
    dayOfWeek: new Date(workout.date || workout.generatedAt).getDay(),
    totalSets: 0,
    totalReps: 0,
    totalVolume: 0,
    muscleGroups: [],
    equipment: new Set(),
    intensity: 'medium',
    duration: 0,
    focus: workout.focus || '',
  };
  
  // Calculate from exercises
  if (workout.exercises && Array.isArray(workout.exercises)) {
    workout.exercises.forEach(exercise => {
      const sets = exercise.sets || [];
      metadata.totalSets += sets.length;
      
      sets.forEach(set => {
        const reps = parseInt(set.reps) || parseInt(set.targetReps) || 0;
        const weight = parseFloat(set.weight) || parseFloat(set.targetWeight) || 0;
        
        metadata.totalReps += reps;
        metadata.totalVolume += reps * weight;
      });
      
      // Extract equipment
      if (exercise.equipment) {
        metadata.equipment.add(exercise.equipment);
      }
    });
    
    metadata.muscleGroups = extractMuscleGroups(workout.exercises);
    
    // Estimate duration (seconds per set + rest)
    metadata.duration = metadata.totalSets * 1.5; // ~90 seconds per set avg
  }
  
  // Calculate intensity based on volume and sets
  if (metadata.totalSets > 25 || metadata.totalVolume > 5000) {
    metadata.intensity = 'high';
  } else if (metadata.totalSets < 15 || metadata.totalVolume < 2000) {
    metadata.intensity = 'low';
  }
  
  metadata.equipment = Array.from(metadata.equipment);
  
  return metadata;
}

/**
 * Get all workout history for a user
 */
export async function getWorkoutHistory(userId) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return history[userId] || [];
  } catch (error) {
    console.error('Error reading workout history:', error);
    return [];
  }
}

/**
 * Save a workout to history
 */
export async function saveToHistory(userId, workout) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (!history[userId]) {
      history[userId] = [];
    }
    
    // Create history entry
    const historyEntry = {
      id: workout.id || `workout_${Date.now()}`,
      userId,
      generatedAt: workout.generatedAt || new Date().toISOString(),
      date: workout.date,
      type: workout.type || 'strength',
      exercises: workout.exercises || [],
      cardio: workout.cardio || null,
      metadata: calculateMetadata(workout),
      effectiveness: {
        timesUsed: 1,
        lastUsed: new Date().toISOString(),
        userRating: null,
        completed: false,
      },
      progressUpdates: {
        lastUpdated: null,
        updateCount: 0,
      },
      source: workout.source || (workout.fromPlan ? 'plan' : 'llm'),
      aiResponse: workout.aiResponse || '',
      aiSuggestion: workout.aiSuggestion || '',
      focus: workout.focus || '',
    };
    
    // Check if similar workout exists (avoid exact duplicates)
    const isDuplicate = history[userId].some(entry => 
      entry.generatedAt === historyEntry.generatedAt &&
      entry.exercises?.length === historyEntry.exercises?.length
    );
    
    if (!isDuplicate) {
      history[userId].unshift(historyEntry);
      
      // Keep last 100 workouts per user
      if (history[userId].length > 100) {
        history[userId] = history[userId].slice(0, 100);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      console.log('✅ Workout saved to history:', historyEntry.id);
    }
    
    return historyEntry;
  } catch (error) {
    console.error('Error saving workout to history:', error);
    throw error;
  }
}

/**
 * Update workout effectiveness data and exercise progression
 */
export async function updateWorkoutEffectiveness(userId, workoutId, updates) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (!history[userId]) return false;
    
    const workout = history[userId].find(w => w.id === workoutId);
    if (!workout) return false;
    
    workout.effectiveness = {
      ...workout.effectiveness,
      ...updates,
      lastUsed: new Date().toISOString(),
    };
    
    if (updates.used) {
      workout.effectiveness.timesUsed = (workout.effectiveness.timesUsed || 0) + 1;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error updating workout effectiveness:', error);
    return false;
  }
}

/**
 * Update cached workout with new weights and reps from completed workout
 * Enables progressive overload by keeping the best performance
 */
export async function updateWorkoutProgress(userId, workoutId, completedExercises) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (!history[userId]) return false;
    
    const cachedWorkout = history[userId].find(w => w.id === workoutId);
    if (!cachedWorkout || !cachedWorkout.exercises) return false;
    
    let hasUpdates = false;
    
    // Update each exercise with new PRs
    cachedWorkout.exercises.forEach((cachedExercise, exIndex) => {
      const completedExercise = completedExercises[exIndex];
      
      // Match by exercise name (in case order changed)
      const matchedCompleted = completedExercise || 
        completedExercises.find(e => e.name.toLowerCase() === cachedExercise.name.toLowerCase());
      
      if (!matchedCompleted) return;
      
      // Update each set with better performance
      cachedExercise.sets.forEach((cachedSet, setIndex) => {
        const completedSet = matchedCompleted.sets[setIndex];
        
        if (!completedSet || !completedSet.completed) return;
        
        const oldWeight = parseFloat(cachedSet.targetWeight || cachedSet.weight || 0);
        const newWeight = parseFloat(completedSet.weight || 0);
        const oldReps = parseInt(cachedSet.targetReps || cachedSet.reps || 0);
        const newReps = parseInt(completedSet.reps || 0);
        
        // Progressive overload logic:
        // 1. If weight increased, update it
        // 2. If weight same but reps increased, update reps
        // 3. Keep best performance
        
        if (newWeight > oldWeight) {
          cachedSet.targetWeight = newWeight;
          cachedSet.weight = newWeight;
          cachedSet.targetReps = newReps;
          cachedSet.reps = newReps;
          hasUpdates = true;
          console.log(`📈 Updated ${cachedExercise.name} set ${setIndex + 1}: ${oldWeight}lbs → ${newWeight}lbs`);
        } else if (newWeight === oldWeight && newReps > oldReps) {
          cachedSet.targetReps = newReps;
          cachedSet.reps = newReps;
          hasUpdates = true;
          console.log(`📈 Updated ${cachedExercise.name} set ${setIndex + 1}: ${oldReps} → ${newReps} reps`);
        }
        
        // Update RPE/RIR if provided
        if (completedSet.rpe && completedSet.rpe < (cachedSet.rpe || 10)) {
          cachedSet.rpe = completedSet.rpe;
        }
        if (completedSet.rir !== null && completedSet.rir !== undefined) {
          cachedSet.rir = completedSet.rir;
        }
      });
    });
    
    if (hasUpdates) {
      // Recalculate metadata with new weights
      cachedWorkout.metadata = calculateMetadata(cachedWorkout);
      
      // Track progress updates
      if (!cachedWorkout.progressUpdates) {
        cachedWorkout.progressUpdates = { lastUpdated: null, updateCount: 0 };
      }
      cachedWorkout.progressUpdates.lastUpdated = new Date().toISOString();
      cachedWorkout.progressUpdates.updateCount = (cachedWorkout.progressUpdates.updateCount || 0) + 1;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      console.log('✅ Cached workout updated with new progress!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating workout progress:', error);
    return false;
  }
}

/**
 * Get workout statistics
 */
export async function getWorkoutStats(userId) {
  const history = await getWorkoutHistory(userId);
  
  return {
    total: history.length,
    byType: history.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {}),
    byIntensity: history.reduce((acc, w) => {
      acc[w.metadata.intensity] = (acc[w.metadata.intensity] || 0) + 1;
      return acc;
    }, {}),
    mostUsed: history
      .sort((a, b) => b.effectiveness.timesUsed - a.effectiveness.timesUsed)
      .slice(0, 5),
    recentMuscleGroups: history
      .slice(0, 7)
      .flatMap(w => w.metadata.muscleGroups),
  };
}

/**
 * Clear old workouts (optional cleanup)
 */
export async function clearOldWorkouts(userId, daysOld = 90) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (!history[userId]) return 0;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const originalLength = history[userId].length;
    history[userId] = history[userId].filter(w => 
      new Date(w.generatedAt) > cutoffDate
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    
    const removed = originalLength - history[userId].length;
    console.log(`🗑️  Removed ${removed} old workouts`);
    return removed;
  } catch (error) {
    console.error('Error clearing old workouts:', error);
    return 0;
  }
}

/**
 * Delete a specific workout from history
 */
export async function deleteWorkoutFromHistory(userId, workoutId) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (!history[userId]) {
      throw new Error('No workout history found for user');
    }
    
    const workoutIndex = history[userId].findIndex(w => w.id === workoutId);
    if (workoutIndex === -1) {
      throw new Error('Workout not found in history');
    }
    
    history[userId].splice(workoutIndex, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    
    console.log('✅ Workout deleted from history:', workoutId);
    return true;
  } catch (error) {
    console.error('Error deleting workout from history:', error);
    throw error;
  }
}
