# Workout History & Smart Selection System

## Overview

This system automatically stores every generated workout and uses AI-powered logic (no LLM calls) to intelligently select the best workout from history based on multiple factors. **Workouts automatically update with your new weights and reps for progressive overload!**

## How It Works

### 1. Automatic Storage
Every workout generated (via LLM, plan, or manual entry) is automatically saved to history with:
- Exercise details (sets, reps, weights)
- Metadata (muscle groups, intensity, duration, equipment)
- Effectiveness tracking (times used, user ratings, completion status)
- **Progress tracking (PR updates, progressive overload)**

### 2. Progressive Overload (NEW!)

When you complete a cached workout:
- System compares your actual weights/reps vs. cached values
- **Automatically updates cached workout with new PRs**
- Next time you use that workout, it starts with your improved weights
- Tracks how many times progress was updated

**Example:**
1. Day 1: Bench Press 135lbs x 10 reps
2. You complete it with 140lbs x 10 reps ✅
3. Cached workout updates: 135 → 140lbs
4. Next time: Starts at 140lbs (progressive overload!)

### 3. Smart Selection Algorithm

When loading from history, the system scores each workout based on:

#### Recovery Score (25% weight)
- Analyzes recently worked muscle groups
- Avoids workouts targeting the same muscles
- Ensures proper recovery time

#### Day Match Score (15% weight)
- Considers day of week patterns
- Matches workouts to similar days they were originally done

#### Effort Balance Score (20% weight)
- Analyzes recent workout intensity
- Alternates between high, medium, and low intensity
- Prevents overtraining or undertraining

#### Variety Score (20% weight)
- Prefers workouts not used recently
- Penalizes frequently repeated workouts
- Boosts workouts unused for 14+ days

#### Effectiveness Score (20% weight)
- Prioritizes previously completed workouts
- Uses user ratings (from post-workout feedback)
- Values proven, effective workouts
- **Boosts workouts with progress updates (PRs)**

### 4. User Interface

**"Load From History" Section:**
- **Smart Pick for Today** - One-click to get the optimal workout
- **Browse** - View top 5 recommendations with scores
- Each recommendation shows:
  - Workout type & intensity
  - Muscle groups targeted
  - Estimated duration
  - Usage statistics
  - Recommendation score (0-100%)
  - **📈 Progressive badge** if workout has PR updates

## Benefits

1. **Zero API Costs** - Reuse workouts without LLM calls
2. **Intelligent Selection** - Not random; based on recovery, patterns, and effectiveness
3. **Progressive Training** - Automatically balances intensity
4. **Personalized** - Learns from your usage patterns and ratings
5. **Fast** - Instant workout loading
6. **🆕 Automatic Progressive Overload** - Cached workouts update with your new PRs
7. **🆕 Always Current** - Never repeat old weights; always building on your progress

## Technical Details

### Files
- `src/utils/workoutHistory.js` - Storage and metadata calculation
- `src/utils/workoutSelector.js` - Smart selection algorithm
- `src/components/features/workout/WorkoutGenerator.jsx` - UI integration
- `src/components/features/workout/ExerciseTracker.jsx` - Effectiveness tracking

### Data Structure
```javascript
{
  id: "workout_123",
  userId: "user_456",
  generatedAt: "2026-02-09T10:00:00Z",
  type: "strength",
  exercises: [...],
  metadata: {
    dayOfWeek: 1,
    totalSets: 24,
    totalReps: 192,
    totalVolume: 4800,
    muscleGroups: ["chest", "triceps"],
    intensity: "high",
    duration: 45
  },
  effectiveness: {
    timesUsed: 3,
    lastUsed: "2026-02-09T10:00:00Z",
    userRating: 4,
    completed: true
  },
  progressUpdates: {
    lastUpdated: "2026-02-09T10:00:00Z",
    updateCount: 2
  }
}
```

### Progressive Overload Logic

When completing a workout from history:
1. Compare each exercise's actual performance vs. cached values
2. **Weight increased?** → Update cached weight ✅
3. **Same weight, more reps?** → Update cached reps ✅
4. **Track RPE/RIR improvements** → Update if better
5. Recalculate workout metadata (volume, intensity)
6. Increment progress update counter

This ensures every time you load a workout, you're building on your last performance, not starting from scratch!

### Storage
- LocalStorage key: `workoutHistory`
- Organized by userId
- Keeps last 100 workouts per user
- Automatic cleanup of 90+ day old workouts

## Usage

### For Users
1. Generate workouts as normal (they auto-save to history)
2. Click "Smart Pick for Today" to get the best match
3. Or click "Browse" to see top recommendations
4. Complete workouts to improve their effectiveness rating

### For Developers
```javascript
// Get best workout
const workout = await selectBestWorkout(userId, {
  type: 'strength',
  focus: 'legs',
  intensity: 'high'
});

// Get multiple recommendations
const recommendations = await getWorkoutRecommendations(userId, 5);

// Save to history
await saveToHistory(userId, workout);

// Update effectiveness
await updateWorkoutEffectiveness(userId, workoutId, {
  completed: true,
  userRating: 5
});

// Update with new weights/progress (automatic progressive overload)
await updateWorkoutProgress(userId, workoutId, completedExercises);
```

## Progressive Overload in Action

**Scenario:**
```
Week 1: Load "Chest Day" from cache
  - Bench Press: 135lbs x 10, 135lbs x 10, 135lbs x 8

Week 2: Complete with better performance
  - Bench Press: 140lbs x 10, 140lbs x 10, 140lbs x 9
  ✅ Cache automatically updates to 140lbs

Week 3: Load same "Chest Day"
  - Bench Press: Now shows 140lbs (not 135lbs!)
  - Progressive overload achieved automatically!
```

## Future Enhancements

- Export/import workout history
- Share workouts with coach or friends
- Advanced filtering (equipment, duration, specific exercises)
- Workout templates/favorites
- Custom scoring weights per user
