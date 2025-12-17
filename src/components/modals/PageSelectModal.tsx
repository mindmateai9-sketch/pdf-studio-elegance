import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Expand } from 'lucide-react';
import { Modal } from './Modal';
import { PagePreviewModal } from './PagePreviewModal';
import { useModalStore } from '@/stores/modalStore';
import { getPdfPageCount, generatePagePreviews, extractPages } from '@/lib/pdfUtils';

export const PageSelectModal = () => {
  const {
    modalType,
    file,
    selectedPages,
    totalPages,
    pagePreviews,
    closeModal,
    openModal,
    setSelectedPages,
    setTotalPages,
    setPagePreviews,
    setProcessedBlob,
    setError,
  } = useModalStore();

  const [rangeInput, setRangeInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [previewPage, setPreviewPage] = useState<number | null>(null);

  useEffect(() => {
    const loadPdfInfo = async () => {
      if (file && modalType === 'page-select') {
        setIsLoading(true);
        try {
          const pageCount = await getPdfPageCount(file);
          setTotalPages(pageCount);
          
          const previews = await generatePagePreviews(file, Math.min(pageCount, 50));
          setPagePreviews(previews);
        } catch (error) {
          console.error('Failed to load PDF:', error);
          setError('Failed to load PDF. Please try again.');
          openModal('error', 'extract');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPdfInfo();
  }, [file, modalType, setTotalPages, setPagePreviews, setError, openModal]);

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

  const handleExtract = useCallback(async () => {
    if (!file || selectedPages.length === 0) return;

    openModal('progress', 'extract');

    try {
      const extractedPdf = await extractPages(file, selectedPages);
      const fileName = file.name.replace('.pdf', `_extracted.pdf`);
      setProcessedBlob(extractedPdf, fileName);
      openModal('success', 'extract');
    } catch (error) {
      console.error('Extraction failed:', error);
      setError('Failed to extract pages. Please try again.');
      openModal('error', 'extract');
    }
  }, [file, selectedPages, openModal, setProcessedBlob, setError]);

  return (
    <>
      <Modal
        open={modalType === 'page-select'}
        onClose={closeModal}
        title="Select Pages"
        subtitle={`Choose which pages to extract from your ${totalPages}-page PDF`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <input
              type="text"
              value={rangeInput}
              onChange={handleRangeChange}
              placeholder="e.g., 1-5, 9, 11-13"
              className="flex-1 min-w-[150px] px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <motion.button
              onClick={selectAll}
              className="flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium bg-secondary/50 border border-border hover:border-primary/30 transition-colors whitespace-nowrap"
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

          <div className="flex gap-3 pt-2">
            <motion.button
              className="btn-secondary flex-1"
              onClick={() => openModal('upload', 'extract')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back
            </motion.button>
            
            <motion.button
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleExtract}
              disabled={selectedPages.length === 0}
              whileHover={selectedPages.length > 0 ? { scale: 1.02 } : {}}
              whileTap={selectedPages.length > 0 ? { scale: 0.98 } : {}}
            >
              Extract {selectedPages.length} Pages
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