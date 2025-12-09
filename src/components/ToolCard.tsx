import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  delay?: number;
}

export const ToolCard = ({ title, description, icon: Icon, onClick, delay = 0 }: ToolCardProps) => {
  return (
    <motion.div
      className="tool-card group"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.08), transparent 70%)'
        }}
      />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center mb-4 group-hover:glow-gold-subtle transition-shadow duration-300">
          <Icon className="w-6 h-6 text-background" strokeWidth={2} />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:gradient-gold-text transition-all duration-300">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Get started</span>
          <motion.svg 
            className="w-4 h-4 ml-1"
            viewBox="0 0 16 16"
            fill="none"
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
          >
            <path 
              d="M6 12L10 8L6 4" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>
      </div>
    </motion.div>
  );
};
