# 🚀 Quick Start Guide for Developers

## Project Structure at a Glance

```
src/
├── components/
│   ├── atoms/          → Buttons, Inputs, Cards, Badges, Labels
│   ├── molecules/      → FormField, WorkoutCard, EmptyState
│   └── features/       → User, Workout, Progress, Coach modules
├── contexts/           → React Context (CoachContext)
├── services/           → API calls (LLM integration)
└── utils/              → Storage, helpers
```

## Common Tasks

### 1️⃣ Adding a New Button

```jsx
// Import the atom
import { Button } from '@/components/atoms';

// Use it
<Button 
  variant="primary"  // primary | secondary | danger | ghost | gradient
  size="lg"          // sm | md | lg
  onClick={handleClick}
>
  Click Me
</Button>
```

### 2️⃣ Creating a Form

```jsx
// Import form components
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';

// Use them
<form onSubmit={handleSubmit}>
  <FormField 
    label="Name" 
    value={name} 
    onChange={(e) => setName(e.target.value)}
    required
  />
  
  <FormField 
    label="Notes"
    type="textarea"
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />
  
  <Button type="submit" variant="primary">
    Submit
  </Button>
</form>
```

### 3️⃣ Adding a New Feature

```bash
# 1. Create feature folder
mkdir src/components/features/my-feature

# 2. Create component
touch src/components/features/my-feature/MyFeature.jsx

# 3. Create index file
echo "export { default as MyFeature } from './MyFeature';" > src/components/features/my-feature/index.js

# 4. Import in App.jsx
# import { MyFeature } from './components/features/my-feature';
```

### 4️⃣ Using Existing Atoms

```jsx
import { Card, CardHeader, CardContent, Badge, Input } from '@/components/atoms';

<Card>
  <CardHeader>
    <h2>Title <Badge variant="success">New</Badge></h2>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter text..." />
  </CardContent>
</Card>
```

## Design System Reference

### Color Palette
- **Background**: gray-800, gray-700, gray-600
- **Text**: white, gray-300, gray-400
- **Primary**: blue-600, blue-700
- **Success**: green-400, green-900
- **Warning**: yellow-400, yellow-900
- **Danger**: red-600, red-700
- **Special**: purple-600 (coach/manual)

### Spacing Scale
- `gap-3` / `p-3` → 12px
- `gap-4` / `p-4` → 16px
- `gap-6` / `p-6` → 24px
- `gap-8` / `p-8` → 32px

### Border Radius
- `rounded-lg` → 8px (cards, buttons)
- `rounded-xl` → 12px (large buttons)
- `rounded-2xl` → 16px (major containers)

### Shadows
- `shadow-lg` → Regular depth
- `shadow-blue-900/50` → Colored shadow (for primary buttons)

## Component Patterns

### Pattern 1: Feature Component

```jsx
// features/my-feature/MyFeature.jsx
import React, { useState } from 'react';
import { Button, Card } from '../../atoms';
import { FormField } from '../../molecules';

function MyFeature({ user, onComplete }) {
  const [value, setValue] = useState('');

  const handleSubmit = async () => {
    // Business logic here
    onComplete(value);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">My Feature</h2>
      <FormField 
        label="Input" 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
      />
      <Button onClick={handleSubmit}>Submit</Button>
    </Card>
  );
}

export default MyFeature;
```

### Pattern 2: Reusable Atom

```jsx
// atoms/MyAtom.jsx
export function MyAtom({ variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-gray-700',
    special: 'bg-blue-600'
  };
  
  return (
    <div className={`${variants[variant]} p-4 rounded-lg`} {...props}>
      {children}
    </div>
  );
}
```

### Pattern 3: Molecule Composition

```jsx
// molecules/MyMolecule.jsx
import { Label, Input, Button } from '../atoms';

export function MyMolecule({ onSubmit }) {
  const [value, setValue] = useState('');
  
  return (
    <div className="space-y-2">
      <Label>Input Label</Label>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button onClick={() => onSubmit(value)}>Go</Button>
      </div>
    </div>
  );
}
```

## File Naming Conventions

- **Components**: PascalCase (`MyComponent.jsx`)
- **Utils**: camelCase (`myHelper.js`)
- **Index files**: lowercase (`index.js`)
- **Docs**: UPPERCASE (`README.md`)

## Import Order

```jsx
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { AnimatePresence } from 'framer-motion';

// 3. Feature components
import { WorkoutGenerator } from './components/features/workout';

// 4. Shared components
import { Button, Card } from './components/atoms';

// 5. Utils & Services
import { getUser } from './utils/storage';
import { generateWorkout } from './services/api';

// 6. Contexts
import { useCoach } from './contexts/CoachContext';

// 7. Styles (if any)
import './styles.css';
```

## Testing Imports

After restructuring, verify imports work:

```bash
# Check for any import errors
npm run build

# Or start dev server
npm run dev
```

## Need Help?

- See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed structure
- See [COMPONENT_MAP.md](./COMPONENT_MAP.md) for component relationships
- Check existing components for patterns and examples
