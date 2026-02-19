import { useEffect, useRef, useState } from 'react';
import logoHapvida from '@/assets/logo-hapvida.png';

const CANVAS_W = 794;
const CANVAS_H = 1123;

export default function HapvidaPositionTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
        ctx.drawImage(logo, logoPos.x, logoPos.y, 180, 60);
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
