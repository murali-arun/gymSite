# Cost Optimization: Multi-Day Workout Plans

## Problem
Generating 1 workout at a time means:
- **7 LLM calls per week** (daily workouts)
- **~$1.25 per workout × 7 = $8.75/week**
- **~$35/month per user**
- Users do similar workouts (running Monday, leg day Tuesday, etc.)

## Solution: Batch Generation + Caching

### Multi-Day Plan Generation
Instead of generating 1 workout, generate 3-7 days at once:
- **1 LLM call generates 3-7 workouts**
- Plans cached in localStorage
- Workouts used sequentially from cache

### Cost Comparison

#### Old Way (Daily Generation):
```
Week 1: 7 workouts × $1.25 = $8.75
- Monday: $1.25 (Upper body)
- Tuesday: $1.25 (Cardio - Running)
- Wednesday: $1.25 (Lower body)
- Thursday: $1.25 (Cardio - Running) ← Similar to Tuesday!
- Friday: $1.25 (Full body)
- Saturday: $1.25 (Active recovery)
- Sunday: $1.25 (Cardio)

Total: $8.75/week = $35/month
```

#### New Way (3-Day Plans):
```
Plan 1 (Days 1-3): $1.50 (single LLM call for 3 days)
- Day 1: Upper body (cached)
- Day 2: Cardio - Running (cached)
- Day 3: Lower body (cached)

Plan 2 (Days 4-6): $1.50
- Day 4: Cardio - Running (cached, similar to Day 2)
- Day 5: Full body (cached)
- Day 6: Active recovery (cached)

Day 7: $1.25 (single workout if needed)

Total: $4.25/week = $17/month
```

#### New Way (7-Day Plans):
```
Plan 1 (Full Week): $2.00 (single LLM call for 7 days)
All 7 workouts cached and used throughout the week

Total: $2.00/week = $8/month
```

### Savings

| Approach | Cost/Week | Cost/Month | Savings vs Old |
|----------|-----------|------------|----------------|
| **Daily (Old)** | $8.75 | $35 | - |
| **3-Day Plans** | $4.25 | $17 | 51% savings |
| **7-Day Plans** | $2.00 | $8 | 77% savings |

## Implementation

### 1. Workout Plan Cache (`workoutPlanCache.js`)
```javascript
// Stores plans in localStorage
{
  "userId": {
    "planSummary": "7-day strength & cardio split",
    "createdAt": "2026-02-03",
    "expiresAt": "2026-02-10",
    "workouts": [
      {
        "dayNumber": 1,
        "scheduledDate": "2026-02-03",
        "title": "Upper Body",
        "type": "strength",
        "exercises": [...],
        "used": false
      }
    ]
  }
}
```

### 2. API Function (`api.js`)
```javascript
export async function generateWorkoutPlan(user, daysCount, coachType)
```
- Single LLM call generates multiple days
- Applies progressive overload across days
- Varies muscle groups and training styles
- Returns structured plan

### 3. UI Updates (`WorkoutGenerator.jsx`)
- Shows "X workouts remaining" badge
- Buttons to generate 3/5/7 day plans
- "Use Next Workout" button for cached plans
- Falls back to single workout generation

## Why This Works

### 1. **Workouts Are Predictable**
Most users follow patterns:
- Mon/Wed/Fri: Strength (Upper, Lower, Full)
- Tue/Thu: Cardio (Running, Cycling)
- Sat/Sun: Active recovery or rest

### 2. **Progressive Overload Across Days**
LLM can plan progression better when seeing full week:
```
Day 1: Squat 3×8 @ 185lbs
Day 3: Squat 3×6 @ 195lbs (heavier, lower reps)
Day 5: Squat 4×10 @ 165lbs (volume day)
```

### 3. **Variety Within Structure**
- Upper body can vary (chest focus vs back focus)
- Cardio changes (intervals vs steady-state)
- Recovery days adapt (stretching vs light activity)

### 4. **Smart Caching**
- Plans expire after 7 days (prevents stale workouts)
- Users can regenerate anytime
- Plans track which workouts are used
- Supports both casual (1 day) and planned (7 days) users

## User Experience Benefits

### Before:
1. User opens app
2. Clicks "Generate Workout"
3. Waits 3-5 seconds
4. Gets today's workout
5. **Repeats daily** ← 7 API calls/week

### After:
1. User opens app
2. Clicks "Generate 7-Day Plan"
3. Waits 5-7 seconds (once!)
4. Gets full week planned
5. Each day: Click "Use Next Workout" (instant, no API call)

## Fallback Strategy

Users still have options:
- ✅ Generate full week plan (recommended, cheapest)
- ✅ Generate 3-day plan (good balance)
- ✅ Generate single workout (spontaneous training)
- ✅ Regenerate anytime (if plan doesn't fit)

## Real-World Scenarios

### Scenario 1: Consistent User
Sarah trains 5 days/week, same schedule:
- **Old cost**: 5 workouts × $1.25 × 4 weeks = **$25/month**
- **New cost**: 1 weekly plan × $2.00 × 4 weeks = **$8/month**
- **Savings**: $17/month (68%)

### Scenario 2: Variable User  
Mike trains 3-4 days/week, unpredictable:
- **Old cost**: 3.5 workouts × $1.25 × 4 weeks = **$17.50/month**
- **New cost**: 2 plans/week × $1.50 × 4 weeks = **$12/month**
- **Savings**: $5.50/month (31%)

### Scenario 3: Casual User
Alex trains 2 days/week:
- **Old cost**: 2 workouts × $1.25 × 4 weeks = **$10/month**
- **New cost**: Still generates daily = **$10/month**
- **Savings**: $0 (but option available when ready for consistency)

## Model Selection for Plans

Use cheaper models for plan generation since we're generating more content:

```env
# Workout Plan Generation (3-7 days at once)
MODEL_WORKOUT_PLAN=gpt-4o-mini  # Cheaper for bulk
# vs
MODEL_WORKOUT=gpt-5-mini  # Higher quality for single workouts
```

Plan generation cost:
- **gpt-4o-mini**: ~$0.50 for 7-day plan
- **gpt-5-mini**: ~$2.00 for 7-day plan

## Summary

**Total Savings**: 51-77% cost reduction
**User Experience**: Better (pre-planned week)
**Scalability**: Handles 10x more users with same LLM budget
**Flexibility**: Users choose daily or weekly planning

**Recommendation**: Default to 7-day plans, allow single workouts for flexibility.
