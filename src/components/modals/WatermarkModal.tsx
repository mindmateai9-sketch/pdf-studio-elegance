import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Modal } from './Modal';
import { useModalStore } from '@/stores/modalStore';
import { addWatermark } from '@/lib/pdfUtils';

export const WatermarkModal = () => {
  const {
    modalType,
    file,
    watermarkConfig,
    closeModal,
    openModal,
    setWatermarkConfig,
    setProcessedBlob,
    setError,
  } = useModalStore();

  const handleApplyWatermark = useCallback(async () => {
    if (!file) return;

    openModal('progress', 'watermark');

    try {
      const watermarkedPdf = await addWatermark(file, watermarkConfig);
      const fileName = file.name.replace('.pdf', '_watermarked.pdf');
      setProcessedBlob(watermarkedPdf, fileName);
      openModal('success', 'watermark');
    } catch (error) {
      console.error('Watermark failed:', error);
      setError('Failed to add watermark. Please try again.');
      openModal('error', 'watermark');
    }
  }, [file, watermarkConfig, openModal, setProcessedBlob, setError]);

  return (
    <Modal
      open={modalType === 'watermark'}
      onClose={closeModal}
      title="Add Watermark"
      subtitle="Configure your watermark settings"
    >
      <div className="space-y-5">
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

        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Preview</p>
          <div className="relative h-24 bg-muted/20 rounded-lg overflow-hidden flex items-center justify-center">
            <span
              className="text-primary/50 font-medium select-none"
              style={{
                fontSize: `${Math.min(watermarkConfig.fontSize / 3, 24)}px`,
                opacity: watermarkConfig.opacity,
                transform: `rotate(${watermarkConfig.rotation}deg)`,
              }}
            >
              {watermarkConfig.text || 'WATERMARK'}
            </span>
          </div>
        </div>

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
            className="btn-primary flex-1"
            onClick={handleApplyWatermark}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Apply Watermark
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};
