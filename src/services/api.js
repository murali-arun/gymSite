const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
const API_SECRET = import.meta.env.VITE_API_SECRET || '';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (API_SECRET) {
    headers['X-API-Key'] = API_SECRET;
  }
  return headers;
};

async function callLiteLLM(messages) {
  console.log('=== SENDING TO AI ===');
  console.log('Messages:', JSON.stringify(messages, null, 2));
  console.log('=====================');
  
  const response = await fetch(`${BACKEND_API_URL}/generate-workout`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  console.log('=== FULL API RESPONSE ===');
  console.log(JSON.stringify(data, null, 2));
  console.log('=========================');
  
  return data.choices[0].message.content;
}

export async function generateProgressSummary(user) {
  console.log('=== GENERATING PROGRESS SUMMARY ===');
  
  const messages = [
    {
      role: 'system',
      content: `You are an expert personal trainer creating a comprehensive progress summary for your client's training file.

This summary will be used to inform future workout programming, so be thorough and specific. Include:

CLIENT PROFILE:
- Initial fitness level and starting point
- Primary goals (strength, muscle gain, fat loss, endurance, athletic performance)
- Any injuries, limitations, or special considerations

TRAINING PROGRESS:
- Key strength gains with specific numbers (e.g., "Bench press: 135lbs → 185lbs")
- Volume progression (sets/reps increased over time)
- Cardio improvements (pace, distance, endurance gains)
- Mobility/flexibility progress if applicable

PATTERNS & PREFERENCES:
- Preferred exercises and training styles
- Equipment typically available
- Workout frequency and consistency
- Response to different training intensities

CURRENT STATUS:
- Present training phase (building strength, cutting, maintenance)
- Recent performance trends (improving, plateauing, regressing)
- Recovery status and any fatigue indicators
- Next steps and recommendations

IMPORTANT NOTES:
- Form issues or technique to work on
- Exercises to avoid or modify
- Optimal rep ranges and intensities for this client
- Mental/motivational factors

Target length: 150-250 words. Be specific with data points but keep it actionable for programming decisions.`
    },
    {
      role: 'user',
      content: `Client: ${user.name}

Initial Information:
${user.initialPrompt}

Training History: Completed ${user.workouts.length} workouts since ${new Date(user.createdAt).toLocaleDateString()}.

Full Conversation History (includes all workouts, feedback, and interactions):
${JSON.stringify(user.conversationHistory, null, 2)}

Create a comprehensive progress summary that I can use to program their next workouts effectively.`
    }
  ];

  try {
    const summary = await callLiteLLM(messages);
    console.log('=== PROGRESS SUMMARY CREATED ===');
    console.log(summary);
    console.log('================================');
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

export async function generateWorkout(user, preferences, coachPersonality = 'iron') {
  // Coach personality profiles
  const coachVoices = {
    iron: "You are Coach Iron - a tough-love, no-nonsense strength coach. Keep responses short, powerful, and direct. Use motivating but intense language. Phrases like 'Let's crush this' and 'No excuses' are your style.",
    zen: "You are Coach Zen - a calm, mindful fitness guide. Focus on proper form, breathing, and the mind-muscle connection. Use gentle, encouraging language. Phrases like 'Feel the movement' and 'Progress, not perfection' reflect your approach.",
    blaze: "You are Coach Blaze - a high-energy, enthusiastic hype coach! Use ALL CAPS for excitement, lots of exclamation points! Celebrate everything! Your energy is CONTAGIOUS! LET'S GO!",
    sage: "You are Coach Sage - a wise, analytical programming expert. Use data-driven insights and scientific principles. Keep explanations precise and thoughtful. Phrases like 'Let's optimize this' show your strategic mind."
  };

  // Build conversation history
  const messages = [
    {
      role: 'system',
      content: `${coachVoices[coachPersonality] || coachVoices.iron}

You are an expert personal trainer with 10+ years of experience helping clients achieve their fitness goals. You understand:

TRAINING PRINCIPLES:
- Progressive Overload: Gradually increase weight, reps, or volume over time
- Specificity: Train movements and energy systems specific to client's goals
- Recovery: Balance training stress with adequate rest (avoid overtraining)
- Individual Differences: Adapt to client's experience level, limitations, and preferences
- Periodization: Vary intensity and volume to prevent plateaus and optimize adaptation

GOAL-SPECIFIC PROGRAMMING:
- Strength: Lower reps (3-6), heavier weight, longer rest (2-5 min), compound movements
- Hypertrophy/Muscle Building: Moderate reps (8-12), moderate weight, shorter rest (60-90s), volume emphasis
- Endurance: Higher reps (15+), lighter weight, minimal rest, or steady-state cardio
- Fat Loss: Circuit training, HIIT cardio, metabolic conditioning, caloric expenditure focus
- Athletic Performance: Power development, explosive movements, sport-specific training
- Mobility/Recovery: Dynamic stretching, foam rolling, yoga, low-intensity movement

EXERCISE SELECTION RULES:
- Start with compound movements (squat, deadlift, press, pull) before isolation exercises
- Balance push/pull movements to prevent muscular imbalances
- Include unilateral work (single-leg/arm) for stability and symmetry
- Consider client's injury history and movement limitations
- Vary exercises every 3-4 weeks to prevent adaptation and boredom
- Match equipment availability to what client actually has access to

VOLUME & INTENSITY MANAGEMENT:
- Beginners: 2-3 sets per exercise, focus on learning form, moderate intensity
- Intermediate: 3-4 sets, progressive overload on compound lifts, higher volume
- Advanced: 4-6 sets, periodized programming, auto-regulation based on performance
- Monitor fatigue: If client struggling or recovering poorly, reduce volume/intensity
- Deload every 4-6 weeks: Reduce volume by 40-50% for recovery

CARDIO PROGRAMMING:
- Steady-State: 30-60 min at 60-70% max HR for endurance and fat oxidation
- HIIT: Short bursts (20-60s) at 85-95% max HR with equal/longer rest periods
- LISS (Low Intensity): Walking, easy cycling for active recovery
- Running: Build mileage gradually (10% per week), include easy runs and tempo work
- Consider joint impact: Overweight clients may benefit from cycling/swimming over running

SAFETY & FORM:
- Always emphasize proper form over heavy weight
- Include proper warm-up (5-10 min light cardio + dynamic stretching)
- Cue breathing: Exhale on exertion, inhale on eccentric
- Watch for red flags: Sharp pain, dizziness, extreme fatigue = stop immediately
- Modify exercises for injuries or limitations

TRACKING & ADAPTATION:
- Review client's workout history to identify patterns and progress
- If weights haven't increased in 2-3 weeks, adjust programming
- If client consistently fails sets, may be too aggressive - scale back
- If client reports excessive soreness/fatigue, incorporate more recovery
- Celebrate PRs and milestones to maintain motivation

IMPORTANT: The client can request different types of workouts:
- STRENGTH TRAINING: Traditional gym exercises with sets/reps/weight
- CARDIO: Running, walking, cycling, swimming, rowing, etc.
- STRETCHING: Flexibility, mobility work, yoga, foam rolling
- MIXED: Combination workouts (e.g., circuit training, CrossFit-style)

CRITICAL: Return ONLY a valid JSON object (no markdown, no code blocks, no extra text):

For STRENGTH workouts:
{
  "type": "strength",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": [
        {"weight": 0, "reps": 0, "completed": false},
        {"weight": 0, "reps": 0, "completed": false}
      ]
    }
  ],
  "summary": "Brief explanation IN YOUR COACHING VOICE"
}

For CARDIO workouts:
{
  "type": "cardio",
  "activity": "Running/Walking/Cycling/etc",
  "duration": 30,
  "distance": 3.5,
  "intensity": "moderate/easy/hard",
  "intervals": [{"type": "warmup", "duration": 5}, {"type": "work", "duration": 20}, {"type": "cooldown", "duration": 5}],
  "summary": "Brief explanation IN YOUR COACHING VOICE"
}

For STRETCHING workouts:
{
  "type": "stretching",
  "exercises": [
    {"name": "Stretch Name", "duration": 60, "sets": 2}
  ],
  "summary": "Brief explanation IN YOUR COACHING VOICE"
}

For MIXED workouts, combine elements appropriately.

PROGRAMMING REMINDERS:
- Check client's recent workouts for progressive overload opportunities
- If they hit same weight/reps last session, suggest small increase (2.5-5 lbs or 1-2 reps)
- After intense session, consider lighter "recovery" day or different muscle group
- Match workout to client's stated goals (strength, size, endurance, fat loss)
- Provide specific, actionable programming - no vague exercises
- In summary, briefly explain WHY you chose this workout based on their history/goals
- Keep summary concise (2-3 sentences) but personalized to their journey

Make the summary match your coaching personality while being genuinely helpful!`
    }
  ];

  // Add initial user context OR progress summary if available
  if (user.progressSummary) {
    messages.push({
      role: 'user',
      content: `I'm your client. Here's my progress summary:\n\n${user.progressSummary}`
    });
  } else {
    messages.push({
      role: 'user',
      content: `I'm your new client. Here's my information:\n\n${user.initialPrompt}`
    });
  }

  messages.push({
    role: 'assistant',
    content: user.progressSummary 
      ? 'Got it! I have your full progress history. Let\'s continue building on your gains.'
      : 'Perfect! I understand your background and goals. I\'ll create personalized workouts that progress with you over time.'
  });

  // Add recent conversation history (last 3 exchanges = 6 messages)
  const recentHistory = user.conversationHistory.slice(-6);
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });

  // Add current request
  let currentRequest = `Generate today's workout.\n\nActivity Type: ${preferences.activityType || 'strength'}`;
  if (preferences.focus || preferences.equipment || preferences.notes) {
    currentRequest += '\n\nAdditional preferences:';
    if (preferences.focus) currentRequest += `\n- Focus: ${preferences.focus}`;
    if (preferences.equipment) currentRequest += `\n- Equipment: ${preferences.equipment}`;
    if (preferences.notes) currentRequest += `\n- Notes: ${preferences.notes}`;
  }

  messages.push({
    role: 'user',
    content: currentRequest
  });

  try {
    const response = await callLiteLLM(messages);
    
    console.log('=== RAW AI RESPONSE ===');
    console.log(response);
    console.log('======================');

    // Clean up response - remove markdown code blocks if present
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '');
    }
    
    // Remove any trailing commas before closing braces/brackets (common JSON error)
    cleanResponse = cleanResponse.replace(/,(\s*[}\]])/g, '$1');
    
    console.log('=== CLEANED RESPONSE ===');
    console.log(cleanResponse);
    console.log('========================');

    let workoutData;
    try {
      workoutData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('=== JSON PARSE ERROR ===');
      console.error('Parse error:', parseError);
      console.error('Attempted to parse:', cleanResponse);
      console.error('========================');
      throw new Error(`Invalid JSON from AI: ${parseError.message}`);
    }
    
    // Validate the structure based on workout type
    const workoutType = workoutData.type || 'strength';
    
    if (workoutType === 'strength' || workoutType === 'mixed') {
      if (!workoutData.exercises || !Array.isArray(workoutData.exercises)) {
        console.error('=== INVALID WORKOUT STRUCTURE ===');
        console.error('Missing or invalid exercises array:', workoutData);
        console.error('==================================');
        throw new Error('AI response missing exercises array');
      }
    }
    
    console.log('=== PARSED WORKOUT DATA ===');
    console.log(JSON.stringify(workoutData, null, 2));
    console.log('===========================');

    // Return workout with appropriate structure
    const baseWorkout = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: workoutType,
      aiSuggestion: workoutData.summary || 'Workout generated',
      generatedAt: new Date().toISOString(),
      aiResponse: response // Store full AI response for conversation history
    };

    // Add type-specific data
    if (workoutType === 'strength') {
      baseWorkout.exercises = workoutData.exercises;
    } else if (workoutType === 'cardio') {
      baseWorkout.cardio = {
        activity: workoutData.activity,
        duration: workoutData.duration,
        distance: workoutData.distance,
        intensity: workoutData.intensity,
        intervals: workoutData.intervals || []
      };
    } else if (workoutType === 'stretching') {
      baseWorkout.exercises = workoutData.exercises; // stretching exercises with duration
    } else if (workoutType === 'mixed') {
      baseWorkout.exercises = workoutData.exercises || [];
      if (workoutData.cardio) {
        baseWorkout.cardio = workoutData.cardio;
      }
    }

    return baseWorkout;
  } catch (error) {
    console.error('=== ERROR GENERATING WORKOUT ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('================================');
    throw error; // Re-throw with original error message
  }
}

export async function sendWorkoutFeedback(user, completedWorkout) {
  let workoutSummary;
  
  if (completedWorkout.type === 'cardio') {
    // Cardio workout summary
    const cardio = completedWorkout.cardio;
    workoutSummary = {
      date: completedWorkout.date,
      type: 'cardio',
      cardio: {
        activity: cardio.activity,
        duration: `${cardio.duration} minutes`,
        distance: cardio.distance ? `${cardio.distance} miles` : 'N/A',
        intensity: cardio.intensity,
        notes: cardio.notes || 'None',
        pace: cardio.distance && cardio.duration 
          ? `${(parseFloat(cardio.duration) / parseFloat(cardio.distance)).toFixed(1)} min/mile`
          : 'N/A'
      }
    };
  } else {
    // Strength workout summary
    workoutSummary = {
      date: completedWorkout.date,
      type: 'strength',
      exercises: completedWorkout.exercises.map(e => ({
        name: e.name,
        completedSets: e.sets.filter(s => s.completed).length,
        totalSets: e.sets.length,
        sets: e.sets.filter(s => s.completed).map(s => ({
          weight: s.weight,
          reps: s.reps
        }))
      }))
    };
  }

  // Build messages with conversation history
  const messages = [
    {
      role: 'system',
      content: `You are an expert personal trainer providing post-workout feedback. Analyze the client's performance professionally.

FEEDBACK GUIDELINES:
- Acknowledge their effort and specific accomplishments (e.g., "Great work hitting 3x8 on squats at 185lbs")
- Identify progressive overload opportunities (e.g., "Next time, try adding 5lbs" or "Aim for 9 reps on the first set")
- Note any concerns (incomplete sets, form issues if mentioned, excessive fatigue)
- Consider recovery needs (if high volume/intensity, suggest lighter next session)
- Connect to their goals (strength, hypertrophy, endurance, fat loss)
- Be genuinely motivating but realistic - celebrate wins, address struggles constructively
- For cardio: Comment on pace, distance, consistency; suggest progression (longer duration, faster pace, intervals)
- For strength: Focus on progressive overload, volume, and exercise selection

Keep feedback concise (2-4 sentences) but personalized and actionable.`
    }
  ];

  // Add user context
  messages.push({
    role: 'user',
    content: `Client info: ${user.initialPrompt}`
  });

  // Add recent conversation history
  const recentHistory = user.conversationHistory.slice(-6);
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });

  // Add workout completion
  messages.push({
    role: 'user',
    content: `I just completed this workout:\n${JSON.stringify(workoutSummary, null, 2)}\n\nGive me brief feedback and note anything important for future workouts.`
  });

  try {
    const feedback = await callLiteLLM(messages);
    
    console.log('=== AI FEEDBACK ===');
    console.log(feedback);
    console.log('===================');
    
    return feedback;
  } catch (error) {
    console.error('=== ERROR GETTING FEEDBACK ===');
    console.error(error);
    console.error('===============================');
    return 'Great work completing your workout! Keep up the consistency.';
  }
}

