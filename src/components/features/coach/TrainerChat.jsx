import React, { useState, useEffect, useRef } from 'react';
import { useCoach } from '../../../contexts/CoachContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getCoachChatResponse } from '../../../services/api';

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
    const recentWorkouts = workouts.slice(0, 5);
    const commonExercises = getCommonExercises(workouts);
    
    // Calculate workout frequency
    const daysSinceStart = Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    const workoutsPerWeek = daysSinceStart > 0 ? ((totalWorkouts / daysSinceStart) * 7).toFixed(1) : 0;
    
    // Get last workout info
    const lastWorkout = workouts[0];
    const lastWorkoutDate = lastWorkout ? new Date(lastWorkout.completedAt || lastWorkout.date).toLocaleDateString() : 'Never';
    
    // Extract goals from initial prompt
    const initialPrompt = user.initialPrompt || '';
    
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
      totalVolume,
      daysSinceStart,
      userName: user.name
    };
  };

  const getCommonExercises = (workouts) => {
    const exerciseCount = {};
    workouts.forEach(workout => {
      workout.exercises?.forEach(ex => {
        let name = ex.name || ex.exercise;
        if (name) {
          name = name.trim();
          exerciseCount[name] = (exerciseCount[name] || 0) + 1;
        }
      });
    });
    
    return Object.entries(exerciseCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Get context and personality
      const context = buildUserContext();
      const coachPersonality = {
        name: coach.name,
        avatar: coach.avatar,
        personality: coach.personality,
        voice: coach.voice,
        catchphrases: coach.catchphrases
      };

      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Call the LLM API
      const responseText = await getCoachChatResponse(
        userMessage.content,
        coachPersonality,
        context,
        conversationHistory
      );

      // Add assistant response
      const trainerMessage = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, trainerMessage]);

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
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
              disabled={isTyping}
            >
              📊 Overall Progress
            </button>
            <button
              onClick={() => setInputText("What were my last workouts?")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
              disabled={isTyping}
            >
              📜 Recent History
            </button>
            <button
              onClick={() => setInputText("What are my goals?")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
              disabled={isTyping}
            >
              🎯 My Goals
            </button>
            <button
              onClick={() => setInputText("I need motivation")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
              disabled={isTyping}
            >
              🔥 Motivate Me
            </button>
            <button
              onClick={() => setInputText("Nutrition advice?")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
              disabled={isTyping}
            >
              🥗 Nutrition
            </button>
            <button
              onClick={() => setInputText("Tell me about my workout patterns")}
              className="text-xs px-3 py-1 glass-strong hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all"
              disabled={isTyping}
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
          <li>• <strong>Powered by AI:</strong> Your coach uses real AI to understand and respond contextually</li>
          <li>• Ask about your progress, goals, or get personalized training advice</li>
          <li>• Discuss nutrition, recovery, motivation, or any fitness topic</li>
          <li>• The coach knows your complete workout history and can reference specific exercises</li>
          <li>• Your conversation history is saved automatically</li>
        </ul>
      </div>
    </div>
  );
}
