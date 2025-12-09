import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, FileDown, Shield } from 'lucide-react';
import { Modal } from './Modal';
import { useModalStore } from '@/stores/modalStore';
import { compressPdf } from '@/lib/pdfUtils';

const options = [
  {
    id: 'optimal' as const,
    icon: Zap,
    title: 'Optimal',
    description: 'Best balance of size and quality',
    recommended: true,
  },
  {
    id: 'small' as const,
    icon: FileDown,
    title: 'Small File',
    description: 'Maximum compression, smaller file',
    recommended: false,
  },
  {
    id: 'lossless' as const,
    icon: Shield,
    title: 'Lossless',
    description: 'Preserve original quality',
    recommended: false,
  },
];

export const CompressOptionsModal = () => {
  const {
    modalType,
    file,
    compressionLevel,
    closeModal,
    openModal,
    setCompressionLevel,
    setProcessedBlob,
    setCompressionStats,
    setError,
  } = useModalStore();

  const handleCompress = useCallback(async () => {
    if (!file) return;

    openModal('progress', 'compress');

    try {
      const originalSize = file.size;
      const compressedPdf = await compressPdf(file, compressionLevel);
      const compressedSize = compressedPdf.size;
      const reduction = Math.round((1 - compressedSize / originalSize) * 100);

      setCompressionStats({
        originalSize,
        compressedSize,
        reduction: Math.max(0, reduction),
      });

      const fileName = file.name.replace('.pdf', '_compressed.pdf');
      setProcessedBlob(compressedPdf, fileName);
      openModal('success', 'compress');
    } catch (error) {
      console.error('Compression failed:', error);
      setError('Failed to compress PDF. Please try again.');
      openModal('error', 'compress');
    }
  }, [file, compressionLevel, openModal, setProcessedBlob, setCompressionStats, setError]);

  return (
    <Modal
      open={modalType === 'compress-options'}
      onClose={closeModal}
      title="Compression Options"
      subtitle="Choose how you want to compress your PDF"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          {options.map((option) => (
            <motion.button
              key={option.id}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                compressionLevel === option.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/30 hover:border-muted-foreground/30'
              }`}
              onClick={() => setCompressionLevel(option.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    compressionLevel === option.id
                      ? 'gradient-gold'
                      : 'bg-secondary'
                  }`}
                >
                  <option.icon
                    className={`w-5 h-5 ${
                      compressionLevel === option.id
                        ? 'text-background'
                        : 'text-muted-foreground'
                    }`}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {option.title}
                    </span>
                    {option.recommended && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full gradient-gold text-background">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
                
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    compressionLevel === option.id
                      ? 'border-primary'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {compressionLevel === option.id && (
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full gradient-gold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button
            className="btn-secondary flex-1"
            onClick={() => openModal('upload', 'compress')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>
          
          <motion.button
            className="btn-primary flex-1"
            onClick={handleCompress}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Compress PDF
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};
