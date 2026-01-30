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

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gym.anmious.cloud', 'http://gym.anmious.cloud']
    : '*'
}));
app.use(express.json({ limit: '50mb' }));

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
      console.error('LiteLLM API error:', errorText);
      return res.status(response.status).json({ 
        error: `AI API request failed: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error calling LiteLLM:', error);
    res.status(500).json({ error: 'Failed to generate workout' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
async function start() {
  await ensureDataDir();
  
  app.listen(PORT, () => {
    console.log(`🏋️ Gym Tracker API running on http://localhost:${PORT}`);
    console.log(`📁 Data stored in: ${DATA_FILE}`);
  });
}

start();
