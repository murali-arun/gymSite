# 🏗️ Component Structure Visualization

## Directory Tree

```
src/components/
│
├── 🧱 atoms/                    (Basic UI primitives)
│   ├── Badge.jsx                → Status indicators
│   ├── Button.jsx               → Interactive buttons
│   ├── Card.jsx                 → Container components
│   ├── Input.jsx                → Form inputs (Input, TextArea, Select)
│   ├── Label.jsx                → Form labels
│   └── index.js                 → Barrel exports
│
├── 🔗 molecules/                (Simple compositions)
│   ├── EmptyState.jsx           → Empty state placeholder
│   ├── FormField.jsx            → Label + Input combination
│   ├── WorkoutCard.jsx          → Workout summary card
│   └── index.js                 → Barrel exports
│
├── 🎯 organisms/                (Complex components - currently empty)
│   └── (Reserved for future complex components)
│
└── 📦 features/                 (Domain-specific modules)
    │
    ├── 👤 user/
    │   ├── UserSelection.jsx    → User login/creation screen
    │   ├── ProfileFormBuilder.jsx → User profile form
    │   └── index.js
    │
    ├── 💪 workout/
    │   ├── WorkoutGenerator.jsx → AI workout generation
    │   ├── ExerciseTracker.jsx  → Live workout tracking
    │   ├── ManualWorkoutLog.jsx → External workout logging
    │   ├── History.jsx          → Workout history viewer
    │   └── index.js
    │
    ├── 📊 progress/
    │   ├── Progress.jsx         → Exercise progress charts
    │   ├── ProgressDashboard.jsx → Analytics dashboard
    │   ├── Achievements.jsx     → Achievement badges
    │   └── index.js
    │
    └── 🎯 coach/
        ├── CoachAvatar.jsx      → Animated motivational avatar
        ├── CoachSelector.jsx    → Coach personality selector
        └── index.js
```

## Component Count

| Category | Count | Purpose |
|----------|-------|---------|
| **Atoms** | 5 components | Reusable UI primitives |
| **Molecules** | 3 components | Simple compositions |
| **Organisms** | 0 components | Reserved for complex UI |
| **Features** | 11 components | Domain-specific logic |
| **Total** | **19 components** | |

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                              │
│                     (Main Application)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┬─────────────┬──────────────┐
           │                       │             │              │
       ┌───▼───┐              ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
       │ User  │              │ Workout │   │Progress │   │  Coach  │
       │Feature│              │ Feature │   │ Feature │   │ Feature │
       └───┬───┘              └────┬────┘   └────┬────┘   └────┬────┘
           │                       │             │              │
    ┌──────┴──────┐         ┌──────┴──────┐     │         ┌────┴────┐
    │             │         │      │      │     │         │         │
┌───▼──┐    ┌────▼───┐  ┌──▼──┐ ┌─▼──┐ ┌─▼──┐ │    ┌────▼───┐ ┌──▼──┐
│User  │    │Profile │  │Gen  │ │Track│ │Log │ │    │Avatar  │ │Sel  │
│Select│    │Builder │  │     │ │     │ │    │ │    │        │ │     │
└──────┘    └────────┘  └─────┘ └─────┘ └────┘ │    └────────┘ └─────┘
                                                │
                                         ┌──────┴───────┐
                                         │              │
                                    ┌────▼────┐    ┌────▼────┐
                                    │Progress │    │Achieve  │
                                    │Dashboard│    │ments    │
                                    └─────────┘    └─────────┘
                   
                   ▲ All features use ▲
                   │                  │
    ┌──────────────┴───────┬──────────┴─────────┐
    │                      │                     │
┌───▼───┐            ┌─────▼─────┐         ┌────▼────┐
│ Atoms │            │ Molecules │         │Contexts │
│       │            │           │         │Services │
│       │            │           │         │ Utils   │
└───────┘            └───────────┘         └─────────┘
```

## Import Flow

```
Feature Components
       ↓
Import from Molecules (FormField, WorkoutCard, etc.)
       ↓
Import from Atoms (Button, Input, Card, Badge, Label)
       ↓
Styled with Tailwind CSS
```

## File Locations Quick Reference

### Need a button?
→ `src/components/atoms/Button.jsx`

### Need a form input with label?
→ `src/components/molecules/FormField.jsx`

### Working on workout features?
→ `src/components/features/workout/`

### Working on user management?
→ `src/components/features/user/`

### Working on progress tracking?
→ `src/components/features/progress/`

### Working on coach AI?
→ `src/components/features/coach/`

## Benefits of This Structure

✅ **Clear Separation of Concerns**
- UI primitives (atoms) separated from business logic (features)

✅ **Easy to Navigate**
- Similar components grouped together
- Feature-based organization

✅ **Scalable**
- Add new features without cluttering existing code
- Reusable atoms reduce duplication

✅ **Maintainable**
- Changes to atoms automatically propagate
- Features are self-contained

✅ **Onboarding Friendly**
- New developers can quickly understand structure
- Clear naming conventions
