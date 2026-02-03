# Component Dependency Map

## Visual Component Hierarchy

```
App.jsx (Root)
│
├── CoachProvider (Context)
│   │
│   ├── 👤 USER FEATURES
│   │   └── UserSelection
│   │       └── ProfileFormBuilder
│   │
│   ├── 💪 WORKOUT FEATURES
│   │   ├── WorkoutGenerator
│   │   │   └── Uses: FormField, Button, Card
│   │   │
│   │   ├── ExerciseTracker
│   │   │   └── Uses: Button, Card, Badge
│   │   │
│   │   ├── ManualWorkoutLog
│   │   │   └── Uses: FormField, Button, Select, Input
│   │   │
│   │   └── History
│   │       └── Uses: WorkoutCard, EmptyState, Badge
│   │
│   ├── 📊 PROGRESS FEATURES
│   │   ├── Progress
│   │   │   └── Uses: Card, Badge
│   │   │
│   │   ├── ProgressDashboard
│   │   │   └── Uses: Card
│   │   │
│   │   └── Achievements
│   │       └── Uses: Card, Badge
│   │
│   └── 🎯 COACH FEATURES
│       ├── CoachAvatar (Always visible)
│       │   └── Uses: framer-motion animations
│       │
│       └── CoachSelector (Modal)
│           └── Uses: Button, Card
│
├── 🧱 SHARED COMPONENTS
│   │
│   ├── Atoms (Building Blocks)
│   │   ├── Button (5 variants)
│   │   ├── Badge (5 variants)
│   │   ├── Input/TextArea/Select
│   │   ├── Card/CardHeader/CardContent
│   │   └── Label
│   │
│   └── Molecules (Compositions)
│       ├── FormField
│       ├── WorkoutCard
│       └── EmptyState
│
└── 🔌 EXTERNAL DEPENDENCIES
    ├── Services (API layer)
    │   ├── generateWorkout()
    │   ├── sendWorkoutFeedback()
    │   └── generateProgressSummary()
    │
    ├── Utils (Storage layer)
    │   ├── User management
    │   ├── Workout storage
    │   └── Conversation history
    │
    └── Contexts
        └── CoachContext (Coach personality state)
```

## Component Responsibilities

### Features

| Feature | Component | Purpose | Key Props |
|---------|-----------|---------|-----------|
| **User** | UserSelection | User login/creation | onUserSelected |
| | ProfileFormBuilder | User profile form | onSubmit |
| **Workout** | WorkoutGenerator | Generate AI workout | user, onWorkoutGenerated |
| | ExerciseTracker | Track live workout | user, workout, onComplete |
| | ManualWorkoutLog | Log external workout | user, onWorkoutLogged |
| | History | View past workouts | user, onRefresh |
| **Progress** | Progress | Exercise progress view | user |
| | ProgressDashboard | Stats dashboard | user |
| | Achievements | Badge collection | user |
| **Coach** | CoachAvatar | Motivational messages | - (uses context) |
| | CoachSelector | Choose coach type | onClose |

### Atoms

| Atom | Variants | Props |
|------|----------|-------|
| Button | primary, secondary, danger, ghost, gradient | onClick, variant, size, disabled |
| Badge | default, success, info, warning, manual | variant, children |
| Input | text, number, date, etc. | value, onChange, placeholder, required |
| Card | - | children, onClick, className |
| Label | - | children, required, htmlFor |

### Molecules

| Molecule | Purpose | Composition |
|----------|---------|-------------|
| FormField | Form input with label | Label + Input/TextArea/Select |
| WorkoutCard | Workout summary card | Badge + formatting logic |
| EmptyState | Empty state placeholder | Icon + Text + styling |

## Data Flow

```
User Action
    ↓
Feature Component
    ↓
Service Layer (API calls)
    ↓
Utils/Storage (Backend sync)
    ↓
State Update
    ↓
Re-render
```

## State Management

- **Local State**: Component-specific (useState)
- **Context State**: CoachContext (coach personality, motivations)
- **Server State**: User data, workouts (via storage utils)

## Styling Pattern

All components use **Tailwind CSS** utility classes:
- Dark theme: gray-800, gray-700, gray-600
- Accent colors: blue-600, purple-600, green-400
- Consistent spacing: p-4, p-6, gap-3, gap-4
- Rounded corners: rounded-lg, rounded-xl, rounded-2xl
