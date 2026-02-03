import React, { useState, memo, useCallback } from 'react';
import { generateWorkout } from '../../../services/api';
import { setCurrentWorkout, addConversationMessage } from '../../../utils/storage';
import { useCoach } from '../../../contexts/CoachContext';
import { Container, Section, InfoBox, Grid, Stack } from '../../organisms';
import { FormField } from '../../molecules';
import { Button } from '../../atoms';

const WorkoutGenerator = memo(function WorkoutGenerator({ user, onWorkoutGenerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState({
    focus: '',
    equipment: '',
    notes: ''
  });
  const { coachType, motivate } = useCoach();

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const workout = await generateWorkout(user, preferences, coachType);
      
      // Save to user's current workout
      await setCurrentWorkout(user.id, workout);
      
      // Add to conversation history
      let userMessage = 'Generate today\'s workout.';
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
      <Container variant="default" padding="lg">
        <Section 
          title="Ready to Train?" 
          description="Let AI suggest your workout for today"
          icon="🏋️"
        />

        <Stack spacing="md" className="mt-6">
          <FormField
            label="Focus Area (optional)"
            placeholder="e.g., chest, legs, back, full body"
            value={preferences.focus}
            onChange={(e) => setPreferences({ ...preferences, focus: e.target.value })}
          />

          <FormField
            label="Available Equipment (optional)"
            placeholder="e.g., dumbbells, barbell, machines"
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
              '🎯 Generate Today\'s Workout'
            )}
          </Button>
        </div>
      </Container>

      {/* Stats Card */}
      {user.workouts.length > 0 && (
        <Container variant="default" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
          <Grid cols={2} gap="md">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400">{user.workouts.length}</div>
              <div className="text-sm text-gray-400">Total Workouts</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400">
                {user.workouts[0]?.date === new Date().toISOString().split('T')[0] ? '✓' : '-'}
              </div>
              <div className="text-sm text-gray-400">Today's Status</div>
            </div>
          </Grid>
        </Container>
      )}
    </Stack>
  );
});

export default WorkoutGenerator;
