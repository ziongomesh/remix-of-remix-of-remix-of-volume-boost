import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { rgService, type RgRecord } from '@/lib/rg-service';
import { generateRGFrente, generateRGVerso, type RgData } from '@/lib/rg-generator';
import {
  ArrowLeft, Save, Loader2, Eye, RefreshCw, User, ClipboardList, Upload
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ESTADOS = [
  { value: "AC", label: "Acre" }, { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" }, { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" }, { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" }, { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" }, { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" }, { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" }, { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" }, { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" }, { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" }, { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" }, { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" }, { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" }, { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

interface RgEditViewProps {
  registro: RgRecord;
  onClose: () => void;
  onSaved: () => void;
}

function isoToBR(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) return dateStr;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return dateStr;
}

function formatDate(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length >= 5) return d.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
  if (d.length >= 3) return d.replace(/(\d{2})(\d{0,2})/, '$1/$2');
  return d;
}

function formatCPFDisplay(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export default function RgEditView({ registro, onClose, onSaved }: RgEditViewProps) {
  const { admin } = useAuth();
  const canvasFrenteRef = useRef<HTMLCanvasElement>(null);
  const canvasVersoRef = useRef<HTMLCanvasElement>(null);

  // Resolve foto/assinatura URLs with MySQL fallbacks
  const fotoUrl = registro.foto_url || (registro as any).foto || null;
  const assinaturaUrl = registro.assinatura_url || (registro as any).assinatura || null;

  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [newFoto, setNewFoto] = useState<File | null>(null);
  const [newAssinatura, setNewAssinatura] = useState<File | null>(null);
  const [previewUrls, setPreviewUrls] = useState({
    frente: registro.rg_frente_url || '',
    verso: registro.rg_verso_url || '',
  });

  const [changedMatrices, setChangedMatrices] = useState<Set<'frente' | 'verso'>>(new Set());

  const nome = registro.nome_completo || registro.nome || '';

  const [form, setForm] = useState({
    nomeCompleto: nome,
    nomeSocial: registro.nome_social || '',
    dataNascimento: isoToBR(registro.data_nascimento),
    naturalidade: registro.naturalidade || '',
    genero: registro.genero || '',
    nacionalidade: registro.nacionalidade || 'BRA',
    validade: isoToBR(registro.validade),
    uf: registro.uf || '',
    dataEmissao: isoToBR(registro.data_emissao),
    local: registro.local_emissao || (registro as any).local || '',
    orgaoExpedidor: registro.orgao_expedidor || '',
    pai: registro.pai || '',
    mae: registro.mae || '',
  });

  const [originalForm] = useState({ ...form });

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const getAffectedMatrices = (fieldName: string): ('frente' | 'verso')[] => {
    const frenteFields = ['nomeCompleto', 'nomeSocial', 'dataNascimento', 'naturalidade', 'genero', 'nacionalidade', 'validade'];
    const versoFields = ['pai', 'mae', 'orgaoExpedidor', 'local', 'dataEmissao'];
    const affected: ('frente' | 'verso')[] = [];
    if (frenteFields.includes(fieldName)) affected.push('frente');
    if (versoFields.includes(fieldName)) affected.push('verso');
    return affected;
  };

  useEffect(() => {
    const changed = new Set<'frente' | 'verso'>();
    for (const key of Object.keys(form) as (keyof typeof form)[]) {
      if (form[key] !== originalForm[key]) {
        const affected = getAffectedMatrices(key);
        affected.forEach(m => changed.add(m));
      }
    }
    if (newFoto) changed.add('frente');
    if (newAssinatura) { changed.add('frente'); changed.add('verso'); }
    setChangedMatrices(changed);
  }, [form, newFoto, newAssinatura]);

  // Auto-generate preview on mount
  const [initialGenerated, setInitialGenerated] = useState(false);
  useEffect(() => {
    if (initialGenerated) return;
    setInitialGenerated(true);
    const timer = setTimeout(() => {
      regenerateAll();
    }, 300);
    return () => clearTimeout(timer);
  }, [initialGenerated]);

  const regenerateAll = async () => {
    setRegenerating(true);
    try {
      console.log('🔄 regenerateAll: fotoUrl=', fotoUrl, 'assinaturaUrl=', assinaturaUrl);
      let fotoFile: File | string | undefined = newFoto || undefined;
      if (!fotoFile && fotoUrl) {
        try {
          console.log('📷 Fetching foto from:', fotoUrl);
          const resp = await fetch(fotoUrl);
          console.log('📷 Foto fetch status:', resp.status, resp.ok);
          if (resp.ok) {
            const blob = await resp.blob();
            console.log('📷 Foto blob size:', blob.size, 'type:', blob.type);
            fotoFile = new File([blob], 'foto.png', { type: blob.type || 'image/png' });
          }
        } catch (e) { console.warn('Could not fetch foto:', e); }
      }

      let assinaturaFile: File | string | undefined = newAssinatura || undefined;
      if (!assinaturaFile && assinaturaUrl) {
        try {
          const resp = await fetch(assinaturaUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            assinaturaFile = new File([blob], 'assinatura.png', { type: 'image/png' });
          }
        } catch (e) { console.warn('Could not fetch assinatura from record URL:', e); }
      }
      if (!assinaturaFile) {
        const cleanCpf = registro.cpf.replace(/\D/g, '');
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const assUrl = `${supabaseUrl}/storage/v1/object/public/uploads/rg_${cleanCpf}_assinatura.png`;
          const resp = await fetch(assUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            assinaturaFile = new File([blob], 'assinatura.png', { type: 'image/png' });
          }
        } catch (e) { console.warn('Could not fetch signature from storage:', e); }
      }

      const rgData: RgData = {
        nomeCompleto: form.nomeCompleto,
        nomeSocial: form.nomeSocial,
        cpf: registro.cpf,
        dataNascimento: form.dataNascimento,
        naturalidade: form.naturalidade,
        genero: form.genero,
        nacionalidade: form.nacionalidade,
        validade: form.validade,
        uf: form.uf,
        dataEmissao: form.dataEmissao,
        local: form.local,
        orgaoExpedidor: form.orgaoExpedidor,
        pai: form.pai,
        mae: form.mae,
        foto: fotoFile,
        assinatura: assinaturaFile,
      };

      if (canvasFrenteRef.current) {
        await generateRGFrente(canvasFrenteRef.current, rgData);
        setPreviewUrls(prev => ({ ...prev, frente: canvasFrenteRef.current!.toDataURL('image/png') }));
      }

      if (canvasVersoRef.current) {
        const cleanCpf = registro.cpf.replace(/\D/g, '');
        const senha = cleanCpf.slice(-6);
        const qrPayload = JSON.stringify({
          url: `https://govbr.consulta-rgdigital-vio.info/qr/index.php?cpf=${cleanCpf}`,
          doc: "RG_DIGITAL", ver: "2.0",
          cpf: cleanCpf, nome: form.nomeCompleto, ns: form.nomeSocial || "",
          dn: form.dataNascimento, sx: form.genero, nac: form.nacionalidade || "BRA",
          nat: form.naturalidade, uf: form.uf, de: form.dataEmissao, dv: form.validade,
          le: form.local, oe: form.orgaoExpedidor, pai: form.pai || "", mae: form.mae || "",
          tp: "CARTEIRA_IDENTIDADE_NACIONAL", org: "SSP/" + form.uf,
          sn: senha, ts: Date.now(),
        });
        const qrPreviewUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrPayload)}&format=png&ecc=M`;
        await generateRGVerso(canvasVersoRef.current, rgData, qrPreviewUrl);
        setPreviewUrls(prev => ({ ...prev, verso: canvasVersoRef.current!.toDataURL('image/png') }));
      }
    } catch (err: any) {
      console.error('Erro ao gerar preview inicial:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (changedMatrices.size === 0) {
      toast.info('Nenhuma alteração detectada');
      return;
    }
    await regenerateAll();
    toast.success(`Preview regenerado: ${[...changedMatrices].join(', ')}`);
  };

  const handleSave = async () => {
    if (!admin) return;
    if (changedMatrices.size === 0) {
      toast.info('Nenhuma alteração para salvar');
      return;
    }

    setSaving(true);
    try {
      // Auto-regenerate before saving to ensure canvas has content
      await regenerateAll();

      const rgFrenteBase64 = canvasFrenteRef.current
        ? canvasFrenteRef.current.toDataURL('image/png') : '';
      const rgVersoBase64 = canvasVersoRef.current
        ? canvasVersoRef.current.toDataURL('image/png') : '';

      let fotoBase64 = '';
      if (newFoto) {
        fotoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(newFoto);
        });
      }

      let assinaturaBase64 = '';
      if (newAssinatura) {
        assinaturaBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(newAssinatura);
        });
      }

      await rgService.update({
        admin_id: admin.id,
        session_token: admin.session_token,
        rg_id: registro.id,
        nomeCompleto: form.nomeCompleto,
        nomeSocial: form.nomeSocial,
        dataNascimento: form.dataNascimento,
        naturalidade: form.naturalidade,
        genero: form.genero,
        nacionalidade: form.nacionalidade,
        validade: form.validade,
        uf: form.uf,
        dataEmissao: form.dataEmissao,
        local: form.local,
        orgaoExpedidor: form.orgaoExpedidor,
        pai: form.pai,
        mae: form.mae,
        changedMatrices: ['frente', 'verso'],
        rgFrenteBase64,
        rgVersoBase64,
        fotoBase64,
        assinaturaBase64,
      });

      onSaved();
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      toast.error(err.message || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Hidden canvases */}
      <canvas ref={canvasFrenteRef} className="hidden" />
      <canvas ref={canvasVersoRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Editar RG Digital</h2>
            <p className="text-sm text-muted-foreground">CPF: {formatCPFDisplay(registro.cpf)} — {nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {changedMatrices.size > 0 && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive">
              Matrizes alteradas: {[...changedMatrices].join(', ')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" /> Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Nome Completo</Label>
              <Input value={form.nomeCompleto} onChange={(e) => updateField('nomeCompleto', e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label className="text-xs">Nome Social</Label>
              <Input value={form.nomeSocial} onChange={(e) => updateField('nomeSocial', e.target.value.toUpperCase())} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Data Nascimento</Label>
                <Input value={form.dataNascimento} onChange={(e) => updateField('dataNascimento', formatDate(e.target.value))} maxLength={10} />
              </div>
              <div>
                <Label className="text-xs">Gênero</Label>
                <Select value={form.genero} onValueChange={(v) => updateField('genero', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Naturalidade</Label>
              <Input value={form.naturalidade} onChange={(e) => updateField('naturalidade', e.target.value.toUpperCase())} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Nacionalidade</Label>
                <Input value={form.nacionalidade} onChange={(e) => updateField('nacionalidade', e.target.value.toUpperCase())} />
              </div>
              <div>
                <Label className="text-xs">UF</Label>
                <Select value={form.uf} onValueChange={(v) => updateField('uf', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Pai</Label>
              <Input value={form.pai} onChange={(e) => updateField('pai', e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label className="text-xs">Mãe</Label>
              <Input value={form.mae} onChange={(e) => updateField('mae', e.target.value.toUpperCase())} />
            </div>

            {/* Foto Upload */}
            <div>
              <Label className="text-xs">Foto de Perfil</Label>
              <div className="flex items-center gap-3 mt-1">
                {(newFoto || fotoUrl) && (
                  <img
                    src={newFoto ? URL.createObjectURL(newFoto) : fotoUrl!}
                    alt="Foto"
                    className="h-16 w-16 object-cover rounded-full border"
                  />
                )}
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors text-xs text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  {newFoto ? newFoto.name : 'Trocar foto'}
                  <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={(e) => setNewFoto(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            {/* Assinatura Upload */}
            <div>
              <Label className="text-xs">Assinatura Digital</Label>
              <div className="flex items-center gap-3 mt-1">
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors text-xs text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  {newAssinatura ? newAssinatura.name : 'Trocar assinatura'}
                  <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={(e) => setNewAssinatura(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Documento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Dados do Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Data Emissão</Label>
                <Input value={form.dataEmissao} onChange={(e) => updateField('dataEmissao', formatDate(e.target.value))} maxLength={10} />
              </div>
              <div>
                <Label className="text-xs">Validade</Label>
                <Input value={form.validade} onChange={(e) => updateField('validade', formatDate(e.target.value))} maxLength={10} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Órgão Expedidor</Label>
              <Input value={form.orgaoExpedidor} onChange={(e) => updateField('orgaoExpedidor', e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label className="text-xs">Local de Emissão</Label>
              <Input value={form.local} onChange={(e) => updateField('local', e.target.value.toUpperCase())} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview das matrizes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" /> Preview das Matrizes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                Frente {changedMatrices.has('frente') && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-destructive/10 text-destructive">alterada</span>}
              </p>
              {previewUrls.frente && <img src={previewUrls.frente} alt="Frente" className="w-full rounded border" />}
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                Verso {changedMatrices.has('verso') && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-destructive/10 text-destructive">alterada</span>}
              </p>
              {previewUrls.verso && <img src={previewUrls.verso} alt="Verso" className="w-full rounded border" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={regenerating || changedMatrices.size === 0}
          >
            {regenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Regenerar Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || changedMatrices.size === 0}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
