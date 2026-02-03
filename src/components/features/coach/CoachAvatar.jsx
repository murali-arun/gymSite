import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoach } from '../../../contexts/CoachContext';

export default function CoachAvatar() {
  const { coach, showCoach, coachMessage, messageType } = useCoach();

  const messageColors = {
    neutral: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    celebrate: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    motivate: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30',
    warn: 'from-red-500/20 to-pink-500/20 border-red-500/30'
  };

  return (
    <AnimatePresence>
      {showCoach && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <motion.div
            className={`bg-gradient-to-br ${messageColors[messageType]} backdrop-blur-lg rounded-2xl p-4 border shadow-2xl`}
            animate={{ 
              scale: messageType === 'celebrate' ? [1, 1.05, 1] : 1,
            }}
            transition={{ 
              repeat: messageType === 'celebrate' ? 3 : 0,
              duration: 0.5 
            }}
          >
            <div className="flex items-start gap-3">
              {/* Animated Avatar */}
              <motion.div
                className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${coach.gradient} rounded-xl flex items-center justify-center text-3xl shadow-lg`}
                animate={{ 
                  rotate: messageType === 'celebrate' ? [0, 10, -10, 0] : 0,
                }}
                transition={{ 
                  repeat: messageType === 'celebrate' ? Infinity : 0,
                  duration: 0.6 
                }}
              >
                {coach.avatar}
              </motion.div>

              {/* Message */}
              <div className="flex-1">
                <div className="text-xs font-bold text-white/70 mb-1">
                  {coach.name}
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium text-white leading-relaxed"
                >
                  {coachMessage}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
