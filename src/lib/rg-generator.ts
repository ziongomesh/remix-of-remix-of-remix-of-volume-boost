// Gerador de RG Digital (Canvas client-side)

export interface RgData {
  nomeCompleto: string;
  nomeSocial?: string;
  cpf: string;
  dataNascimento: string;
  naturalidade: string;
  genero: string;
  nacionalidade: string;
  validade: string;
  uf: string;
  dataEmissao: string;
  local: string;
  orgaoExpedidor: string;
  pai?: string;
  mae?: string;
  foto?: File | string;
  assinatura?: File | string;
}

// Estado por extenso
export function textoEstado(uf: string): string {
  const estados: Record<string, string> = {
    AC: 'Estado do Acre', AL: 'Estado de Alagoas', AP: 'Estado do Amapá',
    AM: 'Estado do Amazonas', BA: 'Estado da Bahia', CE: 'Estado do Ceará',
    DF: 'Distrito Federal', ES: 'Estado do Espírito Santo', GO: 'Estado de Goiás',
    MA: 'Estado do Maranhão', MT: 'Estado do Mato Grosso', MS: 'Estado do Mato Grosso do Sul',
    MG: 'Estado de Minas Gerais', PA: 'Estado do Pará', PB: 'Estado da Paraíba',
    PR: 'Estado do Paraná', PE: 'Estado de Pernambuco', PI: 'Estado do Piauí',
    RJ: 'Estado do Rio de Janeiro', RN: 'Estado do Rio Grande do Norte',
    RS: 'Estado do Rio Grande do Sul', RO: 'Estado de Rondônia', RR: 'Estado de Roraima',
    SC: 'Estado de Santa Catarina', SP: 'Estado de São Paulo', SE: 'Estado de Sergipe',
    TO: 'Estado do Tocantins',
  };
  return estados[uf?.toUpperCase()] || `Estado de ${uf?.toUpperCase()}`;
}

export function formatCPFDisplay(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
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
    if (!document.querySelector('link[href*="Tahoma"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
    await document.fonts.ready;
  } catch {
    // fallback
  }
}

// =================== FRENTE ===================
export async function generateRGFrente(
  canvas: HTMLCanvasElement,
  data: RgData
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  await loadFonts();

  const templateImg = await loadImage('/images/rg-frente.png');
  canvas.width = templateImg.width;
  canvas.height = templateImg.height;

  ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

  // Estado em cinza centralizado
  ctx.font = '21px "Noto Sans", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#4A4A4D';
  ctx.textAlign = 'center';
  ctx.fillText(textoEstado(data.uf), canvas.width / 2 + 30, 150);
  ctx.fillText('Secretaria de Segurança Pública da Unidade de Federação', canvas.width / 2, 175);

  // Foto
  if (data.foto) {
    try {
      let fotoSrc: string;
      if (data.foto instanceof File) {
        fotoSrc = await readFileAsDataURL(data.foto);
      } else {
        fotoSrc = data.foto;
      }
      const fotoImg = await loadImage(fotoSrc);
      ctx.drawImage(fotoImg, 159, 287, 241, 299);
    } catch (e) { console.error('RG Frente: erro ao desenhar foto:', e); }
  } else {
    console.warn('RG Frente: nenhuma foto fornecida');
  }

  // Textos
  ctx.textAlign = 'left';
  ctx.font = '21px "Noto Sans", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#000000';

  ctx.fillText(data.nomeCompleto || '', 436, 275);
  ctx.fillText(data.nomeSocial || '', 436, 365);
  ctx.fillText(formatCPFDisplay(data.cpf || ''), 436, 455);
  ctx.fillText(formatDateBR(data.dataNascimento || ''), 436, 515);
  ctx.fillText(data.naturalidade || '', 436, 575);
  ctx.fillText(data.genero || '', 829, 455);
  ctx.fillText(data.nacionalidade || 'BRA', 829, 515);
  ctx.fillText(formatDateBR(data.validade || ''), 829, 583);

  // Assinatura
  if (data.assinatura) {
    try {
      let assSrc: string;
      if (data.assinatura instanceof File) {
        assSrc = await readFileAsDataURL(data.assinatura);
      } else {
        assSrc = data.assinatura;
      }
      const assImg = await loadImage(assSrc);
      const escala = Math.min(279 / assImg.width, 52 / assImg.height);
      ctx.drawImage(assImg, 491, 640, assImg.width * escala, assImg.height * escala);
    } catch (e) { console.error('RG Frente: erro ao desenhar assinatura:', e); }
  } else {
    console.warn('RG Frente: nenhuma assinatura fornecida');
  }
}

// =================== VERSO ===================
export async function generateRGVerso(
  canvas: HTMLCanvasElement,
  data: RgData,
  qrCodeDataUrl?: string
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  await loadFonts();

  const templateImg = await loadImage('/images/rg-verso.png');
  canvas.width = templateImg.width;
  canvas.height = templateImg.height;

  ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

  // Textos
  ctx.font = '21px "Noto Sans", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';

  ctx.fillText(data.pai || '', 338.89, 170);
  ctx.fillText(data.mae || '', 338.89, 230);
  ctx.fillText(data.orgaoExpedidor || '', 338.89, 328);
  ctx.fillText(data.local || '', 338.89, 432);
  ctx.fillText(formatDateBR(data.dataEmissao || ''), 728, 432);

  // QR Code no verso - posição calibrada via /teste2
  // Proporção: x=5.36%, y=17.03%, size=22.88% da imagem
  if (qrCodeDataUrl) {
    try {
      const qrImg = await loadImage(qrCodeDataUrl);
      const qrX = canvas.width * 0.0536;
      const qrY = canvas.height * 0.1703;
      const qrSize = canvas.width * 0.2288;
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch { /* silencioso */ }
  }
}

// MRZ
export function formatarNomeMRZ(nome: string): string {
  const nomeLimpo = nome.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, '')
    .trim()
    .replace(/\s+/g, '<');
  return `D<${nomeLimpo}<<<<<`.slice(0, 44);
}

// =================== FULL PDF PAGE (single PNG) ===================
export async function generateRGPdfPage(
  frenteCanvas: HTMLCanvasElement,
  versoCanvas: HTMLCanvasElement,
  qrCodeDataUrl: string,
): Promise<string> {
  await loadFonts();

  const scale = 3;
  const pageW = Math.round(595.28 * scale);
  const pageH = Math.round(841.89 * scale);
  const mmToPx = (mm: number) => mm * 2.8346 * scale;

  const canvas = document.createElement('canvas');
  canvas.width = pageW;
  canvas.height = pageH;
  const ctx = canvas.getContext('2d')!;

  // White base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, pageW, pageH);

  // Background template
  try {
    const bg = await loadImage('/images/rg-pdf-bg.png');
    ctx.drawImage(bg, 0, 0, pageW, pageH);
  } catch (e) { console.warn('Could not load rg-pdf-bg.png:', e); }

  const fontFamily = '"Noto Sans", Tahoma, Arial, sans-serif';

  // === HEADER ===
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold ${14 * scale}px ${fontFamily}`;
  ctx.fillStyle = '#262626';
  ctx.fillText('Carteira de Identidade', mmToPx(13), mmToPx(10));

  // Date line
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  ctx.font = `${8 * scale}px ${fontFamily}`;
  ctx.fillStyle = '#666666';
  ctx.fillText('Compartilhado pelo aplicativo ', mmToPx(13), mmToPx(18));
  const w1 = ctx.measureText('Compartilhado pelo aplicativo ').width;
  ctx.font = `bold ${8 * scale}px ${fontFamily}`;
  ctx.fillStyle = '#262626';
  ctx.fillText('gov.br', mmToPx(13) + w1, mmToPx(18));
  const w2 = ctx.measureText('gov.br').width;
  ctx.font = `${8 * scale}px ${fontFamily}`;
  ctx.fillStyle = '#666666';
  ctx.fillText(` em ${dateStr}`, mmToPx(13) + w1 + w2, mmToPx(18));

  // gov.br top right
  ctx.font = `bold ${10 * scale}px ${fontFamily}`;
  ctx.fillStyle = '#338033';
  ctx.fillText('gov.br', pageW - mmToPx(20), mmToPx(12));

  // === MATRICES ===
  const matrizW = mmToPx(85);
  const matrizH = mmToPx(55);
  ctx.drawImage(frenteCanvas, mmToPx(13.406), mmToPx(21.595), matrizW, matrizH);
  ctx.drawImage(versoCanvas, mmToPx(13.406), mmToPx(84.691), matrizW, matrizH);

  // === QR CODE (right side) ===
  if (qrCodeDataUrl) {
    try {
      const qrImg = await loadImage(qrCodeDataUrl);
      const qrSize = mmToPx(63.788);

      // QR Code label
      ctx.font = `bold ${12 * scale}px ${fontFamily}`;
      ctx.fillStyle = '#262626';
      ctx.fillText('QR Code', mmToPx(118), mmToPx(24));

      // QR image
      ctx.drawImage(qrImg, mmToPx(118.276), mmToPx(35.975), qrSize, qrSize);

      // Verification text
      ctx.font = `${7 * scale}px ${fontFamily}`;
      ctx.fillStyle = '#666666';
      const verifyY = mmToPx(35.975) + qrSize + mmToPx(5);
      const verifyLines = [
        'Verifique a autenticidade da Carteira de',
        'Identidade Nacional lendo o QR code',
        'com o aplicativo Vio.',
      ];
      verifyLines.forEach((line, i) => {
        ctx.fillText(line, mmToPx(120), verifyY + i * (10 * scale));
      });
    } catch (e) { console.warn('QR code draw error:', e); }
  }

  // === DOCUMENTO DE IDENTIFICAÇÃO BOX ===
  const boxX = mmToPx(108);
  const boxY = mmToPx(120);
  const boxW = mmToPx(90);
  const boxH = mmToPx(8);
  ctx.fillStyle = '#ED9B1A';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.font = `bold ${9 * scale}px ${fontFamily}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Documento de Identificação', boxX + mmToPx(10), boxY + mmToPx(5.5));

  // Legal text
  ctx.font = `${7 * scale}px ${fontFamily}`;
  ctx.fillStyle = '#4D4D4D';
  const legalY = boxY + boxH + mmToPx(5);
  const legalLines = [
    'Este documento digital pode ser utilizado',
    'para sua identificação, não sendo',
    'necessária a apresentação de documento',
    'complementar, conforme Decreto n° 10.977,',
    'de 23 de fevereiro de 2022.',
  ];
  legalLines.forEach((line, i) => {
    ctx.fillText(line, boxX + mmToPx(3), legalY + i * (10 * scale));
  });

  // === BOTTOM TABLE ===
  const tableX = mmToPx(13);
  const tableY = mmToPx(155);
  const colW = mmToPx(90);
  const rowH = mmToPx(10);
  const tableW = mmToPx(184);
  const tableH = rowH * 3;

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(tableX, tableY, tableW, tableH);

  // Borders
  ctx.strokeStyle = '#BFBFBF';
  ctx.lineWidth = scale * 0.5;
  ctx.strokeRect(tableX, tableY, tableW, tableH);

  // Horizontal lines
  ctx.beginPath();
  ctx.moveTo(tableX, tableY + rowH);
  ctx.lineTo(tableX + tableW, tableY + rowH);
  ctx.moveTo(tableX, tableY + rowH * 2);
  ctx.lineTo(tableX + tableW, tableY + rowH * 2);
  ctx.stroke();

  // Vertical line
  ctx.beginPath();
  ctx.moveTo(tableX + colW, tableY);
  ctx.lineTo(tableX + colW, tableY + tableH);
  ctx.stroke();

  // Table labels
  const labelSize = 6 * scale;
  const valueSize = 8 * scale;
  ctx.font = `${labelSize}px ${fontFamily}`;
  ctx.fillStyle = '#666666';
  ctx.fillText('Título de eleitor', tableX + 4 * scale, tableY + 8 * scale);
  ctx.fillText('Tipo sanguíneo Fator RH', tableX + colW + 4 * scale, tableY + 8 * scale);

  ctx.fillText('Estado civil', tableX + 4 * scale, tableY + rowH + 8 * scale);
  ctx.font = `bold ${valueSize}px ${fontFamily}`;
  ctx.fillStyle = '#262626';
  ctx.fillText('Solteiro (a)', tableX + 4 * scale, tableY + rowH + 18 * scale);

  ctx.font = `${labelSize}px ${fontFamily}`;
  ctx.fillStyle = '#666666';
  ctx.fillText('Doador de Órgãos', tableX + colW + 4 * scale, tableY + rowH + 8 * scale);
  ctx.font = `bold ${valueSize}px ${fontFamily}`;
  ctx.fillStyle = '#262626';
  ctx.fillText('NÃO', tableX + colW + 4 * scale, tableY + rowH + 18 * scale);

  ctx.font = `${labelSize}px ${fontFamily}`;
  ctx.fillStyle = '#666666';
  ctx.fillText('Assinatura', tableX + 4 * scale, tableY + rowH * 2 + 8 * scale);
  ctx.fillText('Certidão de Nasc Casamento Averb. Divórcio', tableX + colW + 4 * scale, tableY + rowH * 2 + 8 * scale);

  return canvas.toDataURL('image/png');
}
