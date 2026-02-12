# Exercise Tracker Lifecycle & State Management

This state diagram shows the complete lifecycle of a workout session from initial load to completion, including all possible state transitions.

```mermaid
stateDiagram-v2
    [*] --> NotStarted: Component Mounts
    
    NotStarted --> CheckingSavedProgress: useEffect runs
    CheckingSavedProgress --> ShowResumeModal: Found saved workout
    CheckingSavedProgress --> PreWorkout: No saved workout
    
    ShowResumeModal --> RestoredWorkout: User clicks Resume
    ShowResumeModal --> PreWorkout: User clicks Start Fresh
    
    PreWorkout --> Countdown: User confirms start
    RestoredWorkout --> ActiveWorkout: State restored
    Countdown --> ActiveWorkout: 5 second countdown complete
    
    state ActiveWorkout {
        [*] --> ExecutingSet
        ExecutingSet --> RestPeriod: Set completed
        RestPeriod --> ExecutingSet: Rest timer ends
        ExecutingSet --> NextExercise: All sets complete
        NextExercise --> ExecutingSet: Move to next exercise
        NextExercise --> WorkoutComplete: All exercises done
        
        state ExecutingSet {
            [*] --> WaitingForInput
            WaitingForInput --> RecordingReps: User adjusts reps
            WaitingForInput --> RecordingWeight: User adjusts weight
            RecordingReps --> WaitingForInput
            RecordingWeight --> WaitingForInput
            WaitingForInput --> SetMarkedComplete: User marks complete
        }
        
        state RestPeriod {
            [*] --> CountingDown
            CountingDown --> RestComplete: Timer hits 0
            CountingDown --> Skipped: User dismisses
            RestComplete --> [*]
            Skipped --> [*]
        }
    }
    
    ActiveWorkout --> Paused: User pauses
    Paused --> ActiveWorkout: User resumes
    
    ActiveWorkout --> PostWorkout: User clicks Complete
    PostWorkout --> SavingWorkout: User submits feedback
    SavingWorkout --> [*]: Workout saved
    
    note right of ActiveWorkout
        Auto-saves progress to localStorage
        on every state change
    end note
```

## State Descriptions

### NotStarted
- Component just mounted
- No workout activity yet
- Checking for saved progress

### CheckingSavedProgress
- Queries localStorage for in-progress workout
- Validates saved data (must be <24 hours old)
- Checks if workout ID matches current workout

### ShowResumeModal
- Displays saved workout info
- Shows progress (exercise X of Y, set N of M)
- Offers Resume or Start Fresh options

### ActiveWorkout
- Main workout state
- Manages exercise progression
- Handles set completion
- Controls rest periods
- **Auto-saves** on every meaningful state change

### Paused
- All timers stopped
- Paused time tracked for accuracy
- Can resume at any time

### PostWorkout
- Collects user feedback (difficulty, feeling, soreness)
- Optional but recommended for AI learning

### SavingWorkout
- Sends data to AI for feedback
- Saves to backend
- Updates workout history
- Triggers progress summary if needed (every 7 workouts)
