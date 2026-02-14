/**
 * Exercise Media Mapping
 * Maps exercise names to their corresponding GIF/video files
 * 
 * To add a new exercise GIF:
 * 1. Place the GIF file in /public/exercise-gifs/
 * 2. Add the mapping below
 * 3. Use kebab-case for filenames (e.g., bench-press.gif)
 */

const exerciseMediaMap = {
  // Chest Exercises
  'Bench Press': 'bench-press.gif',
  'Barbell Bench Press': 'bench-press.gif',
  'BB Bench Press': 'bench-press.gif',
  'Flat Bench Press': 'bench-press.gif',
  'Incline Bench Press': 'incline-bench-press.gif',
  'Incline Barbell Bench Press': 'incline-bench-press.gif',
  'Decline Bench Press': 'decline-bench-press.gif',
  'Dumbbell Bench Press': 'dumbbell-bench-press.gif',
  'DB Bench Press': 'dumbbell-bench-press.gif',
  'Push-ups': 'push-ups.gif',
  'Push Ups': 'push-ups.gif',
  'Pushups': 'push-ups.gif',
  'Dumbbell Fly': 'dumbbell-fly.gif',
  'DB Fly': 'dumbbell-fly.gif',
  'Dumbbell Flyes': 'dumbbell-fly.gif',
  'Cable Fly': 'cable-fly.gif',
  'Cable Flyes': 'cable-fly.gif',
  'Chest Dips': 'chest-dips.gif',
  'Dips': 'chest-dips.gif',
  
  // Back Exercises
  'Deadlift': 'deadlift.gif',
  'Conventional Deadlift': 'deadlift.gif',
  'Barbell Deadlift': 'deadlift.gif',
  'Bent Over Row': 'bent-over-row.gif',
  'Barbell Row': 'barbell-row.gif',
  'BB Row': 'barbell-row.gif',
  'Bent-Over Barbell Row': 'barbell-row.gif',
  'Dumbbell Row': 'dumbbell-row.gif',
  'DB Row': 'dumbbell-row.gif',
  'One-Arm Dumbbell Row': 'dumbbell-row.gif',
  'Single-Arm Dumbbell Row': 'dumbbell-row.gif',
  'Pull-ups': 'pull-ups.gif',
  'Pull Ups': 'pull-ups.gif',
  'Pullups': 'pull-ups.gif',
  'Chin-ups': 'chin-ups.gif',
  'Chin Ups': 'chin-ups.gif',
  'Chinups': 'chin-ups.gif',
  'Lat Pulldown': 'lat-pulldown.gif',
  'Lateral Pulldown': 'lat-pulldown.gif',
  'Wide-Grip Lat Pulldown': 'lat-pulldown.gif',
  'Seated Cable Row': 'seated-cable-row.gif',
  'Cable Row': 'seated-cable-row.gif',
  'Seated Row': 'seated-cable-row.gif',
  'T-Bar Row': 't-bar-row.gif',
  'T Bar Row': 't-bar-row.gif',
  'Face Pulls': 'face-pulls.gif',
  'Face Pull': 'face-pulls.gif',
  'Cable Face Pulls': 'face-pulls.gif',
  
  // Legs Exercises
  'Squat': 'squat.gif',
  'Barbell Squat': 'squat.gif',
  'BB Squat': 'squat.gif',
  'Back Squat': 'back-squat.gif',
  'High Bar Squat': 'back-squat.gif',
  'Low Bar Squat': 'back-squat.gif',
  'Front Squat': 'front-squat.gif',
  'Bulgarian Split Squat': 'bulgarian-split-squat.gif',
  'BSS': 'bulgarian-split-squat.gif',
  'Split Squat': 'bulgarian-split-squat.gif',
  'Rear Foot Elevated Split Squat': 'bulgarian-split-squat.gif',
  'Leg Press': 'leg-press.gif',
  'Romanian Deadlift': 'romanian-deadlift.gif',
  'RDL': 'romanian-deadlift.gif',
  'Barbell RDL': 'romanian-deadlift.gif',
  'Dumbbell RDL': 'romanian-deadlift.gif',
  'Leg Curl': 'leg-curl.gif',
  'Hamstring Curl': 'leg-curl.gif',
  'Lying Leg Curl': 'leg-curl.gif',
  'Leg Extension': 'leg-extension.gif',
  'Leg Extensions': 'leg-extension.gif',
  'Quad Extension': 'leg-extension.gif',
  'Lunges': 'lunges.gif',
  'Dumbbell Lunges': 'lunges.gif',
  'Barbell Lunges': 'lunges.gif',
  'DB Lunges': 'lunges.gif',
  'Walking Lunges': 'walking-lunges.gif',
  'Calf Raises': 'calf-raises.gif',
  'Calf Raise': 'calf-raises.gif',
  'Standing Calf Raises': 'calf-raises.gif',
  'Seated Calf Raises': 'calf-raises.gif',
  'Goblet Squat': 'goblet-squat.gif',
  'Dumbbell Goblet Squat': 'goblet-squat.gif',
  
  // Shoulders Exercises
  'Overhead Press': 'overhead-press.gif',
  'OHP': 'overhead-press.gif',
  'Barbell Overhead Press': 'overhead-press.gif',
  'Barbell Shoulder Press': 'overhead-press.gif',
  'Military Press': 'military-press.gif',
  'Strict Press': 'overhead-press.gif',
  'Dumbbell Shoulder Press': 'dumbbell-shoulder-press.gif',
  'DB Shoulder Press': 'dumbbell-shoulder-press.gif',
  'Seated Dumbbell Press': 'dumbbell-shoulder-press.gif',
  'Arnold Press': 'arnold-press.gif',
  'Dumbbell Arnold Press': 'arnold-press.gif',
  'Lateral Raise': 'lateral-raise.gif',
  'Lateral Raises': 'lateral-raise.gif',
  'Side Lateral Raise': 'lateral-raise.gif',
  'Dumbbell Lateral Raise': 'lateral-raise.gif',
  'DB Lateral Raise': 'lateral-raise.gif',
  'Front Raise': 'front-raise.gif',
  'Front Raises': 'front-raise.gif',
  'Dumbbell Front Raise': 'front-raise.gif',
  'Rear Delt Fly': 'rear-delt-fly.gif',
  'Rear Delt Flyes': 'rear-delt-fly.gif',
  'Reverse Fly': 'rear-delt-fly.gif',
  'Reverse Flyes': 'rear-delt-fly.gif',
  'Bent Over Reverse Fly': 'rear-delt-fly.gif',
  'Upright Row': 'upright-row.gif',
  'Barbell Upright Row': 'upright-row.gif',
  'Shrugs': 'shrugs.gif',
  'Barbell Shrugs': 'shrugs.gif',
  'Dumbbell Shrugs': 'shrugs.gif',
  'Trap Shrugs': 'shrugs.gif',
  
  // Arms Exercises
  'Barbell Curl': 'barbell-curl.gif',
  'BB Curl': 'barbell-curl.gif',
  'Bicep Curl': 'barbell-curl.gif',
  'Barbell Bicep Curl': 'barbell-curl.gif',
  'EZ Bar Curl': 'barbell-curl.gif',
  'Dumbbell Curl': 'dumbbell-curl.gif',
  'DB Curl': 'dumbbell-curl.gif',
  'Dumbbell Bicep Curl': 'dumbbell-curl.gif',
  'Alternating Dumbbell Curl': 'dumbbell-curl.gif',
  'Hammer Curl': 'hammer-curl.gif',
  'Hammer Curls': 'hammer-curl.gif',
  'Dumbbell Hammer Curl': 'hammer-curl.gif',
  'Preacher Curl': 'preacher-curl.gif',
  'Preacher Curls': 'preacher-curl.gif',
  'EZ Bar Preacher Curl': 'preacher-curl.gif',
  'Concentration Curl': 'concentration-curl.gif',
  'Concentration Curls': 'concentration-curl.gif',
  'Seated Concentration Curl': 'concentration-curl.gif',
  'Tricep Dips': 'tricep-dips.gif',
  'Dips': 'tricep-dips.gif',
  'Bench Dips': 'tricep-dips.gif',
  'Tricep Pushdown': 'tricep-pushdown.gif',
  'Triceps Pushdown': 'tricep-pushdown.gif',
  'Cable Pushdown': 'tricep-pushdown.gif',
  'Rope Pushdown': 'tricep-pushdown.gif',
  'Cable Tricep Extension': 'tricep-pushdown.gif',
  'Overhead Tricep Extension': 'overhead-tricep-extension.gif',
  'Overhead Triceps Extension': 'overhead-tricep-extension.gif',
  'Dumbbell Overhead Extension': 'overhead-tricep-extension.gif',
  'Skull Crushers': 'skull-crushers.gif',
  'Skullcrushers': 'skull-crushers.gif',
  'Lying Tricep Extension': 'skull-crushers.gif',
  'EZ Bar Skull Crushers': 'skull-crushers.gif',
  'Close Grip Bench Press': 'close-grip-bench-press.gif',
  'Close-Grip Bench Press': 'close-grip-bench-press.gif',
  'CGBP': 'close-grip-bench-press.gif',
  
  // Core Exercises
  'Plank': 'plank.gif',
  'Front Plank': 'plank.gif',
  'Forearm Plank': 'plank.gif',
  'Side Plank': 'side-plank.gif',
  'Side Planks': 'side-plank.gif',
  'Dead Bug': 'dead-bug.gif',
  'Dead Bugs': 'dead-bug.gif',
  'Deadbug': 'dead-bug.gif',
  'Toe Touches': 'toe-touches.gif',
  'Toe Touch': 'toe-touches.gif',
  'Lying Toe Touches': 'toe-touches.gif',
  'Bicycle Crunches': 'bicycle-crunches.gif',
  'Bicycle Crunch': 'bicycle-crunches.gif',
  'Air Bike': 'bicycle-crunches.gif',
  'Mountain Climbers': 'mountain-climbers.gif',
  'Mountain Climber': 'mountain-climbers.gif',
  'Russian Twists': 'russian-twists.gif',
  'Russian Twist': 'russian-twists.gif',
  'Weighted Russian Twist': 'russian-twists.gif',
  'Leg Raises': 'leg-raises.gif',
  'Leg Raise': 'leg-raises.gif',
  'Lying Leg Raises': 'leg-raises.gif',
  'Hanging Leg Raises': 'leg-raises.gif',
  'Bird Dogs': 'bird-dogs.gif',
  'Bird Dog': 'bird-dogs.gif',
  'Birddog': 'bird-dogs.gif',
  'Hollow Body Hold': 'hollow-body-hold.gif',
  'Hollow Hold': 'hollow-body-hold.gif',
  'Hollow Body': 'hollow-body-hold.gif',
  'Ab Wheel Rollout': 'ab-wheel-rollout.gif',
  'Ab Wheel': 'ab-wheel-rollout.gif',
  'Ab Roller': 'ab-wheel-rollout.gif',
  'Hanging Knee Raises': 'hanging-knee-raises.gif',
  'Hanging Knee Raise': 'hanging-knee-raises.gif',
  'HKR': 'hanging-knee-raises.gif',
};

/**
 * Get the media file path for an exercise
 * @param {string} exerciseName - The name of the exercise
 * @returns {string|null} - The path to the GIF/video, or null if not found
 */
export function getExerciseMedia(exerciseName) {
  if (!exerciseName) return null;
  
  // Direct match
  if (exerciseMediaMap[exerciseName]) {
    return `/exercise-gifs/${exerciseMediaMap[exerciseName]}`;
  }
  
  // Try case-insensitive match
  const normalizedName = exerciseName.toLowerCase().trim();
  const matchedKey = Object.keys(exerciseMediaMap).find(
    key => key.toLowerCase() === normalizedName
  );
  
  if (matchedKey) {
    return `/exercise-gifs/${exerciseMediaMap[matchedKey]}`;
  }
  
  // Try removing common prefixes/suffixes and matching again
  const cleanedName = normalizedName
    .replace(/\b(barbell|dumbbell|db|bb|cable|machine|smith)\b/gi, '')
    .replace(/\b(standing|seated|lying|incline|decline)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanedName) {
    const cleanMatch = Object.keys(exerciseMediaMap).find(
      key => key.toLowerCase().includes(cleanedName) || cleanedName.includes(key.toLowerCase())
    );
    
    if (cleanMatch) {
      return `/exercise-gifs/${exerciseMediaMap[cleanMatch]}`;
    }
  }
  
  // Try partial match (e.g., "Barbell Squat" matches "Squat")
  const partialMatch = Object.keys(exerciseMediaMap).find(
    key => normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)
  );
  
  if (partialMatch) {
    return `/exercise-gifs/${exerciseMediaMap[partialMatch]}`;
  }
  
  return null;
}

/**
 * Check if an exercise has media available
 * @param {string} exerciseName - The name of the exercise
 * @returns {boolean}
 */
export function hasExerciseMedia(exerciseName) {
  return getExerciseMedia(exerciseName) !== null;
}

/**
 * Get all available exercise names that have media
 * @returns {string[]}
 */
export function getAvailableExercises() {
  return Object.keys(exerciseMediaMap).sort();
}

/**
 * Add a new exercise media mapping (for future use)
 * @param {string} exerciseName - The name of the exercise
 * @param {string} filename - The filename of the GIF/video
 */
export function addExerciseMedia(exerciseName, filename) {
  exerciseMediaMap[exerciseName] = filename;
}

export default exerciseMediaMap;
