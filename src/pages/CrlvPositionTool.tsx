import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import openSansFont from '@/assets/OpenSans-VariableFont_wdth_wght.ttf';
import freeMonoBoldFont from '@/assets/FreeMonoBold.otf';

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

interface FieldDef {
  key: string;
  // Coordinates in Photoshop px (same as PDF points at 72dpi)
  tx: number; ty: number;
  size: number; // font size in pt
}

const FIELDS: FieldDef[] = [
  { key: 'uf', tx: 31.20, ty: 54.22, size: 4.42 },
  { key: 'renavam', tx: 0, ty: 0, size: 4.42 },
  { key: 'placa', tx: 0, ty: 0, size: 4.42 },
  { key: 'exercicio', tx: 0, ty: 0, size: 4.42 },
  { key: 'anoFab', tx: 0, ty: 0, size: 4.42 },
  { key: 'anoMod', tx: 0, ty: 0, size: 4.42 },
  { key: 'numeroCrv', tx: 0, ty: 0, size: 4.42 },
  { key: 'codSegCla', tx: 0, ty: 0, size: 4.42 },
  { key: 'catObs', tx: 0, ty: 0, size: 4.42 },
  { key: 'marcaModelo', tx: 0, ty: 0, size: 4.42 },
  { key: 'especieTipo', tx: 0, ty: 0, size: 4.42 },
  { key: 'placaAnt', tx: 0, ty: 0, size: 4.42 },
  { key: 'chassi', tx: 0, ty: 0, size: 4.42 },
  { key: 'cor', tx: 0, ty: 0, size: 4.42 },
  { key: 'combustivel', tx: 0, ty: 0, size: 4.42 },
  { key: 'categoria', tx: 315.76, ty: 73.67, size: 10 },
  { key: 'capacidade', tx: 510.08, ty: 88.78, size: 10 },
  { key: 'potenciaCil', tx: 316.01, ty: 114.22, size: 10 },
  { key: 'pesoBruto', tx: 510.08, ty: 114.70, size: 10 },
  { key: 'motor', tx: 317.00, ty: 140.86, size: 10 },
  { key: 'cmt', tx: 453.79, ty: 140.62, size: 10 },
  { key: 'eixos', tx: 504.80, ty: 140.62, size: 10 },
  { key: 'lotacao', tx: 538.63, ty: 140.86, size: 10 },
  { key: 'carroceria', tx: 316.01, ty: 166.27, size: 10 },
  { key: 'nomeProprietario', tx: 314.82, ty: 192.18, size: 10 },
  { key: 'cpfCnpj', tx: 463.39, ty: 223.38, size: 10 },
  { key: 'local', tx: 0, ty: 0, size: 4.42 },
  { key: 'data', tx: 0, ty: 0, size: 4.42 },
  { key: 'observacoes', tx: 0, ty: 0, size: 4.42 },
];

const FIELD_LABELS: Record<string, string> = {
  uf: 'UF do CRLV',
  renavam: 'Código Renavam',
  placa: 'Placa',
  exercicio: 'Exercício',
  anoFab: 'Ano Fabricação',
  anoMod: 'Ano Modelo',
  numeroCrv: 'Número do CRV',
  codSegCla: 'Cód. Segurança CLA',
  catObs: 'CAT',
  marcaModelo: 'Marca / Modelo / Versão',
  especieTipo: 'Espécie / Tipo',
  placaAnt: 'Placa Anterior / UF',
  chassi: 'Chassi',
  cor: 'Cor Predominante',
  combustivel: 'Combustível',
  categoria: 'Categoria',
  capacidade: 'Capacidade',
  potenciaCil: 'Potência / Cilindrada',
  pesoBruto: 'Peso Bruto Total',
  motor: 'Motor',
  cmt: 'CMT',
  eixos: 'Eixos',
  lotacao: 'Lotação',
  carroceria: 'Carroceria',
  nomeProprietario: 'Nome do Proprietário',
  cpfCnpj: 'CPF / CNPJ',
  local: 'Local de Emissão',
  data: 'Data de Emissão',
  observacoes: 'Observações',
};

function CrlvCanvas({ values }: { values: Record<string, string> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Load fonts for canvas
  useEffect(() => {
    const openSans = new FontFace('OpenSans', `url(${openSansFont})`);
    const freeMono = new FontFace('FreeMonoBold', `url(${freeMonoBoldFont})`);
    Promise.all([openSans.load(), freeMono.load()]).then(([f1, f2]) => {
      document.fonts.add(f1);
      document.fonts.add(f2);
      setFontLoaded(true);
    }).catch(err => {
      console.error('Erro ao carregar fontes:', err);
      setFontLoaded(true);
    });
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgImage(img);
    img.src = '/templates/crlv-template-base.png?v=1';
  }, []);

  useEffect(() => {
    if (!bgImage || !fontLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = bgImage.naturalWidth;
    canvas.height = bgImage.naturalHeight;
    ctx.drawImage(bgImage, 0, 0);

    // Scale: convert pt coordinates to image pixels
    const imgScale = bgImage.naturalWidth / 595;

    for (const f of FIELDS) {
      if (f.tx === 0 && f.ty === 0) continue;
      let val = (values[f.key] || '').toUpperCase();
      if (!val.trim()) continue;
      // UF field displays as "DETRAN-   UF"
      if (f.key === 'uf') val = `DETRAN-   ${val}`;

      const px = f.tx * imgScale;
      const py = f.ty * imgScale;
      const fontSize = f.size * imgScale;

      ctx.fillStyle = '#000000';
      if (f.key === 'uf') {
        ctx.font = `600 ${fontSize}px "OpenSans", "Open Sans", sans-serif`;
      } else {
        ctx.font = `bold ${fontSize}px "FreeMonoBold", monospace`;
      }
      ctx.textBaseline = 'top';
      ctx.fillText(val, px, py);
    }

    // "Documento emitido por DETRAN UF ..." line
    const uf = values.uf || 'SP';
    const hashCode = values.docHash || '364525021238D00';
    const brDate = values.docData || '';
    const brTime = values.docHora || '';
    const docText = `Documento emitido por DETRAN ${uf} (${hashCode}) em ${brDate} às ${brTime}.`;

    const docX = 31.43 * imgScale;
    const docY = 413.00 * imgScale;
    const docFontSize = 4.42 * imgScale;

    ctx.fillStyle = '#000000';
    ctx.font = `normal ${docFontSize}px Arial, "OpenSans", sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(docText, docX, docY);
  }, [values, bgImage, fontLoaded]);

  return (
    <canvas ref={canvasRef} className="w-full h-auto block" />
  );
}

export default function CrlvPositionTool() {
  const now = new Date();
  const defaultDate = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' });
  const defaultTime = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const { register, watch, setValue } = useForm<Record<string, string>>({
    defaultValues: {
      ...Object.fromEntries(FIELDS.map(f => [f.key, ''])),
      uf: 'SP',
      categoria: 'PARTICULAR',
      capacidade: '*.*',
      pesoBruto: '1.35',
      lotacao: '05P',
      eixos: '*',
      cmt: '1.75',
      carroceria: 'NÃO APLICAVEL',
      docData: defaultDate,
      docHora: defaultTime,
      docHash: '364525021238D00',
    },
  });

  const values = watch();

  const leftFields = [
    'renavam', 'placa', 'exercicio', 'anoFab', 'anoMod', 'numeroCrv',
    'codSegCla', 'catObs', 'marcaModelo', 'especieTipo', 'placaAnt', 'chassi',
    'cor', 'combustivel',
  ];

  const rightFields = [
    'categoria', 'capacidade', 'potenciaCil', 'pesoBruto', 'motor', 'cmt',
    'eixos', 'lotacao', 'carroceria', 'nomeProprietario', 'cpfCnpj', 'local', 'data',
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Form inputs */}
      <div className="w-[420px] shrink-0 border-r border-border">
        <ScrollArea className="h-screen">
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-foreground">CRLV Digital — Teste</h2>
            <p className="text-xs text-muted-foreground">Preencha os campos para visualizar no CRLV ao lado</p>

            {/* UF Select - first field */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">UF do CRLV</Label>
              <Select value={values.uf} onValueChange={(val) => setValue('uf', val)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BR.map(uf => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Doc emitido fields */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Documento Emitido</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-muted-foreground">Data</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 px-1 text-[9px] text-primary"
                      onClick={() => {
                        const now = new Date();
                        setValue('docData', now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }));
                      }}
                    >
                      Definir atual
                    </Button>
                  </div>
                  <Input {...register('docData')} className="h-7 text-xs uppercase" placeholder="dd/mm/aaaa" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-muted-foreground">Hora</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 px-1 text-[9px] text-primary"
                      onClick={() => {
                        const now = new Date();
                        setValue('docHora', now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                      }}
                    >
                      Definir atual
                    </Button>
                  </div>
                  <Input {...register('docHora')} className="h-7 text-xs uppercase" placeholder="hh:mm:ss" />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-muted-foreground">Código Hash</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 px-1 text-[9px] text-primary"
                      onClick={() => {
                        const chars = '0123456789ABCDEF';
                        let hash = '';
                        for (let i = 0; i < 12; i++) hash += chars[Math.floor(Math.random() * chars.length)];
                        setValue('docHash', hash + 'D00');
                      }}
                    >
                      Gerar
                    </Button>
                  </div>
                  <Input {...register('docHash')} className="h-7 text-xs uppercase" placeholder="364525021238D00" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Coluna Esquerda</p>
              <div className="grid grid-cols-2 gap-2">
                {leftFields.map(key => (
                  <div key={key} className={key === 'marcaModelo' || key === 'especieTipo' ? 'col-span-2' : ''}>
                    <Label className="text-[10px] text-muted-foreground">{FIELD_LABELS[key]}</Label>
                    <Input {...register(key)} className="h-7 text-xs uppercase" placeholder={FIELD_LABELS[key]} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Coluna Direita</p>
              <div className="grid grid-cols-2 gap-2">
                {rightFields.map(key => (
                  <div key={key} className={key === 'carroceria' || key === 'nomeProprietario' ? 'col-span-2' : ''}>
                    <Label className="text-[10px] text-muted-foreground">{FIELD_LABELS[key]}</Label>
                    <Input {...register(key)} className="h-7 text-xs uppercase" placeholder={FIELD_LABELS[key]} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Observações</p>
              <Textarea {...register('observacoes')} className="text-xs min-h-[80px] uppercase" placeholder="Observações do veículo" />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right: Preview */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <ScrollArea className="h-screen">
          <div className="p-4">
            <CrlvCanvas values={values} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
