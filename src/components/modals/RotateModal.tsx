import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, RotateCw, Check } from 'lucide-react';
import { Modal } from './Modal';
import { useModalStore } from '@/stores/modalStore';
import { getPdfPageCount, rotatePdf } from '@/lib/pdfUtils';

export const RotateModal = () => {
  const {
    modalType,
    file,
    rotateConfig,
    totalPages,
    selectedPages,
    closeModal,
    openModal,
    setRotateConfig,
    setTotalPages,
    setSelectedPages,
    setProcessedBlob,
    setError,
  } = useModalStore();

  const [showPageSelect, setShowPageSelect] = useState(false);

  useEffect(() => {
    const loadPageCount = async () => {
      if (file && modalType === 'rotate') {
        try {
          const pageCount = await getPdfPageCount(file);
          setTotalPages(pageCount);
        } catch (error) {
          console.error('Failed to load PDF:', error);
        }
      }
    };

    loadPageCount();
  }, [file, modalType, setTotalPages]);

  const handleRotate = useCallback(async () => {
    if (!file) return;

    openModal('progress', 'rotate');

    try {
      const degrees = rotateConfig.direction === 'left' ? -90 : 90;
      const pages =
        rotateConfig.scope === 'all'
          ? Array.from({ length: totalPages }, (_, i) => i + 1)
          : selectedPages;

      const rotatedPdf = await rotatePdf(file, degrees, pages);
      const fileName = file.name.replace('.pdf', '_rotated.pdf');
      setProcessedBlob(rotatedPdf, fileName);
      openModal('success', 'rotate');
    } catch (error) {
      console.error('Rotation failed:', error);
      setError('Failed to rotate PDF. Please try again.');
      openModal('error', 'rotate');
    }
  }, [file, rotateConfig, totalPages, selectedPages, openModal, setProcessedBlob, setError]);

  const togglePage = useCallback(
    (page: number) => {
      setSelectedPages(
        selectedPages.includes(page)
          ? selectedPages.filter((p) => p !== page)
          : [...selectedPages, page].sort((a, b) => a - b)
      );
    },
    [selectedPages, setSelectedPages]
  );

  return (
    <Modal
      open={modalType === 'rotate'}
      onClose={closeModal}
      title="Rotate PDF"
      subtitle="Choose rotation direction and pages"
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Rotation Direction
          </label>
          <div className="flex gap-3">
            <motion.button
              className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                rotateConfig.direction === 'left'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/30 hover:border-muted-foreground/30'
              }`}
              onClick={() => setRotateConfig({ direction: 'left' })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw
                className={`w-6 h-6 ${
                  rotateConfig.direction === 'left'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              />
              <span className="text-sm font-medium">Left 90°</span>
            </motion.button>

            <motion.button
              className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                rotateConfig.direction === 'right'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/30 hover:border-muted-foreground/30'
              }`}
              onClick={() => setRotateConfig({ direction: 'right' })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCw
                className={`w-6 h-6 ${
                  rotateConfig.direction === 'right'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              />
              <span className="text-sm font-medium">Right 90°</span>
            </motion.button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Apply to
          </label>
          <div className="flex gap-3">
            <motion.button
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                rotateConfig.scope === 'all'
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-secondary/30 text-muted-foreground hover:border-muted-foreground/30'
              }`}
              onClick={() => {
                setRotateConfig({ scope: 'all' });
                setShowPageSelect(false);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              All Pages
            </motion.button>

            <motion.button
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                rotateConfig.scope === 'selected'
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-secondary/30 text-muted-foreground hover:border-muted-foreground/30'
              }`}
              onClick={() => {
                setRotateConfig({ scope: 'selected' });
                setShowPageSelect(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Selected Pages
            </motion.button>
          </div>
        </div>

        {showPageSelect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-sm font-medium text-foreground mb-3">
              Select Pages ({selectedPages.length} selected)
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-xl bg-secondary/30 border border-border">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  className={`w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
                    selectedPages.includes(page)
                      ? 'gradient-gold text-background'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => togglePage(page)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {selectedPages.includes(page) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    page
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 pt-2">
          <motion.button
            className="btn-secondary flex-1"
            onClick={() => openModal('upload', 'rotate')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>

          <motion.button
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRotate}
            disabled={
              rotateConfig.scope === 'selected' && selectedPages.length === 0
            }
            whileHover={
              !(rotateConfig.scope === 'selected' && selectedPages.length === 0)
                ? { scale: 1.02 }
                : {}
            }
            whileTap={
              !(rotateConfig.scope === 'selected' && selectedPages.length === 0)
                ? { scale: 0.98 }
                : {}
            }
          >
            Rotate PDF
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};
