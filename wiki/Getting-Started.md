# 🚀 Getting Started

Welcome to AI Gym Tracker! This guide will help you set up the project and start tracking your workouts.

## Prerequisites

Before you begin, make sure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **LiteLLM API Key** (for AI features) - [Get one here](https://litellm.ai/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/murali-arun/base-template-site.git gymSite
cd gymSite
```

### 2. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
LITELLM_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=development
```

### 4. Start the Development Servers

#### Option A: Using Docker (Recommended)

```bash
# Start all services
docker-compose up

# The app will be available at:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3001
```

#### Option B: Manual Start

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
npm run dev
```

## First Run

1. **Open the app**: Navigate to `http://localhost:5173`

2. **Create your profile**:
   - Enter your name, age, weight
   - Select experience level (beginner/intermediate/advanced)
   - Choose fitness goals
   - Set workout frequency

3. **Choose an AI Coach**:
   - **Iron** 💪 - Tough, no-nonsense motivation
   - **Zen** 🧘 - Calm, mindful guidance
   - **Blaze** 🔥 - High energy, enthusiastic
   - **Sage** 🦉 - Wise, scientific approach

4. **Generate your first workout**:
   - Click "Generate Workout"
   - AI creates a personalized routine based on your profile
   - Start tracking!

## Project Structure

```
gymSite/
├── src/
│   ├── components/
│   │   ├── atoms/          # Reusable UI components
│   │   ├── molecules/      # Composed components
│   │   ├── features/       # Domain-specific features
│   │   └── organisms/      # Complex UI compositions
│   ├── services/           # API integrations
│   ├── utils/              # Helper functions
│   ├── contexts/           # React contexts
│   └── config/             # Configuration files
├── backend/                # Express API server
│   ├── server.js           # Main server file
│   └── data/               # User data storage
└── docs/                   # Documentation
```

## Available Scripts

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend

```bash
npm start            # Start backend server
npm run dev          # Start with nodemon (auto-reload)
```

### Docker

```bash
docker-compose up              # Start all services
docker-compose up -d           # Start in detached mode
docker-compose down            # Stop all services
docker-compose logs -f         # View logs
```

## Quick Configuration

### Changing AI Model

Edit `backend/server.js`:

```javascript
// Default: claude-sonnet-4.5
const model = 'claude-sonnet-4.5';

// Or use other models:
// const model = 'gpt-4';
// const model = 'claude-3-opus';
```

### Adjusting Storage

By default, data is stored in:
- **User data**: `backend/data/users.json`
- **Workouts**: Browser localStorage
- **Templates**: Browser localStorage

See [Storage System](Storage-System) for details.

## Troubleshooting

### Port Already in Use

```bash
# Stop conflicting processes
./stop-port-conflicts.sh

# Or manually change ports in:
# - vite.config.js (frontend)
# - backend/server.js (backend)
```

### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

### Backend Connection Issues

```bash
# Check backend is running
curl http://localhost:3001/health

# Check environment variables
cd backend
cat .env

# Restart backend
npm start
```

## Next Steps

- 📖 Read the [Quick Start Guide](Quick-Start-Guide) for a walkthrough
- 💪 Complete your [First Workout](First-Workout)
- 🏗️ Understand the [Architecture](Architecture)
- 🎨 Explore the [Design System](Design-System)

## Need Help?

- Check [Common Issues](Common-Issues)
- Review [API Reference](API-Reference)
- See [Development Guide](Development-Guide)
- Open an issue on GitHub

---

**Next**: [Quick Start Guide](Quick-Start-Guide) →
