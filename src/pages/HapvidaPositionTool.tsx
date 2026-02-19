import { useEffect, useRef, useState } from 'react';
import logoHapvida from '@/assets/logo-hapvida.png';

// Canvas dimensions matching the folha.png (A4 proportional)
const CANVAS_W = 794;
const CANVAS_H = 1123;

// Sample data for preview
const SAMPLE = {
  nomeHospital: 'HOSPITAL RIO NEGRO',
  endereco: 'R. TAPAJOS, 961 - CENTRO',
  cidade: 'MANAUUS- AM, CEP 69010-150 telefone (92) 4002-3633',
  paciente: 'NEYMAR JUNIOR GAMA',
  cpf: '704.762.672-77',
  horario: '12:32',
  dias: '1 (UM)',
  dataAtendimento: '19/02/2026',
  cid: 'N30.0',
  localData: 'Manaus, 19 de Fevereiro de 2026',
  nomeMedico: 'RODOLFO CARDOSO DUTRA DE ALENCAR',
  crm: 'CRM 12596-AM',
  codigoAuth: '3M15KLJSAF9',
  dataHoraSoliciatcao: '19/02/2026 12:32:14',
  dataHoraRodape: '19/02/2026 12:32:14',
  ip: '10.200.125.141',
};

export default function HapvidaPositionTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logoPos] = useState({ x: 99, y: 250 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Draw white background (folha)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw outer border of the document
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, CANVAS_W - 80, CANVAS_H - 80);

    const drawAll = (logoImg: HTMLImageElement) => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Header box border
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1;
      ctx.strokeRect(60, 60, CANVAS_W - 120, 110);

      // Draw logo
      const logoW = 180;
      const logoH = 60;
      ctx.drawImage(logoImg, logoPos.x, logoPos.y - 30, logoW, logoH);

      // Vertical divider in header
      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(270, 65);
      ctx.lineTo(270, 165);
      ctx.stroke();

      // Hospital name (bold, underlined)
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      // Underline effect
      const hospitalText = SAMPLE.nomeHospital;
      const textX = (270 + CANVAS_W - 60) / 2;
      ctx.fillText(hospitalText, textX, 95);
      const tw = ctx.measureText(hospitalText).width;
      ctx.fillRect(textX - tw / 2, 98, tw, 1);

      ctx.font = '11px Arial';
      ctx.fillText(SAMPLE.endereco, textX, 115);
      ctx.fillText(SAMPLE.cidade, textX, 131);

      // Title
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ATESTADO MÉDICO', CANVAS_W / 2, 210);

      // Body text
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      const bodyX = 80;
      const bodyText = `    Atesto que atendi nesta data o (a) Sr (a) ${SAMPLE.paciente}, CPF ${SAMPLE.cpf}  às  ${SAMPLE.horario}, sendo necessário o seu afastamento das atividades laborativas ou academicas por ${SAMPLE.dias} dia (s), a partir de ${SAMPLE.dataAtendimento}, tendo como causa do atendimento o código abaixo:`;

      // Word wrap for body text
      wrapText(ctx, bodyText, bodyX, 260, CANVAS_W - 160, 18);

      // CID
      ctx.font = '12px Arial';
      ctx.fillText(SAMPLE.cid, bodyX, 360);
      ctx.fillRect(bodyX, 365, 120, 1);
      ctx.fillText('Código da Doença', bodyX, 382);

      // Local e Data line
      ctx.fillRect(bodyX, 420, 280, 1);
      ctx.textAlign = 'center';
      ctx.fillText('Local e Data', bodyX + 140, 437);

      // Assinatura
      ctx.textAlign = 'left';
      ctx.fillRect(bodyX, 470, 280, 1);
      ctx.fillText('Assinatura do Médico', bodyX, 487);

      // Nome médico (bold + underline)
      ctx.font = 'bold 12px Arial';
      ctx.fillText(SAMPLE.nomeMedico, bodyX, 510);
      const nmw = ctx.measureText(SAMPLE.nomeMedico).width;
      ctx.fillRect(bodyX, 513, nmw, 1);

      ctx.font = '12px Arial';
      ctx.fillText(SAMPLE.crm, bodyX, 533);

      // Aceito da colocação
      ctx.fillText('Aceita a Colocação do CID. Assinado us', bodyX, 575);
      ctx.fillRect(bodyX + 270, 576, 150, 1);

      // Auth code
      ctx.fillText(`Codigo de Autenticação: ${SAMPLE.codigoAuth}`, bodyX, 596);
      ctx.fillText(`Solicitação da senha: ${SAMPLE.dataHoraSoliciatcao}`, bodyX, 614);

      // Link
      ctx.fillText('Link para validação do Atestado Médico:', bodyX, 648);
      ctx.fillStyle = '#000080';
      ctx.fillText('https://webhap.hapvida.com.br/pls/pk_autentica_atestado_internet.login', bodyX, 666);
      ctx.fillStyle = '#000000';

      // Stamp placeholder box
      const stampX = CANVAS_W - 250;
      const stampY = 420;
      ctx.strokeStyle = '#5555aa';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(stampX, stampY, 160, 160);
      ctx.setLineDash([]);
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#888888';
      ctx.fillText('Assinatura/Carimbo', stampX + 80, stampY + 85);
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';

      // Footer divider
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, CANVAS_H - 80);
      ctx.lineTo(CANVAS_W - 60, CANVAS_H - 80);
      ctx.stroke();

      // Footer text
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(SAMPLE.dataHoraRodape, 80, CANVAS_H - 60);
      ctx.textAlign = 'right';
      ctx.fillText(SAMPLE.ip, CANVAS_W - 80, CANVAS_H - 60);
      ctx.textAlign = 'left';
    };

    // Load logo
    const img = new Image();
    img.onload = () => drawAll(img);
    img.src = logoHapvida;
  }, [logoPos]);

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center py-8 gap-4">
      <div className="text-white text-xl font-bold">Preview Hapvida — /teste7</div>
      <div className="text-gray-300 text-sm">
        Logo: X={logoPos.x}px, Y={logoPos.y}px
      </div>
      <div className="shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ background: '#fff', display: 'block' }}
        />
      </div>
    </div>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY;
}
