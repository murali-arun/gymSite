# 🎨 Design System Quick Reference

## Component Library

### 🧱 Atoms - Building Blocks

#### Button
```jsx
import { Button } from '@/components/atoms';

<Button variant="primary" size="lg" onClick={fn}>Click</Button>

// Variants: primary | secondary | danger | ghost | gradient
// Sizes: sm | md | lg
```

#### Badge  
```jsx
import { Badge } from '@/components/atoms';

<Badge variant="success">Completed</Badge>

// Variants: default | success | info | warning | manual
```

#### Input Components
```jsx
import { Input, TextArea, Select } from '@/components/atoms';

<Input value={val} onChange={fn} placeholder="..." />
<TextArea rows={3} value={val} onChange={fn} />
<Select value={val} onChange={fn}>
  <option>...</option>
</Select>
```

#### Card
```jsx
import { Card, CardHeader, CardContent } from '@/components/atoms';

<Card>
  <CardHeader>Header</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

#### Label
```jsx
import { Label } from '@/components/atoms';

<Label required htmlFor="input-id">Field Name</Label>
```

---

### 🔗 Molecules - Compositions

#### FormField
```jsx
import { FormField } from '@/components/molecules';

// Text Input
<FormField 
  label="Name" 
  value={name} 
  onChange={e => setName(e.target.value)}
  required
/>

// TextArea
<FormField 
  label="Notes" 
  type="textarea"
  rows={4}
  value={notes} 
  onChange={e => setNotes(e.target.value)}
/>

// Select
<FormField 
  label="Activity"
  type="select"
  value={activity}
  onChange={e => setActivity(e.target.value)}
>
  <option value="">Choose...</option>
  <option value="running">Running</option>
</FormField>
```

#### WorkoutCard
```jsx
import { WorkoutCard } from '@/components/molecules';

<WorkoutCard 
  workout={workoutObject}
  onClick={() => toggle()}
  isExpanded={expanded}
/>
```

#### EmptyState
```jsx
import { EmptyState } from '@/components/molecules';

<EmptyState 
  icon="📊"
  title="No Data Yet"
  description="Get started by creating your first item"
/>
```

---

### 📦 Features - Domain Modules

#### User Management
```jsx
import { UserSelection, ProfileFormBuilder } from '@/components/features/user';
```

#### Workout Features
```jsx
import { 
  WorkoutGenerator,
  ExerciseTracker,
  ManualWorkoutLog,
  History 
} from '@/components/features/workout';
```

#### Progress Features
```jsx
import { 
  Progress,
  ProgressDashboard,
  Achievements 
} from '@/components/features/progress';
```

#### Coach Features
```jsx
import { 
  CoachAvatar,
  CoachSelector 
} from '@/components/features/coach';
```

---

## 🎨 Color Palette

### Backgrounds
```jsx
className="bg-gray-900"     // Darkest (app background)
className="bg-gray-800"     // Dark (cards)
className="bg-gray-700"     // Medium (inputs)
className="bg-gray-600"     // Lighter elements
```

### Text Colors
```jsx
className="text-white"      // Primary text
className="text-gray-300"   // Secondary text
className="text-gray-400"   // Tertiary text
className="text-gray-500"   // Disabled/placeholder
```

### Accent Colors
```jsx
// Primary (Blue)
className="bg-blue-600"     // Buttons, primary actions
className="text-blue-400"   // Links, highlights

// Success (Green)
className="bg-green-900/50" // Badge backgrounds
className="text-green-400"  // Success text

// Warning (Yellow)
className="bg-yellow-900/50"
className="text-yellow-400"

// Danger (Red)
className="bg-red-600"
className="text-red-400"

// Special (Purple)
className="bg-purple-600"   // Coach selector
className="text-purple-400" // Manual log badge
```

---

## 📏 Spacing Scale

```jsx
// Padding
className="p-2"   // 8px
className="p-3"   // 12px
className="p-4"   // 16px
className="p-6"   // 24px
className="p-8"   // 32px
className="p-12"  // 48px

// Gap (Flexbox/Grid)
className="gap-2" // 8px
className="gap-3" // 12px
className="gap-4" // 16px
className="gap-6" // 24px

// Margin
className="mb-2"  // Bottom margin 8px
className="mb-4"  // Bottom margin 16px
className="mt-6"  // Top margin 24px
```

---

## 🔲 Border Radius

```jsx
className="rounded"      // 4px (small elements)
className="rounded-lg"   // 8px (cards, inputs)
className="rounded-xl"   // 12px (buttons)
className="rounded-2xl"  // 16px (major sections)
className="rounded-full" // Circular
```

---

## 🎭 Common Patterns

### Card with Header & Content
```jsx
<Card className="p-6">
  <h2 className="text-2xl font-bold text-white mb-4">Title</h2>
  <p className="text-gray-400">Content goes here</p>
</Card>
```

### Form Section
```jsx
<div className="space-y-4">
  <FormField label="Field 1" value={val1} onChange={set1} />
  <FormField label="Field 2" value={val2} onChange={set2} />
  <Button variant="primary" type="submit">Submit</Button>
</div>
```

### Grid Layout
```jsx
<div className="grid grid-cols-2 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</div>
```

### Flex Layout
```jsx
<div className="flex items-center justify-between gap-4">
  <span>Label</span>
  <Button>Action</Button>
</div>
```

### Badge Collection
```jsx
<div className="flex items-center gap-2">
  <Badge variant="success">Active</Badge>
  <Badge variant="info">New</Badge>
</div>
```

---

## 🚀 Quick Copy-Paste Snippets

### Basic Form
```jsx
<form onSubmit={handleSubmit} className="space-y-6">
  <FormField 
    label="Name" 
    value={name} 
    onChange={e => setName(e.target.value)}
    required
  />
  <FormField 
    label="Email"
    type="email"
    value={email}
    onChange={e => setEmail(e.target.value)}
    required
  />
  <Button type="submit" variant="primary">Submit</Button>
</form>
```

### Modal/Card Container
```jsx
<div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
  <h2 className="text-3xl font-bold text-white mb-2">Title</h2>
  <p className="text-gray-400 mb-6">Description</p>
  {/* Content */}
</div>
```

### Action Row
```jsx
<div className="flex gap-4">
  <Button variant="secondary" onClick={onCancel}>
    Cancel
  </Button>
  <Button variant="primary" onClick={onConfirm}>
    Confirm
  </Button>
</div>
```

---

**Pro Tip**: Use the atoms and molecules! They provide consistent styling and behavior across the app.
