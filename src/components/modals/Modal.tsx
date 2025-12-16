import { useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePerformanceSettings } from '@/hooks/use-performance';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showClose?: boolean;
  preventClose?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Modal component - Framer Motion allowed here per requirements
export const Modal = memo(({
  open,
  onClose,
  title,
  subtitle,
  children,
  showClose = true,
  preventClose = false,
  size = 'md',
}: ModalProps) => {
  const { prefersReducedMotion, shouldUseBlur } = usePerformanceSettings();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    },
    [onClose, preventClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown, { passive: true });
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  // Animation variants - disabled when reduced motion is preferred
  const overlayVariants = prefersReducedMotion 
    ? { initial: {}, animate: {}, exit: {} }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const containerVariants = prefersReducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, scale: 0.96, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 10 },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`modal-overlay ${shouldUseBlur ? '' : 'modal-overlay-no-blur'}`}
          onClick={preventClose ? undefined : onClose}
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`modal-container ${sizeClasses[size]}`}
            onClick={(e) => e.stopPropagation()}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            {showClose && !preventClose && (
              <button
                className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {(title || subtitle) && (
              <div className="mb-6 pr-8">
                {title && (
                  <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

Modal.displayName = 'Modal';
