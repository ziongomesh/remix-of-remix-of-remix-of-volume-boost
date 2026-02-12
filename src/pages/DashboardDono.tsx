import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import {
  Crown, Users, CreditCard, FileText, Shield, Eye, KeyRound, Send,
  Car, IdCard, GraduationCap, Truck, Ship, Trophy, Medal, Award,
  ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Activity,
  Search, RefreshCw, Clock, AlertTriangle, Zap, ChevronRight,
  Settings, UserPlus, Download, Save, Loader2, Trash2, Megaphone, Plus, Pencil
} from 'lucide-react';

interface Overview {
  totalMasters: number;
  totalResellers: number;
  totalCredits: number;
  totalTransactions: number;
  totalRevenue: number;
  documents: { cnh: number; rg: number; carteira: number; crlv: number; cha: number; total: number; };
}

interface AdminItem {
  id: number;
  nome: string;
  email: string;
  creditos: number;
  rank: string;
  profile_photo: string | null;
  created_at: string;
  last_active: string | null;
  criado_por: number | null;
  criado_por_nome: string | null;
  total_cnh: number;
  total_rg: number;
  total_carteira: number;
  total_crlv: number;
  total_cha: number;
  total_services: number;
  last_service: {
    tipo: string;
    nome: string;
    cpf: string;
    created_at: string;
    saldo_antes: number;
    saldo_depois: number;
  } | null;
}

interface AuditEntry {
  type: 'service' | 'transfer' | 'recharge';
  service?: string;
  cpf?: string;
  nome_documento?: string;
  admin_id?: number;
  admin_nome?: string;
  admin_saldo_atual?: number;
  amount?: number;
  total_price?: number;
  from_admin_id?: number;
  from_nome?: string;
  from_saldo_atual?: number;
  to_admin_id?: number;
  to_nome?: string;
  to_saldo_atual?: number;
  created_at: string;
}

interface TopEntry {
  id: number;
  nome: string;
  email: string;
  creditos: number;
  total_services: number;
  last_active: string | null;
  rank: string;
}

interface LastService {
  tipo: string;
  nome: string;
  cpf: string;
  created_at: string;
  admin_id: number;
  admin_nome: string;
  saldo_antes: number;
  saldo_depois: number;
  saldo_atual: number;
}

export default function DashboardDono() {
  const { admin, role, credits, loading, refreshCredits } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [allAdmins, setAllAdmins] = useState<AdminItem[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [topEntries, setTopEntries] = useState<TopEntry[]>([]);
  const [lastService, setLastService] = useState<LastService | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [auditFilter, setAuditFilter] = useState<string>('');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRankFilter, setAdminRankFilter] = useState<string>('all');

  const [passwordDialog, setPasswordDialog] = useState<{ open: boolean; admin: AdminItem | null }>({ open: false, admin: null });
  const [transferDialog, setTransferDialog] = useState<{ open: boolean; admin: AdminItem | null }>({ open: false, admin: null });
  const [newPassword, setNewPassword] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // Detail dialog state
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; admin: AdminItem | null }>({ open: false, admin: null });
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Gerenciar tab state
  const [cnhIphone, setCnhIphone] = useState('');
  const [cnhApk, setCnhApk] = useState('');
  const [govbrIphone, setGovbrIphone] = useState('');
  const [govbrApk, setGovbrApk] = useState('');
  const [abafeIphone, setAbafeIphone] = useState('');
  const [abafeApk, setAbafeApk] = useState('');
  const [savingLinks, setSavingLinks] = useState(false);

  // Create master/reseller
  const [createType, setCreateType] = useState<'master' | 'revendedor'>('master');
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
  const [initialCredits, setInitialCredits] = useState('0');
  const [giveCredits, setGiveCredits] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Notícias state
  interface Noticia { id: number; titulo: string; informacao: string; data_post: string; }
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [noticiaForm, setNoticiaForm] = useState({ titulo: '', informacao: '' });
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null);
  const [savingNoticia, setSavingNoticia] = useState(false);

  useEffect(() => {
    if (admin && role === 'dono') fetchAllData();
  }, [admin, role]);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const [overviewData, adminsData, auditData, topData, lastSvc] = await Promise.all([
        (api as any).owner.getOverview(),
        (api as any).owner.getAllAdmins(),
        (api as any).owner.getAuditLog(),
        (api as any).owner.getTopResellers(),
        (api as any).owner.getLastService(),
      ]);
      setOverview(overviewData);
      setAllAdmins(adminsData);
      setAuditLog(auditData);
      setTopEntries(topData);
      setLastService(lastSvc);

      // Fetch download links
      const { data: dlData } = await supabase
        .from('downloads')
        .select('cnh_iphone, cnh_apk, govbr_iphone, govbr_apk, abafe_apk, abafe_iphone')
        .eq('id', 1)
        .maybeSingle();
      if (dlData) {
        setCnhIphone(dlData.cnh_iphone || '');
        setCnhApk(dlData.cnh_apk || '');
        setGovbrIphone(dlData.govbr_iphone || '');
        setGovbrApk(dlData.govbr_apk || '');
        setAbafeIphone(dlData.abafe_iphone || '');
        setAbafeApk(dlData.abafe_apk || '');
      }

      // Fetch notícias
      try {
        const noticiasData = await (api as any).noticias.list();
        setNoticias(noticiasData || []);
      } catch { /* tabela pode não existir ainda */ }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do painel');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveLinks = async () => {
    if (!admin) return;
    setSavingLinks(true);
    try {
      const { error } = await supabase.functions.invoke('update-downloads', {
        body: {
          admin_id: admin.id,
          session_token: admin.session_token,
          cnh_iphone: cnhIphone,
          cnh_apk: cnhApk,
          govbr_iphone: govbrIphone,
          govbr_apk: govbrApk,
          abafe_apk: abafeApk,
          abafe_iphone: abafeIphone,
        },
      });
      if (error) throw error;
      toast.success('Links atualizados com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar links');
    } finally {
      setSavingLinks(false);
    }
  };

  const handleClearLink = (field: string) => {
    switch (field) {
      case 'cnh_iphone': setCnhIphone(''); break;
      case 'cnh_apk': setCnhApk(''); break;
      case 'govbr_iphone': setGovbrIphone(''); break;
      case 'govbr_apk': setGovbrApk(''); break;
      case 'abafe_iphone': setAbafeIphone(''); break;
      case 'abafe_apk': setAbafeApk(''); break;
    }
  };

  const handleCreateAccount = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (createForm.password.length < 4) {
      toast.error('Senha deve ter no mínimo 4 caracteres');
      return;
    }
    setIsCreating(true);
    try {
      let newAdminId: number | null = null;

      if (createType === 'master') {
        const result = await api.admins.createMaster({
          nome: createForm.name,
          email: createForm.email.toLowerCase().trim(),
          key: createForm.password,
          criadoPor: admin!.id,
        });
        // result may contain the new id
        newAdminId = typeof result === 'number' ? result : (result as any)?.id || null;
      } else {
        const { data, error } = await supabase.rpc('create_reseller', {
          p_creator_id: admin!.id,
          p_session_token: admin!.session_token,
          p_nome: createForm.name,
          p_email: createForm.email.toLowerCase().trim(),
          p_key: createForm.password,
        });
        if (error) throw new Error(error.message);
        newAdminId = data as number;
      }

      // If credits to give
      if (giveCredits && parseInt(initialCredits) > 0 && newAdminId) {
        const creditsAmount = parseInt(initialCredits);
        await (api as any).owner.transferCredits(newAdminId, creditsAmount);
      }

      toast.success(`${createType === 'master' ? 'Master' : 'Revendedor'} criado com sucesso!`);
      setCreateForm({ name: '', email: '', password: '' });
      setInitialCredits('0');
      setGiveCredits(false);
      fetchAllData();
      refreshCredits();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsCreating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordDialog.admin || !newPassword) return;
    try {
      await (api as any).owner.changePassword(passwordDialog.admin.id, newPassword);
      toast.success(`Senha de ${passwordDialog.admin.nome} alterada!`);
      setPasswordDialog({ open: false, admin: null });
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    }
  };

  const handleTransferCredits = async () => {
    if (!transferDialog.admin || !transferAmount) return;
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('Valor inválido'); return; }
    try {
      await (api as any).owner.transferCredits(transferDialog.admin.id, amount);
      toast.success(`${amount} créditos transferidos para ${transferDialog.admin.nome}!`);
      setTransferDialog({ open: false, admin: null });
      setTransferAmount('');
      refreshCredits();
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao transferir');
    }
  };

  const handleFilterAudit = async (adminId?: number) => {
    try {
      const data = await (api as any).owner.getAuditLog(adminId);
      setAuditLog(data);
    } catch (error) { console.error('Erro:', error); }
  };

  const openDetailDialog = async (adm: AdminItem) => {
    setDetailDialog({ open: true, admin: adm });
    setDetailData(null);
    setLoadingDetail(true);
    try {
      const data = await (api as any).owner.getAdminDocuments(adm.id);
      setDetailData(data);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }
  if (!admin) return <Navigate to="/login" replace />;
  if (role !== 'dono') return <Navigate to="/dashboard" replace />;

  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (d: string) => {
    if (!d) return 'Nunca';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d atrás`;
    return formatDate(d);
  };

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'dono': return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 border-0 text-[10px]"><Crown className="h-3 w-3 mr-1" />Dono</Badge>;
      case 'master': return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 text-[10px]"><Shield className="h-3 w-3 mr-1" />Master</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">Revendedor</Badge>;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'CNH': return <Car className="h-4 w-4 text-green-500" />;
      case 'RG': return <IdCard className="h-4 w-4 text-purple-500" />;
      case 'Carteira': return <GraduationCap className="h-4 w-4 text-amber-500" />;
      case 'CRLV': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'Náutica': return <Ship className="h-4 w-4 text-cyan-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const masters = allAdmins.filter(a => a.rank === 'master');
  const resellers = allAdmins.filter(a => a.rank === 'revendedor');
  const donos = allAdmins.filter(a => a.rank === 'dono');

  const filteredAdmins = allAdmins.filter(a => {
    const matchSearch = !adminSearch || a.nome.toLowerCase().includes(adminSearch.toLowerCase()) || a.email.toLowerCase().includes(adminSearch.toLowerCase());
    const matchRank = adminRankFilter === 'all' || a.rank === adminRankFilter;
    return matchSearch && matchRank;
  });

  // Ordenar por atividade: mais ativos primeiro
  const sortedByActivity = [...allAdmins].filter(a => a.rank !== 'dono').sort((a, b) => b.total_services - a.total_services);
  const mostActive = sortedByActivity.slice(0, 5);
  const leastActive = [...sortedByActivity].reverse().slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              Painel do Dono
            </h1>
            <p className="text-sm text-muted-foreground">Controle total do sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              <CreditCard className="h-3 w-3 mr-1" />
              {credits.toLocaleString('pt-BR')} créditos
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchAllData} disabled={loadingData}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Geral</TabsTrigger>
            <TabsTrigger value="masters" className="text-xs sm:text-sm">Masters</TabsTrigger>
            <TabsTrigger value="resellers" className="text-xs sm:text-sm">Revendedores</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs sm:text-sm">Histórico</TabsTrigger>
            <TabsTrigger value="ranking" className="text-xs sm:text-sm">Ranking</TabsTrigger>
            <TabsTrigger value="noticias" className="text-xs sm:text-sm">Notícias</TabsTrigger>
            <TabsTrigger value="manage" className="text-xs sm:text-sm">Gerenciar</TabsTrigger>
          </TabsList>

          {loadingData ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : (
            <>
              {/* ===== OVERVIEW ===== */}
              <TabsContent value="overview" className="space-y-6">
                {overview && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {[
                        { icon: Shield, label: 'Masters', value: overview.totalMasters, color: 'text-blue-500', bg: 'from-blue-500/10 to-blue-600/5 border-blue-500/20' },
                        { icon: Users, label: 'Revendedores', value: overview.totalResellers, color: 'text-purple-500', bg: 'from-purple-500/10 to-purple-600/5 border-purple-500/20' },
                        { icon: CreditCard, label: 'Créditos', value: overview.totalCredits?.toLocaleString('pt-BR'), color: 'text-green-500', bg: 'from-green-500/10 to-green-600/5 border-green-500/20' },
                        { icon: TrendingUp, label: 'Transações', value: overview.totalTransactions, color: 'text-amber-500', bg: 'from-amber-500/10 to-amber-600/5 border-amber-500/20' },
                        { icon: DollarSign, label: 'Faturamento', value: `R$ ${overview.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: 'text-emerald-500', bg: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20' },
                      ].map(item => (
                        <Card key={item.label} className={`bg-gradient-to-br ${item.bg}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                              <item.icon className={`h-5 w-5 ${item.color}`} />
                              <div>
                                <p className="text-xl font-bold">{item.value}</p>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Document counts */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5 text-primary" />Documentos na Base</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                          {[
                            { label: 'CNH', count: overview.documents.cnh, icon: Car, color: 'text-green-500' },
                            { label: 'RG', count: overview.documents.rg, icon: IdCard, color: 'text-purple-500' },
                            { label: 'Carteira', count: overview.documents.carteira, icon: GraduationCap, color: 'text-amber-500' },
                            { label: 'CRLV', count: overview.documents.crlv, icon: Truck, color: 'text-blue-500' },
                            { label: 'Náutica', count: overview.documents.cha, icon: Ship, color: 'text-cyan-500' },
                            { label: 'Total', count: overview.documents.total, icon: FileText, color: 'text-primary font-bold' },
                          ].map(item => (
                            <div key={item.label} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                              <item.icon className={`h-4 w-4 ${item.color}`} />
                              <div>
                                <p className="text-lg font-bold">{item.count.toLocaleString('pt-BR')}</p>
                                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Last Service Created + Activity Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Last service */}
                      <Card className="border-2 border-primary/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            Último Serviço Criado
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {lastService ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                {getServiceIcon(lastService.tipo)}
                                <Badge variant="secondary">{lastService.tipo}</Badge>
                                <span className="text-xs text-muted-foreground ml-auto">{timeAgo(lastService.created_at)}</span>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                                <p className="font-medium text-sm">{lastService.nome}</p>
                                <p className="text-xs text-muted-foreground">CPF: {lastService.cpf}</p>
                                <p className="text-xs text-muted-foreground">Criado por: <span className="font-semibold text-foreground">{lastService.admin_nome}</span></p>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                  <p className="text-xs text-muted-foreground">Saldo Antes</p>
                                  <p className="text-lg font-bold text-green-600">{lastService.saldo_antes}</p>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                  <p className="text-xs text-muted-foreground">Saldo Depois</p>
                                  <p className="text-lg font-bold text-red-600">{lastService.saldo_depois}</p>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-muted/50 border">
                                  <p className="text-xs text-muted-foreground">Saldo Atual</p>
                                  <p className="text-lg font-bold">{lastService.saldo_atual}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-center text-muted-foreground py-4 text-sm">Nenhum serviço criado</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Most active / least active */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Activity className="h-5 w-5 text-primary" />
                            Atividade dos Admins
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Mais Ativos</p>
                            <div className="space-y-1.5">
                              {mostActive.map((a, i) => (
                                <div key={a.id} className="flex items-center justify-between text-sm p-1.5 rounded bg-muted/30">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-[10px] font-bold text-green-600">{i + 1}</span>
                                    <span className="text-xs font-medium truncate max-w-[120px]">{a.nome}</span>
                                    {getRankBadge(a.rank)}
                                  </div>
                                  <span className="text-xs font-semibold">{a.total_services} serviços</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-orange-500 mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Menos Ativos</p>
                            <div className="space-y-1.5">
                              {leastActive.map((a) => (
                                <div key={a.id} className="flex items-center justify-between text-sm p-1.5 rounded bg-muted/30">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium truncate max-w-[120px]">{a.nome}</span>
                                    {getRankBadge(a.rank)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs">{a.total_services} serviços</span>
                                    <span className="text-[10px] text-muted-foreground">{a.last_active ? timeAgo(a.last_active) : 'Nunca'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ===== MASTERS TAB ===== */}
              <TabsContent value="masters" className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm"><Shield className="h-3 w-3 mr-1" />{masters.length} Masters</Badge>
                </div>
                {renderAdminTable(masters)}
              </TabsContent>

              {/* ===== RESELLERS TAB ===== */}
              <TabsContent value="resellers" className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar revendedor..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Badge variant="outline" className="text-sm"><Users className="h-3 w-3 mr-1" />{resellers.length} Revendedores</Badge>
                </div>
                {renderAdminTable(resellers.filter(a => !adminSearch || a.nome.toLowerCase().includes(adminSearch.toLowerCase()) || a.email.toLowerCase().includes(adminSearch.toLowerCase())))}
              </TabsContent>

              {/* ===== AUDIT LOG ===== */}
              <TabsContent value="audit" className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Select value={auditFilter} onValueChange={(val) => { setAuditFilter(val); handleFilterAudit(val === 'all' ? undefined : parseInt(val)); }}>
                    <SelectTrigger className="w-[250px]"><SelectValue placeholder="Filtrar por admin..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os admins</SelectItem>
                      {allAdmins.map(a => (<SelectItem key={a.id} value={String(a.id)}>{a.nome} ({a.rank})</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary">{auditLog.length} registros</Badge>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Detalhes</TableHead>
                            <TableHead>Admin</TableHead>
                            <TableHead>Saldo Atual</TableHead>
                            <TableHead>Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditLog.map((entry, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                {entry.type === 'service' ? (
                                  <div className="flex items-center gap-1.5">
                                    {getServiceIcon(entry.service || '')}
                                    <Badge variant="secondary" className="text-[10px]">{entry.service}</Badge>
                                  </div>
                                ) : entry.type === 'transfer' ? (
                                  <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-[10px]"><ArrowUpRight className="h-3 w-3 mr-1" />Transfer</Badge>
                                ) : (
                                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-[10px]"><ArrowDownRight className="h-3 w-3 mr-1" />Recarga</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {entry.type === 'service' ? (
                                  <div><p className="text-sm font-medium">{entry.nome_documento}</p><p className="text-xs text-muted-foreground">CPF: {entry.cpf}</p></div>
                                ) : entry.type === 'transfer' ? (
                                  <div><p className="text-sm">{entry.from_nome} → {entry.to_nome}</p><p className="text-xs font-semibold text-primary">{entry.amount} créditos</p></div>
                                ) : (
                                  <div><p className="text-sm">{entry.to_nome}</p><p className="text-xs font-semibold text-green-600">+{entry.amount} créditos {entry.total_price ? `(R$ ${entry.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : ''}</p></div>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">{entry.type === 'service' ? entry.admin_nome : entry.type === 'transfer' ? entry.from_nome : entry.to_nome}</TableCell>
                              <TableCell>
                                <span className="font-semibold text-sm">
                                  {entry.type === 'service' ? entry.admin_saldo_atual?.toLocaleString('pt-BR') : entry.type === 'transfer' ? `${entry.from_saldo_atual?.toLocaleString('pt-BR')} / ${entry.to_saldo_atual?.toLocaleString('pt-BR')}` : entry.to_saldo_atual?.toLocaleString('pt-BR')}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(entry.created_at)}</TableCell>
                            </TableRow>
                          ))}
                          {auditLog.length === 0 && (<TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum registro</TableCell></TableRow>)}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ===== RANKING ===== */}
              <TabsContent value="ranking" className="space-y-4">
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" />Ranking Geral — Quem Mais Usa a Base</CardTitle>
                    <CardDescription>Todos os admins ordenados por total de serviços criados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topEntries.length > 0 ? (
                      <div className="space-y-2">
                        {topEntries.map((entry, index) => (
                          <div key={entry.id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-transparent border border-yellow-500/30 shadow-sm'
                              : index === 1 ? 'bg-gradient-to-r from-gray-400/15 to-transparent border border-gray-400/20'
                              : index === 2 ? 'bg-gradient-to-r from-amber-600/15 to-transparent border border-amber-600/20'
                              : 'bg-muted/30'
                          }`}>
                            <div className="flex items-center gap-3">
                              {index === 0 ? (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md"><Trophy className="h-4 w-4 text-yellow-950" /></div>
                              ) : index === 1 ? (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center"><Medal className="h-4 w-4 text-gray-700" /></div>
                              ) : index === 2 ? (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Award className="h-4 w-4 text-amber-950" /></div>
                              ) : (
                                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{index + 1}</span>
                              )}
                              <div>
                                <span className={`font-medium text-sm ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>{entry.nome}</span>
                                <div className="flex items-center gap-2">
                                  {getRankBadge(entry.rank)}
                                  <span className="text-[10px] text-muted-foreground">{entry.last_active ? timeAgo(entry.last_active) : 'Nunca acessou'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary"><CreditCard className="h-3 w-3 mr-1" />{entry.creditos.toLocaleString('pt-BR')}</Badge>
                              <Badge variant={index < 3 ? "default" : "outline"} className={index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 border-0' : ''}>
                                <Activity className="h-3 w-3 mr-1" />{entry.total_services} serviços
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4 text-sm">Nenhum dado</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ===== NOTÍCIAS ===== */}
              <TabsContent value="noticias" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Megaphone className="h-5 w-5 text-primary" />
                      {editingNoticia ? 'Editar Notícia' : 'Nova Notícia'}
                    </CardTitle>
                    <CardDescription>Publique comunicados e atualizações para os revendedores</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Título</Label>
                      <Input
                        placeholder="Título da notícia"
                        value={noticiaForm.titulo}
                        onChange={(e) => setNoticiaForm(prev => ({ ...prev, titulo: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Conteúdo</Label>
                      <Textarea
                        placeholder="Escreva o conteúdo da notícia..."
                        value={noticiaForm.informacao}
                        onChange={(e) => setNoticiaForm(prev => ({ ...prev, informacao: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          if (!noticiaForm.titulo || !noticiaForm.informacao) { toast.error('Preencha todos os campos'); return; }
                          setSavingNoticia(true);
                          try {
                            if (editingNoticia) {
                              await (api as any).noticias.update(editingNoticia.id, noticiaForm.titulo, noticiaForm.informacao);
                              toast.success('Notícia atualizada!');
                            } else {
                              await (api as any).noticias.create(noticiaForm.titulo, noticiaForm.informacao);
                              toast.success('Notícia publicada!');
                            }
                            setNoticiaForm({ titulo: '', informacao: '' });
                            setEditingNoticia(null);
                            const updated = await (api as any).noticias.list();
                            setNoticias(updated || []);
                          } catch (err: any) { toast.error(err.message || 'Erro'); }
                          finally { setSavingNoticia(false); }
                        }}
                        disabled={savingNoticia}
                        className="flex-1"
                      >
                        {savingNoticia ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : editingNoticia ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        {editingNoticia ? 'Salvar Alterações' : 'Publicar Notícia'}
                      </Button>
                      {editingNoticia && (
                        <Button variant="outline" onClick={() => { setEditingNoticia(null); setNoticiaForm({ titulo: '', informacao: '' }); }}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de notícias */}
                <div className="space-y-3">
                  {noticias.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma notícia publicada ainda.</p>
                      </CardContent>
                    </Card>
                  ) : noticias.map((noticia) => (
                    <Card key={noticia.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm">{noticia.titulo}</h3>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{noticia.informacao}</p>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              {noticia.data_post ? new Date(noticia.data_post).toLocaleString('pt-BR') : '-'}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingNoticia(noticia); setNoticiaForm({ titulo: noticia.titulo, informacao: noticia.informacao }); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={async () => {
                              try {
                                await (api as any).noticias.delete(noticia.id);
                                toast.success('Notícia removida');
                                setNoticias(prev => prev.filter(n => n.id !== noticia.id));
                              } catch { toast.error('Erro ao remover'); }
                            }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ===== GERENCIAR ===== */}
              <TabsContent value="manage" className="space-y-6">
                {/* Create Master/Reseller */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <UserPlus className="h-5 w-5 text-primary" />
                      Criar Conta
                    </CardTitle>
                    <CardDescription>Crie uma conta Master ou Revendedor diretamente</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant={createType === 'master' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCreateType('master')}
                      >
                        <Shield className="h-4 w-4 mr-1" /> Master
                      </Button>
                      <Button
                        variant={createType === 'revendedor' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCreateType('revendedor')}
                      >
                        <Users className="h-4 w-4 mr-1" /> Revendedor
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Nome</Label>
                        <Input
                          placeholder="Nome"
                          value={createForm.name}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email</Label>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={createForm.email}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Senha</Label>
                        <Input
                          type="password"
                          placeholder="••••••"
                          value={createForm.password}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2">
                        <Switch checked={giveCredits} onCheckedChange={setGiveCredits} />
                        <Label className="text-sm">Definir créditos iniciais</Label>
                      </div>
                      {giveCredits && (
                        <Input
                          type="number"
                          placeholder="Qtd"
                          value={initialCredits}
                          onChange={(e) => setInitialCredits(e.target.value)}
                          className="w-24"
                          min={0}
                        />
                      )}
                    </div>

                    <Button onClick={handleCreateAccount} disabled={isCreating} className="w-full">
                      {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                      Criar {createType === 'master' ? 'Master' : 'Revendedor'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Download Links Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Download className="h-5 w-5 text-primary" />
                      Gerenciar Downloads
                    </CardTitle>
                    <CardDescription>Atualize ou exclua os links de download dos aplicativos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* CNH */}
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CNH Digital 2026</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">iPhone</Label>
                        <div className="flex gap-1">
                          <Input value={cnhIphone} onChange={(e) => setCnhIphone(e.target.value)} placeholder="https://..." className="flex-1" />
                          <Button variant="ghost" size="icon" onClick={() => handleClearLink('cnh_iphone')} title="Limpar"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Android (APK)</Label>
                        <div className="flex gap-1">
                          <Input value={cnhApk} onChange={(e) => setCnhApk(e.target.value)} placeholder="https://..." className="flex-1" />
                          <Button variant="ghost" size="icon" onClick={() => handleClearLink('cnh_apk')} title="Limpar"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gov.br</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">iPhone</Label>
                        <div className="flex gap-1">
                          <Input value={govbrIphone} onChange={(e) => setGovbrIphone(e.target.value)} placeholder="https://..." className="flex-1" />
                          <Button variant="ghost" size="icon" onClick={() => handleClearLink('govbr_iphone')} title="Limpar"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Android (APK)</Label>
                        <div className="flex gap-1">
                          <Input value={govbrApk} onChange={(e) => setGovbrApk(e.target.value)} placeholder="https://..." className="flex-1" />
                          <Button variant="ghost" size="icon" onClick={() => handleClearLink('govbr_apk')} title="Limpar"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ABAFE - Carteira Estudante</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">iPhone</Label>
                        <div className="flex gap-1">
                          <Input value={abafeIphone} onChange={(e) => setAbafeIphone(e.target.value)} placeholder="https://..." className="flex-1" />
                          <Button variant="ghost" size="icon" onClick={() => handleClearLink('abafe_iphone')} title="Limpar"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Android (APK)</Label>
                        <div className="flex gap-1">
                          <Input value={abafeApk} onChange={(e) => setAbafeApk(e.target.value)} placeholder="https://..." className="flex-1" />
                          <Button variant="ghost" size="icon" onClick={() => handleClearLink('abafe_apk')} title="Limpar"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSaveLinks} disabled={savingLinks} className="w-full">
                      {savingLinks ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Salvar Links
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog.open} onOpenChange={(o) => setPasswordDialog({ open: o, admin: o ? passwordDialog.admin : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />Alterar Senha</DialogTitle>
            <DialogDescription>Alterar senha de <strong>{passwordDialog.admin?.nome}</strong> ({passwordDialog.admin?.email})</DialogDescription>
          </DialogHeader>
          <Input type="text" placeholder="Nova senha (mín. 4 caracteres)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog({ open: false, admin: null })}>Cancelar</Button>
            <Button onClick={handleChangePassword} disabled={newPassword.length < 4}>Alterar Senha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Credits Dialog */}
      <Dialog open={transferDialog.open} onOpenChange={(o) => setTransferDialog({ open: o, admin: o ? transferDialog.admin : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5" />Transferir Créditos</DialogTitle>
            <DialogDescription>Para <strong>{transferDialog.admin?.nome}</strong> (saldo: {transferDialog.admin?.creditos.toLocaleString('pt-BR')})</DialogDescription>
          </DialogHeader>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Seu saldo: <strong>{credits.toLocaleString('pt-BR')}</strong></p>
            <Input type="number" placeholder="Quantidade" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} min={1} max={credits} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialog({ open: false, admin: null })}>Cancelar</Button>
            <Button onClick={handleTransferCredits} disabled={!transferAmount || parseInt(transferAmount) <= 0 || parseInt(transferAmount) > credits}>Transferir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Documents Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(o) => setDetailDialog({ open: o, admin: o ? detailDialog.admin : null })}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Documentos de {detailDialog.admin?.nome}
            </DialogTitle>
            <DialogDescription>
              {detailDialog.admin?.email} — Saldo: {detailDialog.admin?.creditos.toLocaleString('pt-BR')} créditos
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : detailData ? (
            <Tabs defaultValue="cnh" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="cnh" className="gap-1 text-xs">
                  <Car className="h-3 w-3" />CNH ({detailData.documents.cnhs?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="rg" className="gap-1 text-xs">
                  <IdCard className="h-3 w-3" />RG ({detailData.documents.rgs?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="carteira" className="gap-1 text-xs">
                  <GraduationCap className="h-3 w-3" />Estudante ({detailData.documents.carteiras?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="crlv" className="gap-1 text-xs">
                  <Truck className="h-3 w-3" />CRLV ({detailData.documents.crlvs?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="cha" className="gap-1 text-xs">
                  <Ship className="h-3 w-3" />Náutica ({detailData.documents.chas?.length || 0})
                </TabsTrigger>
              </TabsList>

              {['cnh', 'rg', 'carteira', 'crlv', 'cha'].map((type) => {
                const key = type === 'cnh' ? 'cnhs' : type === 'rg' ? 'rgs' : type === 'carteira' ? 'carteiras' : type === 'crlv' ? 'crlvs' : 'chas';
                const docs = detailData.documents[key] || [];
                return (
                  <TabsContent key={type} value={type} className="mt-4">
                    {docs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Nenhum documento</p>
                    ) : (
                      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>CPF</TableHead>
                              <TableHead>Senha</TableHead>
                              {type === 'crlv' && <TableHead>Placa</TableHead>}
                              {type !== 'carteira' && <TableHead>Validade</TableHead>}
                              <TableHead>Criado em</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {docs.map((doc: any) => (
                              <TableRow key={doc.id}>
                                <TableCell className="font-medium max-w-[200px] truncate">{doc.nome}</TableCell>
                                <TableCell className="font-mono text-xs">{doc.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</TableCell>
                                <TableCell className="font-mono font-semibold text-primary">{doc.senha}</TableCell>
                                {type === 'crlv' && <TableCell className="font-mono text-xs">{doc.placa}</TableCell>}
                                {type !== 'carteira' && <TableCell className="text-xs">{doc.validade ? new Date(doc.validade).toLocaleDateString('pt-BR') : '-'}</TableCell>}
                                <TableCell className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          ) : (
            <p className="text-center text-muted-foreground py-8">Erro ao carregar dados</p>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );

  // Render admin table (shared between masters and resellers tabs)
  function renderAdminTable(admins: AdminItem[]) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Último Serviço</TableHead>
                  <TableHead>Saldo Antes/Depois</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((adm) => (
                  <TableRow key={adm.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{adm.nome}</p>
                        <p className="text-xs text-muted-foreground">{adm.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><span className="font-semibold">{adm.creditos.toLocaleString('pt-BR')}</span></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <span className="font-bold text-sm">{adm.total_services}</span>
                        <span className="text-muted-foreground text-[10px]">total</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {adm.total_cnh > 0 && <Badge variant="secondary" className="text-[9px] px-1"><Car className="h-2.5 w-2.5 mr-0.5" />{adm.total_cnh}</Badge>}
                        {adm.total_rg > 0 && <Badge variant="secondary" className="text-[9px] px-1"><IdCard className="h-2.5 w-2.5 mr-0.5" />{adm.total_rg}</Badge>}
                        {adm.total_carteira > 0 && <Badge variant="secondary" className="text-[9px] px-1"><GraduationCap className="h-2.5 w-2.5 mr-0.5" />{adm.total_carteira}</Badge>}
                        {adm.total_crlv > 0 && <Badge variant="secondary" className="text-[9px] px-1"><Truck className="h-2.5 w-2.5 mr-0.5" />{adm.total_crlv}</Badge>}
                        {adm.total_cha > 0 && <Badge variant="secondary" className="text-[9px] px-1"><Ship className="h-2.5 w-2.5 mr-0.5" />{adm.total_cha}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {adm.last_service ? (
                        <div>
                          <div className="flex items-center gap-1">
                            {getServiceIcon(adm.last_service.tipo)}
                            <span className="text-xs font-medium">{adm.last_service.tipo}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{adm.last_service.nome}</p>
                          <p className="text-[10px] text-muted-foreground">{timeAgo(adm.last_service.created_at)}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Nenhum</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {adm.last_service ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-600 font-semibold">{adm.last_service.saldo_antes}</span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-red-600 font-semibold">{adm.last_service.saldo_depois}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs">{adm.last_active ? timeAgo(adm.last_active) : 'Nunca'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{adm.criado_por_nome || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => openDetailDialog(adm)} title="Ver documentos"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setPasswordDialog({ open: true, admin: adm }); setNewPassword(''); }} title="Alterar senha"><KeyRound className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setTransferDialog({ open: true, admin: adm }); setTransferAmount(''); }} title="Transferir créditos"><Send className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {admins.length === 0 && (<TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum admin encontrado</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }
}
