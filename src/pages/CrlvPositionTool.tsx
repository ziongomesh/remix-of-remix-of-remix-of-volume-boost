import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const SCALE = 2.0;

interface FieldDef {
  key: string;
  wx: number; wy: number; ww: number; wh: number;
  tx: number; ty: number;
  size: number;
}

const FIELDS: FieldDef[] = [
  { key: 'renavam', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'placa', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'exercicio', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'anoFab', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'anoMod', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'numeroCrv', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'codSegCla', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'catObs', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'marcaModelo', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'especieTipo', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'placaAnt', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'chassi', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'cor', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'combustivel', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'categoria', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'capacidade', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'potenciaCil', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'pesoBruto', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'motor', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'cmt', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'eixos', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'lotacao', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'carroceria', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'nomeProprietario', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'cpfCnpj', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'local', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'data', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
  { key: 'observacoes', wx: 0, wy: 0, ww: 0, wh: 0, tx: 0, ty: 0, size: 8 },
];

const FIELD_LABELS: Record<string, string> = {
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
  uf: 'UF',
  observacoes: 'Observações',
};

function CrlvCanvas({ values }: { values: Record<string, string> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgImage(img);
    img.src = '/templates/crlv-template-base.png?v=1';
  }, []);

  useEffect(() => {
    if (!bgImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = bgImage.naturalWidth;
    canvas.height = bgImage.naturalHeight;
    ctx.drawImage(bgImage, 0, 0);

    const imgScale = bgImage.naturalWidth / 595;
    const ps = (v: number) => v * imgScale;

    for (const f of FIELDS) {
      const val = values[f.key] || '';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ps(f.wx), ps(f.wy), ps(f.ww), ps(f.wh));
      if (val.trim()) {
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${ps(f.size)}px "FreeMono", "Courier New", monospace`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(val, ps(f.tx), ps(f.ty));
      }
    }

    // DETRAN-UF
    if (values.uf) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ps(268), ps(30), ps(30), ps(12));
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${ps(8)}px "FreeMono", "Courier New", monospace`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(values.uf, ps(270), ps(39));
    }

  }, [values, bgImage]);

  return (
    <canvas ref={canvasRef} className="w-full h-auto block" />
  );
}

export default function CrlvPositionTool() {
  const { register, watch } = useForm({
    defaultValues: Object.fromEntries([
      ...FIELDS.map(f => [f.key, '']),
      ['uf', ''],
    ]),
  });

  const values = watch();

  const leftFields = [
    'renavam', 'placa', 'exercicio', 'anoFab', 'anoMod', 'numeroCrv',
    'codSegCla', 'catObs', 'marcaModelo', 'especieTipo', 'placaAnt', 'chassi',
    'cor', 'combustivel',
  ];

  const rightFields = [
    'categoria', 'capacidade', 'potenciaCil', 'pesoBruto', 'motor', 'cmt',
    'eixos', 'lotacao', 'carroceria', 'nomeProprietario', 'cpfCnpj', 'local', 'data', 'uf',
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Form inputs */}
      <div className="w-[420px] shrink-0 border-r border-border">
        <ScrollArea className="h-screen">
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-foreground">CRLV Digital — Teste</h2>
            <p className="text-xs text-muted-foreground">Preencha os campos para visualizar no CRLV ao lado</p>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Coluna Esquerda</p>
              <div className="grid grid-cols-2 gap-2">
                {leftFields.map(key => (
                  <div key={key} className={key === 'marcaModelo' || key === 'especieTipo' ? 'col-span-2' : ''}>
                    <Label className="text-[10px] text-muted-foreground">{FIELD_LABELS[key]}</Label>
                    <Input {...register(key)} className="h-7 text-xs" placeholder={FIELD_LABELS[key]} />
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
                    <Input {...register(key)} className="h-7 text-xs" placeholder={FIELD_LABELS[key]} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Observações</p>
              <Textarea {...register('observacoes')} className="text-xs min-h-[80px]" placeholder="Observações do veículo" />
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
