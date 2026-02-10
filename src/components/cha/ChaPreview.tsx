import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import matrizcha from '@/assets/templates/matrizcha.png';
import matrizcha2 from '@/assets/templates/matrizcha2.png';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

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

export interface ChaPreviewHandle {
  getFrenteBase64: () => string;
  getVersoBase64: () => string;
}

// Default positions as fractions of canvas W/H
interface FieldPos { x: number; y: number }

const DEFAULT_FRONT_POSITIONS: Record<string, FieldPos> = {
  nome:            { x: 0.083, y: 0.438 },
  dataNascimento:  { x: 0.083, y: 0.573 },
  cpf:             { x: 0.368, y: 0.573 },
  categoriaPt:     { x: 0.083, y: 0.705 },
  categoriaEn:     { x: 0.083, y: 0.745 },
  validade:        { x: 0.085, y: 0.839 },
  numeroInscricao: { x: 0.368, y: 0.839 },
  foto:            { x: 0.642, y: 0.412 },
};

const DEFAULT_BACK_POSITIONS: Record<string, FieldPos> = {
  limiteNavegacao:   { x: 0.087, y: 0.092 },
  limiteNavegacaoEn: { x: 0.083, y: 0.274 },
  requisitos:        { x: 0.089, y: 0.283 },
  orgaoEmissao:      { x: 0.087, y: 0.474 },
  emissao:           { x: 0.633, y: 0.475 },
};

const catDisplayMap: Record<string, { pt: string; en: string }> = {
  'ARRAIS AMADOR': { pt: 'ARRAIS AMADOR', en: 'AMATEUR SKIPPER' },
  'MESTRE AMADOR': { pt: 'MESTRE AMADOR', en: 'AMATEUR MASTER' },
  'CAPITÃO AMADOR': { pt: 'CAPITÃO AMADOR', en: 'AMATEUR CAPTAIN' },
};

const limiteEnFullMap: Record<string, string> = {
  'NAVEGAÇÃO INTERIOR. QUANDO PILOTANDO MOTO AQUÁTICA, INTERIOR.': 'INLAND NAVIGATION. WHEN PILOTING PERSONAL WATERCRAFT, INLAND WATERS.',
  'NAVEGAÇÃO INTERIOR': 'INLAND NAVIGATION.',
  'ÁGUAS ABRIGADAS': 'SHELTERED WATERS.',
  'NAVEGAÇÃO COSTEIRA': 'COASTAL NAVIGATION.',
  'ALTO MAR': 'OPEN SEA.',
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lines = 1;
  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY, maxWidth);
      line = word;
      currentY += lineHeight;
      lines++;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY, maxWidth);
  return lines;
}

function drawChaFront(
  ctx: CanvasRenderingContext2D,
  bgImg: HTMLImageElement,
  fotoImg: HTMLImageElement | null,
  data: ChaPreviewProps,
  w: number,
  h: number,
  positions: Record<string, FieldPos>,
  highlightField?: string | null
) {
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(bgImg, 0, 0, w, h);

  ctx.fillStyle = '#1a1a1a';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 18px Arial, sans-serif';

  const fields: { key: string; text: string }[] = [
    { key: 'nome', text: data.nome.toUpperCase() },
    { key: 'dataNascimento', text: data.dataNascimento },
    { key: 'cpf', text: data.cpf },
  ];

  const catText = data.categoria.toUpperCase();
  const catDisplay = catDisplayMap[catText] || { pt: catText, en: '' };
  fields.push({ key: 'categoriaPt', text: catDisplay.pt });
  if (catDisplay.en) {
    fields.push({ key: 'categoriaEn', text: catDisplay.en });
  }
  fields.push({ key: 'validade', text: data.validade });
  fields.push({ key: 'numeroInscricao', text: data.numeroInscricao.toUpperCase() });

  for (const f of fields) {
    const pos = positions[f.key] || DEFAULT_FRONT_POSITIONS[f.key];
    if (!pos) continue;
    if (highlightField === f.key) {
      ctx.fillStyle = '#0066ff';
      ctx.fillText(f.text, w * pos.x, h * pos.y);
      ctx.fillStyle = '#1a1a1a';
    } else {
      ctx.fillText(f.text, w * pos.x, h * pos.y);
    }
  }

  // Foto
  if (fotoImg && fotoImg.naturalWidth > 0 && fotoImg.naturalHeight > 0) {
    const fotoPos = positions.foto || DEFAULT_FRONT_POSITIONS.foto;
    const fotoX = w * fotoPos.x;
    const fotoY = h * fotoPos.y;
    const fotoW = w * 0.286;
    const fotoH = h * 0.521;
    ctx.save();
    ctx.beginPath();
    ctx.rect(fotoX, fotoY, fotoW, fotoH);
    ctx.clip();
    const imgRatio = fotoImg.naturalWidth / fotoImg.naturalHeight;
    const boxRatio = fotoW / fotoH;
    let drawW: number, drawH: number, drawX: number, drawY: number;
    if (imgRatio > boxRatio) {
      drawH = fotoH; drawW = fotoH * imgRatio;
      drawX = fotoX + (fotoW - drawW) / 2; drawY = fotoY;
    } else {
      drawW = fotoW; drawH = fotoW / imgRatio;
      drawX = fotoX; drawY = fotoY + (fotoH - drawH) / 2;
    }
    ctx.drawImage(fotoImg, drawX, drawY, drawW, drawH);
    ctx.restore();
  }
}

function drawChaBack(
  ctx: CanvasRenderingContext2D,
  bgImg: HTMLImageElement,
  data: ChaPreviewProps,
  w: number,
  h: number,
  positions: Record<string, FieldPos>,
  highlightField?: string | null
) {
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(bgImg, 0, 0, w, h);

  ctx.fillStyle = '#1a1a1a';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 18px Arial, sans-serif';

  // Limites da Navegação PT
  const limPos = positions.limiteNavegacao || DEFAULT_BACK_POSITIONS.limiteNavegacao;
  const limiteText = data.limiteNavegacao.toUpperCase();
  ctx.font = 'bold 12px Arial, sans-serif';
  if (highlightField === 'limiteNavegacao') ctx.fillStyle = '#0066ff';
  wrapText(ctx, limiteText, w * limPos.x, h * limPos.y, w * 0.82, 15);
  ctx.fillStyle = '#1a1a1a';

  // Limites EN
  const cleanLimite = limiteText.replace(/\./g, '').replace(/,/g, '').trim();
  const matchingKey = Object.keys(limiteEnFullMap).find(k => cleanLimite.includes(k.replace(/\./g, '').replace(/,/g, '')));
  if (matchingKey) {
    const enPos = positions.limiteNavegacaoEn || DEFAULT_BACK_POSITIONS.limiteNavegacaoEn;
    ctx.font = 'bold 10px Arial, sans-serif';
    if (highlightField === 'limiteNavegacaoEn') ctx.fillStyle = '#0066ff';
    wrapText(ctx, limiteEnFullMap[matchingKey], w * enPos.x, h * enPos.y, w * 0.82, 13);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 18px Arial, sans-serif';
  }

  const backFields: { key: string; text: string }[] = [
    { key: 'requisitos', text: (data.requisitos || '').trim() ? data.requisitos.toUpperCase() : '******** / ********' },
    { key: 'orgaoEmissao', text: data.orgaoEmissao.replace(/\s*\(.*\)/, '').toUpperCase() },
    { key: 'emissao', text: data.emissao },
  ];

  for (const f of backFields) {
    const pos = positions[f.key] || DEFAULT_BACK_POSITIONS[f.key];
    if (!pos) continue;
    if (highlightField === f.key) {
      ctx.fillStyle = '#0066ff';
      ctx.fillText(f.text, w * pos.x, h * pos.y);
      ctx.fillStyle = '#1a1a1a';
    } else {
      ctx.fillText(f.text, w * pos.x, h * pos.y);
    }
  }
}

const FIELD_LABELS: Record<string, string> = {
  nome: 'Nome',
  dataNascimento: 'Data Nasc.',
  cpf: 'CPF',
  categoriaPt: 'Categoria PT',
  categoriaEn: 'Categoria EN',
  validade: 'Validade',
  numeroInscricao: 'Nº Inscrição',
  foto: 'Foto',
  limiteNavegacao: 'Limite Nav. PT',
  limiteNavegacaoEn: 'Limite Nav. EN',
  requisitos: 'Requisitos',
  orgaoEmissao: 'Órgão Emissão',
  emissao: 'Data Emissão',
};

const ChaPreview = forwardRef<ChaPreviewHandle, ChaPreviewProps>((props, ref) => {
  const canvasFrontRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [frontPositions, setFrontPositions] = useState<Record<string, FieldPos>>({ ...DEFAULT_FRONT_POSITIONS });
  const [backPositions, setBackPositions] = useState<Record<string, FieldPos>>({ ...DEFAULT_BACK_POSITIONS });
  const [selectedField, setSelectedField] = useState<{ canvas: 'front' | 'back'; field: string } | null>(null);

  const W = 700;
  const H = 440;
  const STEP = 0.002; // Arrow key step size in fraction

  useImperativeHandle(ref, () => ({
    getFrenteBase64: () => canvasFrontRef.current?.toDataURL('image/png') || '',
    getVersoBase64: () => canvasBackRef.current?.toDataURL('image/png') || '',
  }));

  const drawFront = useCallback((highlight?: string | null) => {
    const canvas = canvasFrontRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgFront = new Image();
    bgFront.crossOrigin = 'anonymous';
    bgFront.src = matrizcha;

    let fotoImg: HTMLImageElement | null = null;
    if (props.fotoPreview) {
      fotoImg = new Image();
      fotoImg.src = props.fotoPreview;
    }

    const render = () => drawChaFront(ctx, bgFront, fotoImg, props, W, H, frontPositions, highlight);
    bgFront.onload = () => {
      if (fotoImg && !fotoImg.complete) { fotoImg.onload = render; } else { render(); }
    };
    if (bgFront.complete) {
      if (fotoImg && !fotoImg.complete) { fotoImg!.onload = render; } else { render(); }
    }
  }, [props, frontPositions]);

  const drawBack = useCallback((highlight?: string | null) => {
    const canvas = canvasBackRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgBack = new Image();
    bgBack.crossOrigin = 'anonymous';
    bgBack.src = matrizcha2;

    const render = () => drawChaBack(ctx, bgBack, props, W, H, backPositions, highlight);
    bgBack.onload = render;
    if (bgBack.complete) render();
  }, [props, backPositions]);

  const highlightKey = selectedField?.field || null;

  useEffect(() => {
    drawFront(highlightKey);
    drawBack(highlightKey);
  }, [drawFront, drawBack, highlightKey]);

  // Focus container when edit mode is on
  useEffect(() => {
    if (editMode && containerRef.current) {
      containerRef.current.focus();
    }
  }, [editMode, selectedField]);

  // Click to select nearest field
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): FieldPos => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    return {
      x: ((e.clientX - rect.left) * scaleX) / W,
      y: ((e.clientY - rect.top) * scaleY) / H,
    };
  };

  const findNearestField = (pos: FieldPos, positions: Record<string, FieldPos>, threshold = 0.12): string | null => {
    let nearest: string | null = null;
    let minDist = Infinity;
    for (const [key, fpos] of Object.entries(positions)) {
      const dist = Math.sqrt((pos.x - fpos.x) ** 2 + (pos.y - fpos.y) ** 2);
      if (dist < minDist && dist < threshold) {
        minDist = dist;
        nearest = key;
      }
    }
    return nearest;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>, side: 'front' | 'back') => {
    if (!editMode) return;
    const canvas = side === 'front' ? canvasFrontRef.current : canvasBackRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e, canvas);
    const positions = side === 'front' ? frontPositions : backPositions;
    const field = findNearestField(pos, positions);
    if (field) {
      setSelectedField({ canvas: side, field });
    }
  };

  // Arrow keys to move selected field
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editMode || !selectedField) return;
    const { canvas, field } = selectedField;

    let dx = 0, dy = 0;
    switch (e.key) {
      case 'ArrowUp':    dy = -STEP; break;
      case 'ArrowDown':  dy = STEP; break;
      case 'ArrowLeft':  dx = -STEP; break;
      case 'ArrowRight': dx = STEP; break;
      default: return;
    }
    e.preventDefault();

    if (canvas === 'front') {
      setFrontPositions(prev => {
        const cur = prev[field] || DEFAULT_FRONT_POSITIONS[field];
        return { ...prev, [field]: { x: cur.x + dx, y: cur.y + dy } };
      });
    } else {
      setBackPositions(prev => {
        const cur = prev[field] || DEFAULT_BACK_POSITIONS[field];
        return { ...prev, [field]: { x: cur.x + dx, y: cur.y + dy } };
      });
    }
  };

  const handleSave = () => {
    const output = {
      front: Object.fromEntries(
        Object.entries(frontPositions).map(([k, v]) => [k, { x: Number(v.x.toFixed(4)), y: Number(v.y.toFixed(4)) }])
      ),
      back: Object.fromEntries(
        Object.entries(backPositions).map(([k, v]) => [k, { x: Number(v.x.toFixed(4)), y: Number(v.y.toFixed(4)) }])
      ),
    };
    console.log('=== CHA POSITIONS ===');
    console.log(JSON.stringify(output, null, 2));
    console.log('=== END CHA POSITIONS ===');

    navigator.clipboard.writeText(JSON.stringify(output, null, 2)).then(() => {
      toast.success('Posições copiadas para a área de transferência! Cole no chat.');
    }).catch(() => {
      toast.info('Posições salvas no console (F12). Copie de lá.');
    });
  };

  const handleReset = () => {
    setFrontPositions({ ...DEFAULT_FRONT_POSITIONS });
    setBackPositions({ ...DEFAULT_BACK_POSITIONS });
    setSelectedField(null);
    toast.info('Posições resetadas para o padrão.');
  };

  // List of fields for selection buttons
  const frontFieldKeys = Object.keys(frontPositions);
  const backFieldKeys = Object.keys(backPositions);

  return (
    <div
      ref={containerRef}
      className="space-y-3 outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Edit mode toggle */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-lg border bg-muted/50">
        <div className="flex items-center gap-2">
          <Switch checked={editMode} onCheckedChange={setEditMode} />
          <span className="text-xs font-medium">Modo Posicionamento</span>
        </div>
        {editMode && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleReset}>Resetar</Button>
            <Button size="sm" onClick={handleSave}>Salvar Posições</Button>
          </div>
        )}
      </div>

      {editMode && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Clique no campo ou botão para selecionar, use <strong>↑ ↓ ← →</strong> para mover.</p>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Frente</p>
            <div className="flex flex-wrap gap-1">
              {frontFieldKeys.map(key => (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedField?.canvas === 'front' && selectedField?.field === key ? 'default' : 'outline'}
                  className="text-[10px] h-6 px-2"
                  onClick={() => setSelectedField({ canvas: 'front', field: key })}
                >
                  {FIELD_LABELS[key] || key}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Verso</p>
            <div className="flex flex-wrap gap-1">
              {backFieldKeys.map(key => (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedField?.canvas === 'back' && selectedField?.field === key ? 'default' : 'outline'}
                  className="text-[10px] h-6 px-2"
                  onClick={() => setSelectedField({ canvas: 'back', field: key })}
                >
                  {FIELD_LABELS[key] || key}
                </Button>
              ))}
            </div>
          </div>

          {selectedField && (
            <p className="text-xs font-medium text-primary">
              Selecionado: <strong>{FIELD_LABELS[selectedField.field] || selectedField.field}</strong> ({selectedField.canvas === 'front' ? 'Frente' : 'Verso'})
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Frente</p>
          <div className="rounded-lg overflow-hidden border shadow-sm">
            <canvas
              ref={canvasFrontRef}
              className="w-full h-auto"
              style={{ display: 'block', userSelect: 'none', cursor: editMode ? 'crosshair' : 'default' }}
              onClick={e => handleCanvasClick(e, 'front')}
            />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Verso</p>
          <div className="rounded-lg overflow-hidden border shadow-sm">
            <canvas
              ref={canvasBackRef}
              className="w-full h-auto"
              style={{ display: 'block', userSelect: 'none', cursor: editMode ? 'crosshair' : 'default' }}
              onClick={e => handleCanvasClick(e, 'back')}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChaPreview;
