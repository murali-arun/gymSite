import React from 'react';
import { motion } from 'framer-motion';
import { useCoach } from '../../../contexts/CoachContext';

export default function CoachSelector({ onClose }) {
  const { coachType, setCoachType, availableCoaches } = useCoach();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Choose Your Coach</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(availableCoaches).map(([key, coach]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCoachType(key);
                onClose();
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                coachType === key
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-16 h-16 bg-gradient-to-br ${coach.gradient} rounded-xl flex items-center justify-center text-4xl shadow-lg flex-shrink-0`}>
                  {coach.avatar}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-white text-lg mb-1">
                    {coach.name}
                  </div>
                  <div className="text-xs text-gray-300 leading-relaxed">
                    {coach.personality}
                  </div>
                </div>
              </div>

              {coachType === key && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 text-sm text-blue-400"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Active Coach</span>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
          <div className="text-xs text-gray-400 mb-2">💡 Tip</div>
          <div className="text-sm text-gray-300">
            Your coach will adapt their motivational style and AI responses to match their personality. 
            Change anytime from settings!
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
