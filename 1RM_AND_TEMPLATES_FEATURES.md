# 1RM Calculator & Workout Templates Features

## 🎯 Overview
Two powerful new features to help users train smarter and more efficiently:

1. **1RM Calculator & Strength Standards** - Know your true strength level
2. **Workout Templates** - Save and reuse workouts with progressive overload

---

## 💪 1RM Calculator & Strength Standards

### What It Does
- **Calculates estimated One-Rep Max (1RM)** from your workout history
- **Compares your strength** to standards (Untrained → Novice → Intermediate → Advanced → Elite)
- **Shows training weights** at different percentages of your 1RM
- **Identifies next goals** - how much more to lift to reach the next level

### How It Works

#### 1RM Calculation
Uses industry-standard formulas:
- **Epley Formula**: Most common, good for general estimation
- **Brzycki Formula**: More conservative, better for higher reps
- Automatically averages both for accuracy
- Only uses completed sets from your workout history

#### Strength Standards
Based on ExRx.net research for male lifters:
- **5 Levels**: Untrained → Novice → Intermediate → Advanced → Elite
- **Adjustable bodyweight** - standards scale to your weight
- **Main Lifts**: Squat, Bench Press, Deadlift, Overhead Press, Barbell Row
- Visual progress bar showing position within strength spectrum

#### Training Weights
Calculates recommended training weights:
- **95%** - Singles (1-2 reps)
- **90%** - Doubles/Triples (2-4 reps)
- **85%** - Strength work (4-6 reps)
- **80%** - Strength-Hypertrophy (6-8 reps)
- **75%** - Volume work (8-10 reps)
- **70%** - Hypertrophy (10-12 reps)
- **65%** - Higher volume (12-15 reps)
- **60%** - Endurance (15+ reps)

### Where to Find It
**Navigation**: Click "💪 1RM" button in header

### User Experience

```
┌─────────────────────────────────────────┐
│  Strength Standards                     │
│  Estimated 1RM and strength levels      │
│                                         │
│  Bodyweight: [180] lbs                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Barbell Back Squat                     │
│  315 lbs estimated 1RM                  │
│  🔥 Intermediate                         │
│                                         │
│  [Progress Bar: 67%]                    │
│  Untrained ────────────────── Elite     │
│                                         │
│  Next: Advanced • Need +30 lbs          │
│  Target: 345 lbs                        │
│                                         │
│  ▼ Training Weights                     │
│  95%: 300 lbs    85%: 270 lbs          │
│  90%: 285 lbs    80%: 250 lbs          │
│  75%: 235 lbs    70%: 220 lbs          │
│                                         │
│  Based on 245 lbs × 8 reps             │
└─────────────────────────────────────────┘
```

### Benefits
✅ **Motivation** - See concrete strength level progress
✅ **Goal Setting** - Know exactly what to aim for
✅ **Training Guidance** - Use percentages for smart programming
✅ **Competition** - Compare yourself to standards
✅ **Validation** - Confirm your training is working

---

## 📋 Workout Templates

### What It Does
- **Save favorite workouts** as reusable templates
- **Quick-start workouts** - one tap to begin
- **Progressive Overload** - auto-fills last session's weights
- **Organize with tags** - categorize by type, focus, duration
- **Track usage** - see most-used templates

### How It Works

#### Saving Templates
1. Generate or complete a workout
2. Click "💾 Save Current Workout"
3. Name it (e.g., "Push Day", "Leg Power")
4. Add optional description
5. Tag it (push, upper, strength, etc.)
6. Template saved!

#### Loading Templates
1. Go to "💾 Templates" view
2. Browse saved templates
3. Click "▶ Start Workout"
4. **Magic**: Last weights auto-filled for progressive overload
5. Begin training immediately

#### Progressive Overload
When you load a template:
- Searches your workout history
- Finds most recent performance of each exercise
- Pre-fills weights and reps from that session
- You're ready to beat last week's numbers!

### Template Structure
```javascript
{
  name: "Push Day",
  description: "Chest, shoulders, triceps focus",
  tags: ["push", "upper", "strength"],
  exercises: [
    {
      name: "Barbell Bench Press",
      sets: [
        { weight: 185, reps: 5 },
        { weight: 185, reps: 5 },
        { weight: 185, reps: 5 }
      ]
    },
    // ... more exercises
  ],
  timesUsed: 12,
  lastUsed: "2026-02-10"
}
```

### Where to Find It
**Navigation**: Click "💾 Templates" button in header

### User Experience

```
┌─────────────────────────────────────────┐
│  Workout Templates                      │
│  Save and reuse workouts                │
│                                         │
│  [💾 Save Current Workout]              │
└─────────────────────────────────────────┘

┌────────────────┬────────────────────────┐
│  Push Day      │  Leg Day              │
│  Chest & tris  │  Squat focus          │
│  #push #upper  │  #legs #strength      │
│  💪 6 exercises│  💪 5 exercises       │
│  🔁 Used 8x   │  🔁 Used 12x          │
│                │                        │
│  [▶ Start]     │  [▶ Start]            │
│  [👁️] [🗑️]    │  [👁️] [🗑️]           │
└────────────────┴────────────────────────┘
```

### Template Tags (Suggested)
**Type**: push, pull, legs, upper, lower, full body
**Focus**: chest, back, shoulders, arms, core
**Goal**: strength, hypertrophy, endurance, power
**Location**: home, gym, minimal equipment
**Duration**: quick, 30min, 45min, 60min+
**Level**: beginner, intermediate, advanced

### Benefits
✅ **Time Saver** - No planning each session
✅ **Consistency** - Same proven workouts
✅ **Progressive Overload** - Built-in weight progression
✅ **Organization** - Templates for every goal
✅ **Flexibility** - Modify on the fly if needed

---

## 🔧 Technical Implementation

### Files Created

#### Utilities
- `src/utils/strengthCalculator.js` - 1RM calculations and strength standards
- `src/utils/workoutTemplates.js` - Template CRUD operations

#### Components
- `src/components/features/progress/StrengthStandards.jsx` - 1RM UI
- `src/components/features/workout/WorkoutTemplates.jsx` - Templates UI

### Data Storage

#### 1RM Calculator
- **No storage needed** - calculated in real-time from workout history
- Pure functions based on user's completed workouts
- Performance optimized with `useMemo` hooks

#### Workout Templates
```javascript
localStorage: {
  workoutTemplates: {
    "user_123": [
      {
        id: "template_456",
        name: "Push Day",
        // ... template data
      }
    ]
  }
}
```

### Key Algorithms

#### 1RM Estimation (Epley + Brzycki Average)
```javascript
// Epley: 1RM = weight × (1 + reps/30)
epley1RM = weight * (1 + reps / 30)

// Brzycki: 1RM = weight × (36 / (37 - reps))
brzycki1RM = weight * (36 / (37 - reps))

// Final estimate
estimated1RM = (epley1RM + brzycki1RM) / 2
```

#### Progressive Overload Logic
```javascript
1. Load template exercises
2. For each exercise:
   - Search workout history (newest first)
   - Find last completed performance
   - Extract weights and reps from completed sets
   - Pre-fill into template
3. User sees their last session's numbers
4. They can now beat those numbers!
```

---

## 💡 Usage Examples

### Scenario 1: New Lifter Checking Progress
**User**: "I've been squatting for 2 months. Am I getting stronger?"

1. Goes to 1RM Calculator
2. Sees: "245 lbs estimated 1RM - Novice level"
3. Progress bar shows 48% through novice
4. Goal: "Need +35 lbs to reach Intermediate (280 lbs)"
5. **Result**: Clear, measurable goal!

### Scenario 2: Busy Athlete Needs Quick Workout
**User**: "I only have 30 minutes - what should I do?"

1. Goes to Templates
2. Filters by "30min" tag
3. Clicks "Quick Upper Body"
4. Template loads with last week's weights
5. **Result**: Training in 10 seconds!

### Scenario 3: Progressive Overload Made Easy
**User**: "What weight should I use for bench today?"

**Without Templates**:
- Check history manually
- Remember last week's sets
- Calculate new weight
- Input everything

**With Templates**:
- Click "Push Day" template
- See: "Last time: 185 lbs × 5 reps"
- Increase to 190 lbs
- **Result**: Instant progressive overload!

---

## 🎓 AI Coach Integration

### What the AI Knows
- Users can save workouts as templates
- Templates auto-fill with progressive overload
- 1RM calculator shows strength levels
- Strength standards motivate goal-setting

### AI Suggestions
When appropriate, the AI can say:

**After a good workout**:
> "Great session! Want to save this as a template? You can reuse it next week with the weights already filled in."

**When user asks about strength**:
> "Based on your recent squats (235×8), your estimated 1RM is around 280 lbs - that's solid intermediate level! Want to check your other lifts in the 1RM Calculator?"

**When user seems lost**:
> "Try the Templates feature - save your favorite workouts and start them with one tap. No planning needed!"

---

## 🚀 Future Enhancements

### 1RM Calculator
- [ ] Support for female strength standards
- [ ] Age-adjusted standards
- [ ] Custom bodyweight input saved per user
- [ ] PR detection and celebration
- [ ] 1RM history tracking over time

### Workout Templates
- [ ] Share templates with other users
- [ ] Pre-built templates by coaches
- [ ] Template categories/folders
- [ ] Clone and modify templates
- [ ] Auto-suggest templates based on goals
- [ ] Template performance analytics

---

## 📊 Success Metrics

### How to Measure Impact

**1RM Calculator**:
- % of users visiting the feature
- Time spent viewing strength standards
- Correlation with workout consistency
- User-reported motivation increase

**Workout Templates**:
- Number of templates created per user
- Template reuse frequency
- Time to start workout (before vs after templates)
- Workout consistency improvement

---

## ✅ Testing Checklist

### 1RM Calculator
- [x] Calculates correct 1RM from various rep ranges
- [x] Strength level displays correctly
- [x] Progress bar shows accurate position
- [x] Bodyweight adjustment works
- [x] Training weights calculate properly
- [x] Handles edge cases (no workout history, beginner, etc.)

### Workout Templates
- [x] Save template with name, description, tags
- [x] Load template and start workout
- [x] Progressive overload pre-fills last weights
- [x] Delete template with confirmation
- [x] View template details
- [x] Search/filter templates by tags
- [x] Templates persist after app restart

---

**Ready to train smarter! 💪🎯📋**
