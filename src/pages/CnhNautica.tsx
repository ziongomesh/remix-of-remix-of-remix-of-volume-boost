import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Anchor, User, CreditCard, Upload, Loader2, Copy, CheckCircle, AlertTriangle, Calendar, KeyRound, Smartphone, Apple, Ship, Eye
} from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { nauticaService } from '@/lib/cnh-nautica-service';
import ChaPreview, { ChaPreviewHandle } from '@/components/cha/ChaPreview';
import { playSuccessSound } from '@/lib/success-sound';
import { isUsingMySQL } from '@/lib/db-config';
import { mysqlApi } from '@/lib/api-mysql';
import { supabase } from '@/integrations/supabase/client';

const nauticaSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  cpf: z.string().min(14, 'CPF inválido'),
  dataNascimento: z.string().min(10, 'Data obrigatória'),
  categoria: z.string().min(1, 'Categoria obrigatória'),
  categoria2: z.string().optional(),
  validade: z.string().min(10, 'Validade obrigatória'),
  emissao: z.string().min(10, 'Data de emissão obrigatória'),
  numeroInscricao: z.string().min(1, 'Número de inscrição obrigatório'),
  limiteNavegacao: z.string().min(1, 'Limite de navegação obrigatório'),
  requisitos: z.string().optional(),
  orgaoEmissao: z.string().min(1, 'Órgão de emissão obrigatório'),
});

type NauticaFormData = z.infer<typeof nauticaSchema>;

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

export default function CnhNautica() {
  const { admin, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resultInfo, setResultInfo] = useState<{ cpf: string; senha: string } | null>(null);
  const [govbrApk, setGovbrApk] = useState('');
  const [govbrIphone, setGovbrIphone] = useState('');
  const chaPreviewRef = useRef<ChaPreviewHandle>(null);

  // Fetch download links for Gov.br (CNH Náutica uses Gov.br app)
  useState(() => {
    const fetchLinks = async () => {
      try {
        if (isUsingMySQL()) {
          const data = await mysqlApi.downloads.fetch();
          if (data) {
            setGovbrApk(data.govbr_apk || '');
            setGovbrIphone(data.govbr_iphone || '');
          }
        } else {
          const { data } = await supabase
            .from('downloads')
            .select('govbr_apk, govbr_iphone')
            .eq('id', 1)
            .maybeSingle();
          if (data) {
            setGovbrApk(data.govbr_apk || '');
            setGovbrIphone(data.govbr_iphone || '');
          }
        }
      } catch {}
    };
    fetchLinks();
  });

  const form = useForm<NauticaFormData>({
    resolver: zodResolver(nauticaSchema),
    mode: 'onChange',
    defaultValues: {
      nome: '', cpf: '', dataNascimento: '', categoria: 'ARRAIS-AMADOR', categoria2: 'NENHUMA',
      validade: '', emissao: '', numeroInscricao: '', limiteNavegacao: '',
      requisitos: '******** / ********', orgaoEmissao: 'CPSP (SP)',
    },
  });

  const handleFileUpload = (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Formato inválido. Use PNG ou JPG.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFotoPerfil(file);
      setFotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!admin) return <Navigate to="/login" replace />;

  const handleSubmit = async (data: NauticaFormData) => {
    if (!fotoPerfil) {
      toast.error('Foto é obrigatória');
      return;
    }

    setIsSubmitting(true);
    try {
      const fotoBase64 = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(fotoPerfil);
      });

      const result = await nauticaService.save({
        admin_id: admin.id,
        session_token: admin.session_token,
        nome: data.nome.toUpperCase(),
        cpf: data.cpf.replace(/\D/g, ''),
        data_nascimento: data.dataNascimento,
        categoria: data.categoria.toUpperCase(),
        validade: data.validade,
        emissao: data.emissao,
        numero_inscricao: data.numeroInscricao.toUpperCase(),
        limite_navegacao: data.limiteNavegacao.toUpperCase(),
        requisitos: (data.requisitos || '').toUpperCase(),
        orgao_emissao: data.orgaoEmissao.toUpperCase(),
        fotoBase64,
        matrizFrenteBase64: chaPreviewRef.current?.getFrenteBase64() || '',
        matrizVersoBase64: chaPreviewRef.current?.getVersoBase64() || '',
      });

      playSuccessSound();
      setResultInfo({
        cpf: data.cpf.replace(/\D/g, ''),
        senha: result.senha,
      });
      setShowSuccess(true);
    } catch (err: any) {
      if (err.status === 409) {
        toast.error(err.message || 'CPF já cadastrado neste serviço');
      } else {
        toast.error(err.message || 'Erro ao salvar CNH Náutica');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, msg = 'Copiado!') => {
    navigator.clipboard.writeText(text).then(() => toast.success(msg)).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(msg);
    });
  };

  const formatCpfDisplay = (cpf: string) => {
    const clean = cpf.replace(/\D/g, '');
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getDataText = () => {
    if (!resultInfo) return '';
    return `Olá! Segue os dados do seu acesso:\n\n📋 CPF: ${formatCpfDisplay(resultInfo.cpf)}\n🔑 Senha: ${resultInfo.senha}\n\n⚠️ O acesso é válido por 45 dias a partir da data de criação.`;
  };

  const expirationDate = (() => {
    const now = new Date();
    now.setDate(now.getDate() + 45);
    return now.toLocaleDateString('pt-BR');
  })();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Anchor className="h-5 w-5 sm:h-6 sm:w-6" /> CHA - Carteira de Habilitação de Amador
            </h1>
            <p className="text-sm text-muted-foreground">Habilitação Náutica - Arrais Amador</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Saldo: <strong className="text-foreground">{admin?.creditos ?? 0}</strong> créditos</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column - Form */}
          <div className="lg:w-[380px] flex-shrink-0 min-w-0">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="nome" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="NOME COMPLETO" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cpf" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} onChange={(e) => field.onChange(formatCPF(e.target.value))} maxLength={14} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input placeholder="DD/MM/AAAA" {...field} onChange={(e) => field.onChange(formatDate(e.target.value))} maxLength={10} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="categoria" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={(val) => {
                        field.onChange(val);
                        // Auto-fill limite de navegação para Arrais Amador
                        if (val === 'ARRAIS AMADOR') {
                          form.setValue('limiteNavegacao', 'NAVEGAÇÃO INTERIOR. QUANDO PILOTANDO MOTO AQUÁTICA, INTERIOR.');
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ARRAIS-AMADOR">ARRAIS-AMADOR</SelectItem>
                          <SelectItem value="MOTONAUTA">MOTONAUTA</SelectItem>
                          <SelectItem value="MESTRE-AMADOR">MESTRE-AMADOR</SelectItem>
                          <SelectItem value="CAPITÃO-AMADOR">CAPITÃO-AMADOR</SelectItem>
                          <SelectItem value="VELEIRO">VELEIRO</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Categoria 2 */}
                  <FormField control={form.control} name="categoria2" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria 2</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NENHUMA">NENHUMA</SelectItem>
                          <SelectItem value="MOTONAUTA">MOTONAUTA</SelectItem>
                          <SelectItem value="ARRAIS-AMADOR">ARRAIS-AMADOR</SelectItem>
                          <SelectItem value="MESTRE-AMADOR">MESTRE-AMADOR</SelectItem>
                          <SelectItem value="CAPITÃO-AMADOR">CAPITÃO-AMADOR</SelectItem>
                          <SelectItem value="VELEIRO">VELEIRO</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
               </div>

                {/* Gerar Datas Automaticamente */}
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">🗓️ Gerar Datas Automaticamente</p>
                    <p className="text-xs text-muted-foreground">Emissão aleatória a partir de 10/07/2025, Validade +10 anos</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    // Random date from 10/07/2025 to today
                    const startDate = new Date(2025, 6, 10); // 10 Jul 2025
                    const endDate = new Date();
                    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
                    const randomDate = new Date(randomTime);
                    const day = String(randomDate.getDate()).padStart(2, '0');
                    const month = String(randomDate.getMonth() + 1).padStart(2, '0');
                    const yearEm = randomDate.getFullYear();
                    const yearVal = yearEm + 10;
                    const em = `${day}/${month}/${yearEm}`;
                    const val = `${day}/${month}/${yearVal}`;
                    form.setValue('emissao', em);
                    form.setValue('validade', val);
                    toast.success(`Datas geradas: Emissão ${em} / Validade ${val}`);
                  }}>
                    <Calendar className="h-4 w-4 mr-2" /> Gerar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dados do Documento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Ship className="h-4 w-4" /> Dados da Habilitação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="numeroInscricao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Inscrição</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="381P2026XXXXXXX" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                        </FormControl>
                        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => {
                          const random = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
                          field.onChange(`381P2026${random}`);
                        }}>
                          Gerar
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="limiteNavegacao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de Navegação</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: ÁGUAS ABRIGADAS" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="emissao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Emissão</FormLabel>
                      <FormControl>
                        <Input placeholder="DD/MM/AAAA" {...field} onChange={(e) => field.onChange(formatDate(e.target.value))} maxLength={10} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="validade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validade</FormLabel>
                      <FormControl>
                        <Input placeholder="DD/MM/AAAA" {...field} onChange={(e) => field.onChange(formatDate(e.target.value))} maxLength={10} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="orgaoEmissao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local de Emissão</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o local" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Sudeste</SelectLabel>
                            <SelectItem value="CPSP (SP)">CPSP (SP)</SelectItem>
                            <SelectItem value="CPRJ (RJ)">CPRJ (RJ)</SelectItem>
                            <SelectItem value="CPES (ES)">CPES (ES)</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Sul</SelectLabel>
                            <SelectItem value="CPPR (PR)">CPPR (PR)</SelectItem>
                            <SelectItem value="CPSC (SC)">CPSC (SC)</SelectItem>
                            <SelectItem value="CPRS (RS)">CPRS (RS)</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Nordeste</SelectLabel>
                            <SelectItem value="CPBA (BA)">CPBA (BA)</SelectItem>
                            <SelectItem value="CPSE (SE)">CPSE (SE)</SelectItem>
                            <SelectItem value="CPAL (AL)">CPAL (AL)</SelectItem>
                            <SelectItem value="CPPE (PE)">CPPE (PE)</SelectItem>
                            <SelectItem value="CPPB (PB)">CPPB (PB)</SelectItem>
                            <SelectItem value="CPRN (RN)">CPRN (RN)</SelectItem>
                            <SelectItem value="CPCE (CE)">CPCE (CE)</SelectItem>
                            <SelectItem value="CPPI (PI)">CPPI (PI)</SelectItem>
                            <SelectItem value="CPMA (MA)">CPMA (MA)</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Norte/Centro-Oeste</SelectLabel>
                            <SelectItem value="CPMS (MS)">CPMS (MS)</SelectItem>
                            <SelectItem value="CPMT (MT)">CPMT (MT)</SelectItem>
                            <SelectItem value="CPGO (GO)">CPGO (GO)</SelectItem>
                            <SelectItem value="CPDF (DF)">CPDF (DF)</SelectItem>
                            <SelectItem value="CPAM (AM)">CPAM (AM)</SelectItem>
                            <SelectItem value="CPPA (PA)">CPPA (PA)</SelectItem>
                            <SelectItem value="CPAP (AP)">CPAP (AP)</SelectItem>
                            <SelectItem value="CPRO (RO)">CPRO (RO)</SelectItem>
                            <SelectItem value="CPRR (RR)">CPRR (RR)</SelectItem>
                            <SelectItem value="CPTO (TO)">CPTO (TO)</SelectItem>
                            <SelectItem value="CPAC (AC)">CPAC (AC)</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="requisitos" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisitos (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Requisitos" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            {/* Foto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Upload className="h-4 w-4" /> Foto 3x4</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-accent/30 border border-accent rounded-lg mb-4">
                  <AlertTriangle className="h-4 w-4 text-accent-foreground shrink-0" />
                  <p className="text-xs text-accent-foreground">A foto deve ter <strong>fundo branco</strong> obrigatoriamente.</p>
                </div>
                <div className="flex items-center gap-4">
                  {fotoPreview && (
                    <img src={fotoPreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover border" />
                  )}
                  <label className="flex-1 flex items-center gap-3 px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{fotoPerfil ? fotoPerfil.name : 'Selecionar foto'}</p>
                      <p className="text-xs text-muted-foreground">PNG ou JPG - Fundo branco</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full h-12" disabled={isSubmitting || (admin?.creditos ?? 0) <= 0}>
              {isSubmitting ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processando...</>
              ) : (
                <><Anchor className="h-5 w-5 mr-2" /> Gerar CHA (1 crédito)</>
              )}
            </Button>
          </form>
        </Form>
        </div>

          {/* Right column - Preview */}
          <div className="flex-1 min-w-0">
            <div className="lg:sticky lg:top-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Eye className="h-4 w-4" /> Pré-visualização</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChaPreview
                    ref={chaPreviewRef}
                    nome={form.watch('nome')}
                    cpf={form.watch('cpf')}
                    dataNascimento={form.watch('dataNascimento')}
                    categoria={form.watch('categoria')}
                    categoria2={form.watch('categoria2') || ''}
                    validade={form.watch('validade')}
                    emissao={form.watch('emissao')}
                    numeroInscricao={form.watch('numeroInscricao')}
                    limiteNavegacao={form.watch('limiteNavegacao')}
                    requisitos={form.watch('requisitos') || ''}
                    orgaoEmissao={form.watch('orgaoEmissao')}
                    fotoPreview={fotoPreview}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={(open) => { if (!open) setShowSuccess(false); }}>
        <DialogContent className="max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <span>CNH Náutica Gerada!</span>
                <div className="text-sm text-muted-foreground mt-1">Habilitação Náutica pronta para uso</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {resultInfo && (
              <>
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Dados de Acesso</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span className="text-muted-foreground">CPF:</span>
                      </div>
                      <span className="font-mono font-semibold">{formatCpfDisplay(resultInfo.cpf)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span>🔑</span>
                        <span className="text-muted-foreground">Senha:</span>
                      </div>
                      <span className="font-mono font-semibold">{resultInfo.senha}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold">Validade: 45 dias</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Expira em: <strong>{expirationDate}</strong></p>
                </div>

                <div className="space-y-3">
                  <Button onClick={() => copyToClipboard(getDataText(), 'Dados copiados!')} className="w-full" variant="outline">
                    <Copy className="w-4 h-4 mr-2" /> Copiar Dados
                  </Button>
                  <Button onClick={() => {
                    if (!govbrIphone) { toast.error('Link iPhone não configurado'); return; }
                    copyToClipboard(govbrIphone, 'Link iPhone copiado!');
                  }} variant="outline" className="w-full">
                    <Apple className="w-4 h-4 mr-2" /> Copiar Link iPhone
                  </Button>
                  <Button onClick={() => {
                    if (!govbrApk) { toast.error('Link APK não configurado'); return; }
                    copyToClipboard(govbrApk, 'Link APK copiado!');
                  }} variant="outline" className="w-full">
                    <Smartphone className="w-4 h-4 mr-2" /> Copiar Link Android
                  </Button>
                </div>

                <Button className="w-full" onClick={() => {
                  setShowSuccess(false);
                  form.reset();
                  setFotoPerfil(null);
                  setFotoPreview(null);
                }}>
                  Criar Outra CNH Náutica
                </Button>
              </>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowSuccess(false)} variant="outline">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
