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

async function callLiteLLM(messages, taskType = 'workout') {
  console.log('=== SENDING TO AI ===');
  console.log('Task Type:', taskType);
  console.log('Messages:', JSON.stringify(messages, null, 2));
  console.log('=====================');
  
  const response = await fetch(`${BACKEND_API_URL}/generate-workout`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ messages, taskType })
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

async function validateWorkout(workoutData, activityType) {
  console.log('=== VALIDATING WORKOUT ===');
  
  const validationMessages = [
    {
      role: 'system',
      content: `You are a workout quality validator. Your job is to verify that workout programs are properly structured and safe.

VALIDATION CRITERIA:

For STRENGTH workouts, check:
1. Exercise names are SPECIFIC and REAL (e.g., "Barbell Back Squat" not "Squats" or "Leg Exercise")
2. Each exercise has clear sets (array with at least 1 set)
3. Each set has NUMERIC weight and reps (no zeros unless bodyweight exercise)
4. Rep ranges are realistic (typically 1-30 reps, not 0 or 100+)
5. Weight values are realistic (0-500 lbs for most exercises)
6. Total volume is appropriate (typically 12-25 sets for strength day, not 50+)
7. Exercise selection makes sense (no contradictions like "heavy deadlifts" with weight: 0)
8. "perSide" property exists and is boolean (true for unilateral exercises, false otherwise)

For CARDIO workouts, check:
1. Activity is specific (e.g., "Running" not "Exercise")
2. Duration is numeric and realistic (5-180 minutes typically)
3. Intensity level is specified
4. Distance is either null or a positive number

For STRETCHING workouts, check:
1. Exercise names are specific stretches
2. Duration per stretch is reasonable (15-120 seconds typically)

RESPOND WITH ONLY A JSON OBJECT:
{
  "valid": true/false,
  "issues": ["issue 1", "issue 2"],
  "severity": "critical/minor/none"
}

If valid=true, issues should be empty array.
If valid=false, list ALL specific issues found.
Severity "critical" means regenerate required, "minor" means acceptable with warnings.`
    },
    {
      role: 'user',
      content: `Validate this ${activityType} workout:\n\n${JSON.stringify(workoutData, null, 2)}`
    }
  ];

  try {
    const validationResponse = await callLiteLLM(validationMessages, 'validation');
    
    // Clean response
    let cleanValidation = validationResponse.trim();
    if (cleanValidation.startsWith('```json')) {
      cleanValidation = cleanValidation.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanValidation.startsWith('```')) {
      cleanValidation = cleanValidation.replace(/```\n?/g, '');
    }
    
    const validation = JSON.parse(cleanValidation);
    
    console.log('=== VALIDATION RESULT ===');
    console.log(JSON.stringify(validation, null, 2));
    console.log('=========================');
    
    return validation;
  } catch (error) {
    console.error('Validation error:', error);
    // If validation fails, assume workout is invalid to be safe
    return {
      valid: false,
      issues: ['Validation system error - regenerating for safety'],
      severity: 'critical'
    };
  }
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
    const summary = await callLiteLLM(messages, 'summary');
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
      "perSide": false,
      "recommendedRest": 90,
      "sets": [
        {"weight": 0, "reps": 0, "completed": false},
        {"weight": 0, "reps": 0, "completed": false}
      ]
    }
  ],
  "summary": "Brief explanation IN YOUR COACHING VOICE"
}

RECOMMENDED REST TIMES:
- Heavy compound lifts (squat, deadlift, bench): 120-180 seconds between sets
- Moderate compound lifts (rows, overhead press): 90-120 seconds
- Isolation exercises (curls, lateral raises): 60-90 seconds
- Circuit training or fat loss focus: 30-60 seconds
- Between different exercises: 120 seconds
Include "recommendedRest" (in seconds) for each exercise based on intensity and goals.

IMPORTANT - BILATERAL/UNILATERAL EXERCISES:
Some exercises are performed on each side independently (bilateral/unilateral). Set "perSide": true for these:
- Bulgarian Split Squats (each leg)
- Lunges (each leg)
- Single-Leg Deadlifts (each leg)
- Single-Leg Press (each leg)
- Step-Ups (each leg)
- Pistol Squats (each leg)
- Side Planks (each side)
- Single-Arm Dumbbell Rows (each arm)
- Single-Arm Overhead Press (each arm)
- Single-Arm Cable Exercises (each arm)
- Any exercise with "Single", "Unilateral", or "Each" in the name

When perSide is true, the user will perform the specified reps on EACH side (e.g., 10 reps per leg = 20 total reps).
For time-based exercises (planks), use reps as seconds per side.

EXAMPLE:
{
  "name": "Bulgarian Split Squat",
  "perSide": true,
  "sets": [
    {"weight": 25, "reps": 10, "completed": false}
  ]
}
This means: 10 reps on left leg, then 10 reps on right leg, with 25 lbs.

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

  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastError = null;

  while (attempt < MAX_RETRIES) {
    attempt++;
    console.log(`=== GENERATION ATTEMPT ${attempt}/${MAX_RETRIES} ===`);
    
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
        lastError = new Error(`Invalid JSON from AI: ${parseError.message}`);
        
        // Add feedback to messages for next attempt
        messages.push({
          role: 'assistant',
          content: response
        });
        messages.push({
          role: 'user',
          content: `ERROR: Your response was not valid JSON. Please provide ONLY a valid JSON object with no markdown formatting. Try again.`
        });
        continue; // Retry
      }
      
      // Validate the structure based on workout type
      const workoutType = workoutData.type || 'strength';
      
      if (workoutType === 'strength' || workoutType === 'mixed') {
        if (!workoutData.exercises || !Array.isArray(workoutData.exercises)) {
          console.error('=== INVALID WORKOUT STRUCTURE ===');
          console.error('Missing or invalid exercises array:', workoutData);
          console.error('==================================');
          lastError = new Error('AI response missing exercises array');
          
          messages.push({
            role: 'assistant',
            content: response
          });
          messages.push({
            role: 'user',
            content: `ERROR: Missing or invalid exercises array. Please ensure your JSON includes a valid "exercises" array. Try again.`
          });
          continue; // Retry
        }
      }
      
      console.log('=== PARSED WORKOUT DATA ===');
      console.log(JSON.stringify(workoutData, null, 2));
      console.log('===========================');

      // VALIDATE WORKOUT QUALITY
      const validation = await validateWorkout(workoutData, preferences.activityType || 'strength');
      
      if (!validation.valid && validation.severity === 'critical') {
        console.warn('=== WORKOUT VALIDATION FAILED ===');
        console.warn('Issues:', validation.issues);
        console.warn('=================================');
        lastError = new Error(`Workout quality issues: ${validation.issues.join(', ')}`);
        
        // Provide specific feedback for regeneration
        messages.push({
          role: 'assistant',
          content: response
        });
        messages.push({
          role: 'user',
          content: `QUALITY CHECK FAILED. Issues found:\n${validation.issues.map(issue => `- ${issue}`).join('\n')}\n\nPlease fix these issues and generate a new workout with proper exercise names, realistic weights/reps, and correct structure.`
        });
        continue; // Retry
      }

      if (!validation.valid && validation.severity === 'minor') {
        console.warn('=== MINOR VALIDATION WARNINGS ===');
        console.warn('Issues:', validation.issues);
        console.warn('Proceeding anyway...');
        console.warn('==================================');
      }

      // Validation passed! Return the workout
      console.log('✅ WORKOUT VALIDATED SUCCESSFULLY');

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
      console.error(`=== ERROR ON ATTEMPT ${attempt} ===`);
      console.error('Error:', error);
      console.error('===================================');
      lastError = error;
      
      if (attempt === MAX_RETRIES) {
        break; // Exit loop if max retries reached
      }
      
      // Add generic retry message
      messages.push({
        role: 'user',
        content: `There was an error processing your response. Please try again with a valid, well-structured workout.`
      });
    }
  }

  // All retries exhausted
  console.error('=== ALL RETRIES EXHAUSTED ===');
  console.error('Last error:', lastError);
  console.error('=============================');
  throw lastError || new Error('Failed to generate valid workout after multiple attempts');
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
          reps: s.reps,
          rpe: s.rpe || null,
          rir: s.rir !== null && s.rir !== undefined ? s.rir : null,
          toFailure: s.toFailure || false,
          formBreakdown: s.formBreakdown || false,
          pain: s.pain || false,
          notes: s.notes || ''
        }))
      })),
      preWorkout: completedWorkout.preWorkout || null,
      postWorkout: completedWorkout.postWorkout || null,
      totalDuration: completedWorkout.totalDuration || null
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
- Note any concerns based on set details:
  * RPE (Rate of Perceived Exertion) above 9 consistently may indicate too heavy
  * RIR (Reps in Reserve) of 0 on every set may lead to burnout
  * "toFailure" sets are great occasionally but not sustainable every workout
  * "formBreakdown" indicates weight is too heavy - suggest reducing load
  * "pain" is a red flag - address immediately and suggest rest/assessment
  * Set notes provide valuable context about technique, feeling, etc.
- Consider pre-workout state (energy, sleep, stress, soreness) when evaluating performance
- Use post-workout feedback (difficulty rating, feeling, predicted soreness) to gauge if programming is appropriate
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
    const feedback = await callLiteLLM(messages, 'feedback');
    
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

export async function generateWorkoutPlan(user, daysCount = 3, coachPersonality = 'iron') {
  console.log(`=== GENERATING ${daysCount}-DAY WORKOUT PLAN ===`);
  
  const coachVoices = {
    iron: "You are Coach Iron - a tough-love, no-nonsense strength coach.",
    zen: "You are Coach Zen - a calm, mindful fitness guide.",
    blaze: "You are Coach Blaze - a high-energy, enthusiastic hype coach!",
    sage: "You are Coach Sage - a wise, analytical programming expert."
  };

  const messages = [
    {
      role: 'system',
      content: `${coachVoices[coachPersonality] || coachVoices.iron}

You are creating a ${daysCount}-day workout plan. Generate a structured plan with variety and progression.

MULTI-DAY PLANNING PRINCIPLES:
- Vary muscle groups (don't hit same muscles back-to-back)
- Include mix of strength, cardio, and recovery
- Typical weekly split: Upper body, Lower body, Cardio, Full body, Active recovery
- Progress intensity across days (hard, moderate, easy pattern)
- Similar exercises can repeat but with different rep schemes

RESPONSE FORMAT - Return ONLY valid JSON (no markdown):
{
  "planSummary": "Brief overview of the ${daysCount}-day plan",
  "workouts": [
    {
      "dayNumber": 1,
      "title": "Upper Body Strength",
      "type": "strength",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "perSide": false,
          "recommendedRest": 120,
          "sets": [
            {"weight": 135, "reps": 8, "completed": false},
            {"weight": 135, "reps": 8, "completed": false},
            {"weight": 135, "reps": 8, "completed": false}
          ]
        }
      ],
      "notes": "Focus on form and controlled tempo"
    }
  ]
}

For cardio days:
{
  "dayNumber": 2,
  "title": "Cardio - Running",
  "type": "cardio",
  "cardio": {
    "activity": "Running",
    "duration": 30,
    "distance": 3.0,
    "intensity": "moderate",
    "intervals": []
  },
  "notes": "Keep steady pace"
}

IMPORTANT:
- Each workout must be complete and ready to execute
- Use realistic weights based on user history
- Apply progressive overload from their recent workouts
- Include specific exercise names (not generic)
- Set perSide=true for unilateral exercises
- Include recommendedRest (in seconds) for each strength exercise:
  * Heavy compound: 120-180s
  * Moderate compound: 90-120s
  * Isolation: 60-90s`
    }
  ];

  // Add user context
  if (user.progressSummary) {
    messages.push({
      role: 'user',
      content: `My progress summary:\n\n${user.progressSummary}`
    });
  } else {
    messages.push({
      role: 'user',
      content: `My info:\n\n${user.initialPrompt}`
    });
  }

  // Add recent history
  const recentHistory = user.conversationHistory.slice(-4);
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });

  // Request the plan
  messages.push({
    role: 'user',
    content: `Generate a ${daysCount}-day workout plan for me. I want variety and proper progression. Include a mix of strength and cardio based on my goals.`
  });

  try {
    const response = await callLiteLLM(messages, 'workout');
    
    // Clean response
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '');
    }
    cleanResponse = cleanResponse.replace(/,(\s*[}\]])/g, '$1');
    
    const planData = JSON.parse(cleanResponse);
    
    console.log('=== WORKOUT PLAN GENERATED ===');
    console.log(`Days: ${planData.workouts?.length || 0}`);
    console.log('==============================');
    
    return {
      ...planData,
      createdAt: new Date().toISOString(),
      userId: user.id
    };
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
}
