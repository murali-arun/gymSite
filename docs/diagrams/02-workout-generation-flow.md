# Workout Generation Flow

This diagram illustrates the four different ways workouts can be generated in the application, each optimized for different user needs.

```mermaid
sequenceDiagram
    actor User
    participant WorkoutGen as WorkoutGenerator
    participant API
    participant Cache as WorkoutPlanCache
    participant History as WorkoutHistory
    participant Storage
    participant Tracker as ExerciseTracker
    
    User->>WorkoutGen: Request Workout
    
    alt Generate Single Workout
        WorkoutGen->>API: generateWorkout(user, preferences)
        API->>API: Call LiteLLM API
        API-->>WorkoutGen: Workout plan
        WorkoutGen->>History: saveToHistory(workout)
        WorkoutGen->>Storage: setCurrentWorkout(workout)
        WorkoutGen->>Tracker: Navigate & pass workout
    else Generate Multi-Day Plan
        WorkoutGen->>API: generateWorkoutPlan(user, days)
        API-->>WorkoutGen: 3-7 day plan
        WorkoutGen->>Cache: setWorkoutPlan(plan)
        WorkoutGen->>History: saveToHistory(firstWorkout)
        WorkoutGen->>Storage: setCurrentWorkout(firstWorkout)
        WorkoutGen->>Tracker: Navigate & pass workout
    else Use Next from Plan
        WorkoutGen->>Cache: getNextWorkoutFromPlan()
        Cache-->>WorkoutGen: Next scheduled workout
        WorkoutGen->>History: saveToHistory(workout)
        WorkoutGen->>Storage: setCurrentWorkout(workout)
        WorkoutGen->>Tracker: Navigate & pass workout
    else Load from History
        User->>WorkoutGen: Select from recommendations
        WorkoutGen->>History: getWorkoutHistory()
        History-->>WorkoutGen: Past workouts
        WorkoutGen->>WorkoutGen: selectBestWorkout()
        WorkoutGen->>Storage: setCurrentWorkout(workout)
        WorkoutGen->>Tracker: Navigate & pass workout
    end
```

## Workout Generation Methods

### 1. Single Workout Generation
- **Use Case**: Quick, one-time workout
- **AI Generated**: Yes
- **Customizable**: User can specify focus, equipment, activity type

### 2. Multi-Day Plan (3-7 days)
- **Use Case**: Structured weekly training program
- **Caching**: Plan cached for sequential use
- **Progressive**: Each day builds on previous

### 3. Next from Cached Plan
- **Use Case**: Continue existing multi-day plan
- **Performance**: No API call needed
- **Scheduling**: Workouts have scheduled dates

### 4. Load from History
- **Use Case**: Repeat successful workouts
- **Smart Selection**: Algorithm chooses best based on effectiveness
- **Progressive Overload**: Automatically increases weights if PRs were achieved
