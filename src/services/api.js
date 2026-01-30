const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

async function callLiteLLM(messages) {
  console.log('=== SENDING TO AI ===');
  console.log('Messages:', JSON.stringify(messages, null, 2));
  console.log('=====================');
  
  const response = await fetch(`${BACKEND_API_URL}/generate-workout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
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
      content: `You are a fitness coach creating a concise progress summary for your client. Review their workout history and conversation, then create a comprehensive summary (150-200 words) covering:
- Initial fitness level and goals
- Key progressions (weight increases, volume changes)
- Exercise preferences and patterns
- Any injuries or limitations mentioned
- Current training phase/focus
- Important notes for future programming

Be specific with numbers (e.g., "squat progressed from 135lbs to 185lbs") but keep it concise.`
    },
    {
      role: 'user',
      content: `Client: ${user.name}

Initial Information:
${user.initialPrompt}

Completed ${user.workouts.length} workouts since ${new Date(user.createdAt).toLocaleDateString()}.

Recent conversation history:
${JSON.stringify(user.conversationHistory, null, 2)}

Create a comprehensive progress summary.`
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

export async function generateWorkout(user, preferences) {
  // Build conversation history
  const messages = [
    {
      role: 'system',
      content: `You are an expert personal fitness coach. You're working with a client and building a personalized training program based on their progress over time.

CRITICAL: Return ONLY a valid JSON object (no markdown, no code blocks, no extra text):
{
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": [
        {"weight": 0, "reps": 0, "completed": false},
        {"weight": 0, "reps": 0, "completed": false}
      ]
    }
  ],
  "summary": "Brief explanation of today's workout focus and reasoning"
}

Focus on progressive overload, proper recovery, and personalized recommendations based on their history.`
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
  let currentRequest = 'Generate today\'s workout.';
  if (preferences.focus || preferences.equipment || preferences.notes) {
    currentRequest += '\n\nToday\'s preferences:';
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
    
    // Validate the structure
    if (!workoutData.exercises || !Array.isArray(workoutData.exercises)) {
      console.error('=== INVALID WORKOUT STRUCTURE ===');
      console.error('Missing or invalid exercises array:', workoutData);
      console.error('==================================');
      throw new Error('AI response missing exercises array');
    }
    
    console.log('=== PARSED WORKOUT DATA ===');
    console.log(JSON.stringify(workoutData, null, 2));
    console.log('===========================');

    return {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      exercises: workoutData.exercises,
      aiSuggestion: workoutData.summary || 'Workout generated',
      generatedAt: new Date().toISOString(),
      aiResponse: response // Store full AI response for conversation history
    };
  } catch (error) {
    console.error('=== ERROR GENERATING WORKOUT ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('================================');
    throw error; // Re-throw with original error message
  }
}

export async function sendWorkoutFeedback(user, completedWorkout) {
  const workoutSummary = {
    date: completedWorkout.date,
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

  // Build messages with conversation history
  const messages = [
    {
      role: 'system',
      content: 'You are an expert personal fitness coach analyzing your client\'s workout performance. Provide brief, motivating feedback (2-3 sentences) and note any important observations for future planning.'
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

