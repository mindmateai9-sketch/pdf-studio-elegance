import { memo } from 'react';
import { usePerformanceSettings } from '@/hooks/use-performance';

export const Footer = memo(() => {
  const { shouldAnimate } = usePerformanceSettings();

  return (
    <footer 
      className="border-t border-border/50 py-8"
      style={{
        animation: shouldAnimate ? 'fade-in 0.5s ease-out 0.8s both' : 'none',
      }}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Crafted with precision by{' '}
            <span className="gradient-gold-text font-medium">Eldora Technologies</span>
          </p>
          
          <p className="text-xs text-muted-foreground/70">
            All PDF processing happens locally in your browser
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
