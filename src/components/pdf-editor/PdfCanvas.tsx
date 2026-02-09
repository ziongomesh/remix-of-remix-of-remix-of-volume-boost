import { useRef, useState, useEffect } from 'react';
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
  const [editing, setEditing] = useState<string | null>(null);
  const [bgUrl, setBgUrl] = useState<string>('');

  useEffect(() => {
    if (pageCanvas) {
      setBgUrl(pageCanvas.toDataURL('image/png'));
    }
  }, [pageCanvas]);

  const pageFields = fields.filter(f => f.pageIndex === pageIndex && f.visible);

  const handleClick = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    if (editing === fieldId) return;
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
      onClick={() => { setEditing(null); onSelect(null); }}
    >
      <img src={bgUrl} alt="PDF page" className="absolute inset-0 w-full h-full" draggable={false} />

      {pageFields.map((field) => {
        const isSelected = selectedId === field.id;
        const isEditing = editing === field.id;

        return (
          <div
            key={field.id}
            className={cn(
              'absolute',
              isEditing ? 'ring-2 ring-primary ring-offset-1' : 'cursor-text hover:ring-1 hover:ring-primary/40'
            )}
            style={{
              left: field.x,
              top: field.y,
              minWidth: field.width,
              minHeight: field.height,
              fontSize: field.fontSize,
              color: field.color,
              backgroundColor: isEditing ? 'rgba(255,255,255,0.95)' : 'transparent',
              zIndex: isEditing ? 50 : 10,
              lineHeight: 1,
              padding: '1px 0',
            }}
            onClick={(e) => handleClick(e, field.id)}
          >
            {isEditing ? (
              <input
                autoFocus
                defaultValue={field.text}
                className="bg-white/95 border border-primary px-1 outline-none text-black"
                style={{ fontSize: field.fontSize, minWidth: field.width }}
                onBlur={(e) => handleBlur(field.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="whitespace-nowrap leading-none select-none pointer-events-none" style={{ opacity: 0 }}>
                {field.text}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
