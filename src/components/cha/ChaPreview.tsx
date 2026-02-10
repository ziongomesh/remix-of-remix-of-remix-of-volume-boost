import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import matrizcha from '@/assets/templates/matrizcha.png';
import matrizcha2 from '@/assets/templates/matrizcha2.png';

interface ChaPreviewProps {
  nome: string;
  cpf: string;
  dataNascimento: string;
  categoria: string;
  validade: string;
  emissao: string;
  numeroInscricao: string;
  limiteNavegacao: string;
  requisitos: string;
  orgaoEmissao: string;
  fotoPreview: string | null;
}

export interface ChaPreviewHandle {
  getFrenteBase64: () => string;
  getVersoBase64: () => string;
}

function drawChaFront(
  ctx: CanvasRenderingContext2D,
  bgImg: HTMLImageElement,
  fotoImg: HTMLImageElement | null,
  data: ChaPreviewProps,
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(bgImg, 0, 0, w, h);

  ctx.fillStyle = '#1a1a1a';
  ctx.textBaseline = 'top';

  // Nome
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText(data.nome.toUpperCase(), w * 0.083, h * 0.430, w * 0.55);

  // Data de Nascimento
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText(data.dataNascimento, w * 0.083, h * 0.565, w * 0.22);

  // CPF
  ctx.fillText(data.cpf, w * 0.368, h * 0.565, w * 0.28);

  // Categoria - para ARRAIS AMADOR mostra "MOTONAUTA" + "PERSONAL WATERCRAFT PILOT"
  ctx.font = 'bold 11px Arial, sans-serif';
  const catText = data.categoria.toUpperCase();
  
  const catDisplayMap: Record<string, { pt: string; en: string }> = {
    'ARRAIS AMADOR': { pt: 'ARRAIS AMADOR', en: 'AMATEUR SKIPPER' },
    'MESTRE AMADOR': { pt: 'MESTRE AMADOR', en: 'AMATEUR MASTER' },
    'CAPITÃO AMADOR': { pt: 'CAPITÃO AMADOR', en: 'AMATEUR CAPTAIN' },
  };
  const catDisplay = catDisplayMap[catText] || { pt: catText, en: '' };
  ctx.fillText(catDisplay.pt, w * 0.083, h * 0.695, w * 0.55);
  
  if (catDisplay.en) {
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillText(catDisplay.en, w * 0.083, h * 0.735, w * 0.55);
  }

  // Data de Validade
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText(data.validade, w * 0.083, h * 0.835, w * 0.22);

  // Nº de Inscrição
  ctx.fillText(data.numeroInscricao.toUpperCase(), w * 0.368, h * 0.835, w * 0.28);

  // Foto 3x4
  if (fotoImg && fotoImg.naturalWidth > 0 && fotoImg.naturalHeight > 0) {
    const fotoX = w * 0.642;
    const fotoY = h * 0.412;
    const fotoW = w * 0.286;
    const fotoH = h * 0.521;

    ctx.save();
    ctx.beginPath();
    ctx.rect(fotoX, fotoY, fotoW, fotoH);
    ctx.clip();

    const imgRatio = fotoImg.naturalWidth / fotoImg.naturalHeight;
    const boxRatio = fotoW / fotoH;
    let drawW: number, drawH: number, drawX: number, drawY: number;

    if (imgRatio > boxRatio) {
      // Image is wider — fit height, crop sides
      drawH = fotoH;
      drawW = fotoH * imgRatio;
      drawX = fotoX + (fotoW - drawW) / 2;
      drawY = fotoY;
    } else {
      // Image is taller — fit width, crop top/bottom
      drawW = fotoW;
      drawH = fotoW / imgRatio;
      drawX = fotoX;
      drawY = fotoY + (fotoH - drawH) / 2;
    }
    ctx.drawImage(fotoImg, drawX, drawY, drawW, drawH);
    ctx.restore();
  }
}

function drawChaBack(
  ctx: CanvasRenderingContext2D,
  bgImg: HTMLImageElement,
  data: ChaPreviewProps,
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(bgImg, 0, 0, w, h);

  ctx.fillStyle = '#1a1a1a';
  ctx.textBaseline = 'top';

  // Limites da Navegação - PT em bold, EN em normal na linha seguinte
  ctx.font = 'bold 11px Arial, sans-serif';
  const limiteText = data.limiteNavegacao.toUpperCase();
  const limiteLines = wrapText(ctx, limiteText, w * 0.083, h * 0.090, w * 0.88, 14);

  // Tradução automática para inglês
  const limiteEnFullMap: Record<string, string> = {
    'NAVEGAÇÃO INTERIOR. QUANDO PILOTANDO MOTO AQUÁTICA, INTERIOR.': 'INLAND NAVIGATION. WHEN PILOTING PERSONAL WATERCRAFT, INLAND WATERS.',
    'NAVEGAÇÃO INTERIOR': 'INLAND NAVIGATION.',
    'ÁGUAS ABRIGADAS': 'SHELTERED WATERS.',
    'NAVEGAÇÃO COSTEIRA': 'COASTAL NAVIGATION.',
    'ALTO MAR': 'OPEN SEA.',
  };
  const cleanLimite = limiteText.replace(/\./g, '').replace(/,/g, '').trim();
  const matchingKey = Object.keys(limiteEnFullMap).find(k => cleanLimite.includes(k.replace(/\./g, '').replace(/,/g, '')));
  if (matchingKey) {
    ctx.font = 'bold 10px Arial, sans-serif';
    wrapText(ctx, limiteEnFullMap[matchingKey], w * 0.083, h * 0.274, w * 0.88, 13);
  }

  // Requisitos
  ctx.font = 'bold 12px Arial, sans-serif';
  const reqText = (data.requisitos || '').trim() ? data.requisitos.toUpperCase() : '******** / ********';
  ctx.fillText(reqText, w * 0.083, h * 0.463, w * 0.88);

  // Órgão de Emissão
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText(data.orgaoEmissao.toUpperCase(), w * 0.083, h * 0.506, w * 0.45);

  // Data de Emissão
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText(data.emissao, w * 0.631, h * 0.461, w * 0.35);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lines = 1;

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY, maxWidth);
      line = word;
      currentY += lineHeight;
      lines++;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY, maxWidth);
  return lines;
}

const ChaPreview = forwardRef<ChaPreviewHandle, ChaPreviewProps>((props, ref) => {
  const canvasFrontRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    getFrenteBase64: () => canvasFrontRef.current?.toDataURL('image/png') || '',
    getVersoBase64: () => canvasBackRef.current?.toDataURL('image/png') || '',
  }));

  const draw = useCallback(() => {
    const W = 700;
    const H = 440;

    // Front
    const bgFront = new Image();
    bgFront.crossOrigin = 'anonymous';
    bgFront.src = matrizcha;

    let fotoImg: HTMLImageElement | null = null;
    if (props.fotoPreview) {
      fotoImg = new Image();
      fotoImg.src = props.fotoPreview;
    }

    const renderFront = () => {
      const canvas = canvasFrontRef.current;
      if (!canvas) return;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawChaFront(ctx, bgFront, fotoImg, props, W, H);
    };

    bgFront.onload = () => {
      if (fotoImg && !fotoImg.complete) {
        fotoImg.onload = renderFront;
      } else {
        renderFront();
      }
    };
    if (bgFront.complete) {
      if (fotoImg && !fotoImg.complete) {
        fotoImg!.onload = renderFront;
      } else {
        renderFront();
      }
    }

    // Back
    const bgBack = new Image();
    bgBack.crossOrigin = 'anonymous';
    bgBack.src = matrizcha2;

    const renderBack = () => {
      const canvas = canvasBackRef.current;
      if (!canvas) return;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawChaBack(ctx, bgBack, props, W, H);
    };

    bgBack.onload = renderBack;
    if (bgBack.complete) renderBack();
  }, [props]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Frente</p>
          <div className="rounded-lg overflow-hidden border shadow-sm">
            <canvas
              ref={canvasFrontRef}
              className="w-full h-auto"
              style={{ display: 'block', userSelect: 'none', pointerEvents: 'none' }}
            />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Verso</p>
          <div className="rounded-lg overflow-hidden border shadow-sm">
            <canvas
              ref={canvasBackRef}
              className="w-full h-auto"
              style={{ display: 'block', userSelect: 'none', pointerEvents: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChaPreview;
