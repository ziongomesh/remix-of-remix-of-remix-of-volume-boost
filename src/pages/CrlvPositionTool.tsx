import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface ExtractedField {
  id: string;
  text: string;
  x: number; // percentage of container
  y: number;
  w: number; // percentage
  h: number;
  fontSize: number;
  originalText: string;
}

export default function CrlvPositionTool() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgDataUrl, setBgDataUrl] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ id: string; startMx: number; startMy: number; startX: number; startY: number } | null>(null);
  const [pdfDims, setPdfDims] = useState({ w: 595, h: 842 });

  // Load PDF and extract real text positions
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument('/templates/crlv-template.pdf').promise;
        const page = await pdf.getPage(1);
        const scale = 2;
        const viewport = page.getViewport({ scale });

        // Render to get background image
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        setBgDataUrl(canvas.toDataURL());

        // Get original page dimensions for export
        const origViewport = page.getViewport({ scale: 1 });
        setPdfDims({ w: origViewport.width, h: origViewport.height });

        // Extract real text content
        const textContent = await page.getTextContent();
        const extracted: ExtractedField[] = [];
        let idx = 0;

        for (const item of textContent.items) {
          if (!('str' in item) || !item.str.trim()) continue;

          const tx = item.transform;
          const fontSize = Math.abs(tx[0]);
          // Convert to percentage of viewport
          const x = (tx[4] * scale / viewport.width) * 100;
          const y = ((viewport.height - tx[5] * scale - fontSize * scale) / viewport.height) * 100;
          const w = ((item.width || fontSize * item.str.length * 0.6) * scale / viewport.width) * 100;
          const h = (fontSize * scale * 1.3 / viewport.height) * 100;

          extracted.push({
            id: `f-${idx++}`,
            text: item.str,
            x, y,
            w: Math.max(w, 1),
            h: Math.max(h, 0.5),
            fontSize,
            originalText: item.str,
          });
        }

        setFields(extracted);
        toast.success(`${extracted.length} campos extraídos do PDF`);
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
        setContainerSize({ w: r.width, h: r.height });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [bgDataUrl]);

  // Global mouse handlers for dragging
  useEffect(() => {
    if (!dragState) return;
    const handleMove = (e: MouseEvent) => {
      const dx = ((e.clientX - dragState.startMx) / containerSize.w) * 100;
      const dy = ((e.clientY - dragState.startMy) / containerSize.h) * 100;
      setFields(prev => prev.map(f =>
        f.id === dragState.id ? { ...f, x: dragState.startX + dx, y: dragState.startY + dy } : f
      ));
    };
    const handleUp = () => setDragState(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [dragState, containerSize]);

  const handleFieldMouseDown = useCallback((e: React.MouseEvent, field: ExtractedField) => {
    e.preventDefault();
    setSelected(field.id);
    setDragState({ id: field.id, startMx: e.clientX, startMy: e.clientY, startX: field.x, startY: field.y });
  }, []);

  const updateFieldText = useCallback((id: string, text: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, text } : f));
  }, []);

  const deleteField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selected === id) setSelected(null);
  }, [selected]);

  const selectedField = fields.find(f => f.id === selected);

  const generateCode = () => {
    const lines: string[] = ['// === FIELD_MAP (coordenadas em pt para pdf-lib) ==='];
    lines.push('const FIELD_MAP = [');
    fields.forEach(f => {
      const ptX = Math.round((f.x / 100) * pdfDims.w);
      const ptY = Math.round((f.y / 100) * pdfDims.h);
      lines.push(`  { key: '${f.id}', x: ${ptX}, y: ${ptY}, size: ${f.fontSize}, text: '${f.text.replace(/'/g, "\\'")}' },`);
    });
    lines.push('];');
    return lines.join('\n');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode()).then(() => toast.success('Código copiado!'));
  };

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
        <h1 className="text-xl font-bold">📐 Calibrar CRLV — Edição Direta</h1>
        <p className="text-sm text-muted-foreground">
          Arraste os textos reais do PDF para reposicionar. Clique para selecionar e editar o conteúdo.
        </p>

        {/* Selected field info */}
        {selectedField && (
          <div className="bg-muted/50 rounded-lg p-3 border text-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold font-mono text-xs">
                "{selectedField.text}" — x: <span className="text-primary">{selectedField.x.toFixed(1)}%</span> ({Math.round((selectedField.x / 100) * pdfDims.w)}pt)
                {' | '} y: <span className="text-primary">{selectedField.y.toFixed(1)}%</span> ({Math.round((selectedField.y / 100) * pdfDims.h)}pt)
                {' | '} size: {selectedField.fontSize}pt
              </p>
              <Button size="sm" variant="destructive" onClick={() => deleteField(selectedField.id)}>
                Remover
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs shrink-0">Texto:</span>
              <Input
                value={selectedField.text}
                onChange={(e) => updateFieldText(selectedField.id, e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {/* Main template view */}
          <div className="flex-1">
            <div
              ref={containerRef}
              className="relative border rounded-lg overflow-hidden cursor-crosshair"
              style={{ aspectRatio: `${pdfDims.w}/${pdfDims.h}` }}
              onClick={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
                  setSelected(null);
                }
              }}
            >
              <img src={bgDataUrl} alt="CRLV Template" className="w-full h-full object-fill" draggable={false} />
              {containerSize.w > 0 && fields.map(f => {
                const px = (f.x / 100) * containerSize.w;
                const py = (f.y / 100) * containerSize.h;
                const isSelected = selected === f.id;
                const isDragging = dragState?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onMouseDown={(e) => handleFieldMouseDown(e, f)}
                    className="absolute cursor-move select-none whitespace-nowrap"
                    style={{
                      left: px,
                      top: py,
                      padding: '1px 3px',
                      fontSize: Math.max(8, f.fontSize * (containerSize.w / (pdfDims.w * 2)) * 2),
                      fontFamily: 'Courier, monospace',
                      fontWeight: 'bold',
                      color: isSelected ? '#dc2626' : '#000',
                      border: isSelected ? '2px solid #dc2626' : '1px solid transparent',
                      background: isSelected ? 'rgba(220,38,38,0.08)' : 'transparent',
                      borderRadius: 2,
                      zIndex: isDragging ? 100 : isSelected ? 50 : 10,
                      transition: isDragging ? 'none' : 'border-color 0.15s',
                    }}
                    title={`${f.text} (${f.x.toFixed(1)}%, ${f.y.toFixed(1)}%)`}
                  >
                    {f.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar — field list */}
          <div className="w-64 space-y-3">
            <p className="text-sm font-semibold">Campos ({fields.length})</p>
            <ScrollArea className="h-[70vh]">
              <div className="space-y-1 pr-2">
                {fields.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f.id)}
                    className={`text-left w-full p-1.5 rounded border text-xs transition-colors ${
                      selected === f.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <p className="font-mono truncate">{f.text}</p>
                    <p className="text-muted-foreground text-[10px]">
                      {f.x.toFixed(1)}%, {f.y.toFixed(1)}% — {f.fontSize}pt
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>

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
