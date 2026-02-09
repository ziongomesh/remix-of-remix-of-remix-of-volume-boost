import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface CrlvField {
  id: string;
  label: string;
  x: number; // percentage
  y: number; // percentage
  text: string;
  size: number; // font size in pt for export
  group?: string; // fields with same group sync X
  isRect?: boolean; // white-out rectangle
  w?: number; // width % (for rects)
  h?: number; // height % (for rects)
}

// Initial fields based on current FIELD_MAP (converted to percentages of ~595x842 PDF)
const PDF_W = 595;
const PDF_H = 842;
const toXPct = (x: number) => (x / PDF_W) * 100;
const toYPct = (y: number) => (y / PDF_H) * 100;
const toWPct = (w: number) => (w / PDF_W) * 100;
const toHPct = (h: number) => (h / PDF_H) * 100;

const INITIAL_FIELDS: CrlvField[] = [
  // LEFT COLUMN
  { id: 'renavam', label: 'Renavam', x: toXPct(18), y: toYPct(115), text: '', size: 12, group: 'left' },
  { id: 'placa', label: 'Placa', x: toXPct(18), y: toYPct(146), text: '', size: 12, group: 'left' },
  { id: 'exercicio', label: 'Exercício', x: toXPct(130), y: toYPct(146), text: '', size: 12 },
  { id: 'anoFab', label: 'Ano Fab', x: toXPct(18), y: toYPct(176), text: '', size: 12, group: 'left' },
  { id: 'anoMod', label: 'Ano Mod', x: toXPct(130), y: toYPct(176), text: '', size: 12 },
  { id: 'numeroCrv', label: 'Nº CRV', x: toXPct(18), y: toYPct(208), text: '', size: 11, group: 'left' },
  { id: 'codSegCla', label: 'Cód Seg CLA', x: toXPct(18), y: toYPct(328), text: '', size: 11, group: 'left' },
  { id: 'catObs', label: 'CAT (*.*)', x: toXPct(200), y: toYPct(328), text: '', size: 11 },
  { id: 'marcaModelo', label: 'Marca/Modelo', x: toXPct(18), y: toYPct(363), text: '', size: 11, group: 'left' },
  { id: 'especieTipo', label: 'Espécie/Tipo', x: toXPct(18), y: toYPct(400), text: '', size: 11, group: 'left' },
  { id: 'placaAnt', label: 'Placa Ant', x: toXPct(18), y: toYPct(433), text: '', size: 11, group: 'left' },
  { id: 'chassi', label: 'Chassi', x: toXPct(135), y: toYPct(433), text: '', size: 10 },
  { id: 'cor', label: 'Cor', x: toXPct(18), y: toYPct(465), text: '', size: 11, group: 'left' },
  { id: 'combustivel', label: 'Combustível', x: toXPct(135), y: toYPct(465), text: '', size: 10 },
  // RIGHT COLUMN
  { id: 'categoria', label: 'Categoria', x: toXPct(310), y: toYPct(105), text: '', size: 12, group: 'right' },
  { id: 'capacidade', label: 'Capacidade', x: toXPct(510), y: toYPct(105), text: '', size: 12 },
  { id: 'potenciaCil', label: 'Potência/Cil', x: toXPct(310), y: toYPct(140), text: '', size: 12, group: 'right' },
  { id: 'pesoBruto', label: 'Peso Bruto', x: toXPct(510), y: toYPct(140), text: '', size: 10 },
  { id: 'motor', label: 'Motor', x: toXPct(310), y: toYPct(172), text: '', size: 10, group: 'right' },
  { id: 'cmt', label: 'CMT', x: toXPct(476), y: toYPct(172), text: '', size: 10 },
  { id: 'eixos', label: 'Eixos', x: toXPct(520), y: toYPct(172), text: '', size: 10 },
  { id: 'lotacao', label: 'Lotação', x: toXPct(548), y: toYPct(172), text: '', size: 10 },
  { id: 'carroceria', label: 'Carroceria', x: toXPct(310), y: toYPct(208), text: '', size: 11, group: 'right' },
  { id: 'nomeProprietario', label: 'Nome Proprietário', x: toXPct(310), y: toYPct(242), text: '', size: 11, group: 'right' },
  { id: 'cpfCnpj', label: 'CPF/CNPJ', x: toXPct(420), y: toYPct(276), text: '', size: 11 },
  { id: 'local', label: 'Local', x: toXPct(310), y: toYPct(310), text: '', size: 11, group: 'right' },
  { id: 'data', label: 'Data', x: toXPct(520), y: toYPct(310), text: '', size: 10 },
  { id: 'observacoes', label: 'Observações', x: toXPct(25), y: toYPct(530), text: '', size: 11 },
];

const INITIAL_RECTS: CrlvField[] = [
  { id: 'rect_renavam', label: 'Rect Renavam', x: toXPct(18), y: toYPct(100), text: '', size: 0, isRect: true, w: toWPct(200), h: toHPct(20) },
  { id: 'rect_placa', label: 'Rect Placa', x: toXPct(18), y: toYPct(132), text: '', size: 0, isRect: true, w: toWPct(100), h: toHPct(18) },
  { id: 'rect_exercicio', label: 'Rect Exercício', x: toXPct(130), y: toYPct(132), text: '', size: 0, isRect: true, w: toWPct(90), h: toHPct(18) },
  { id: 'rect_anofab', label: 'Rect Ano Fab', x: toXPct(18), y: toYPct(162), text: '', size: 0, isRect: true, w: toWPct(100), h: toHPct(18) },
  { id: 'rect_anomod', label: 'Rect Ano Mod', x: toXPct(130), y: toYPct(162), text: '', size: 0, isRect: true, w: toWPct(90), h: toHPct(18) },
  { id: 'rect_crv', label: 'Rect CRV', x: toXPct(18), y: toYPct(192), text: '', size: 0, isRect: true, w: toWPct(200), h: toHPct(20) },
  { id: 'rect_codseg', label: 'Rect Cód Seg', x: toXPct(18), y: toYPct(312), text: '', size: 0, isRect: true, w: toWPct(165), h: toHPct(20) },
  { id: 'rect_catobs', label: 'Rect CAT', x: toXPct(195), y: toYPct(312), text: '', size: 0, isRect: true, w: toWPct(50), h: toHPct(20) },
  { id: 'rect_marca', label: 'Rect Marca', x: toXPct(18), y: toYPct(347), text: '', size: 0, isRect: true, w: toWPct(230), h: toHPct(22) },
  { id: 'rect_especie', label: 'Rect Espécie', x: toXPct(18), y: toYPct(382), text: '', size: 0, isRect: true, w: toWPct(230), h: toHPct(22) },
  { id: 'rect_placaant', label: 'Rect Placa Ant', x: toXPct(18), y: toYPct(418), text: '', size: 0, isRect: true, w: toWPct(110), h: toHPct(18) },
  { id: 'rect_chassi', label: 'Rect Chassi', x: toXPct(135), y: toYPct(418), text: '', size: 0, isRect: true, w: toWPct(120), h: toHPct(18) },
  { id: 'rect_cor', label: 'Rect Cor', x: toXPct(18), y: toYPct(450), text: '', size: 0, isRect: true, w: toWPct(110), h: toHPct(18) },
  { id: 'rect_combustivel', label: 'Rect Combustível', x: toXPct(135), y: toYPct(450), text: '', size: 0, isRect: true, w: toWPct(120), h: toHPct(18) },
  // Right column rects
  { id: 'rect_categoria', label: 'Rect Categoria', x: toXPct(310), y: toYPct(87), text: '', size: 0, isRect: true, w: toWPct(190), h: toHPct(22) },
  { id: 'rect_capacidade', label: 'Rect Capacidade', x: toXPct(500), y: toYPct(87), text: '', size: 0, isRect: true, w: toWPct(80), h: toHPct(22) },
  { id: 'rect_potencia', label: 'Rect Potência', x: toXPct(310), y: toYPct(122), text: '', size: 0, isRect: true, w: toWPct(190), h: toHPct(22) },
  { id: 'rect_peso', label: 'Rect Peso', x: toXPct(500), y: toYPct(122), text: '', size: 0, isRect: true, w: toWPct(80), h: toHPct(22) },
  { id: 'rect_motor', label: 'Rect Motor', x: toXPct(310), y: toYPct(156), text: '', size: 0, isRect: true, w: toWPct(165), h: toHPct(20) },
  { id: 'rect_cmt', label: 'Rect CMT', x: toXPct(476), y: toYPct(156), text: '', size: 0, isRect: true, w: toWPct(40), h: toHPct(20) },
  { id: 'rect_eixos', label: 'Rect Eixos', x: toXPct(518), y: toYPct(156), text: '', size: 0, isRect: true, w: toWPct(25), h: toHPct(20) },
  { id: 'rect_lotacao', label: 'Rect Lotação', x: toXPct(545), y: toYPct(156), text: '', size: 0, isRect: true, w: toWPct(40), h: toHPct(20) },
  { id: 'rect_carroceria', label: 'Rect Carroceria', x: toXPct(310), y: toYPct(190), text: '', size: 0, isRect: true, w: toWPct(280), h: toHPct(22) },
  { id: 'rect_nome', label: 'Rect Nome', x: toXPct(310), y: toYPct(224), text: '', size: 0, isRect: true, w: toWPct(280), h: toHPct(22) },
  { id: 'rect_cpf', label: 'Rect CPF', x: toXPct(420), y: toYPct(258), text: '', size: 0, isRect: true, w: toWPct(170), h: toHPct(22) },
  { id: 'rect_local', label: 'Rect Local', x: toXPct(310), y: toYPct(292), text: '', size: 0, isRect: true, w: toWPct(190), h: toHPct(22) },
  { id: 'rect_data', label: 'Rect Data', x: toXPct(520), y: toYPct(292), text: '', size: 0, isRect: true, w: toWPct(70), h: toHPct(22) },
  // QR area
  { id: 'rect_qr', label: 'Rect QR', x: toXPct(240), y: toYPct(100), text: '', size: 0, isRect: true, w: toWPct(175), h: toHPct(195) },
  // Observações area
  { id: 'rect_obs', label: 'Rect Obs', x: toXPct(18), y: toYPct(505), text: '', size: 0, isRect: true, w: toWPct(270), h: toHPct(245) },
];

function FieldOverlay({
  field, containerW, containerH, onDrag, onResize, selected, onSelect,
}: {
  field: CrlvField; containerW: number; containerH: number;
  onDrag: (id: string, x: number, y: number) => void;
  onResize?: (id: string, w: number, h: number) => void;
  selected: boolean; onSelect: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const startRef = useRef({ mx: 0, my: 0, fx: 0, fy: 0, fw: 0, fh: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    setDragging(true);
    startRef.current = { mx: e.clientX, my: e.clientY, fx: field.x, fy: field.y, fw: field.w || 0, fh: field.h || 0 };
  };

  const handleResizeDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation(); onSelect();
    setResizing(true);
    startRef.current = { mx: e.clientX, my: e.clientY, fx: field.x, fy: field.y, fw: field.w || 10, fh: field.h || 3 };
  };

  useEffect(() => {
    if (!dragging && !resizing) return;
    const handleMove = (e: MouseEvent) => {
      if (resizing && onResize) {
        const dw = ((e.clientX - startRef.current.mx) / containerW) * 100;
        const dh = ((e.clientY - startRef.current.my) / containerH) * 100;
        onResize(field.id, Math.max(1, startRef.current.fw + dw), Math.max(0.5, startRef.current.fh + dh));
      } else if (dragging) {
        const dx = ((e.clientX - startRef.current.mx) / containerW) * 100;
        const dy = ((e.clientY - startRef.current.my) / containerH) * 100;
        onDrag(field.id, startRef.current.fx + dx, startRef.current.fy + dy);
      }
    };
    const handleUp = () => { setDragging(false); setResizing(false); };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [dragging, resizing, containerW, containerH, field.id, onDrag, onResize]);

  const px = (field.x / 100) * containerW;
  const py = (field.y / 100) * containerH;

  if (field.isRect) {
    const fw = ((field.w || 10) / 100) * containerW;
    const fh = ((field.h || 3) / 100) * containerH;
    return (
      <div
        onMouseDown={handleMouseDown}
        className="absolute cursor-move select-none"
        style={{
          left: px, top: py, width: fw, height: fh,
          background: selected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
          border: selected ? '2px solid #ef4444' : '1px dashed rgba(200,200,200,0.6)',
          zIndex: dragging || resizing ? 50 : 5,
        }}
      >
        <span className="text-[8px] text-red-500 px-0.5 truncate block">{field.label}</span>
        <div
          onMouseDown={handleResizeDown}
          className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize"
          style={{ background: 'rgba(239,68,68,0.7)' }}
        />
      </div>
    );
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute cursor-move select-none whitespace-nowrap"
      style={{
        left: px, top: py,
        minWidth: 40,
        minHeight: 14,
        padding: '2px 6px',
        font: `bold ${Math.max(9, field.size * 0.85)}px Courier, monospace`,
        color: selected ? '#dc2626' : '#2563eb',
        border: selected ? '2px solid #dc2626' : '1px solid rgba(37,99,235,0.5)',
        background: selected ? 'rgba(220,38,38,0.1)' : 'rgba(37,99,235,0.08)',
        borderRadius: 2,
        zIndex: dragging ? 50 : 15,
      }}
    >
      {field.label}
    </div>
  );
}

export default function CrlvPositionTool() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgDataUrl, setBgDataUrl] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [rects, setRects] = useState(INITIAL_RECTS);
  const [selected, setSelected] = useState<string | null>(null);
  const [showRects, setShowRects] = useState(true);
  const [tab, setTab] = useState<'fields' | 'rects'>('fields');

  // Load PDF template as background image
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument('/templates/crlv-template.pdf').promise;
        const page = await pdf.getPage(1);
        const scale = 2;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        setBgDataUrl(canvas.toDataURL());
      } catch (err) {
        console.error('Erro ao carregar template:', err);
        toast.error('Erro ao carregar template CRLV');
      }
    };
    loadPdf();
  }, []);

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setSize({ w: r.width, h: r.height });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [bgDataUrl]);

  const updateField = useCallback((id: string, x: number, y: number) => {
    setFields(prev => {
      const target = prev.find(f => f.id === id);
      if (!target) return prev;
      const group = target.group;
      return prev.map(f => {
        if (f.id === id) return { ...f, x, y };
        if (group && f.group === group) return { ...f, x };
        return f;
      });
    });
  }, []);

  const updateRect = useCallback((id: string, x: number, y: number) => {
    setRects(prev => prev.map(f => f.id === id ? { ...f, x, y } : f));
  }, []);

  const resizeRect = useCallback((id: string, w: number, h: number) => {
    setRects(prev => prev.map(f => f.id === id ? { ...f, w, h } : f));
  }, []);

  const updateFieldText = useCallback((id: string, text: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, text } : f));
  }, []);

  const generateCode = () => {
    const lines: string[] = ['// === FIELD_MAP (coordenadas em pt para PDF 595x842) ==='];
    lines.push('const FIELD_MAP = [');
    fields.forEach(f => {
      const ptX = Math.round((f.x / 100) * PDF_W);
      const ptY = Math.round((f.y / 100) * PDF_H);
      lines.push(`  { key: '${f.id}', x: ${ptX}, y: ${ptY}, size: ${f.size} },`);
    });
    lines.push('];');
    lines.push('');
    lines.push('// === WHITEOUT_RECTS ===');
    lines.push('const WHITEOUT_RECTS = [');
    rects.forEach(r => {
      const ptX = Math.round((r.x / 100) * PDF_W);
      const ptY = Math.round((r.y / 100) * PDF_H);
      const ptW = Math.round(((r.w || 10) / 100) * PDF_W);
      const ptH = Math.round(((r.h || 3) / 100) * PDF_H);
      lines.push(`  { x: ${ptX}, y: ${ptY}, w: ${ptW}, h: ${ptH} }, // ${r.label}`);
    });
    lines.push('];');
    return lines.join('\n');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode()).then(() => toast.success('Código copiado!'));
  };

  const allItems = tab === 'fields' ? fields : rects;
  const selectedItem = [...fields, ...rects].find(f => f.id === selected);

  if (!bgDataUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-xl font-bold">📐 Calibrar CRLV — Posição dos Campos</h1>
        <p className="text-sm text-muted-foreground">
          Arraste os textos e retângulos brancos para calibrar as posições sobre o template do CRLV.
        </p>

        {/* Info panel */}
        {selectedItem && (
          <div className="bg-muted/50 rounded-lg p-3 border text-sm space-y-1">
            <p className="font-semibold">{selectedItem.label} {selectedItem.isRect && '(Retângulo)'} {selectedItem.group && <span className="text-xs text-muted-foreground">(grupo: {selectedItem.group})</span>}</p>
            <p className="font-mono text-xs">
              x: <span className="text-primary">{selectedItem.x.toFixed(1)}%</span> ({Math.round((selectedItem.x / 100) * PDF_W)}pt)
              {' | '}
              y: <span className="text-primary">{selectedItem.y.toFixed(1)}%</span> ({Math.round((selectedItem.y / 100) * PDF_H)}pt)
              {selectedItem.isRect && (
                <> {' | '} w: {(selectedItem.w || 0).toFixed(1)}% ({Math.round(((selectedItem.w || 0) / 100) * PDF_W)}pt) | h: {(selectedItem.h || 0).toFixed(1)}% ({Math.round(((selectedItem.h || 0) / 100) * PDF_H)}pt)</>
              )}
            </p>
            {!selectedItem.isRect && (
              <div className="flex gap-2 items-center mt-1">
                <span className="text-xs">Texto:</span>
                <Input
                  value={selectedItem.text}
                  onChange={(e) => updateFieldText(selectedItem.id, e.target.value)}
                  className="h-7 text-xs max-w-xs"
                />
                <span className="text-xs">Size:</span>
                <Input
                  type="number"
                  value={selectedItem.size}
                  onChange={(e) => setFields(prev => prev.map(f => f.id === selectedItem.id ? { ...f, size: Number(e.target.value) } : f))}
                  className="h-7 text-xs w-16"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          {/* Main template view */}
          <div className="flex-1">
            <div ref={containerRef} className="relative border rounded-lg overflow-hidden" style={{ aspectRatio: `${PDF_W}/${PDF_H}` }}>
              <img src={bgDataUrl} alt="CRLV Template" className="w-full h-full object-fill" draggable={false} />
              {size.w > 0 && (
                <>
                  {/* Rects layer */}
                  {showRects && rects.map(r => (
                    <FieldOverlay
                      key={r.id} field={r} containerW={size.w} containerH={size.h}
                      onDrag={updateRect} onResize={resizeRect}
                      selected={selected === r.id} onSelect={() => setSelected(r.id)}
                    />
                  ))}
                  {/* Fields layer (on top) */}
                  {fields.map(f => (
                    <FieldOverlay
                      key={f.id} field={f} containerW={size.w} containerH={size.h}
                      onDrag={updateField}
                      selected={selected === f.id} onSelect={() => setSelected(f.id)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-72 space-y-3">
            <div className="flex gap-1">
              <Button size="sm" variant={tab === 'fields' ? 'default' : 'outline'} onClick={() => setTab('fields')}>
                Campos ({fields.length})
              </Button>
              <Button size="sm" variant={tab === 'rects' ? 'default' : 'outline'} onClick={() => setTab('rects')}>
                Retângulos ({rects.length})
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={showRects} onChange={(e) => setShowRects(e.target.checked)} id="showRects" />
              <label htmlFor="showRects" className="text-xs">Mostrar retângulos</label>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-1">
              {allItems.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelected(f.id)}
                  className={`text-left w-full p-1.5 rounded border text-xs transition-colors ${
                    selected === f.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <p className="font-semibold truncate">{f.label}</p>
                  <p className="font-mono text-muted-foreground text-[10px]">
                    {f.x.toFixed(1)}%, {f.y.toFixed(1)}%
                    {f.isRect && ` → ${(f.w || 0).toFixed(1)}% × ${(f.h || 0).toFixed(1)}%`}
                  </p>
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Button size="sm" className="w-full" onClick={copyCode}>📋 Copiar Código</Button>
            </div>
          </div>
        </div>

        {/* Generated code */}
        <details className="border rounded-lg">
          <summary className="p-3 cursor-pointer text-sm font-semibold">Código Gerado</summary>
          <pre className="p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto bg-muted">
            {generateCode()}
          </pre>
        </details>
      </div>
    </div>
  );
}
