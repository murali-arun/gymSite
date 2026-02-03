# Component Architecture

This project follows **Atomic Design** principles for component organization, making the codebase scalable, maintainable, and easy to understand.

## 📁 Folder Structure

```
src/
├── components/
│   ├── atoms/           # Basic building blocks
│   ├── molecules/       # Simple component compositions
│   ├── organisms/       # Complex UI components
│   └── features/        # Feature-based modules
│       ├── user/        # User management
│       ├── workout/     # Workout generation & tracking
│       ├── progress/    # Progress tracking & analytics
│       └── coach/       # AI coach features
├── contexts/            # React Context providers
├── services/            # API & external services
└── utils/               # Utility functions & helpers
```

## 🧬 Atomic Design Pattern

### Atoms (`components/atoms/`)
The smallest, most basic UI elements. These are reusable primitives.

- **`Button.jsx`** - Buttons with variants (primary, secondary, danger, ghost, gradient)
- **`Badge.jsx`** - Status badges (success, info, warning, manual)
- **`Input.jsx`** - Form inputs (Input, TextArea, Select)
- **`Card.jsx`** - Card containers (Card, CardHeader, CardContent)
- **`Label.jsx`** - Form labels

**Usage:**
```jsx
import { Button, Badge, Input } from '@/components/atoms';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

### Molecules (`components/molecules/`)
Simple combinations of atoms that form functional units.

- **`FormField.jsx`** - Label + Input combination
- **`WorkoutCard.jsx`** - Workout summary card
- **`EmptyState.jsx`** - Empty state placeholder

**Usage:**
```jsx
import { FormField, EmptyState } from '@/components/molecules';

<FormField 
  label="Exercise Name" 
  value={name} 
  onChange={setName}
  required
/>
```

### Organisms (`components/organisms/`)
Complex components built from molecules and atoms. These are substantial UI sections.

_Currently unused - complex components are in features/_

### Features (`components/features/`)
Feature-specific components organized by domain. Each feature is self-contained.

#### **👤 User** (`features/user/`)
- `UserSelection.jsx` - User selection screen
- `ProfileFormBuilder.jsx` - User profile creation

#### **💪 Workout** (`features/workout/`)
- `WorkoutGenerator.jsx` - AI workout generation
- `ExerciseTracker.jsx` - Live workout tracking
- `ManualWorkoutLog.jsx` - Manual workout logging
- `History.jsx` - Workout history view

#### **📊 Progress** (`features/progress/`)
- `Progress.jsx` - Progress overview
- `ProgressDashboard.jsx` - Analytics dashboard
- `Achievements.jsx` - Achievement badges

#### **🎯 Coach** (`features/coach/`)
- `CoachAvatar.jsx` - Animated coach avatar
- `CoachSelector.jsx` - Coach personality selector

**Usage:**
```jsx
import { WorkoutGenerator, History } from '@/components/features/workout';
import { CoachAvatar } from '@/components/features/coach';
```

## 📋 Best Practices

### When to Create Components

1. **Atoms**: Create when you have a reusable UI primitive
   - Example: Custom button, input field, badge

2. **Molecules**: Create when combining 2-3 atoms into a functional unit
   - Example: FormField (Label + Input), SearchBar (Input + Button)

3. **Features**: Create for domain-specific logic and UI
   - Example: Workout generation, user management

### Component Guidelines

✅ **DO:**
- Keep components focused and single-purpose
- Use descriptive, action-oriented names
- Export components via index files
- Document props with comments

❌ **DON'T:**
- Mix concerns (UI vs logic)
- Create deep nesting (>3 levels)
- Hard-code values (use props)
- Duplicate code (extract reusable atoms)

### Import Patterns

**Preferred (Barrel Exports):**
```jsx
import { Button, Input, Card } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import { WorkoutGenerator } from '@/components/features/workout';
```

**Avoid (Direct Paths):**
```jsx
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
```

## 🔄 Adding New Components

### Adding an Atom

1. Create `src/components/atoms/MyAtom.jsx`
2. Export in `src/components/atoms/index.js`
3. Document props and usage

### Adding a Feature

1. Create feature folder: `src/components/features/my-feature/`
2. Add components: `MyFeature.jsx`
3. Create index: `src/components/features/my-feature/index.js`
4. Export components

## 🏗️ Migration Status

✅ Completed:
- Atomic design structure created
- Components reorganized by feature
- Barrel exports configured
- App.jsx imports updated

## 📚 Related Documentation

- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
- [React Component Patterns](https://reactpatterns.com/)
