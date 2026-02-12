# 🏋️ AI Gym Tracker Wiki

Welcome to the **AI Gym Tracker** documentation! An intelligent workout tracking application with AI-powered workout generation, real-time exercise tracking, and personalized coaching.

## 🚀 Quick Links

| Category | Pages |
|----------|-------|
| **Getting Started** | [Installation & Setup](Getting-Started) • [Quick Start Guide](Quick-Start-Guide) |
| **Features** | [Workout Generation](Workout-Generation) • [Exercise Tracking](Exercise-Tracking) • [Template System](Template-System) • [Progress Analytics](Progress-Analytics) • [AI Coach](AI-Coach) |
| **Development** | [Architecture](Architecture) • [Component Map](Component-Map) • [Development Guide](Development-Guide) • [Design System](Design-System) |
| **Deployment** | [Deployment Guide](Deployment) • [Docker Setup](Docker-Setup) • [Cost Optimization](Cost-Optimization) |
| **Technical** | [API Reference](API-Reference) • [Storage System](Storage-System) • [Performance](Performance-Optimizations) |

## ✨ Key Features

### 🤖 AI-Powered Workouts
- Personalized workout generation based on your history and goals
- Smart exercise selection with variety principles (10+ years trainer experience)
- Progressive overload recommendations
- Four AI coach personalities: Iron, Zen, Blaze, Sage

### 💪 Exercise Tracking
- Real-time set, rep, and weight tracking
- Built-in rest timer with visual feedback
- Auto-save functionality
- Support for multiple metrics (reps, time, distance)
- Bodyweight exercise detection

### 📊 Progress Analytics
- Visual strength gain charts
- Personal records tracking
- Achievement system with badges
- Workout history with detailed logs
- Muscle group volume tracking

### 💾 Template System
- Save workouts as reusable templates
- AI-powered template generation from history
- Progressive overload with last-used weights
- Browse and save from workout history
- Tag-based organization

### 🎨 Modern UI/UX
- Dark theme optimized for gym use
- Responsive design (mobile-first)
- Smooth animations with Framer Motion
- Atomic Design component architecture
- Tailwind CSS styling

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Framer Motion  
- **AI**: LiteLLM (Claude Sonnet 4.5)
- **Storage**: localStorage + Backend API
- **Backend**: Node.js/Express
- **Design**: Atomic Design principles

## 📖 Popular Pages

- **New User?** Start with [Getting Started](Getting-Started)
- **Developer?** Check [Architecture](Architecture) and [Component Map](Component-Map)
- **Deploying?** See [Deployment Guide](Deployment)
- **Contributing?** Read [Development Guide](Development-Guide)

## 🎯 Project Goals

This project demonstrates:
1. **Modern React Architecture** - Atomic Design, feature-based organization
2. **AI Integration** - Real-world LLM application for fitness
3. **Progressive Web App** - Offline-capable, mobile-responsive
4. **Production-Ready** - Error handling, performance optimization, deployment ready

## 📂 Repository Structure

```
gymSite/
├── src/
│   ├── components/
│   │   ├── atoms/          # Reusable UI primitives
│   │   ├── molecules/      # Composed components
│   │   ├── features/       # Domain-specific modules
│   │   └── organisms/      # Complex compositions
│   ├── services/           # API & external services
│   ├── utils/              # Helper functions
│   ├── contexts/           # React contexts
│   └── config/             # Configuration
├── backend/                # Express API server
├── docs/                   # Documentation & diagrams
└── wiki/                   # This wiki (for GitHub)
```

## 🤝 Contributing

Interested in contributing? Check out:
- [Development Guide](Development-Guide) - Setup and workflow
- [Component Map](Component-Map) - Understanding the codebase
- [Design System](Design-System) - UI/UX guidelines

## 📝 Documentation Index

All documentation files are indexed in [DOCS_INDEX.md](https://github.com/murali-arun/base-template-site/blob/main/DOCS_INDEX.md)

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintainer**: [@murali-arun](https://github.com/murali-arun)
