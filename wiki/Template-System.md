# 💾 Template System

The Template System lets you save, organize, and reuse your favorite workouts with progressive overload built-in.

## Overview

Templates are reusable workout blueprints that automatically fill in your last used weights and reps, making progressive overload effortless.

### Key Features
- 💾 **Save any workout** as a reusable template
- 🔄 **Auto-fill last weights** for progressive overload
- 🏷️ **Tag-based organization** (push, pull, legs, etc.)
- 🤖 **AI template generation** from workout history
- 📚 **Browse history** to save older workouts
- 🎯 **One-click loading** to start training

## Creating Templates

### Method 1: Save Current Workout

When you have an active workout:

1. **Complete or start a workout**
2. Click **💾 Save Current Workout as Template**
3. **Fill in details**:
   - Template name (e.g., "Push Day", "Leg Destroyer")
   - Description (optional)
   - Tags (select from suggestions or add custom)
4. Click **Save Template**

The template preserves:
- All exercises and their order
- Sets and reps structure
- Last used weights for each exercise
- Exercise-specific notes

### Method 2: Save from History

Browse your completed workouts:

1. Scroll to **"Save from Recent Workouts"** section
2. Click **Show All** to see complete history (if 6+ workouts)
3. Find a workout you want to save
4. Click **💾 Save as Template**
5. Name and tag it

**Pro Tip**: This is great for recreating workouts from weeks ago!

### Method 3: AI Template Generation

Let AI analyze your history and create optimized templates:

1. Complete at least **3 workouts** (more is better)
2. Click **🤖 Generate Templates from My History**
3. AI analyzes:
   - Exercise patterns
   - Muscle group splits
   - Volume and intensity
   - Your preferences
4. AI creates **2-4 templates** automatically
5. Review and use them immediately

**What AI Considers**:
- Most common exercise combinations
- Effective muscle group pairings
- Your strength levels
- Workout duration patterns
- Progressive overload progression

## Using Templates

### Loading a Template

1. Go to **Templates** section
2. Browse **📚 My Templates**
3. Click on a template card to see details:
   - Full exercise list
   - Sets/reps breakdown
   - Tags and description
   - Last used date
   - Times used count
4. Click **▶ Load Template** to start workout

### Progressive Overload

When loading a template:

```
Original Template:
- Bench Press: 135lbs x 10 reps

Your Last Performance:
- Bench Press: 140lbs x 10 reps (from 2 weeks ago)

Loaded Workout:
- Bench Press: 140lbs x 10 reps ← Auto-filled!
```

The system:
- Searches your workout history
- Finds last time you did that exercise
- Pre-fills those weights and reps
- You start where you left off!

## Managing Templates

### Template Information

Each template shows:
- **Name** - Custom title
- **Description** - Optional notes
- **Exercise count** - Total exercises
- **Tags** - Category labels
- **Created date** - When you saved it
- **Last used** - Last time loaded
- **Times used** - Usage counter

### Deleting Templates

1. Click template card for details
2. Click **🗑️ Delete Template**
3. Confirm deletion
4. Template removed **permanently**

**Important**: 
- Deleting templates does NOT delete workout history
- AI template generation adds new templates (never deletes)
- You have full control over your template library

### Editing Templates

Currently, templates can't be edited after creation. Instead:

1. Load the template
2. Modify exercises as needed
3. Save as a new template with different name
4. Delete the old one if you want

## Template Tags

### Suggested Tags

The system provides common tags:
- **Movement**: Push, Pull, Legs, Full Body
- **Focus**: Upper, Lower, Core, Cardio
- **Intensity**: Light, Moderate, Heavy
- **Equipment**: Barbell, Dumbbell, Bodyweight, Machine
- **Goal**: Strength, Hypertrophy, Endurance
- **Location**: Home, Gym

### Custom Tags

Add your own:
- "Quick" (30-minute workouts)
- "Travel" (hotel gym friendly)
- "Favorites"
- "Competition Prep"
- Anything you want!

### Filtering by Tags

Tags help organize large template libraries:
- Visual at-a-glance categorization
- Quick identification of workout type
- Future: Filter and search (coming soon!)

## AI Template Generation Details

### Requirements
- Minimum **3 completed workouts**
- Better results with **10+ workouts**
- Works best with variety in history

### What AI Creates

**Example Output** (for a user with push/pull/legs history):

1. **Push Power Template**
   - Bench Press variations
   - Shoulder work
   - Tricep isolation
   - Tags: push, upper, chest

2. **Pull Strength Template**
   - Rowing movements
   - Pull-ups/chin-ups
   - Bicep curls
   - Tags: pull, upper, back

3. **Leg Blast Template**
   - Squat variations
   - Hamstring work
   - Quad isolation
   - Tags: legs, lower

4. **Full Body Express** (if you do full body workouts)
   - Compound movements only
   - Balanced muscle coverage
   - Tags: full body, quick

### Generation Process

```
User clicks "Generate Templates from History"
    ↓
AI analyzes last 20 workouts
    ↓
Identifies patterns:
- Common exercise combinations
- Muscle group splits
- Volume per session
- Intensity distribution
    ↓
Creates 2-4 complementary templates
    ↓
Saves to your template library
    ↓ 
Success message with count
```

**Note**: AI only **adds** templates, never deletes existing ones!

### Customizing AI Output

After AI generates templates:
1. Review each one
2. Load it to test
3. Modify if needed
4. Save as new template
5. Delete AI one if you want different structure

## Best Practices

### Naming Conventions

Good template names:
- ✅ "Push Day A" / "Push Day B"
- ✅ "Upper Power"
- ✅ "30-Min Full Body"
- ✅ "Leg Day - Quad Focus"

Poor template names:
- ❌ "Workout 1"
- ❌ "Test"
- ❌ "asdf"

### Template Organization

Suggested structure:
1. **Main Split Templates** - Your core routine (push/pull/legs, upper/lower, etc.)
2. **Specialized Templates** - Weak point focus, deload weeks
3. **Time-Based Templates** - Quick sessions, extended sessions
4. **Location Templates** - Home, gym, travel

### Update Frequency

- **Re-save popular templates** every 4-6 weeks to update baseline weights
- **Delete outdated templates** if your training style changed
- **Use AI generation** quarterly to discover new patterns

### Template Limits

- No hard limit on template count
- Stored in browser localStorage:
  - ~5-10MB available
  - Each template ≈ 2-5KB
  - Supports **hundreds** of templates
- Keep it reasonable (20-50 templates is plenty)

## Troubleshooting

### Template Not Showing After Save

**Symptoms**: Save successful message, but template missing from list

**Solutions**:
1. Check debug panel (development mode) for template count
2. Click "🔄 Force Refresh Templates" button
3. Click "🔍 Inspect localStorage" to verify save
4. Check browser console for errors
5. Hard refresh page (Ctrl+Shift+R)

### Progressive Overload Not Working

**Symptoms**: Template loads with original weights, not last performance

**Cause**: No matching exercise in workout history

**Solution**:
- Ensure exercise names match exactly
- Complete at least one workout with that exercise
- Check spelling/capitalization

### AI Generation Fails

**Possible Causes**:
- Less than 3 workouts completed
- Backend/API connection issue
- LитeLLM rate limit

**Solutions**:
1. Check backend running: `curl http://localhost:3001/health`
2. Check browser console for errors
3. Verify API key in backend/.env
4. Try again in a few minutes

## Template Data Structure

For developers:

```javascript
{
  id: "template_1707762000000",
  name: "Push Day A",
  description: "Chest and tricep focus",
  createdAt: "2026-02-12T10:00:00Z",
  lastUsed: "2026-02-13T14:30:00Z",
  timesUsed: 5,
  type: "strength",
  tags: ["push", "upper", "chest"],
  exercises: [
    {
      name: "Barbell Bench Press",
      muscleGroup: "Chest",
      sets: [
        {
          targetWeight: 185,
          targetReps: 8,
          weight: 0,
          reps: 0,
          completed: false
        }
      ]
    }
  ]
}
```

Storage location: `localStorage.workoutTemplates[userId]`

---

**Related Pages**:
- [Workout Generation](Workout-Generation) - How AI creates workouts
- [Exercise Tracking](Exercise-Tracking) - Using templates in workouts
- [Storage System](Storage-System) - Where templates are saved
- [Progressive Overload](Progressive-Overload) - Auto-fill mechanics

**Next**: [AI Coach Personalities](AI-Coach) →
