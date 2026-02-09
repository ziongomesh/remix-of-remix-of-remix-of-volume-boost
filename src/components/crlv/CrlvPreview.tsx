import { useEffect, useRef, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface CrlvPreviewProps {
  form: UseFormReturn<any>;
  customQrPreview?: string | null;
}

// Coordinates from server/routes/crlv.ts (x, y from top)
const FIELD_MAP: { key: string; x: number; y: number; size: number }[] = [
  // LEFT COLUMN
  { key: 'renavam', x: 18, y: 115, size: 12 },
  { key: 'placa', x: 18, y: 146, size: 12 },
  { key: 'exercicio', x: 130, y: 146, size: 12 },
  { key: 'anoFab', x: 18, y: 176, size: 12 },
  { key: 'anoMod', x: 130, y: 176, size: 12 },
  { key: 'numeroCrv', x: 18, y: 208, size: 11 },
  { key: 'codSegCla', x: 18, y: 328, size: 11 },
  { key: 'catObs', x: 200, y: 328, size: 11 },
  { key: 'marcaModelo', x: 18, y: 363, size: 11 },
  { key: 'especieTipo', x: 18, y: 400, size: 11 },
  { key: 'placaAnt', x: 18, y: 433, size: 11 },
  { key: 'chassi', x: 135, y: 433, size: 10 },
  { key: 'cor', x: 18, y: 465, size: 11 },
  { key: 'combustivel', x: 135, y: 465, size: 10 },
  // RIGHT COLUMN
  { key: 'categoria', x: 310, y: 105, size: 12 },
  { key: 'capacidade', x: 510, y: 105, size: 12 },
  { key: 'potenciaCil', x: 310, y: 140, size: 12 },
  { key: 'pesoBruto', x: 510, y: 140, size: 10 },
  { key: 'motor', x: 310, y: 172, size: 10 },
  { key: 'cmt', x: 476, y: 172, size: 10 },
  { key: 'eixos', x: 520, y: 172, size: 10 },
  { key: 'lotacao', x: 548, y: 172, size: 10 },
  { key: 'carroceria', x: 310, y: 208, size: 11 },
  { key: 'nomeProprietario', x: 310, y: 242, size: 11 },
  { key: 'cpfCnpj', x: 420, y: 276, size: 11 },
  { key: 'local', x: 310, y: 310, size: 11 },
  { key: 'data', x: 520, y: 310, size: 10 },
];

// White-out rectangles from server (x, y from top, w, h)
const WHITEOUT_RECTS: { x: number; y: number; w: number; h: number }[] = [
  { x: 18, y: 100, w: 200, h: 20 },
  { x: 18, y: 132, w: 100, h: 18 },
  { x: 130, y: 132, w: 90, h: 18 },
  { x: 18, y: 162, w: 100, h: 18 },
  { x: 130, y: 162, w: 90, h: 18 },
  { x: 18, y: 192, w: 200, h: 20 },
  { x: 18, y: 312, w: 165, h: 20 },
  { x: 195, y: 312, w: 50, h: 20 },
  { x: 18, y: 347, w: 230, h: 22 },
  { x: 18, y: 382, w: 230, h: 22 },
  { x: 18, y: 418, w: 110, h: 18 },
  { x: 135, y: 418, w: 120, h: 18 },
  { x: 18, y: 450, w: 110, h: 18 },
  { x: 135, y: 450, w: 120, h: 18 },
  // Right column
  { x: 310, y: 87, w: 190, h: 22 },
  { x: 500, y: 87, w: 80, h: 22 },
  { x: 310, y: 122, w: 190, h: 22 },
  { x: 500, y: 122, w: 80, h: 22 },
  { x: 310, y: 156, w: 165, h: 20 },
  { x: 476, y: 156, w: 40, h: 20 },
  { x: 518, y: 156, w: 25, h: 20 },
  { x: 545, y: 156, w: 40, h: 20 },
  { x: 310, y: 190, w: 280, h: 22 },
  { x: 310, y: 224, w: 280, h: 22 },
  { x: 420, y: 258, w: 170, h: 22 },
  { x: 310, y: 292, w: 190, h: 22 },
  { x: 520, y: 292, w: 70, h: 22 },
  // QR area
  { x: 240, y: 100, w: 175, h: 195 },
  // Observações area
  { x: 18, y: 505, w: 270, h: 245 },
];

export function CrlvPreview({ form, customQrPreview }: CrlvPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImageRef = useRef<ImageData | null>(null);
  const pdfDimsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const v = form.watch();

  // Load PDF template once and store base image
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument('/templates/crlv-template.pdf').promise;
        const page = await pdf.getPage(1);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        pdfDimsRef.current = { w: viewport.width, h: viewport.height };

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Store base image
        baseImageRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (err) {
        console.error('Erro ao carregar template CRLV:', err);
      }
    };
    loadPdf();
  }, []);

  // Redraw on form changes
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const baseImage = baseImageRef.current;
    if (!canvas || !baseImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 1.5;

    // Restore base image
    ctx.putImageData(baseImage, 0, 0);

    // Draw white-out rectangles
    ctx.fillStyle = '#FFFFFF';
    for (const rect of WHITEOUT_RECTS) {
      ctx.fillRect(rect.x * scale, rect.y * scale, rect.w * scale, rect.h * scale);
    }

    // Draw text fields
    ctx.fillStyle = '#000000';
    for (const field of FIELD_MAP) {
      const text = v[field.key] || '';
      if (!text) continue;
      ctx.font = `bold ${field.size * scale}px Courier, monospace`;
      ctx.fillText(text, field.x * scale, field.y * scale);
    }

    // Draw observações
    if (v.observacoes) {
      const lines = (v.observacoes as string).split('\n');
      ctx.font = `bold ${11 * scale}px Courier, monospace`;
      lines.forEach((line: string, i: number) => {
        ctx.fillText(line, 25 * scale, (530 + i * 16) * scale);
      });
    }

    // Draw custom QR if provided
    if (customQrPreview) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 255 * scale, (280 - 145) * scale, 145 * scale, 145 * scale);
      };
      img.src = customQrPreview;
    }
  }, [v, customQrPreview]);

  useEffect(() => {
    // Small delay to ensure base image is loaded
    const timer = setTimeout(drawOverlay, 100);
    return () => clearTimeout(timer);
  }, [drawOverlay]);

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-muted">
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ display: 'block' }}
      />
    </div>
  );
}
