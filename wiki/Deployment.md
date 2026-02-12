# 🚢 Deployment Guide

Complete guide to deploying AI Gym Tracker to production.

## Deployment Options

| Method | Difficulty | Cost | Best For |
|--------|-----------|------|----------|
| **Docker** | Easy | Free (self-host) | Quick setup, consistent environments |
| **Manual** | Medium | Free (self-host) | Custom configuration, learning |
| **GitHub Actions** | Easy | Free (with VPS) | Automated CI/CD pipeline |
| **Cloud** | Easy | ~$5-20/month | Managed hosting, zero maintenance |

## Prerequisites

- **Server** with Docker installed (or Node.js for manual)
- **Domain name** (optional, recommended for HTTPS)
- **LiteLLM API Key** or self-hosted LiteLLM instance
- **SSH access** to your server

## Option 1: Docker Deployment (Recommended)

### Step 1: Prepare Environment

Create backend environment file:

```bash
# backend/.env
PORT=3002
NODE_ENV=production
API_SECRET=your-secret-here  # Generate with: openssl rand -hex 32
LITELLM_API_URL=http://89.116.157.50:4000/v1/chat/completions
LITELLM_API_KEY=sk-your-key-here
LITELLM_MODEL=claude-3-7-sonnet-latest
```

Create frontend environment file:

```bash
# .env
VITE_API_URL=http://your-server.com:3002/api
# Or for proxy setup: https://gym.yoursite.com/api
```

### Step 2: Configure CORS

Edit `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://your-domain.com',
    'https://your-domain.com',
    'http://yourdomain.com:3003'  // Docker frontend port
  ],
  credentials: true
}));
```

### Step 3: Build and Deploy

```bash
# Build frontend
npm run build

# Start Docker containers
docker-compose up -d

# Verify running
docker-compose ps

# Check logs
docker-compose logs -f
```

### Step 4: Access Your App

- **Frontend**: `http://your-server:3003`
- **Backend**: `http://your-server:3002`
- **Backend Health**: `http://your-server:3002/health`

### Docker Commands

```bash
# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# View logs
docker-compose logs -f [backend|frontend]

# Rebuild after code changes
docker-compose up -d --build

# Remove everything (including data!)
docker-compose down -v
```

## Option 2: Manual Deployment

### Step 1: Server Setup

```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 process manager
sudo npm install -g pm2
```

### Step 2: Clone and Build

```bash
# Clone repository
git clone https://github.com/murali-arun/base-template-site.git gymSite
cd gymSite

# Install dependencies
npm install
cd backend && npm install && cd ..

# Build frontend
npm run build
```

### Step 3: Configure Environment

```bash
# Copy and edit environment files
cp backend/.env.example backend/.env
nano backend/.env  # Edit with your values
```

### Step 4: Start Services

```bash
# Start backend with PM2
pm2 start backend/server.js --name gym-backend

# Serve frontend (choose one method):

# Method A: Using serve
npm install -g serve
pm2 start "serve -s dist -l 3003" --name gym-frontend

# Method B: Using nginx (see below)
sudo apt install nginx
```

### Step 5: Setup Nginx (Recommended)

Create nginx config:

```nginx
# /etc/nginx/sites-available/gym
server {
    listen 80;
    server_name gym.yoursite.com;

    # Frontend
    location / {
        root /path/to/gymSite/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/gym /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### PM2 Commands

```bash
# List processes
pm2 list

# View logs
pm2 logs gym-backend
pm2 logs gym-frontend

# Restart
pm2 restart all

# Stop
pm2 stop all

# Save PM2 config (auto-start on reboot)
pm2 save
pm2 startup
```

## Option 3: GitHub Actions Auto-Deploy

### Step 1: Setup GitHub Secrets

Go to **Repository → Settings → Secrets and variables → Actions**

Add these secrets:

**Server Connection**:
- `VPS_HOST`: `your-server-ip-or-domain`
- `VPS_USERNAME`: `root` or `ubuntu`
- `VPS_SSH_KEY`: Your private SSH key (entire content)
- `VPS_PORT`: `22` (optional)
- `DEPLOY_PATH`: `/opt/gymSite` (optional)

**Application Config**:
- `API_SECRET`: Generate with `openssl rand -hex 32`
- `VITE_API_URL`: `https://gym.yoursite.com/api`
- `LITELLM_API_URL`: Your LiteLLM URL
- `LITELLM_API_KEY`: Your API key
- `LITELLM_MODEL`: `claude-3-7-sonnet-latest`

### Step 2: Workflow File

The repository already includes `.github/workflows/deploy.yml`. It will:

1. Build frontend
2. SSH into your server
3. Pull latest code
4. Deploy with Docker

### Step 3: Deploy

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions automatically deploys on every push to `main`.

**View Progress**: Repository → Actions tab

## Option 4: Cloud Platforms

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod

# Backend still needs separate hosting (Railway, Render, etc.)
```

### Railway (Full Stack)

1. Connect GitHub repo
2. Add services:
   - **Backend**: Node.js service from `backend/`
   - **Frontend**: Static site from `dist/`
3. Configure environment variables
4. Deploy automatically on push

### Render (Full Stack)

1. **Backend Service**:
   - Build: `cd backend && npm install`
   - Start: `node server.js`
   - Add environment variables

2. **Frontend Service**:
   - Build: `npm run build`
   - Publish: `dist/`
   - Type: Static site

## HTTPS/SSL Setup

### Using Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d gym.yoursite.com

# Auto-renewal (already setup by certbot)
sudo certbot renew --dry-run
```

Nginx auto-updates to:

```nginx
server {
    listen 443 ssl http2;
    server_name gym.yoursite.com;
    
    ssl_certificate /etc/letsencrypt/live/gym.yoursite.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gym.yoursite.com/privkey.pem;
    
    # ... rest of config
}
```

### Using Cloudflare (Free)

1. Add your domain to Cloudflare
2. Point DNS to your server IP
3. Enable "Full (strict)" SSL mode
4. Cloudflare handles certificates automatically

## Environment Variables Reference

### Backend Required

| Variable | Example | Description |
|----------|---------|-------------|
| `PORT` | `3002` | Backend server port |
| `NODE_ENV` | `production` | Environment mode |
| `API_SECRET` | `abc123...` | Auth secret (32+ chars) |
| `LITELLM_API_URL` | `http://...` | LiteLLM endpoint |
| `LITELLM_API_KEY` | `sk-...` | LiteLLM API key |
| `LITELLM_MODEL` | `claude-3-7-sonnet-latest` | AI model name |

### Frontend Required

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://gym.site.com/api` | Backend API URL |

## Security Checklist

Before going to production:

- [ ] Change default `API_SECRET` to strong random value
- [ ] Setup HTTPS/SSL certificates
- [ ] Configure CORS to only allow your domain
- [ ] Add rate limiting (nginx or backend middleware)
- [ ] Secure `backend/data/` directory permissions
- [ ] Never commit `.env` files (check `.gitignore`)
- [ ] Use environment variables for all secrets
- [ ] Setup firewall (allow only 22, 80, 443, your app ports)
- [ ] Regular `npm audit` for security vulnerabilities
- [ ] Enable backend request logging
- [ ] Setup monitoring (UptimeRobot, StatusCake, etc.)

## Port Configuration

Default ports:

| Service | Port | Exposing |
|---------|------|----------|
| Frontend (Docker) | 3003 | Publicly |
| Backend (Docker) | 3002 | Publicly or via nginx proxy |
| Frontend (Manual) | 80/443 | Via nginx |
| Backend (Manual) | 3002 | Via nginx proxy only |

### Changing Ports

**Docker**: Edit `docker-compose.yml`

```yaml
services:
  backend:
    ports:
      - "YOUR_PORT:3002"
  frontend:
    ports:
      - "YOUR_PORT:80"
```

**Manual**: 
- Backend: Edit `backend/server.js` or `PORT` env var
- Frontend: Pass `--port` flag to serving tool

## Data Persistence

### Docker Volumes

User data automatically persists in Docker volume:

```yaml
volumes:
  - ./backend/data:/app/data  # Persists across restarts
```

**Backup**:

```bash
# Backup
tar -czf backup-$(date +%Y%m%d).tar.gz backend/data/

# Restore
tar -xzf backup-20260212.tar.gz
```

### Manual Deployment

Data stored at: `backend/data/users.json`

**Backup**: Copy file to secure location regularly

```bash
# Automated daily backup
0 2 * * * cp /path/to/backend/data/users.json /backups/users-$(date +\%Y\%m\%d).json
```

## Monitoring & Logs

### Docker Logs

```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f backend
```

### PM2 Logs

```bash
# Real-time
pm2 logs

# Specific app
pm2 logs gym-backend

# Log rotation (prevent disk fills)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
```

### Nginx Logs

```bash
# Access log
tail -f /var/log/nginx/access.log

# Error log
tail -f /var/log/nginx/error.log
```

## Performance Tuning

### Frontend Optimization

Already built-in:
- Code splitting
- Tree shaking
- Minification
- Gzip compression

**Additional**:

```nginx
# Enable Gzip in nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;

# Browser caching
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Backend Optimization

```javascript
// In backend/server.js

// Compression middleware
const compression = require('compression');
app.use(compression());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run build
```

### Docker Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Verify environment variables
docker-compose config

# Rebuild
docker-compose up -d --build
```

### Can't Connect to Backend

```bash
# Check backend running
curl http://localhost:3002/health

# Check firewall
sudo ufw status
sudo ufw allow 3002

# Check CORS config in backend/server.js
```

### HTTPS Not Working

```bash
# Check certificate
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Check nginx config
sudo nginx -t
```

## Updating Production

### Docker

```bash
git pull origin main
npm run build
docker-compose up -d --build
```

### Manual

```bash
git pull origin main
npm install
cd backend && npm install && cd ..
npm run build
pm2 restart all
```

### GitHub Actions

Just push to main - auto-deploys!

```bash
git push origin main
```

## Rollback

### Docker

```bash
# Rollback to specific commit
git checkout <commit-hash>
npm run build
docker-compose up -d --build
```

### Manual

```bash
git checkout <commit-hash>
npm run build
pm2 restart all
```

---

**Related Pages**:
- [Getting Started](Getting-Started) - Local development
- [Environment Variables](Environment-Variables) - Complete env reference
- [Docker Setup](Docker-Setup) - Detailed Docker guide
- [Cost Optimization](Cost-Optimization) - Reducing hosting costs

**Next**: [Monitoring & Maintenance](Monitoring) →
