import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IdCard, User, Shield, CreditCard, Upload, Camera, Loader2, Calendar, ArrowLeft, Copy, FileText, Eye, Sparkles, FolderOpen
} from 'lucide-react';
import iconGovbr from '@/assets/icon-govbr.png';
import exemploGovbr from '@/assets/exemplo-govbr.png';
import AppExamplePreview from '@/components/AppExamplePreview';
import ImageGalleryModal from '@/components/ImageGalleryModal';
import { generateRGFrente, generateRGVerso, generateRGPdfPage, type RgData } from '@/lib/rg-generator';
import { rgService } from '@/lib/rg-service';
import { playSuccessSound } from '@/lib/success-sound';
import { useCpfCheck } from '@/hooks/useCpfCheck';
import CpfDuplicateModal from '@/components/CpfDuplicateModal';
import { supabase } from '@/integrations/supabase/client';

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

const CAPITAIS: Record<string, string> = {
  AC: "RIO BRANCO", AL: "MACEIO", AP: "MACAPA", AM: "MANAUS",
  BA: "SALVADOR", CE: "FORTALEZA", DF: "BRASILIA", ES: "VITORIA",
  GO: "GOIANIA", MA: "SAO LUIS", MT: "CUIABA", MS: "CAMPO GRANDE",
  MG: "BELO HORIZONTE", PA: "BELEM", PB: "JOAO PESSOA", PR: "CURITIBA",
  PE: "RECIFE", PI: "TERESINA", RJ: "RIO DE JANEIRO", RN: "NATAL",
  RS: "PORTO ALEGRE", RO: "PORTO VELHO", RR: "BOA VISTA", SC: "FLORIANOPOLIS",
  SP: "SAO PAULO", SE: "ARACAJU", TO: "PALMAS",
};

const rgSchema = z.object({
  nomeCompleto: z.string().min(1, "Nome obrigatório"),
  nomeSocial: z.string().optional(),
  cpf: z.string().min(14, "CPF inválido"),
  dataNascimento: z.string().min(10, "Data obrigatória"),
  naturalidade: z.string().min(1, "Naturalidade obrigatória"),
  genero: z.enum(["MASCULINO", "FEMININO"], { errorMap: () => ({ message: "Selecione" }) }),
  nacionalidade: z.string().default("BRA"),
  validade: z.string().min(10, "Validade obrigatória"),
  uf: z.string().min(2, "Selecione UF"),
  dataEmissao: z.string().min(10, "Data obrigatória"),
  local: z.string().min(1, "Local obrigatório"),
  orgaoExpedidor: z.string().min(1, "Órgão obrigatório"),
  pai: z.string().optional(),
  mae: z.string().optional(),
});

type RgFormData = z.infer<typeof rgSchema>;

const formatCPF = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};
const formatDate = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length >= 5) return d.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
  if (d.length >= 3) return d.replace(/(\d{2})(\d{0,2})/, '$1/$2');
  return d;
};
const toUpper = (v: string) => v.toUpperCase();

export default function RgDigital() {
  const { admin, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const [showDemoBanner, setShowDemoBanner] = useState(isDemo);
  const cpfCheck = useCpfCheck({
    admin_id: admin?.id || 0,
    session_token: admin?.session_token || '',
    service_type: 'rg',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [assinatura, setAssinatura] = useState<File | null>(null);
  const [assPreview, setAssPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<RgFormData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rgInfo, setRgInfo] = useState<{ cpf: string; senha: string; pdf: string | null } | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<{ govbr_iphone: string; govbr_apk: string }>({ govbr_iphone: '', govbr_apk: '' });
  const [demoFilling, setDemoFilling] = useState(false);
  const [galleryType, setGalleryType] = useState<'foto' | 'assinatura' | null>(null);

  const RG_FIELD_LABELS: Record<string, string> = {
    nomeCompleto: 'Nome Completo', cpf: 'CPF', dataNascimento: 'Data de Nascimento',
    naturalidade: 'Naturalidade', genero: 'Gênero', validade: 'Validade',
    uf: 'UF', dataEmissao: 'Data de Emissão', local: 'Local', orgaoExpedidor: 'Órgão Expedidor',
  };

  const handleFormInvalid = (errors: FieldErrors<RgFormData>) => {
    const missing = Object.keys(errors).map(k => RG_FIELD_LABELS[k] || k).slice(0, 5);
    if (missing.length > 0) {
      toast.error(`Campos obrigatórios: ${missing.join(', ')}`, { position: 'top-right', duration: 5000 });
    }
  };
  useEffect(() => {
    supabase.from('downloads').select('govbr_iphone, govbr_apk').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setDownloadLinks({ govbr_iphone: data.govbr_iphone || '', govbr_apk: data.govbr_apk || '' });
    });
  }, []);

  const frenteCanvasRef = useRef<HTMLCanvasElement>(null);
  const versoCanvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<RgFormData>({
    resolver: zodResolver(rgSchema),
    mode: 'onChange',
    defaultValues: {
      nomeCompleto: '', nomeSocial: '', cpf: '', dataNascimento: '',
      naturalidade: '', genero: undefined, nacionalidade: 'BRA', validade: '',
      uf: '', dataEmissao: '', local: '', orgaoExpedidor: '', pai: '', mae: '',
    },
  });

  // Demo auto-fill for RG
  useEffect(() => {
    if (!isDemo || demoFilling) return;
    setDemoFilling(true);

    const demoFields: [string, string][] = [
      ['cpf', '529.982.247-25'],
      ['nomeCompleto', 'EDUARDO GOMES DIAS'],
      ['dataNascimento', '15/03/1990'],
      ['naturalidade', 'RIO DE JANEIRO'],
      ['genero', 'MASCULINO'],
      ['uf', 'RJ'],
      ['dataEmissao', '15/01/2025'],
      ['validade', '15/01/2035'],
      ['orgaoExpedidor', 'DETRAN'],
      ['pai', 'CARLOS EDUARDO DIAS'],
      ['mae', 'MARIA HELENA GOMES DIAS'],
    ];

    let i = 0;
    const fillNext = () => {
      if (i >= demoFields.length) {
        // Load demo photo and signature
        loadDemoFilesRg();
        return;
      }
      const [key, val] = demoFields[i];
      form.setValue(key as any, val, { shouldValidate: true });
      i++;
      setTimeout(fillNext, 120);
    };
    setTimeout(fillNext, 500);
  }, [isDemo]);

  const loadDemoFilesRg = async () => {
    try {
      const [fotoRes, assRes] = await Promise.all([
        fetch('/images/tutorial-foto-demo.png'),
        fetch('/images/tutorial-assinatura-demo.png'),
      ]);
      const fotoBlob = await fotoRes.blob();
      const assBlob = await assRes.blob();
      const fotoFile = new File([fotoBlob], 'foto-demo.png', { type: 'image/png' });
      const assFile = new File([assBlob], 'assinatura-demo.png', { type: 'image/png' });
      setFotoPerfil(fotoFile);
      setFotoPreview(URL.createObjectURL(fotoBlob));
      setAssinatura(assFile);
      setAssPreview(URL.createObjectURL(assBlob));
    } catch (e) {
      console.warn('Erro ao carregar arquivos demo:', e);
    }
  };

  const selectedUf = form.watch('uf');
  useEffect(() => {
    if (selectedUf) {
      const capital = CAPITAIS[selectedUf] || selectedUf;
      form.setValue('local', `${capital}/${selectedUf}`);
    }
  }, [selectedUf, form]);

  const generateRandomDates = () => {
    const month = Math.floor(Math.random() * 8) + 3;
    const day = Math.floor(Math.random() * 28) + 1;
    const em = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/2025`;
    const val = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/2035`;
    form.setValue('dataEmissao', em);
    form.setValue('validade', val);
    toast.success(`Datas geradas: Emissão ${em} / Validade ${val}`);
  };

  const handleFileUpload = (file: File, type: 'foto' | 'assinatura') => {
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Formato inválido. Use PNG ou JPG.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'foto') { setFotoPerfil(file); setFotoPreview(result); }
      else { setAssinatura(file); setAssPreview(result); }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!admin) return <Navigate to="/login" replace />;

  const handleGeneratePreview = async (data: RgFormData) => {
    if (!fotoPerfil) { toast.error('Foto de perfil é obrigatória', { position: 'top-right' }); return; }
    if (!assinatura) { toast.error('Assinatura é obrigatória', { position: 'top-right' }); return; }
    setPreviewData(data);
    setShowPreview(true);

    // Generate canvases
    setTimeout(async () => {
      const rgData: RgData = {
        nomeCompleto: data.nomeCompleto,
        nomeSocial: data.nomeSocial,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        naturalidade: data.naturalidade,
        genero: data.genero,
        nacionalidade: data.nacionalidade,
        validade: data.validade,
        uf: data.uf,
        dataEmissao: data.dataEmissao,
        local: data.local,
        orgaoExpedidor: data.orgaoExpedidor,
        pai: data.pai,
        mae: data.mae,
        foto: fotoPerfil!,
        assinatura: assinatura!,
      };
      if (frenteCanvasRef.current) await generateRGFrente(frenteCanvasRef.current, rgData);
      // Gerar QR code para o verso
      const cleanCpf = data.cpf.replace(/\D/g, '');
      const qrData = `https://govbr.consulta-rgdigital-vio.info/qr/index.php?cpf=${cleanCpf}`;
      const qrPreviewUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrData)}&format=png&ecc=M`;
      if (versoCanvasRef.current) await generateRGVerso(versoCanvasRef.current, rgData, qrPreviewUrl);
    }, 100);
  };

  const handleSave = async () => {
    if (!previewData || !frenteCanvasRef.current || !versoCanvasRef.current) return;
    setIsSubmitting(true);
    try {
      const frenteBase64 = frenteCanvasRef.current.toDataURL('image/png');
      const versoBase64 = versoCanvasRef.current.toDataURL('image/png');

      // Generate full-page PDF image (single PNG with everything)
      const cleanCpf = previewData.cpf.replace(/\D/g, '');
      const qrData = `https://govbr.consulta-rgdigital-vio.info/qr/index.php?cpf=${cleanCpf}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrData)}&format=png&ecc=M`;
      const rgDataForPdf: RgData = {
        nomeCompleto: previewData.nomeCompleto,
        nomeSocial: previewData.nomeSocial,
        cpf: previewData.cpf,
        dataNascimento: previewData.dataNascimento,
        naturalidade: previewData.naturalidade,
        genero: previewData.genero,
        nacionalidade: previewData.nacionalidade,
        validade: previewData.validade,
        uf: previewData.uf,
        dataEmissao: previewData.dataEmissao,
        local: previewData.local,
        orgaoExpedidor: previewData.orgaoExpedidor,
        pai: previewData.pai,
        mae: previewData.mae,
        foto: fotoPerfil!,
        assinatura: assinatura!,
      };
      const pdfPageBase64 = await generateRGPdfPage(rgDataForPdf, qrUrl);

      let fotoBase64 = '';
      if (fotoPerfil) {
        fotoBase64 = await new Promise<string>((res) => {
          const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(fotoPerfil);
        });
      }
      let assBase64 = '';
      if (assinatura) {
        assBase64 = await new Promise<string>((res) => {
          const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(assinatura);
        });
      }

      const convertDate = (d: string) => {
        const [day, month, year] = d.split('/');
        return `${year}-${month}-${day}`;
      };

      const result = await rgService.save({
        admin_id: admin.id,
        session_token: admin.session_token,
        cpf: previewData.cpf.replace(/\D/g, ''),
        nomeCompleto: toUpper(previewData.nomeCompleto),
        nomeSocial: previewData.nomeSocial ? toUpper(previewData.nomeSocial) : undefined,
        dataNascimento: convertDate(previewData.dataNascimento),
        naturalidade: toUpper(previewData.naturalidade),
        genero: previewData.genero,
        nacionalidade: previewData.nacionalidade,
        validade: convertDate(previewData.validade),
        uf: previewData.uf,
        dataEmissao: convertDate(previewData.dataEmissao),
        local: toUpper(previewData.local),
        orgaoExpedidor: toUpper(previewData.orgaoExpedidor),
        pai: previewData.pai ? toUpper(previewData.pai) : undefined,
        mae: previewData.mae ? toUpper(previewData.mae) : undefined,
        rgFrenteBase64: frenteBase64,
        rgVersoBase64: versoBase64,
        fotoBase64,
        assinaturaBase64: assBase64,
        pdfPageBase64,
      });

      playSuccessSound();
      setRgInfo({ cpf: result.id ? previewData.cpf.replace(/\D/g, '') : '', senha: result.senha, pdf: result.pdf });
      setShowSuccess(true);
      setShowPreview(false);
    } catch (err: any) {
      console.error('Erro ao salvar RG:', err);
      if (err.status === 409 && err.details) {
        const details = err.details;
        if (details.is_own) {
          toast.error(`Este CPF já possui um RG cadastrado por você. Vá ao Histórico para excluí-lo antes de criar novamente.`, {
            duration: 8000,
            action: {
              label: 'Ir ao Histórico',
              onClick: () => navigate('/historico'),
            },
          });
        } else {
          toast.error(`Este CPF já possui um RG cadastrado por ${details.creator_name || 'outro usuário'}. Não é possível criar duplicado.`, {
            duration: 8000,
          });
        }
      } else {
        toast.error(err.message || 'Erro ao salvar RG Digital');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // PREVIEW VIEW
  if (showPreview && previewData) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-6xl">
          <div className="flex items-center gap-4 bg-card rounded-full px-6 py-3 border w-fit mx-auto">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted">1</div>
              <span className="text-sm font-medium">Preencher</span>
            </div>
            <div className="w-8 h-0.5 bg-border" />
            <div className="flex items-center gap-2 text-primary">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">2</div>
              <span className="text-sm font-medium">Visualizar</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Preview do RG Digital</CardTitle>
              <CardDescription>Confira as matrizes antes de salvar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Frente</h4>
                  <div className="border rounded-lg overflow-hidden bg-muted/30">
                    <canvas ref={frenteCanvasRef} className="w-full h-auto" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Verso</h4>
                  <div className="border rounded-lg overflow-hidden bg-muted/30">
                    <canvas ref={versoCanvasRef} className="w-full h-auto" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPreview(false)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Editar
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</> : <><Shield className="h-4 w-4 mr-2" /> Gerar RG Digital</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // FORM VIEW
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Demo banner */}
        {showDemoBanner && (
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4 animate-in fade-in">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">🎓 Modo Tutorial</p>
              <p className="text-xs text-muted-foreground">Os campos estão sendo preenchidos automaticamente com dados de exemplo. A mesma foto e assinatura da CNH podem ser usadas aqui!</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setShowDemoBanner(false); searchParams.delete('demo'); setSearchParams(searchParams); }}>
              Fechar
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">RG Digital</h1>
            <p className="text-sm text-muted-foreground">Preencha os dados para gerar o RG Digital</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Saldo: <strong className="text-foreground">{admin?.creditos ?? 0}</strong> créditos</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card rounded-full px-6 py-3 border w-fit mx-auto">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-sm">1</div>
            <span className="text-sm font-medium">Preencher</span>
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-sm">2</div>
            <span className="text-sm font-medium">Visualizar</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGeneratePreview, handleFormInvalid)} className="space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField control={form.control} name="nomeCompleto" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input {...field} placeholder="NOME COMPLETO" onChange={(e) => field.onChange(toUpper(e.target.value))} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="cpf" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            field.onChange(formatted);
                            cpfCheck.checkCpf(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="nomeSocial" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Social (opcional)</FormLabel>
                      <FormControl><Input {...field} placeholder="NOME SOCIAL" onChange={(e) => field.onChange(toUpper(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input {...field} placeholder="DD/MM/AAAA" maxLength={10} onChange={(e) => field.onChange(formatDate(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="genero" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="MASCULINO">Masculino</SelectItem>
                          <SelectItem value="FEMININO">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="naturalidade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naturalidade <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input {...field} placeholder="SÃO PAULO/SP" onChange={(e) => field.onChange(toUpper(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pai" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Pai</FormLabel>
                      <FormControl><Input {...field} placeholder="NOME DO PAI" onChange={(e) => field.onChange(toUpper(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="mae" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Mãe</FormLabel>
                      <FormControl><Input {...field} placeholder="NOME DA MÃE" onChange={(e) => field.onChange(toUpper(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="nacionalidade" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="opacity-50">Nacionalidade</FormLabel>
                    <FormControl><Input {...field} value="BRA" disabled className="bg-muted opacity-50 cursor-not-allowed max-w-[120px]" /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Dados do Documento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4" /> Dados do Documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">🗓️ Gerar Datas Automaticamente</p>
                    <p className="text-xs text-muted-foreground">Emissão 2025, Validade 2035</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={generateRandomDates}>
                    <Calendar className="h-4 w-4 mr-2" /> Gerar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="uf" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado (UF) <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {ESTADOS.map((e) => (<SelectItem key={e.value} value={e.value}>{e.value} - {e.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="orgaoExpedidor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Órgão Expedidor <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input {...field} placeholder="SSP, PC..." onChange={(e) => field.onChange(toUpper(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="local" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="opacity-50">Local de Emissão</FormLabel>
                      <FormControl><Input {...field} disabled className="bg-muted opacity-50 cursor-not-allowed" /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="dataEmissao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Emissão <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input {...field} placeholder="DD/MM/AAAA" maxLength={10} onChange={(e) => field.onChange(formatDate(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="validade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Validade <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input {...field} placeholder="DD/MM/AAAA" maxLength={10} onChange={(e) => field.onChange(formatDate(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            {/* Foto e Assinatura */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Camera className="h-4 w-4" /> Foto e Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Foto de Perfil <span className="text-destructive">*</span></FormLabel>
                      <Button type="button" variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary" onClick={() => setGalleryType('foto')}>
                        <FolderOpen className="h-3 w-3" /> Acervo
                      </Button>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Foto" className="h-28 w-28 object-cover rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <Upload className="h-6 w-6" />
                          <span className="text-xs">Clique para upload</span>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'foto'); }} />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Assinatura <span className="text-destructive">*</span></FormLabel>
                      <Button type="button" variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary" onClick={() => setGalleryType('assinatura')}>
                        <FolderOpen className="h-3 w-3" /> Acervo
                      </Button>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      {assPreview ? (
                        <img src={assPreview} alt="Assinatura" className="h-16 w-36 object-contain rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <Upload className="h-6 w-6" />
                          <span className="text-xs">Clique para upload</span>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'assinatura'); }} />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <Card>
              <CardContent className="p-4">
                <Button type="submit" className="w-full" disabled={(admin?.creditos ?? 0) < 1}>
                  <Eye className="h-4 w-4 mr-2" /> Gerar Preview
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>

        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={(open) => { setShowSuccess(open); if (!open) { form.reset(); setFotoPerfil(null); setFotoPreview(null); setAssinatura(null); setAssPreview(null); setPreviewData(null); cpfCheck.resetCheck(); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><IdCard className="h-5 w-5 text-green-600" /> RG Digital Criado!</DialogTitle>
              <DialogDescription>Informações de acesso do RG Digital</DialogDescription>
            </DialogHeader>
            {rgInfo && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between"><span className="font-medium">CPF:</span><span className="font-mono">{formatCPF(rgInfo.cpf)}</span></div>
                  <div className="flex justify-between"><span className="font-medium">Senha:</span><span className="font-mono text-green-600 font-bold">{rgInfo.senha}</span></div>
                </div>
                {rgInfo.pdf && (
                  <Button variant="default" className="w-full" onClick={() => window.open(`${rgInfo.pdf!}?t=${Date.now()}`, '_blank')}>
                    <FileText className="h-4 w-4 mr-2" /> Baixar PDF
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => {
                  const expirationDate = (() => { const d = new Date(); d.setDate(d.getDate() + 45); return d.toLocaleDateString('pt-BR'); })();
                  const text = `Olá! Seu RG Digital está pronto!\n\n📋 DADOS DE ACESSO:\n👤 CPF: ${formatCPF(rgInfo.cpf)}\n🔑 Senha: ${rgInfo.senha}\n\n📅 VALIDADE:\n⏳ Documento válido por 45 dias!\nExpira em: ${expirationDate}\n\n⚠️ Mantenha suas credenciais seguras.\n🎉 Obrigado por adquirir seu acesso!`;
                  navigator.clipboard.writeText(text);
                  toast.success('Dados copiados!');
                }}>
                  <Copy className="h-4 w-4 mr-2" /> Copiar Dados
                </Button>
                <AppExamplePreview appName="Gov.br" exampleImage={exemploGovbr} />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    if (downloadLinks.govbr_apk) {
                      navigator.clipboard.writeText(downloadLinks.govbr_apk);
                      toast.success('Link Android copiado!');
                    } else {
                      toast.error('Link APK não configurado');
                    }
                  }}>
                    <Copy className="w-4 h-4 mr-2" /> Link Android
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    if (downloadLinks.govbr_iphone) {
                      navigator.clipboard.writeText(downloadLinks.govbr_iphone);
                      toast.success('Link iPhone copiado!');
                    } else {
                      toast.error('Link iPhone não configurado');
                    }
                  }}>
                    <Copy className="w-4 h-4 mr-2" /> Link iPhone
                  </Button>
                </div>
                <Button className="w-full" onClick={() => { setShowSuccess(false); form.reset(); setFotoPerfil(null); setFotoPreview(null); setAssinatura(null); setAssPreview(null); }}>
                  Voltar ao Início
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      <CpfDuplicateModal
        open={cpfCheck.showDuplicateModal}
        onClose={cpfCheck.dismissModal}
        result={cpfCheck.cpfDuplicate}
        serviceLabel="RG"
      />
      {admin && galleryType && (
        <ImageGalleryModal
          isOpen={!!galleryType}
          onClose={() => setGalleryType(null)}
          onSelect={(file) => {
            if (galleryType === 'foto') {
              setFotoPerfil(file);
              const reader = new FileReader();
              reader.onload = () => setFotoPreview(reader.result as string);
              reader.readAsDataURL(file);
            } else {
              setAssinatura(file);
              const reader = new FileReader();
              reader.onload = () => setAssPreview(reader.result as string);
              reader.readAsDataURL(file);
            }
          }}
          type={galleryType}
          adminId={admin.id}
          sessionToken={admin.session_token}
        />
      )}
      </div>
    </DashboardLayout>
  );
}
