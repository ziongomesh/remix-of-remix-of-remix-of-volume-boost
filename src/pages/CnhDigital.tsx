import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, User, ClipboardList, CreditCard, Upload, Shuffle, Loader2 } from 'lucide-react';

const UF_OPTIONS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
];

const NATIONALITY_OPTIONS = [
  'BRASILEIRO(A)', 'ESTRANGEIRO(A)'
];

const CATEGORIA_OPTIONS = [
  'A', 'B', 'AB', 'C', 'D', 'E', 'AC', 'AD', 'AE'
];

const OBS_OPTIONS = ['EAR', '99', 'MOPP', '15', 'A', 'D', 'E', 'F'];

function generateRandom(length: number, type: 'numeric' | 'alphanumeric' = 'numeric') {
  if (type === 'numeric') {
    let result = '';
    for (let i = 0; i < length; i++) result += Math.floor(Math.random() * 10);
    return result;
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function generateRenach(uf: string) {
  return `${uf || 'SP'}${generateRandom(9)}`;
}

interface FileUploadProps {
  label: string;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
}

function FileUpload({ label, accept = 'image/png, image/jpeg, image/jpg', value, onChange }: FileUploadProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
        {value ? (
          <div className="text-sm text-primary font-medium text-center px-2 truncate max-w-full">
            {value.name}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <span className="text-sm">Clique para upload</span>
            <span className="text-xs">PNG, JPG, JPEG até 10MB</span>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}

export default function CnhDigital() {
  const { admin, role, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [cpf, setCpf] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [uf, setUf] = useState('');
  const [genero, setGenero] = useState('');
  const [nacionalidade, setNacionalidade] = useState('');
  const [dataNascimentoLocal, setDataNascimentoLocal] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [assinatura, setAssinatura] = useState<File | null>(null);

  // Seção 2
  const [registroCnh, setRegistroCnh] = useState('');
  const [categoriaCnh, setCategoriaCnh] = useState('');
  const [cnhDefinitiva, setCnhDefinitiva] = useState('');
  const [dataPrimeiraHab, setDataPrimeiraHab] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [cidadeEstado, setCidadeEstado] = useState('');
  const [estadoExtenso, setEstadoExtenso] = useState('');
  const [zonaLeitura, setZonaLeitura] = useState('');
  const [rg, setRg] = useState('');
  const [codigoSeguranca, setCodigoSeguranca] = useState('');
  const [renach, setRenach] = useState('');

  // Seção 3
  const [espelhoCnh, setEspelhoCnh] = useState('');
  const [observacoes, setObservacoes] = useState<string[]>([]);
  const [nomePai, setNomePai] = useState('');
  const [nomeMae, setNomeMae] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  const formatCPF = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 11);
    return nums
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleObsToggle = (obs: string) => {
    setObservacoes(prev =>
      prev.includes(obs) ? prev.filter(o => o !== obs) : [...prev, obs]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf || !nomeCompleto) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: integrate with API to create CNH
      toast.success('CNH Digital criada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar CNH', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CNH Digital 2026</h1>
          <p className="text-muted-foreground">Preencha os dados para gerar a CNH Digital</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CPF Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="space-y-2 max-w-sm">
                <Label>CPF <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  maxLength={14}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 3 Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seção 1 - Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Seção 1
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Ex: PEDRO DA SILVA GOMES"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>UF <span className="text-destructive">*</span></Label>
                    <Select value={uf} onValueChange={setUf}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {UF_OPTIONS.map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gênero <span className="text-destructive">*</span></Label>
                    <Select value={genero} onValueChange={setGenero}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map(g => (
                          <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nacionalidade <span className="text-destructive">*</span></Label>
                  <Select value={nacionalidade} onValueChange={setNacionalidade}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {NATIONALITY_OPTIONS.map(n => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data de Nascimento / Local <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Ex: 12/02/2000, RIO DE JANEIRO"
                    value={dataNascimentoLocal}
                    onChange={(e) => setDataNascimentoLocal(e.target.value)}
                  />
                </div>

                <FileUpload
                  label="Foto de Perfil"
                  value={fotoPerfil}
                  onChange={setFotoPerfil}
                />

                <FileUpload
                  label="Assinatura Digital"
                  value={assinatura}
                  onChange={setAssinatura}
                />
              </CardContent>
            </Card>

            {/* Seção 2 - Dados da CNH */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-4 w-4" />
                  Seção 2
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Registro da CNH (11 dígitos) <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="00397731618"
                      value={registroCnh}
                      onChange={(e) => setRegistroCnh(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRegistroCnh(generateRandom(11))}
                      className="shrink-0"
                    >
                      <Shuffle className="h-4 w-4 mr-1" /> Gerar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Categoria da CNH <span className="text-destructive">*</span></Label>
                    <Select value={categoriaCnh} onValueChange={setCategoriaCnh}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIA_OPTIONS.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>CNH Definitiva? <span className="text-destructive">*</span></Label>
                    <Select value={cnhDefinitiva} onValueChange={setCnhDefinitiva}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Data de 1ª Habilitação</Label>
                  <Input
                    placeholder="DD/MM/AAAA"
                    value={dataPrimeiraHab}
                    onChange={(e) => setDataPrimeiraHab(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Data de Emissão <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="DD/MM/AAAA"
                      value={dataEmissao}
                      onChange={(e) => setDataEmissao(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Validade <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="DD/MM/AAAA"
                      value={dataValidade}
                      onChange={(e) => setDataValidade(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cidade / Estado da CNH <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="RIO DE JANEIRO, RJ"
                    value={cidadeEstado}
                    onChange={(e) => setCidadeEstado(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado por Extenso <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Ex: MINAS GERAIS"
                    value={estadoExtenso}
                    onChange={(e) => setEstadoExtenso(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Zona de Leitura Óptica <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="FELIPE<<DA<<SILVA<<<<<<"
                    value={zonaLeitura}
                    onChange={(e) => setZonaLeitura(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-2">
                  <Label>RG <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: 3674826 SSP AL"
                      value={rg}
                      onChange={(e) => setRg(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRg(`${generateRandom(7)} SSP ${uf || 'SP'}`)}
                      className="shrink-0"
                    >
                      <Shuffle className="h-4 w-4 mr-1" /> Gerar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Código de Segurança <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: 96972197"
                      value={codigoSeguranca}
                      onChange={(e) => setCodigoSeguranca(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCodigoSeguranca(generateRandom(8))}
                      className="shrink-0"
                    >
                      <Shuffle className="h-4 w-4 mr-1" /> Gerar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>RENACH <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: SC9756977"
                      value={renach}
                      onChange={(e) => setRenach(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRenach(generateRenach(uf))}
                      className="shrink-0"
                    >
                      <Shuffle className="h-4 w-4 mr-1" /> Gerar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção 3 - Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Seção 3
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nº do espelho da CNH <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="32131277"
                      value={espelhoCnh}
                      onChange={(e) => setEspelhoCnh(e.target.value.replace(/\D/g, ''))}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEspelhoCnh(generateRandom(8))}
                      className="shrink-0"
                    >
                      <Shuffle className="h-4 w-4 mr-1" /> Gerar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {OBS_OPTIONS.map(obs => (
                      <div key={obs} className="flex items-center space-x-2">
                        <Checkbox
                          id={`obs-${obs}`}
                          checked={observacoes.includes(obs)}
                          onCheckedChange={() => handleObsToggle(obs)}
                        />
                        <label htmlFor={`obs-${obs}`} className="text-sm cursor-pointer">
                          {obs}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Input
                    placeholder="Selecionadas aparecem aqui"
                    value={observacoes.join(', ')}
                    readOnly
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nome Pai</Label>
                  <Input
                    placeholder="Ex: PEDRO DA SILVA GOMES"
                    value={nomePai}
                    onChange={(e) => setNomePai(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nome Mãe</Label>
                  <Input
                    placeholder="Ex: MARIA DA SILVA GOMES"
                    value={nomeMae}
                    onChange={(e) => setNomeMae(e.target.value.toUpperCase())}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[200px]">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar CNH Digital
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
