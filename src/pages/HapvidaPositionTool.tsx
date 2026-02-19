import { useEffect, useRef, useState } from 'react';
import logoHapvida from '@/assets/logo-hapvida.png';

// Dimensões originais do PSD
const ORIG_W = 2090;
const ORIG_H = 2734;

// Canvas de exibição (proporcional)
const CANVAS_W = 794;
const CANVAS_H = Math.round(794 * (ORIG_H / ORIG_W)); // ≈ 1038px

// Escala para converter coordenadas originais → canvas
const SCALE = CANVAS_W / ORIG_W;

export default function HapvidaPositionTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Coordenadas no espaço original (2090×2734) → escalar para canvas
  const [logoPos] = useState({ x: 99, y: 250 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const logo = new Image();
    logo.onload = () => {
      const folha = new Image();
      folha.onload = () => {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.drawImage(folha, 0, 0, CANVAS_W, CANVAS_H);

        // Retângulo do cabeçalho
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(63.47 * SCALE, 178.75 * SCALE, 1963.05 * SCALE, 220.42 * SCALE);

        // Logo
        ctx.drawImage(logo, logoPos.x * SCALE, logoPos.y * SCALE, 394 * SCALE, 91 * SCALE);

        // Título ATESTADO MÉDICO
        const fontSize = Math.round(40 * SCALE);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText('ATESTADO MÉDICO', 798 * SCALE, (499 + 38) * SCALE);

        // Linha de rodapé
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, 4.3 * SCALE);
        ctx.beginPath();
        ctx.moveTo(102.69 * SCALE, 2461.97 * SCALE);
        ctx.lineTo((102.69 + 1887.44) * SCALE, 2461.97 * SCALE);
        ctx.stroke();

        // Linha interna (linha_3)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, 1.67 * SCALE);
        ctx.beginPath();
        ctx.moveTo(150.5 * SCALE, 1201.84 * SCALE);
        ctx.lineTo((150.5 + 733.54) * SCALE, 1201.84 * SCALE);
        ctx.stroke();

        // Linha tracejada (Linha_1)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, 0.83 * SCALE);
        ctx.setLineDash([6 * SCALE, 4 * SCALE]);
        ctx.beginPath();
        ctx.moveTo(149.91 * SCALE, 1073.25 * SCALE);
        ctx.lineTo((149.91 + 331.22) * SCALE, 1073.25 * SCALE);
        ctx.stroke();
        ctx.setLineDash([]);
      };
      folha.src = '/images/hapvida-folha.png';
    };
    logo.src = logoHapvida;
  }, [logoPos]);

  return (
    <div style={{ minHeight: '100vh', background: '#444', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', gap: '12px' }}>
      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Preview Hapvida — /teste7</div>
      <div style={{ color: '#ccc', fontSize: '13px' }}>Logo: X={logoPos.x}px, Y={logoPos.y}px</div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ background: '#fff', display: 'block', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      />
    </div>
  );
}
