import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { getCachedPreviews, setCachedPreviews } from './pdfCache';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Performance constants
const MAX_CANVAS_WIDTH_MOBILE = 1100;
const MAX_CANVAS_WIDTH_DESKTOP = 1400;
const PREVIEW_SCALE = 0.3;
const PREVIEW_QUALITY = 0.6;

// Detect mobile for canvas sizing
const isMobileDevice = () => 
  typeof window !== 'undefined' && 
  (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
   window.innerWidth < 768);

export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return pdfDoc.getPageCount();
}

// Reusable canvas to avoid reallocation
let sharedCanvas: HTMLCanvasElement | null = null;
let sharedContext: CanvasRenderingContext2D | null = null;

function getSharedCanvas(): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedContext = sharedCanvas.getContext('2d')!;
  }
  return { canvas: sharedCanvas, context: sharedContext! };
}

export async function generatePagePreviews(
  file: File,
  maxPages: number = 10
): Promise<string[]> {
  // Check cache first - render once and reuse
  const cached = getCachedPreviews(file);
  if (cached && cached.length >= Math.min(maxPages, cached.length)) {
    return cached.slice(0, maxPages);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const previews: string[] = [];
    const pagesToRender = Math.min(pdf.numPages, maxPages);
    
    // Get max canvas width based on device
    const maxWidth = isMobileDevice() ? MAX_CANVAS_WIDTH_MOBILE : MAX_CANVAS_WIDTH_DESKTOP;
    
    // Use shared canvas to avoid reallocation
    const { canvas, context } = getSharedCanvas();

    for (let i = 1; i <= pagesToRender; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: PREVIEW_SCALE });
      
      // Cap canvas size for performance
      const scaledWidth = Math.min(viewport.width, maxWidth * PREVIEW_SCALE);
      const aspectRatio = viewport.height / viewport.width;
      const scaledHeight = scaledWidth * aspectRatio;
      
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      
      // Clear canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Use image-based rendering (not vector) for mobile performance
      await page.render({ 
        canvasContext: context, 
        viewport: page.getViewport({ 
          scale: scaledWidth / viewport.width * PREVIEW_SCALE 
        })
      }).promise;

      // Convert to JPEG for smaller size
      previews.push(canvas.toDataURL('image/jpeg', PREVIEW_QUALITY));
    }

    // Cache the results
    setCachedPreviews(file, previews);
    
    return previews;
  } catch (error) {
    console.error('Error generating previews:', error);
    return [];
  }
}

export async function extractPages(file: File, pageNumbers: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  for (const pageNum of pageNumbers) {
    const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
    newPdf.addPage(copiedPage);
  }

  const pdfBytes = await newPdf.save();
  return new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' });
}

export async function compressPdf(
  file: File,
  level: 'optimal' | 'small' | 'lossless'
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    updateMetadata: false,
  });

  // Simulate compression delay for UX
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // PDF-lib doesn't have true compression, but we can optimize
  const saveOptions: { useObjectStreams?: boolean } = {};
  
  if (level === 'small' || level === 'optimal') {
    saveOptions.useObjectStreams = true;
  }

  const pdfBytes = await pdfDoc.save(saveOptions);
  return new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' });
}

export async function addWatermark(
  file: File,
  config: {
    text: string;
    fontSize: number;
    opacity: number;
    rotation: number;
  },
  pageNumbers?: number[]
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  // If pageNumbers provided, only watermark those pages
  const pagesToWatermark = pageNumbers 
    ? pageNumbers.map(n => n - 1) 
    : pages.map((_, i) => i);

  for (const pageIndex of pagesToWatermark) {
    const page = pages[pageIndex];
    if (page) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(config.text, config.fontSize);

      page.drawText(config.text, {
        x: (width - textWidth) / 2,
        y: height / 2,
        size: config.fontSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: config.opacity,
        rotate: degrees(-config.rotation), // Invert rotation for correct visual direction
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' });
}

export async function rotatePdf(
  file: File,
  rotationDegrees: number,
  pageNumbers: number[]
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  for (const pageNum of pageNumbers) {
    const page = pages[pageNum - 1];
    if (page) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + rotationDegrees));
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' });
}
