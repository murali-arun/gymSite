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

  useEffect(() => {
    if (user?.id) {
      loadTemplates();
    }
  }, [user?.id]);

  const loadTemplates = () => {
    const userTemplates = getTemplates(user.id);
    setTemplates(userTemplates);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (!currentWorkout || !currentWorkout.exercises || currentWorkout.exercises.length === 0) {
      alert('No workout to save. Generate or complete a workout first.');
      return;
    }

    try {
      await saveAsTemplate(user.id, currentWorkout, templateName, templateDescription, selectedTags);
      setShowSaveModal(false);
      setTemplateName('');
      setTemplateDescription('');
      setSelectedTags([]);
      loadTemplates();
      alert('✅ Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
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
    if (!window.confirm('Are you sure you want to delete this template? This cannot be undone.')) {
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

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Workout Templates</h2>
            <p className="text-sm text-gray-400 mt-1">
              Save and reuse your favorite workouts with progressive overload
            </p>
          </div>
          
          <Button
            onClick={() => setShowSaveModal(true)}
            disabled={!currentWorkout || !currentWorkout.exercises?.length}
            className="whitespace-nowrap"
          >
            💾 Save Current Workout
          </Button>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="mt-8 text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">No Templates Yet</h3>
            <p className="text-gray-400 mb-4">
              Create your first template by saving your current workout
            </p>
            {!currentWorkout && (
              <p className="text-sm text-gray-500">
                Generate or complete a workout first, then click "Save Current Workout"
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <Modal onClose={() => setShowSaveModal(false)} title="Save as Template">
          <div className="space-y-4">
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
                onClick={() => setShowSaveModal(false)}
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
    </div>
  );
};

export default WorkoutTemplates;
