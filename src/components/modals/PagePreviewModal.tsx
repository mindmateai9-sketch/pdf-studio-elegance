import { memo, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { usePerformanceSettings } from '@/hooks/use-performance';

interface PagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  pagePreviews: string[];
  onPageChange: (page: number) => void;
}

// Modal component - Framer Motion is allowed here per requirements
export const PagePreviewModal = memo(({
  open,
  onClose,
  currentPage,
  totalPages,
  pagePreviews,
  onPageChange,
}: PagePreviewModalProps) => {
  const [zoom, setZoom] = useState(1);
  const { prefersReducedMotion, shouldUseBlur } = usePerformanceSettings();

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevPage();
          break;
        case 'ArrowRight':
          handleNextPage();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handlePrevPage, handleNextPage, onClose, handleZoomIn, handleZoomOut]);

  // Reset zoom when page changes
  useEffect(() => {
    setZoom(1);
  }, [currentPage]);

  if (!open) return null;

  // Simplified animation variants - respects reduced motion
  const fadeVariants = prefersReducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Backdrop - no blur on mobile */}
        <motion.div
          className={`absolute inset-0 bg-background/90 ${shouldUseBlur ? 'backdrop-blur-xl' : ''}`}
          onClick={onClose}
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-full h-full p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between w-full max-w-4xl mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              
              {/* Zoom controls */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                <button
                  onClick={handleZoomOut}
                  className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Page viewer */}
          <div className="flex-1 flex items-center justify-center gap-4 w-full max-w-4xl overflow-hidden">
            {/* Prev button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>

            {/* Page image - stays mounted, no AnimatePresence on page change for mobile */}
            <div className="flex-1 flex items-center justify-center overflow-auto max-h-[70vh]">
              <div
                className="relative rounded-xl overflow-hidden shadow-2xl border border-border/50"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease-out',
                }}
              >
                {pagePreviews[currentPage - 1] && pagePreviews[currentPage - 1].length > 0 ? (
                  <img
                    src={pagePreviews[currentPage - 1]}
                    alt={`Page ${currentPage}`}
                    className="max-h-[60vh] w-auto object-contain"
                    draggable={false}
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div className="w-64 h-80 bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground">
                      {currentPage > pagePreviews.length ? 'Preview not available for this page' : 'Loading...'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* Keyboard hints - hidden on mobile */}
          <div className="mt-4 hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-secondary border border-border">←</kbd>
              <kbd className="px-2 py-1 rounded bg-secondary border border-border">→</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-secondary border border-border">+</kbd>
              <kbd className="px-2 py-1 rounded bg-secondary border border-border">-</kbd>
              Zoom
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-secondary border border-border">ESC</kbd>
              Close
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

PagePreviewModal.displayName = 'PagePreviewModal';
