// Gerador de CNH Frente (Canvas client-side)

interface CnhData {
  nome?: string;
  dataNascimento?: string;
  hab?: string;
  dataEmissao?: string;
  dataValidade?: string;
  docIdentidade?: string;
  cpf?: string;
  numeroRegistro?: string;
  categoria?: string;
  pai?: string;
  mae?: string;
  espelho?: string;
  codigo_seguranca?: string;
  renach?: string;
  foto?: File | string;
  assinatura?: File | string;
  sexo?: string;
  nacionalidade?: string;
  cnhDefinitiva?: string;
}

const CNH_CONFIG = {
  width: 1011,
  height: 740,
  fields: {
    nome: { x: 190, y: 230, font: 'bold 20px Asul, Arial, sans-serif', color: '#373435' },
    nascimento: { x: 470, y: 290, font: 'bold 20px Asul, Arial, sans-serif', color: '#373435' },
    primeiraHab: { x: 830, y: 230, font: 'bold 20px Asul, Arial, sans-serif', color: '#373435' },
    data_emissao: { x: 470, y: 350, font: 'bold 20px Asul, Arial, sans-serif', color: '#373435' },
    data_validade: { x: 650, y: 350, font: 'bold 20px Asul, Arial, sans-serif', color: 'red' },
    rg: { x: 470, y: 410, font: 'bold 20px Asul, Arial, sans-serif', color: '#373435' },
    cpf: { x: 470, y: 470, font: 'bold 20px Asul, Arial, sans-serif', color: '#373435' },
    registro: { x: 680, y: 470, font: 'bold 20px Asul, Arial, sans-serif', color: 'red' },
    categoria: { x: 870, y: 470, font: 'bold 20px Asul, Arial, sans-serif', color: 'red' },
    nacionalidade: { x: 470, y: 530, font: 'bold 20px Asul, Arial, sans-serif', color: '#373435' },
    filiacaoPai: { x: 470, y: 590, font: 'bold 20px Asul, Arial, sans-serif', color: '#373435' },
    filiacaoMae: { x: 470, y: 650, font: 'bold 20px Asul, Arial, sans-serif', color: '#373435' },
  },
  images: {
    foto: { x: 184, y: 275, width: 250, height: 345 },
    assinatura: { x: 188, y: 630, width: 243, height: 64 },
  },
};

function getNacionalidadePorGenero(nacionalidade: string = 'brasileiro', sexo: string = 'M'): string {
  if (!nacionalidade) return 'BRASILEIRO(A)';
  const isFeminino = sexo === 'F';
  if (nacionalidade.toLowerCase() === 'brasileiro') {
    return isFeminino ? 'BRASILEIRA' : 'BRASILEIRO';
  } else if (nacionalidade.toLowerCase() === 'estrangeiro') {
    return isFeminino ? 'ESTRANGEIRA' : 'ESTRANGEIRO';
  }
  return 'BRASILEIRO(A)';
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadFonts(): Promise<void> {
  try {
    // Tentar carregar Asul do assets
    try {
      const asulFontUrl = (await import('../assets/Asul.ttf')).default;
      const asulRegular = new FontFace('Asul', `url(${asulFontUrl})`, { weight: '400' });
      const asulBold = new FontFace('Asul', `url(${asulFontUrl})`, { weight: '700' });
      const [loadedR, loadedB] = await Promise.all([asulRegular.load(), asulBold.load()]);
      document.fonts.add(loadedR);
      document.fonts.add(loadedB);
    } catch {
      // Asul não disponível localmente, usar fallback
    }

    // Tentar carregar Courier Prime Bold
    try {
      const courierFontUrl = (await import('../assets/CourierPrime.ttf')).default;
      const courierBold = new FontFace('Courier Prime', `url(${courierFontUrl})`, { weight: '700' });
      const loaded = await courierBold.load();
      document.fonts.add(loaded);
    } catch {
      // Courier Prime não disponível localmente
    }

    // Garantir Google Fonts como fallback
    if (!document.querySelector('link[href*="Asul"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Asul:wght@400;700&family=Courier+Prime:wght@700&display=swap';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    await document.fonts.ready;
  } catch {
    // Silenciosamente usa fallback
  }
}

function formatDateToBrazilian(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

async function drawTemplate(ctx: CanvasRenderingContext2D, cnhDefinitiva: string = 'sim'): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, CNH_CONFIG.width, CNH_CONFIG.height);
      resolve();
    };
    img.onerror = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, CNH_CONFIG.width, CNH_CONFIG.height);
      resolve();
    };
    const templateFile = cnhDefinitiva === 'sim' ? '/images/limpa1.png' : '/images/limpa-1.png';
    img.src = templateFile;
  });
}

async function drawTexts(ctx: CanvasRenderingContext2D, data: CnhData): Promise<void> {
  ctx.textAlign = 'left';

  const displayData = {
    nome: data.nome || '',
    nascimento: data.dataNascimento || '',
    primeiraHab: formatDateToBrazilian(data.hab || ''),
    data_emissao: formatDateToBrazilian(data.dataEmissao || ''),
    data_validade: formatDateToBrazilian(data.dataValidade || ''),
    rg: data.docIdentidade || '',
    cpf: data.cpf || '',
    registro: data.numeroRegistro || '',
    categoria: data.categoria || '',
    nacionalidade: getNacionalidadePorGenero(data.nacionalidade, data.sexo),
    filiacaoPai: data.pai || '',
    filiacaoMae: data.mae || '',
  };

  await document.fonts.ready;

  Object.entries(CNH_CONFIG.fields).forEach(([field, config]) => {
    ctx.font = config.font;
    ctx.fillStyle = config.color || '#373435';
    const text = displayData[field as keyof typeof displayData] || '';
    ctx.fillText(text, config.x, config.y);
  });
}

async function drawImages(ctx: CanvasRenderingContext2D, data: CnhData): Promise<void> {
  if (data.foto) {
    try {
      let fotoDataUrl: string;
      if (data.foto instanceof File) {
        fotoDataUrl = await readFileAsDataURL(data.foto);
      } else {
        fotoDataUrl = data.foto.startsWith('data:') ? data.foto : `/${data.foto}`;
      }
      const fotoImg = await loadImage(fotoDataUrl);
      const { x, y, width, height } = CNH_CONFIG.images.foto;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, 0, width, y + height);
      ctx.clip();
      ctx.drawImage(fotoImg, x, y, width, height);
      ctx.restore();
    } catch {
      // Silencioso
    }
  }

  if (data.assinatura) {
    try {
      let assDataUrl: string;
      if (data.assinatura instanceof File) {
        assDataUrl = await readFileAsDataURL(data.assinatura);
      } else {
        assDataUrl = data.assinatura.startsWith('data:') ? data.assinatura : `/${data.assinatura}`;
      }
      const assImg = await loadImage(assDataUrl);
      const { x, y, width, height } = CNH_CONFIG.images.assinatura;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
      ctx.drawImage(assImg, x, y, width, height);
      ctx.restore();
    } catch {
      // Silencioso
    }
  }
}

function drawEspelho(ctx: CanvasRenderingContext2D, text?: string): void {
  if (!text) return;
  ctx.save();
  ctx.translate(130, 690);
  ctx.rotate(-Math.PI / 2);

  if (document.fonts.check('700 60px Courier Prime')) {
    ctx.font = '700 60px Courier Prime';
  } else {
    ctx.font = '700 60px "Courier New", monospace';
  }

  ctx.fillStyle = 'black';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

export async function generateCNH(
  canvas: HTMLCanvasElement,
  data: CnhData,
  cnhDefinitiva: string = 'sim'
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = CNH_CONFIG.width;
  canvas.height = CNH_CONFIG.height;

  await loadFonts();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cnhTipo = data.cnhDefinitiva || cnhDefinitiva;
  await drawTemplate(ctx, cnhTipo);
  await drawTexts(ctx, data);
  await drawImages(ctx, data);
  drawEspelho(ctx, data.espelho);
}

export type { CnhData };
