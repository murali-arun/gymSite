import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';

const CoachContext = createContext();

// Coach personalities - user can choose their vibe
const COACH_PROFILES = {
  iron: {
    name: "Coach Iron",
    avatar: "🦾",
    gradient: "from-gray-600 to-slate-800",
    personality: "Tough-love motivator. Direct, intense, and pushing you to your absolute limits.",
    voice: "short and powerful",
    catchphrases: [
      "No excuses!",
      "Beast mode activated!",
      "Iron sharpens iron!",
      "You're stronger than you think!",
      "Let's crush this!"
    ]
  },
  zen: {
    name: "Coach Zen",
    avatar: "🧘",
    gradient: "from-purple-600 to-blue-600",
    personality: "Calm and supportive. Focuses on mindfulness, form, and sustainable progress.",
    voice: "gentle and encouraging",
    catchphrases: [
      "Breathe and focus",
      "Progress, not perfection",
      "Mind-muscle connection",
      "You're doing great",
      "Feel the movement"
    ]
  },
  blaze: {
    name: "Coach Blaze",
    avatar: "🔥",
    gradient: "from-orange-600 to-red-600",
    personality: "High-energy hype master. Explosive enthusiasm and celebration for every win.",
    voice: "energetic and exciting",
    catchphrases: [
      "YESSS! LET'S GO!",
      "You're on FIRE!",
      "THAT'S WHAT I'M TALKING ABOUT!",
      "CRUSHING IT!",
      "UNSTOPPABLE!"
    ]
  },
  sage: {
    name: "Coach Sage",
    avatar: "🦉",
    gradient: "from-indigo-600 to-cyan-600",
    personality: "Wise strategist. Analytical, data-driven, focuses on optimal programming.",
    voice: "thoughtful and precise",
    catchphrases: [
      "Smart training wins",
      "Let's optimize this",
      "Quality over quantity",
      "Perfect execution",
      "Science-based gains"
    ]
  }
};

export function CoachProvider({ children }) {
  const [coachType, setCoachType] = useState('iron'); // default coach
  const [showCoach, setShowCoach] = useState(false);
  const [coachMessage, setCoachMessage] = useState('');
  const [messageType, setMessageType] = useState('neutral'); // neutral, celebrate, motivate, warn

  const coach = COACH_PROFILES[coachType];

  // Confetti presets
  const fireConfetti = useCallback((type = 'default') => {
    const configs = {
      default: {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      },
      pr: {
        particleCount: 150,
        spread: 160,
        origin: { y: 0.4 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      },
      streak: {
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF6347', '#FF4500', '#DC143C']
      },
      complete: {
        particleCount: 200,
        spread: 180,
        origin: { y: 0.5 },
        colors: ['#00FF00', '#32CD32', '#00FA9A']
      }
    };

    confetti(configs[type] || configs.default);

    // For extra celebrations, do a second burst
    if (type === 'pr' || type === 'complete') {
      setTimeout(() => {
        confetti({
          ...configs[type],
          particleCount: configs[type].particleCount / 2,
          angle: 120,
          origin: { x: 1 }
        });
      }, 250);
    }
  }, []);

  // Show coach message with animation
  const showMessage = useCallback((message, type = 'neutral', duration = 4000) => {
    setCoachMessage(message);
    setMessageType(type);
    setShowCoach(true);

    if (type === 'celebrate') {
      fireConfetti('default');
    }

    setTimeout(() => {
      setShowCoach(false);
    }, duration);
  }, [fireConfetti]);

  // Context-aware motivational messages
  const motivate = useCallback((context) => {
    const messages = {
      workoutStart: [
        `${coach.catchphrases[0]} Let's get it!`,
        "Time to work! Show me what you got!",
        "Let's make this workout count!",
        `${coach.catchphrases[4]} Time to train!`,
        "Game time! Let's dominate!",
        "Your body is ready. Let's go!"
      ],
      workoutGenerated: [
        "Workout ready! Time to crush it!",
        `${coach.catchphrases[4]}`,
        "Your workout is ready. Let's make it count!",
        "Time to show what you're made of!"
      ],
      setComplete: [
        `${coach.catchphrases[Math.floor(Math.random() * coach.catchphrases.length)]}`,
        "One step closer!",
        "Keep that energy up!",
        "Solid rep!"
      ],
      exerciseComplete: [
        "Exercise complete! 💪",
        `${coach.catchphrases[0]} Exercise done!`,
        "Moving to the next one!",
        "Great work on that!"
      ],
      workoutComplete: [
        `${coach.catchphrases[4]}`,
        "Workout completed! You're a machine!",
        "That's how it's done!",
        "Another one in the books!"
      ],
      pr: [
        "🎉 NEW PR! YOU'RE A LEGEND!",
        "PERSONAL RECORD! Absolutely crushing it!",
        "NEW RECORD! This is what greatness looks like!",
        "PR ALERT! You just leveled up!"
      ],
      streak: [
        `🔥 ${coach.catchphrases[2]} Streak continues!`,
        "The consistency is paying off!",
        "Day after day, you show up!",
        "Streak maintained! Unstoppable!"
      ],
      struggling: [
        "This is where growth happens!",
        "Tough sets build strong minds",
        "You got this - one rep at a time",
        "Progress isn't always linear"
      ]
    };

    const contextMessages = messages[context] || messages.setComplete;
    const message = contextMessages[Math.floor(Math.random() * contextMessages.length)];
    
    const type = context === 'pr' || context === 'workoutComplete' ? 'celebrate' : 
                 context === 'struggling' ? 'motivate' : 'neutral';
    
    showMessage(message, type);
    
    // Fire confetti for special occasions
    if (context === 'pr') fireConfetti('pr');
    if (context === 'workoutComplete') fireConfetti('complete');
    if (context === 'streak') fireConfetti('streak');
  }, [coach, showMessage, fireConfetti]);

  // Celebrate with custom message
  const celebrate = useCallback((message, confettiType = 'default') => {
    showMessage(message, 'celebrate');
    fireConfetti(confettiType);
  }, [showMessage, fireConfetti]);

  const value = useMemo(() => ({
    coach,
    coachType,
    setCoachType,
    showCoach,
    coachMessage,
    messageType,
    motivate,
    celebrate,
    showMessage,
    fireConfetti,
    availableCoaches: COACH_PROFILES
  }), [coach, coachType, showCoach, coachMessage, messageType, motivate, celebrate, showMessage, fireConfetti]);

  return (
    <CoachContext.Provider value={value}>
      {children}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  const context = useContext(CoachContext);
  if (!context) {
    throw new Error('useCoach must be used within CoachProvider');
  }
  return context;
}
