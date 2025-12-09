import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';

interface ThumbnailBarProps {
  previews: string[];
  currentPage: number;
  onPageSelect: (page: number) => void;
}

const Thumbnail = ({ 
  src, 
  index, 
  isActive, 
  onClick 
}: { 
  src: string; 
  index: number; 
  isActive: boolean; 
  onClick: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHover(false);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
        isActive 
          ? 'ring-2 ring-primary shadow-lg shadow-primary/20' 
          : 'ring-1 ring-border/50 hover:ring-primary/50'
      }`}
      style={{
        perspective: 1000,
        rotateX: hover ? rotateX : 0,
        rotateY: hover ? rotateY : 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.98 }}
    >
      <img 
        src={src} 
        alt={`Page ${index + 1}`}
        className="w-16 h-20 object-cover"
      />
      
      {/* Page number badge */}
      <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-medium px-1.5 py-0.5 rounded ${
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-background/80 text-foreground backdrop-blur-sm'
      }`}>
        {index + 1}
      </div>

      {/* Glow effect for active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            boxShadow: 'inset 0 0 20px hsl(var(--primary) / 0.3)',
          }}
        />
      )}
    </motion.div>
  );
};

export const ThumbnailBar = ({ previews, currentPage, onPageSelect }: ThumbnailBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full">
      {/* Custom scrollbar container */}
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
            onClick={() => onPageSelect(index)}
          />
        ))}
      </div>

      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
    </div>
  );
};
