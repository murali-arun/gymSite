# 🎨 Component Design System

## Overview

This project now uses a centralized design system with reusable React components instead of raw div elements with inline Tailwind classes. This provides:

- **Consistency**: All components use the same design tokens
- **Maintainability**: Update styles in one place
- **Reusability**: Build faster with pre-built components
- **Type Safety**: Better prop validation and IntelliSense

## Architecture

```
src/
├── config/
│   └── designSystem.js        # Central design tokens & config
├── components/
│   ├── atoms/                 # Basic building blocks
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   └── Card.jsx
│   ├── molecules/             # Simple composites
│   │   ├── FormField.jsx
│   │   └── WorkoutCard.jsx
│   └── organisms/             # Complex components
│       ├── Modal.jsx
│       ├── Container.jsx
│       └── StatCard.jsx
```

## Design System Configuration

### Location
`src/config/designSystem.js`

### Key Exports

#### Colors
```javascript
import { colors } from '@/config/designSystem';

// Background layers
colors.bg.base         // bg-gray-900
colors.bg.surface      // bg-gray-800/50
colors.bg.input        // bg-gray-700

// Text colors
colors.text.primary    // text-white
colors.text.secondary  // text-gray-300

// State colors
colors.state.success   // { bg, text, border }
colors.state.error
colors.state.warning
colors.state.info
```

#### Variants
```javascript
import { variants } from '@/config/designSystem';

variants.button.primary    // Blue gradient button
variants.button.secondary  // Gray button
variants.button.danger     // Red button

variants.card.default      // Glass card with blur
variants.card.elevated     // Card with shadow

variants.modal.overlay     // Modal backdrop
variants.modal.content     // Modal container

variants.input.default     // Standard input style
variants.infoBox.info      // Info message box
```

#### Animations
```javascript
import { animations } from '@/config/designSystem';

animations.fadeIn      // Fade in/out
animations.scaleIn     // Scale + fade
animations.slideUp     // Slide from bottom
animations.slideDown   // Slide from top
```

## Component Usage

### Organisms

#### Modal
```jsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/organisms';

<Modal isOpen={isOpen} onClose={handleClose} size="md">
  <ModalHeader title="My Modal" onClose={handleClose} icon="🎯" />
  <ModalBody>
    <p>Content goes here</p>
  </ModalBody>
  <ModalFooter>
    <Button onClick={handleClose}>Close</Button>
  </ModalFooter>
</Modal>
```

**Props:**
- `isOpen` (boolean): Controls visibility
- `onClose` (function): Close callback
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `variant`: 'default' | 'dark'
- `closeOnOverlayClick` (boolean): Default true

#### Container
```jsx
import { Container } from '@/components/organisms';

<Container variant="default" padding="lg">
  <h2>Content</h2>
</Container>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'flat' | 'glass'
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `clickable` (boolean): Adds hover effect
- `onClick` (function): Click handler

#### Section
```jsx
import { Section } from '@/components/organisms';

<Section 
  title="My Section" 
  description="Description text"
  icon="🏋️"
  action={<Button>Action</Button>}
>
  <p>Section content</p>
</Section>
```

#### InfoBox
```jsx
import { InfoBox } from '@/components/organisms';

<InfoBox variant="info" title="Tip" icon="💡">
  This is helpful information
</InfoBox>
```

**Variants:** 'success' | 'info' | 'warning' | 'error' | 'neutral'

#### Grid
```jsx
import { Grid } from '@/components/organisms';

<Grid cols={2} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
</Grid>
```

**Props:**
- `cols`: 1 | 2 | 3 | 4
- `gap`: 'sm' | 'md' | 'lg' | 'xl'

#### Stack
```jsx
import { Stack } from '@/components/organisms';

<Stack spacing="lg">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

**Props:**
- `spacing`: 'sm' | 'md' | 'lg' | 'xl'

#### StatCard
```jsx
import { StatCard, StatsGrid } from '@/components/organisms';

<StatCard 
  icon="💪"
  value={42}
  label="Total Workouts"
  variant="success"
  trend="+12%"
/>

// Or multiple stats
<StatsGrid stats={[
  { icon: '💪', value: 42, label: 'Workouts', variant: 'success' },
  { icon: '🔥', value: 7, label: 'Streak', variant: 'warning' }
]} />
```

### Molecules

#### FormField
```jsx
import { FormField } from '@/components/molecules';

<FormField
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter email"
  required
/>

// Multiline
<FormField
  label="Notes"
  multiline
  rows={4}
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>
```

### Atoms

#### Button
```jsx
import { Button } from '@/components/atoms';

<Button 
  variant="primary" 
  size="lg"
  fullWidth
  onClick={handleClick}
  disabled={loading}
>
  Click Me
</Button>
```

**Variants:** 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline' | 'gradient'

**Sizes:** 'sm' | 'md' | 'lg'

#### Input
```jsx
import { Input } from '@/components/atoms';

<Input
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### Badge
```jsx
import { Badge } from '@/components/atoms';

<Badge variant="success">Completed</Badge>
```

**Variants:** 'default' | 'success' | 'info' | 'warning' | 'error' | 'manual'

#### Card
```jsx
import { Card, CardHeader, CardContent } from '@/components/atoms';

<Card onClick={handleClick}>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

## Migration Guide

### Before (Raw Divs)
```jsx
<div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
  <h2 className="text-3xl font-bold text-white mb-2">Title</h2>
  <p className="text-gray-400 mb-6">Description</p>
  
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Name
      </label>
      <input
        type="text"
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white..."
      />
    </div>
  </div>
  
  <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700...">
    Submit
  </button>
</div>
```

### After (Design System)
```jsx
import { Container, Section, Stack } from '@/components/organisms';
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';

<Container variant="default" padding="lg">
  <Section title="Title" description="Description" />
  
  <Stack spacing="md">
    <FormField
      label="Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  </Stack>
  
  <Button variant="primary" fullWidth>
    Submit
  </Button>
</Container>
```

## Benefits

### ✅ Before & After Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Lines of code** | 50+ lines | 20 lines |
| **Consistency** | Manual class management | Centralized variants |
| **Maintainability** | Update everywhere | Update config once |
| **Readability** | Long className strings | Semantic props |
| **Testing** | Complex selectors | Simple component props |

### 🎯 Best Practices

1. **Always use design system components** instead of raw divs
2. **Import from organisms** for complex layouts
3. **Use variants** instead of custom classNames
4. **Extend designSystem.js** for new patterns
5. **Create new components** for repeated patterns

### 🚀 Next Steps

1. Refactor remaining feature components
2. Add more organisms as needed
3. Create theme variants (dark/light mode)
4. Add animation utilities
5. Document component props with TypeScript

## File Structure

```
src/
├── config/
│   └── designSystem.js          # 🎨 Design tokens
├── components/
│   ├── atoms/                   # ⚛️ Basic elements
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   └── Card.jsx
│   ├── molecules/               # 🧬 Composites
│   │   ├── FormField.jsx
│   │   └── WorkoutCard.jsx
│   ├── organisms/               # 🦠 Complex components
│   │   ├── Modal.jsx
│   │   ├── Container.jsx
│   │   └── StatCard.jsx
│   └── features/                # 🎯 Feature components
│       ├── coach/
│       ├── workout/
│       └── progress/
```

## Quick Reference

```jsx
// Import design tokens
import { colors, variants, animations } from '@/config/designSystem';

// Import organisms
import { Modal, Container, Section, InfoBox, Grid, Stack } from '@/components/organisms';

// Import molecules  
import { FormField, WorkoutCard } from '@/components/molecules';

// Import atoms
import { Button, Input, Badge, Card } from '@/components/atoms';
```
