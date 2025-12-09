import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Check } from 'lucide-react';
import { Modal } from './Modal';
import { useModalStore } from '@/stores/modalStore';

export const SuccessModal = () => {
  const {
    modalType,
    toolType,
    processedBlob,
    processedFileName,
    compressionStats,
    closeModal,
    openModal,
    reset,
  } = useModalStore();

  const handleDownload = useCallback(() => {
    if (processedBlob) {
      const url = URL.createObjectURL(processedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = processedFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [processedBlob, processedFileName]);

  const handleNewFile = useCallback(() => {
    reset();
    openModal('upload', toolType);
  }, [reset, openModal, toolType]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMessage = () => {
    switch (toolType) {
      case 'extract':
        return 'Pages extracted successfully!';
      case 'compress':
        return 'PDF compressed successfully!';
      case 'watermark':
        return 'Watermark added successfully!';
      case 'rotate':
        return 'PDF rotated successfully!';
      default:
        return 'Done!';
    }
  };

  return (
    <Modal
      open={modalType === 'success'}
      onClose={() => {
        closeModal();
        reset();
      }}
      showClose={false}
    >
      <div className="flex flex-col items-center py-6">
        <motion.div
          className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mb-6 glow-gold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Check className="w-10 h-10 text-background" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.h2
          className="text-xl font-semibold text-foreground mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {getMessage()}
        </motion.h2>

        <motion.p
          className="text-sm text-muted-foreground mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Your file is ready to download
        </motion.p>

        {toolType === 'compress' && compressionStats.reduction > 0 && (
          <motion.div
            className="w-full p-4 rounded-xl bg-secondary/30 border border-border mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Original size</span>
              <span className="text-foreground font-medium">
                {formatFileSize(compressionStats.originalSize)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Compressed size</span>
              <span className="text-foreground font-medium">
                {formatFileSize(compressionStats.compressedSize)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Size reduced by</span>
              <span className="gradient-gold-text font-semibold">
                {compressionStats.reduction}%
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          className="w-full space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            className="btn-primary w-full flex items-center justify-center gap-2"
            onClick={handleDownload}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5" />
            Download PDF
          </motion.button>

          <motion.button
            className="btn-secondary w-full flex items-center justify-center gap-2"
            onClick={handleNewFile}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-4 h-4" />
            Process Another File
          </motion.button>
        </motion.div>
      </div>
    </Modal>
  );
};
