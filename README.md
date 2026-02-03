# AI Gym Tracker 💪🤖

🔗 **Repository**: [github.com/murali-arun/base-template-site](https://github.com/murali-arun/base-template-site)

An intelligent workout tracking app with AI-powered workout generation, real-time exercise tracking, and personalized coaching. Built with React, Vite, and integrated with LLM for smart programming.

## ✨ Key Features

- 🤖 **AI Workout Generation** - Personalized workouts based on your history and goals
- 💪 **Live Exercise Tracking** - Track sets, reps, and weights in real-time
- 📝 **Manual Workout Logging** - Log external workouts (gym, cardio, swimming, etc.)
- 📊 **Progress Analytics** - Visualize strength gains and workout trends
- 🎯 **AI Coach Personalities** - Choose from Iron, Zen, Blaze, or Sage coaches
- 🏆 **Achievement System** - Unlock badges as you progress
- 💾 **Persistent Storage** - Backend API with user data management
- 🎨 **Modern UI** - Dark theme with Tailwind CSS and Framer Motion

## 🏗️ Component Architecture

This project uses **Atomic Design** principles for scalable, maintainable code:

```
src/components/
├── atoms/          → Buttons, Inputs, Cards, Badges (reusable primitives)
├── molecules/      → FormField, WorkoutCard, EmptyState (compositions)
└── features/       → User, Workout, Progress, Coach (domain modules)
```

📚 **New to the codebase?** Start here:
- [QUICKSTART.md](./QUICKSTART.md) - Quick developer reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture guide  
- [COMPONENT_MAP.md](./COMPONENT_MAP.md) - Component relationships
- [STRUCTURE.md](./STRUCTURE.md) - Visual structure diagram

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone this template
git clone https://github.com/murali-arun/base-template-site.git my-new-project
cd my-new-project

# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server will start at `http://localhost:5173`

## 📜 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
base-template-arun/
├── src/
│   ├── main.js          # Application entry point
│   └── style.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── docker-compose.yml   # Docker configuration
├── nginx.conf           # nginx config for Docker
├── nginx.conf.example   # Example nginx config for VPS
└── package.json         # Project dependencies
```

## 🌐 Deployment

### Option 1: Static Hosting (Netlify, Vercel, etc.)

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting provider

### Option 2: VPS with nginx

1. Build the project: `npm run build`
2. Copy the `dist/` folder to your server
3. Use the provided `nginx.conf.example` as a starting point
4. Configure your nginx server to serve the static files

See `nginx.conf.example` for a sample nginx configuration.

### Option 3: Docker with nginx

```bash
# Build your project
npm run build

# Start the Docker container
docker-compose up -d

# Your app will be available at http://localhost:8080
```

To stop the container:
```bash
docker-compose down
```

The docker-compose setup uses:
- **Container name**: `base-template-arun`
- **Service name**: `template-static`
- **Port**: 8080 (configurable in docker-compose.yml)

### Option 4: GitHub Actions (Automated)

The template includes a GitHub Actions workflow for automated deployment to VPS via Docker.

**Setup GitHub Secrets:**

**Option A: Via GitHub Web UI**

Go to: **Settings → Secrets and variables → Actions → New repository secret**

**Option B: Via Terminal (GitHub CLI)**

```bash
# Set secrets from terminal
gh secret set VPS_HOST
gh secret set VPS_USERNAME
gh secret set VPS_PORT -b "22"

# Set SSH key from file
gh secret set VPS_SSH_KEY < ~/.ssh/id_rsa

# Or set SSH key with heredoc
gh secret set VPS_SSH_KEY <<EOF
-----BEGIN OPENSSH PRIVATE KEY-----
your-multi-line-ssh-key-here
-----END OPENSSH PRIVATE KEY-----
EOF
```

**Required Secrets:**

| Secret Name | Description | Example |
|-------------|-------------|----------|
| `VPS_HOST` | Your VPS IP or domain | `123.456.789.0` |
| `VPS_USERNAME` | SSH username | `root` or your user |
| `VPS_SSH_KEY` | Private SSH key | (paste full key) |
| `VPS_PORT` | SSH port (optional) | `22` |

**Deployment Details:**
- Deploys to: `/opt/template-static`
- Container name: `base-template-arun`
- Network: `npm_default` (for Nginx Proxy Manager)
- Auto-creates nginx config and docker-compose file

Push to `main` branch to trigger deployment!

## 🔒 SSL Setup (Optional)

```bash
# On VPS, install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

## 🛠️ Customization

### Update Project Name

Edit `package.json` to change the project name and description.

### Modify Styling

Edit `src/style.css` to customize the appearance.

### Add New Features

Add your JavaScript/TypeScript files in the `src/` directory and import them in `src/main.js`.

## 🔧 Troubleshooting

### Deployment fails
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Test SSH connection: `ssh user@your-vps-ip`

### 403 Forbidden on VPS
```bash
sudo chown -R www-data:www-data /var/www/your-app
sudo chmod -R 755 /var/www/your-app
```

### nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Build fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 License

MIT

## 👤 Author

Arun

---

**Happy coding! 🎉**
# Trigger deploy
