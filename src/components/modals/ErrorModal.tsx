import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Modal } from './Modal';
import { useModalStore } from '@/stores/modalStore';

export const ErrorModal = () => {
  const { modalType, toolType, errorMessage, closeModal, openModal, reset } =
    useModalStore();

  const handleRetry = () => {
    reset();
    openModal('upload', toolType);
  };

  return (
    <Modal
      open={modalType === 'error'}
      onClose={() => {
        closeModal();
        reset();
      }}
      showClose={false}
    >
      <div className="flex flex-col items-center py-6">
        <motion.div
          className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <AlertCircle className="w-10 h-10 text-destructive" />
        </motion.div>

        <motion.h2
          className="text-xl font-semibold text-foreground mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Something went wrong
        </motion.h2>

        <motion.p
          className="text-sm text-muted-foreground text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {errorMessage || 'An error occurred while processing your file. Please try again.'}
        </motion.p>

        <motion.div
          className="w-full space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            className="btn-primary w-full flex items-center justify-center gap-2"
            onClick={handleRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </motion.button>

          <motion.button
            className="btn-secondary w-full"
            onClick={() => {
              closeModal();
              reset();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        </motion.div>
      </div>
    </Modal>
  );
};
