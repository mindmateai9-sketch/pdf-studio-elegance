import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, RotateCw, Check, Expand } from 'lucide-react';
import { Modal } from './Modal';
import { PagePreviewModal } from './PagePreviewModal';
import { useModalStore } from '@/stores/modalStore';
import { getPdfPageCount, generatePagePreviews, rotatePdf } from '@/lib/pdfUtils';

export const RotateModal = () => {
  const {
    modalType,
    file,
    rotateConfig,
    totalPages,
    selectedPages,
    pagePreviews,
    closeModal,
    openModal,
    setRotateConfig,
    setTotalPages,
    setSelectedPages,
    setPagePreviews,
    setProcessedBlob,
    setError,
  } = useModalStore();

  const [isLoading, setIsLoading] = useState(true);
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [rangeInput, setRangeInput] = useState('');

  useEffect(() => {
    const loadPdfInfo = async () => {
      if (file && modalType === 'rotate') {
        setIsLoading(true);
        try {
          const pageCount = await getPdfPageCount(file);
          setTotalPages(pageCount);
          
          const previews = await generatePagePreviews(file, Math.min(pageCount, 50));
          setPagePreviews(previews);
        } catch (error) {
          console.error('Failed to load PDF:', error);
          setError('Failed to load PDF. Please try again.');
          openModal('error', 'rotate');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPdfInfo();
  }, [file, modalType, setTotalPages, setPagePreviews, setError, openModal]);

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

  const parseRange = useCallback((input: string): number[] => {
    const pages: Set<number> = new Set();
    const parts = input.split(',').map((s) => s.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
          pages.add(num);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  }, [totalPages]);

  const handleRangeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setRangeInput(value);
      
      if (value.trim()) {
        const pages = parseRange(value);
        setSelectedPages(pages);
      }
    },
    [parseRange, setSelectedPages]
  );

  const togglePage = useCallback(
    (page: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedPages(
        selectedPages.includes(page)
          ? selectedPages.filter((p) => p !== page)
          : [...selectedPages, page].sort((a, b) => a - b)
      );
      setRangeInput('');
    },
    [selectedPages, setSelectedPages]
  );

  const handlePageClick = useCallback((page: number) => {
    setPreviewPage(page);
  }, []);

  const selectAll = useCallback(() => {
    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    setSelectedPages(allPages);
    setRangeInput(`1-${totalPages}`);
  }, [totalPages, setSelectedPages]);

  return (
    <>
      <Modal
        open={modalType === 'rotate'}
        onClose={closeModal}
        title="Rotate PDF"
        subtitle="Choose rotation direction and pages"
        size="lg"
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
                onClick={() => setRotateConfig({ scope: 'all' })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                All Pages ({totalPages})
              </motion.button>

              <motion.button
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  rotateConfig.scope === 'selected'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-secondary/30 text-muted-foreground hover:border-muted-foreground/30'
                }`}
                onClick={() => setRotateConfig({ scope: 'selected' })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Selected Pages ({selectedPages.length})
              </motion.button>
            </div>
          </div>

          {rotateConfig.scope === 'selected' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={handleRangeChange}
                  placeholder="e.g., 1-5, 9, 11-13"
                  className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <motion.button
                  onClick={selectAll}
                  className="px-4 py-3 rounded-xl text-sm font-medium bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Select All
                </motion.button>
              </div>
              
              <div className="max-h-64 overflow-x-auto py-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
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
                        <div className="w-16 h-20 bg-secondary/50 flex items-center justify-center relative rounded-lg overflow-hidden">
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
                            <Expand className="w-4 h-4 text-foreground" />
                          </motion.div>
                          
                          {/* Selection checkbox */}
                          <motion.button
                            className={`absolute top-1 right-1 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              selectedPages.includes(page)
                                ? 'gradient-gold'
                                : 'bg-background/80 border border-border hover:border-primary/50'
                            }`}
                            onClick={(e) => togglePage(page, e)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {selectedPages.includes(page) && (
                              <Check className="w-3 h-3 text-background" />
                            )}
                          </motion.button>
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-1">{page}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {selectedPages.length} of {totalPages} pages selected • Click thumbnail to preview
              </p>
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