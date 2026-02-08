import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DraggableItem {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

// A4 in mm: 210 x 297
const A4_W_MM = 210;
const A4_H_MM = 297;

const MATRIX_IDS = ["frente", "meio", "verso"];

const INITIAL_ITEMS: DraggableItem[] = [
  { id: "frente", label: "Matriz 1 (Frente)", x: 12.7, y: 22.3, width: 85, height: 55, color: "rgba(255,0,0,0.35)" },
  { id: "meio", label: "Matriz 2 (Meio)", x: 12.7, y: 79.4, width: 85, height: 55, color: "rgba(0,128,255,0.35)" },
  { id: "verso", label: "Matriz 3 (Verso)", x: 12.7, y: 136.7, width: 85, height: 55, color: "rgba(0,200,0,0.35)" },
  { id: "qrcode", label: "QR Code", x: 115.1, y: 32.8, width: 71.2, height: 69.4, color: "rgba(255,165,0,0.45)" },
];

export default function PdfPositionTool() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<DraggableItem[]>(INITIAL_ITEMS);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [saved, setSaved] = useState(false);
  const [resizing, setResizing] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const mmToPixel = useCallback((mm: number, axis: "x" | "y") => {
    if (axis === "x") return (mm / A4_W_MM) * containerSize.w;
    return (mm / A4_H_MM) * containerSize.h;
  }, [containerSize]);

  const pixelToMm = useCallback((px: number, axis: "x" | "y") => {
    if (axis === "x") return (px / containerSize.w) * A4_W_MM;
    return (px / containerSize.h) * A4_H_MM;
  }, [containerSize]);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const item = items.find(i => i.id === id)!;
    const px = mmToPixel(item.x, "x");
    const py = mmToPixel(item.y, "y");
    setDragOffset({ x: e.clientX - px, y: e.clientY - py });
    setDragging(id);
  };

  const handleResizeDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const item = items.find(i => i.id === id)!;
    setResizing(id);
    setResizeStart({ x: e.clientX, y: e.clientY, w: item.width, h: item.height });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const relX = e.clientX - dragOffset.x;
      const relY = e.clientY - dragOffset.y;
      const mmX = pixelToMm(relX, "x");
      const mmY = pixelToMm(relY, "y");
      if (MATRIX_IDS.includes(dragging)) {
        setItems(prev => prev.map(i => {
          if (i.id === dragging) return { ...i, x: Math.max(0, mmX), y: Math.max(0, mmY) };
          if (MATRIX_IDS.includes(i.id)) return { ...i, x: Math.max(0, mmX) };
          return i;
        }));
      } else {
        setItems(prev => prev.map(i => i.id === dragging ? { ...i, x: Math.max(0, mmX), y: Math.max(0, mmY) } : i));
      }
    }
    if (resizing) {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      const newW = resizeStart.w + pixelToMm(dx, "x");
      const newH = resizeStart.h + pixelToMm(dy, "y");
      if (MATRIX_IDS.includes(resizing)) {
        setItems(prev => prev.map(i => {
          if (i.id === resizing) return { ...i, width: Math.max(10, newW), height: Math.max(10, newH) };
          if (MATRIX_IDS.includes(i.id)) return { ...i, width: Math.max(10, newW) };
          return i;
        }));
      } else {
        setItems(prev => prev.map(i => i.id === resizing ? { ...i, width: Math.max(10, newW), height: Math.max(10, newH) } : i));
      }
    }
  }, [dragging, resizing, dragOffset, resizeStart, pixelToMm]);

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const handleSave = () => {
    setSaved(true);
    toast.success("Posições salvas! Copie os valores abaixo.");
  };

  const handleReset = () => {
    setItems(INITIAL_ITEMS);
    setSaved(false);
  };

  const generateCode = () => {
    return items.map(item => {
      const isQr = item.id === "qrcode";
      return `// ${item.label} - x=${item.x.toFixed(3)}mm, y=${item.y.toFixed(3)}mm, ${isQr ? `tamanho=${item.width.toFixed(3)}mm` : `w=${item.width.toFixed(3)}mm, h=${item.height.toFixed(3)}mm`}
{
  x: mmToPt(${item.x.toFixed(3)}),
  y: pageHeight - mmToPt(${item.y.toFixed(3)}) - ${isQr ? "qrSize" : "matrizH"},
  width: ${isQr ? "qrSize" : "matrizW"},
  height: ${isQr ? "qrSize" : "matrizH"},
}`;
    }).join("\n\n");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">🔧 Posicionamento das Matrizes no PDF</h1>
        <p className="text-gray-400 mb-4">Arraste as matrizes e o QR code sobre o base.png. Redimensione pelo canto inferior direito. Clique em OK quando estiver correto.</p>

        <div className="flex gap-4 mb-4">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">✅ OK - Salvar Posições</Button>
          <Button onClick={handleReset} variant="outline" className="text-white border-gray-600">🔄 Reset</Button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 flex-wrap">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color.replace("0.35", "0.8").replace("0.45", "0.8") }} />
              <span>{item.label}: <strong>{item.x.toFixed(1)}mm, {item.y.toFixed(1)}mm</strong> ({item.width.toFixed(1)}x{item.height.toFixed(1)}mm)</span>
            </div>
          ))}
        </div>

        {/* A4 Canvas */}
        <div
          ref={containerRef}
          className="relative mx-auto border-2 border-gray-600 select-none"
          style={{
            width: "595px",
            height: "842px",
            backgroundImage: "url(/images/base.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {containerSize.w > 0 && items.map(item => {
            const px = mmToPixel(item.x, "x");
            const py = mmToPixel(item.y, "y");
            const pw = mmToPixel(item.width, "x");
            const ph = mmToPixel(item.height, "y");

            return (
              <div
                key={item.id}
                className="absolute cursor-move border-2 border-dashed flex items-center justify-center text-xs font-bold"
                style={{
                  left: `${px}px`,
                  top: `${py}px`,
                  width: `${pw}px`,
                  height: `${ph}px`,
                  backgroundColor: item.color,
                  borderColor: item.color.replace("0.35", "1").replace("0.45", "1"),
                  zIndex: dragging === item.id ? 50 : 10,
                }}
                onMouseDown={(e) => handleMouseDown(e, item.id)}
              >
                <span className="bg-black/70 px-1 py-0.5 rounded text-white pointer-events-none whitespace-nowrap" style={{ fontSize: "10px" }}>
                  {item.label}
                </span>
                {/* Resize handle */}
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-800 cursor-se-resize"
                  onMouseDown={(e) => handleResizeDown(e, item.id)}
                />
              </div>
            );
          })}
        </div>

        {/* Output */}
        {saved && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-2 text-green-400">📋 Posições Finais (copie e me envie):</h3>
            <pre className="bg-black p-4 rounded text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">
{`// Tamanho das matrizes
matrizW = mmToPt(${items.find(i=>i.id==="frente")!.width.toFixed(3)})  // ${items.find(i=>i.id==="frente")!.width.toFixed(3)}mm
matrizH = mmToPt(${items.find(i=>i.id==="frente")!.height.toFixed(3)})  // ${items.find(i=>i.id==="frente")!.height.toFixed(3)}mm
qrSize  = mmToPt(${items.find(i=>i.id==="qrcode")!.width.toFixed(3)})  // ${items.find(i=>i.id==="qrcode")!.width.toFixed(3)}mm

${generateCode()}`}
            </pre>
            <p className="text-gray-400 mt-2 text-sm">Cole esses valores aqui no chat que eu atualizo a edge function automaticamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
