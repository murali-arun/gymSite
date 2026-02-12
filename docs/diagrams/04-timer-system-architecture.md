# Timer System Architecture

This diagram details the complete timer system including the three independent timers, their interactions, and cleanup mechanisms.

```mermaid
graph TB
    Start[Workout Started] --> MainTimer[Main Workout Timer]
    Start --> ExerciseTimer[Exercise Timer]
    
    MainTimer --> |setInterval 1s| UpdateElapsed[Update elapsedTime]
    UpdateElapsed --> Display1[Display Total Time]
    
    ExerciseTimer --> |setInterval 1s| UpdateExercise[Update exerciseElapsedTime]
    UpdateExercise --> Display2[Display Exercise Time]
    
    SetComplete[User Completes Set] --> CheckRest{Need Rest?}
    CheckRest --> |Yes| StartRest[Start Rest Timer]
    CheckRest --> |No - Last Set| NextExercise[Move to Next Exercise]
    
    StartRest --> RestCountdown[Countdown from recommendedRest]
    RestCountdown --> |setInterval 1s| DecrementRest[Decrement restTimer]
    DecrementRest --> CheckZero{Timer = 0?}
    
    CheckZero --> |Yes| PlaySound[Play Audio Alert]
    PlaySound --> AutoDismiss[setTimeout 2s]
    AutoDismiss --> ClearRest[Clear Rest Timer]
    
    CheckZero --> |No| DisplayRest[Display Countdown]
    
    NextExercise --> ResetExercise[Reset Exercise Timer]
    ResetExercise --> ExerciseTimer
    
    Pause[User Pauses] --> StopAll[Pause All Timers]
    Resume[User Resumes] --> AdjustTime[Adjust pausedTime]
    AdjustTime --> ResumeAll[Resume All Timers]
    
    Unmount[Component Unmounts] --> Cleanup[Cleanup Effect]
    Cleanup --> ClearMain[clearInterval timerRef]
    Cleanup --> ClearEx[clearInterval exerciseTimerRef]
    Cleanup --> ClearRestInt[clearInterval restTimerRef]
    Cleanup --> ClearTimeout[clearTimeout autoDismissRef]
    Cleanup --> CloseAudio[Close AudioContext]
    
    style MainTimer fill:#4CAF50
    style ExerciseTimer fill:#2196F3
    style RestCountdown fill:#FF9800
    style Cleanup fill:#F44336
```

## Timer Details

### 1. Main Workout Timer (Green)
- **Purpose**: Track total workout duration
- **Update Frequency**: Every 1 second
- **Display**: Top-right corner, white text
- **Persistence**: Continues through all exercises
- **Pause Support**: Yes - tracks paused time separately

### 2. Exercise Timer (Blue)
- **Purpose**: Track time spent on current exercise
- **Update Frequency**: Every 1 second  
- **Display**: Top-right corner, blue text
- **Reset**: When moving to next exercise
- **Use Case**: Helps user see if they're taking too long

### 3. Rest Timer (Orange)
- **Purpose**: Countdown rest period between sets
- **Type**: Countdown (not count-up)
- **Default**: 90s between sets, 120s between exercises
- **Adjustable**: +15s / -15s buttons, preset options (60s, 90s, 120s, 180s)
- **Audio Alert**: Plays sound when timer reaches 0
- **Auto-Dismiss**: Disappears 2 seconds after completion
- **Dismissible**: Can be skipped/closed manually

## Performance Optimizations

### Cleanup on Unmount
All timers are properly cleaned up to prevent memory leaks:
1. Clear all `setInterval` timers
2. Clear `setTimeout` for auto-dismiss
3. Close `AudioContext` to free resources

### Pause Behavior
- Accumulates paused time separately
- Adjusts elapsed calculations to exclude paused periods
- All timers stop during pause

### Audio Context Reuse
- Single `AudioContext` reused for all rest alerts
- Prevents hitting browser's 6-context limit
- Gracefully degrades if audio fails
