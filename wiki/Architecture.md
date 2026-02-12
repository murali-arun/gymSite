# 🏗️ Architecture Overview

This project follows **Atomic Design** principles combined with feature-based organization for maximum scalability and maintainability.

## System Architecture

```
┌─────────────────────────────────────────────────┐
│              User Interface (React)              │
│  ┌────────────┬─────────────┬─────────────────┐ │
│  │   Atoms    │  Molecules  │    Features     │ │
│  │  (UI Kit)  │  (Composed) │  (Domain Logic) │ │
│  └────────────┴─────────────┴─────────────────┘ │
└────────────┬──────────────────────────┬─────────┘
             │                          │
             ├──────────┬───────────────┤
             │          │               │
        ┌────▼────┐ ┌──▼────┐    ┌────▼─────┐
        │ Context │ │ Utils │    │ Services │
        ├─────────┤ ├───────┤    ├──────────┤
        │  Coach  │ │Storage│    │ AI API   │
        │  State  │ │History│    │ Backend  │
        └────┬────┘ └───┬───┘    └────┬─────┘
             │          │              │
             └──────────┴──────────────┘
                        │
            ┌───────────▼────────────┐
            │   Persistent Storage   │
            ├────────────────────────┤
            │  localStorage (Client) │
            │  users.json (Backend)  │
            └────────────────────────┘
```

## Directory Structure

```
gymSite/
├── src/                        # Frontend source
│   ├── components/            # React components
│   │   ├── atoms/            # ⚛️ UI primitives
│   │   │   ├── Button.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Label.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── molecules/        # 🧪 Composed components
│   │   │   ├── FormField.jsx
│   │   │   ├── WorkoutCard.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── organisms/        # 🏛️ Complex compositions
│   │   │   ├── Container.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── index.js
│   │   │
│   │   └── features/         # 🎯 Domain modules
│   │       ├── user/
│   │       │   ├── UserSelection.jsx
│   │       │   ├── ProfileFormBuilder.jsx
│   │       │   └── index.js
│   │       │
│   │       ├── workout/
│   │       │   ├── WorkoutGenerator.jsx
│   │       │   ├── ExerciseTracker.jsx
│   │       │   ├── ManualWorkoutLog.jsx
│   │       │   ├── History.jsx
│   │       │   ├── WorkoutTemplates.jsx
│   │       │   └── index.js
│   │       │
│   │       ├── progress/
│   │       │   ├── Progress.jsx
│   │       │   ├── ProgressDashboard.jsx
│   │       │   ├── Achievements.jsx
│   │       │   └── index.js
│   │       │
│   │       └── coach/
│   │           ├── CoachAvatar.jsx
│   │           ├── CoachSelector.jsx
│   │           └── index.js
│   │
│   ├── contexts/             # React Context
│   │   └── CoachContext.jsx
│   │
│   ├── services/             # External APIs
│   │   └── api.js           # LiteLLM integration
│   │
│   ├── utils/                # Helper functions
│   │   ├── storage.js       # localStorage wrapper
│   │   ├── workoutHistory.js # Workout storage
│   │   ├── workoutSelector.js # Smart selection
│   │   ├── workoutTemplates.js # Template CRUD
│   │   └── workoutPlanCache.js # Plan caching
│   │
│   ├── config/              # Configuration
│   │   └── designSystem.js  # Design tokens
│   │
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── style.css            # Global styles
│
├── backend/                 # Express API
│   ├── server.js           # API server
│   ├── data/
│   │   └── users.json      # User database
│   ├── package.json
│   └── Dockerfile
│
├── docs/                    # Documentation
│   └── diagrams/           # Flow diagrams
│
├── public/                  # Static assets
├── dist/                    # Build output
│
├── docker-compose.yml       # Docker orchestration
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── package.json            # Dependencies
```

## Component Hierarchy

### Atomic Design Layers

#### **Level 1: Atoms** ⚛️
Single-purpose UI primitives with no dependencies.

**Characteristics**:
- No state management (except internal UI state)
- Highly reusable across features
- Design system aligned
- 5 variants/sizes maximum

**Examples**:
```jsx
<Button variant="primary" size="lg" />
<Badge variant="success">New</Badge>
<Input placeholder="Enter text" />
```

#### **Level 2: Molecules** 🧪
Combinations of 2-3 atoms forming functional units.

**Characteristics**:
- Minimal business logic
- Reusable patterns
- Composed from atoms only

**Examples**:
```jsx
<FormField label="Name" value={name} onChange={setName} />
<WorkoutCard workout={workout} onExpand={handleExpand} />
```

#### **Level 3: Organisms** 🏛️
Complex UI sections with substantial functionality.

**Characteristics**:
- Can contain atoms, molecules, other organisms
- May have local state
- Still reusable across features

**Examples**:
```jsx
<Modal title="Save Template" onClose={handleClose} />
<StatCard title="Volume" value="12,450 lbs" trend="+5%" />
```

#### **Level 4: Features** 🎯
Domain-specific components with business logic.

**Characteristics**:
- Feature-complete modules
- May use contexts and services
- Not necessarily reusable
- Organized by domain (user, workout, progress, coach)

**Examples**:
```jsx
<WorkoutGenerator user={user} onGenerate={handleGenerate} />
<ExerciseTracker workout={workout} onComplete={handleComplete} />
```

## Data Flow

### User Authentication Flow

```
UserSelection Component
  ↓ (select user)
Storage.loadUser(userId)
  ↓
localStorage.getItem('users')
  ↓
Parse user data
  ↓
Set user state in App.jsx
  ↓
Render main dashboard
```

### Workout Generation Flow

```
WorkoutGenerator
  ↓ (click generate)
callLiteLLM(profile, history)
  ↓ (HTTP POST)
Backend Express Server
  ↓
LiteLLM API (Claude Sonnet 4.5)
  ↓ (AI response)
Parse exercises + sets
  ↓
Save to workoutHistory
  ↓
Display in ExerciseTracker
```

### Exercise Tracking Flow

```
ExerciseTracker loads workout
  ↓
User logs set (weight, reps)
  ↓
Mark set as complete
  ↓
Auto-save timer (30s)
  ↓
Update localStorage
  ↓
Rest timer starts
  ↓
Check for PR
  ↓ (if PR detected)
Confetti celebration
  ↓
Coach motivational message
```

## State Management

### Global State (Context)

**CoachContext**: AI coach personality
```jsx
const { coach, setCoach, celebrate } = useCoach();
```

### Local State (useState)

Used in individual components:
- Form inputs
- UI toggles
- Temporary data

### Persistent State (localStorage)

Managed via utility functions:
- User profiles: `storage.js`
- Workout history: `workoutHistory.js`
- Templates: `workoutTemplates.js`
- Coach preference: `CoachContext.jsx`

### Server State (Backend)

Express server stores:
- User data: `backend/data/users.json`
- Centralizedacross devices (future)

## API Integration

### LiteLLM Service

**File**: `src/services/api.js`

**Functions**:
- `callLiteLLM(messages, taskType)` - Generic LLM caller
- `generateWorkout(user)` - Workout generation
- `getFeedback(workout, user)` - Post-workout analysis
- `generateTemplatesFromHistory(user)` - AI template creation

**Request Flow**:
```
React Component
  ↓
api.js function
  ↓ (HTTP fetch)
Backend Express /api/litellm
  ↓
LiteLLM Proxy
  ↓
Claude Sonnet 4.5
  ↓
JSON response
  ↓
Parse & return to component
```

### Backend API

**File**: `backend/server.js`

**Endpoints**:
- `POST /api/litellm` - LLM proxy
- `GET /api/users/:id` - Get user data
- `POST /api/users/:id` - Update user data
- `GET /health` - Health check

## Build System

### Vite Configuration

**Hot Module Replacement (HMR)**:
- Instant updates during development
- Preserves component state
- Fast refresh

**Build Optimization**:
- Code splitting
- Tree shaking
- Minification
- Gzip compression

**Output** (`npm run build`):
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # Main bundle
│   ├── react-vendor-[hash].js  # React library
│   ├── animation-vendor-[hash].js  # Framer Motion
│   ├── api-[hash].js        # API utilities
│   └── [component]-[hash].js  # Code-split features
```

### Tailwind CSS

**JIT (Just-In-Time)**:
- Generates only used classes
- Instant build times
- Arbitrary values support

**Purge**:
- Removes unused CSS
- Optimized file size
- Production-ready

## Performance Optimizations

### Frontend

1. **Code Splitting**: Features loaded on-demand
2. **Lazy Loading**: Components rendered only when needed
3. **Memoization**: `React.memo()` for expensive components
4. **LocalStorage**: Offline-first, no network latency
5. **Debouncing**: Auto-save throttled to 30s

### Backend

1. **LLM Caching**: Reuse workouts to avoid API calls
2. **Smart Selection**: Local algorithm, no LLM needed
3. **Compression**: Gzip responses
4. **Connection Pooling**: Efficient resource usage

### Bundle Sizes

```
react-vendor:      134 KB (43 KB gzipped)
animation-vendor:  142 KB (47 KB gzipped)
api:                41 KB (16 KB gzipped)
index:              58 KB (15 KB gzipped)
ExerciseTracker:    36 KB (10 KB gzipped)
WorkoutGenerator:   22 KB ( 7 KB gzipped)
```

## Design Patterns

### Composition over Inheritance

```jsx
// Good: Composition
<Modal>
  <Card>
    <CardHeader>Title</CardHeader>
    <CardContent>Content</CardContent>
  </Card>
</Modal>

// Avoid: Inheritance
class ModalCard extends Modal { ... }
```

### Container/Presenter Pattern

```jsx
// Container (Logic)
const WorkoutGeneratorContainer = () => {
  const [workout, setWorkout] = useState(null);
  const handleGenerate = async () => { /* ... */ };
  
  return <WorkoutGeneratorPresenter 
    workout={workout} 
    onGenerate={handleGenerate} 
  />;
};

// Presenter (UI)
const WorkoutGeneratorPresenter = ({ workout, onGenerate }) => (
  <div>{/* Pure UI */}</div>
);
```

### Custom Hooks

```jsx
// Reusable logic
function useWorkoutHistory(userId) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const data = getWorkoutHistory(userId);
    setHistory(data);
    setLoading(false);
  }, [userId]);
  
  return { history, loading };
}

// Usage
const { history, loading } = useWorkoutHistory(user.id);
```

## Testing Strategy

### Unit Tests
- Utility functions (`storage.js`, `workoutHistory.js`)
- Pure components (atoms, molecules)

### Integration Tests
- Feature components with context
- API service calls
- Storage interactions

### E2E Tests
- Complete user workflows
- Workout generation → tracking → completion
- Template creation and loading

## Error Handling

### Frontend

```jsx
try {
  const result = await api.generateWorkout(user);
  setWorkout(result);
} catch (error) {
  console.error('Workout generation failed:', error);
  alert('Failed to generate workout. Please try again.');
}
```

### Backend

```javascript
app.post('/api/litellm', async (req, res) => {
  try {
    const result = await callLiteLLM(req.body);
    res.json(result);
  } catch (error) {
    console.error('LiteLLM error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Error Boundaries

```jsx
<ErrorBoundary fallback={<ErrorUI />}>
  <App />
</ErrorBoundary>
```

## Security Considerations

1. **API Keys**: Never expose in frontend code (backend only)
2. **Input Validation**: Sanitize user inputs
3. **CORS**: Configured for localhost development
4. **Data Privacy**: User data stored locally, not cloud
5. **Dependency Security**: Regular `npm audit` checks

---

**Related Pages**:
- [Component Map](Component-Map) - Visual component relationships
- [Design System](Design-System) - UI/UX guidelines
- [Development Guide](Development-Guide) - Contributing workflow
- [API Reference](API-Reference) - Backend endpoints

**Next**: [Component Map](Component-Map) →
