import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Expand } from 'lucide-react';
import { Modal } from './Modal';
import { PagePreviewModal } from './PagePreviewModal';
import { useModalStore } from '@/stores/modalStore';
import { getPdfPageCount, generatePagePreviews, addWatermark } from '@/lib/pdfUtils';

export const WatermarkModal = () => {
  const {
    modalType,
    file,
    watermarkConfig,
    selectedPages,
    totalPages,
    pagePreviews,
    closeModal,
    openModal,
    setWatermarkConfig,
    setSelectedPages,
    setTotalPages,
    setPagePreviews,
    setProcessedBlob,
    setError,
  } = useModalStore();

  const [isLoading, setIsLoading] = useState(true);
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [applyScope, setApplyScope] = useState<'all' | 'selected'>('all');

  useEffect(() => {
    const loadPdfInfo = async () => {
      if (file && modalType === 'watermark') {
        setIsLoading(true);
        try {
          const pageCount = await getPdfPageCount(file);
          setTotalPages(pageCount);
          
          const previews = await generatePagePreviews(file, Math.min(pageCount, 50));
          setPagePreviews(previews);
          
          // Select all pages by default
          const allPages = Array.from({ length: pageCount }, (_, i) => i + 1);
          setSelectedPages(allPages);
        } catch (error) {
          console.error('Failed to load PDF:', error);
          setError('Failed to load PDF. Please try again.');
          openModal('error', 'watermark');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPdfInfo();
  }, [file, modalType, setTotalPages, setPagePreviews, setSelectedPages, setError, openModal]);

  const togglePage = useCallback(
    (page: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedPages(
        selectedPages.includes(page)
          ? selectedPages.filter((p) => p !== page)
          : [...selectedPages, page].sort((a, b) => a - b)
      );
    },
    [selectedPages, setSelectedPages]
  );

  const handlePageClick = useCallback((page: number) => {
    setPreviewPage(page);
  }, []);

  const selectAll = useCallback(() => {
    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    setSelectedPages(allPages);
  }, [totalPages, setSelectedPages]);

  const handleApplyWatermark = useCallback(async () => {
    if (!file) return;

    const pagesToApply = applyScope === 'all' 
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : selectedPages;

    if (pagesToApply.length === 0) return;

    openModal('progress', 'watermark');

    try {
      const watermarkedPdf = await addWatermark(file, watermarkConfig, pagesToApply);
      const fileName = file.name.replace('.pdf', '_watermarked.pdf');
      setProcessedBlob(watermarkedPdf, fileName);
      openModal('success', 'watermark');
    } catch (error) {
      console.error('Watermark failed:', error);
      setError('Failed to add watermark. Please try again.');
      openModal('error', 'watermark');
    }
  }, [file, watermarkConfig, applyScope, totalPages, selectedPages, openModal, setProcessedBlob, setError]);

  return (
    <>
      <Modal
        open={modalType === 'watermark'}
        onClose={closeModal}
        title="Add Watermark"
        subtitle="Configure your watermark and select pages"
        size="lg"
      >
        <div className="space-y-5">
          {/* Watermark Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermarkConfig.text}
                onChange={(e) => setWatermarkConfig({ text: e.target.value })}
                placeholder="Enter watermark text"
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            <div className="p-3 rounded-xl bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <div className="relative h-16 bg-muted/20 rounded-lg overflow-hidden flex items-center justify-center">
                <span
                  className="text-primary/50 font-medium select-none"
                  style={{
                    fontSize: `${Math.min(watermarkConfig.fontSize / 4, 18)}px`,
                    opacity: watermarkConfig.opacity,
                    transform: `rotate(${watermarkConfig.rotation}deg)`,
                  }}
                >
                  {watermarkConfig.text || 'WATERMARK'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Font Size: {watermarkConfig.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="120"
                value={watermarkConfig.fontSize}
                onChange={(e) =>
                  setWatermarkConfig({ fontSize: parseInt(e.target.value, 10) })
                }
                className="w-full h-2 rounded-full bg-secondary appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Opacity: {Math.round(watermarkConfig.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={watermarkConfig.opacity}
                onChange={(e) =>
                  setWatermarkConfig({ opacity: parseFloat(e.target.value) })
                }
                className="w-full h-2 rounded-full bg-secondary appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rotation: {watermarkConfig.rotation}°
              </label>
              <input
                type="range"
                min="-90"
                max="90"
                value={watermarkConfig.rotation}
                onChange={(e) =>
                  setWatermarkConfig({ rotation: parseInt(e.target.value, 10) })
                }
                className="w-full h-2 rounded-full bg-secondary appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* Apply Scope Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Apply to
            </label>
            <div className="flex gap-3">
              <motion.button
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  applyScope === 'all'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-secondary/30 text-muted-foreground hover:border-muted-foreground/30'
                }`}
                onClick={() => setApplyScope('all')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                All Pages ({totalPages})
              </motion.button>

              <motion.button
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  applyScope === 'selected'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-secondary/30 text-muted-foreground hover:border-muted-foreground/30'
                }`}
                onClick={() => setApplyScope('selected')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Selected Pages ({selectedPages.length})
              </motion.button>
            </div>
          </div>

          {/* Page Selection */}
          {applyScope === 'selected' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Select Pages
                </label>
                <motion.button
                  onClick={selectAll}
                  className="text-xs text-primary hover:underline"
                  whileHover={{ scale: 1.02 }}
                >
                  Select All
                </motion.button>
              </div>
              
              <div className="max-h-48 overflow-x-auto py-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex gap-3 pb-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <motion.div
                        key={page}
                        className={`page-thumbnail flex-shrink-0 cursor-pointer group ${
                          selectedPages.includes(page) ? 'selected' : ''
                        }`}
                        onClick={() => handlePageClick(page)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="w-14 h-18 bg-secondary/50 flex items-center justify-center relative rounded-lg overflow-hidden">
                          {pagePreviews[page - 1] ? (
                            <img
                              src={pagePreviews[page - 1]}
                              alt={`Page ${page}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">{page}</span>
                          )}
                          
                          {/* Expand icon on hover */}
                          <motion.div
                            className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            initial={false}
                          >
                            <Expand className="w-3 h-3 text-foreground" />
                          </motion.div>
                          
                          {/* Selection checkbox */}
                          <motion.button
                            className={`absolute top-1 right-1 w-4 h-4 rounded flex items-center justify-center transition-all ${
                              selectedPages.includes(page)
                                ? 'gradient-gold'
                                : 'bg-background/80 border border-border hover:border-primary/50'
                            }`}
                            onClick={(e) => togglePage(page, e)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {selectedPages.includes(page) && (
                              <Check className="w-2.5 h-2.5 text-background" />
                            )}
                          </motion.button>
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-1">{page}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <motion.button
              className="btn-secondary flex-1"
              onClick={() => openModal('upload', 'watermark')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back
            </motion.button>
            
            <motion.button
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleApplyWatermark}
              disabled={applyScope === 'selected' && selectedPages.length === 0}
              whileHover={!(applyScope === 'selected' && selectedPages.length === 0) ? { scale: 1.02 } : {}}
              whileTap={!(applyScope === 'selected' && selectedPages.length === 0) ? { scale: 0.98 } : {}}
            >
              Apply Watermark
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Page Preview Modal */}
      <PagePreviewModal
        open={previewPage !== null}
        onClose={() => setPreviewPage(null)}
        currentPage={previewPage || 1}
        totalPages={totalPages}
        pagePreviews={pagePreviews}
        onPageChange={setPreviewPage}
      />
    </>
  );
};