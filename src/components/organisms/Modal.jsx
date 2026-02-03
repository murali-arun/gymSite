import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants, animations } from '../../config/designSystem';

/**
 * Modal Component
 * Reusable modal/dialog with overlay and animations
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal should close
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl'
 * @param {string} variant - Overlay variant: 'default', 'dark'
 * @param {boolean} closeOnOverlayClick - Whether clicking overlay closes modal
 * @param {ReactNode} children - Modal content
 */
export function Modal({ 
  isOpen, 
  onClose, 
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  children,
  className = ''
}) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
  };

  const overlayClass = variant === 'dark' ? variants.modal.overlayDark : variants.modal.overlay;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...animations.fadeIn}
          className={overlayClass}
          onClick={closeOnOverlayClick ? onClose : undefined}
        >
          <motion.div
            {...animations.scaleIn}
            className={`bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 shadow-2xl ${sizes[size]} w-full ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Modal Header Component
 */
export function ModalHeader({ title, onClose, icon, children }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <h2 className="text-2xl font-bold text-white">{title || children}</h2>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Modal Body Component
 */
export function ModalBody({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/**
 * Modal Footer Component
 */
export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex gap-3 mt-6 ${className}`}>
      {children}
    </div>
  );
}
