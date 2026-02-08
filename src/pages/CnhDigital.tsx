import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IdCard, User, ClipboardList, CreditCard, Upload, Shuffle, Loader2, HelpCircle, Eye, ArrowLeft
} from 'lucide-react';
import {
  BRAZILIAN_STATES, CNH_CATEGORIES, CNH_OBSERVACOES,
  generateRegistroCNH, generateEspelhoNumber, generateCodigoSeguranca,
  generateRenach, generateMRZ, getStateFullName, getStateCapital,
  generateRGByState, formatCPF, formatDate
} from '@/lib/cnh-utils';
import CnhPreview from '@/components/cnh/CnhPreview';

// Zod Schema
const cnhFormSchema = z.object({
  cpf: z.string().min(14, 'CPF inválido'),
  nome: z.string().min(3, 'Nome obrigatório'),
  uf: z.string().min(2, 'Selecione o UF'),
  sexo: z.string().min(1, 'Selecione o gênero'),
  nacionalidade: z.string().min(1, 'Selecione a nacionalidade'),
  dataNascimento: z.string().min(8, 'Informe a data de nascimento e local'),
  numeroRegistro: z.string().min(11, 'Registro deve ter 11 dígitos'),
  categoria: z.string().min(1, 'Selecione a categoria'),
  cnhDefinitiva: z.string().min(1, 'Selecione'),
  hab: z.string().min(10, 'Informe a data da 1ª habilitação'),
  dataEmissao: z.string().min(10, 'Informe a data de emissão'),
  dataValidade: z.string().min(10, 'Informe a data de validade'),
  localEmissao: z.string().min(3, 'Informe cidade/estado'),
  estadoExtenso: z.string().min(3, 'Informe o estado por extenso'),
  matrizFinal: z.string().optional(),
  docIdentidade: z.string().min(5, 'Informe o RG'),
  codigo_seguranca: z.string().min(8, 'Código de segurança obrigatório'),
  renach: z.string().min(9, 'RENACH obrigatório'),
  espelho: z.string().min(8, 'Nº do espelho obrigatório'),
  obs: z.string().optional(),
  pai: z.string().optional(),
  mae: z.string().optional(),
});

type CnhFormData = z.infer<typeof cnhFormSchema>;

// Tooltip helper
function WhereIsTooltip({ description }: { description: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-primary cursor-help font-semibold text-xs ml-1">Onde fica?</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// File Upload component
function FileUploadField({ label, value, onChange }: {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
        {value ? (
          <div className="text-center px-2">
            <p className="text-sm text-primary font-medium truncate max-w-full">{value.name}</p>
            <p className="text-xs text-muted-foreground">{Math.round(value.size / 1024)}KB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <span className="text-xs">Clique para upload</span>
            <span className="text-[10px]">PNG, JPG até 10MB</span>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/jpg"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}

export default function CnhDigital() {
  const { admin, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [assinatura, setAssinatura] = useState<File | null>(null);
  const [selectedObs, setSelectedObs] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [cnhPreviewData, setCnhPreviewData] = useState<any>(null);

  const form = useForm<CnhFormData>({
    resolver: zodResolver(cnhFormSchema),
    mode: 'onChange',
    defaultValues: {
      cpf: '', nome: '', uf: '', sexo: '', nacionalidade: '',
      dataNascimento: '', numeroRegistro: '', categoria: '', cnhDefinitiva: '',
      hab: '', dataEmissao: '', dataValidade: '', localEmissao: '',
      estadoExtenso: '', matrizFinal: '', docIdentidade: '', codigo_seguranca: '',
      renach: '', espelho: '', obs: '', pai: '', mae: '',
    },
  });

  // Auto MRZ when nome changes
  useEffect(() => {
    const sub = form.watch((value, { name }) => {
      if (name === 'nome' && value.nome) {
        form.setValue('matrizFinal', generateMRZ(value.nome));
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  // Auto estado extenso + cidade when UF changes
  useEffect(() => {
    const sub = form.watch((value, { name }) => {
      if (name === 'uf' && value.uf) {
        form.setValue('estadoExtenso', getStateFullName(value.uf));
        form.setValue('localEmissao', getStateCapital(value.uf));
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  const handleObsToggle = (obs: string) => {
    const newObs = selectedObs.includes(obs)
      ? selectedObs.filter(o => o !== obs)
      : [...selectedObs, obs];
    setSelectedObs(newObs);
    form.setValue('obs', newObs.join(', '));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  const handleGeneratePreview = async (data: CnhFormData) => {
    if (!fotoPerfil) {
      toast.error('Foto de perfil é obrigatória');
      return;
    }
    if (!assinatura) {
      toast.error('Assinatura digital é obrigatória');
      return;
    }

    const previewData = {
      ...data,
      foto: fotoPerfil,
      assinatura: assinatura,
    };

    setCnhPreviewData(previewData);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setCnhPreviewData(null);
  };

  const handleEditFromPreview = () => {
    setShowPreview(false);
  };

  const handleSaveSuccess = () => {
    form.reset();
    setFotoPerfil(null);
    setAssinatura(null);
    setSelectedObs([]);
  };

  // Se estiver mostrando o preview
  if (showPreview && cnhPreviewData) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-6xl">
          {/* Progress indicator */}
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

          <CnhPreview
            cnhData={cnhPreviewData}
            onClose={handleClosePreview}
            onEdit={handleEditFromPreview}
            onSaveSuccess={handleSaveSuccess}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CNH Digital 2026</h1>
            <p className="text-muted-foreground">Preencha os dados para gerar a CNH Digital</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Saldo: <strong className="text-foreground">{admin?.creditos ?? 0}</strong> créditos</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-4 bg-card rounded-full px-6 py-3 border w-fit mx-auto">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">1</div>
            <span className="text-sm font-medium">Preencher</span>
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted">2</div>
            <span className="text-sm font-medium">Visualizar</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGeneratePreview)} className="space-y-6">
            {/* CPF Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IdCard className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem className="max-w-sm">
                      <FormLabel>CPF <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          onChange={(e) => field.onChange(formatCPF(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 3 Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SEÇÃO 1 - Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" /> Seção 1
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="nome" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: PEDRO DA SILVA GOMES"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^A-ZÁÀÂÃÇÉÊÍÓÔÕÚÜ\s]/g, ''))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="uf" render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {BRAZILIAN_STATES.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="sexo" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="nacionalidade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nacionalidade <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="brasileiro">Brasileiro</SelectItem>
                          <SelectItem value="estrangeiro">Estrangeiro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento / Local <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="EX: 12/02/2000, RIO DE JANEIRO"
                          onChange={(e) => {
                            let value = e.target.value;
                            let dateSection = value.slice(0, 10);
                            let locationSection = value.slice(10);
                            let dateOnly = dateSection.replace(/\D/g, '');
                            if (dateOnly.length >= 2) dateOnly = dateOnly.slice(0, 2) + '/' + dateOnly.slice(2);
                            if (dateOnly.length >= 5) dateOnly = dateOnly.slice(0, 5) + '/' + dateOnly.slice(5, 9);
                            let fullValue = dateOnly + locationSection.toUpperCase();
                            fullValue = fullValue.replace(/[^A-ZÁÀÂÃÇÉÊÍÓÔÕÚÜ0-9\s,\/]/g, '');
                            field.onChange(fullValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FileUploadField label="Foto de Perfil *" value={fotoPerfil} onChange={setFotoPerfil} />
                  <FileUploadField label="Assinatura Digital *" value={assinatura} onChange={setAssinatura} />
                </CardContent>
              </Card>

              {/* SEÇÃO 2 - Dados da CNH */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-4 w-4" /> Seção 2
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="numeroRegistro" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Registro da CNH (11 dígitos) <span className="text-destructive">*</span></FormLabel>
                        <WhereIsTooltip description="Número que aparece no campo '5 Nº REGISTRO' da CNH." />
                      </div>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input {...field} placeholder="00397731618" maxLength={11}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))} className="flex-1" />
                          <Button type="button" variant="outline" size="sm" onClick={() => form.setValue('numeroRegistro', generateRegistroCNH())} className="shrink-0">
                            <Shuffle className="h-4 w-4 mr-1" /> Gerar
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="categoria" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {CNH_CATEGORIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="cnhDefinitiva" render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNH Definitiva? <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="hab" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de 1ª Habilitação <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="DD/MM/AAAA" maxLength={10}
                          onChange={(e) => field.onChange(formatDate(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="dataEmissao" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Emissão <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="DD/MM/AAAA" maxLength={10}
                            onChange={(e) => field.onChange(formatDate(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dataValidade" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Validade <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="DD/MM/AAAA" maxLength={10}
                            onChange={(e) => field.onChange(formatDate(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="localEmissao" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Cidade / Estado <span className="text-destructive">*</span></FormLabel>
                        <WhereIsTooltip description="Cidade e estado onde a CNH foi emitida." />
                      </div>
                      <FormControl>
                        <Input {...field} placeholder="RIO DE JANEIRO, RJ"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^A-ZÁÀÂÃÇÉÊÍÓÔÕÚÜ0-9\s,\/]/g, ''))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="estadoExtenso" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Estado por Extenso <span className="text-destructive">*</span></FormLabel>
                        <WhereIsTooltip description="Nome completo do estado na parte inferior da CNH." />
                      </div>
                      <FormControl>
                        <Input {...field} placeholder="Ex: MINAS GERAIS"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^A-ZÁÀÂÃÇÉÊÍÓÔÕÚÜ\s]/g, ''))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="matrizFinal" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Zona de Leitura Óptica (MRZ)</FormLabel>
                        <WhereIsTooltip description="Código na parte inferior da CNH. Gerado automaticamente." />
                      </div>
                      <FormControl>
                        <Input {...field} placeholder="FELIPE<<DA<<SILVA<<<<<<"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^A-ZÁÀÂÃÇÉÊÍÓÔÕÚÜ\s<]/g, ''))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="docIdentidade" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>RG <span className="text-destructive">*</span></FormLabel>
                        <Button type="button" variant="outline" size="sm" className="h-6 text-xs"
                          onClick={() => {
                            const uf = form.getValues('uf');
                            if (!uf) { toast.error('Selecione o UF primeiro'); return; }
                            form.setValue('docIdentidade', generateRGByState(uf));
                          }}>
                          <Shuffle className="h-3 w-3 mr-1" /> Gerar
                        </Button>
                      </div>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 3674826 SSP AL"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9\s\/]/g, ''))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="codigo_seguranca" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Código de Segurança <span className="text-destructive">*</span></FormLabel>
                        <WhereIsTooltip description="Código numérico na lateral direita da CNH." />
                      </div>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input {...field} placeholder="Ex: 96972197651" maxLength={11}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))} className="flex-1" />
                          <Button type="button" variant="outline" size="sm" onClick={() => form.setValue('codigo_seguranca', generateCodigoSeguranca())} className="shrink-0">
                            <Shuffle className="h-4 w-4 mr-1" /> Gerar
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="renach" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>RENACH <span className="text-destructive">*</span></FormLabel>
                        <WhereIsTooltip description="Código RENACH na lateral direita da CNH." />
                      </div>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input {...field} placeholder="Ex: SC975697214" maxLength={11}
                            onChange={(e) => {
                              let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                              if (v.length > 2) {
                                const letters = v.slice(0, 2).replace(/[^A-Z]/g, '');
                                const numbers = v.slice(2).replace(/\D/g, '');
                                v = letters + numbers;
                              }
                              field.onChange(v);
                            }} className="flex-1" />
                          <Button type="button" variant="outline" size="sm" className="shrink-0"
                            onClick={() => {
                              const uf = form.getValues('uf');
                              if (!uf) { toast.error('Selecione o UF primeiro'); return; }
                              form.setValue('renach', generateRenach(uf));
                            }}>
                            <Shuffle className="h-4 w-4 mr-1" /> Gerar
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* SEÇÃO 3 - Informações Adicionais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4" /> Seção 3
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="espelho" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Nº do espelho <span className="text-destructive">*</span></FormLabel>
                        <WhereIsTooltip description="Número do espelho na parte superior da CNH." />
                      </div>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input {...field} placeholder="32131277" maxLength={10}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))} className="flex-1" />
                          <Button type="button" variant="outline" size="sm" onClick={() => form.setValue('espelho', generateEspelhoNumber())} className="shrink-0">
                            <Shuffle className="h-4 w-4 mr-1" /> Gerar
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FormLabel>Observações</FormLabel>
                      <WhereIsTooltip description="Restrições da CNH. Ex: EAR, A (Óculos), etc." />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {CNH_OBSERVACOES.map(obs => (
                        <div key={obs} className="flex items-center space-x-2">
                          <Checkbox
                            id={`obs-${obs}`}
                            checked={selectedObs.includes(obs)}
                            onCheckedChange={() => handleObsToggle(obs)}
                          />
                          <label htmlFor={`obs-${obs}`} className="text-sm cursor-pointer">{obs}</label>
                        </div>
                      ))}
                    </div>
                    <Input
                      placeholder="Selecionadas aparecem aqui"
                      value={selectedObs.join(', ')}
                      readOnly
                      className="mt-2 bg-muted"
                    />
                  </div>

                  <FormField control={form.control} name="pai" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Pai</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: PEDRO DA SILVA GOMES"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^A-ZÁÀÂÃÇÉÊÍÓÔÕÚÜ\s]/g, ''))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="mae" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Mãe</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: MARIA DA SILVA GOMES"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^A-ZÁÀÂÃÇÉÊÍÓÔÕÚÜ\s]/g, ''))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            {/* Submit - Gerar Preview */}
            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[200px]">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                Gerar Preview da CNH
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
