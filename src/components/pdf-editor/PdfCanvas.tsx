import { useRef, useState, useEffect, useCallback } from 'react';
import { PdfTextField } from './types';

interface PdfCanvasProps {
  pageCanvas: HTMLCanvasElement | null;
  fields: PdfTextField[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateField: (id: string, updates: Partial<PdfTextField>) => void;
  pageIndex: number;
}

export function PdfCanvas({ pageCanvas, fields, selectedId, onSelect, onUpdateField, pageIndex }: PdfCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [inputPos, setInputPos] = useState({ x: 0, y: 0, w: 0, fontSize: 14 });
  // Store the clean background (original PDF without any text modifications)
  const cleanCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize clean canvas from the original page render
  useEffect(() => {
    if (!pageCanvas) return;
    const clean = document.createElement('canvas');
    clean.width = pageCanvas.width;
    clean.height = pageCanvas.height;
    const ctx = clean.getContext('2d')!;
    ctx.drawImage(pageCanvas, 0, 0);
    cleanCanvasRef.current = clean;
  }, [pageCanvas]);

  const pageFields = fields.filter(f => f.pageIndex === pageIndex);

  // Redraw canvas: start from clean bg, white-out ALL field areas, then draw current text for each field
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const clean = cleanCanvasRef.current;
    if (!canvas || !clean) return;

    const ctx = canvas.getContext('2d')!;
    // Draw clean background
    ctx.drawImage(clean, 0, 0);

    // Only white-out and redraw fields that were actually edited
    for (const field of pageFields) {
      if (!field.visible) continue;
      const wasEdited = field.text !== field.originalText;
      if (!wasEdited) continue;

      // White-out the original text area
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(field.x - 1, field.y - 1, field.width + 4, field.height + 4);

      // Draw the new text
      if (field.text.trim()) {
        ctx.fillStyle = field.color || '#000000';
        ctx.font = `${field.fontSize}px sans-serif`;
        ctx.textBaseline = 'top';
        ctx.fillText(field.text, field.x, field.y);
      }
    }
  }, [pageFields]);

  // Redraw whenever fields change
  useEffect(() => {
    if (!canvasRef.current || !pageCanvas) return;
    canvasRef.current.width = pageCanvas.width;
    canvasRef.current.height = pageCanvas.height;
    redrawCanvas();
  }, [pageCanvas, redrawCanvas]);

  // Handle click on canvas to find which field was clicked
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editing) return; // don't interrupt current edit
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Find clicked field (reverse order for z-index priority)
    for (let i = pageFields.length - 1; i >= 0; i--) {
      const f = pageFields[i];
      if (!f.visible) continue;
      if (clickX >= f.x - 2 && clickX <= f.x + f.width + 4 &&
          clickY >= f.y - 2 && clickY <= f.y + f.height + 4) {
        // Found! Show input at this position
        const displayX = f.x / scaleX + rect.left - (canvas.parentElement?.getBoundingClientRect().left || 0);
        const displayY = f.y / scaleY + rect.top - (canvas.parentElement?.getBoundingClientRect().top || 0);
        const displayW = f.width / scaleX;

        setEditing(f.id);
        onSelect(f.id);
        setInputPos({ x: displayX, y: displayY, w: displayW, fontSize: f.fontSize / scaleX });
        return;
      }
    }

    // Clicked empty area
    onSelect(null);
  }, [editing, pageFields, onSelect]);

  // When editing starts, focus input
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleBlur = useCallback(() => {
    if (!editing || !inputRef.current) return;
    const newText = inputRef.current.value;
    onUpdateField(editing, { text: newText });
    setEditing(null);
    // redraw will happen via useEffect when fields update
  }, [editing, onUpdateField]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setEditing(null);
    }
  }, []);

  if (!pageCanvas) return null;

  const editingField = editing ? fields.find(f => f.id === editing) : null;

  return (
    <div className="relative border border-border shadow-lg inline-block">
      <canvas
        ref={canvasRef}
        className="block cursor-text"
        style={{ width: pageCanvas.width, height: pageCanvas.height }}
        onClick={handleCanvasClick}
      />
      {editing && editingField && (
        <input
          ref={inputRef}
          defaultValue={editingField.text}
          className="absolute bg-white border-2 border-primary px-1 outline-none text-black z-50"
          style={{
            left: inputPos.x,
            top: inputPos.y,
            minWidth: inputPos.w + 20,
            fontSize: inputPos.fontSize,
            lineHeight: 1.2,
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
