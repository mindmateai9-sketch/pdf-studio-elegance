import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
import { Modal } from './Modal';
import { useModalStore } from '@/stores/modalStore';

export const UploadModal = () => {
  const { modalType, toolType, closeModal, setFile, openModal } = useModalStore();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedFile && toolType) {
      setFile(selectedFile);
      setSelectedFile(null);
      
      // Open PDF viewer first
      openModal('pdf-viewer', toolType);
    }
  }, [selectedFile, toolType, setFile, openModal]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getToolTitle = () => {
    switch (toolType) {
      case 'extract': return 'Extract Pages';
      case 'compress': return 'Compress PDF';
      case 'watermark': return 'Add Watermark';
      case 'rotate': return 'Rotate PDF';
      default: return 'Upload PDF';
    }
  };

  return (
    <Modal
      open={modalType === 'upload'}
      onClose={() => {
        setSelectedFile(null);
        closeModal();
      }}
      title={getToolTitle()}
      subtitle="Choose your PDF file to get started"
    >
      <div className="space-y-4">
        {!selectedFile ? (
          <label
            className={`upload-zone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="sr-only"
            />
            
            <motion.div
              className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mb-4"
              animate={{ scale: isDragging ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className="w-8 h-8 text-background" />
            </motion.div>
            
            <p className="text-foreground font-medium mb-1">
              Drop your PDF here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
          </label>
        ) : (
          <motion.div
            className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-background" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            <motion.button
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              onClick={handleRemoveFile}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        <div className="flex gap-3 pt-2">
          <motion.button
            className="btn-secondary flex-1"
            onClick={() => {
              setSelectedFile(null);
              closeModal();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          
          <motion.button
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleContinue}
            disabled={!selectedFile}
            whileHover={selectedFile ? { scale: 1.02 } : {}}
            whileTap={selectedFile ? { scale: 0.98 } : {}}
          >
            Continue
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};
