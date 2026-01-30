import React, { useState, useEffect } from 'react';
import UserSelection from './components/UserSelection';
import WorkoutGenerator from './components/WorkoutGenerator';
import ExerciseTracker from './components/ExerciseTracker';
import History from './components/History';
import Progress from './components/Progress';
import Achievements from './components/Achievements';
import ProgressDashboard from './components/ProgressDashboard';
import { getUser, getActiveUserId, setActiveUserId } from './utils/storage';

function App() {
  const [activeUserId, setActiveUserIdState] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home, tracker, history, progress, achievements, dashboard
  const [currentWorkout, setCurrentWorkout] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const savedUserId = await getActiveUserId();
      if (savedUserId) {
        const userData = await getUser(savedUserId);
        if (userData) {
          setActiveUserIdState(savedUserId);
          setUser(userData);
          
          if (userData.currentWorkout) {
            setCurrentWorkout(userData.currentWorkout);
            setView('tracker');
          }
        }
      }
    }
    loadUser();
  }, []);

  const handleUserSelected = async (userId) => {
    const userData = await getUser(userId);
    await setActiveUserId(userId);
    setActiveUserIdState(userId);
    setUser(userData);
    
    if (userData.currentWorkout) {
      setCurrentWorkout(userData.currentWorkout);
      setView('tracker');
    }
  };

  const handleLogout = async () => {
    await setActiveUserId('');
    setActiveUserIdState(null);
    setUser(null);
    setCurrentWorkout(null);
    setView('home');
  };

  const handleWorkoutGenerated = (workout) => {
    setCurrentWorkout(workout);
    setView('tracker');
  };

  const handleRegenerateWorkout = () => {
    setCurrentWorkout(null);
    setView('home');
  };

  const handleWorkoutComplete = async () => {
    // Refresh user data
    const updatedUser = await getUser(activeUserId);
    setUser(updatedUser);
    setCurrentWorkout(null);
    setView('home');
  };

  const refreshUserData = async () => {
    const updatedUser = await getUser(activeUserId);
    setUser(updatedUser);
  };

  if (!user) {
    return <UserSelection onUserSelected={handleUserSelected} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">💪 AI Gym Tracker</h1>
              <p className="text-sm text-gray-400">Training with {user.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('home')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'home'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📊 Stats
              </button>
              <button
                onClick={() => setView('achievements')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'achievements'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🏆 Badges
              </button>
              <button
                onClick={() => setView('progress')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                History
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
              >
                Switch User
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === 'home' && (
          <WorkoutGenerator
            user={user}
            onWorkoutGenerated={handleWorkoutGenerated}
          />
        )}
        
        {view === 'tracker' && currentWorkout && (
          <ExerciseTracker
            user={user}
            workout={currentWorkout}
            onComplete={handleWorkoutComplete}
            onRegenerate={handleRegenerateWorkout}
            onCancel={() => {
              setCurrentWorkout(null);
              setView('home');
              refreshUserData();
            }}
          />
        )}
        
        {view === 'history' && (
          <History
            user={user}
            onRefresh={refreshUserData}
          />
        )}

        {view === 'progress' && (
          <Progress
            user={user}
            onRefresh={refreshUserData}
          />
        )}
        
        {view === 'achievements' && (
          <Achievements
            user={user}
          />
        )}
        
        {view === 'dashboard' && (
          <ProgressDashboard
            user={user}
          />
        )}
      </main>
    </div>
  );
}

export default App;
