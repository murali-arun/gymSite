import React, { useState, useEffect } from 'react';
import { getAllUsers, createUser, deleteUser } from '../utils/storage';
import ProfileFormBuilder from './ProfileFormBuilder';

function UserSelection({ onUserSelected }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [useFormBuilder, setUseFormBuilder] = useState(true); // Toggle between form/raw prompt
  const [newUserData, setNewUserData] = useState({
    name: '',
    initialPrompt: ''
  });
  const [formData, setFormData] = useState({
    // Personal Info
    height: '',
    weight: '',
    targetWeight: '',
    goal: '',
    
    // Training Background
    trainingDays: '4',
    equipment: [],
    injuries: '',
    
    // Current Strength (optional)
    squat: '',
    rdl: '',
    row: '',
    pushup: '',
    
    // Cardio (optional)
    cardioType: [],
    cardioDistance: '',
    cardioTime: '',
    
    // Preferences
    focusAreas: [],
    constraints: ''
  });
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteInput, setDeleteInput] = useState('');

  useEffect(() => {
    async function loadUsers() {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setShowNewUserForm(allUsers.length === 0);
      setLoading(false);
    }
    loadUsers();
  }, []);

  const handleSelectUser = (userId) => {
    onUserSelected(userId);
  };

  const handleCreateUser = async () => {
    const promptToUse = useFormBuilder ? generatePromptFromForm() : newUserData.initialPrompt;
    
    if (!newUserData.name.trim() || !promptToUse.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const user = await createUser(newUserData.name.trim(), promptToUse.trim());
      onUserSelected(user.id);
    } catch (error) {
      alert('Failed to create user. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const generatePromptFromForm = () => {
    const equipmentList = formData.equipment.join(', ') || 'dumbbells';
    const cardioTypes = formData.cardioType.join(', ') || 'none';
    const focusList = formData.focusAreas.join(', ') || 'general fitness';
    
    return `You are an elite strength & conditioning coach (army PT / athletic performance style) helping me build muscle, improve conditioning, and lose fat WITHOUT burning out or getting injured.

**My Basics / Goals:**
- Height: ${formData.height || 'not specified'}
- Current Weight: ${formData.weight || 'not specified'}
- Target Weight: ${formData.targetWeight || 'lose fat and build muscle'}
- Primary Goal: ${formData.goal || 'Build muscle, improve conditioning, lose fat'}
- Training Days per Week: ${formData.trainingDays}
- Available Equipment: ${equipmentList}
- Injuries/Limitations: ${formData.injuries || 'None'}

**Current Strength Levels:**${formData.squat ? `\n- Squats: ${formData.squat}` : ''}${formData.rdl ? `\n- RDL/Deadlift: ${formData.rdl}` : ''}${formData.row ? `\n- Rows: ${formData.row}` : ''}${formData.pushup ? `\n- Push-ups: ${formData.pushup}` : ''}
${!formData.squat && !formData.rdl && !formData.row && !formData.pushup ? '- Building baseline strength' : ''}

**Cardio/Conditioning:**
- Types: ${cardioTypes}${formData.cardioDistance ? `\n- Recent Distance: ${formData.cardioDistance}` : ''}${formData.cardioTime ? `\n- Recent Time: ${formData.cardioTime}` : ''}

**Training Focus:**
- Areas: ${focusList}
- Constraints/Preferences: ${formData.constraints || 'None'}

**What I need from you:**
1. Design progressive workout programs based on my equipment and goals
2. Brutally but constructively critique my training patterns
3. Give specific progression rules (sets, reps, weights) for the next 4-6 weeks
4. Adjust workouts based on my feedback and recovery
5. Keep me accountable while preventing burnout and injury

Respond with clear sections and specific numbers. Update my program as I progress.`;
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirm({ userId: user.id, name: user.name });
    setDeleteInput('');
  };

  const handleConfirmDelete = async () => {
    if (deleteInput !== deleteConfirm.name) {
      alert('Name does not match. Please type the exact name to confirm deletion.');
      return;
    }

    try {
      await deleteUser(deleteConfirm.userId);
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      setDeleteConfirm(null);
      setDeleteInput('');
      
      if (updatedUsers.length === 0) {
        setShowNewUserForm(true);
      }
    } catch (error) {
      alert('Failed to delete user. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">💪 AI Gym Tracker</h1>
          <p className="text-gray-400 text-lg">Personalized workouts that learn with you</p>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 border border-red-700 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-2">⚠️ Delete User</h3>
              <p className="text-gray-300 mb-4">
                This will permanently delete <strong className="text-red-400">{deleteConfirm.name}</strong> and all their workout history. This cannot be undone.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type "<strong>{deleteConfirm.name}</strong>" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={deleteConfirm.name}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirm(null);
                    setDeleteInput('');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteInput !== deleteConfirm.name}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">{!showNewUserForm ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">Select Your Profile</h2>
              
              <div className="space-y-3 mb-6">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="w-full bg-gray-700/50 border border-gray-600 hover:border-blue-500 rounded-lg transition-all group"
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSelectUser(user.id)}
                        className="flex-1 p-4 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {user.workouts.length} workouts completed
                            </p>
                          </div>
                          <svg
                            className="w-6 h-6 text-gray-500 group-hover:text-blue-400 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="px-4 py-4 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all border-l border-gray-600"
                        title="Delete user"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowNewUserForm(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg shadow-blue-900/50"
              >
                + Create New Profile
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Create Your Profile</h2>
              <p className="text-gray-400 mb-6">Tell us about yourself so AI can personalize your workouts</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., John"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Toggle between Form Builder and Raw Prompt */}
                <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <button
                    type="button"
                    onClick={() => setUseFormBuilder(!useFormBuilder)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      useFormBuilder ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    📝 Use Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseFormBuilder(!useFormBuilder)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      !useFormBuilder ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    ✏️ Write Custom Prompt
                  </button>
                </div>

                {useFormBuilder ? (
                  <ProfileFormBuilder
                    formData={formData}
                    onChange={setFormData}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Custom Training Prompt <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      placeholder="Tell the AI about your fitness level, goals, injuries, available equipment, workout frequency, etc.&#10;&#10;Example: I'm a beginner, working out 3-4 times per week. Goals are to build muscle and lose fat. I have dumbbells and a bench at home. No knee injuries."
                      value={newUserData.initialPrompt}
                      onChange={(e) => setNewUserData({ ...newUserData, initialPrompt: e.target.value })}
                      rows={12}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Be detailed - this helps the AI create better personalized workouts
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {users.length > 0 && (
                  <button
                    onClick={() => setShowNewUserForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleCreateUser}
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/50"
                >
                  {creating ? 'Creating...' : '✓ Create Profile'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          Your data is stored locally in your browser
        </div>
      </div>
    </div>
  );
}

export default UserSelection;
