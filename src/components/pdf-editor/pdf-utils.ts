import * as pdfjsLib from 'pdfjs-dist';
import type { PdfTextField } from './types';

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

export async function extractPdfData(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  // Make a copy because pdfjs detaches the original ArrayBuffer
  const arrayBufferCopy = arrayBuffer.slice(0);
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: { width: number; height: number; canvas: HTMLCanvasElement; bgCanvas: HTMLCanvasElement }[] = [];
  const fields: PdfTextField[] = [];
  let fieldId = 0;

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 1.5 });

    // Render full page to canvas (with text)
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Extract text content
    const textContent = await page.getTextContent();
    const scale = 1.5;
    const pageFieldsTemp: typeof fields = [];

    for (const item of textContent.items) {
      if (!('str' in item) || !item.str.trim()) continue;

      const fontName = (item.fontName || '').toLowerCase();
      // Only extract fields using FreeMono/Courier (editable data fields)
      // Skip template labels (Helvetica, Arial, etc.)
      const isEditableFont = fontName.includes('mono') || fontName.includes('courier') || fontName.includes('free');
      if (!isEditableFont) continue;

      const tx = item.transform;
      const fontSize = Math.abs(tx[0]);
      const x = tx[4] * scale;
      const y = viewport.height - (tx[5] * scale) - (fontSize * scale);
      const width = (item.width || fontSize * item.str.length * 0.6) * scale;
      const height = fontSize * scale * 1.2;

      pageFieldsTemp.push({
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

    // Create background-only canvas by sampling surrounding pixels to fill text areas
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = viewport.width;
    bgCanvas.height = viewport.height;
    const bgCtx = bgCanvas.getContext('2d')!;
    bgCtx.drawImage(canvas, 0, 0);

    // For each text field, fill white over the text area (minimal coverage)
    for (const f of pageFieldsTemp) {
      bgCtx.fillStyle = '#FFFFFF';
      bgCtx.fillRect(f.x, f.y, f.width, f.height);
    }

    pages.push({ width: viewport.width, height: viewport.height, canvas, bgCanvas });
    fields.push(...pageFieldsTemp);
  }

  return { pdf, pages, fields, arrayBuffer: arrayBufferCopy };
}
