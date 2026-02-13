import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import ResellerGoals from '@/components/dashboard/ResellerGoals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Crown, Sparkles, TrendingUp, Users, Clock, FileText, IdCard, GraduationCap, Car, Trophy, Medal, Award, Wallet, BarChart3, Megaphone, History, Search, Filter, Calendar, Anchor, ChevronDown, ChevronRight } from 'lucide-react';
import { Navigate } from 'react-router-dom';
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
  const { admin, role: rawRole, credits, loading } = useAuth();
  const role = rawRole as string;
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

  // Fetch noticias and own document stats for all roles
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
        // Fetch resellers using Node.js API
        const resellers = await api.admins.getResellers(admin.id);
        
        if (resellers) {
          setTotalResellers(resellers.length);
          setRecentResellers(resellers.slice(0, 3).map((r: any) => ({
            id: r.id,
            nome: r.nome,
            created_at: r.created_at || ''
          })));

          // Top resellers by credit balance
          const sortedByCredits = [...resellers]
            .sort((a: any, b: any) => (b.creditos || 0) - (a.creditos || 0))
            .slice(0, 5)
            .map((r: any) => ({ id: r.id, nome: r.nome, creditos: r.creditos || 0 }));
          setTopCreditResellers(sortedByCredits);

          // Calculate top resellers from transactions
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

        // Buscar estatísticas de documentos para master
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

  // Fetch master daily history
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
        // Auto-expand today
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

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'dono') {
    return <Navigate to="/dashboard-dono" replace />;
  }

  const getRoleBadge = () => {
    switch (role) {
      case 'dono':
        return { label: 'Dono', stars: 3 };
      case 'master':
        return { label: 'Master', stars: 2 };
      case 'revendedor':
        return { label: 'Revendedor', stars: 1 };
      default:
        return { label: 'Usuário', stars: 0 };
    }
  };

  const roleBadge = getRoleBadge();

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      {showOnboarding && admin && (
        <OnboardingWizard
          userName={admin.nome?.split(' ')[0] || 'Usuário'}
          adminId={admin.id}
          onClose={() => setShowOnboarding(false)}
        />
      )}
      {showMasterOnboarding && admin && (
        <MasterOnboardingWizard
          userName={admin.nome?.split(' ')[0] || 'Usuário'}
          adminId={admin.id}
          onClose={() => setShowMasterOnboarding(false)}
        />
      )}
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Olá, {admin.nome}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Bem-vindo de volta ao seu painel de controle
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatsCard
            title="Créditos Disponíveis"
            value={credits.toLocaleString('pt-BR')}
            subtitle="Créditos ativos"
            variant="green"
            icon={<CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />}
          />
          <StatsCard
            title="Seu Status"
            value={`${roleBadge.label} ${'★'.repeat(roleBadge.stars)}`}
            subtitle="Nível de acesso premium"
            variant="pink"
            icon={<Crown className="h-6 w-6 sm:h-8 sm:w-8" />}
          />
          {(role === 'master' || role === 'dono') && (
            <StatsCard
              title="Total de Revendas"
              value={totalResellers}
              subtitle="Revendedores ativos"
              variant="blue"
              icon={<Users className="h-6 w-6 sm:h-8 sm:w-8" />}
            />
          )}
        </div>

        {/* Statistics Grid */}
        {(role === 'master' || role === 'dono') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Top Resellers */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Revendedores
                  <Badge variant="secondary" className="text-[10px] ml-auto">Ranking</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Revendedores que mais receberam créditos
                </p>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : topResellers.length > 0 ? (
                  <div className="space-y-3">
                    {topResellers.map((reseller, index) => (
                      <div 
                        key={reseller.id} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          index === 0 
                            ? 'bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-transparent border border-yellow-500/30 shadow-sm' 
                            : index === 1 
                              ? 'bg-gradient-to-r from-gray-400/20 via-gray-300/10 to-transparent border border-gray-400/30' 
                              : index === 2 
                                ? 'bg-gradient-to-r from-amber-600/20 via-orange-500/10 to-transparent border border-amber-600/30' 
                                : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {index === 0 ? (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
                              <Trophy className="h-4 w-4 text-yellow-950" />
                            </div>
                          ) : index === 1 ? (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                              <Medal className="h-4 w-4 text-gray-700" />
                            </div>
                          ) : index === 2 ? (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                              <Award className="h-4 w-4 text-amber-950" />
                            </div>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                          )}
                          <span className={`font-medium text-sm sm:text-base ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                            {reseller.nome}
                          </span>
                        </div>
                        <Badge variant={index === 0 ? "default" : "secondary"} className={`${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 border-0' : ''}`}>
                          <CreditCard className="h-3 w-3 mr-1" />
                          {reseller.total_received.toLocaleString('pt-BR')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    Nenhuma transferência realizada ainda
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Resellers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  Últimos Criados
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Revendedores criados recentemente
                </p>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : recentResellers.length > 0 ? (
                  <div className="space-y-3">
                    {recentResellers.map((reseller) => (
                      <div 
                        key={reseller.id} 
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-muted/50 gap-1 sm:gap-0"
                      >
                        <span className="font-medium text-sm sm:text-base">{reseller.nome}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formatDate(reseller.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    Nenhum revendedor criado ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Statistics for Master */}
        {role === 'master' && documentStats && (
          <div className="space-y-4">
            {/* Document Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{documentStats.totalDocuments}</p>
                      <p className="text-xs text-muted-foreground">Total Docs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Car className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{documentStats.totalCnh}</p>
                      <p className="text-xs text-muted-foreground">CNHs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <IdCard className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{documentStats.totalRg}</p>
                      <p className="text-xs text-muted-foreground">RGs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <GraduationCap className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{documentStats.totalCarteira}</p>
                      <p className="text-xs text-muted-foreground">Carteiras</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents by Reseller */}
            {documentStats.byReseller.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Documentos por Revendedor
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Quantidade de documentos criados por cada revendedor
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documentStats.byReseller.slice(0, 5).map((reseller, index) => (
                      <div 
                        key={reseller.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${index === 0 ? 'bg-yellow-500 text-yellow-950' : 
                              index === 1 ? 'bg-gray-400 text-gray-950' : 
                              index === 2 ? 'bg-amber-600 text-amber-950' : 
                              'bg-muted text-muted-foreground'}
                          `}>
                            {index + 1}
                          </span>
                          <span className="font-medium text-sm sm:text-base">{reseller.nome}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="flex items-center gap-1 text-green-500">
                            <Car className="h-3 w-3" />
                            {reseller.cnh}
                          </span>
                          <span className="flex items-center gap-1 text-purple-500">
                            <IdCard className="h-3 w-3" />
                            {reseller.rg}
                          </span>
                          <span className="flex items-center gap-1 text-amber-500">
                            <GraduationCap className="h-3 w-3" />
                            {reseller.carteira}
                          </span>
                          <span className="font-semibold text-primary ml-2">
                            = {reseller.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Rankings Section */}
        {(role === 'master' || role === 'dono') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Ranking by Credits */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Wallet className="h-5 w-5 text-emerald-500" />
                  Ranking por Créditos
                  <Badge variant="secondary" className="text-[10px] ml-auto">Saldo</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Revendedores com maior saldo de créditos
                </p>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : topCreditResellers.length > 0 ? (
                  <div className="space-y-3">
                    {topCreditResellers.map((reseller, index) => (
                      <div 
                        key={reseller.id} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          index === 0 
                            ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-transparent border border-emerald-500/30 shadow-sm' 
                            : index === 1 
                              ? 'bg-gradient-to-r from-emerald-400/15 via-emerald-300/5 to-transparent border border-emerald-400/20' 
                              : index === 2 
                                ? 'bg-gradient-to-r from-emerald-300/10 via-emerald-200/5 to-transparent border border-emerald-300/20' 
                                : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`
                            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                            ${index === 0 ? 'bg-emerald-500 text-white' : 
                              index === 1 ? 'bg-emerald-400/80 text-white' : 
                              index === 2 ? 'bg-emerald-300/80 text-emerald-900' : 
                              'bg-muted text-muted-foreground'}
                          `}>
                            {index + 1}
                          </span>
                          <span className={`font-medium text-sm sm:text-base ${index === 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                            {reseller.nome}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {reseller.creditos.toLocaleString('pt-BR')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    Nenhum revendedor encontrado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Most Used Services */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Serviços Mais Usados
                  <Badge variant="secondary" className="text-[10px] ml-auto">Popularidade</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ranking dos serviços mais utilizados no sistema
                </p>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : documentStats ? (() => {
                  const services = [
                    { name: 'CNH Digital', count: documentStats.totalCnh, icon: Car, color: 'text-green-500', bg: 'bg-green-500' },
                    { name: 'RG Digital', count: documentStats.totalRg, icon: IdCard, color: 'text-purple-500', bg: 'bg-purple-500' },
                    { name: 'Carteira Estudante', count: documentStats.totalCarteira, icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-500' },
                  ].sort((a, b) => b.count - a.count);
                  const maxCount = services[0]?.count || 1;

                  return (
                    <div className="space-y-4">
                      {services.map((service, index) => {
                        const Icon = service.icon;
                        const percentage = maxCount > 0 ? (service.count / maxCount) * 100 : 0;
                        return (
                          <div key={service.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`
                                  w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white
                                  ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}
                                `}>
                                  {index + 1}
                                </span>
                                <Icon className={`h-4 w-4 ${service.color}`} />
                                <span className="font-medium text-sm">{service.name}</span>
                              </div>
                              <span className="font-bold text-sm">{service.count.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div 
                                className={`${service.bg} h-2.5 rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%`, opacity: 0.7 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t border-border text-center">
                        <span className="text-sm text-muted-foreground">Total: </span>
                        <span className="font-bold text-primary">{documentStats.totalDocuments.toLocaleString('pt-BR')}</span>
                        <span className="text-sm text-muted-foreground"> documentos</span>
                      </div>
                    </div>
                  );
                })() : (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    Nenhum dado de serviço disponível
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Metas de Serviços */}
        {admin && (
          <ResellerGoals
            adminId={admin.id}
            totalDocumentsToday={myDocStats.today}
            totalDocumentsWeek={myDocStats.week}
            totalDocumentsMonth={myDocStats.month}
          />
        )}

        {/* Histórico Diário - Master */}
        {role === 'master' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <History className="h-5 w-5 text-primary" />
                Histórico Diário
                <Badge variant="secondary" className="text-[10px] ml-auto">Revendedores</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Serviços gerados pelos seus revendedores
              </p>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 pt-3">
                <select
                  value={masterFilterAdmin}
                  onChange={e => setMasterFilterAdmin(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="all">Todos os admins</option>
                  {masterHistoryAdmins.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} ({a.rank})
                    </option>
                  ))}
                </select>
                <select
                  value={masterFilterModule}
                  onChange={e => setMasterFilterModule(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="all">Todos os módulos</option>
                  <option value="CNH">CNH</option>
                  <option value="RG">RG</option>
                  <option value="Carteira">Carteira Estudante</option>
                  <option value="CRLV">CRLV</option>
                  <option value="Nautica">Náutica</option>
                </select>
                <input
                  type="date"
                  value={masterFilterDate}
                  onChange={e => setMasterFilterDate(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-md border border-border bg-background text-foreground"
                />
                {(masterFilterAdmin !== 'all' || masterFilterModule !== 'all' || masterFilterDate) && (
                  <button
                    onClick={() => { setMasterFilterAdmin('all'); setMasterFilterModule('all'); setMasterFilterDate(''); }}
                    className="text-xs px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {masterHistoryLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : Object.keys(masterHistory).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(masterHistory).sort(([a], [b]) => b.localeCompare(a)).map(([day, items]) => {
                    const isExpanded = masterExpandedDays[day] ?? false;
                    const dayLabel = new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
                    return (
                      <div key={day} className="border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setMasterExpandedDays(prev => ({ ...prev, [day]: !isExpanded }))}
                          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm capitalize">{dayLabel}</span>
                          </div>
                          <Badge variant="secondary">{items.length} serviço{items.length > 1 ? 's' : ''}</Badge>
                        </button>
                        {isExpanded && (
                          <div className="divide-y divide-border">
                            {items.map((svc: any, idx: number) => {
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
                              const ModIcon = moduleIcons[svc.modulo] || FileText;
                              return (
                                <div key={`${svc.modulo}-${svc.id}-${idx}`} className={`flex items-center justify-between px-4 py-2.5 text-sm ${svc.is_mine ? 'bg-primary/5' : ''}`}>
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${moduleColors[svc.modulo] || 'bg-muted text-muted-foreground'}`}>
                                      <ModIcon className="h-3 w-3" />
                                      {svc.modulo}
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
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum serviço encontrado para os filtros selecionados
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notícias / Comunicados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Comunicados
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fique por dentro das novidades do sistema
            </p>
          </CardHeader>
          <CardContent>
            {noticias.length > 0 ? (
              <div className="space-y-4">
                {noticias.slice(0, 5).map((noticia) => (
                  <div key={noticia.id} className="border-l-4 border-primary pl-4 py-2">
                    <h4 className="font-medium">{noticia.titulo}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {noticia.informacao}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      📅 {new Date(noticia.data_post).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm">
                Nenhum comunicado disponível
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
