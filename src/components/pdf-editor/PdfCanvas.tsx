import { useRef, useState, useCallback, useEffect } from 'react';
import { PdfTextField } from './types';
import { cn } from '@/lib/utils';

interface PdfCanvasProps {
  pageCanvas: HTMLCanvasElement | null;
  fields: PdfTextField[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateField: (id: string, updates: Partial<PdfTextField>) => void;
  pageIndex: number;
}

export function PdfCanvas({ pageCanvas, fields, selectedId, onSelect, onUpdateField, pageIndex }: PdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const [bgUrl, setBgUrl] = useState<string>('');

  useEffect(() => {
    if (pageCanvas) {
      setBgUrl(pageCanvas.toDataURL('image/png'));
    }
  }, [pageCanvas]);

  const pageFields = fields.filter(f => f.pageIndex === pageIndex && f.visible);

  const handleMouseDown = useCallback((e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    if (editing === fieldId) return;
    onSelect(fieldId);
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragOffset({ x: e.clientX - field.x, y: e.clientY - field.y });
    setDragging(fieldId);
  }, [fields, editing, onSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    onUpdateField(dragging, { x: Math.max(0, newX), y: Math.max(0, newY) });
  }, [dragging, dragOffset, onUpdateField]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleDoubleClick = (fieldId: string) => {
    setEditing(fieldId);
    onSelect(fieldId);
  };

  const handleBlur = (fieldId: string, newText: string) => {
    onUpdateField(fieldId, { text: newText });
    setEditing(null);
  };

  if (!bgUrl || !pageCanvas) return null;

  return (
    <div
      ref={containerRef}
      className="relative border border-border shadow-lg"
      style={{ width: pageCanvas.width, height: pageCanvas.height }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => { if (!dragging) onSelect(null); }}
    >
      <img src={bgUrl} alt="PDF page" className="absolute inset-0 w-full h-full" draggable={false} />

      {pageFields.map((field) => {
        const isSelected = selectedId === field.id;
        const isEditing = editing === field.id;

        return (
          <div
            key={field.id}
            className={cn(
              'absolute select-none',
              isSelected ? 'cursor-move ring-2 ring-primary ring-offset-1' : 'cursor-pointer',
              dragging === field.id && 'opacity-80'
            )}
            style={{
              left: field.x,
              top: field.y,
              minWidth: field.width,
              minHeight: field.height,
              fontSize: field.fontSize,
              color: field.color,
              backgroundColor: isSelected || isEditing ? 'rgba(255,255,255,0.9)' : 'transparent',
              zIndex: isSelected ? 50 : 10,
              lineHeight: 1,
              padding: '1px 0',
            }}
            onMouseDown={(e) => handleMouseDown(e, field.id)}
            onDoubleClick={() => handleDoubleClick(field.id)}
          >
            {isEditing ? (
              <input
                autoFocus
                defaultValue={field.text}
                className="bg-white/90 border border-primary px-1 outline-none text-black"
                style={{ fontSize: field.fontSize, minWidth: field.width }}
                onBlur={(e) => handleBlur(field.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="whitespace-nowrap leading-none">
                {field.text}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
