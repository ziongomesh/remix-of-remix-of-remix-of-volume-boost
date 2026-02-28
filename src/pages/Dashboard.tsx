import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ResellerGoals from '@/components/dashboard/ResellerGoals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, Crown, Users, Clock, FileText, IdCard, GraduationCap, Car, 
  Trophy, Medal, Award, Wallet, BarChart3, Megaphone, History, 
  Calendar, Anchor, ChevronDown, ChevronRight, Shield, Zap, 
  FolderOpen, Send, Wrench, Download, UserPlus, Settings, ArrowRight
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import OnboardingWizard from '@/components/tutorial/OnboardingWizard';
import MasterOnboardingWizard from '@/components/tutorial/MasterOnboardingWizard';

interface TopReseller {
  id: number;
  nome: string;
  total_received: number;
}

interface RecentReseller {
  id: number;
  nome: string;
  created_at: string;
}

interface DocumentStats {
  totalDocuments: number;
  totalCnh: number;
  totalRg: number;
  totalCarteira: number;
  byReseller: Array<{
    id: number;
    nome: string;
    cnh: number;
    rg: number;
    carteira: number;
    total: number;
  }>;
}

interface Noticia {
  id: number;
  titulo: string;
  informacao: string;
  data_post: string;
}

export default function Dashboard() {
  const { admin, role: rawRole, credits, creditsTransf, loading } = useAuth();
  const role = rawRole as string;
  const navigate = useNavigate();
  const [topResellers, setTopResellers] = useState<TopReseller[]>([]);
  const [recentResellers, setRecentResellers] = useState<RecentReseller[]>([]);
  const [topCreditResellers, setTopCreditResellers] = useState<{id: number; nome: string; creditos: number}[]>([]);
  const [totalResellers, setTotalResellers] = useState(0);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMasterOnboarding, setShowMasterOnboarding] = useState(false);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [myDocStats, setMyDocStats] = useState<{ today: number; week: number; month: number }>({ today: 0, week: 0, month: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'history'>('overview');

  // Master daily history state
  const [masterHistory, setMasterHistory] = useState<Record<string, any[]>>({});
  const [masterHistoryAdmins, setMasterHistoryAdmins] = useState<any[]>([]);
  const [masterHistoryLoading, setMasterHistoryLoading] = useState(false);
  const [masterFilterAdmin, setMasterFilterAdmin] = useState<string>('all');
  const [masterFilterModule, setMasterFilterModule] = useState<string>('all');
  const [masterFilterDate, setMasterFilterDate] = useState<string>('');
  const [masterExpandedDays, setMasterExpandedDays] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (admin && !loading) {
      if (admin.rank === 'revendedor') {
        const tutorialKey = `tutorial_completed_${admin.id}`;
        if (!localStorage.getItem(tutorialKey)) {
          setShowOnboarding(true);
        }
      } else if (admin.rank === 'master') {
        const masterKey = `master_tutorial_completed_${admin.id}`;
        if (!localStorage.getItem(masterKey)) {
          setShowMasterOnboarding(true);
        }
      }
    }
  }, [admin, loading]);

  useEffect(() => {
    const fetchCommon = async () => {
      if (!admin) return;
      try {
        const [news, docStats] = await Promise.all([
          api.noticias.list().catch(() => []),
          api.admins.getMyDocumentStats(admin.id).catch(() => ({ today: 0, week: 0, month: 0 })),
        ]);
        setNoticias(news);
        setMyDocStats(docStats);
      } catch (e) {
        console.error('Error fetching common data:', e);
      }
    };
    fetchCommon();
  }, [admin]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!admin) return;
      try {
        const resellers = await api.admins.getResellers(admin.id);
        if (resellers) {
          setTotalResellers(resellers.length);
          setRecentResellers(resellers.slice(0, 3).map((r: any) => ({
            id: r.id, nome: r.nome, created_at: r.created_at || ''
          })));
          const sortedByCredits = [...resellers]
            .sort((a: any, b: any) => (b.creditos || 0) - (a.creditos || 0))
            .slice(0, 5)
            .map((r: any) => ({ id: r.id, nome: r.nome, creditos: r.creditos || 0 }));
          setTopCreditResellers(sortedByCredits);
          try {
            const transactions = await api.credits.getTransactions(admin.id);
            const resellerIds = resellers.map((r: any) => r.id);
            const totals: Record<number, number> = {};
            transactions?.forEach((t: any) => {
              if (t.transaction_type === 'transfer' && resellerIds.includes(t.to_admin_id)) {
                totals[t.to_admin_id] = (totals[t.to_admin_id] || 0) + t.amount;
              }
            });
            const topList = Object.entries(totals)
              .map(([id, total]) => ({
                id: parseInt(id),
                nome: resellers.find((r: any) => r.id === parseInt(id))?.nome || 'Desconhecido',
                total_received: total
              }))
              .sort((a, b) => b.total_received - a.total_received)
              .slice(0, 5);
            setTopResellers(topList);
          } catch (error) {
            console.error('Error fetching transactions:', error);
          }
        }
        if (role === 'master') {
          try {
            const docStats = await api.admins.getDocumentStats(admin.id);
            setDocumentStats(docStats);
          } catch (error) {
            console.error('Error fetching document stats:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    if (admin && (role === 'master' || role === 'dono')) {
      fetchStats();
    } else {
      setLoadingStats(false);
    }
  }, [admin, role]);

  useEffect(() => {
    const fetchMasterHistory = async () => {
      if (!admin || role !== 'master') return;
      setMasterHistoryLoading(true);
      try {
        const filters: any = {};
        if (masterFilterAdmin !== 'all') filters.adminId = parseInt(masterFilterAdmin);
        if (masterFilterModule !== 'all') filters.module = masterFilterModule;
        if (masterFilterDate) filters.date = masterFilterDate;
        const data = await (api as any).admins.getMasterDailyHistory(admin.id, filters);
        setMasterHistory(data.grouped || {});
        setMasterHistoryAdmins(data.admins || []);
        const today = new Date().toISOString().slice(0, 10);
        setMasterExpandedDays(prev => ({ ...prev, [today]: true }));
      } catch (e) {
        console.error('Erro ao buscar histórico master:', e);
      } finally {
        setMasterHistoryLoading(false);
      }
    };
    fetchMasterHistory();
  }, [admin, role, masterFilterAdmin, masterFilterModule, masterFilterDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;
  if (role === 'dono') return <Navigate to="/dashboard-dono" replace />;

  const getRoleBadge = () => {
    switch (role) {
      case 'dono': return { label: 'Dono', stars: 3 };
      case 'sub': return { label: 'Sub Dono', stars: 3 };
      case 'master': return { label: 'Master', stars: 2 };
      case 'revendedor': return { label: 'Revendedor', stars: 1 };
      default: return { label: 'Usuário', stars: 0 };
    }
  };

  const roleBadge = getRoleBadge();
  const firstName = admin.nome?.split(' ')[0] || 'Usuário';

  // Quick access tiles for the launcher
  const quickActions = [
    { label: 'Serviços', icon: FolderOpen, href: '/servicos', color: 'from-blue-600 to-blue-800', desc: 'Gerar documentos' },
    { label: 'Histórico', icon: History, href: '/historico-servicos', color: 'from-purple-600 to-purple-800', desc: 'Serviços gerados' },
    ...(role === 'master' || role === 'sub' ? [
      { label: 'Revendedores', icon: Users, href: '/revendedores', color: 'from-emerald-600 to-emerald-800', desc: 'Gerenciar equipe' },
      { label: 'Transferir', icon: Send, href: '/transferir', color: 'from-amber-600 to-amber-800', desc: 'Enviar créditos' },
    ] : []),
    { label: 'Ferramentas', icon: Wrench, href: '/ferramentas', color: 'from-rose-600 to-rose-800', desc: 'Utilitários' },
    { label: 'Downloads', icon: Download, href: '/downloads', color: 'from-cyan-600 to-cyan-800', desc: 'Apps e arquivos' },
  ];

  return (
    <DashboardLayout>
      {showOnboarding && admin && (
        <OnboardingWizard
          userName={firstName}
          adminId={admin.id}
          onClose={() => setShowOnboarding(false)}
        />
      )}
      {showMasterOnboarding && admin && (
        <MasterOnboardingWizard
          userName={firstName}
          adminId={admin.id}
          onClose={() => setShowMasterOnboarding(false)}
        />
      )}

      <div className="space-y-6 animate-fade-in">
        {/* ═══ HEADER BAR ═══ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Olá, {firstName}!
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Painel de controle • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1.5 text-xs font-semibold border-primary/30 text-primary">
              <Shield className="h-3 w-3 mr-1.5" />
              {roleBadge.label} {'★'.repeat(roleBadge.stars)}
            </Badge>
          </div>
        </div>

        {/* ═══ STATUS BAR - Launcher style ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Credits */}
          <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/20 p-4 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider">Créditos</span>
              <Zap className="h-4 w-4 text-emerald-400/60" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {(role === 'dono' || role === 'sub') ? '∞' : credits.toLocaleString('pt-BR')}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Para gerar documentos</p>
          </div>

          {/* Transfer Credits - Master only */}
          {role === 'master' && (
            <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/20 p-4 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-400/80 uppercase tracking-wider">Transferência</span>
                <Wallet className="h-4 w-4 text-blue-400/60" />
              </div>
              <p className="text-2xl font-bold text-foreground">{creditsTransf.toLocaleString('pt-BR')}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Para revendedores</p>
            </div>
          )}

          {/* Today production */}
          <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/15 to-violet-600/5 border border-violet-500/20 p-4 hover:border-violet-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-violet-400/80 uppercase tracking-wider">Hoje</span>
              <FileText className="h-4 w-4 text-violet-400/60" />
            </div>
            <p className="text-2xl font-bold text-foreground">{myDocStats.today}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Documentos gerados</p>
          </div>

          {/* Resellers count - Master/Sub */}
          {(role === 'master' || role === 'sub') && (
            <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/20 p-4 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">Equipe</span>
                <Users className="h-4 w-4 text-amber-400/60" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalResellers}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Revendedores ativos</p>
            </div>
          )}

          {/* Month production for revendedor */}
          {role === 'revendedor' && (
            <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/20 p-4 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">Mês</span>
                <Trophy className="h-4 w-4 text-amber-400/60" />
              </div>
              <p className="text-2xl font-bold text-foreground">{myDocStats.month}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Documentos no mês</p>
            </div>
          )}
        </div>

        {/* ═══ QUICK ACCESS - Launcher tiles ═══ */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acesso Rápido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.href}
                  onClick={() => navigate(action.href)}
                  className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${action.color} p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]`}
                >
                  <Icon className="h-6 w-6 text-white/90 mb-3" />
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="text-[10px] text-white/60 mt-0.5">{action.desc}</p>
                  <ArrowRight className="absolute bottom-3 right-3 h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ TAB NAVIGATION ═══ */}
        {(role === 'master' || role === 'sub') && (
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
            {[
              { id: 'overview' as const, label: 'Visão Geral' },
              { id: 'stats' as const, label: 'Rankings' },
              ...(role === 'master' ? [{ id: 'history' as const, label: 'Histórico' }] : []),
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ═══ OVERVIEW TAB ═══ */}
        {(activeTab === 'overview' || role === 'revendedor') && (
          <div className="space-y-6">
            {/* Metas */}
            {admin && (
              <ResellerGoals
                adminId={admin.id}
                totalDocumentsToday={myDocStats.today}
                totalDocumentsWeek={myDocStats.week}
                totalDocumentsMonth={myDocStats.month}
              />
            )}

            {/* Master doc stats */}
            {role === 'master' && documentStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Docs', value: documentStats.totalDocuments, icon: FileText, color: 'blue' },
                  { label: 'CNHs', value: documentStats.totalCnh, icon: Car, color: 'green' },
                  { label: 'RGs', value: documentStats.totalRg, icon: IdCard, color: 'purple' },
                  { label: 'Carteiras', value: documentStats.totalCarteira, icon: GraduationCap, color: 'amber' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className={`rounded-xl border border-${stat.color}-500/20 bg-${stat.color}-500/5 p-4`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                          <Icon className={`h-4 w-4 text-${stat.color}-500`} />
                        </div>
                        <div>
                          <p className="text-xl font-bold">{stat.value}</p>
                          <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recent resellers */}
            {(role === 'master' || role === 'sub') && recentResellers.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="h-4 w-4 text-primary" />
                    Últimos Criados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentResellers.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="font-medium text-sm">{r.nome}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comunicados */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Megaphone className="h-4 w-4 text-primary" />
                  Comunicados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {noticias.length > 0 ? (
                  <div className="space-y-3">
                    {noticias.slice(0, 5).map((n) => (
                      <div key={n.id} className="border-l-2 border-primary/40 pl-4 py-1.5">
                        <h4 className="font-medium text-sm">{n.titulo}</h4>
                        <p className="text-xs text-muted-foreground whitespace-pre-line mt-0.5">{n.informacao}</p>
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          📅 {new Date(n.data_post).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">Nenhum comunicado</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══ STATS/RANKINGS TAB ═══ */}
        {activeTab === 'stats' && (role === 'master' || role === 'sub') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Resellers */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Top Revendedores
                  <Badge variant="secondary" className="text-[10px] ml-auto">Créditos Recebidos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : topResellers.length > 0 ? (
                  <div className="space-y-2">
                    {topResellers.map((r, i) => (
                      <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        i === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                        i === 1 ? 'bg-gray-400/10 border border-gray-400/15' :
                        i === 2 ? 'bg-amber-600/10 border border-amber-600/15' : 'bg-muted/30'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            i === 0 ? 'bg-yellow-500 text-yellow-950' :
                            i === 1 ? 'bg-gray-400 text-gray-950' :
                            i === 2 ? 'bg-amber-600 text-amber-950' : 'bg-muted text-muted-foreground'
                          }`}>{i + 1}</span>
                          <span className="font-medium text-sm">{r.nome}</span>
                        </div>
                        <Badge variant="secondary" className="text-[11px]">
                          <CreditCard className="h-3 w-3 mr-1" />{r.total_received.toLocaleString('pt-BR')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">Nenhuma transferência</p>
                )}
              </CardContent>
            </Card>

            {/* Ranking by Credits */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Wallet className="h-4 w-4 text-emerald-500" />
                  Ranking por Saldo
                  <Badge variant="secondary" className="text-[10px] ml-auto">Créditos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : topCreditResellers.length > 0 ? (
                  <div className="space-y-2">
                    {topCreditResellers.map((r, i) => (
                      <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        i === 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-muted/30'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            i === 0 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                          }`}>{i + 1}</span>
                          <span className="font-medium text-sm">{r.nome}</span>
                        </div>
                        <Badge variant="secondary" className="text-[11px]">{r.creditos.toLocaleString('pt-BR')}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">Nenhum revendedor</p>
                )}
              </CardContent>
            </Card>

            {/* Services popularity */}
            {role === 'master' && documentStats && (
              <Card className="border-border/50 lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    Serviços Mais Usados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const services = [
                      { name: 'CNH Digital', count: documentStats.totalCnh, icon: Car, color: 'bg-green-500' },
                      { name: 'RG Digital', count: documentStats.totalRg, icon: IdCard, color: 'bg-purple-500' },
                      { name: 'Carteira Estudante', count: documentStats.totalCarteira, icon: GraduationCap, color: 'bg-amber-500' },
                    ].sort((a, b) => b.count - a.count);
                    const maxCount = services[0]?.count || 1;
                    return (
                      <div className="space-y-4">
                        {services.map((s) => {
                          const Icon = s.icon;
                          const pct = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
                          return (
                            <div key={s.name} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{s.name}</span>
                                </div>
                                <span className="font-bold">{s.count.toLocaleString('pt-BR')}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className={`${s.color} h-2 rounded-full transition-all duration-500 opacity-70`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        <div className="pt-2 border-t border-border text-center text-sm">
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-bold text-primary">{documentStats.totalDocuments.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Docs by Reseller */}
            {role === 'master' && documentStats && documentStats.byReseller.length > 0 && (
              <Card className="border-border/50 lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4 text-primary" />
                    Documentos por Revendedor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documentStats.byReseller.slice(0, 5).map((r, i) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            i === 0 ? 'bg-yellow-500 text-yellow-950' : 'bg-muted text-muted-foreground'
                          }`}>{i + 1}</span>
                          <span className="font-medium text-sm">{r.nome}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-500">{r.cnh}</span>
                          <span className="text-purple-500">{r.rg}</span>
                          <span className="text-amber-500">{r.carteira}</span>
                          <span className="font-semibold text-primary ml-1">= {r.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ═══ HISTORY TAB ═══ */}
        {activeTab === 'history' && role === 'master' && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <History className="h-4 w-4 text-primary" />
                Histórico Diário
              </CardTitle>
              <div className="flex flex-wrap gap-2 pt-2">
                <select value={masterFilterAdmin} onChange={e => setMasterFilterAdmin(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-md border border-border bg-background text-foreground">
                  <option value="all">Todos</option>
                  {masterHistoryAdmins.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
                <select value={masterFilterModule} onChange={e => setMasterFilterModule(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-md border border-border bg-background text-foreground">
                  <option value="all">Módulos</option>
                  <option value="CNH">CNH</option>
                  <option value="RG">RG</option>
                  <option value="Carteira">Carteira</option>
                  <option value="CRLV">CRLV</option>
                  <option value="Nautica">Náutica</option>
                </select>
                <input type="date" value={masterFilterDate} onChange={e => setMasterFilterDate(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-md border border-border bg-background text-foreground" />
                {(masterFilterAdmin !== 'all' || masterFilterModule !== 'all' || masterFilterDate) && (
                  <button onClick={() => { setMasterFilterAdmin('all'); setMasterFilterModule('all'); setMasterFilterDate(''); }}
                    className="text-xs px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20">Limpar</button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {masterHistoryLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : Object.keys(masterHistory).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(masterHistory).sort(([a], [b]) => b.localeCompare(a)).map(([day, items]) => {
                    const isExpanded = masterExpandedDays[day] ?? false;
                    const dayLabel = new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
                    const moduleColors: Record<string, string> = {
                      'CNH': 'bg-green-500/10 text-green-700 dark:text-green-400',
                      'RG': 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
                      'Carteira': 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                      'CRLV': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
                      'Náutica': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
                    };
                    const moduleIcons: Record<string, any> = {
                      'CNH': Car, 'RG': IdCard, 'Carteira': GraduationCap, 'CRLV': FileText, 'Náutica': Anchor
                    };
                    return (
                      <div key={day} className="border border-border/50 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setMasterExpandedDays(prev => ({ ...prev, [day]: !isExpanded }))}
                          className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm capitalize">{dayLabel}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                        </button>
                        {isExpanded && (
                          <div className="divide-y divide-border/50">
                            {items.map((svc: any, idx: number) => {
                              const ModIcon = moduleIcons[svc.modulo] || FileText;
                              return (
                                <div key={`${svc.modulo}-${svc.id}-${idx}`} className={`flex items-center justify-between px-4 py-2.5 text-sm ${svc.is_mine ? 'bg-primary/5' : ''}`}>
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${moduleColors[svc.modulo] || 'bg-muted text-muted-foreground'}`}>
                                      <ModIcon className="h-3 w-3" />{svc.modulo}
                                    </span>
                                    <span className="font-medium truncate">{svc.nome}</span>
                                    {svc.is_mine && <Badge variant="default" className="text-[9px] px-1.5 py-0">Eu</Badge>}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                                    <span className="hidden sm:inline">{svc.admin_nome}</span>
                                    <span>{new Date(svc.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhum serviço encontrado</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
