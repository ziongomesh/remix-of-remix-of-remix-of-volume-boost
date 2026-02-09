import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { extractPdfData } from '@/components/pdf-editor/pdf-utils';
import { PdfTextField } from '@/components/pdf-editor/types';

interface CrlvPreviewProps {
  form: UseFormReturn<any>;
  customQrPreview?: string | null;
  showDenseQr?: boolean;
}

// Map form keys → approximate PDF coordinates (x, y in canvas space at scale 1.5)
// These are used to find the closest extracted field
const FORM_TO_PDF_MAP: { key: string; x: number; y: number }[] = [
  // Left column
  { key: 'renavam', x: 27, y: 150 },
  { key: 'placa', x: 27, y: 195 },
  { key: 'exercicio', x: 195, y: 195 },
  { key: 'anoFab', x: 27, y: 237 },
  { key: 'anoMod', x: 195, y: 237 },
  { key: 'numeroCrv', x: 27, y: 288 },
  { key: 'codSegCla', x: 27, y: 468 },
  { key: 'catObs', x: 300, y: 468 },
  { key: 'marcaModelo', x: 27, y: 520 },
  { key: 'especieTipo', x: 27, y: 575 },
  { key: 'placaAnt', x: 27, y: 625 },
  { key: 'chassi', x: 202, y: 625 },
  { key: 'cor', x: 27, y: 672 },
  { key: 'combustivel', x: 202, y: 672 },
  // Right column
  { key: 'categoria', x: 465, y: 135 },
  { key: 'capacidade', x: 765, y: 135 },
  { key: 'potenciaCil', x: 465, y: 186 },
  { key: 'pesoBruto', x: 765, y: 186 },
  { key: 'motor', x: 465, y: 234 },
  { key: 'cmt', x: 714, y: 234 },
  { key: 'eixos', x: 780, y: 234 },
  { key: 'lotacao', x: 822, y: 234 },
  { key: 'carroceria', x: 465, y: 288 },
  { key: 'nomeProprietario', x: 465, y: 339 },
  { key: 'cpfCnpj', x: 630, y: 390 },
  { key: 'local', x: 465, y: 441 },
  { key: 'data', x: 780, y: 441 },
];

function findClosestField(fields: PdfTextField[], targetX: number, targetY: number): PdfTextField | null {
  let best: PdfTextField | null = null;
  let bestDist = Infinity;
  for (const f of fields) {
    const dx = f.x - targetX;
    const dy = f.y - targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bestDist && dist < 80) { // 80px tolerance
      bestDist = dist;
      best = f;
    }
  }
  return best;
}

export function CrlvPreview({ form, customQrPreview, showDenseQr = true }: CrlvPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageCanvas, setPageCanvas] = useState<HTMLCanvasElement | null>(null);
  const [bgCanvas, setBgCanvas] = useState<HTMLCanvasElement | null>(null);
  const [extractedFields, setExtractedFields] = useState<PdfTextField[]>([]);
  const [ready, setReady] = useState(false);
  const rafRef = useRef<number>(0);

  const v = form.watch();

  // Load PDF template once
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/templates/crlv-template.pdf?v=' + Date.now());
        const blob = await response.blob();
        const file = new File([blob], 'crlv-template.pdf', { type: 'application/pdf' });
        const { pages, fields } = await extractPdfData(file);
        if (cancelled) return;
        if (pages.length > 0) {
          setPageCanvas(pages[0].canvas);
          setBgCanvas(pages[0].bgCanvas);
        }
        setExtractedFields(fields);
        setReady(true);
      } catch (err) {
        console.error('Erro ao carregar template CRLV:', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Build field mapping once extracted fields are ready
  const fieldMapping = useMemo(() => {
    if (extractedFields.length === 0) return new Map<string, string>();
    const map = new Map<string, string>(); // formKey -> fieldId
    const used = new Set<string>();

    for (const mapping of FORM_TO_PDF_MAP) {
      const available = extractedFields.filter(f => !used.has(f.id));
      const match = findClosestField(available, mapping.x, mapping.y);
      if (match) {
        map.set(mapping.key, match.id);
        used.add(match.id);
      }
    }
    return map;
  }, [extractedFields]);

  // Redraw on form changes
  useEffect(() => {
    if (!ready || !pageCanvas) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = pageCanvas.width;
      canvas.height = pageCanvas.height;

      // Draw original page
      ctx.drawImage(pageCanvas, 0, 0);

      // For each form field that has a mapped PDF field, white-out + redraw
      for (const [formKey, fieldId] of fieldMapping.entries()) {
        const formValue = v[formKey] || '';
        const field = extractedFields.find(f => f.id === fieldId);
        if (!field) continue;

        // White-out the original text area
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(field.x, field.y, field.width, field.height);

        // Draw new text
        if (formValue.trim()) {
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${field.fontSize}px "FreeMono", "Courier New", monospace`;
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(formValue, field.x, field.y + field.fontSize * 0.85);
        }
      }

      // Draw DETRAN-UF (find the DETRAN field or draw at known position)
      if (v.uf) {
        const detranField = extractedFields.find(f => f.text?.includes('DETRAN'));
        if (detranField) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(detranField.x, detranField.y, detranField.width + 50, detranField.height);
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${detranField.fontSize}px "FreeMono", "Courier New", monospace`;
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(`DETRAN-   ${v.uf}`, detranField.x, detranField.y + detranField.fontSize * 0.85);
        }
      }

      // Draw observações
      const obsText = v.observacoes || '*.*';
      const obsField = extractedFields.find(f => f.text?.includes('*.*') || f.text?.includes('NADA'));
      if (obsField) {
        const lines = obsText.split('\n');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(obsField.x - 2, obsField.y - 2, 400, lines.length * obsField.fontSize * 1.4 + 10);
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${obsField.fontSize}px "FreeMono", "Courier New", monospace`;
        ctx.textBaseline = 'alphabetic';
        lines.forEach((line: string, i: number) => {
          ctx.fillText(line, obsField.x, obsField.y + obsField.fontSize * 0.85 + i * obsField.fontSize * 1.3);
        });
      }

      // Draw "Documento emitido por CDT..."
      const cpfClean = (v.cpfCnpj || '').replace(/\D/g, '');
      const cpfHash = cpfClean.slice(0, 9) || '000000000';
      const hashCode = `${cpfHash.slice(0,3)}${cpfHash.slice(3,5)}f${cpfHash.slice(5,8)}`;
      const now = new Date();
      const docText = `Documento emitido por CDT (${hashCode}) em ${v.data || now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}.`;
      const cdtField = extractedFields.find(f => f.text?.includes('Documento emitido'));
      if (cdtField) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cdtField.x - 2, cdtField.y - 2, 820, cdtField.height + 4);
        ctx.fillStyle = '#000000';
        ctx.font = `${cdtField.fontSize}px "Courier New", monospace`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(docText, cdtField.x, cdtField.y + cdtField.fontSize * 0.85);
      }

      // QR Code overlay
      const qrSrc = customQrPreview || (showDenseQr ? '/images/qrcode-sample-crlv.png' : null);
      if (qrSrc) {
        const img = new Image();
        img.onload = () => {
          // QR position calibrated from /teste5: x=120pt, y=64pt, size=84pt at scale 1.5
          const ptToCanvas = 96 / 72 * 1.5;
          const qrX = 120.0 * ptToCanvas;
          const qrY = 64.0 * ptToCanvas;
          const qrSize = 84.0 * ptToCanvas;
          // White-out QR area first
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(qrX, qrY, qrSize, qrSize);
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        };
        img.src = qrSrc;
      }
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [v, customQrPreview, showDenseQr, ready, pageCanvas, fieldMapping, extractedFields]);

  return (
    <div ref={containerRef} className="rounded-lg border border-border overflow-hidden bg-muted">
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ display: 'block' }}
      />
      {!ready && (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Carregando preview...
        </div>
      )}
    </div>
  );
}
