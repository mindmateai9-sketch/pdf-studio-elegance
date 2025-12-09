import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Minimize
} from 'lucide-react';
import { ThumbnailBar } from './ThumbnailBar';
import { useModalStore } from '@/stores/modalStore';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  onClose: () => void;
  onContinue: () => void;
}

export const PDFViewer = ({ file, onClose, onContinue }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState<'width' | 'page' | 'custom'>('page');
  const [containerWidth, setContainerWidth] = useState(800);
  const [previews, setPreviews] = useState<string[]>([]);
  const { toolType } = useModalStore();

  // Generate thumbnails
  useEffect(() => {
    const generatePreviews = async () => {
      if (!file) return;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const previewUrls: string[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        previewUrls.push(canvas.toDataURL());
      }
      
      setPreviews(previewUrls);
    };
    
    generatePreviews();
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
    setFitMode('custom');
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
    setFitMode('custom');
  }, []);

  const handleFitWidth = useCallback(() => {
    setFitMode('width');
    setZoom(1);
  }, []);

  const handleFitPage = useCallback(() => {
    setFitMode('page');
    setZoom(1);
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, numPages - 1));
  }, [numPages]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          handleNextPage();
          break;
        case 'ArrowLeft':
          handlePrevPage();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage, handleZoomIn, handleZoomOut, onClose]);

  // Measure container
  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(Math.min(window.innerWidth - 100, 1000));
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const getPageWidth = () => {
    if (fitMode === 'width') return containerWidth;
    if (fitMode === 'page') return containerWidth * 0.8;
    return containerWidth * zoom;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />

      {/* Header Controls */}
      <motion.div
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/50 glass"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onClose}
            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
          
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{file.name}</span>
            <span className="mx-2">•</span>
            <span>{numPages} pages</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 border border-border/50">
            <motion.button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-secondary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>
            
            <span className="w-12 text-center text-sm font-medium">
              {Math.round(zoom * 100)}%
            </span>
            
            <motion.button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-secondary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ZoomIn className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Fit controls */}
          <motion.button
            onClick={handleFitWidth}
            className={`p-2 rounded-lg transition-colors ${
              fitMode === 'width' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Fit to width"
          >
            <Maximize className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={handleFitPage}
            className={`p-2 rounded-lg transition-colors ${
              fitMode === 'page' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Fit to page"
          >
            <Minimize className="w-4 h-4" />
          </motion.button>

          {/* Page navigation */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 border border-border/50 ml-2">
            <motion.button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="p-1.5 rounded hover:bg-secondary transition-colors disabled:opacity-30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            
            <span className="w-20 text-center text-sm font-medium">
              {currentPage + 1} / {numPages}
            </span>
            
            <motion.button
              onClick={handleNextPage}
              disabled={currentPage === numPages - 1}
              className="p-1.5 rounded hover:bg-secondary transition-colors disabled:opacity-30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <motion.button
          onClick={onContinue}
          className="btn-primary text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue with {toolType}
        </motion.button>
      </motion.div>

      {/* PDF Display */}
      <div className="flex-1 relative overflow-auto flex items-center justify-center p-8">
        <motion.div
          className="relative rounded-xl overflow-hidden glass-gold"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px hsl(var(--primary) / 0.1)',
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        >
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Page
                  pageNumber={currentPage + 1}
                  width={getPageWidth()}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </motion.div>
            </AnimatePresence>
          </Document>
        </motion.div>
      </div>

      {/* Thumbnail Bar */}
      <motion.div
        className="relative z-10 border-t border-border/50 glass"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ThumbnailBar
          previews={previews}
          currentPage={currentPage}
          onPageSelect={setCurrentPage}
        />
      </motion.div>
    </motion.div>
  );
};
