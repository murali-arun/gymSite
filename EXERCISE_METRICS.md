# Exercise Metrics Support (Reps/Time/Distance)

## Overview
The system now supports three different measurement types for exercises:
- **Reps** (default): Traditional repetition-based exercises
- **Time**: Duration-based exercises measured in seconds  
- **Distance**: Distance-based exercises measured in meters

## When to Use Each Metric

### 📊 Reps (Default)
**Use for**: Traditional strength exercises
- Squats, Bench Press, Deadlifts
- Rows, Pull-ups, Curls
- Lunges, Leg Press
- Any exercise counted by repetitions

**Display**: "135 lbs × 10 reps"

### ⏱️ Time (Seconds)
**Use for**: Isometric holds and timed exercises
- **Planks** (Front Plank, Side Plank)
- **Wall Sits**
- **Dead Hangs**
- **Hollow Body Hold**
- **L-Sits**
- Any exercise held for duration

**Display**: "60 sec" or "45 sec per side"

### 📏 Distance (Meters)
**Use for**: Loaded carries and pushing/pulling  
- **Farmer's Carry** (40 lbs each hand for 30m)
- **Sled Push**
- **Sled Pull**
- **Prowler Push**
- **Yoke Walk**
- **Sandbag Carry**

**Display**: "40 lbs → 30 m" (weight → distance)

## AI Workout Generation

The AI will automatically assign the correct metric when generating workouts:

### Example 1: Plank (Time-based)
```json
{
  "name": "Plank",
  "metric": "time",
  "perSide": false,
  "sets": [
    {"weight": 0, "reps": 60, "completed": false},
    {"weight": 0, "reps": 60, "completed": false},
    {"weight": 0, "reps": 60, "completed": false}
  ]
}
```
**Means**: 3 sets of 60-second planks

### Example 2: Side Plank (Time + Per Side)
```json
{
  "name": "Side Plank",
  "metric": "time",
  "perSide": true,
  "sets": [
    {"weight": 0, "reps": 45, "completed": false}
  ]
}
```
**Means**: Hold 45 seconds on left side, then 45 seconds on right side

### Example 3: Farmer's Carry (Distance-based)
```json
{
  "name": "Farmer's Carry",
  "metric": "distance",
  "perSide": false,
  "sets": [
    {"weight": 50, "reps": 30, "completed": false},
    {"weight": 50, "reps": 30, "completed": false}
  ]
}
```
**Means**: 2 carries of 30 meters each, holding 50 lbs in each hand

### Example 4: Sled Push (Distance-based)
```json
{
  "name": "Sled Push",
  "metric": "distance",
  "perSide": false,
  "sets": [
    {"weight": 135, "reps": 25, "completed": false},
    {"weight": 135, "reps": 25, "completed": false}
  ]
}
```
**Means**: 2 pushes of 25 meters with 135 lbs loaded

## User Interface Behavior

### Exercise Tracker

#### Reps-based Exercise
- **Weight buttons**: −2.5 lbs, Same, +2.5 lbs
- **Reps counter**: −1 / +1 buttons
- **Label**: "Reps"
- **Display**: "10 reps"

#### Time-based Exercise
- **Weight section**: Hidden (bodyweight)
- **Time counter**: −5 sec / +5 sec buttons (increment by 5)
- **Label**: "Time"
- **Display**: "60 seconds"

#### Distance-based Exercise
- **Weight buttons**: Shown (for load)
- **Distance counter**: −1 m / +1 m buttons
- **Label**: "Distance"
- **Display**: "30 meters"

### Workout History Display

**Reps**: `225 lbs × 5 reps`
**Time**: `60 sec`
**Distance**: `50 lbs → 30 m`

## Data Structure

### Exercise Object
```javascript
{
  name: "Exercise Name",
  metric: "reps" | "time" | "distance",  // defaults to "reps" if not specified
  perSide: false,
  sets: [
    {
      weight: 0,      // Weight in lbs (0 for bodyweight/time exercises)
      reps: 0,        // Actually stores: reps OR seconds OR meters
      completed: false
    }
  ]
}
```

**Important**: The `reps` field is overloaded:
- metric="reps" → stores repetition count
- metric="time" → stores seconds
- metric="distance" → stores meters

## Common Exercises by Metric

### Time-Based Exercises
- Plank (all variations)
- Side Plank
- Wall Sit
- Dead Hang
- Hollow Body Hold
- L-Sit
- Superman Hold
- Bridge Hold

### Distance-Based Exercises
- Farmer's Carry
- Sled Push
- Sled Pull
- Prowler Push
- Yoke Walk
- Sandbag Carry
- Overhead Carry (with weight)

### Reps-Based Exercises (Everything Else)
- All traditional lifts
- All bodyweight exercises (push-ups, pull-ups, etc.)
- All isolation movements

## AI Guidance

### When User Asks About Carries
**User**: "Give me a workout with farmer's carries"

**AI Response**: Should include distance-based exercise
```json
{
  "name": "Farmer's Carry",
  "metric": "distance",
  "sets": [
    {"weight": 40, "reps": 30, "completed": false}
  ]
}
```

### When User Requests Core Work
**User**: "Add some planks"

**AI Response**: Should use time metric
```json
{
  "name": "Plank",
  "metric": "time",
  "sets": [
    {"weight": 0, "reps": 60, "completed": false}
  ]
}
```

## Benefits

✅ **Accurate Tracking**: Each exercise tracked with appropriate metric
✅ **Better UI**: Correct labels and increments for each type
✅ **Clearer History**: Easy to understand past performance
✅ **Proper Programming**: AI generates workouts with right structure
✅ **Progressive Overload**: Track improvements across all exercise types

## Examples in Practice

### Strongman Training
```
1. Farmer's Carry - 60 lbs → 40 m (3 sets)
2. Yoke Walk - 200 lbs → 25 m (3 sets)
3. Sled Pull - 90 lbs → 30 m (4 sets)
```

### Core Circuit
```
1. Plank - 60 sec (3 sets)
2. Side Plank - 45 sec per side (3 sets)
3. Hollow Body Hold - 30 sec (4 sets)
4. Dead Bug - 12 reps (3 sets)
```

### CrossFit/Functional
```
1. Front Squat - 185 lbs × 5 reps (5 sets)
2. Farmer's Carry - 53 lbs → 50 m (3 sets)
3. Plank - 90 sec (3 sets)
```

---

**Implementation Files**:
- AI Prompt: [src/services/api.js](src/services/api.js) - Lines 268-350
- Exercise Tracker UI: [src/components/features/workout/ExerciseTracker.jsx](src/components/features/workout/ExerciseTracker.jsx)
- History Display: [src/components/features/workout/History.jsx](src/components/features/workout/History.jsx)
