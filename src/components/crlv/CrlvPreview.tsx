import { useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

interface CrlvPreviewProps {
  form: UseFormReturn<any>;
  customQrPreview?: string | null;
  showDenseQr?: boolean;
}

// Scale factor: PDF points → canvas pixels
const SCALE = 1.5;
const s = (v: number) => v * SCALE;

// Each field: formKey, whiteout rect (x, y, w, h in PDF pts), text position (x, y in PDF pts), fontSize, bold
interface FieldDef {
  key: string;
  wx: number; wy: number; ww: number; wh: number;
  tx: number; ty: number;
  size: number;
}

const FIELDS: FieldDef[] = [
  // ========== LEFT COLUMN ==========
  { key: 'renavam',      wx: 18,  wy: 100, ww: 200, wh: 20,  tx: 18,  ty: 115, size: 12 },
  { key: 'placa',         wx: 18,  wy: 132, ww: 100, wh: 18,  tx: 18,  ty: 146, size: 12 },
  { key: 'exercicio',     wx: 130, wy: 132, ww: 90,  wh: 18,  tx: 130, ty: 146, size: 12 },
  { key: 'anoFab',        wx: 18,  wy: 162, ww: 100, wh: 18,  tx: 18,  ty: 176, size: 12 },
  { key: 'anoMod',        wx: 130, wy: 162, ww: 90,  wh: 18,  tx: 130, ty: 176, size: 12 },
  { key: 'numeroCrv',     wx: 18,  wy: 192, ww: 200, wh: 20,  tx: 18,  ty: 208, size: 11 },
  { key: 'codSegCla',     wx: 18,  wy: 312, ww: 165, wh: 20,  tx: 18,  ty: 328, size: 11 },
  { key: 'catObs',        wx: 195, wy: 312, ww: 50,  wh: 20,  tx: 200, ty: 328, size: 11 },
  { key: 'marcaModelo',   wx: 18,  wy: 347, ww: 230, wh: 22,  tx: 18,  ty: 363, size: 11 },
  { key: 'especieTipo',   wx: 18,  wy: 382, ww: 230, wh: 22,  tx: 18,  ty: 400, size: 11 },
  { key: 'placaAnt',      wx: 18,  wy: 418, ww: 110, wh: 18,  tx: 18,  ty: 433, size: 11 },
  { key: 'chassi',        wx: 135, wy: 418, ww: 120, wh: 18,  tx: 135, ty: 433, size: 10 },
  { key: 'cor',           wx: 18,  wy: 450, ww: 110, wh: 18,  tx: 18,  ty: 465, size: 11 },
  { key: 'combustivel',   wx: 135, wy: 450, ww: 120, wh: 18,  tx: 135, ty: 465, size: 10 },

  // ========== RIGHT COLUMN ==========
  { key: 'categoria',     wx: 310, wy: 87,  ww: 190, wh: 22,  tx: 310, ty: 105, size: 12 },
  { key: 'capacidade',    wx: 500, wy: 87,  ww: 80,  wh: 22,  tx: 510, ty: 105, size: 12 },
  { key: 'potenciaCil',   wx: 310, wy: 122, ww: 190, wh: 22,  tx: 310, ty: 140, size: 12 },
  { key: 'pesoBruto',     wx: 500, wy: 122, ww: 80,  wh: 22,  tx: 510, ty: 140, size: 10 },
  { key: 'motor',         wx: 310, wy: 156, ww: 165, wh: 20,  tx: 310, ty: 172, size: 10 },
  { key: 'cmt',           wx: 476, wy: 156, ww: 40,  wh: 20,  tx: 476, ty: 172, size: 10 },
  { key: 'eixos',         wx: 518, wy: 156, ww: 25,  wh: 20,  tx: 520, ty: 172, size: 10 },
  { key: 'lotacao',       wx: 545, wy: 156, ww: 40,  wh: 20,  tx: 548, ty: 172, size: 10 },
  { key: 'carroceria',    wx: 310, wy: 190, ww: 280, wh: 22,  tx: 310, ty: 208, size: 11 },
  { key: 'nomeProprietario', wx: 310, wy: 224, ww: 280, wh: 22, tx: 310, ty: 242, size: 11 },
  { key: 'cpfCnpj',       wx: 420, wy: 258, ww: 170, wh: 22,  tx: 420, ty: 276, size: 11 },
  { key: 'local',         wx: 310, wy: 292, ww: 190, wh: 22,  tx: 310, ty: 310, size: 11 },
  { key: 'data',          wx: 520, wy: 292, ww: 70,  wh: 22,  tx: 520, ty: 310, size: 10 },
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
        const viewport = page.getViewport({ scale: SCALE });

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

      // DETRAN-UF
      if (v.uf) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(s(310), s(65), s(200), s(20));
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${s(12)}px "FreeMono", "Courier New", monospace`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(`DETRAN-   ${v.uf}`, s(310), s(80));
      }

      // Observações
      const obsText = v.observacoes || '*.*';
      const obsLines = obsText.split('\n');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(s(18), s(505), s(270), s(245));
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${s(11)}px "FreeMono", "Courier New", monospace`;
      ctx.textBaseline = 'alphabetic';
      obsLines.forEach((line: string, i: number) => {
        ctx.fillText(line, s(25), s(530) + i * s(16));
      });

      // "Documento emitido por CDT..."
      const cpfClean = (v.cpfCnpj || '').replace(/\D/g, '');
      const cpfHash = cpfClean.slice(0, 9) || '000000000';
      const hashCode = `${cpfHash.slice(0,3)}${cpfHash.slice(3,5)}f${cpfHash.slice(5,8)}`;
      const now = new Date();
      const docText = `Documento emitido por CDT (${hashCode}) em ${v.data || now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}.`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(s(18), s(755), s(560), s(20));
      ctx.fillStyle = '#000000';
      ctx.font = `${s(8)}px "Courier New", monospace`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(docText, s(20), s(768));

      // QR Code overlay
      const qrSrc = customQrPreview || (showDenseQr ? '/images/qrcode-sample-crlv.png' : null);
      if (qrSrc) {
        const img = new Image();
        img.onload = () => {
          // QR calibrated: x=120pt, y=64pt, size=84pt
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(s(240), s(100), s(175), s(195));
          ctx.drawImage(img, s(255), s(115), s(145), s(145));
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
