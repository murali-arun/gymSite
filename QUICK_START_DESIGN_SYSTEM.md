# 🎨 Design System Quick Start

## What We Did

Converted raw `div` elements to reusable React components with centralized styling.

## Quick Example

### ❌ Before: Raw Divs
```jsx
<div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-white">Choose Your Coach</h2>
    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
      <svg className="w-6 h-6">...</svg>
    </button>
  </div>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Content */}
  </div>
  
  <div className="mt-6 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
    <div className="text-xs text-gray-400 mb-2">💡 Tip</div>
    <div className="text-sm text-gray-300">Info message</div>
  </div>
</div>
```

### ✅ After: Design System
```jsx
import { Modal, ModalHeader, ModalBody, Grid, InfoBox } from '@/components/organisms';

<Modal isOpen={true} onClose={onClose}>
  <ModalHeader title="Choose Your Coach" onClose={onClose} icon="🎯" />
  
  <ModalBody>
    <Grid cols={2}>
      {/* Content */}
    </Grid>
    
    <InfoBox variant="neutral" icon="💡" title="Tip">
      Info message
    </InfoBox>
  </ModalBody>
</Modal>
```

## Core Components

### 1. Layout Components

```jsx
// Page wrapper
<PageContainer size="md" gradient>
  <Section title="Dashboard" description="Your stats" icon="📊">
    <Stack spacing="lg">
      <Container variant="default" padding="md">
        Content here
      </Container>
    </Stack>
  </Section>
</PageContainer>
```

### 2. Form Components

```jsx
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';

<Stack spacing="md">
  <FormField 
    label="Name" 
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
  
  <FormField 
    label="Notes"
    multiline
    rows={4}
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />
  
  <Button variant="primary" fullWidth>
    Submit
  </Button>
</Stack>
```

### 3. Display Components

```jsx
import { StatsGrid, InfoBox } from '@/components/organisms';

<StatsGrid stats={[
  { icon: '💪', value: 42, label: 'Workouts', variant: 'success' },
  { icon: '🔥', value: 7, label: 'Streak', variant: 'warning' },
  { icon: '⏱️', value: '45m', label: 'Avg Time', variant: 'info' }
]} />

<InfoBox variant="success" title="Great job!" icon="🎉">
  You completed your workout!
</InfoBox>
```

### 4. Grid & Spacing

```jsx
// 2-column responsive grid
<Grid cols={2} gap="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</Grid>

// Vertical spacing
<Stack spacing="lg">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

## Configuration

All design tokens are in `src/config/designSystem.js`:

```javascript
import { colors, variants, animations } from '@/config/designSystem';

// Use in custom components
<div className={variants.card.default}>
  Content
</div>

// Or use directly
<motion.div {...animations.fadeIn}>
  Animated content
</motion.div>
```

## Component Props Reference

### Button
```jsx
<Button 
  variant="primary | secondary | danger | success | ghost | outline"
  size="sm | md | lg"
  fullWidth={true}
  disabled={false}
>
  Text
</Button>
```

### Container
```jsx
<Container 
  variant="default | elevated | flat | glass"
  padding="none | sm | md | lg | xl"
  clickable={false}
>
  Content
</Container>
```

### Modal
```jsx
<Modal 
  isOpen={boolean}
  onClose={function}
  size="sm | md | lg | xl | full"
  variant="default | dark"
  closeOnOverlayClick={true}
>
  <ModalHeader title="..." onClose={...} icon="..." />
  <ModalBody>...</ModalBody>
  <ModalFooter>...</ModalFooter>
</Modal>
```

### Grid
```jsx
<Grid 
  cols={1 | 2 | 3 | 4}
  gap="sm | md | lg | xl"
>
  Items
</Grid>
```

### InfoBox
```jsx
<InfoBox 
  variant="success | info | warning | error | neutral"
  title="Title"
  icon="🎯"
>
  Message
</InfoBox>
```

## Migration Pattern

1. **Identify repeated patterns** in your component
2. **Replace with design system component**
3. **Use props instead of className**
4. **Verify in browser**

## Benefits

✅ **50-60% less code**  
✅ **Consistent styling**  
✅ **Easier maintenance**  
✅ **Better readability**  
✅ **Faster development**  
✅ **Type-safe props**

## Files to Reference

- 📖 Full guide: `COMPONENT_DESIGN_SYSTEM.md`
- 📊 Migration summary: `DESIGN_SYSTEM_MIGRATION.md`
- ⚙️ Config: `src/config/designSystem.js`
- 🧩 Components: `src/components/organisms/`

## Import Pattern

```jsx
// Organisms (complex components)
import { Modal, Container, Section, Grid, Stack, InfoBox } from '@/components/organisms';

// Molecules (composites)
import { FormField, WorkoutCard } from '@/components/molecules';

// Atoms (basic elements)
import { Button, Input, Badge, Card } from '@/components/atoms';

// Config
import { colors, variants, animations } from '@/config/designSystem';
```

---

**Next**: Migrate remaining components using the same pattern! 🚀
