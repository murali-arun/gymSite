const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// User Profile Structure:
// {
//   id: string,
//   name: string,
//   createdAt: string,
//   initialPrompt: string,
//   conversationHistory: [{role: 'user'|'assistant', content: string, timestamp: string}],
//   progressSummary: string or null,
//   lastSummarizedAt: string or null,
//   workouts: [{...workout data}],
//   currentWorkout: {...} or null
// }

export async function getAllUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

export async function getUser(userId) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function createUser(name, initialPrompt) {
  try {
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      progressSummary: null,
      lastSummarizedAt: null,
      initialPrompt,
      conversationHistory: [],
      workouts: [],
      currentWorkout: null
    };
    
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    
    if (!response.ok) throw new Error('Failed to create user');
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(userId, updates) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) throw new Error('Failed to update user');
    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function addConversationMessage(userId, role, content) {
  try {
    const user = await getUser(userId);
    if (!user) throw new Error('User not found');
    
    user.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    
    await updateUser(userId, { conversationHistory: user.conversationHistory });
  } catch (error) {
    console.error('Error adding conversation message:', error);
    throw error;
  }
}

export async function saveWorkoutToUser(userId, workout) {
  try {
    const user = await getUser(userId);
    if (!user) throw new Error('User not found');
    
    user.workouts.unshift(workout);
    user.currentWorkout = null;
    
    await updateUser(userId, { 
      workouts: user.workouts,
      currentWorkout: null
    });
  } catch (error) {
    console.error('Error saving workout:', error);
    throw error;
  }
}

export async function setCurrentWorkout(userId, workout) {
  try {
    await updateUser(userId, { currentWorkout: workout });
  } catch (error) {
    console.error('Error setting current workout:', error);
    throw error;
  }
}

export async function clearCurrentWorkout(userId) {
  try {
    await updateUser(userId, { currentWorkout: null });
  } catch (error) {
    console.error('Error clearing current workout:', error);
  }
}

export async function getActiveUserId() {
  try {
    const response = await fetch(`${API_URL}/active-user`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.activeUserId;
  } catch (error) {
    console.error('Error getting active user:', error);
    return null;
  }
}

export async function setActiveUserId(userId) {
  try {
    await fetch(`${API_URL}/active-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  } catch (error) {
    console.error('Error setting active user:', error);
  }
}

export function shouldSummarize(user) {
  // Summarize every 7 workouts
  if (user.workouts.length < 7) return false;
  
  // If never summarized and have 7+ workouts
  if (!user.lastSummarizedAt) return true;
  
  // Count workouts since last summary
  const lastSummaryDate = new Date(user.lastSummarizedAt);
  const workoutsSinceLastSummary = user.workouts.filter(w => 
    new Date(w.completedAt) > lastSummaryDate
  ).length;
  
  return workoutsSinceLastSummary >= 7;
}

export async function updateSummary(userId, summary) {
  try {
    const user = await getUser(userId);
    if (!user) throw new Error('User not found');
    
    // Keep only recent 6 messages (3 exchanges), clear older ones
    const recentMessages = user.conversationHistory.slice(-6);
    
    await updateUser(userId, {
      progressSummary: summary,
      lastSummarizedAt: new Date().toISOString(),
      conversationHistory: recentMessages
    });
    
    console.log('✅ Progress summarized, old conversation history cleared');
  } catch (error) {
    console.error('Error updating summary:', error);
    throw error;
  }
}

export function getExerciseHistory(user) {
  // Flatten all exercises from all workouts with their performance data
  const exerciseMap = new Map();
  
  user.workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      const completedSets = exercise.sets.filter(s => s.completed);
      if (completedSets.length === 0) return;
      
      if (!exerciseMap.has(exercise.name)) {
        exerciseMap.set(exercise.name, []);
      }
      
      const maxWeight = Math.max(...completedSets.map(s => s.weight || 0));
      const totalReps = completedSets.reduce((sum, s) => sum + (s.reps || 0), 0);
      const avgReps = totalReps / completedSets.length;
      const volume = completedSets.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0);
      
      exerciseMap.get(exercise.name).push({
        date: workout.date,
        completedAt: workout.completedAt,
        sets: completedSets.length,
        maxWeight,
        avgReps: Math.round(avgReps * 10) / 10,
        totalVolume: volume
      });
    });
  });
  
  // Convert to array and sort by date
  const exercises = Array.from(exerciseMap.entries()).map(([name, history]) => ({
    name,
    history: history.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt)),
    totalSessions: history.length,
    latestWeight: history[history.length - 1]?.maxWeight || 0,
    firstWeight: history[0]?.maxWeight || 0
  }));
  
  return exercises.sort((a, b) => b.totalSessions - a.totalSessions);
}

export function getTodayWorkout(user) {
  const today = new Date().toISOString().split('T')[0];
  return user.workouts.find(w => w.date === today);
}

export function getWeekSummary(user) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekWorkouts = user.workouts.filter(w => 
    new Date(w.completedAt) > weekAgo
  );
  
  const totalExercises = weekWorkouts.reduce((sum, w) => 
    sum + (w.exercises?.length || 0), 0
  );
  
  const totalSets = weekWorkouts.reduce((sum, w) => 
    sum + (w.exercises?.reduce((s, e) => 
      s + e.sets.filter(set => set.completed).length, 0
    ) || 0), 0
  );
  
  return {
    workouts: weekWorkouts.length,
    exercises: totalExercises,
    sets: totalSets
  };
}

export async function deleteUser(userId) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete user');
    
    console.log('✅ User deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
