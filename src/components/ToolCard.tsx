import { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { usePerformanceSettings } from '@/hooks/use-performance';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  delay?: number;
}

// Memoized component to prevent unnecessary re-renders
export const ToolCard = memo(({ title, description, icon: Icon, onClick, delay = 0 }: ToolCardProps) => {
  const { shouldAnimate } = usePerformanceSettings();

  return (
    <div
      className="tool-card group"
      onClick={onClick}
      style={{
        // CSS-based animation instead of Framer Motion
        animation: shouldAnimate ? `fade-in 0.5s ease-out ${delay}s both` : 'none',
        opacity: shouldAnimate ? undefined : 1,
      }}
    >
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
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
          <svg 
            className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path 
              d="M6 12L10 8L6 4" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
});

ToolCard.displayName = 'ToolCard';
