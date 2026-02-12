import React, { useState, useEffect } from 'react';
import { getTemplates, saveAsTemplate, loadTemplate, deleteTemplate, getSuggestedTags } from '../../../utils/workoutTemplates';
import { Modal } from '../../organisms';
import { Button } from '../../atoms';

const WorkoutTemplates = ({ user, onStartWorkout, currentWorkout }) => {
  const [templates, setTemplates] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showTemplateDetails, setShowTemplateDetails] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [workoutToSave, setWorkoutToSave] = useState(null);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const [generatingAITemplates, setGeneratingAITemplates] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTemplates();
    }
  }, [user?.id]);

  const loadTemplates = () => {
    console.log('📚 Loading templates for user:', user.id);
    console.log('📚 Raw localStorage data:', localStorage.getItem('workoutTemplates'));
    const userTemplates = getTemplates(user.id);
    console.log('📚 Templates loaded:', userTemplates);
    console.log('📚 Templates array length:', userTemplates.length);
    setTemplates(userTemplates);
  };

  const handleOpenSaveModal = (workout) => {
    console.log('Opening save modal with workout:', workout);
    setWorkoutToSave(workout);
    setTemplateName(workout.description || workout.summary || '');
    setShowSaveModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const workout = workoutToSave || currentWorkout;
    
    console.log('Attempting to save workout:', workout);
    console.log('Workout exercises:', workout?.exercises);
    
    if (!workout || !workout.exercises || workout.exercises.length === 0) {
      alert('No workout to save. Generate or complete a workout first.');
      return;
    }

    try {
      console.log('Calling saveAsTemplate with:', {
        userId: user.id,
        templateName,
        templateDescription,
        tags: selectedTags,
        exerciseCount: workout.exercises.length
      });
      
      const savedTemplate = saveAsTemplate(user.id, workout, templateName, templateDescription, selectedTags);
      console.log('✅ Template saved successfully:', savedTemplate);
      console.log('📚 Raw localStorage after save:', localStorage.getItem('workoutTemplates'));
      
      setShowSaveModal(false);
      setTemplateName('');
      setTemplateDescription('');
      setSelectedTags([]);
      setWorkoutToSave(null);
      
      // Force reload templates
      const updatedTemplates = getTemplates(user.id);
      console.log('📚 Templates after save:', updatedTemplates);
      console.log('📚 Number of templates retrieved:', updatedTemplates.length);
      console.log('📚 Setting templates state with:', updatedTemplates);
      setTemplates(updatedTemplates);
      
      // Verify state update
      setTimeout(() => {
        console.log('📚 Templates state after setState:', templates);
      }, 100);
      
      alert('✅ Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Failed to save template: ${error.message}`);
    }
  };

  const handleLoadTemplate = async (templateId) => {
    try {
      const workout = loadTemplate(user.id, templateId, user.workouts);
      onStartWorkout(workout);
      loadTemplates(); // Refresh to update "last used"
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template. Please try again.');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    const templateToDelete = templates.find(t => t.id === templateId);
    const templateName = templateToDelete?.name || 'this template';
    
    if (!window.confirm(
      `Delete "${templateName}"?\n\n` +
      `⚠️  This will only delete THIS template\n` +
      `✅ Your other ${templates.length - 1} template${templates.length - 1 !== 1 ? 's' : ''} will remain safe\n\n` +
      `This cannot be undone.`
    )) {
      return;
    }

    try {
      await deleteTemplate(user.id, templateId);
      loadTemplates();
      if (showTemplateDetails?.id === templateId) {
        setShowTemplateDetails(null);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleGenerateAITemplates = async () => {
    if (!user?.workouts || user.workouts.length < 3) {
      alert('You need at least 3 completed workouts for AI to analyze patterns and create templates.');
      return;
    }

    // Confirm with user
    const confirmed = window.confirm(
      `AI will analyze your ${user.workouts.length} workouts and ADD new templates based on patterns it finds.\n\n` +
      `✅ Your existing ${templates.length} template${templates.length !== 1 ? 's' : ''} will NOT be deleted\n` +
      `✅ You can manually delete any template you don't want\n\n` +
      `Continue?`
    );
    
    if (!confirmed) {
      return;
    }

    setGeneratingAITemplates(true);

    try {
      // Import the API function dynamically
      const { generateTemplatesFromHistory } = await import('../../../services/api');
      
      const suggestedTemplates = await generateTemplatesFromHistory(user);
      
      if (!suggestedTemplates || suggestedTemplates.length === 0) {
        alert('AI couldn\'t find clear workout patterns in your history. Keep logging workouts and try again later!');
        setGeneratingAITemplates(false);
        return;
      }

      // Save each suggested template
      let savedCount = 0;
      for (const template of suggestedTemplates) {
        try {
          saveAsTemplate(
            user.id,
            { exercises: template.exercises, type: 'strength' },
            template.name,
            template.description,
            template.tags || []
          );
          savedCount++;
        } catch (err) {
          console.error('Error saving AI template:', err);
        }
      }

      loadTemplates();
      setGeneratingAITemplates(false);
      alert(
        `✅ AI ADDED ${savedCount} new template${savedCount > 1 ? 's' : ''} to your library!\n\n` +
        `Total templates: ${templates.length + savedCount}\n\n` +
        `Tip: You can delete any template you don't need by clicking the 🗑️ button.`
      );
    } catch (error) {
      console.error('Error generating AI templates:', error);
      setGeneratingAITemplates(false);
      alert('Failed to generate templates. Please try again.');
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (!user) {
    return null;
  }

  // Debug logging
  console.log('WorkoutTemplates - currentWorkout:', currentWorkout);
  console.log('WorkoutTemplates - has exercises:', currentWorkout?.exercises?.length);
  console.log('WorkoutTemplates - user.workouts count:', user?.workouts?.length);

  return (
    <div className="space-y-6">
      {/* Debug Info (temporary) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-4 text-xs font-mono">
          <div className="font-bold text-yellow-400 mb-2">🔍 Debug Info:</div>
          <div className="text-yellow-200">
            currentWorkout: {currentWorkout ? `✅ (${currentWorkout.exercises?.length || 0} exercises)` : '❌ null'}
          </div>
          <div className="text-yellow-200">
            user.workouts: {user?.workouts?.length || 0} completed workouts
          </div>
          <div className="text-yellow-200">
            templates: {templates.length} saved templates
          </div>
          {templates.length > 0 && (
            <div className="text-yellow-200 mt-2">
              Template names: {templates.map(t => t.name).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Workout Templates</h2>
            <p className="text-sm text-gray-400 mt-1">
              Save and reuse your favorite workouts with progressive overload
            </p>
          </div>
        </div>

        {/* AI Template Generator */}
        {user?.workouts && user.workouts.length >= 3 && (
          <div className="mt-6">
            <button
              onClick={handleGenerateAITemplates}
              disabled={generatingAITemplates}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-102 shadow-lg shadow-purple-900/50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">{generatingAITemplates ? '⏳' : '🤖'}</span>
                <div className="text-left">
                  <div>{generatingAITemplates ? 'Analyzing Your Workouts...' : 'AI: Generate Templates from History'}</div>
                  <div className="text-sm text-purple-100 font-normal">
                    {generatingAITemplates ? 'Finding patterns in your training' : `Adds templates (never deletes) • ${user.workouts.length} workouts`}
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Save from Recent Workouts or Current */}
        {(!currentWorkout || !currentWorkout.exercises?.length) && user?.workouts && user.workouts.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-300">💾 Save from Workout History</h3>
              {user.workouts.length > 6 && (
                <button
                  onClick={() => setShowAllWorkouts(!showAllWorkouts)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showAllWorkouts ? '▲ Show Less' : `▼ Show All (${user.workouts.length})`}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(showAllWorkouts ? user.workouts : user.workouts.slice(-6)).reverse().map((workout, idx) => (
                <button
                  key={workout.id || idx}
                  onClick={() => handleOpenSaveModal(workout)}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 hover:bg-gray-700 hover:border-blue-500 transition-all text-left group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {workout.description || 'Workout'}
                    </div>
                    <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(workout.date).toLocaleDateString()} • {workout.exercises?.length || 0} exercises
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save Current Workout */}
        {currentWorkout && currentWorkout.exercises?.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => handleOpenSaveModal(currentWorkout)}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-102 shadow-lg shadow-blue-900/50"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">💾</span>
                <div className="text-left">
                  <div>Save Current Workout as Template</div>
                  <div className="text-sm text-blue-100 font-normal">
                    {currentWorkout.exercises?.length || 0} exercises ready to save
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!currentWorkout && (!user?.workouts || user.workouts.length === 0) && templates.length === 0 && (
          <div className="mt-6 text-center py-8">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-400 text-sm">
              Complete a workout first, then come back here to save it as a template
            </p>
          </div>
        )}
      </div>

      {/* My Templates */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📚 My Templates ({templates.length})</h3>
        
        {templates.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-400">
              No templates saved yet. Save a workout to create your first template!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{template.description}</p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {template.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{template.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="text-sm text-gray-400 mb-3 space-y-1">
                  <div>💪 {template.exercises?.length || 0} exercises</div>
                  <div>🔁 Used {template.timesUsed} times</div>
                  {template.lastUsed && (
                    <div className="text-xs text-gray-500">
                      Last: {new Date(template.lastUsed).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoadTemplate(template.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium"
                  >
                    ▶ Start Workout
                  </button>
                  <button
                    onClick={() => setShowTemplateDetails(template)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all text-sm"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-all text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Template Modal */}
      {showSaveModal && (
        <Modal 
          onClose={() => {
            setShowSaveModal(false);
            setWorkoutToSave(null);
            setTemplateName('');
            setTemplateDescription('');
            setSelectedTags([]);
          }} 
          title="Save as Template"
        >
          <div className="space-y-4">
            {/* Workout Info */}
            {(workoutToSave || currentWorkout) && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="text-sm text-blue-300">
                  📋 Saving workout with {(workoutToSave || currentWorkout).exercises?.length || 0} exercises
                  {(workoutToSave || currentWorkout).date && (
                    <span className="text-blue-400/70 ml-2">
                      from {new Date((workoutToSave || currentWorkout).date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Push Day, Leg Day, Upper Power"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description of this workout..."
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {getSuggestedTags().slice(0, 12).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="text-xs text-gray-400">
                  Selected: {selectedTags.join(', ')}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveTemplate}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                💾 Save Template
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setWorkoutToSave(null);
                  setTemplateName('');
                  setTemplateDescription('');
                  setSelectedTags([]);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Template Details Modal */}
      {showTemplateDetails && (
        <Modal
          onClose={() => setShowTemplateDetails(null)}
          title={showTemplateDetails.name}
        >
          <div className="space-y-4">
            {showTemplateDetails.description && (
              <p className="text-gray-300">{showTemplateDetails.description}</p>
            )}

            {showTemplateDetails.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {showTemplateDetails.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-blue-900/50 text-blue-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Exercises</h4>
              <div className="space-y-3">
                {showTemplateDetails.exercises?.map((ex, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded p-3">
                    <div className="font-medium text-white mb-2">{ex.name}</div>
                    <div className="text-sm text-gray-400">
                      {ex.sets.length} sets × {ex.sets[0]?.reps || 0} reps @ {ex.sets[0]?.weight || 0} lbs
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleLoadTemplate(showTemplateDetails.id);
                  setShowTemplateDetails(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                ▶ Start This Workout
              </button>
              <button
                onClick={() => setShowTemplateDetails(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-sm text-yellow-300 font-mono space-y-2">
            <div className="font-bold text-yellow-200 mb-2">🐛 Debug Info:</div>
            <div>User ID: {user?.id}</div>
            <div>Templates in state: {templates.length}</div>
            <div>Template names: {templates.map(t => t.name).join(', ') || 'none'}</div>
            <div>Current workout: {currentWorkout ? `${currentWorkout.exercises?.length || 0} exercises` : 'none'}</div>
            <div>localStorage key: workoutTemplates</div>
            <button
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                loadTemplates();
              }}
              className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-bold"
            >
              🔄 Force Refresh Templates
            </button>
            <button
              onClick={() => {
                const raw = localStorage.getItem('workoutTemplates');
                console.log('📦 Raw localStorage:', raw);
                if (raw) {
                  const parsed = JSON.parse(raw);
                  console.log('📦 Parsed data:', parsed);
                  console.log('📦 Keys in storage:', Object.keys(parsed));
                  console.log(`📦 Data for user ${user.id}:`, parsed[user.id]);
                }
              }}
              className="ml-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-bold"
            >
              🔍 Inspect localStorage
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
