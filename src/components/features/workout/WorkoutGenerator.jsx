import React, { useState, memo, useCallback, useEffect } from 'react';
import { generateWorkout, generateWorkoutPlan } from '../../../services/api';
import { setCurrentWorkout, addConversationMessage } from '../../../utils/storage';
import { getWorkoutPlan, setWorkoutPlan, getNextWorkoutFromPlan, getRemainingWorkoutsCount } from '../../../utils/workoutPlanCache';
import { useCoach } from '../../../contexts/CoachContext';
import { Container, Section, InfoBox, Grid, Stack } from '../../organisms';
import { FormField } from '../../molecules';
import { Button } from '../../atoms';

const WorkoutGenerator = memo(function WorkoutGenerator({ user, onWorkoutGenerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remainingWorkouts, setRemainingWorkouts] = useState(0);
  const [preferences, setPreferences] = useState({
    activityType: 'strength', // strength, cardio, stretching, mixed
    focus: '',
    equipment: '',
    notes: ''
  });
  const { coachType, motivate } = useCoach();

  useEffect(() => {
    // Check for cached workout plan
    async function checkPlan() {
      const count = await getRemainingWorkoutsCount(user.id);
      setRemainingWorkouts(count);
    }
    checkPlan();
  }, [user.id]);

  const handleGeneratePlan = useCallback(async (daysCount = 3) => {
    setLoading(true);
    setError(null);

    try {
      const plan = await generateWorkoutPlan(user, daysCount, coachType);
      
      // Add scheduled dates to workouts
      const today = new Date();
      plan.workouts = plan.workouts.map((workout, index) => {
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + index);
        return {
          ...workout,
          scheduledDate: scheduledDate.toISOString().split('T')[0],
          used: false
        };
      });
      
      // Save plan to cache
      await setWorkoutPlan(user.id, plan);
      
      // Add to conversation
      await addConversationMessage(user.id, 'user', `Generate a ${daysCount}-day workout plan`);
      await addConversationMessage(user.id, 'assistant', plan.planSummary || `Created ${daysCount}-day plan`);
      
      // Load first workout
      const firstWorkout = plan.workouts[0];
      const workout = {
        id: Date.now(),
        date: firstWorkout.scheduledDate,
        type: firstWorkout.type,
        exercises: firstWorkout.exercises || [],
        cardio: firstWorkout.cardio,
        aiSuggestion: firstWorkout.notes || plan.planSummary,
        aiResponse: `Day 1: ${firstWorkout.title}`,
        generatedAt: new Date().toISOString(),
        fromPlan: true,
        planDay: 1
      };
      
      await setCurrentWorkout(user.id, workout);
      setRemainingWorkouts(daysCount - 1);
      motivate('workoutGenerated');
      onWorkoutGenerated(workout);
      
    } catch (err) {
      setError(err.message || 'Failed to generate workout plan');
    } finally {
      setLoading(false);
    }
  }, [user, coachType, motivate, onWorkoutGenerated]);

  const handleUseNextFromPlan = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextWorkout = await getNextWorkoutFromPlan(user.id);
      
      if (!nextWorkout) {
        setError('No workouts left in plan. Generate a new plan.');
        setRemainingWorkouts(0);
        setLoading(false);
        return;
      }

      const workout = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: nextWorkout.type,
        exercises: nextWorkout.exercises || [],
        cardio: nextWorkout.cardio,
        aiSuggestion: nextWorkout.notes || nextWorkout.title,
        aiResponse: `Day ${nextWorkout.dayNumber}: ${nextWorkout.title}`,
        generatedAt: new Date().toISOString(),
        fromPlan: true,
        planDay: nextWorkout.dayNumber
      };
      
      await setCurrentWorkout(user.id, workout);
      const count = await getRemainingWorkoutsCount(user.id);
      setRemainingWorkouts(count - 1);
      motivate('workoutGenerated');
      onWorkoutGenerated(workout);
      
    } catch (err) {
      setError(err.message || 'Failed to load workout from plan');
    } finally {
      setLoading(false);
    }
  }, [user.id, motivate, onWorkoutGenerated]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const workout = await generateWorkout(user, preferences, coachType);
      
      // Save to user's current workout
      await setCurrentWorkout(user.id, workout);
      
      // Add to conversation history
      let userMessage = `Generate today's workout (${preferences.activityType}).`;
      if (preferences.focus || preferences.equipment || preferences.notes) {
        userMessage += ' Preferences:';
        if (preferences.focus) userMessage += ` Focus: ${preferences.focus}.`;
        if (preferences.equipment) userMessage += ` Equipment: ${preferences.equipment}.`;
        if (preferences.notes) userMessage += ` Notes: ${preferences.notes}.`;
      }
      await addConversationMessage(user.id, 'user', userMessage);
      await addConversationMessage(user.id, 'assistant', workout.aiResponse);
      
      // Show coach motivation
      motivate('workoutGenerated');
      
      onWorkoutGenerated(workout);
    } catch (err) {
      setError(err.message || 'Failed to generate workout. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, preferences, coachType, motivate, onWorkoutGenerated]);

  return (
    <Stack spacing="lg">
      {/* Cached Plan Info */}
      {remainingWorkouts > 0 && (
        <Container variant="default" padding="md">
          <div className="glass-strong rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-green-400 font-semibold">📅 Workout Plan Active</div>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">FREE</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {remainingWorkouts} workouts remaining • Saving ~${(remainingWorkouts * 1.25).toFixed(2)}
                </div>
              </div>
              <Button
                onClick={handleUseNextFromPlan}
                disabled={loading}
                variant="primary"
                size="sm"
              >
                Use Next Workout
              </Button>
            </div>
          </div>
        </Container>
      )}

      <Container variant="default" padding="lg">
        <Section 
          title="Ready to Train?" 
          description="Generate a single workout or multi-day plan"
          icon="🏋️"
        />

        {remainingWorkouts === 0 && (
          <div className="mt-6 mb-6">
            <div className="glass rounded-xl p-5 border border-primary-500/30">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">Save Time & Money with Multi-Day Plans</h4>
                  <p className="text-sm text-gray-400">Generate 3-7 days of workouts at once. Workouts are varied, progressive, and cached locally.</p>
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <div className="text-gray-500">
                      Single workout: <span className="text-white font-semibold">~$1.25</span>
                    </div>
                    <div className="text-green-400">
                      7-day plan: <span className="text-white font-semibold">~$2.00</span> (save 77%)
                    </div>
                  </div>
                </div>
              </div>
              <Grid cols={3} gap="sm">
                <div>
                  <Button
                    onClick={() => handleGeneratePlan(3)}
                    disabled={loading}
                    variant="secondary"
                    size="sm"
                    fullWidth
                  >
                    {loading ? '...' : '3 Days'}
                  </Button>
                  <div className="text-center text-xs text-gray-500 mt-1">~$1.50</div>
                </div>
                <div>
                  <Button
                    onClick={() => handleGeneratePlan(5)}
                    disabled={loading}
                    variant="secondary"
                    size="sm"
                    fullWidth
                  >
                    {loading ? '...' : '5 Days'}
                  </Button>
                  <div className="text-center text-xs text-gray-500 mt-1">~$1.75</div>
                </div>
                <div>
                  <Button
                    onClick={() => handleGeneratePlan(7)}
                    disabled={loading}
                    variant="secondary"
                    size="sm"
                    fullWidth
                  >
                    {loading ? '...' : '7 Days'}
                  </Button>
                  <div className="text-center text-xs text-green-400 mt-1 font-semibold">~$2.00 ✨</div>
                </div>
              </Grid>
            </div>
          </div>
        )}

        <div className="mt-6 mb-4 text-center text-sm text-gray-500">
          Or generate a single workout for today
        </div>

        <Stack spacing="md" className="mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Activity Type
            </label>
            <select
              value={preferences.activityType}
              onChange={(e) => setPreferences({ ...preferences, activityType: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="strength">💪 Strength Training</option>
              <option value="cardio">🏃 Cardio (Running, Walking, Cycling)</option>
              <option value="stretching">🧘 Stretching & Flexibility</option>
              <option value="mixed">🔀 Mixed Training</option>
            </select>
          </div>

          <FormField
            label="Focus Area (optional)"
            placeholder={preferences.activityType === 'cardio' ? 'e.g., endurance, speed, hills' : preferences.activityType === 'stretching' ? 'e.g., lower body, full body' : 'e.g., chest, legs, back, full body'}
            value={preferences.focus}
            onChange={(e) => setPreferences({ ...preferences, focus: e.target.value })}
          />

          <FormField
            label="Available Equipment (optional)"
            placeholder={preferences.activityType === 'cardio' ? 'e.g., treadmill, outdoor, bike' : preferences.activityType === 'stretching' ? 'e.g., yoga mat, foam roller' : 'e.g., dumbbells, barbell, machines'}
            value={preferences.equipment}
            onChange={(e) => setPreferences({ ...preferences, equipment: e.target.value })}
          />

          <FormField
            label="Additional Notes (optional)"
            placeholder="e.g., feeling tired, want intense workout"
            value={preferences.notes}
            onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
            multiline
            rows={3}
          />
        </Stack>

        {error && (
          <InfoBox variant="error" className="mt-4">
            {error}
          </InfoBox>
        )}

        <div className="mt-6">
          <Button
            onClick={handleGenerate}
            disabled={loading}
            variant="primary"
            fullWidth
            size="lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🎯 Generate Today's Workout</span>
                <span className="text-xs opacity-70">(~$1.25)</span>
              </span>
            )}
          </Button>
        </div>
      </Container>

      {/* Stats Card */}
      {user.workouts.length > 0 && (
        <Container variant="default" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">📊 Your Progress</h3>
          <Grid cols={3} gap="md">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent"></div>
              <div className="relative">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">{user.workouts.length}</div>
                <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">Total Workouts</div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-gradient-to-br from-green-900/40 to-green-800/20 backdrop-blur-sm rounded-2xl p-4 border border-green-500/30 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent"></div>
              <div className="relative">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                  {user.workouts[0]?.date === new Date().toISOString().split('T')[0] ? '✓' : '-'}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">Today's Status</div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/30 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent"></div>
              <div className="relative">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-2xl font-bold">💰</span>
                  <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Savings</div>
                </div>
                <div className="text-xs text-gray-400">
                  {remainingWorkouts > 0 
                    ? `$${(remainingWorkouts * 1.25).toFixed(2)} saved`
                    : 'Use multi-day plans'}
                </div>
              </div>
            </div>
          </Grid>
        </Container>
      )}
    </Stack>
  );
});

export default WorkoutGenerator;
