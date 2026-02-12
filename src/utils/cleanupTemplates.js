/**
 * Utility to clean up and migrate old/corrupted templates
 * Run this once if you're experiencing template-related errors
 */

export function cleanupTemplates() {
  try {
    const raw = localStorage.getItem('workoutTemplates');
    if (!raw) {
      console.log('No templates to clean');
      return;
    }

    const data = JSON.parse(raw);
    const fixed = {};

    Object.keys(data).forEach(userId => {
      const userTemplates = data[userId];
      
      if (!Array.isArray(userTemplates)) {
        console.warn(`Invalid templates for user ${userId}, skipping`);
        return;
      }

      // Fix each template to ensure all required properties exist
      fixed[userId] = userTemplates.map(template => {
        // Validate exercises
        const exercises = Array.isArray(template.exercises) 
          ? template.exercises.map(ex => ({
              ...ex,
              sets: Array.isArray(ex.sets) ? ex.sets : []
            }))
          : [];

        return {
          id: template.id || `template_${Date.now()}_${Math.random()}`,
          name: template.name || 'Untitled Template',
          description: template.description || '',
          createdAt: template.createdAt || new Date().toISOString(),
          lastUsed: template.lastUsed || null,
          timesUsed: template.timesUsed || 0,
          type: template.type || 'strength',
          exercises: exercises,
          tags: Array.isArray(template.tags) ? template.tags : [],
          cardio: template.cardio || null
        };
      });
    });

    localStorage.setItem('workoutTemplates', JSON.stringify(fixed));
    console.log('✅ Templates cleaned up successfully');
    console.log('Fixed templates for users:', Object.keys(fixed));
    
    return fixed;
  } catch (error) {
    console.error('Error cleaning up templates:', error);
    return null;
  }
}

/**
 * Remove all templates (use with caution!)
 */
export function clearAllTemplates() {
  if (window.confirm('⚠️ This will DELETE ALL templates. Are you sure?')) {
    localStorage.removeItem('workoutTemplates');
    console.log('🗑️ All templates cleared');
    window.location.reload();
  }
}

// Make available in console for debugging
if (typeof window !== 'undefined') {
  window.cleanupTemplates = cleanupTemplates;
  window.clearAllTemplates = clearAllTemplates;
}
