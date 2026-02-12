// Workout Templates System
// Save workouts as reusable templates with last-used weights for progressive overload

const TEMPLATES_KEY = 'workoutTemplates';

/**
 * Template structure:
 * {
 *   id: string,
 *   name: string,
 *   description: string,
 *   createdAt: timestamp,
 *   lastUsed: timestamp,
 *   timesUsed: number,
 *   type: 'strength' | 'cardio' | 'stretching',
 *   exercises: [...] (same structure as workout),
 *   tags: ['push', 'upper', 'home', etc]
 * }
 */

/**
 * Get all templates for a user
 */
export function getTemplates(userId) {
  try {
    const templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '{}');
    return templates[userId] || [];
  } catch (error) {
    console.error('Error reading templates:', error);
    return [];
  }
}

/**
 * Save a workout as a template
 */
export function saveAsTemplate(userId, workout, templateName, description = '', tags = []) {
  try {
    const templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '{}');
    
    if (!templates[userId]) {
      templates[userId] = [];
    }
    
    const template = {
      id: `template_${Date.now()}`,
      name: templateName,
      description: description,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      timesUsed: 0,
      type: workout.type || 'strength',
      exercises: workout.exercises?.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({
          weight: set.weight || set.targetWeight || 0,
          reps: set.reps || set.targetReps || 0,
          completed: false,
          targetWeight: set.weight || set.targetWeight || 0,
          targetReps: set.reps || set.targetReps || 0
        }))
      })) || [],
      cardio: workout.cardio || null,
      tags: tags
    };
    
    templates[userId].unshift(template);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    
    console.log('✅ Template saved:', template.name);
    return template;
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
}

/**
 * Load a template and prepare it for use
 * Updates weights from the user's latest performance on each exercise
 */
export function loadTemplate(userId, templateId, userWorkouts = []) {
  try {
    const templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '{}');
    const template = templates[userId]?.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Create workout from template
    const workout = {
      id: `workout_${Date.now()}`,
      type: template.type,
      generatedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      source: 'template',
      templateId: template.id,
      templateName: template.name,
      exercises: [],
      cardio: template.cardio
    };
    
    // Update exercises with latest performance data for progressive overload
    if (template.exercises) {
      workout.exercises = template.exercises.map(templateEx => {
        // Find most recent performance of this exercise
        const latestPerformance = findLatestExercisePerformance(userWorkouts, templateEx.name);
        
        return {
          ...templateEx,
          sets: templateEx.sets.map((set, idx) => {
            // Try to use last session's data, fall back to template defaults
            const lastSet = latestPerformance?.sets?.[idx];
            
            return {
              weight: lastSet?.weight || set.targetWeight || set.weight || 0,
              reps: lastSet?.reps || set.targetReps || set.reps || 0,
              targetWeight: lastSet?.weight || set.targetWeight || set.weight || 0,
              targetReps: lastSet?.reps || set.targetReps || set.reps || 0,
              completed: false
            };
          })
        };
      });
    }
    
    // Update template usage stats
    template.lastUsed = new Date().toISOString();
    template.timesUsed = (template.timesUsed || 0) + 1;
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    
    console.log('✅ Template loaded:', template.name);
    return workout;
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
}

/**
 * Find the most recent performance of an exercise
 */
function findLatestExercisePerformance(workouts, exerciseName) {
  if (!workouts || !Array.isArray(workouts)) return null;
  
  const normalizedName = exerciseName.toLowerCase();
  
  // Search workouts from most recent to oldest
  for (const workout of workouts) {
    if (!workout.exercises) continue;
    
    const exercise = workout.exercises.find(ex => 
      ex.name.toLowerCase() === normalizedName
    );
    
    if (exercise && exercise.sets?.some(s => s.completed)) {
      return {
        ...exercise,
        sets: exercise.sets.filter(s => s.completed)
      };
    }
  }
  
  return null;
}

/**
 * Update template with new data (rename, edit exercises, etc)
 */
export function updateTemplate(userId, templateId, updates) {
  try {
    const templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '{}');
    const template = templates[userId]?.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    Object.assign(template, updates);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    
    console.log('✅ Template updated:', template.name);
    return template;
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
}

/**
 * Delete a template
 */
export function deleteTemplate(userId, templateId) {
  try {
    const templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '{}');
    
    if (!templates[userId]) return false;
    
    const index = templates[userId].findIndex(t => t.id === templateId);
    if (index === -1) return false;
    
    templates[userId].splice(index, 1);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    
    console.log('✅ Template deleted');
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

/**
 * Get popular/suggested tags
 */
export function getSuggestedTags() {
  return [
    'push', 'pull', 'legs', 'upper', 'lower', 'full body',
    'chest', 'back', 'shoulders', 'arms', 'core',
    'strength', 'hypertrophy', 'endurance', 'power',
    'home', 'gym', 'minimal equipment',
    'quick', '30min', '45min', '60min+',
    'beginner', 'intermediate', 'advanced'
  ];
}

/**
 * Search templates by name or tags
 */
export function searchTemplates(userId, query) {
  const allTemplates = getTemplates(userId);
  const normalizedQuery = query.toLowerCase();
  
  return allTemplates.filter(template => 
    template.name.toLowerCase().includes(normalizedQuery) ||
    template.description.toLowerCase().includes(normalizedQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
  );
}
