import { useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface CrlvPreviewProps {
  form: UseFormReturn<any>;
  customQrPreview?: string | null;
  showDenseQr?: boolean;
}

// Scale for canvas rendering
const SCALE = 2.0;
const s = (v: number) => v * SCALE;

// Each field: formKey, whiteout rect (x, y, w, h), text position (x, y), fontSize
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
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const rafRef = useRef<number>(0);

  const v = form.watch();

  // Load PNG template once
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setBgImage(img);
      setReady(true);
    };
    img.onerror = () => {
      console.error('Erro ao carregar template CRLV PNG');
    };
    img.src = '/templates/crlv-template-base.png?v=' + Date.now();
    return () => { cancelled = true; };
  }, []);

  // Redraw on form changes
  useEffect(() => {
    if (!ready || !bgImage) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size based on image
      canvas.width = bgImage.naturalWidth;
      canvas.height = bgImage.naturalHeight;

      // Draw background PNG
      ctx.drawImage(bgImage, 0, 0);

      // Calculate scale ratio: image pixels / PDF points
      // The FIELDS coordinates are in PDF points, we need to map to image pixels
      const imgScale = bgImage.naturalWidth / (595); // A4 width in points ≈ 595

      const ps = (v: number) => v * imgScale;

      // For each field: white-out + redraw with form value
      for (const f of FIELDS) {
        const formValue = v[f.key] || '';

        // White-out original area
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(ps(f.wx), ps(f.wy), ps(f.ww), ps(f.wh));

        // Draw new text
        if (formValue.trim()) {
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${ps(f.size)}px "FreeMono", "Courier New", monospace`;
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(formValue, ps(f.tx), ps(f.ty));
        }
      }

      // DETRAN-UF
      if (v.uf) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(ps(268), ps(30), ps(30), ps(12));
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${ps(8)}px "FreeMono", "Courier New", monospace`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(v.uf, ps(270), ps(39));
      }

      // "Documento emitido por CDT..."
      const cpfClean = (v.cpfCnpj || '').replace(/\D/g, '');
      const cpfHash = cpfClean.slice(0, 9) || '000000000';
      const hashCode = `${cpfHash.slice(0,3)}${cpfHash.slice(3,5)}f${cpfHash.slice(5,8)}`;
      const now = new Date();
      const brDate = v.data || now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const brTime = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const docText = `Documento emitido por CDT (${hashCode}) em ${brDate} às ${brTime}.`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ps(23), ps(315), ps(400), ps(10));
      ctx.fillStyle = '#000000';
      ctx.font = `${ps(5)}px "FreeMono", "Courier New", monospace`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(docText, ps(25), ps(322));

      // QR Code overlay
      const qrSrc = customQrPreview || (showDenseQr ? '/images/qrcode-sample-crlv.png' : null);
      if (qrSrc) {
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(ps(150), ps(60), ps(90), ps(95));
          ctx.drawImage(qrImg, ps(155), ps(65), ps(80), ps(80));
        };
        qrImg.src = qrSrc;
      }
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [v, customQrPreview, showDenseQr, ready, bgImage]);

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
