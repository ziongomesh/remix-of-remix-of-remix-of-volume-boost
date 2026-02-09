import { useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

interface CrlvPreviewProps {
  form: UseFormReturn<any>;
  customQrPreview?: string | null;
  showDenseQr?: boolean;
}

// pdfjs viewport scale
const PDF_SCALE = 1.5;
// PDF points → canvas pixels: pdfjs maps at 96/72 * scale
const PX_RATIO = (96 / 72) * PDF_SCALE; // = 2.0
const s = (v: number) => v * PX_RATIO;

// Each field: formKey, whiteout rect (x, y, w, h in PDF pts), text position (x, y in PDF pts), fontSize, bold
interface FieldDef {
  key: string;
  wx: number; wy: number; ww: number; wh: number;
  tx: number; ty: number;
  size: number;
}

const FIELDS: FieldDef[] = [
  { key: 'renavam', wx: 23, wy: 74, ww: 50, wh: 9, tx: 23, ty: 80, size: 8 },
  { key: 'placa', wx: 23, wy: 93, ww: 32, wh: 9, tx: 23, ty: 100, size: 8 },
  { key: 'exercicio', wx: 77, wy: 93, ww: 18, wh: 9, tx: 77, ty: 100, size: 8 },
  { key: 'anoFab', wx: 23, wy: 113, ww: 18, wh: 9, tx: 23, ty: 119, size: 8 },
  { key: 'anoMod', wx: 77, wy: 113, ww: 18, wh: 9, tx: 77, ty: 119, size: 8 },
  { key: 'numeroCrv', wx: 23, wy: 133, ww: 54, wh: 9, tx: 23, ty: 139, size: 8 },
  { key: 'categoria', wx: 237, wy: 52, ww: 45, wh: 9, tx: 237, ty: 58, size: 8 },
  { key: 'capacidade', wx: 382, wy: 63, ww: 14, wh: 9, tx: 382, ty: 69, size: 8 },
  { key: 'potenciaCil', wx: 237, wy: 83, ww: 41, wh: 9, tx: 237, ty: 89, size: 8 },
  { key: 'pesoBruto', wx: 382, wy: 83, ww: 18, wh: 9, tx: 382, ty: 89, size: 8 },
  { key: 'motor', wx: 237, wy: 102, ww: 68, wh: 9, tx: 237, ty: 109, size: 8 },
  { key: 'cmt', wx: 340, wy: 102, ww: 18, wh: 9, tx: 340, ty: 109, size: 8 },
  { key: 'eixos', wx: 378, wy: 102, ww: 10, wh: 9, tx: 378, ty: 109, size: 8 },
  { key: 'lotacao', wx: 404, wy: 102, ww: 14, wh: 9, tx: 404, ty: 109, size: 8 },
  { key: 'carroceria', wx: 237, wy: 122, ww: 59, wh: 9, tx: 237, ty: 128, size: 8 },
  { key: 'nomeProprietario', wx: 237, wy: 141, ww: 149, wh: 9, tx: 237, ty: 147, size: 8 },
  { key: 'cpfCnpj', wx: 347, wy: 164, ww: 63, wh: 9, tx: 347, ty: 171, size: 8 },
  { key: 'codSegCla', wx: 23, wy: 191, ww: 50, wh: 9, tx: 23, ty: 197, size: 8 },
  { key: 'catObs', wx: 122, wy: 191, ww: 14, wh: 9, tx: 122, ty: 197, size: 8 },
  { key: 'local', wx: 237, wy: 191, ww: 63, wh: 9, tx: 237, ty: 197, size: 8 },
  { key: 'data', wx: 382, wy: 191, ww: 45, wh: 9, tx: 382, ty: 197, size: 8 },
  { key: 'marcaModelo', wx: 23, wy: 217, ww: 108, wh: 9, tx: 23, ty: 224, size: 8 },
  { key: 'especieTipo', wx: 23, wy: 244, ww: 90, wh: 9, tx: 23, ty: 250, size: 8 },
  { key: 'placaAnt', wx: 23, wy: 270, ww: 45, wh: 9, tx: 23, ty: 276, size: 8 },
  { key: 'chassi', wx: 98, wy: 270, ww: 77, wh: 9, tx: 98, ty: 276, size: 8 },
  { key: 'cor', wx: 23, wy: 296, ww: 27, wh: 9, tx: 23, ty: 303, size: 8 },
  { key: 'combustivel', wx: 77, wy: 296, ww: 68, wh: 9, tx: 77, ty: 303, size: 8 },
  { key: 'observacoes', wx: 21, wy: 330, ww: 90, wh: 9, tx: 21, ty: 336, size: 8 },
];

export function CrlvPreview({ form, customQrPreview, showDenseQr = true }: CrlvPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgCanvas, setBgCanvas] = useState<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const rafRef = useRef<number>(0);

  const v = form.watch();

  // Load and render PDF template once
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/templates/crlv-template.pdf?v=' + Date.now());
        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: PDF_SCALE });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (cancelled) return;
        setBgCanvas(canvas);
        setReady(true);
      } catch (err) {
        console.error('Erro ao carregar template CRLV:', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Redraw on form changes
  useEffect(() => {
    if (!ready || !bgCanvas) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = bgCanvas.width;
      canvas.height = bgCanvas.height;

      // Draw original rendered page
      ctx.drawImage(bgCanvas, 0, 0);

      // For each field: white-out + redraw with form value
      for (const f of FIELDS) {
        const formValue = v[f.key] || '';

        // White-out original area
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(s(f.wx), s(f.wy), s(f.ww), s(f.wh));

        // Draw new text
        if (formValue.trim()) {
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${s(f.size)}px "FreeMono", "Courier New", monospace`;
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(formValue, s(f.tx), s(f.ty));
        }
      }

      // DETRAN-UF — sobrescreve "RO" com o UF selecionado
      if (v.uf) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(s(268), s(30), s(30), s(12));
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${s(8)}px "FreeMono", "Courier New", monospace`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(v.uf, s(270), s(39));
      }

      // "Documento emitido por CDT..." com data e hora de Brasília
      const cpfClean = (v.cpfCnpj || '').replace(/\D/g, '');
      const cpfHash = cpfClean.slice(0, 9) || '000000000';
      const hashCode = `${cpfHash.slice(0,3)}${cpfHash.slice(3,5)}f${cpfHash.slice(5,8)}`;
      const now = new Date();
      const brDate = v.data || now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const brTime = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const docText = `Documento emitido por CDT (${hashCode}) em ${brDate} às ${brTime}.`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(s(23), s(315), s(400), s(10));
      ctx.fillStyle = '#000000';
      ctx.font = `${s(5)}px "FreeMono", "Courier New", monospace`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(docText, s(25), s(322));

      // QR Code overlay
      const qrSrc = customQrPreview || (showDenseQr ? '/images/qrcode-sample-crlv.png' : null);
      if (qrSrc) {
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(s(150), s(60), s(90), s(95));
          ctx.drawImage(img, s(155), s(65), s(80), s(80));
        };
        img.src = qrSrc;
      }
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [v, customQrPreview, showDenseQr, ready, bgCanvas]);

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
