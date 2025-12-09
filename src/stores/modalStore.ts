import { create } from 'zustand';

export type ModalType = 
  | 'upload'
  | 'progress'
  | 'page-select'
  | 'compress-options'
  | 'watermark'
  | 'rotate'
  | 'success'
  | 'error'
  | 'about'
  | 'pdf-viewer'
  | null;

export type ToolType = 'extract' | 'compress' | 'watermark' | 'rotate' | null;

interface ModalState {
  modalType: ModalType;
  toolType: ToolType;
  file: File | null;
  processedBlob: Blob | null;
  processedFileName: string;
  selectedPages: number[];
  totalPages: number;
  pagePreviews: string[];
  compressionLevel: 'optimal' | 'small' | 'lossless';
  watermarkConfig: {
    text: string;
    fontSize: number;
    opacity: number;
    rotation: number;
  };
  rotateConfig: {
    direction: 'left' | 'right';
    scope: 'all' | 'selected';
  };
  errorMessage: string;
  compressionStats: {
    originalSize: number;
    compressedSize: number;
    reduction: number;
  };
  
  // Actions
  openModal: (type: ModalType, tool?: ToolType) => void;
  closeModal: () => void;
  setFile: (file: File | null) => void;
  setProcessedBlob: (blob: Blob | null, fileName: string) => void;
  setSelectedPages: (pages: number[]) => void;
  setTotalPages: (total: number) => void;
  setPagePreviews: (previews: string[]) => void;
  setCompressionLevel: (level: 'optimal' | 'small' | 'lossless') => void;
  setWatermarkConfig: (config: Partial<ModalState['watermarkConfig']>) => void;
  setRotateConfig: (config: Partial<ModalState['rotateConfig']>) => void;
  setError: (message: string) => void;
  setCompressionStats: (stats: ModalState['compressionStats']) => void;
  reset: () => void;
}

const initialState = {
  modalType: null as ModalType,
  toolType: null as ToolType,
  file: null as File | null,
  processedBlob: null as Blob | null,
  processedFileName: '',
  selectedPages: [] as number[],
  totalPages: 0,
  pagePreviews: [] as string[],
  compressionLevel: 'optimal' as const,
  watermarkConfig: {
    text: 'CONFIDENTIAL',
    fontSize: 48,
    opacity: 0.3,
    rotation: -45,
  },
  rotateConfig: {
    direction: 'right' as const,
    scope: 'all' as const,
  },
  errorMessage: '',
  compressionStats: {
    originalSize: 0,
    compressedSize: 0,
    reduction: 0,
  },
};

export const useModalStore = create<ModalState>((set) => ({
  ...initialState,

  openModal: (type, tool) => set({ modalType: type, toolType: tool ?? null }),
  
  closeModal: () => set({ modalType: null }),
  
  setFile: (file) => set({ file }),
  
  setProcessedBlob: (blob, fileName) => set({ 
    processedBlob: blob, 
    processedFileName: fileName 
  }),
  
  setSelectedPages: (pages) => set({ selectedPages: pages }),
  
  setTotalPages: (total) => set({ totalPages: total }),
  
  setPagePreviews: (previews) => set({ pagePreviews: previews }),
  
  setCompressionLevel: (level) => set({ compressionLevel: level }),
  
  setWatermarkConfig: (config) => set((state) => ({
    watermarkConfig: { ...state.watermarkConfig, ...config }
  })),
  
  setRotateConfig: (config) => set((state) => ({
    rotateConfig: { ...state.rotateConfig, ...config }
  })),
  
  setError: (message) => set({ errorMessage: message }),
  
  setCompressionStats: (stats) => set({ compressionStats: stats }),
  
  reset: () => set(initialState),
}));
