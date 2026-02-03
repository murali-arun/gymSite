# 📚 Documentation Index

Welcome to the AI Gym Tracker documentation! This index will help you find the information you need.

## 🚀 Getting Started

**New to the project?** Start here:

1. **[README.md](./README.md)** - Project overview, setup instructions, and features
2. **[QUICKSTART.md](./QUICKSTART.md)** - Quick reference for common development tasks
3. **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Copy-paste component examples

## 🏗️ Architecture & Structure

**Understanding the codebase:**

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed explanation of Atomic Design pattern
- **[STRUCTURE.md](./STRUCTURE.md)** - Visual directory tree and component hierarchy
- **[COMPONENT_MAP.md](./COMPONENT_MAP.md)** - Component dependencies and data flow
- **[SUMMARY.md](./SUMMARY.md)** - Migration summary and benefits

## 🎯 Feature Documentation

- **[COACH_FEATURES.md](./COACH_FEATURES.md)** - AI coach personalities and features

## 🚢 Deployment

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions and configuration

---

## 📖 Quick Navigation

### I want to...

#### ...understand the project structure
→ Read [STRUCTURE.md](./STRUCTURE.md) for visual diagrams
→ Check [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanation

#### ...add a new button or input
→ See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) → Atoms section
→ Import from `@/components/atoms`

#### ...create a new form
→ Check [QUICKSTART.md](./QUICKSTART.md) → "Creating a Form"
→ Use `FormField` from `@/components/molecules`

#### ...add a new feature
→ Follow [QUICKSTART.md](./QUICKSTART.md) → "Adding a New Feature"
→ Create in `src/components/features/[feature-name]/`

#### ...understand component relationships
→ See [COMPONENT_MAP.md](./COMPONENT_MAP.md) → Visual hierarchy
→ Check dependency tables

#### ...find copy-paste examples
→ Go to [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) → Quick Snippets
→ Or [QUICKSTART.md](./QUICKSTART.md) → Common Tasks

#### ...deploy the app
→ Read [DEPLOYMENT.md](./DEPLOYMENT.md)

#### ...understand the AI coach system
→ Check [COACH_FEATURES.md](./COACH_FEATURES.md)

---

## 📂 File Organization

### Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| README.md | Project overview | Everyone |
| QUICKSTART.md | Quick developer reference | Developers |
| ARCHITECTURE.md | Detailed architecture | Developers, Architects |
| STRUCTURE.md | Visual structure | New developers |
| COMPONENT_MAP.md | Component relationships | Developers |
| DESIGN_SYSTEM.md | Component usage examples | Frontend developers |
| SUMMARY.md | Migration summary | Team leads, Developers |
| COACH_FEATURES.md | AI coach documentation | Product, Developers |
| DEPLOYMENT.md | Deployment guide | DevOps, Developers |

### Code Organization

```
src/
├── components/
│   ├── atoms/          → Basic UI (Button, Input, Card, etc.)
│   ├── molecules/      → Compositions (FormField, WorkoutCard)
│   └── features/       → Domain modules (user, workout, progress, coach)
├── contexts/           → React contexts (CoachContext)
├── services/           → API integrations (LLM calls)
└── utils/              → Helper functions (storage, calculations)
```

---

## 🎓 Learning Path

### For New Developers

**Day 1: Setup & Basics**
1. Read [README.md](./README.md) - Understand what the app does
2. Run the app locally (README setup section)
3. Explore [STRUCTURE.md](./STRUCTURE.md) - See where files are

**Day 2: Component Understanding**
4. Read [QUICKSTART.md](./QUICKSTART.md) - Learn common patterns
5. Review [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - See available components
6. Try modifying a simple component (e.g., Button)

**Day 3: Architecture Deep Dive**
7. Study [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand Atomic Design
8. Explore [COMPONENT_MAP.md](./COMPONENT_MAP.md) - See how pieces connect
9. Trace a user flow through the code

**Day 4: Build Something**
10. Pick a small feature to implement
11. Follow patterns from existing features
12. Reuse atoms and molecules

### For Experienced Developers

**Quick Onboarding (30 min)**
1. Skim [README.md](./README.md) - 5 min
2. Review [STRUCTURE.md](./STRUCTURE.md) - 5 min
3. Check [QUICKSTART.md](./QUICKSTART.md) - 10 min
4. Browse [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - 10 min
5. Start coding! 🚀

---

## 🔍 Search Tips

Looking for something specific?

- **Component usage** → [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **File locations** → [STRUCTURE.md](./STRUCTURE.md)
- **Code patterns** → [QUICKSTART.md](./QUICKSTART.md)
- **Architecture decisions** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Component hierarchy** → [COMPONENT_MAP.md](./COMPONENT_MAP.md)

---

## 📝 Contributing

When adding new documentation:

1. Keep it concise and scannable
2. Use examples and code snippets
3. Update this index if adding new files
4. Cross-reference related docs

When updating code:

1. Follow patterns in [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Use atoms/molecules from [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
3. Update relevant docs if changing structure

---

## 🆘 Need Help?

1. **Check the docs** - Start with this index
2. **Search the codebase** - Look for similar patterns
3. **Read existing code** - Components are well-organized
4. **Ask the team** - We're here to help!

---

**Happy coding! 💪🤖**
