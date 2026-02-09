import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TextField {
  id: string;
  label: string;
  x: number; // percentage of width
  y: number; // percentage of height
  text: string;
  font: string;
  bold: boolean;
}

const FRONT_FIELDS: TextField[] = [
  { id: 'nome', label: 'Nome', x: 3.5, y: 43, text: 'FELIPE DA SILVA LIMA', font: '14px', bold: true },
  { id: 'dataNasc', label: 'Data Nasc.', x: 3.5, y: 54.5, text: '02/02/2000', font: '12px', bold: false },
  { id: 'cpf', label: 'CPF', x: 28, y: 54.5, text: '231.231.213-21', font: '12px', bold: false },
  { id: 'categoria', label: 'Categoria', x: 3.5, y: 64.5, text: 'ARRAIS AMADOR', font: '11px', bold: true },
  { id: 'categoriaEn', label: 'Cat. Inglês', x: 3.5, y: 68.5, text: 'AMATEUR SKIPPER', font: '9px', bold: false },
  { id: 'validade', label: 'Validade', x: 3.5, y: 81.5, text: '03/02/2027', font: '12px', bold: false },
  { id: 'inscricao', label: 'Nº Inscrição', x: 28, y: 81.5, text: '23121241', font: '12px', bold: false },
  { id: 'foto', label: 'Foto', x: 64, y: 32, text: '[FOTO]', font: '14px', bold: false },
];

const BACK_FIELDS: TextField[] = [
  { id: 'limite', label: 'Limite Nav.', x: 3.5, y: 16, text: 'NAVEGAÇÃO INTERIOR', font: '11px', bold: true },
  { id: 'limiteEn', label: 'Limite Inglês', x: 3.5, y: 24, text: 'INLAND NAVIGATION', font: '10px', bold: false },
  { id: 'requisitos', label: 'Requisitos', x: 3.5, y: 46, text: 'REQUISITO EXEMPLO', font: '12px', bold: false },
  { id: 'orgao', label: 'Órgão Emissão', x: 3.5, y: 63.5, text: 'MARINHA DO BRASIL', font: '12px', bold: true },
  { id: 'dataEmissao', label: 'Data Emissão', x: 55, y: 63.5, text: '25/01/2026', font: '12px', bold: false },
];

function FieldOverlay({
  field,
  containerW,
  containerH,
  onDrag,
  selected,
  onSelect,
}: {
  field: TextField;
  containerW: number;
  containerH: number;
  onDrag: (id: string, x: number, y: number) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ mx: 0, my: 0, fx: 0, fy: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    setDragging(true);
    startRef.current = {
      mx: e.clientX,
      my: e.clientY,
      fx: field.x,
      fy: field.y,
    };
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const dx = ((e.clientX - startRef.current.mx) / containerW) * 100;
      const dy = ((e.clientY - startRef.current.my) / containerH) * 100;
      onDrag(field.id, startRef.current.fx + dx, startRef.current.fy + dy);
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, containerW, containerH, field.id, onDrag]);

  const px = (field.x / 100) * containerW;
  const py = (field.y / 100) * containerH;

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute cursor-move select-none whitespace-nowrap"
      style={{
        left: px,
        top: py,
        font: `${field.bold ? 'bold ' : ''}${field.font} Arial, sans-serif`,
        color: '#1a1a1a',
        border: selected ? '1px dashed #ef4444' : '1px dashed transparent',
        background: selected ? 'rgba(239,68,68,0.08)' : 'transparent',
        padding: '1px 3px',
        zIndex: dragging ? 50 : 10,
      }}
    >
      {field.text}
    </div>
  );
}

function MatrixPanel({
  title,
  bgSrc,
  fields,
  onUpdateField,
  selectedId,
  onSelect,
}: {
  title: string;
  bgSrc: string;
  fields: TextField[];
  onUpdateField: (id: string, x: number, y: number) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

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
  }, []);

  return (
    <div>
      <p className="text-sm font-semibold mb-1">{title}</p>
      <div
        ref={containerRef}
        className="relative border rounded-lg overflow-hidden"
        style={{ aspectRatio: '700/440' }}
      >
        <img src={bgSrc} alt={title} className="w-full h-full object-fill" draggable={false} />
        {size.w > 0 &&
          fields.map((f) => (
            <FieldOverlay
              key={f.id}
              field={f}
              containerW={size.w}
              containerH={size.h}
              onDrag={onUpdateField}
              selected={selectedId === f.id}
              onSelect={() => onSelect(f.id)}
            />
          ))}
      </div>
    </div>
  );
}

export default function ChaPositionTool() {
  const [frontFields, setFrontFields] = useState(FRONT_FIELDS);
  const [backFields, setBackFields] = useState(BACK_FIELDS);
  const [selected, setSelected] = useState<string | null>(null);

  const updateFront = useCallback((id: string, x: number, y: number) => {
    setFrontFields((prev) => prev.map((f) => (f.id === id ? { ...f, x, y } : f)));
  }, []);

  const updateBack = useCallback((id: string, x: number, y: number) => {
    setBackFields((prev) => prev.map((f) => (f.id === id ? { ...f, x, y } : f)));
  }, []);

  const generateCode = () => {
    const lines: string[] = ['// === FRENTE ==='];
    frontFields.forEach((f) => {
      if (f.id === 'foto') {
        lines.push(`// Foto: x=${f.x.toFixed(1)}%, y=${f.y.toFixed(1)}%`);
        lines.push(`const fotoX = w * ${(f.x / 100).toFixed(3)};`);
        lines.push(`const fotoY = h * ${(f.y / 100).toFixed(3)};`);
      } else {
        lines.push(
          `// ${f.label}: x=${f.x.toFixed(1)}%, y=${f.y.toFixed(1)}%`
        );
        lines.push(
          `ctx.fillText(data.${f.id}, w * ${(f.x / 100).toFixed(3)}, h * ${(f.y / 100).toFixed(3)});`
        );
      }
    });
    lines.push('');
    lines.push('// === VERSO ===');
    backFields.forEach((f) => {
      lines.push(`// ${f.label}: x=${f.x.toFixed(1)}%, y=${f.y.toFixed(1)}%`);
      lines.push(
        `ctx.fillText(data.${f.id}, w * ${(f.x / 100).toFixed(3)}, h * ${(f.y / 100).toFixed(3)});`
      );
    });
    return lines.join('\n');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode()).then(() => toast.success('Código copiado!'));
  };

  const allFields = [...frontFields, ...backFields];
  const selectedField = allFields.find((f) => f.id === selected);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-foreground">🧭 Calibrar CHA - Posição dos Campos</h1>
        <p className="text-sm text-muted-foreground">
          Arraste os textos sobre as matrizes para calibrar as posições. Copie o código gerado quando estiver satisfeito.
        </p>

        {/* Selected field info */}
        {selectedField && (
          <div className="bg-muted/50 rounded-lg p-3 border text-sm space-y-1">
            <p className="font-semibold">{selectedField.label}</p>
            <p className="font-mono text-xs">
              x: <span className="text-primary">{selectedField.x.toFixed(1)}%</span> → w * {(selectedField.x / 100).toFixed(3)}
              {' | '}
              y: <span className="text-primary">{selectedField.y.toFixed(1)}%</span> → h * {(selectedField.y / 100).toFixed(3)}
            </p>
          </div>
        )}

        {/* Matrices side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MatrixPanel
            title="Frente (matrizcha.png)"
            bgSrc="/images/matrizcha.png"
            fields={frontFields}
            onUpdateField={updateFront}
            selectedId={selected}
            onSelect={setSelected}
          />
          <MatrixPanel
            title="Verso (matrizcha2.png)"
            bgSrc="/images/matrizcha2.png"
            fields={backFields}
            onUpdateField={updateBack}
            selectedId={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Generated code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Código gerado</p>
            <Button size="sm" onClick={copyCode}>Copiar Código</Button>
          </div>
          <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto border">
            {generateCode()}
          </pre>
        </div>

        {/* Field list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
          {allFields.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelected(f.id)}
              className={`text-left p-2 rounded border transition-colors ${
                selected === f.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
              }`}
            >
              <p className="font-semibold">{f.label}</p>
              <p className="font-mono text-muted-foreground">
                {f.x.toFixed(1)}%, {f.y.toFixed(1)}%
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
