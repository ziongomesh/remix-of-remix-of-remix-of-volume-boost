import { PDFDocument } from 'pdf-lib';

// Coordenadas calibradas (% do PDF) - da ferramenta /teste6
const POSITIONS = {
  matrizFrente: { x: 3.5, y: 6.5, w: 45.5, h: 30.5 },
  matrizVerso:  { x: 3.5, y: 38.5, w: 45.5, h: 25.5 },
  qrcode:       { x: 66.7, y: 10.5, w: 22.7, h: 16.5 },
};

// A4 dimensions in points
const PAGE_W = 595;
const PAGE_H = 842;

async function loadImageBytes(src: string): Promise<Uint8Array> {
  // Handle base64 data URLs
  if (src.startsWith('data:')) {
    const base64 = src.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  // Handle regular URLs
  const resp = await fetch(src);
  return new Uint8Array(await resp.arrayBuffer());
}

function isPng(bytes: Uint8Array): boolean {
  return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
}

export async function generateChaPdf(
  baseImageUrl: string,
  matrizFrenteBase64: string,
  matrizVersoBase64: string,
  qrcodeBase64: string,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  // 1. Embed base image as full-page background
  const baseBytes = await loadImageBytes(baseImageUrl);
  const baseImg = isPng(baseBytes)
    ? await pdfDoc.embedPng(baseBytes)
    : await pdfDoc.embedJpg(baseBytes);
  page.drawImage(baseImg, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });

  // Helper: convert % position to PDF coordinates (y is from bottom in PDF)
  const place = (pos: { x: number; y: number; w: number; h: number }) => ({
    x: (pos.x / 100) * PAGE_W,
    y: PAGE_H - ((pos.y / 100) * PAGE_H) - ((pos.h / 100) * PAGE_H),
    width: (pos.w / 100) * PAGE_W,
    height: (pos.h / 100) * PAGE_H,
  });

  // 2. Embed Matriz Frente
  if (matrizFrenteBase64) {
    try {
      const frenteBytes = await loadImageBytes(matrizFrenteBase64);
      const frenteImg = isPng(frenteBytes)
        ? await pdfDoc.embedPng(frenteBytes)
        : await pdfDoc.embedJpg(frenteBytes);
      page.drawImage(frenteImg, place(POSITIONS.matrizFrente));
    } catch (e) {
      console.error('Erro ao embutir matriz frente:', e);
    }
  }

  // 3. Embed Matriz Verso
  if (matrizVersoBase64) {
    try {
      const versoBytes = await loadImageBytes(matrizVersoBase64);
      const versoImg = isPng(versoBytes)
        ? await pdfDoc.embedPng(versoBytes)
        : await pdfDoc.embedJpg(versoBytes);
      page.drawImage(versoImg, place(POSITIONS.matrizVerso));
    } catch (e) {
      console.error('Erro ao embutir matriz verso:', e);
    }
  }

  // 4. Embed QR Code
  if (qrcodeBase64) {
    try {
      const qrBytes = await loadImageBytes(qrcodeBase64);
      const qrImg = isPng(qrBytes)
        ? await pdfDoc.embedPng(qrBytes)
        : await pdfDoc.embedJpg(qrBytes);
      page.drawImage(qrImg, place(POSITIONS.qrcode));
    } catch (e) {
      console.error('Erro ao embutir QR code:', e);
    }
  }

  return await pdfDoc.save();
}

export function downloadPdfBlob(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
