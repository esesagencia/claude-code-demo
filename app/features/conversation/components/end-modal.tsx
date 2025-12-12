// ABOUTME: Modal component that displays the reflexive chatbot's closing message
// ABOUTME: Blocks further interaction and offers option to start new conversation

'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface EndModalProps {
  isOpen: boolean;
  message: string;
  onNewConversation: () => void;
}

export function EndModal({ isOpen, message, onNewConversation }: EndModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-modal-message"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
          className="max-w-2xl px-6 text-center"
        >
          <p
            id="end-modal-message"
            className="whitespace-pre-line font-serif text-2xl leading-relaxed text-zinc-100 md:text-3xl md:leading-relaxed"
          >
            {message}
          </p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onNewConversation}
            className="mt-12 rounded-lg bg-blue-600 px-8 py-4 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Comenzar nueva reflexión"
          >
            Comenzar nueva reflexión
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
