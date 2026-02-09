import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Download, Layers, PanelRightClose, Loader2, QrCode, Copy, Tag } from 'lucide-react';
import { PdfTextField } from '@/components/pdf-editor/types';
import { extractPdfData } from '@/components/pdf-editor/pdf-utils';
import { PdfCanvas } from '@/components/pdf-editor/PdfCanvas';
import { LayersPanel } from '@/components/pdf-editor/LayersPanel';
import { savePdf } from '@/components/pdf-editor/pdf-save';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// QR code fixed overlay - just shows/hides at calibrated position
function QrCodeOverlay() {
  // Calibrated position: x=120pt, y=64pt, size=84pt at scale 1.5
  const scale = 1.5;
  const x = 120.0 * 96 / 72 * scale;
  const y = 64.0 * 96 / 72 * scale;
  const size = 84.0 * 96 / 72 * scale;

  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{ left: x, top: y, width: size, height: size }}
    >
      <img
        src="/images/qrcode-sample-crlv.png"
        alt="QR Code"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
}
// Available CRLV form field names
const CRLV_INPUT_NAMES = [
  'renavam', 'placa', 'exercicio', 'anoFab', 'anoMod', 'numeroCrv', 'segurancaCrv',
  'codSegCla', 'catObs', 'marcaModelo', 'especieTipo', 'placaAnt', 'chassi', 'cor',
  'combustivel', 'categoria', 'capacidade', 'potenciaCil', 'pesoBruto', 'motor',
  'cmt', 'eixos', 'lotacao', 'carroceria', 'nomeProprietario', 'cpfCnpj', 'local',
  'data', 'uf', 'observacoes',
];

export default function CrlvPositionTool() {
  const [fields, setFields] = useState<PdfTextField[]>([]);
  const [pages, setPages] = useState<{ width: number; height: number; canvas: HTMLCanvasElement; bgCanvas: HTMLCanvasElement }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showLayers, setShowLayers] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showQr, setShowQr] = useState(false);

  const selectedField = useMemo(() => fields.find(f => f.id === selectedId), [fields, selectedId]);
  const usedNames = useMemo(() => new Set(fields.map(f => f.inputName).filter(Boolean)), [fields]);

  const handleSetInputName = useCallback((id: string, name: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, inputName: name || undefined } : f));
    toast.success(`Campo definido como "${name}"`);
  }, []);

  const handleExportMapping = useCallback(() => {
    const SCALE = 1.5;
    const mapped = fields.filter(f => f.inputName);
    if (mapped.length === 0) {
      toast.error('Nenhum campo mapeado ainda!');
      return;
    }
    const lines = mapped.map(f => {
      // Convert canvas pixels back to PDF points
      const wx = (f.x / SCALE) * 72 / 96;
      const wy = (f.y / SCALE) * 72 / 96;
      const ww = (f.width / SCALE) * 72 / 96;
      const wh = (f.height / SCALE) * 72 / 96;
      const tx = wx;
      const ty = wy + (f.fontSize / SCALE) * 72 / 96 * 0.85;
      const size = (f.fontSize / SCALE) * 72 / 96;
      return `  { key: '${f.inputName}', wx: ${wx.toFixed(0)}, wy: ${wy.toFixed(0)}, ww: ${ww.toFixed(0)}, wh: ${wh.toFixed(0)}, tx: ${tx.toFixed(0)}, ty: ${ty.toFixed(0)}, size: ${size.toFixed(0)} },`;
    });
    const code = `const FIELDS: FieldDef[] = [\n${lines.join('\n')}\n];`;
    navigator.clipboard.writeText(code);
    toast.success(`Mapeamento de ${mapped.length} campos copiado!`);
  }, [fields]);

  // ... keep existing code (loadTemplate, handleFileUpload, handleUpdateField, handleToggleVisibility, handleDelete, handleSave)
  const loadTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/templates/crlv-template.pdf?v=' + Date.now());
      const blob = await response.blob();
      const file = new File([blob], 'crlv-template.pdf', { type: 'application/pdf' });
      const { pages: extractedPages, fields: extractedFields, arrayBuffer } = await extractPdfData(file);
      setPages(extractedPages);
      setFields(extractedFields);
      setPdfBytes(arrayBuffer);
      setCurrentPage(0);
      setLoaded(true);
      toast.success(`PDF carregado! ${extractedFields.length} campos de texto encontrados.`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar template CRLV');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Selecione um arquivo PDF');
      return;
    }
    setLoading(true);
    try {
      const { pages: extractedPages, fields: extractedFields, arrayBuffer } = await extractPdfData(file);
      setPages(extractedPages);
      setFields(extractedFields);
      setPdfBytes(arrayBuffer);
      setCurrentPage(0);
      setLoaded(true);
      toast.success(`PDF carregado! ${extractedFields.length} campos encontrados.`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar PDF');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateField = useCallback((id: string, updates: Partial<PdfTextField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const handleToggleVisibility = useCallback((id: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, visible: !f.visible } : f));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleSave = async () => {
    if (!pdfBytes) return;
    try {
      const pageScales = pages.map(p => ({ width: p.width, height: p.height }));
      const savedBytes = await savePdf(pdfBytes, fields, pageScales);
      const blob = new Blob([savedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'crlv_editado.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PDF salvo!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar PDF');
    }
  };

  const currentPageFields = fields.filter(f => f.pageIndex === currentPage);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">📐 Editor CRLV — Edição Direta no PDF</h1>
            <p className="text-sm text-muted-foreground">
              Clique em qualquer texto do PDF para editar diretamente. Igual ao Sejda.
            </p>
          </div>
          {loaded && (
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleExportMapping} variant="outline" size="sm" className="gap-1">
                <Copy className="h-4 w-4" />
                Copiar Mapeamento ({fields.filter(f => f.inputName).length})
              </Button>
              <Button onClick={() => setShowQr(v => !v)} variant={showQr ? 'default' : 'outline'} size="sm" className="gap-1">
                <QrCode className="h-4 w-4" />
                QR Code
              </Button>
              <Button onClick={() => setShowLayers(v => !v)} variant={showLayers ? 'default' : 'outline'} size="sm" className="gap-1">
                {showLayers ? <PanelRightClose className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                Camadas
              </Button>
              <Button onClick={handleSave} size="sm" className="gap-1">
                <Download className="h-4 w-4" /> Salvar PDF
              </Button>
            </div>
          )}
        </div>

        {/* Load options */}
        {!loaded && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="flex gap-4">
              <Button onClick={loadTemplate} size="lg" className="gap-2">
                📄 Carregar Template CRLV
              </Button>
              <label>
                <Button variant="outline" size="lg" className="gap-2 cursor-pointer" asChild>
                  <span>📂 Enviar outro PDF</span>
                </Button>
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">Escolha o template padrão ou envie um PDF preenchido para editar</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Analisando PDF e extraindo campos...</p>
          </div>
        )}

        {/* Selected field assignment */}
        {loaded && selectedField && (
          <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
            <Tag className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium shrink-0">Campo selecionado:</span>
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]" title={selectedField.text}>
              "{selectedField.text}"
            </span>
            <span className="text-sm shrink-0">→</span>
            <Select
              value={selectedField.inputName || ''}
              onValueChange={(val) => handleSetInputName(selectedId!, val)}
            >
              <SelectTrigger className="w-[200px] h-8 text-sm">
                <SelectValue placeholder="Definir nome do input..." />
              </SelectTrigger>
              <SelectContent>
                {CRLV_INPUT_NAMES.map(name => (
                  <SelectItem key={name} value={name} disabled={usedNames.has(name) && selectedField.inputName !== name}>
                    {name} {usedNames.has(name) && selectedField.inputName !== name ? '(usado)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedField.inputName && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleSetInputName(selectedId!, '')}>
                Limpar
              </Button>
            )}
          </div>
        )}

        {/* Editor */}
        {loaded && pages.length > 0 && (
          <div className="flex gap-0 border border-border rounded-lg overflow-hidden bg-muted/30" style={{ height: 'calc(100vh - 240px)' }}>
            <div className="flex-1 overflow-auto">
              {pages.length > 1 && (
                <div className="flex gap-1 p-2 bg-card border-b border-border">
                  {pages.map((_, i) => (
                    <Button key={i} size="sm" variant={currentPage === i ? 'default' : 'ghost'} onClick={() => setCurrentPage(i)}>
                      Página {i + 1}
                    </Button>
                  ))}
                </div>
              )}
              <ScrollArea className="h-full">
                <div className="p-4 flex justify-center">
                  <div className="relative inline-block">
                    <PdfCanvas
                      pageCanvas={pages[currentPage]?.canvas || null}
                      bgCanvas={pages[currentPage]?.bgCanvas || null}
                      fields={fields}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                      onUpdateField={handleUpdateField}
                      pageIndex={currentPage}
                    />
                    {showQr && (
                      <QrCodeOverlay />
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {showLayers && (
              <LayersPanel
                fields={currentPageFields}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {loaded && (
          <div className="text-xs text-muted-foreground text-center space-x-4">
            <span>🖱️ Clique no texto para editar</span>
            <span>👁️ Oculte campos no painel de camadas</span>
            <span>🗑️ Exclua campos indesejados</span>
            {showQr && <span>📌 Arraste o QR Code para posicionar</span>}
          </div>
        )}
      </div>
    </div>
  );
}