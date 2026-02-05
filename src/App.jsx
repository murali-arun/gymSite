import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { UserSelection } from './components/features/user';
import { CoachAvatar, CoachSelector } from './components/features/coach';
import { CoachProvider } from './contexts/CoachContext';
import { getUser, getActiveUserId, setActiveUserId, addWorkout, addConversationMessage } from './utils/storage';
import { AnimatePresence } from 'framer-motion';

// Lazy load heavy components for better initial load performance
const WorkoutGenerator = lazy(() => import('./components/features/workout/WorkoutGenerator'));
const ExerciseTracker = lazy(() => import('./components/features/workout/ExerciseTracker'));
const History = lazy(() => import('./components/features/workout/History'));
const ManualWorkoutLog = lazy(() => import('./components/features/workout/ManualWorkoutLog'));
const Progress = lazy(() => import('./components/features/progress/Progress'));
const ProgressDashboard = lazy(() => import('./components/features/progress/ProgressDashboard'));
const Achievements = lazy(() => import('./components/features/progress/Achievements'));

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
  const [view, setView] = useState('home'); // home, tracker, history, progress, achievements, dashboard, manualLog
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [showCoachSelector, setShowCoachSelector] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
      
      // Refresh user data and return to home
      await refreshUserData();
      setView('home');
      
      alert('✓ Workout logged successfully with AI feedback!');
    } catch (error) {
      console.error('Error saving manual workout:', error);
      alert('Failed to save workout. Please try again.');
    }
  }, [activeUserId, user]);

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
            <div className="hidden lg:flex gap-2">
              <button
                onClick={() => setView('home')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  view === 'home'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                    : 'glass-strong hover:bg-white/15 text-gray-300'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  view === 'dashboard'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                    : 'glass-strong hover:bg-white/15 text-gray-300'
                }`}
              >
                📊 Stats
              </button>
              <button
                onClick={() => setShowCoachSelector(true)}
                className="px-4 py-2 rounded-lg font-medium glass-strong hover:bg-white/15 text-accent-purple transition-all duration-300 hover:scale-105"
                title="Choose Your Coach"
              >
                🎯 Coach
              </button>
              <button
                onClick={() => setView('achievements')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  view === 'achievements'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                    : 'glass-strong hover:bg-white/15 text-gray-300'
                }`}
              >
                🏆 Badges
              </button>
              <button
                onClick={() => setView('progress')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  view === 'progress'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                    : 'glass-strong hover:bg-white/15 text-gray-300'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  view === 'history'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                    : 'glass-strong hover:bg-white/15 text-gray-300'
                }`}
              >
                History
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium glass-strong hover:bg-white/15 text-gray-300 transition-all duration-300 hover:text-white"
              >
                Switch
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg glass-strong hover:bg-white/15 text-gray-300 transition-all duration-300"
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
              <div className="lg:hidden mt-4 space-y-2 animate-fade-in">
                <button
                  onClick={() => { setView('home'); setShowMobileMenu(false); }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 text-left ${
                    view === 'home'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                      : 'glass-strong hover:bg-white/15 text-gray-300'
                  }`}
                >
                  🏠 Home
                </button>
                <button
                  onClick={() => { setView('dashboard'); setShowMobileMenu(false); }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 text-left ${
                    view === 'dashboard'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                      : 'glass-strong hover:bg-white/15 text-gray-300'
                  }`}
                >
                  📊 Stats
                </button>
                <button
                  onClick={() => { setShowCoachSelector(true); setShowMobileMenu(false); }}
                  className="w-full px-4 py-3 rounded-lg font-medium glass-strong hover:bg-white/15 text-accent-purple transition-all duration-300 text-left"
                >
                  🎯 Coach
                </button>
                <button
                  onClick={() => { setView('achievements'); setShowMobileMenu(false); }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 text-left ${
                    view === 'achievements'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                      : 'glass-strong hover:bg-white/15 text-gray-300'
                  }`}
                >
                  🏆 Badges
                </button>
                <button
                  onClick={() => { setView('progress'); setShowMobileMenu(false); }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 text-left ${
                    view === 'progress'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                      : 'glass-strong hover:bg-white/15 text-gray-300'
                  }`}
                >
                  📈 Progress
                </button>
                <button
                  onClick={() => { setView('history'); setShowMobileMenu(false); }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 text-left ${
                    view === 'history'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                      : 'glass-strong hover:bg-white/15 text-gray-300'
                  }`}
                >
                  📜 History
                </button>
                <button
                  onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                  className="w-full px-4 py-3 rounded-lg font-medium glass-strong hover:bg-white/15 text-gray-300 transition-all duration-300 hover:text-white text-left"
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
              <WorkoutGenerator
                user={user}
                onWorkoutGenerated={handleWorkoutGenerated}
              />
              
              {/* Manual Workout Log Button */}
              <div className="mt-6">
                <button
                  onClick={() => setView('manualLog')}
                  className="w-full px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all border-2 border-gray-600 hover:border-gray-500"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📝</span>
                    <div className="text-left">
                      <div>Log External Workout</div>
                      <div className="text-sm text-gray-400 font-normal">Track workouts you did outside the app</div>
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
              onCancel={() => setView('home')}
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
