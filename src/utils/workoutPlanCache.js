// Workout Plan Cache System
// Stores pre-generated workouts to reduce LLM calls

export async function getWorkoutPlan(userId) {
  try {
    const plans = JSON.parse(localStorage.getItem('workoutPlans') || '{}');
    return plans[userId] || null;
  } catch {
    return null;
  }
}

export async function setWorkoutPlan(userId, plan) {
  try {
    const plans = JSON.parse(localStorage.getItem('workoutPlans') || '{}');
    plans[userId] = {
      ...plan,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    localStorage.setItem('workoutPlans', JSON.stringify(plans));
    return true;
  } catch (error) {
    console.error('Error saving workout plan:', error);
    return false;
  }
}

export async function getNextWorkoutFromPlan(userId) {
  const plan = await getWorkoutPlan(userId);
  
  if (!plan || !plan.workouts || plan.workouts.length === 0) {
    return null;
  }
  
  // Check if plan expired
  if (new Date(plan.expiresAt) < new Date()) {
    console.log('Workout plan expired');
    return null;
  }
  
  // Find next unused workout
  const today = new Date().toISOString().split('T')[0];
  const nextWorkout = plan.workouts.find(w => !w.used && w.scheduledDate >= today);
  
  return nextWorkout || null;
}

export async function markWorkoutAsUsed(userId, workoutIndex) {
  try {
    const plans = JSON.parse(localStorage.getItem('workoutPlans') || '{}');
    if (plans[userId] && plans[userId].workouts[workoutIndex]) {
      plans[userId].workouts[workoutIndex].used = true;
      plans[userId].workouts[workoutIndex].completedDate = new Date().toISOString();
      localStorage.setItem('workoutPlans', JSON.stringify(plans));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error marking workout as used:', error);
    return false;
  }
}

export async function clearWorkoutPlan(userId) {
  try {
    const plans = JSON.parse(localStorage.getItem('workoutPlans') || '{}');
    delete plans[userId];
    localStorage.setItem('workoutPlans', JSON.stringify(plans));
    return true;
  } catch {
    return false;
  }
}

export async function getRemainingWorkoutsCount(userId) {
  const plan = await getWorkoutPlan(userId);
  if (!plan || !plan.workouts) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  return plan.workouts.filter(w => !w.used && w.scheduledDate >= today).length;
}
