import { motion } from 'framer-motion';
import { Modal } from './Modal';
import { useModalStore } from '@/stores/modalStore';

export const ProgressModal = () => {
  const { modalType, toolType } = useModalStore();

  const getMessage = () => {
    switch (toolType) {
      case 'extract': return 'Extracting your pages...';
      case 'compress': return 'Compressing your PDF...';
      case 'watermark': return 'Adding watermark...';
      case 'rotate': return 'Rotating pages...';
      default: return 'Processing your file...';
    }
  };

  return (
    <Modal
      open={modalType === 'progress'}
      onClose={() => {}}
      preventClose
      showClose={false}
    >
      <div className="flex flex-col items-center py-8">
        <motion.div
          className="relative w-16 h-16 mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <svg className="w-16 h-16" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="4"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="175"
              strokeDashoffset="100"
              initial={{ strokeDashoffset: 175 }}
              animate={{ strokeDashoffset: [175, 50, 175] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F2CE69" />
                <stop offset="100%" stopColor="#D2A63D" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        
        <motion.p
          className="text-lg font-medium text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {getMessage()}
        </motion.p>
        
        <p className="text-sm text-muted-foreground mt-2">
          This won't take long
        </p>
      </div>
    </Modal>
  );
};
