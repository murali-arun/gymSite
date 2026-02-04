# Bilateral Exercise Support

## Overview
The app now supports exercises that are performed on each side independently (bilateral/unilateral exercises), such as:
- Bulgarian Split Squats (each leg)
- Lunges (each leg)
- Side Planks (each side)
- Single-arm exercises (each arm)

## How It Works

### 1. LLM Detection
The AI automatically identifies bilateral exercises and marks them with `perSide: true` in the workout JSON:

```json
{
  "name": "Bulgarian Split Squat",
  "perSide": true,
  "sets": [
    {"weight": 25, "reps": 10, "completed": false}
  ]
}
```

The LLM has been instructed to recognize these patterns:
- Exercises with "Single", "Unilateral", or "Each" in the name
- Bulgarian Split Squats, Lunges, Step-Ups, Single-Leg Deadlifts
- Side Planks, Single-Arm Rows, Single-Arm Presses
- Any exercise naturally performed on one side at a time

### 2. UI Adaptations

#### Exercise Overview
- Shows a "Per Side ⬅️➡️" badge next to bilateral exercises
- Labels clarify "Reps per side" instead of just "Reps"

#### Active Workout View
- Displays a visual indicator showing Left/Right sides
- Highlights the current active side (Left or Right)
- Shows completed sides with green checkmarks
- Labels show "Reps (per left side)" or "Reps (per right side)"
- Helpful hint: "💡 You'll do X reps on each side"

#### Progression Flow
1. User completes left side → Button says "✓ Complete Left Side → Switch to Right"
2. User completes right side → Set is marked complete, moves to next set
3. Automatically resets to left side for the next set

### 3. Examples

**Bulgarian Split Squat** (3 sets x 10 reps @ 25 lbs):
- Set 1: Do 10 reps on left leg → Switch → Do 10 reps on right leg → Complete
- Set 2: Do 10 reps on left leg → Switch → Do 10 reps on right leg → Complete
- Set 3: Do 10 reps on left leg → Switch → Do 10 reps on right leg → Complete

**Side Plank** (3 sets x 30 seconds):
- Set 1: Hold 30s on left side → Switch → Hold 30s on right side → Complete
- Set 2: Hold 30s on left side → Switch → Hold 30s on right side → Complete
- Set 3: Hold 30s on left side → Switch → Hold 30s on right side → Complete

## Technical Implementation

### State Management
```javascript
const [currentSide, setCurrentSide] = useState('left'); // 'left' or 'right'
const [completedSides, setCompletedSides] = useState({}); // Track completed sides
```

### Set Completion Logic
```javascript
const handleNextSet = () => {
  const currentExercise = exercises[currentExerciseIndex];
  const isPerSide = currentExercise.perSide;
  
  if (isPerSide) {
    if (currentSide === 'left') {
      // Just completed left, switch to right
      setCurrentSide('right');
      return;
    } else {
      // Completed both sides, mark set complete
      setCurrentSide('left'); // Reset for next set
    }
  }
  
  // Continue with normal set completion...
};
```

## Benefits

1. **Clarity**: Users know exactly which side to work
2. **Tracking**: The app ensures both sides are completed
3. **Balance**: Prevents accidentally skipping one side
4. **Flexibility**: Works with time-based and rep-based exercises
5. **AI-Powered**: LLM automatically detects bilateral exercises

## Future Enhancements

Potential improvements:
- Track performance differences between left/right sides
- Alert users if there's significant strength imbalance
- Allow users to manually mark exercises as bilateral
- Support for alternating sets (left, right, left, right vs. all left then all right)

---

## Testing Instructions

To test the bilateral exercise feature:

1. **Generate a Workout**: Ask the AI to create a workout with bilateral exercises
   - Example: "Generate a leg workout with Bulgarian split squats and lunges"
   - Example: "I want a workout with single-leg exercises"

2. **Manual Log**: Create a manual workout log
   - Add an exercise like "Bulgarian Split Squat"
   - Check the "Per Side Exercise" checkbox
   - Enter sets/reps (e.g., 3 sets of 10 reps per side)

3. **During Workout**:
   - Start the workout
   - Notice the "Per Side Exercise" badge and left/right indicators
   - Complete left side first → Button shows "✓ Complete Left Side → Switch to Right"
   - Complete right side → Set is marked complete, moves to next set

4. **Verify**:
   - Check that the exercise overview shows the "Per Side ⬅️➡️" badge
   - Verify labels show "Reps per side" instead of just "Reps"
   - Confirm the UI guides you through both sides

## Common Bilateral Exercises

The LLM will automatically detect these:
- **Lower Body**: Bulgarian Split Squats, Lunges (Forward/Reverse/Walking), Step-Ups, Single-Leg Deadlifts, Pistol Squats, Single-Leg Press
- **Core**: Side Planks, Single-Arm Planks, Side Crunches
- **Upper Body**: Single-Arm Dumbbell Rows, Single-Arm Overhead Press, Single-Arm Cable Exercises
- **Any exercise** with "Single", "Unilateral", or "Each" in the name
