import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { UserSelection } from './components/features/user';
import { CoachAvatar, CoachSelector } from './components/features/coach';
import { CoachProvider } from './contexts/CoachContext';
import { getUser, getActiveUserId, setActiveUserId, addWorkout, addConversationMessage } from './utils/storage';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load heavy components for better initial load performance
const WorkoutGenerator = lazy(() => import('./components/features/workout/WorkoutGenerator'));
const ExerciseTracker = lazy(() => import('./components/features/workout/ExerciseTracker'));
const History = lazy(() => import('./components/features/workout/History'));
const ManualWorkoutLog = lazy(() => import('./components/features/workout/ManualWorkoutLog'));
const WorkoutTemplates = lazy(() => import('./components/features/workout/WorkoutTemplates'));
const Progress = lazy(() => import('./components/features/progress/Progress'));
const ProgressDashboard = lazy(() => import('./components/features/progress/ProgressDashboard'));
const Achievements = lazy(() => import('./components/features/progress/Achievements'));
const StrengthStandards = lazy(() => import('./components/features/progress/StrengthStandards'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-12">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  const [activeUserId, setActiveUserIdState] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home, tracker, history, progress, achievements, dashboard, manualLog, templates, strength
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [workoutToManualLog, setWorkoutToManualLog] = useState(null); // For pre-filling manual log
  const [showCoachSelector, setShowCoachSelector] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [workoutDropdownOpen, setWorkoutDropdownOpen] = useState(false);
  const [progressDropdownOpen, setProgressDropdownOpen] = useState(false);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setWorkoutDropdownOpen(false);
      setProgressDropdownOpen(false);
    };
    
    if (workoutDropdownOpen || progressDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [workoutDropdownOpen, progressDropdownOpen]);

  const handleUserSelected = useCallback(async (userId) => {
    const userData = await getUser(userId);
    await setActiveUserId(userId);
    setActiveUserIdState(userId);
    setUser(userData);
    
    if (userData.currentWorkout) {
      setCurrentWorkout(userData.currentWorkout);
      setView('tracker');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await setActiveUserId('');
    setActiveUserIdState(null);
    setUser(null);
    setCurrentWorkout(null);
    setView('home');
  }, []);

  const handleWorkoutGenerated = useCallback((workout) => {
    setCurrentWorkout(workout);
    setView('tracker');
  }, []);

  const handleRegenerateWorkout = useCallback(() => {
    setCurrentWorkout(null);
    setView('home');
  }, []);
  
  const handleManualLogFromTracker = useCallback((workout) => {
    setWorkoutToManualLog(workout);
    setView('manualLog');
  }, []);

  const handleWorkoutComplete = useCallback(async () => {
    // Refresh user data
    const updatedUser = await getUser(activeUserId);
    setUser(updatedUser);
    setCurrentWorkout(null);
    setView('home');
  }, [activeUserId]);

  const refreshUserData = useCallback(async () => {
    const updatedUser = await getUser(activeUserId);
    setUser(updatedUser);
  }, [activeUserId]);

  const handleManualWorkoutLogged = useCallback(async (workout) => {
    try {
      // Get AI feedback for the manual workout
      const { sendWorkoutFeedback } = await import('./services/api');
      const feedback = await sendWorkoutFeedback(user, workout);
      
      // Add feedback to the workout
      workout.aiFeedback = feedback;
      
      // Save the manual workout
      await addWorkout(activeUserId, workout);
      
      // Add detailed conversation history based on workout type
      let workoutDetails;
      if (workout.type === 'cardio') {
        const cardio = workout.cardio;
        const pace = cardio.distance && cardio.duration 
          ? ` (${(parseFloat(cardio.duration) / parseFloat(cardio.distance)).toFixed(1)} min/mile)`
          : '';
        workoutDetails = `${cardio.activity}: ${cardio.duration} minutes${
          cardio.distance ? `, ${cardio.distance} miles${pace}` : ''
        }, ${cardio.intensity} intensity${cardio.notes ? ` - ${cardio.notes}` : ''}`;
      } else {
        workoutDetails = workout.exercises.map(e => {
          const totalSets = e.sets.length;
          const exampleSet = e.sets[0];
          return `${e.name}: ${totalSets} sets of ${exampleSet.reps} reps @ ${exampleSet.weight}lbs`;
        }).join(', ');
        
        // Add duration if provided
        if (workout.totalDuration && workout.totalDuration > 0) {
          const minutes = Math.floor(workout.totalDuration / 60);
          workoutDetails += ` - Total duration: ${minutes} minutes`;
        }
      }
      
      await addConversationMessage(
        activeUserId,
        'user',
        `Manual ${workout.type || 'strength'} workout logged for ${new Date(workout.date).toLocaleDateString()}${workout.description ? ` - ${workout.description}` : ''}: ${workoutDetails}`
      );
      
      await addConversationMessage(
        activeUserId,
        'assistant',
        feedback
      );
      
      // Clear pre-filled workout and refresh user data
      setWorkoutToManualLog(null);
      await refreshUserData();
      setView('home');
      
      alert('✓ Workout logged successfully with AI feedback!');
    } catch (error) {
      console.error('Error saving manual workout:', error);
      alert('Failed to save workout. Please try again.');
    }
  }, [activeUserId, user, refreshUserData]);

  const handleRepeatLastWorkout = useCallback(() => {
    if (!user?.workouts || user.workouts.length === 0) {
      alert('No previous workouts found to repeat');
      return;
    }

    // Get the most recent completed workout
    const lastWorkout = user.workouts[user.workouts.length - 1];
    
    // Create a new workout based on the last one
    const repeatedWorkout = {
      id: `workout_${Date.now()}`,
      date: new Date().toISOString(),
      exercises: lastWorkout.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({
          ...set,
          completed: false // Reset completion status
        }))
      })),
      summary: `Repeating: ${lastWorkout.description || 'Previous workout'}`,
      description: lastWorkout.description,
      type: lastWorkout.type || 'strength'
    };

    setCurrentWorkout(repeatedWorkout);
    setView('tracker');
  }, [user]);

  if (!user) {
    return <UserSelection onUserSelected={handleUserSelected} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Header */}
      <header className="glass sticky top-0 z-40 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl sm:text-4xl bg-gray-900/70 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                💪
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary-400 via-accent-cyan to-accent-purple bg-clip-text text-transparent">
                  FitFlow AI
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">Training with {user.name}</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-2 items-center">
              {/* Home */}
              <button
                onClick={() => setView('home')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  view === 'home'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30 scale-105'
                    : 'glass-strong hover:bg-white/15 text-gray-300 hover:scale-105 active:scale-95'
                }`}
              >
                🏠 Home
              </button>

              {/* Workout Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setWorkoutDropdownOpen(!workoutDropdownOpen);
                    setProgressDropdownOpen(false);
                  }}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-1 ${
                    ['templates', 'strength', 'history'].includes(view)
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30 scale-105'
                      : 'glass-strong hover:bg-white/15 text-gray-300 hover:scale-105 active:scale-95'
                  }`}
                >
                  💪 Workout
                  <svg className={`w-4 h-4 transition-transform ${ workoutDropdownOpen ? 'rotate-180' : '' }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {workoutDropdownOpen && (
                  <div onClick={(e) => e.stopPropagation()} className="absolute top-full mt-2 right-0 w-48 glass-strong rounded-2xl overflow-hidden shadow-xl border border-white/10 z-50">
                    <button
                      onClick={() => { setView('templates'); setWorkoutDropdownOpen(false); }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                        view === 'templates' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                      }`}
                    >
                      💾 Templates
                    </button>
                    <button
                      onClick={() => { setView('strength'); setWorkoutDropdownOpen(false); }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                        view === 'strength' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                      }`}
                    >
                      ⚡ 1RM Calculator
                    </button>
                    <button
                      onClick={() => { setView('history'); setWorkoutDropdownOpen(false); }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                        view === 'history' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                      }`}
                    >
                      📜 History
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProgressDropdownOpen(!progressDropdownOpen);
                    setWorkoutDropdownOpen(false);
                  }}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-1 ${
                    ['dashboard', 'achievements', 'progress'].includes(view)
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30 scale-105'
                      : 'glass-strong hover:bg-white/15 text-gray-300 hover:scale-105 active:scale-95'
                  }`}
                >
                  📊 Progress
                  <svg className={`w-4 h-4 transition-transform ${ progressDropdownOpen ? 'rotate-180' : '' }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {progressDropdownOpen && (
                  <div onClick={(e) => e.stopPropagation()} className="absolute top-full mt-2 right-0 w-48 glass-strong rounded-2xl overflow-hidden shadow-xl border border-white/10 z-50">
                    <button
                      onClick={() => { setView('dashboard'); setProgressDropdownOpen(false); }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                        view === 'dashboard' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                      }`}
                    >
                      📈 Stats
                    </button>
                    <button
                      onClick={() => { setView('achievements'); setProgressDropdownOpen(false); }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                        view === 'achievements' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                      }`}
                    >
                      🏆 Badges
                    </button>
                    <button
                      onClick={() => { setView('progress'); setProgressDropdownOpen(false); }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                        view === 'progress' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                      }`}
                    >
                      📉 Details
                    </button>
                  </div>
                )}
              </div>

              {/* Coach */}
              <button
                onClick={() => setShowCoachSelector(true)}
                className="px-4 py-2 rounded-full font-medium glass-strong hover:bg-white/15 text-accent-purple transition-all duration-300 hover:scale-105 active:scale-95"
                title="Choose Your Coach"
              >
                🎯 Coach
              </button>

              {/* Switch User */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full font-medium glass-strong hover:bg-white/15 text-gray-300 transition-all duration-300 hover:text-white hover:scale-105 active:scale-95"
              >
                Switch
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-full glass-strong hover:bg-white/15 text-gray-300 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <div className="lg:hidden mt-4 space-y-2 animate-slide-up">
                {/* Home */}
                <button
                  onClick={() => { setView('home'); setShowMobileMenu(false); }}
                  className={`w-full px-4 py-3 rounded-2xl font-medium transition-all duration-300 text-left active:scale-98 ${
                    view === 'home'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                      : 'glass-strong hover:bg-white/15 text-gray-300'
                  }`}
                >
                  🏠 Home
                </button>

                {/* Workout Section */}
                <div className="glass-strong rounded-2xl overflow-hidden">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    💪 Workout
                  </div>
                  <button
                    onClick={() => { setView('templates'); setShowMobileMenu(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                      view === 'templates' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                    }`}
                  >
                    💾 Templates
                  </button>
                  <button
                    onClick={() => { setView('strength'); setShowMobileMenu(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                      view === 'strength' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                    }`}
                  >
                    ⚡ 1RM Calculator
                  </button>
                  <button
                    onClick={() => { setView('history'); setShowMobileMenu(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                      view === 'history' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                    }`}
                  >
                    📜 History
                  </button>
                </div>

                {/* Progress Section */}
                <div className="glass-strong rounded-2xl overflow-hidden">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    📊 Progress
                  </div>
                  <button
                    onClick={() => { setView('dashboard'); setShowMobileMenu(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                      view === 'dashboard' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                    }`}
                  >
                    📈 Stats
                  </button>
                  <button
                    onClick={() => { setView('achievements'); setShowMobileMenu(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                      view === 'achievements' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                    }`}
                  >
                    🏆 Badges
                  </button>
                  <button
                    onClick={() => { setView('progress'); setShowMobileMenu(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                      view === 'progress' ? 'bg-primary-600/30 text-white' : 'text-gray-300'
                    }`}
                  >
                    📉 Details
                  </button>
                </div>

                {/* Coach */}
                <button
                  onClick={() => { setShowCoachSelector(true); setShowMobileMenu(false); }}
                  className="w-full px-4 py-3 rounded-2xl font-medium glass-strong hover:bg-white/15 text-accent-purple transition-all duration-300 text-left active:scale-98"
                >
                  🎯 Coach
                </button>

                {/* Switch User */}
                <button
                  onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                  className="w-full px-4 py-3 rounded-2xl font-medium glass-strong hover:bg-white/15 text-gray-300 transition-all duration-300 hover:text-white text-left active:scale-98"
                >
                  🔄 Switch User
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Suspense fallback={<LoadingFallback />}>
          {view === 'home' && (
            <>
              {/* Quick Start Section */}
              {user?.workouts && user.workouts.length > 0 && (
                <div className="mb-6 animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <span>⚡</span>
                    Quick Start
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Repeat Last Workout */}
                    <button
                      onClick={handleRepeatLastWorkout}
                      className="glass-strong hover:bg-white/15 p-4 rounded-xl transition-all duration-300 hover:scale-102 active:scale-98 border border-primary-500/30 hover:border-primary-400/50 group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">🔁</span>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                            Repeat Last Workout
                          </div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {user.workouts[user.workouts.length - 1].description || 
                             `${user.workouts[user.workouts.length - 1].exercises?.length || 0} exercises`}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Browse Templates */}
                    <button
                      onClick={() => setView('templates')}
                      className="glass-strong hover:bg-white/15 p-4 rounded-xl transition-all duration-300 hover:scale-102 active:scale-98 border border-accent-purple/30 hover:border-accent-purple/50 group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">💾</span>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-white group-hover:text-accent-purple transition-colors">
                            Browse Templates
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Load saved workouts
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <WorkoutGenerator
                user={user}
                onWorkoutGenerated={handleWorkoutGenerated}
              />
              
              {/* Manual Workout Log Button */}
              <div className="mt-6">
                <button
                  onClick={() => setView('manualLog')}
                  className="w-full px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold rounded-2xl transition-all duration-300 border-2 border-gray-600 hover:border-gray-500 hover:scale-102 hover:shadow-xl shadow-gray-900/50 active:scale-98"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📝</span>
                    <div className="text-left">
                      <div>Log External Workout</div>
                      <div className="text-sm text-gray-300 font-normal">Track workouts you did outside the app</div>
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
          
          {view === 'manualLog' && (
            <ManualWorkoutLog
              user={user}
              onWorkoutLogged={handleManualWorkoutLogged}
              onCancel={() => {
                setView('home');
                setWorkoutToManualLog(null);
              }}
              prefilledWorkout={workoutToManualLog}
            />
          )}
          
          {view === 'tracker' && currentWorkout && (
            <ErrorBoundary
              title="Workout Tracker Error"
              message="Don't worry! Your workout progress is auto-saved. Please try refreshing."
              onReset={() => {
                setCurrentWorkout(null);
                setView('home');
                refreshUserData();
              }}
            >
              <ExerciseTracker
                user={user}
                workout={currentWorkout}
                onComplete={handleWorkoutComplete}
                onRegenerate={handleRegenerateWorkout}
                onManualLog={handleManualLogFromTracker}
                onCancel={() => {
                  setCurrentWorkout(null);
                  setView('home');
                  refreshUserData();
                }}
              />
            </ErrorBoundary>
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
          
          {view === 'templates' && (
            <WorkoutTemplates
              user={user}
              currentWorkout={currentWorkout}
              onStartWorkout={handleWorkoutGenerated}
            />
          )}
          
          {view === 'strength' && (
            <StrengthStandards
              user={user}
            />
          )}
        </Suspense>
      </main>

      {/* Coach Avatar - Shows motivational messages */}
      <CoachAvatar />

      {/* Coach Selector Modal */}
      <AnimatePresence>
        {showCoachSelector && (
          <CoachSelector onClose={() => setShowCoachSelector(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrap AppContent with CoachProvider
function App() {
  return (
    <CoachProvider>
      <AppContent />
    </CoachProvider>
  );
}

export default App;
