import { useEffect, useRef, useCallback } from 'react';

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
  ctx.fillText(data.nome.toUpperCase(), w * 0.035, h * 0.43, w * 0.55);

  // Data de Nascimento
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText(data.dataNascimento, w * 0.035, h * 0.545, w * 0.22);

  // CPF
  ctx.fillText(data.cpf, w * 0.28, h * 0.545, w * 0.28);

  // Categoria
  ctx.font = 'bold 11px Arial, sans-serif';
  const catText = data.categoria.toUpperCase();
  ctx.fillText(catText, w * 0.035, h * 0.645, w * 0.55);

  const catEnMap: Record<string, string> = {
    'ARRAIS AMADOR': 'AMATEUR SKIPPER',
    'MESTRE AMADOR': 'AMATEUR MASTER',
    'CAPITÃO AMADOR': 'AMATEUR CAPTAIN',
    'MOTONAUTA': 'PERSONAL WATERCRAFT PILOT',
  };
  const catEn = catEnMap[catText] || '';
  if (catEn) {
    ctx.font = '9px Arial, sans-serif';
    ctx.fillText(catEn, w * 0.035, h * 0.685, w * 0.55);
  }

  // Data de Validade
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText(data.validade, w * 0.035, h * 0.815, w * 0.22);

  // Nº de Inscrição
  ctx.fillText(data.numeroInscricao.toUpperCase(), w * 0.28, h * 0.815, w * 0.28);

  // Foto 3x4
  if (fotoImg) {
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
      drawH = fotoH;
      drawW = fotoH * imgRatio;
      drawX = fotoX - (drawW - fotoW) / 2;
      drawY = fotoY;
    } else {
      drawW = fotoW;
      drawH = fotoW / imgRatio;
      drawX = fotoX;
      drawY = fotoY - (drawH - fotoH) / 2;
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

  // Limites da Navegação
  ctx.font = 'bold 11px Arial, sans-serif';
  const limiteText = data.limiteNavegacao.toUpperCase();
  wrapText(ctx, limiteText, w * 0.035, h * 0.16, w * 0.93, 14);

  // Tradução em inglês do limite
  const limiteEnMap: Record<string, string> = {
    'NAVEGAÇÃO INTERIOR': 'INLAND NAVIGATION',
    'ÁGUAS ABRIGADAS': 'SHELTERED WATERS',
    'NAVEGAÇÃO COSTEIRA': 'COASTAL NAVIGATION',
    'ALTO MAR': 'OPEN SEA',
  };
  const cleanLimite = limiteText.replace(/\./g, '').trim();
  const matchingKey = Object.keys(limiteEnMap).find(k => cleanLimite.includes(k));
  if (matchingKey) {
    ctx.font = '10px Arial, sans-serif';
    ctx.fillText(limiteEnMap[matchingKey] + '.', w * 0.035, h * 0.24, w * 0.93);
  }

  // Requisitos
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText((data.requisitos || '').toUpperCase(), w * 0.035, h * 0.46, w * 0.93);

  // Órgão de Emissão
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText(data.orgaoEmissao.toUpperCase(), w * 0.035, h * 0.635, w * 0.45);

  // Data de Emissão
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText(data.emissao, w * 0.55, h * 0.635, w * 0.40);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY, maxWidth);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY, maxWidth);
}

export default function ChaPreview(props: ChaPreviewProps) {
  const canvasFrontRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const W = 700;
    const H = 440;

    // Front
    const bgFront = new Image();
    bgFront.crossOrigin = 'anonymous';
    bgFront.src = '/images/matrizcha.png';

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
    bgBack.src = '/images/matrizcha2.png';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
}
