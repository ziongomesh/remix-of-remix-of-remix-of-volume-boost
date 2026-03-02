import { useEffect, useRef } from 'react';

const ASCII_CHARS = '01{}[]()<>#!/$%&@?;:=+-*^~|\\/"\'abcdefghijklmnopqrstuvwxyz0123456789';
const CODE_SNIPPETS = [
  'function()', 'return', 'const', 'let', 'var', 'import', 'export', 'async', 'await',
  'if(true)', 'for(;;)', 'while(1)', 'class', 'new', 'this', 'null', 'void',
  'try{', '}catch', '===', '!==', '=>', '...', '&&', '||', '??',
  'sudo', 'chmod', 'ssh', 'root', 'admin', 'exec', 'kill',
  '0x00', '0xFF', '127.0.0.1', '192.168', '::1', 'tcp/ip',
  '<script>', '</div>', '<html>', 'SELECT *', 'DROP TABLE', 'INSERT INTO',
  'md5(', 'sha256', 'base64', 'encrypt', 'decrypt', 'hash',
  'GET /', 'POST /', 'HTTP/1.1', '200 OK', '403', '404', '500',
];

interface Char {
  x: number;
  y: number;
  char: string;
  opacity: number;
  targetOpacity: number;
  speed: number;
  size: number;
  isSnippet: boolean;
  life: number;
  maxLife: number;
}

export function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let chars: Char[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initChars();
    };

    const initChars = () => {
      chars = [];
      const density = Math.floor((canvas.width * canvas.height) / 2800);

      for (let i = 0; i < density; i++) {
        chars.push(createChar());
      }
    };

    const createChar = (): Char => {
      const isSnippet = Math.random() < 0.15;
      const maxLife = 200 + Math.random() * 600;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: isSnippet
          ? CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]
          : ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
        opacity: 0,
        targetOpacity: 0.03 + Math.random() * 0.18,
        speed: 0.2 + Math.random() * 0.8,
        size: isSnippet ? 10 + Math.random() * 3 : 11 + Math.random() * 5,
        isSnippet,
        life: 0,
        maxLife,
      };
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 12, 16, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        c.life++;

        // Fade in/out lifecycle
        const fadeIn = Math.min(c.life / 40, 1);
        const fadeOut = Math.max(1 - (c.life - c.maxLife * 0.7) / (c.maxLife * 0.3), 0);
        c.opacity = c.targetOpacity * fadeIn * (c.life > c.maxLife * 0.7 ? fadeOut : 1);

        // Slow drift
        c.y += c.speed * 0.3;
        c.x += Math.sin(c.life * 0.01 + c.y * 0.005) * 0.15;

        // Randomly change single chars
        if (!c.isSnippet && Math.random() < 0.02) {
          c.char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
        }

        // Draw
        const green = c.isSnippet ? 185 : 160 + Math.random() * 40;
        ctx.fillStyle = `rgba(${100 + Math.random() * 20}, ${green}, ${180 + Math.random() * 30}, ${c.opacity})`;
        ctx.font = `${c.size}px "Courier New", monospace`;
        ctx.fillText(c.char, c.x, c.y);

        // Recycle
        if (c.life > c.maxLife || c.y > canvas.height + 20) {
          chars[i] = createChar();
          chars[i].y = c.y > canvas.height + 20 ? -20 : Math.random() * canvas.height;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    // Initial full clear
    ctx.fillStyle = 'rgb(10, 12, 16)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}
