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

// Guy Fawkes / Anonymous mask shape - defined as normalized coordinates (0-1)
// Returns brightness multiplier based on distance to mask features
function getMaskBrightness(nx: number, ny: number): number {
  // Mask centered at 0.5, 0.48 (slightly above center)
  const cx = 0.5, cy = 0.46;
  const dx = nx - cx, dy = ny - cy;

  // Face outline - oval
  const faceW = 0.18, faceH = 0.28;
  const faceDist = Math.sqrt((dx / faceW) ** 2 + (dy / faceH) ** 2);

  if (faceDist > 1.15) return 0; // Outside face

  // Forehead - top of face brighter
  const foreheadY = cy - 0.18;
  const foreheadDist = Math.sqrt(dx ** 2 + ((ny - foreheadY) / 0.06) ** 2);

  // Eyes - two dark holes
  const eyeY = cy - 0.04;
  const eyeSpacing = 0.06;
  const eyeW = 0.035, eyeH = 0.025;
  const leftEyeDist = Math.sqrt(((nx - (cx - eyeSpacing)) / eyeW) ** 2 + ((ny - eyeY) / eyeH) ** 2);
  const rightEyeDist = Math.sqrt(((nx - (cx + eyeSpacing)) / eyeW) ** 2 + ((ny - eyeY) / eyeH) ** 2);
  const isEye = leftEyeDist < 1 || rightEyeDist < 1;
  if (isEye) return 0.02; // Very dim inside eyes

  // Eyebrows - arched lines above eyes
  const browY = cy - 0.08;
  const leftBrowDist = Math.abs(ny - (browY + Math.abs(nx - (cx - eyeSpacing)) * 0.8)) < 0.012 && Math.abs(nx - (cx - eyeSpacing)) < 0.055;
  const rightBrowDist = Math.abs(ny - (browY + Math.abs(nx - (cx + eyeSpacing)) * 0.8)) < 0.012 && Math.abs(nx - (cx + eyeSpacing)) < 0.055;
  if (leftBrowDist || rightBrowDist) return 1.0;

  // Nose - thin vertical line
  const noseTop = cy + 0.01, noseBottom = cy + 0.08;
  const isNose = Math.abs(nx - cx) < 0.008 && ny > noseTop && ny < noseBottom;
  if (isNose) return 0.7;

  // Mustache - curved lines
  const mustacheY = cy + 0.1;
  const mustacheCurve = mustacheY + Math.abs(nx - cx) * 1.2;
  const isMustache = Math.abs(ny - mustacheCurve) < 0.012 && Math.abs(nx - cx) < 0.08 && ny > mustacheY - 0.02;
  if (isMustache) return 0.9;

  // Smile - curved line below mustache
  const smileY = cy + 0.15;
  const smileCurve = smileY + (nx - cx) ** 2 * 8;
  const isSmile = Math.abs(ny - smileCurve) < 0.008 && Math.abs(nx - cx) < 0.06;
  if (isSmile) return 0.8;

  // Goatee / chin beard - small triangle
  const goateeTop = cy + 0.16;
  const isGoatee = ny > goateeTop && ny < cy + 0.24 && Math.abs(nx - cx) < (cy + 0.24 - ny) * 0.4;
  if (isGoatee) return 0.3 + Math.random() * 0.2;

  // Cheeks - sides of face, medium brightness
  const cheekBrightness = Math.max(0, 1 - faceDist) * 0.5;

  // Face fill - gradient from center outward
  if (faceDist < 1) {
    const edgeFade = 1 - faceDist;
    return Math.max(0.08, edgeFade * 0.45 + cheekBrightness * 0.2);
  }

  // Outer edge glow
  if (faceDist < 1.15) {
    return (1.15 - faceDist) * 0.3;
  }

  return 0;
}

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
  inMask: boolean;
  maskBrightness: number;
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

      // Background scattered chars
      const bgCount = Math.floor((canvas.width * canvas.height) / 4000);
      for (let i = 0; i < bgCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const nx = x / canvas.width;
        const ny = y / canvas.height;
        const mb = getMaskBrightness(nx, ny);
        chars.push(createChar(x, y, mb));
      }

      // Dense mask chars - grid-based for the face area
      const gridSize = 13;
      const maskCenterX = canvas.width * 0.5;
      const maskCenterY = canvas.height * 0.46;
      const maskW = canvas.width * 0.4;
      const maskH = canvas.height * 0.6;

      for (let gx = maskCenterX - maskW / 2; gx < maskCenterX + maskW / 2; gx += gridSize) {
        for (let gy = maskCenterY - maskH / 2; gy < maskCenterY + maskH / 2; gy += gridSize) {
          const nx = gx / canvas.width;
          const ny = gy / canvas.height;
          const mb = getMaskBrightness(nx, ny);
          if (mb > 0.05) {
            // Add slight randomness to position
            const rx = gx + (Math.random() - 0.5) * 4;
            const ry = gy + (Math.random() - 0.5) * 4;
            chars.push(createChar(rx, ry, mb));
          }
        }
      }
    };

    const createChar = (x: number, y: number, maskBrightness: number): Char => {
      const inMask = maskBrightness > 0.05;
      const isSnippet = inMask ? Math.random() < 0.25 : Math.random() < 0.1;
      const maxLife = inMask ? 300 + Math.random() * 500 : 200 + Math.random() * 600;
      return {
        x,
        y,
        char: isSnippet
          ? CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]
          : ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
        opacity: 0,
        targetOpacity: inMask
          ? maskBrightness * (0.4 + Math.random() * 0.5)
          : 0.02 + Math.random() * 0.08,
        speed: inMask ? 0.05 + Math.random() * 0.2 : 0.2 + Math.random() * 0.5,
        size: isSnippet ? 9 + Math.random() * 2 : 10 + Math.random() * 4,
        isSnippet,
        life: Math.random() * 100, // stagger start
        maxLife,
        inMask,
        maskBrightness,
      };
    };

    const draw = () => {
      // Slow fade for trail effect
      ctx.fillStyle = 'rgba(10, 12, 16, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        c.life++;

        // Fade in/out lifecycle
        const fadeIn = Math.min(c.life / 50, 1);
        const fadeOut = Math.max(1 - (c.life - c.maxLife * 0.75) / (c.maxLife * 0.25), 0);
        c.opacity = c.targetOpacity * fadeIn * (c.life > c.maxLife * 0.75 ? fadeOut : 1);

        // Movement
        if (c.inMask) {
          // Mask chars: very subtle drift
          c.x += Math.sin(c.life * 0.008 + c.y * 0.01) * 0.08;
          c.y += Math.cos(c.life * 0.006 + c.x * 0.01) * 0.05;
        } else {
          // Background: slow fall
          c.y += c.speed * 0.25;
          c.x += Math.sin(c.life * 0.01 + c.y * 0.005) * 0.12;
        }

        // Randomly change chars
        if (Math.random() < (c.inMask ? 0.008 : 0.015)) {
          if (c.isSnippet) {
            c.char = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
          } else {
            c.char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
          }
        }

        // Color - mask chars are whiter, bg chars are more cyan
        let r: number, g: number, b: number;
        if (c.inMask) {
          const warmth = c.maskBrightness;
          r = 170 + warmth * 70;
          g = 180 + warmth * 60;
          b = 190 + warmth * 50;
        } else {
          r = 80 + Math.random() * 20;
          g = 150 + Math.random() * 30;
          b = 170 + Math.random() * 30;
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${c.opacity})`;
        ctx.font = `${c.size}px "Courier New", monospace`;
        ctx.fillText(c.char, c.x, c.y);

        // Recycle when expired
        if (c.life > c.maxLife) {
          const nx = c.x / canvas.width;
          const ny = c.y / canvas.height;
          if (c.inMask) {
            // Reset in place with new char
            const newChar = createChar(c.x + (Math.random() - 0.5) * 6, c.y + (Math.random() - 0.5) * 6, c.maskBrightness);
            newChar.life = 0;
            chars[i] = newChar;
          } else {
            chars[i] = createChar(Math.random() * canvas.width, -20, 0);
          }
        } else if (!c.inMask && c.y > canvas.height + 20) {
          chars[i] = createChar(Math.random() * canvas.width, -20, 0);
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
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
    />
  );
}
