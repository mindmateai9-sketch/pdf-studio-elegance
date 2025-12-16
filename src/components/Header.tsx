import { memo } from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useModalStore } from '@/stores/modalStore';
import { usePerformanceSettings } from '@/hooks/use-performance';

export const Header = memo(() => {
  const openModal = useModalStore((state) => state.openModal);
  const { shouldAnimate, shouldUseBlur } = usePerformanceSettings();

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 border-b border-border/50 ${shouldUseBlur ? 'backdrop-blur-xl' : ''}`}
      style={{ 
        background: 'hsl(var(--background) / 0.8)',
        animation: shouldAnimate ? 'fade-in 0.5s ease-out' : 'none',
      }}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        
        <nav className="flex items-center gap-4">
          <button
            onClick={() => openModal('about')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            About Eldora
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
          </button>
          
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
