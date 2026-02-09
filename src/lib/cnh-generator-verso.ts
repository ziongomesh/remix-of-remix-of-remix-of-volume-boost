// Gerador de CNH Verso (Canvas client-side)
import limpa3 from '@/assets/templates/limpa3.png';

interface CnhVersoData {
  matrizFinal?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadFont(): Promise<void> {
  try {
    const courierFontUrl = (await import('../assets/CourierPrime.ttf')).default;
    const font = new FontFace('Courier Prime', `url(${courierFontUrl})`, { weight: '700' });
    const loaded = await font.load();
    document.fonts.add(loaded);
  } catch {
    // Fallback - tentar Google Fonts
    if (!document.querySelector('link[href*="Courier+Prime"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@700&display=swap';
      document.head.appendChild(link);
    }
  }
  await document.fonts.ready;
}

async function drawTemplate(ctx: CanvasRenderingContext2D): Promise<void> {
  try {
    const templateImg = await loadImage(limpa3);
    ctx.drawImage(templateImg, 0, 0, 1011, 740);
  } catch {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 1011, 740);
  }
}

function drawMrzText(ctx: CanvasRenderingContext2D, data: CnhVersoData): void {
  ctx.font = 'bold 32px "Courier Prime", "Courier New", monospace';
  ctx.fillStyle = '#373435';
  ctx.textAlign = 'left';

  // Linha 1 (fixa)
  ctx.fillText('I<BRA069082717<432<<<<<<<<<', 200.49, 446.02);

  // Linha 2 (fixa)
  ctx.fillText('9405253M1206157BRA<<<<<<<<4', 200.49, 493.26);

  // Linha 3 (variável - MRZ do nome)
  const mrzText = data.matrizFinal || 'NOME<<COMPLETO<<<<<<<';
  ctx.fillText(mrzText, 201.49, 538.84);
}

export async function generateCNHVerso(
  canvas: HTMLCanvasElement,
  data: CnhVersoData
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  canvas.width = 1011;
  canvas.height = 740;

  await loadFont();
  await drawTemplate(ctx);
  drawMrzText(ctx, data);
}

export type { CnhVersoData };
