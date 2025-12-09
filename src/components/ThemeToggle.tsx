import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === 'dark' ? 0 : 180,
          scale: 1 
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5 text-primary" />
        ) : (
          <Sun className="w-5 h-5 text-primary" />
        )}
      </motion.div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        animate={{
          opacity: theme === 'dark' ? 0 : 0.2,
        }}
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
        }}
      />
    </motion.button>
  );
};
