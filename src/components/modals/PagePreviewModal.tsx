import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface PagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  pagePreviews: string[];
  onPageChange: (page: number) => void;
}

export const PagePreviewModal = ({
  open,
  onClose,
  currentPage,
  totalPages,
  pagePreviews,
  onPageChange,
}: PagePreviewModalProps) => {
  const [zoom, setZoom] = useState(1);

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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handlePrevPage, handleNextPage, onClose, handleZoomIn, handleZoomOut]);

  // Reset zoom when page changes
  useEffect(() => {
    setZoom(1);
  }, [currentPage]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-background/90 backdrop-blur-xl"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-full h-full p-4 md:p-8">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between w-full max-w-4xl mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              
              {/* Zoom controls */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                <motion.button
                  onClick={handleZoomOut}
                  className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ZoomOut className="w-4 h-4" />
                </motion.button>
                <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <motion.button
                  onClick={handleZoomIn}
                  className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ZoomIn className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <motion.button
              onClick={onClose}
              className="p-2 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-foreground" />
            </motion.button>
          </motion.div>

          {/* Page viewer */}
          <div className="flex-1 flex items-center justify-center gap-4 w-full max-w-4xl overflow-hidden">
            {/* Prev button */}
            <motion.button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={currentPage > 1 ? { scale: 1.1 } : {}}
              whileTap={currentPage > 1 ? { scale: 0.9 } : {}}
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </motion.button>

            {/* Page image */}
            <motion.div
              className="flex-1 flex items-center justify-center overflow-auto max-h-[70vh]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  className="relative rounded-xl overflow-hidden shadow-2xl border border-border/50"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                >
                  {pagePreviews[currentPage - 1] && pagePreviews[currentPage - 1].length > 0 ? (
                    <img
                      src={pagePreviews[currentPage - 1]}
                      alt={`Page ${currentPage}`}
                      className="max-h-[60vh] w-auto object-contain"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-64 h-80 bg-secondary flex items-center justify-center">
                      <span className="text-muted-foreground">
                        {currentPage > pagePreviews.length ? 'Preview not available for this page' : 'Loading...'}
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Next button */}
            <motion.button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={currentPage < totalPages ? { scale: 1.1 } : {}}
              whileTap={currentPage < totalPages ? { scale: 0.9 } : {}}
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </motion.button>
          </div>

          {/* Keyboard hints */}
          <motion.div
            className="mt-4 flex items-center gap-4 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
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
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};