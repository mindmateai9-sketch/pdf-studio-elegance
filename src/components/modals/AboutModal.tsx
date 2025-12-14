import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Modal } from './Modal';
import { useModalStore } from '@/stores/modalStore';

export const AboutModal = () => {
  const { modalType, closeModal } = useModalStore();

  return (
    <Modal
      open={modalType === 'about'}
      onClose={closeModal}
      size="lg"
    >
      <div className="text-center">
        <motion.div
          className="w-20 h-20 mx-auto mb-6"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="aboutGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F2CE69" />
                <stop offset="100%" stopColor="#D2A63D" />
              </linearGradient>
            </defs>
            <rect
              x="2"
              y="2"
              width="36"
              height="36"
              rx="8"
              fill="url(#aboutGoldGradient)"
            />
            <path
              d="M12 12H28V16H16V18H26V22H16V24H28V28H12V12Z"
              fill="#121212"
            />
          </svg>
        </motion.div>

        <motion.h2
          className="text-2xl font-bold gradient-gold-text mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Eldora Technologies
        </motion.h2>

        <motion.p
          className="text-muted-foreground text-sm mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Software crafted with elegance and precision.
        </motion.p>

        <motion.div
          className="p-5 rounded-xl bg-secondary/30 border border-border text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            Eldora Technologies is building modern software products.
          </p>
        </motion.div>

        <motion.h3
          className="text-sm font-semibold text-foreground mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Contact
        </motion.h3>

        <motion.div
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Mail className="w-4 h-4" />
          <a
            href="mailto:eldoraTechnologies@gmail.com"
            className="hover:text-primary transition-colors"
          >
            eldoraTechnologies@gmail.com
          </a>
        </motion.div>

        <motion.p
          className="text-xs text-muted-foreground/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Crafted with passion by the Eldora team.
        </motion.p>
      </div>
    </Modal>
  );
};
