import { useEffect, useRef } from 'react';

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

// Draws text on canvas matching the CHA matrix layout
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

  // Nome field - inside the Nome box
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText(data.nome.toUpperCase(), w * 0.04, h * 0.395, w * 0.58);

  // Data Nascimento
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText(data.dataNascimento, w * 0.04, h * 0.505, w * 0.26);

  // CPF
  ctx.fillText(data.cpf, w * 0.32, h * 0.505, w * 0.28);

  // Categoria
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText(data.categoria.toUpperCase(), w * 0.04, h * 0.615, w * 0.58);

  // Data Validade
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText(data.validade, w * 0.04, h * 0.73, w * 0.28);

  // Nº de Inscrição
  ctx.fillText(data.numeroInscricao.toUpperCase(), w * 0.32, h * 0.73, w * 0.28);

  // Foto 3x4 - right side
  if (fotoImg) {
    const fotoX = w * 0.65;
    const fotoY = h * 0.32;
    const fotoW = w * 0.30;
    const fotoH = h * 0.52;
    ctx.drawImage(fotoImg, fotoX, fotoY, fotoW, fotoH);
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
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText(data.limiteNavegacao.toUpperCase(), w * 0.04, h * 0.12, w * 0.92);

  // Requisitos
  ctx.fillText(data.requisitos.toUpperCase(), w * 0.04, h * 0.34, w * 0.92);

  // Órgão de Emissão
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText(data.orgaoEmissao.toUpperCase(), w * 0.04, h * 0.56, w * 0.58);

  // Data de Emissão
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText(data.emissao, w * 0.65, h * 0.56, w * 0.30);
}

export default function ChaPreview(props: ChaPreviewProps) {
  const canvasFrontRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

    const drawFront = () => {
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
        fotoImg.onload = drawFront;
      } else {
        drawFront();
      }
    };
    if (bgFront.complete) {
      if (fotoImg && !fotoImg.complete) {
        fotoImg.onload = drawFront;
      } else {
        drawFront();
      }
    }

    // Back
    const bgBack = new Image();
    bgBack.crossOrigin = 'anonymous';
    bgBack.src = '/images/matrizcha2.png';

    bgBack.onload = () => {
      const canvas = canvasBackRef.current;
      if (!canvas) return;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawChaBack(ctx, bgBack, props, W, H);
    };
    if (bgBack.complete) {
      const canvas = canvasBackRef.current;
      if (canvas) {
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (ctx) drawChaBack(ctx, bgBack, props, W, H);
      }
    }
  }, [props]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Pré-visualização</h3>
      <div className="space-y-3">
        <div className="rounded-lg overflow-hidden border shadow-sm">
          <canvas
            ref={canvasFrontRef}
            className="w-full h-auto"
            style={{ display: 'block', userSelect: 'none', pointerEvents: 'none' }}
          />
        </div>
        <div className="rounded-lg overflow-hidden border shadow-sm">
          <canvas
            ref={canvasBackRef}
            className="w-full h-auto"
            style={{ display: 'block', userSelect: 'none', pointerEvents: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
