import * as pdfjsLib from 'pdfjs-dist';
import type { PdfTextField } from './types';

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

export async function extractPdfData(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  // Make a copy because pdfjs detaches the original ArrayBuffer
  const arrayBufferCopy = arrayBuffer.slice(0);
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: { width: number; height: number; canvas: HTMLCanvasElement }[] = [];
  const fields: PdfTextField[] = [];
  let fieldId = 0;

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 1.5 });

    // Render page to canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;

    pages.push({ width: viewport.width, height: viewport.height, canvas });

    // Extract text content
    const textContent = await page.getTextContent();
    const scale = 1.5;

    for (const item of textContent.items) {
      if (!('str' in item) || !item.str.trim()) continue;

      const tx = item.transform;
      // tx[4] = x, tx[5] = y (from bottom), tx[0] = scaleX (fontSize approx)
      const fontSize = Math.abs(tx[0]);
      const x = tx[4] * scale;
      const y = viewport.height - (tx[5] * scale) - (fontSize * scale);
      const width = (item.width || fontSize * item.str.length * 0.6) * scale;
      const height = fontSize * scale * 1.2;

      fields.push({
        id: `field-${fieldId++}`,
        text: item.str,
        x,
        y,
        width: Math.max(width, 20),
        height: Math.max(height, 14),
        fontSize: fontSize * scale,
        fontFamily: item.fontName || 'Helvetica',
        color: '#000000',
        pageIndex: i,
        originalText: item.str,
        visible: true,
      });
    }
  }

  return { pdf, pages, fields, arrayBuffer: arrayBufferCopy };
}
