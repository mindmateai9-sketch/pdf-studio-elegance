import { useRef, memo, useCallback } from 'react';
import { usePerformanceSettings } from '@/hooks/use-performance';

interface ThumbnailBarProps {
  previews: string[];
  currentPage: number;
  onPageSelect: (page: number) => void;
}

// Memoized Thumbnail component - no Framer Motion, uses CSS transforms
const Thumbnail = memo(({ 
  src, 
  index, 
  isActive, 
  onClick,
  shouldAnimate
}: { 
  src: string; 
  index: number; 
  isActive: boolean; 
  onClick: () => void;
  shouldAnimate: boolean;
}) => {
  return (
    <div
      className={`relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-transform duration-200 ${
        isActive 
          ? 'ring-2 ring-primary shadow-lg shadow-primary/20 scale-105' 
          : 'ring-1 ring-border/50 hover:ring-primary/50 hover:scale-105'
      }`}
      onClick={onClick}
      style={{
        // CSS transforms instead of JS-based animations
        transform: isActive ? 'scale(1.05)' : undefined,
        transition: shouldAnimate ? 'transform 0.2s ease-out, box-shadow 0.2s ease-out' : 'none',
      }}
    >
      {/* Image stays mounted, no lazy loading inside modal */}
      <img 
        src={src} 
        alt={`Page ${index + 1}`}
        className="w-16 h-20 object-cover"
        loading="eager"
        decoding="async"
      />
      
      {/* Page number badge */}
      <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-medium px-1.5 py-0.5 rounded ${
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-background/80 text-foreground'
      }`}>
        {index + 1}
      </div>

      {/* Glow effect for active - CSS only */}
      {isActive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 20px hsl(var(--primary) / 0.3)',
          }}
        />
      )}
    </div>
  );
});

Thumbnail.displayName = 'Thumbnail';

// Memoized ThumbnailBar component
export const ThumbnailBar = memo(({ previews, currentPage, onPageSelect }: ThumbnailBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { shouldAnimate } = usePerformanceSettings();

  // Memoized callback to prevent re-renders
  const handlePageSelect = useCallback((index: number) => {
    onPageSelect(index);
  }, [onPageSelect]);

  return (
    <div className="relative w-full">
      {/* Custom scrollbar container with passive scroll listener */}
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto py-3 px-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50 hover:scrollbar-thumb-primary"
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
        }}
      >
        {previews.map((preview, index) => (
          <Thumbnail
            key={index}
            src={preview}
            index={index}
            isActive={currentPage === index}
            onClick={() => handlePageSelect(index)}
            shouldAnimate={shouldAnimate}
          />
        ))}
      </div>

      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
    </div>
  );
});

ThumbnailBar.displayName = 'ThumbnailBar';
