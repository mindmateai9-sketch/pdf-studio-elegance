import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return pdfDoc.getPageCount();
}

export async function generatePagePreviews(
  file: File,
  maxPages: number = 10
): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const previews: string[] = [];

    const pagesToRender = Math.min(pdf.numPages, maxPages);

    for (let i = 1; i <= pagesToRender; i++) {
      const page = await pdf.getPage(i);
      const scale = 0.3;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext('2d')!;
      await page.render({ canvasContext: context, viewport }).promise;

      previews.push(canvas.toDataURL('image/jpeg', 0.6));
    }

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
  }
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(config.text, config.fontSize);

    page.drawText(config.text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: config.fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: config.opacity,
      rotate: degrees(config.rotation),
    });
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
