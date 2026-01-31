import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;
const DATA_FILE = path.join(__dirname, 'data', 'users.json');

// Middleware - CORS must come first
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? ['https://gym.anmious.cloud', 'http://gym.anmious.cloud', 'http://localhost:5173', 'http://localhost:5174']
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
app.use(express.json({ limit: '50mb' }));

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  // Skip validation for health check and OPTIONS requests
  if (req.path === '/api/health' || req.method === 'OPTIONS') {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_SECRET;

  if (!expectedKey) {
    console.warn('WARNING: API_SECRET not configured - allowing request');
    return next(); // Allow in dev if not configured
  }

  if (!apiKey || apiKey !== expectedKey) {
    console.warn('Invalid API key attempt from:', req.ip);
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  next();
};

app.use(validateApiKey);

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  // Initialize users file if it doesn't exist
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
  }
}

// Read data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { users: [] };
  }
}

// Write data
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
}

// Routes

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Gym Tracker API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      workout: '/api/workout',
      feedback: '/api/workout/feedback',
      summary: '/api/progress/summary'
    }
  });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const data = await readData();
    const user = data.users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const data = await readData();
    const newUser = req.body;
    
    data.users.push(newUser);
    await writeData(data);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.users.findIndex(u => u.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    data.users[index] = { ...data.users[index], ...req.body };
    await writeData(data);
    
    res.json(data.users[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const data = await readData();
    const filteredUsers = data.users.filter(u => u.id !== req.params.id);
    
    if (filteredUsers.length === data.users.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    data.users = filteredUsers;
    await writeData(data);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get/Set active user
app.get('/api/active-user', async (req, res) => {
  try {
    const data = await readData();
    res.json({ activeUserId: data.activeUserId || null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active user' });
  }
});

app.post('/api/active-user', async (req, res) => {
  try {
    const data = await readData();
    data.activeUserId = req.body.userId;
    await writeData(data);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set active user' });
  }
});

// Generate workout using LiteLLM
app.post('/api/generate-workout', async (req, res) => {
  try {
    const { messages } = req.body;
    
    console.log('=== GENERATE WORKOUT REQUEST ===');
    console.log('LITELLM_API_URL:', process.env.LITELLM_API_URL);
    console.log('LITELLM_MODEL:', process.env.LITELLM_MODEL);
    console.log('Has API Key:', !!process.env.LITELLM_API_KEY);
    console.log('Message count:', messages?.length);
    console.log('================================');
    
    const response = await fetch(process.env.LITELLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LITELLM_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.LITELLM_MODEL,
        messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== LITELLM API ERROR ===');
      console.error('Status:', response.status, response.statusText);
      console.error('Response:', errorText);
      console.error('=========================');
      return res.status(response.status).json({ 
        error: `AI API request failed: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('=== LITELLM SUCCESS ===');
    console.log('Got response with', data.choices?.length, 'choices');
    console.log('=======================');
    res.json(data);
  } catch (error) {
    console.error('=== ERROR CALLING LITELLM ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Stack:', error.stack);
    console.error('=============================');
    res.status(500).json({ 
      error: 'Failed to generate workout',
      message: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
async function start() {
  await ensureDataDir();
  
  // Log environment configuration (without sensitive values)
  console.log('=== BACKEND CONFIGURATION ===');
  console.log('PORT:', PORT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('LITELLM_API_URL:', process.env.LITELLM_API_URL || 'NOT SET');
  console.log('LITELLM_MODEL:', process.env.LITELLM_MODEL || 'NOT SET');
  console.log('Has LITELLM_API_KEY:', !!process.env.LITELLM_API_KEY);
  console.log('Has API_SECRET:', !!process.env.API_SECRET);
  console.log('============================');
  
  app.listen(PORT, () => {
    console.log(`🏋️ Gym Tracker API running on http://localhost:${PORT}`);
    console.log(`📁 Data stored in: ${DATA_FILE}`);
  });
}

start();
