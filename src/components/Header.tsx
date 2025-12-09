import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useModalStore } from '@/stores/modalStore';

export const Header = () => {
  const openModal = useModalStore((state) => state.openModal);

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 backdrop-blur-xl"
      style={{ background: 'hsl(var(--background) / 0.8)' }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        
        <nav className="flex items-center gap-4">
          <motion.button
            onClick={() => openModal('about')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            About Eldora
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
          </motion.button>
          
          <ThemeToggle />
        </nav>
      </div>
    </motion.header>
  );
};
