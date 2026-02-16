import React, { useState, useEffect, useRef } from 'react';
import { useCoach } from '../../../contexts/CoachContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrainerChat({ user, onRefresh }) {
  const { coach } = useCoach();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  useEffect(() => {
    loadChatHistory();
  }, [user]);

  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      // Get conversation history from user data
      const chatHistory = user?.conversationHistory || [];
      
      // If no history, add a welcome message from the trainer
      if (chatHistory.length === 0) {
        const welcomeMessage = {
          role: 'assistant',
          content: getWelcomeMessage(),
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(chatHistory);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const welcomes = {
      iron: `Hey ${user.name}! Coach Iron here. Ready to talk about your training? I'm here to push you, guide you, and make sure you're crushing your goals. What's on your mind?`,
      zen: `Welcome, ${user.name}. I'm Coach Zen. Let's have a mindful conversation about your fitness journey. How are you feeling today? What would you like to discuss?`,
      blaze: `YO ${user.name}! Coach Blaze in the house! 🔥 Let's TALK about your fitness journey! What are you working on? What gets you PUMPED? Let's GO!`,
      sage: `Greetings, ${user.name}. I'm Coach Sage. I'm here to share knowledge and guide your training with wisdom. What questions do you have about your fitness journey?`
    };
    return welcomes[coach.name.toLowerCase().replace('coach ', '')] || welcomes.iron;
  };

  // Build comprehensive user context
  const buildUserContext = () => {
    const workouts = user.workouts || [];
    const totalWorkouts = workouts.length;
    const recentWorkouts = workouts.slice(0, 5); // Most recent 5
    const commonExercises = getCommonExercises(workouts);
    
    // Calculate workout frequency
    const daysSinceStart = Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    const workoutsPerWeek = daysSinceStart > 0 ? ((totalWorkouts / daysSinceStart) * 7).toFixed(1) : 0;
    
    // Get last workout info
    const lastWorkout = workouts[0];
    const lastWorkoutDate = lastWorkout ? new Date(lastWorkout.completedAt || lastWorkout.date).toLocaleDateString() : 'Never';
    
    // Extract goals from initial prompt and conversation
    const initialPrompt = user.initialPrompt || '';
    const conversationHistory = user.conversationHistory || [];
    
    // Get exercise performance trends
    const exerciseProgress = {};
    workouts.forEach(workout => {
      workout.exercises?.forEach(ex => {
        const name = ex.name || ex.exercise;
        if (name && ex.sets && ex.sets.length > 0) {
          if (!exerciseProgress[name]) exerciseProgress[name] = [];
          ex.sets.forEach(set => {
            if (set.weight && set.reps) {
              exerciseProgress[name].push({ weight: set.weight, reps: set.reps, date: workout.completedAt || workout.date });
            }
          });
        }
      });
    });
    
    // Calculate total volume
    let totalVolume = 0;
    workouts.forEach(w => {
      w.exercises?.forEach(ex => {
        ex.sets?.forEach(set => {
          if (set.weight && set.reps) {
            totalVolume += set.weight * set.reps;
          }
        });
      });
    });
    
    return {
      totalWorkouts,
      recentWorkouts,
      commonExercises,
      workoutsPerWeek,
      lastWorkout,
      lastWorkoutDate,
      initialPrompt,
      conversationHistory,
      exerciseProgress,
      totalVolume,
      daysSinceStart,
      userName: user.name
    };
  };

  const getTrainerResponse = async (userMessage) => {
    // Analyze user message and provide contextual responses
    const lowerMessage = userMessage.toLowerCase();
    
    // Get comprehensive user context
    const context = buildUserContext();
    
    // Contextual response based on message content
    if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
      return generateGoalResponse(userMessage, coach, context);
    } else if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('eat')) {
      return generateNutritionResponse(userMessage, coach, context);
    } else if (lowerMessage.includes('tired') || lowerMessage.includes('sore') || lowerMessage.includes('pain')) {
      return generateRecoveryResponse(userMessage, coach, context);
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('improve') || lowerMessage.includes('better')) {
      return generateProgressResponse(userMessage, coach, context);
    } else if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      return generateWorkoutResponse(userMessage, coach, context);
    } else if (lowerMessage.includes('motivat') || lowerMessage.includes('inspire')) {
      return generateMotivationResponse(userMessage, coach, context);
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage.includes('hey')) {
      return generateGreetingResponse(userMessage, coach, context);
    } else if (lowerMessage.includes('thank')) {
      return generateGratitudeResponse(coach);
    } else if (lowerMessage.includes('help') || lowerMessage.includes('?')) {
      return generateHelpResponse(userMessage, coach, context);
    } else if (lowerMessage.includes('history') || lowerMessage.includes('last') || lowerMessage.includes('recent')) {
      return generateHistoryResponse(userMessage, coach, context);
    } else if (lowerMessage.includes('how') && (lowerMessage.includes('doing') || lowerMessage.includes('am i'))) {
      return generateOverallAssessment(coach, context);
    } else {
      return generateGeneralResponse(userMessage, coach, context);
    }
  };

  const getCommonExercises = (workouts) => {
    const exerciseCount = {};
    workouts.forEach(workout => {
      workout.exercises?.forEach(ex => {
        const name = ex.name || ex.exercise;
        if (name) {
          exerciseCount[name] = (exerciseCount[name] || 0) + 1;
        }
      });
    });
    return Object.entries(exerciseCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
  };

  const generateGreetingResponse = (msg, coach, context) => {
    const { userName, lastWorkoutDate, totalWorkouts, workoutsPerWeek } = context;
    const contextInfo = totalWorkouts > 0 ? ` I see you've been putting in work - ${totalWorkouts} sessions so far!` : '';
    
    const responses = {
      iron: [
        `Hey ${userName}!${contextInfo} Ready to train?`,
        `What's up!${contextInfo} Let's talk training.`,
        `Yo! ${totalWorkouts > 5 ? `${workoutsPerWeek} workouts/week - nice consistency!` : 'Time to discuss your gains.'}`
      ],
      zen: [
        `Hello ${userName}.${contextInfo} How are you feeling today?`,
        `Welcome back. Last session: ${lastWorkoutDate}. What's on your mind?`,
        `Greetings. ${totalWorkouts > 0 ? 'Your dedication shows.' : "Let's have a mindful conversation."}`
      ],
      blaze: [
        `HEY ${userName}! ${totalWorkouts} WORKOUTS! WHAT'S UP! 🔥`,
        `YO! ${contextInfo} Great to see you! Let's TALK!`,
        `HELLO! ${workoutsPerWeek} workouts/week - CRUSHING IT! Let's discuss! 🔥`
      ],
      sage: [
        `Greetings, ${userName}.${contextInfo} What wisdom do you seek?`,
        `Hello. ${totalWorkouts > 0 ? `${totalWorkouts} sessions logged.` : ''} What would you like to learn today?`,
        `Welcome. ${lastWorkoutDate !== 'Never' ? `Last session: ${lastWorkoutDate}.` : ''} Share your thoughts with me.`
      ]
    };
    const coachKey = coach.name.toLowerCase().replace('coach ', '');
    const options = responses[coachKey] || responses.iron;
    return options[Math.floor(Math.random() * options.length)];
  };

  const generateGoalResponse = (msg, coach, context) => {
    const hasGoals = context.initialPrompt.length > 0;
    const goalText = hasGoals ? `I remember you mentioned: "${context.initialPrompt.substring(0, 100)}${context.initialPrompt.length > 100 ? '...' : ''}"` : '';
    
    const responses = {
      iron: hasGoals 
        ? `${goalText}\n\nYou've done ${context.totalWorkouts} workouts so far. Are you staying focused on that goal? What's your next target?`
        : `Goals are EVERYTHING. Give me specifics - what exactly do you want to achieve? Strength? Size? Endurance? Let's set a target and CRUSH it!`,
      zen: hasGoals
        ? `${goalText}\n\nI see you've maintained ${context.workoutsPerWeek} workouts per week. How does that align with your deeper purpose?`
        : `Setting goals is about finding your purpose. What truly motivates you? Let's discuss realistic, meaningful targets that align with your values.`,
      blaze: hasGoals
        ? `YEAH! ${goalText}\n\n${context.totalWorkouts} workouts in! Are we CRUSHING that goal or do we need to adjust our ATTACK PLAN?! 🔥`
        : `HELL YEAH! Goal setting! I LOVE IT! Tell me what you want to DOMINATE! Strength? Speed? Gains? Let's make it HAPPEN! 🔥`,
      sage: hasGoals
        ? `${goalText}\n\nBased on your ${context.totalWorkouts} sessions and focus on ${context.commonExercises.join(', ')}, you're on a clear path. Shall we refine the strategy?`
        : `Wise goal setting requires understanding both the destination and the journey. Tell me your aspirations, and I'll help you chart the path.`
    };
    return responses[coach.name.toLowerCase().replace('coach ', '')] || responses.iron;
  };

  const generateNutritionResponse = (msg, coach, context) => {
    const { totalWorkouts, workoutsPerWeek } = context;
    const trainingLevel = workoutsPerWeek > 4 ? 'high training frequency' : workoutsPerWeek > 2 ? 'moderate training' : 'starting out';
    
    const responses = {
      iron: `Nutrition is FUEL. You're doing ${workoutsPerWeek} workouts/week - ${trainingLevel}. You can't out-train a bad diet. Track your protein - aim for 0.8-1g per pound of bodyweight. Stay hydrated. Eat clean, train mean.`,
      zen: `With ${totalWorkouts} sessions completed, your body needs proper nourishment. Focus on whole foods, listen to your body's signals, and find balance. What's your relationship with food like?`,
      blaze: `BRO! ${workoutsPerWeek} workouts/week means you need FUEL! Protein, protein, PROTEIN! Veggies for vitamins! Carbs for ENERGY! What are you eating to FUEL those GAINS?! 🔥`,
      sage: `The body is built in the kitchen, not just the gym. With your ${trainingLevel}, proper nutrition is fundamental. Tell me about your current diet, and I'll share evidence-based recommendations.`
    };
    return responses[coach.name.toLowerCase().replace('coach ', '')] || responses.iron;
  };

  const generateRecoveryResponse = (msg, coach, context) => {
    const { lastWorkoutDate, workoutsPerWeek } = context;
    const intensity = workoutsPerWeek > 4 ? 'training hard' : 'building consistency';
    
    const responses = {
      iron: `You're ${intensity} with ${workoutsPerWeek} sessions/week. Soreness means you're working! But listen to your body - there's good pain and bad pain. Rest is when you GROW. Get sleep, stretch, hydrate. Last workout: ${lastWorkoutDate}. Pain that lasts or gets worse? See a doc.`,
      zen: `Your body is communicating with you. With ${workoutsPerWeek} weekly sessions, recovery is essential. Soreness after training is natural, but sharp pain is a warning. Honor your body with rest, gentle movement, and proper recovery. How does the discomfort feel?`,
      blaze: `${workoutsPerWeek} workouts/week! Feeling it, huh?! That's the PUMP! But hey, REST is part of the GRIND! Sleep, stretch, RECOVER! Come back STRONGER! Any sharp pains though? That's different - be SMART!`,
      sage: `Recovery is not weakness; it's wisdom. Adaptation happens during rest. With ${workoutsPerWeek} sessions weekly, strategic rest is critical. Distinguish between muscle fatigue and injury. Tell me more about what you're experiencing.`
    };
    return responses[coach.name.toLowerCase().replace('coach ', '')] || responses.iron;
  };

  const generateProgressResponse = (msg, coach, context) => {
    const { totalWorkouts, workoutsPerWeek, lastWorkoutDate, commonExercises, totalVolume, daysSinceStart } = context;
    
    // Get exercise improvements
    let improvements = '';
    if (context.exerciseProgress && Object.keys(context.exerciseProgress).length > 0) {
      const topExercise = commonExercises[0];
      const exerciseData = context.exerciseProgress[topExercise];
      if (exerciseData && exerciseData.length > 1) {
        const first = exerciseData[exerciseData.length - 1];
        const latest = exerciseData[0];
        if (latest.weight > first.weight || latest.reps > first.reps) {
          improvements = `\n\nI'm seeing real gains on ${topExercise} - from ${first.weight}lbs x ${first.reps} to ${latest.weight}lbs x ${latest.reps}!`;
        }
      }
    }
    
    const responses = {
      iron: `Progress check! ${totalWorkouts} workouts in ${daysSinceStart} days - averaging ${workoutsPerWeek} per week. Last session: ${lastWorkoutDate}. You're hitting ${commonExercises.join(', ')} consistently.${improvements} Keep that intensity UP!`,
      zen: `Your journey shows ${totalWorkouts} sessions, with mindful focus on ${commonExercises.join(', ')}. You're maintaining ${workoutsPerWeek} workouts weekly. ${improvements || 'Progress unfolds with patience.'} How are you feeling about your development?`,
      blaze: `${totalWorkouts} WORKOUTS! ${workoutsPerWeek} per week! CRUSHING ${commonExercises.join(', ')}!${improvements} Total volume: ${(totalVolume/1000).toFixed(1)}K lbs moved! BEAST MODE! 🔥`,
      sage: `Analysis: ${totalWorkouts} sessions over ${daysSinceStart} days (${workoutsPerWeek}/week frequency). Primary movements: ${commonExercises.join(', ')}.${improvements} Cumulative volume: ${(totalVolume/1000).toFixed(1)}K pounds. The data shows consistent application.`
    };
    return responses[coach.name.toLowerCase().replace('coach ', '')] || responses.iron;
  };

  const generateWorkoutResponse = (msg, coach, context) => {
    const { commonExercises, lastWorkout, recentWorkouts } = context;
    const exList = commonExercises.length > 0 ? commonExercises.join(', ') : 'various exercises';
    
    let recentInfo = '';
    if (lastWorkout && lastWorkout.exercises) {
      const lastExCount = lastWorkout.exercises.length;
      const lastType = lastWorkout.type || 'workout';
      recentInfo = ` Last session was ${lastType} with ${lastExCount} exercises.`;
    }
    
    const responses = {
      iron: `I've tracked all your sessions - you're hitting ${exList} most often.${recentInfo} These are solid movements! What specific workout question do you have? Form? Programming? Intensity?`,
      zen: `Your practice includes ${exList}.${recentInfo} Each movement tells a story of your commitment. What aspect of your training would you like to explore together?`,
      blaze: `I SEE EVERYTHING! ${exList} are your GO-TOs!${recentInfo} LOVE IT! What workout questions you got?! Let's OPTIMIZE! 🔥`,
      sage: `Your training log reveals patterns: ${exList} feature prominently.${recentInfo} Understanding movement selection is key. What knowledge do you seek?`
    };
    return responses[coach.name.toLowerCase().replace('coach ', '')] || responses.iron;
  };

  const generateMotivationResponse = (msg, coach, context) => {
    const { totalWorkouts, commonExercises, daysSinceStart } = context;
    const achievement = totalWorkouts > 0 ? `You've completed ${totalWorkouts} workouts in ${daysSinceStart} days!` : "You're here, that's what matters!";
    
    const responses = {
      iron: `You want motivation? ${achievement} Look at what you've accomplished - ${commonExercises.join(', ')}. Every rep, every set, every workout - you're building something. Don't stop now!`,
      zen: `${achievement} Motivation flows from purpose. Remember why you started. Each session is self-care, investing in your future self. You are worthy of this effort.`,
      blaze: `NEED MOTIVATION?! ${achievement} YOU'RE ALREADY CRUSHING ${commonExercises.join(', ')}! That's DEDICATION! You're BUILDING something AMAZING! Every workout makes you STRONGER! LET'S GOOOOO! 🔥💪`,
      sage: `${achievement} Motivation is ephemeral. Discipline is eternal. You've shown both by maintaining ${context.workoutsPerWeek} sessions per week. Trust the process, and results will follow.`
    };
    return responses[coach.name.toLowerCase().replace('coach ', '')] || responses.iron;
  };

  const generateGratitudeResponse = (coach) => {
    const responses = {
      iron: `No need to thank me. Just keep showing up and putting in the work. That's all the thanks I need!`,
      zen: `You're welcome. I'm here to support your journey whenever you need guidance.`,
      blaze: `ANYTIME! We're in this TOGETHER! Keep being AWESOME! 🔥`,
      sage: `You honor me with your dedication. Continue to seek knowledge and growth.`
    };
    return responses[coach.name.toLowerCase().replace('coach ', '')] || responses.iron;
  };

  const generateHelpResponse = (msg, coach, context) => {
    const { totalWorkouts, commonExercises } = context;
    const stats = totalWorkouts > 0 ? ` I know you've done ${totalWorkouts} workouts focusing on ${commonExercises.join(', ')}.` : '';
    
    const responses = {
      iron: `I'm here to help you get stronger, period.${stats} Ask me about workouts, exercises, goals, nutrition, recovery - whatever you need to level up. What's your question?`,
      zen: `I'm here to guide you on your fitness journey with patience and understanding.${stats} Ask about form, programming, mindset, recovery, or anything else. How can I assist you?`,
      blaze: `BRO I'm here for EVERYTHING!${stats} Workouts! Nutrition! Motivation! Goals! ANYTHING you need to get BETTER! What do you want to know?! 🔥`,
      sage: `I offer knowledge on training methodology, exercise science, nutrition fundamentals, and sustainable fitness practices.${stats} What wisdom do you seek?`
    };
    return responses[coach.name.toLowerCase().replace('coach ', '')] || responses.iron;
  };

  const generateHistoryResponse = (msg, coach, context) => {
    const { recentWorkouts, lastWorkoutDate } = context;
    if (recentWorkouts.length === 0) {
      return "You haven't logged any workouts yet! Let's get started and I'll help you track everything.";
    }
    
    const recent = recentWorkouts[0];
    const exerciseList = recent.exercises?.map(ex => ex.name || ex.exercise).join(', ') || 'exercises';
    
    const responses = {
      iron: `Last workout was ${lastWorkoutDate}: ${recent.type || 'workout'} - ${exerciseList}. You completed ${recent.exercises?.length || 0} exercises. Want the full breakdown or details on a specific movement?`,
      zen: `Your most recent session (${lastWorkoutDate}): ${exerciseList}. ${recent.exercises?.length || 0} movements completed with presence. Would you like to reflect on any particular aspect?`,
      blaze: `LAST SESSION ${lastWorkoutDate}! ${recent.type?.toUpperCase() || 'WORKOUT'}! Hit ${exerciseList}! ${recent.exercises?.length || 0} exercises CRUSHED! Want more details?! 🔥`,
      sage: `Session log ${lastWorkoutDate}: Type: ${recent.type || 'general'}. Movements: ${exerciseList}. Total exercises: ${recent.exercises?.length || 0}. What analysis do you require?`
    };
    return responses[coach.name.toLowerCase().replace('coach ', '')] || responses.iron;
  };

  const generateOverallAssessment = (coach, context) => {
    const { totalWorkouts, workoutsPerWeek, commonExercises, daysSinceStart } = context;
    
    const responses = {
      iron: `Straight talk: ${totalWorkouts} workouts in ${daysSinceStart} days. ${workoutsPerWeek} per week. You're consistent on ${commonExercises.join(', ')}. Keep grinding and the results will come. What area do you want to improve?`,
      zen: `You're on a meaningful path. ${totalWorkouts} sessions over ${daysSinceStart} days shows commitment. Your focus on ${commonExercises.join(', ')} is building foundation. How does your body feel? Are you listening to its wisdom?`,
      blaze: `YOU'RE DOING AWESOME! ${totalWorkouts} workouts! ${workoutsPerWeek}/week! CRUSHING ${commonExercises.join(', ')}! Keep this ENERGY going! What's next on your CONQUEST?! 🔥`,
      sage: `Assessment: Frequency is ${workoutsPerWeek} sessions weekly over ${daysSinceStart} days. Primary focus: ${commonExercises.join(', ')}. Consistency indicates discipline. Continue this trajectory and adaptation will follow.`
    };
    return responses[coach.name.toLowerCase().replace('coach ', '')] || responses.iron;
  };

  const generateGeneralResponse = (msg, coach, context) => {
    const hasContext = context.totalWorkouts > 0;
    const contextNote = hasContext ? ` I'm tracking all ${context.totalWorkouts} of your workouts.` : '';
    
    const responses = {
      iron: [
        `Tell me more.${contextNote} I'm here to help you get results.`,
        `Interesting. How does that relate to your training goals?`,
        `I hear you. What action are you going to take?`,
        `Noted.${contextNote} What's your next move?`
      ],
      zen: [
        `I'm listening.${contextNote} Please continue.`,
        `That's an interesting perspective. How does this make you feel?`,
        `I appreciate you sharing. What insight can we gain from this?`,
        `Thank you for being open.${contextNote} What would you like to explore?`
      ],
      blaze: [
        `I HEAR YOU!${contextNote} What else is on your mind?!`,
        `YEAH! Tell me MORE! Let's DIG DEEP! 🔥`,
        `INTERESTING! How can we use this to LEVEL UP?!`,
        `I'M LISTENING!${contextNote} Keep going!`
      ],
      sage: [
        `An intriguing thought.${contextNote} Please elaborate.`,
        `I see. What conclusions do you draw from this?`,
        `A valid point. How does this inform your training?`,
        `Noteworthy.${contextNote} What wisdom can we extract?`
      ]
    };
    const coachKey = coach.name.toLowerCase().replace('coach ', '');
    const options = responses[coachKey] || responses.iron;
    return options[Math.floor(Math.random() * options.length)];
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const responseText = await getTrainerResponse(userMessage.content);
      const trainerMessage = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, trainerMessage]);
      setIsTyping(false);

      // Save to user's conversation history
      try {
        const updatedHistory = [...messages, userMessage, trainerMessage];
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_API_SECRET || ''
          },
          body: JSON.stringify({
            ...user,
            conversationHistory: updatedHistory
          })
        });
        onRefresh?.();
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }, 1000 + Math.random() * 1000); // Random delay for more natural feel
  };

  const clearHistory = async () => {
    if (!confirm('Clear all chat history? This cannot be undone.')) return;

    const welcomeMessage = {
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date().toISOString()
    };

    setMessages([welcomeMessage]);

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_SECRET || ''
        },
        body: JSON.stringify({
          ...user,
          conversationHistory: [welcomeMessage]
        })
      });
      onRefresh?.();
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-purple bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <span className="text-4xl">{coach.avatar}</span>
              Chat with {coach.name}
            </h2>
            <p className="text-gray-400 text-sm">
              {coach.personality}
            </p>
          </div>
          {messages.length > 1 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 glass-strong hover:bg-white/15 text-gray-400 hover:text-white rounded-xl transition-all duration-300 text-sm"
            >
              🗑️ Clear History
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="glass-strong p-3 rounded-xl">
            <div className="text-2xl font-bold text-primary-400">{user.workouts?.length || 0}</div>
            <div className="text-xs text-gray-400">Total Workouts</div>
          </div>
          <div className="glass-strong p-3 rounded-xl">
            <div className="text-2xl font-bold text-accent-cyan">{messages.filter(m => m.role === 'user').length}</div>
            <div className="text-xs text-gray-400">Your Messages</div>
          </div>
          <div className="glass-strong p-3 rounded-xl">
            <div className="text-2xl font-bold text-accent-purple">{getCommonExercises(user.workouts || []).length}</div>
            <div className="text-xs text-gray-400">Top Exercises</div>
          </div>
          <div className="glass-strong p-3 rounded-xl">
            <div className="text-2xl font-bold text-primary-400">{Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))}</div>
            <div className="text-xs text-gray-400">Days Training</div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="glass rounded-2xl overflow-hidden shadow-xl border border-white/10">
        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                      message.role === 'user' 
                        ? 'bg-primary-600' 
                        : `bg-gradient-to-r ${coach.gradient}`
                    }`}>
                      {message.role === 'user' ? '👤' : coach.avatar}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'glass-strong text-gray-100'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-2">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg bg-gradient-to-r ${coach.gradient}`}>
                  {coach.avatar}
                </div>
                <div className="glass-strong rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask ${coach.name} anything...`}
              className="flex-1 bg-dark-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              Send
            </button>
          </form>

          {/* Suggested Questions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInputText("How am I doing overall?")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
            >
              📊 Overall Progress
            </button>
            <button
              onClick={() => setInputText("What were my last workouts?")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
            >
              📜 Recent History
            </button>
            <button
              onClick={() => setInputText("What are my goals?")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
            >
              🎯 My Goals
            </button>
            <button
              onClick={() => setInputText("I need motivation")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
            >
              🔥 Motivate Me
            </button>
            <button
              onClick={() => setInputText("Nutrition advice?")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
            >
              🥗 Nutrition
            </button>
            <button
              onClick={() => setInputText("Tell me about my workout patterns")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
            >
              💪 My Patterns
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 glass-strong p-4 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <span>💬</span>
          Chat Tips
        </h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Ask about your progress, goals, or training advice</li>
          <li>• Discuss nutrition, recovery, and motivation</li>
          <li>• Get exercise recommendations and form tips</li>
          <li>• Your conversation history is saved automatically</li>
        </ul>
      </div>
    </div>
  );
}
