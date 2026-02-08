import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateCNH } from '@/lib/cnh-generator';
import { generateCNHMeio } from '@/lib/cnh-generator-meio';
import { generateCNHVerso } from '@/lib/cnh-generator-verso';
import {
  getStateFullName, BRAZILIAN_STATES, CNH_CATEGORIES, CNH_OBSERVACOES, formatCPF, formatDate, generateMRZ,
  generateRegistroCNH, generateEspelhoNumber, generateCodigoSeguranca, generateRenach, generateRGByState
} from '@/lib/cnh-utils';
import {
  ArrowLeft, Save, Loader2, Eye, RefreshCw, User, ClipboardList, CreditCard, Shuffle, Upload
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UsuarioRecord {
  id: number;
  cpf: string;
  nome: string;
  categoria: string | null;
  uf: string | null;
  data_emissao: string | null;
  data_validade: string | null;
  created_at: string | null;
  data_expiracao: string | null;
  pdf_url: string | null;
  cnh_frente_url: string | null;
  cnh_meio_url: string | null;
  cnh_verso_url: string | null;
  foto_url: string | null;
  data_nascimento: string | null;
  sexo: string | null;
  nacionalidade: string | null;
  doc_identidade: string | null;
  numero_registro: string | null;
  hab: string | null;
  pai: string | null;
  mae: string | null;
  local_emissao: string | null;
  estado_extenso: string | null;
  espelho: string | null;
  codigo_seguranca: string | null;
  renach: string | null;
  obs: string | null;
  matriz_final: string | null;
  cnh_definitiva: string | null;
  senha: string | null;
  admin_id: number;
}

interface CnhEditViewProps {
  usuario: UsuarioRecord;
  onClose: () => void;
  onSaved: () => void;
}

export default function CnhEditView({ usuario, onClose, onSaved }: CnhEditViewProps) {
  const { admin } = useAuth();
  const canvasFrenteRef = useRef<HTMLCanvasElement>(null);
  const canvasMeioRef = useRef<HTMLCanvasElement>(null);
  const canvasVersoRef = useRef<HTMLCanvasElement>(null);

  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [newFoto, setNewFoto] = useState<File | null>(null);
  const [newAssinatura, setNewAssinatura] = useState<File | null>(null);
  const [previewUrls, setPreviewUrls] = useState({
    frente: usuario.cnh_frente_url || '',
    meio: usuario.cnh_meio_url || '',
    verso: usuario.cnh_verso_url || '',
  });

  // Track which matrices changed
  const [changedMatrices, setChangedMatrices] = useState<Set<'frente' | 'meio' | 'verso'>>(new Set());

  // Editable fields
  const [form, setForm] = useState({
    nome: usuario.nome || '',
    cpf: usuario.cpf || '',
    uf: usuario.uf || '',
    sexo: usuario.sexo || '',
    nacionalidade: usuario.nacionalidade || '',
    dataNascimento: usuario.data_nascimento || '',
    numeroRegistro: usuario.numero_registro || '',
    categoria: usuario.categoria || '',
    cnhDefinitiva: usuario.cnh_definitiva || 'sim',
    hab: usuario.hab || '',
    dataEmissao: usuario.data_emissao || '',
    dataValidade: usuario.data_validade || '',
    localEmissao: usuario.local_emissao || '',
    estadoExtenso: usuario.estado_extenso || '',
    matrizFinal: usuario.matriz_final || '',
    docIdentidade: usuario.doc_identidade || '',
    codigo_seguranca: usuario.codigo_seguranca || '',
    renach: usuario.renach || '',
    espelho: usuario.espelho || '',
    obs: usuario.obs || '',
    pai: usuario.pai || '',
    mae: usuario.mae || '',
  });

  // Track original values to detect changes
  const [originalForm] = useState({ ...form });

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Determine which matrices are affected by a field change
  const getAffectedMatrices = (fieldName: string): ('frente' | 'meio' | 'verso')[] => {
    // Frente fields
    const frenteFields = ['nome', 'cpf', 'dataNascimento', 'sexo', 'nacionalidade', 'docIdentidade', 'categoria', 'numeroRegistro', 'dataEmissao', 'dataValidade', 'hab', 'localEmissao', 'cnhDefinitiva', 'espelho'];
    // Meio fields
    const meioFields = ['nome', 'pai', 'mae', 'obs', 'estadoExtenso', 'uf', 'localEmissao'];
    // Verso fields
    const versoFields = ['nome', 'matrizFinal', 'codigo_seguranca', 'renach', 'espelho', 'numeroRegistro'];

    const affected: ('frente' | 'meio' | 'verso')[] = [];
    if (frenteFields.includes(fieldName)) affected.push('frente');
    if (meioFields.includes(fieldName)) affected.push('meio');
    if (versoFields.includes(fieldName)) affected.push('verso');
    return affected;
  };

  // Recalculate changed matrices whenever form changes
  useEffect(() => {
    const changed = new Set<'frente' | 'meio' | 'verso'>();
    for (const key of Object.keys(form) as (keyof typeof form)[]) {
      if (form[key] !== originalForm[key]) {
        const affected = getAffectedMatrices(key);
        affected.forEach(m => changed.add(m));
      }
    }
    // If photo or signature changed, frente is affected
    if (newFoto) changed.add('frente');
    if (newAssinatura) changed.add('frente');
    setChangedMatrices(changed);
  }, [form, newFoto, newAssinatura]);

  const formatarObs = (obs: string): string => {
    if (!obs) return '';
    const limpa = obs.toString().trim().replace(/;+$/g, '').trim();
    if (!limpa) return '';
    if (!limpa.includes(',')) return limpa + ';';
    const itens = limpa.split(',').map(item => item.trim()).filter(item => item.length > 0);
    if (itens.length === 0) return '';
    return itens.join(', ') + ';';
  };

  const handleRegenerate = async () => {
    if (changedMatrices.size === 0) {
      toast.info('Nenhuma alteração detectada');
      return;
    }

    setRegenerating(true);
    try {
      // Use new photo or fetch existing
      let fotoFile: File | null = newFoto;
      if (!fotoFile && changedMatrices.has('frente') && usuario.foto_url) {
        const resp = await fetch(usuario.foto_url);
        const blob = await resp.blob();
        fotoFile = new File([blob], 'foto.png', { type: 'image/png' });
      }

      const cnhData = {
        ...form,
        foto: fotoFile,
        assinatura: newAssinatura || undefined,
      };

      if (changedMatrices.has('frente') && canvasFrenteRef.current) {
        await generateCNH(canvasFrenteRef.current, cnhData, form.cnhDefinitiva);
        setPreviewUrls(prev => ({ ...prev, frente: canvasFrenteRef.current!.toDataURL('image/png') }));
      }

      if (changedMatrices.has('meio') && canvasMeioRef.current) {
        const meioData = {
          ...cnhData,
          obs: formatarObs(form.obs),
          estadoExtenso: form.estadoExtenso || getStateFullName(form.uf),
        };
        await generateCNHMeio(canvasMeioRef.current, meioData);
        setPreviewUrls(prev => ({ ...prev, meio: canvasMeioRef.current!.toDataURL('image/png') }));
      }

      if (changedMatrices.has('verso') && canvasVersoRef.current) {
        await generateCNHVerso(canvasVersoRef.current, cnhData);
        setPreviewUrls(prev => ({ ...prev, verso: canvasVersoRef.current!.toDataURL('image/png') }));
      }

      toast.success(`Preview regenerado: ${[...changedMatrices].join(', ')}`);
    } catch (err: any) {
      console.error('Erro ao regenerar:', err);
      toast.error('Erro ao regenerar preview');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSave = async () => {
    if (!admin) return;
    if (changedMatrices.size === 0) {
      toast.info('Nenhuma alteração para salvar');
      return;
    }

    setSaving(true);
    try {
      // Get base64 from canvases only for changed matrices
      const cnhFrenteBase64 = changedMatrices.has('frente') && canvasFrenteRef.current
        ? canvasFrenteRef.current.toDataURL('image/png') : '';
      const cnhMeioBase64 = changedMatrices.has('meio') && canvasMeioRef.current
        ? canvasMeioRef.current.toDataURL('image/png') : '';
      const cnhVersoBase64 = changedMatrices.has('verso') && canvasVersoRef.current
        ? canvasVersoRef.current.toDataURL('image/png') : '';

      // Convert new photo to base64 if changed
      let fotoBase64 = '';
      if (newFoto) {
        fotoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(newFoto);
        });
      }

      const { data, error } = await supabase.functions.invoke('update-cnh', {
        body: {
          admin_id: admin.id,
          session_token: admin.session_token,
          usuario_id: usuario.id,
          cpf: form.cpf,
          nome: form.nome,
          dataNascimento: form.dataNascimento,
          sexo: form.sexo,
          nacionalidade: form.nacionalidade,
          docIdentidade: form.docIdentidade,
          categoria: form.categoria,
          numeroRegistro: form.numeroRegistro,
          dataEmissao: form.dataEmissao,
          dataValidade: form.dataValidade,
          hab: form.hab,
          pai: form.pai,
          mae: form.mae,
          uf: form.uf,
          localEmissao: form.localEmissao,
          estadoExtenso: form.estadoExtenso,
          espelho: form.espelho,
          codigo_seguranca: form.codigo_seguranca,
          renach: form.renach,
          obs: form.obs,
          matrizFinal: form.matrizFinal,
          cnhDefinitiva: form.cnhDefinitiva,
          changedMatrices: [...changedMatrices],
          cnhFrenteBase64,
          cnhMeioBase64,
          cnhVersoBase64,
          fotoBase64,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

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
      {/* Hidden canvases for regeneration */}
      <canvas ref={canvasFrenteRef} className="hidden" />
      <canvas ref={canvasMeioRef} className="hidden" />
      <canvas ref={canvasVersoRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Editar CNH</h2>
            <p className="text-sm text-muted-foreground">CPF: {formatCPF(usuario.cpf)} — {usuario.nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {changedMatrices.size > 0 && (
            <Badge variant="outline" className="text-xs">
              Matrizes alteradas: {[...changedMatrices].join(', ')}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seção 1 - Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" /> Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Nome Completo</Label>
              <Input value={form.nome} onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-ZÁÀÂÃÇÉÊÍÓÔÕÚÜ\s]/g, '');
                updateField('nome', v);
                updateField('matrizFinal', generateMRZ(v));
              }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">UF</Label>
                <Select value={form.uf} onValueChange={(v) => {
                  updateField('uf', v);
                  updateField('estadoExtenso', getStateFullName(v));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Sexo</Label>
                <Select value={form.sexo} onValueChange={(v) => updateField('sexo', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Nacionalidade</Label>
              <Select value={form.nacionalidade} onValueChange={(v) => updateField('nacionalidade', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brasileiro">Brasileiro</SelectItem>
                  <SelectItem value="estrangeiro">Estrangeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Data Nasc / Local</Label>
              <Input value={form.dataNascimento} onChange={(e) => updateField('dataNascimento', e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label className="text-xs">Pai</Label>
              <Input value={form.pai} onChange={(e) => updateField('pai', e.target.value.toUpperCase().replace(/[^A-ZÁÀÂÃÇÉÊÍÓÔÕÚÜ\s]/g, ''))} />
            </div>
            <div>
              <Label className="text-xs">Mãe</Label>
              <Input value={form.mae} onChange={(e) => updateField('mae', e.target.value.toUpperCase().replace(/[^A-ZÁÀÂÃÇÉÊÍÓÔÕÚÜ\s]/g, ''))} />
            </div>

            {/* Foto Upload */}
            <div>
              <Label className="text-xs">Foto de Perfil</Label>
              <div className="flex items-center gap-3 mt-1">
                {(newFoto || usuario.foto_url) && (
                  <img
                    src={newFoto ? URL.createObjectURL(newFoto) : usuario.foto_url!}
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

        {/* Seção 2 - Dados CNH */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Dados da CNH
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Nº Registro</Label>
              <div className="flex gap-2">
                <Input value={form.numeroRegistro} onChange={(e) => updateField('numeroRegistro', e.target.value.replace(/\D/g, ''))} maxLength={11} className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={() => updateField('numeroRegistro', generateRegistroCNH())} className="shrink-0">
                  <Shuffle className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => updateField('categoria', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CNH_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Definitiva</Label>
                <Select value={form.cnhDefinitiva} onValueChange={(v) => updateField('cnhDefinitiva', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">1ª Habilitação</Label>
              <Input value={form.hab} onChange={(e) => updateField('hab', formatDate(e.target.value))} maxLength={10} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Emissão</Label>
                <Input value={form.dataEmissao} onChange={(e) => updateField('dataEmissao', formatDate(e.target.value))} maxLength={10} />
              </div>
              <div>
                <Label className="text-xs">Validade</Label>
                <Input value={form.dataValidade} onChange={(e) => updateField('dataValidade', formatDate(e.target.value))} maxLength={10} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Cidade / Estado</Label>
              <Input value={form.localEmissao} onChange={(e) => updateField('localEmissao', e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label className="text-xs">Estado Extenso</Label>
              <Input value={form.estadoExtenso} onChange={(e) => updateField('estadoExtenso', e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label className="text-xs">RG</Label>
              <div className="flex gap-2">
                <Input value={form.docIdentidade} onChange={(e) => updateField('docIdentidade', e.target.value.toUpperCase())} className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  if (!form.uf) { toast.error('Selecione o UF primeiro'); return; }
                  updateField('docIdentidade', generateRGByState(form.uf));
                }} className="shrink-0">
                  <Shuffle className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 3 - Códigos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Códigos & Obs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Espelho</Label>
              <div className="flex gap-2">
                <Input value={form.espelho} onChange={(e) => updateField('espelho', e.target.value.replace(/\D/g, ''))} maxLength={10} className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={() => updateField('espelho', generateEspelhoNumber())} className="shrink-0">
                  <Shuffle className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">Cód. Segurança</Label>
              <div className="flex gap-2">
                <Input value={form.codigo_seguranca} onChange={(e) => updateField('codigo_seguranca', e.target.value.replace(/\D/g, ''))} maxLength={11} className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={() => updateField('codigo_seguranca', generateCodigoSeguranca())} className="shrink-0">
                  <Shuffle className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">RENACH</Label>
              <div className="flex gap-2">
                <Input value={form.renach} onChange={(e) => updateField('renach', e.target.value.toUpperCase())} maxLength={11} className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  if (!form.uf) { toast.error('Selecione o UF primeiro'); return; }
                  updateField('renach', generateRenach(form.uf));
                }} className="shrink-0">
                  <Shuffle className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">MRZ</Label>
              <Input value={form.matrizFinal} onChange={(e) => updateField('matrizFinal', e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label className="text-xs">Observações</Label>
              <Input value={form.obs} onChange={(e) => updateField('obs', e.target.value)} placeholder="EAR, A" />
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
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                Frente {changedMatrices.has('frente') && <Badge variant="destructive" className="text-[10px] px-1">alterada</Badge>}
              </p>
              {previewUrls.frente && <img src={previewUrls.frente} alt="Frente" className="w-full rounded border" />}
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                Meio {changedMatrices.has('meio') && <Badge variant="destructive" className="text-[10px] px-1">alterada</Badge>}
              </p>
              {previewUrls.meio && <img src={previewUrls.meio} alt="Meio" className="w-full rounded border" />}
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                Verso {changedMatrices.has('verso') && <Badge variant="destructive" className="text-[10px] px-1">alterada</Badge>}
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

function Badge({ variant, className, children }: { variant?: string; className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
      variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
    } ${className || ''}`}>
      {children}
    </span>
  );
}
