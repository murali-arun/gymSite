// 1RM (One Rep Max) Calculator using multiple formulas
// Takes weight and reps, returns estimated 1RM

/**
 * Epley Formula: 1RM = weight × (1 + reps/30)
 * Most common and simple
 */
export function epley1RM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Brzycki Formula: 1RM = weight × (36 / (37 - reps))
 * More conservative, good for higher reps
 */
export function brzycki1RM(weight, reps) {
  if (reps === 1) return weight;
  if (reps >= 37) return weight; // Formula breaks down above 36 reps
  return Math.round(weight * (36 / (37 - reps)));
}

/**
 * Lombardi Formula: 1RM = weight × reps^0.1
 * Good for lower rep ranges
 */
export function lombardi1RM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * Math.pow(reps, 0.1));
}

/**
 * Average of multiple formulas for more accurate estimate
 */
export function calculate1RM(weight, reps) {
  if (reps === 1) return weight;
  if (reps > 12) {
    // For higher reps, use Brzycki (more conservative)
    return brzycki1RM(weight, reps);
  }
  
  // Average of Epley and Brzycki for accuracy
  const epley = epley1RM(weight, reps);
  const brzycki = brzycki1RM(weight, reps);
  return Math.round((epley + brzycki) / 2);
}

/**
 * Calculate percentage-based training weights from 1RM
 */
export function getTrainingWeights(oneRepMax) {
  return {
    max: oneRepMax,
    '95%': Math.round(oneRepMax * 0.95 / 5) * 5, // 1-2 reps
    '90%': Math.round(oneRepMax * 0.90 / 5) * 5, // 2-4 reps
    '85%': Math.round(oneRepMax * 0.85 / 5) * 5, // 4-6 reps (strength)
    '80%': Math.round(oneRepMax * 0.80 / 5) * 5, // 6-8 reps
    '75%': Math.round(oneRepMax * 0.75 / 5) * 5, // 8-10 reps
    '70%': Math.round(oneRepMax * 0.70 / 5) * 5, // 10-12 reps (hypertrophy)
    '65%': Math.round(oneRepMax * 0.65 / 5) * 5, // 12-15 reps
    '60%': Math.round(oneRepMax * 0.60 / 5) * 5, // 15+ reps (endurance)
  };
}

// Strength Standards (ExRx.net based)
// Values are in pounds for male lifters at bodyweight
// Categories: Untrained, Novice, Intermediate, Advanced, Elite

const STRENGTH_STANDARDS = {
  // Bodyweight categories (in lbs)
  bodyweights: [140, 165, 180, 198, 220, 242, 275],
  
  exercises: {
    'squat': {
      name: 'Barbell Back Squat',
      140: { untrained: 78, novice: 144, intermediate: 174, advanced: 240, elite: 320 },
      165: { untrained: 95, novice: 170, intermediate: 205, advanced: 285, elite: 380 },
      180: { untrained: 107, novice: 190, intermediate: 230, advanced: 315, elite: 420 },
      198: { untrained: 118, novice: 210, intermediate: 255, advanced: 345, elite: 460 },
      220: { untrained: 129, novice: 230, intermediate: 280, advanced: 380, elite: 505 },
      242: { untrained: 140, novice: 250, intermediate: 305, advanced: 415, elite: 550 },
      275: { untrained: 153, novice: 275, intermediate: 335, advanced: 455, elite: 605 }
    },
    'bench press': {
      name: 'Barbell Bench Press',
      140: { untrained: 84, novice: 107, intermediate: 130, advanced: 179, elite: 220 },
      165: { untrained: 100, novice: 130, intermediate: 156, advanced: 215, elite: 264 },
      180: { untrained: 113, novice: 144, intermediate: 174, advanced: 241, elite: 295 },
      198: { untrained: 125, novice: 159, intermediate: 193, advanced: 267, elite: 327 },
      220: { untrained: 137, novice: 174, intermediate: 213, advanced: 294, elite: 360 },
      242: { untrained: 148, novice: 190, intermediate: 232, advanced: 320, elite: 392 },
      275: { untrained: 162, novice: 208, intermediate: 254, advanced: 351, elite: 430 }
    },
    'deadlift': {
      name: 'Barbell Deadlift',
      140: { untrained: 97, novice: 179, intermediate: 204, advanced: 299, elite: 387 },
      165: { untrained: 115, novice: 211, intermediate: 240, advanced: 353, elite: 457 },
      180: { untrained: 129, novice: 237, intermediate: 268, advanced: 395, elite: 512 },
      198: { untrained: 142, novice: 261, intermediate: 296, advanced: 435, elite: 565 },
      220: { untrained: 155, novice: 285, intermediate: 325, advanced: 477, elite: 617 },
      242: { untrained: 168, novice: 309, intermediate: 353, advanced: 518, elite: 670 },
      275: { untrained: 184, novice: 339, intermediate: 387, advanced: 568, elite: 735 }
    },
    'overhead press': {
      name: 'Overhead Press',
      140: { untrained: 53, novice: 72, intermediate: 90, advanced: 107, elite: 129 },
      165: { untrained: 64, novice: 87, intermediate: 108, advanced: 130, elite: 156 },
      180: { untrained: 72, novice: 98, intermediate: 122, advanced: 146, elite: 176 },
      198: { untrained: 79, novice: 108, intermediate: 135, advanced: 161, elite: 195 },
      220: { untrained: 87, novice: 119, intermediate: 148, advanced: 177, elite: 214 },
      242: { untrained: 94, novice: 129, intermediate: 161, advanced: 193, elite: 232 },
      275: { untrained: 103, novice: 141, intermediate: 176, advanced: 211, elite: 255 }
    },
    'row': {
      name: 'Barbell Row',
      140: { untrained: 73, novice: 97, intermediate: 122, advanced: 159, elite: 194 },
      165: { untrained: 88, novice: 117, intermediate: 147, advanced: 191, elite: 233 },
      180: { untrained: 99, novice: 132, intermediate: 165, advanced: 215, elite: 262 },
      198: { untrained: 109, novice: 145, intermediate: 183, advanced: 237, elite: 290 },
      220: { untrained: 120, novice: 159, intermediate: 200, advanced: 260, elite: 318 },
      242: { untrained: 130, novice: 173, intermediate: 218, advanced: 283, elite: 346 },
      275: { untrained: 142, novice: 190, intermediate: 239, advanced: 310, elite: 379 }
    }
  }
};

/**
 * Get strength standard level for an exercise
 * @param {string} exerciseName - Exercise name (will match partial)
 * @param {number} oneRepMax - Estimated or actual 1RM
 * @param {number} bodyweight - User's bodyweight in lbs
 * @returns {object} Level and details
 */
export function getStrengthLevel(exerciseName, oneRepMax, bodyweight = 180) {
  // Normalize exercise name
  const normalizedName = exerciseName.toLowerCase();
  
  // Find matching exercise in standards
  let exerciseKey = null;
  let exerciseData = null;
  
  for (const [key, data] of Object.entries(STRENGTH_STANDARDS.exercises)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      exerciseKey = key;
      exerciseData = data;
      break;
    }
  }
  
  if (!exerciseData) {
    return {
      found: false,
      exercise: exerciseName,
      message: 'No strength standards available for this exercise'
    };
  }
  
  // Find closest bodyweight category
  const bwCategory = STRENGTH_STANDARDS.bodyweights.reduce((prev, curr) => {
    return Math.abs(curr - bodyweight) < Math.abs(prev - bodyweight) ? curr : prev;
  });
  
  const standards = exerciseData[bwCategory];
  
  // Determine level
  let level = 'untrained';
  let percentage = 0;
  let nextLevel = 'novice';
  let nextTarget = standards.novice;
  
  if (oneRepMax >= standards.elite) {
    level = 'elite';
    percentage = 100;
    nextLevel = 'elite';
    nextTarget = standards.elite;
  } else if (oneRepMax >= standards.advanced) {
    level = 'advanced';
    const range = standards.elite - standards.advanced;
    percentage = 80 + ((oneRepMax - standards.advanced) / range) * 20;
    nextLevel = 'elite';
    nextTarget = standards.elite;
  } else if (oneRepMax >= standards.intermediate) {
    level = 'intermediate';
    const range = standards.advanced - standards.intermediate;
    percentage = 60 + ((oneRepMax - standards.intermediate) / range) * 20;
    nextLevel = 'advanced';
    nextTarget = standards.advanced;
  } else if (oneRepMax >= standards.novice) {
    level = 'novice';
    const range = standards.intermediate - standards.novice;
    percentage = 40 + ((oneRepMax - standards.novice) / range) * 20;
    nextLevel = 'intermediate';
    nextTarget = standards.intermediate;
  } else {
    level = 'untrained';
    const range = standards.novice - standards.untrained;
    percentage = ((oneRepMax - standards.untrained) / range) * 40;
    nextLevel = 'novice';
    nextTarget = standards.novice;
  }
  
  return {
    found: true,
    exercise: exerciseData.name,
    level,
    oneRepMax,
    bodyweight: bwCategory,
    percentage: Math.max(0, Math.min(100, Math.round(percentage))),
    standards,
    nextLevel,
    nextTarget,
    gap: nextTarget - oneRepMax,
    allLevels: ['untrained', 'novice', 'intermediate', 'advanced', 'elite']
  };
}

/**
 * Get best 1RM from exercise history
 */
export function getBest1RM(exerciseHistory) {
  if (!exerciseHistory || exerciseHistory.length === 0) return null;
  
  let best1RM = 0;
  let bestSession = null;
  
  exerciseHistory.forEach(session => {
    const estimated1RM = calculate1RM(session.maxWeight, session.avgReps);
    if (estimated1RM > best1RM) {
      best1RM = estimated1RM;
      bestSession = session;
    }
  });
  
  return {
    oneRepMax: best1RM,
    basedOn: bestSession,
    trainingWeights: getTrainingWeights(best1RM)
  };
}
