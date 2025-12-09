import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useThemeStore } from '@/stores/themeStore';

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

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
  }, []);

  if (theme === 'light') return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent" />
      
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
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
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [particle.opacity * 0.5, particle.opacity, particle.opacity * 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Ambient glow spots */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          left: '10%',
          top: '20%',
          background: 'radial-gradient(circle, hsl(180 70% 50% / 0.08) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl"
        style={{
          right: '15%',
          bottom: '30%',
          background: 'radial-gradient(circle, hsl(160 70% 40% / 0.08) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl"
        style={{
          left: '50%',
          top: '60%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
