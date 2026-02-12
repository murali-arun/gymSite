# 📡 API Reference

Complete reference for AI Gym Tracker's backend API and frontend service layer.

## Base URL

```
Development:  http://localhost:3002
Production:   https://gym.yoursite.com/api
```

## Backend Endpoints

### Health Check

**`GET /health`**

Check if backend server is running.

**Request**: None

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:3002/health
```

---

### LiteLLM Proxy

**`POST /api/litellm`**

Proxy requests to LiteLLM for AI workout generation and feedback.

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```javascript
{
  "messages": [
    {
      "role": "system",
      "content": "You are a fitness coach..."
    },
    {
      "role": "user",
      "content": "Generate a workout for..."
    }
  ],
  "taskType": "workout-generation" | "feedback" | "template-generation"
}
```

**Response**:
```json
{
  "choices": [
    {
      "message": {
        "content": "{\"exercises\": [...], \"summary\": \"...\"}",
        "role": "assistant"
      }
    }
  ]
}
```

**Example**:
```bash
curl -X POST http://localhost:3002/api/litellm \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a fitness coach"},
      {"role": "user", "content": "Generate a push workout"}
    ],
    "taskType": "workout-generation"
  }'
```

---

### Get User

**`GET /api/users/:id`**

Retrieve user profile and workout history.

**Parameters**:
- `id` (string) - User ID

**Response**:
```json
{
  "id": "user_123",
  "name": "John Doe",
  "age": 25,
  "weight": 180,
  "experience": "intermediate",
  "goals": ["Build muscle", "Strength gains"],
  "workoutsPerWeek": 4,
  "workouts": [...],
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:3002/api/users/user_123
```

---

### Update User

**`POST /api/users/:id`**

Update user profile and save workout data.

**Parameters**:
- `id` (string) - User ID

**Request Body**:
```json
{
  "name": "John Doe",
  "weight": 185,
  "workouts": [...]
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    ...
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3002/api/users/user_123 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "weight": 185}'
```

---

## Frontend API Service

**File**: `src/services/api.js`

### callLiteLLM()

Generic LLM request function.

**Function Signature**:
```javascript
async function callLiteLLM(messages, taskType = 'general')
```

**Parameters**:
- `messages` (array) - OpenAI-style message array
- `taskType` (string) - Task identifier: `'workout-generation'` | `'feedback'` | `'template-generation'` | `'general'`

**Returns**: `Promise<object>` - Parsed AI response

**Example**:
```javascript
import { callLiteLLM } from '@/services/api';

const messages = [
  { role: 'system', content: 'You are a fitness coach' },
  { role: 'user', content: 'Create a leg workout' }
];

const response = await callLiteLLM(messages, 'workout-generation');
console.log(response); // { exercises: [...], summary: "..." }
```

**Internal Flow**:
```
1. Fetch POST to /api/litellm
2. Send messages + taskType
3. Receive AI response
4. Clean response (remove markdown)
5. Parse JSON
6. Return parsed object
```

---

### generateWorkout()

Generate a personalized AI workout.

**Function Signature**:
```javascript
async function generateWorkout(user)
```

**Parameters**:
- `user` (object) - User profile with:
  - `name`, `age`, `weight`, `experience`
  - `goals`, `workoutsPerWeek`
  - `workouts` (history)
  - `coach` (optional) - AI coach personality

**Returns**:
```javascript
{
  id: "workout_1707762000000",
  date: "2026-02-12",
  type: "strength",
  exercises: [
    {
      name: "Barbell Bench Press",
      muscleGroup: "Chest",
      metric: "reps",
      sets: [
        { targetReps: 8, targetWeight: 135, reps: 0, weight: 0, completed: false },
        { targetReps: 8, targetWeight: 135, reps: 0, weight: 0, completed: false },
        { targetReps: 8, targetWeight: 135, reps: 0, weight: 0, completed: false }
      ]
    },
    ...
  ],
  aiSuggestion: "Focus on chest and triceps today...",
  generatedAt: "2026-02-12T10:00:00.000Z"
}
```

**Example**:
```javascript
import { generateWorkout } from '@/services/api';

const user = {
  name: "John",
  age: 25,
  experience: "intermediate",
  goals: ["Build muscle"],
  workoutsPerWeek: 4,
  workouts: [...],
  coach: { id: "iron", name: "Iron", ... }
};

const workout = await generateWorkout(user);
```

**AI Prompt Structure**:
```javascript
System Message:
- Exercise variety principle (10+ years trainer experience)
- Progressive overload guidance
- Safety considerations (age-appropriate)
- Coach personality injection (if selected)

User Message:
- User profile (age, weight, experience, goals)
- Last 5 workouts for context
- Workout frequency

Output Format:
- JSON structure with exercises, sets, reps, weights
- AI coaching summary
```

---

### getFeedback()

Get post-workout AI feedback and analysis.

**Function Signature**:
```javascript
async function getFeedback(workout, user)
```

**Parameters**:
- `workout` (object) - Completed workout with actual performance
- `user` (object) - User profile

**Returns**:
```javascript
{
  feedback: "Great job! You increased weight on bench press...",
  highlights: [
    "🏆 New PR: Bench Press 185lbs x 8 reps",
    "💪 Total volume: 12,450 lbs",
    "⏱️ Completed in 52 minutes"
  ],
  suggestions: [
    "Consider adding isolation tricep work",
    "Good recovery on chest - ready for next push day"
  ]
}
```

**Example**:
```javascript
import { getFeedback } from '@/services/api';

const feedback = await getFeedback(completedWorkout, user);
console.log(feedback.highlights); // ["🏆 New PR...", ...]
```

---

### generateTemplatesFromHistory()

AI analyzes workout history and creates templates.

**Function Signature**:
```javascript
async function generateTemplatesFromHistory(user)
```

**Parameters**:
- `user` (object) - User with `workouts` array (min 3 workouts)

**Returns**:
```javascript
[
  {
    name: "Push Power",
    description: "Chest and tricep focused workout",
    tags: ["push", "upper", "strength"],
    exercises: [...]
  },
  {
    name: "Pull Strength",
    description: "Back and bicep routine",
    tags: ["pull", "upper", "back"],
    exercises: [...]
  }
]
```

**Example**:
```javascript
import { generateTemplatesFromHistory } from '@/services/api';

const templates = await generateTemplatesFromHistory(user);
// Returns 2-4 templates based on patterns
```

**AI Analysis**:
1. Analyzes last 20 workouts
2. Identifies common exercise combinations
3. Detects muscle group splits
4. Creates 2-4 complementary templates
5. Assigns appropriate tags

---

## Utility Functions

### Storage (`utils/storage.js`)

**File**: `src/utils/storage.js`

#### loadUsers()
```javascript
function loadUsers()
// Returns: array of all users from localStorage
```

#### saveUser()
```javascript
function saveUser(user)
// Saves user to localStorage.users array
```

#### loadUser()
```javascript
function loadUser(userId)
// Returns: user object or null
```

---

### Workout History (`utils/workoutHistory.js`)

**File**: `src/utils/workoutHistory.js`

#### saveWorkoutToHistory()
```javascript
function saveWorkoutToHistory(userId, workout)
// Saves workout with metadata for smart selection
```

#### getWorkoutHistory()
```javascript
function getWorkoutHistory(userId)
// Returns: array of workouts with metadata
```

#### calculateWorkoutMetadata()
```javascript
function calculateWorkoutMetadata(workout)
// Returns: { muscleGroups, totalSets, intensity, duration, equipment }
```

---

### Workout Templates (`utils/workoutTemplates.js`)

**File**: `src/utils/workoutTemplates.js`

#### getTemplates()
```javascript
function getTemplates(userId)
// Returns: array of saved templates
```

#### saveAsTemplate()
```javascript
function saveAsTemplate(userId, workout, name, description, tags)
// Saves workout as reusable template
// Returns: template object
```

#### loadTemplate()
```javascript
function loadTemplate(userId, templateId, workouts)
// Loads template with progressive overload (auto-fills last weights)
// Returns: workout ready to start
```

#### deleteTemplate()
```javascript
function deleteTemplate(userId, templateId)
// Removes template from storage
```

#### getSuggestedTags()
```javascript
function getSuggestedTags()
// Returns: array of common tag suggestions
```

---

### Smart Workout Selection (`utils/workoutSelector.js`)

**File**: `src/utils/workoutSelector.js`

#### selectBestWorkout()
```javascript
function selectBestWorkout(workouts, recentWorkouts)
// Analyzes workout history and scores each workout
// Returns: { workout, score, reasoning }
```

**Scoring Algorithm**:
1. **Recovery Score** (25%) - Muscle group rest
2. **Day Match Score** (15%) - Day-of-week patterns
3. **Effort Balance** (20%) - Intensity distribution
4. **Variety Score** (20%) - Avoid recent repeats
5. **Effectiveness** (20%) - Past completion + ratings

---

## Error Handling

All API functions throw errors that should be caught:

```javascript
try {
  const workout = await generateWorkout(user);
} catch (error) {
  console.error('Failed to generate workout:', error);
  // Show user-friendly message
  alert('Could not generate workout. Please try again.');
}
```

**Common Errors**:

| Error | Cause | Solution |
|-------|-------|----------|
| `Network request failed` | Backend offline | Check backend running |
| `Failed to parse response` | Invalid JSON from AI | Retry request |
| `API key invalid` | Wrong LiteLLM key | Check backend/.env |
| `Rate limit exceeded` | Too many requests | Wait and retry |
| `User not found` | Invalid user ID | Check user exists |

---

## Rate Limiting

**LiteLLM**: Limited by your API plan
- Free tier: ~100 requests/day
- Paid: Depends on plan

**Backend**: No default rate limiting (add if needed)

**Recommendation**: Implement rate limiting for production

```javascript
// In backend/server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requests per window
});

app.use('/api/', limiter);
```

---

## CORS Configuration

**File**: `backend/server.js`

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',      // Vite dev
    'http://localhost:3003',      // Docker frontend
    'https://gym.yoursite.com'    // Production
  ],
  credentials: true
}));
```

Add your production domains before deploying!

---

## Authentication

Currently **no authentication** - all data stored locally.

**For multi-user production**:
1. Add JWT authentication
2. Require `Authorization: Bearer <token>` header
3. Validate tokens in middleware
4. Store users in database (not users.json)

**Example Enhancement**:
```javascript
// Backend middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/api/users/:id', authenticateToken, (req, res) => {
  // Protected route
});
```

---

## WebSocket (Future)

Not currently implemented. Could add for:
- Real-time coach messaging during workouts
- Live workout sharing
- Multi-user competition

**Example Setup**:
```javascript
// Backend (socket.io)
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('set-complete', (data) => {
    socket.broadcast.emit('user-progress', data);
  });
});

// Frontend
import io from 'socket.io-client';
const socket = io('http://localhost:3002');

socket.on('user-progress', (data) => {
  console.log('Someone completed a set:', data);
});
```

---

## Testing API

### Using cURL

```bash
# Health check
curl http://localhost:3002/health

# Generate workout
curl -X POST http://localhost:3002/api/litellm \
  -H "Content-Type: application/json" \
  -d @workout-request.json

# Get user
curl http://localhost:3002/api/users/user_123
```

### Using Postman

1. Import as OpenAPI/Swagger (create spec from this doc)
2. Set base URL: `http://localhost:3002`
3. Create requests for each endpoint
4. Save as collection for team use

### Using JavaScript (Browser Console)

```javascript
// Test on live site
fetch('http://localhost:3002/health')
  .then(r => r.json())
  .then(console.log);

// Test workout generation
const user = { name: "Test", age: 25, /* ... */ };
fetch('http://localhost:3002/api/litellm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: 'You are a coach' },
      { role: 'user', content: JSON.stringify(user) }
    ],
    taskType: 'workout-generation'
  })
})
.then(r => r.json())
.then(console.log);
```

---

**Related Pages**:
- [Architecture](Architecture) - System design
- [Storage System](Storage-System) - Data persistence
- [Deployment](Deployment) - Production setup
- [Development Guide](Development-Guide) - Contributing

**Next**: [Storage System](Storage-System) →
