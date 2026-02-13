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
    const ocrBFontUrl = (await import('../assets/OCR-B.otf')).default;
    const font = new FontFace('OCR-B', `url(${ocrBFontUrl})`);
    const loaded = await font.load();
    document.fonts.add(loaded);
  } catch {
    // Fallback to Courier Prime
    try {
      const courierFontUrl = (await import('../assets/CourierPrime.ttf')).default;
      const font = new FontFace('Courier Prime', `url(${courierFontUrl})`, { weight: '700' });
      const loaded = await font.load();
      document.fonts.add(loaded);
    } catch { /* silent */ }
  }
  await document.fonts.ready;
}

async function drawTemplate(ctx: CanvasRenderingContext2D): Promise<void> {
  try {
    const templateImg = await loadImage(limpa3);
    ctx.drawImage(templateImg, 0, 0, 1011, 740);
    // Remove green/mint border by painting over edges with white
    ctx.fillStyle = '#FFFFFF';
    const borderSize = 15;
    ctx.fillRect(0, 0, 1011, borderSize); // top
    ctx.fillRect(0, 740 - borderSize, 1011, borderSize); // bottom
    ctx.fillRect(0, 0, borderSize, 740); // left
    ctx.fillRect(1011 - borderSize, 0, borderSize, 740); // right
  } catch {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 1011, 740);
  }
}

function drawMrzText(ctx: CanvasRenderingContext2D, data: CnhVersoData): void {
  ctx.font = '23px "OCR-B", "Courier Prime", "Courier New", monospace';
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
