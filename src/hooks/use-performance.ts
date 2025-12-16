import { useState, useEffect, useMemo } from 'react';

// Detect if user prefers reduced motion
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Detect mobile device
export function useIsMobileDevice(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

// Combined performance settings hook
export function usePerformanceSettings() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobileDevice();

  return useMemo(() => ({
    prefersReducedMotion,
    isMobile,
    // Disable heavy animations on mobile or when reduced motion is preferred
    shouldAnimate: !prefersReducedMotion && !isMobile,
    // Disable backdrop blur on mobile for performance
    shouldUseBlur: !isMobile,
    // Cap canvas size based on device
    maxCanvasWidth: isMobile ? 1100 : 1400,
  }), [prefersReducedMotion, isMobile]);
}

// Check if device is iOS Safari for specific optimizations
export function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua);
}
