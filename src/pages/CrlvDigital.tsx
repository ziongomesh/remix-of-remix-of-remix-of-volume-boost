import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Car, User, Loader2, ArrowLeft, Shuffle, Wrench, FileText, Eye, ClipboardList
} from 'lucide-react';
import {
  generateRenavam, generatePlaca, generateNumeroCRV, generateSegurancaCRV,
  generateCodSegCLA, generateChassi, generateMotor, formatCPF,
  CATEGORIAS_VEICULO, COMBUSTIVEIS, CORES_VEICULO, ESPECIES_TIPO, CARROCERIAS,
} from '@/lib/crlv-utils';
import { crlvService } from '@/lib/crlv-service';
import { Link } from 'react-router-dom';

// Schema
const crlvFormSchema = z.object({
  // 1. Identificação
  renavam: z.string().min(8, 'Renavam obrigatório'),
  placa: z.string().min(7, 'Placa obrigatória'),
  exercicio: z.string().min(4, 'Exercício obrigatório'),
  numeroCrv: z.string().min(5, 'Número CRV obrigatório'),
  segurancaCrv: z.string().min(5, 'Segurança CRV obrigatória'),
  codSegCla: z.string().min(5, 'Cód. Seg CLA obrigatório'),
  // 2. Características
  marcaModelo: z.string().min(3, 'Marca/Modelo obrigatório'),
  anoFab: z.string().min(4, 'Ano fabricação obrigatório'),
  anoMod: z.string().min(4, 'Ano modelo obrigatório'),
  cor: z.string().min(2, 'Cor obrigatória'),
  combustivel: z.string().min(2, 'Combustível obrigatório'),
  especieTipo: z.string().min(2, 'Espécie/Tipo obrigatório'),
  categoria: z.string().min(2, 'Categoria obrigatória'),
  catObs: z.string().optional(),
  carroceria: z.string().min(2, 'Carroceria obrigatória'),
  // 3. Especificações técnicas
  chassi: z.string().min(10, 'Chassi obrigatório'),
  placaAnt: z.string().optional(),
  potenciaCil: z.string().min(2, 'Potência/Cil obrigatório'),
  capacidade: z.string().min(1, 'Capacidade obrigatória'),
  lotacao: z.string().min(1, 'Lotação obrigatória'),
  pesoBruto: z.string().min(1, 'Peso bruto obrigatório'),
  motor: z.string().min(3, 'Motor obrigatório'),
  cmt: z.string().min(1, 'CMT obrigatório'),
  eixos: z.string().min(1, 'Eixos obrigatório'),
  // 4. Proprietário
  nomeProprietario: z.string().min(3, 'Nome obrigatório'),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ obrigatório'),
  local: z.string().min(3, 'Local obrigatório'),
  data: z.string().min(8, 'Data obrigatória'),
  // 5. Observações
  observacoes: z.string().optional(),
});

type CrlvFormData = z.infer<typeof crlvFormSchema>;

// Auto-generate button
function AutoButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" size="sm" variant="default" className="h-8 px-3 text-xs font-semibold" onClick={onClick}>
      AUTO
    </Button>
  );
}

export default function CrlvDigital() {
  const { admin, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CrlvFormData>({
    resolver: zodResolver(crlvFormSchema),
    mode: 'onChange',
    defaultValues: {
      renavam: '', placa: '', exercicio: new Date().getFullYear().toString(),
      numeroCrv: '', segurancaCrv: '', codSegCla: '',
      marcaModelo: '', anoFab: '', anoMod: '', cor: '', combustivel: '',
      especieTipo: '', categoria: '', catObs: '', carroceria: '',
      chassi: '', placaAnt: '', potenciaCil: '', capacidade: '', lotacao: '',
      pesoBruto: '', motor: '', cmt: '', eixos: '',
      nomeProprietario: '', cpfCnpj: '',
      local: '', data: new Date().toLocaleDateString('pt-BR'),
      observacoes: 'SEM RESERVA',
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  const handleSave = async (data: CrlvFormData) => {
    setIsSubmitting(true);
    try {
      const result = await crlvService.save({
        admin_id: admin.id,
        session_token: admin.session_token || '',
        renavam: data.renavam,
        placa: data.placa,
        exercicio: data.exercicio,
        numero_crv: data.numeroCrv,
        seguranca_crv: data.segurancaCrv,
        cod_seg_cla: data.codSegCla,
        marca_modelo: data.marcaModelo,
        ano_fab: data.anoFab,
        ano_mod: data.anoMod,
        cor: data.cor,
        combustivel: data.combustivel,
        especie_tipo: data.especieTipo,
        categoria: data.categoria,
        cat_obs: data.catObs || '',
        carroceria: data.carroceria,
        chassi: data.chassi,
        placa_ant: data.placaAnt || '',
        potencia_cil: data.potenciaCil,
        capacidade: data.capacidade,
        lotacao: data.lotacao,
        peso_bruto: data.pesoBruto,
        motor: data.motor,
        cmt: data.cmt,
        eixos: data.eixos,
        nome_proprietario: data.nomeProprietario,
        cpf_cnpj: data.cpfCnpj,
        local: data.local,
        data: data.data,
        observacoes: data.observacoes || '',
      });

      if (result.success) {
        toast.success('CRLV gerado com sucesso!');
        form.reset();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar CRLV');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/servicos">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              CRLV Digital 2026
            </h1>
            <p className="text-muted-foreground text-sm">Preencha os dados do veículo</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            {/* 1. IDENTIFICAÇÃO DO VEÍCULO */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-4 w-4 text-primary" />
                  1. IDENTIFICAÇÃO DO VEÍCULO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="renavam" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renavam</FormLabel>
                      <div className="flex gap-2">
                        <FormControl><Input placeholder="Ex: 12345678901" {...field} /></FormControl>
                        <AutoButton onClick={() => form.setValue('renavam', generateRenavam())} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="placa" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa</FormLabel>
                      <div className="flex gap-2">
                        <FormControl><Input placeholder="ABC1D23" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                        <AutoButton onClick={() => form.setValue('placa', generatePlaca())} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="exercicio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercício</FormLabel>
                      <FormControl><Input placeholder="2026" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="numeroCrv" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do CRV</FormLabel>
                      <div className="flex gap-2">
                        <FormControl><Input placeholder="Ex: 1234567890" {...field} /></FormControl>
                        <AutoButton onClick={() => form.setValue('numeroCrv', generateNumeroCRV())} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="segurancaCrv" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segurança CRV</FormLabel>
                      <div className="flex gap-2">
                        <FormControl><Input placeholder="Igual ao CRV" {...field} /></FormControl>
                        <AutoButton onClick={() => form.setValue('segurancaCrv', generateSegurancaCRV())} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="codSegCla" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cód. Seg CLA</FormLabel>
                      <div className="flex gap-2">
                        <FormControl><Input placeholder="Ex: 98765432100" {...field} /></FormControl>
                        <AutoButton onClick={() => form.setValue('codSegCla', generateCodSegCLA())} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            {/* 2. CARACTERÍSTICAS */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  2. CARACTERÍSTICAS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="marcaModelo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca / Modelo</FormLabel>
                    <FormControl><Input placeholder="Ex: I/TOYOTA HILUX CDSRXA4FD" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormField control={form.control} name="anoFab" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano Fab</FormLabel>
                      <FormControl><Input placeholder="2025" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="anoMod" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano Mod</FormLabel>
                      <FormControl><Input placeholder="2026" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CORES_VEICULO.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="combustivel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Combustível</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMBUSTIVEIS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="especieTipo" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Espécie / Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ESPECIES_TIPO.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="categoria" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIAS_VEICULO.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="catObs" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CAT (*.*)</FormLabel>
                      <FormControl><Input placeholder="*.*" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="carroceria" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carroceria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CARROCERIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* 3. ESPECIFICAÇÕES TÉCNICAS */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  3. ESPECIFICAÇÕES TÉCNICAS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="chassi" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chassi</FormLabel>
                      <div className="flex gap-2">
                        <FormControl><Input placeholder="Ex: 9B..." {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                        <AutoButton onClick={() => form.setValue('chassi', generateChassi())} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="placaAnt" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa Ant.</FormLabel>
                      <FormControl><Input placeholder="Opcional" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormField control={form.control} name="potenciaCil" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potência/Cil</FormLabel>
                      <FormControl><Input placeholder="177CV / 2755CC" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="capacidade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade</FormLabel>
                      <FormControl><Input placeholder="1.00T" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lotacao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lotação</FormLabel>
                      <FormControl><Input placeholder="05" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pesoBruto" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso Bruto</FormLabel>
                      <FormControl><Input placeholder="3.090 KG" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="motor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motor</FormLabel>
                      <div className="flex gap-2">
                        <FormControl><Input placeholder="Ex: 1GDFTV..." {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                        <AutoButton onClick={() => form.setValue('motor', generateMotor())} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cmt" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CMT</FormLabel>
                      <FormControl><Input placeholder="006.50 T" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="eixos" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eixos</FormLabel>
                      <FormControl><Input placeholder="02" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            {/* 4. PROPRIETÁRIO */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  4. PROPRIETÁRIO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="nomeProprietario" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Proprietário</FormLabel>
                      <FormControl><Input placeholder="NOME COMPLETO" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cpfCnpj" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          {...field}
                          onChange={(e) => field.onChange(formatCPF(e.target.value))}
                          maxLength={18}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="local" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local</FormLabel>
                      <FormControl><Input placeholder="SAO PAULO SP" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="data" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl><Input placeholder="09/02/2026" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            {/* 5. OBSERVAÇÕES */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  5. OBSERVAÇÕES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField control={form.control} name="observacoes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações do Veículo</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: SEM RESERVA" className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Link to="/servicos">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Gerando...</>
                ) : (
                  <><Car className="h-4 w-4 mr-2" /> Gerar CRLV</>
                )}
              </Button>
            </div>
          </form>
        </Form>

      </div>
    </DashboardLayout>
  );
}
