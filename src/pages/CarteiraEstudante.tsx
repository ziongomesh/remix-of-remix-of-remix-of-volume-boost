import { useState } from 'react';
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
  GraduationCap, User, CreditCard, Upload, Loader2, Copy, CheckCircle, AlertTriangle
} from 'lucide-react';
import { estudanteService } from '@/lib/estudante-service';
import { playSuccessSound } from '@/lib/success-sound';

const estudanteSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  cpf: z.string().min(14, 'CPF inválido'),
  rg: z.string().min(1, 'RG obrigatório'),
  dataNascimento: z.string().min(10, 'Data obrigatória'),
  faculdade: z.string().min(1, 'Faculdade obrigatória'),
  graduacao: z.string().min(1, 'Graduação obrigatória'),
});

type EstudanteFormData = z.infer<typeof estudanteSchema>;

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

export default function CarteiraEstudante() {
  const { admin, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resultInfo, setResultInfo] = useState<{ cpf: string; senha: string; qrcode: string | null } | null>(null);

  const form = useForm<EstudanteFormData>({
    resolver: zodResolver(estudanteSchema),
    mode: 'onChange',
    defaultValues: {
      nome: '', cpf: '', rg: '', dataNascimento: '', faculdade: '', graduacao: '',
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

  const handleSubmit = async (data: EstudanteFormData) => {
    if (!fotoPerfil) {
      toast.error('Foto de perfil é obrigatória');
      return;
    }

    setIsSubmitting(true);
    try {
      let fotoBase64 = '';
      fotoBase64 = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(fotoPerfil);
      });

      const convertDate = (d: string) => {
        const [day, month, year] = d.split('/');
        return `${year}-${month}-${day}`;
      };

      const result = await estudanteService.save({
        admin_id: admin.id,
        session_token: admin.session_token,
        nome: data.nome.toUpperCase(),
        cpf: data.cpf.replace(/\D/g, ''),
        rg: data.rg.toUpperCase(),
        data_nascimento: convertDate(data.dataNascimento),
        faculdade: data.faculdade.toUpperCase(),
        graduacao: data.graduacao.toUpperCase(),
        fotoBase64,
      });

      playSuccessSound();
      setResultInfo({
        cpf: data.cpf.replace(/\D/g, ''),
        senha: result.senha,
        qrcode: result.qrcode,
      });
      setShowSuccess(true);
    } catch (err: any) {
      if (err.status === 409) {
        toast.error(err.message || 'CPF já cadastrado neste serviço');
      } else {
        toast.error(err.message || 'Erro ao salvar Carteira Estudante');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Carteira de Estudante</h1>
            <p className="text-sm text-muted-foreground">ABAFE - Preencha os dados do estudante</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Saldo: <strong className="text-foreground">{admin?.creditos ?? 0}</strong> créditos</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Dados do Estudante</CardTitle>
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
                  <FormField control={form.control} name="rg" render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="Número do RG" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
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
                </div>
              </CardContent>
            </Card>

            {/* Dados Acadêmicos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><GraduationCap className="h-4 w-4" /> Dados Acadêmicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="faculdade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculdade / Instituição</FormLabel>
                      <FormControl>
                        <Input placeholder="UNIVERSIDADE..." {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="graduacao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduação / Curso</FormLabel>
                      <FormControl>
                        <Input placeholder="ENGENHARIA, DIREITO..." {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
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
                <CardTitle className="flex items-center gap-2 text-base"><Upload className="h-4 w-4" /> Foto do Estudante</CardTitle>
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
                <><GraduationCap className="h-5 w-5 mr-2" /> Gerar Carteira de Estudante (1 crédito)</>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" /> Carteira Gerada com Sucesso!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {resultInfo && (
              <>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CPF:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{resultInfo.cpf}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(resultInfo.cpf)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Senha:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary">{resultInfo.senha}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(resultInfo.senha)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  setShowSuccess(false);
                  form.reset();
                  setFotoPerfil(null);
                  setFotoPreview(null);
                }}>
                  Criar Outra Carteira
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
