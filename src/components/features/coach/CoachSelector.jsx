import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useCoach } from '../../../contexts/CoachContext';
import { Modal, ModalHeader, ModalBody } from '../../organisms';
import { InfoBox, Grid } from '../../organisms';

const CoachSelector = memo(function CoachSelector({ onClose }) {
  const { coachType, setCoachType, availableCoaches } = useCoach();

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalHeader title="Choose Your Coach" onClose={onClose} icon="🎯" />

      <ModalBody>
        <Grid cols={2} gap="md">
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
        </Grid>

        <InfoBox variant="neutral" icon="💡" title="Tip" className="mt-6">
          Your coach will adapt their motivational style and AI responses to match their personality. 
          Change anytime from settings!
        </InfoBox>
      </ModalBody>
    </Modal>
  );
});

export default CoachSelector;
