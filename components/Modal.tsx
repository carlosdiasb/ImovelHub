
import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">{title}</h2>
                <button onClick={onClose} className="text-neutral-medium hover:text-neutral-dark">
                  <Icon name="close" className="w-6 h-6" />
                </button>
              </div>
              <div>{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
