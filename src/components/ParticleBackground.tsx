import { useMemo } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { usePerformanceSettings } from '@/hooks/use-performance';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const ParticleBackground = () => {
  const { theme } = useThemeStore();
  const { shouldAnimate, isMobile } = usePerformanceSettings();

  const particles = useMemo<Particle[]>(() => {
    // Reduce particle count on mobile
    const count = isMobile ? 20 : 60;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
  }, [isMobile]);

  // Don't render on light mode, mobile, or when reduced motion is preferred
  if (theme === 'light' || !shouldAnimate) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient overlays - CSS only, no JS animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent" />
      
      {/* Particles using CSS animations instead of Framer Motion */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full particle-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, 
              hsl(var(--primary) / ${particle.opacity}) 0%, 
              hsl(180 70% 50% / ${particle.opacity * 0.5}) 50%,
              transparent 100%)`,
            boxShadow: `0 0 ${particle.size * 2}px hsl(var(--primary) / ${particle.opacity * 0.5})`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            opacity: particle.opacity,
          }}
        />
      ))}

      {/* Ambient glow spots - CSS only */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl ambient-pulse"
        style={{
          left: '10%',
          top: '20%',
          background: 'radial-gradient(circle, hsl(180 70% 50% / 0.08) 0%, transparent 70%)',
        }}
      />
      
      <div
        className="absolute w-80 h-80 rounded-full blur-3xl ambient-pulse-alt"
        style={{
          right: '15%',
          bottom: '30%',
          background: 'radial-gradient(circle, hsl(160 70% 40% / 0.08) 0%, transparent 70%)',
        }}
      />

      <div
        className="absolute w-64 h-64 rounded-full blur-3xl ambient-pulse"
        style={{
          left: '50%',
          top: '60%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
          animationDelay: '4s',
        }}
      />
    </div>
  );
};
