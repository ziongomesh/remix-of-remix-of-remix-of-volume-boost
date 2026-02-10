import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
  Crown, Users, CreditCard, FileText, Shield, Eye, KeyRound, Send,
  Car, IdCard, GraduationCap, Truck, Ship, Trophy, Medal, Award,
  ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Activity,
  Search, RefreshCw
} from 'lucide-react';

interface Overview {
  totalMasters: number;
  totalResellers: number;
  totalCredits: number;
  totalTransactions: number;
  totalRevenue: number;
  documents: {
    cnh: number;
    rg: number;
    carteira: number;
    crlv: number;
    cha: number;
    total: number;
  };
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

interface TopReseller {
  id: number;
  nome: string;
  email: string;
  creditos: number;
  total_services: number;
  last_active: string | null;
}

export default function DashboardDono() {
  const { admin, role, credits, loading, refreshCredits } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [allAdmins, setAllAdmins] = useState<AdminItem[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [topResellers, setTopResellers] = useState<TopReseller[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [auditFilter, setAuditFilter] = useState<string>('');
  const [adminSearch, setAdminSearch] = useState('');

  // Dialog states
  const [passwordDialog, setPasswordDialog] = useState<{ open: boolean; admin: AdminItem | null }>({ open: false, admin: null });
  const [transferDialog, setTransferDialog] = useState<{ open: boolean; admin: AdminItem | null }>({ open: false, admin: null });
  const [newPassword, setNewPassword] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  useEffect(() => {
    if (admin && role === 'dono') {
      fetchAllData();
    }
  }, [admin, role]);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const [overviewData, adminsData, auditData, topData] = await Promise.all([
        (api as any).owner.getOverview(),
        (api as any).owner.getAllAdmins(),
        (api as any).owner.getAuditLog(),
        (api as any).owner.getTopResellers(),
      ]);
      setOverview(overviewData);
      setAllAdmins(adminsData);
      setAuditLog(auditData);
      setTopResellers(topData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do painel');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordDialog.admin || !newPassword) return;
    try {
      await (api as any).owner.changePassword(passwordDialog.admin.id, newPassword);
      toast.success(`Senha de ${passwordDialog.admin.nome} alterada com sucesso!`);
      setPasswordDialog({ open: false, admin: null });
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    }
  };

  const handleTransferCredits = async () => {
    if (!transferDialog.admin || !transferAmount) return;
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }
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
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;
  if (role !== 'dono') return <Navigate to="/dashboard" replace />;

  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'dono': return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 border-0"><Crown className="h-3 w-3 mr-1" />Dono</Badge>;
      case 'master': return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0"><Shield className="h-3 w-3 mr-1" />Master</Badge>;
      default: return <Badge variant="secondary">Revendedor</Badge>;
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

  const filteredAdmins = allAdmins.filter(a =>
    !adminSearch || a.nome.toLowerCase().includes(adminSearch.toLowerCase()) || a.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

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
          <Button variant="outline" size="sm" onClick={fetchAllData} disabled={loadingData}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="admins" className="text-xs sm:text-sm">Admins</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs sm:text-sm">Histórico</TabsTrigger>
            <TabsTrigger value="ranking" className="text-xs sm:text-sm">Ranking</TabsTrigger>
          </TabsList>

          {loadingData ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6">
                {overview && (
                  <>
                    {/* Main Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-2xl font-bold">{overview.totalMasters}</p>
                              <p className="text-xs text-muted-foreground">Masters</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="text-2xl font-bold">{overview.totalResellers}</p>
                              <p className="text-xs text-muted-foreground">Revendedores</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-2xl font-bold">{overview.totalCredits?.toLocaleString('pt-BR')}</p>
                              <p className="text-xs text-muted-foreground">Créditos</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-amber-500" />
                            <div>
                              <p className="text-2xl font-bold">{overview.totalTransactions}</p>
                              <p className="text-xs text-muted-foreground">Transações</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-500" />
                            <div>
                              <p className="text-2xl font-bold">R$ {overview.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                              <p className="text-xs text-muted-foreground">Faturamento</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Document Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileText className="h-5 w-5 text-primary" />
                          Documentos Criados no Sistema
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                          {[
                            { label: 'CNH', count: overview.documents.cnh, icon: Car, color: 'text-green-500' },
                            { label: 'RG', count: overview.documents.rg, icon: IdCard, color: 'text-purple-500' },
                            { label: 'Carteira', count: overview.documents.carteira, icon: GraduationCap, color: 'text-amber-500' },
                            { label: 'CRLV', count: overview.documents.crlv, icon: Truck, color: 'text-blue-500' },
                            { label: 'Náutica', count: overview.documents.cha, icon: Ship, color: 'text-cyan-500' },
                            { label: 'Total', count: overview.documents.total, icon: FileText, color: 'text-primary' },
                          ].map(item => (
                            <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <item.icon className={`h-5 w-5 ${item.color}`} />
                              <div>
                                <p className="text-xl font-bold">{item.count.toLocaleString('pt-BR')}</p>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Your balance */}
                    <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/20">
                            <CreditCard className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Seu Saldo</p>
                            <p className="text-3xl font-bold">{credits.toLocaleString('pt-BR')} <span className="text-sm font-normal text-muted-foreground">créditos</span></p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* ADMINS TAB */}
              <TabsContent value="admins" className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar admin..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Badge variant="secondary">{filteredAdmins.length} admins</Badge>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Admin</TableHead>
                            <TableHead>Rank</TableHead>
                            <TableHead>Créditos</TableHead>
                            <TableHead>Criado por</TableHead>
                            <TableHead>Último Acesso</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAdmins.map((adm) => (
                            <TableRow key={adm.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{adm.nome}</p>
                                  <p className="text-xs text-muted-foreground">{adm.email}</p>
                                </div>
                              </TableCell>
                              <TableCell>{getRankBadge(adm.rank)}</TableCell>
                              <TableCell>
                                <span className="font-semibold">{adm.creditos.toLocaleString('pt-BR')}</span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {adm.criado_por_nome || '-'}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {adm.last_active ? formatDate(adm.last_active) : 'Nunca'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setAuditFilter(String(adm.id));
                                      handleFilterAudit(adm.id);
                                      setActiveTab('audit');
                                    }}
                                    title="Ver histórico"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setPasswordDialog({ open: true, admin: adm });
                                      setNewPassword('');
                                    }}
                                    title="Alterar senha"
                                  >
                                    <KeyRound className="h-4 w-4" />
                                  </Button>
                                  {adm.rank !== 'dono' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setTransferDialog({ open: true, admin: adm });
                                        setTransferAmount('');
                                      }}
                                      title="Transferir créditos"
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AUDIT LOG TAB */}
              <TabsContent value="audit" className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Select value={auditFilter} onValueChange={(val) => {
                    setAuditFilter(val);
                    handleFilterAudit(val === 'all' ? undefined : parseInt(val));
                  }}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Filtrar por admin..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os admins</SelectItem>
                      {allAdmins.map(a => (
                        <SelectItem key={a.id} value={String(a.id)}>{a.nome} ({a.rank})</SelectItem>
                      ))}
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
                                  <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    Transferência
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                                    <ArrowDownRight className="h-3 w-3 mr-1" />
                                    Recarga
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {entry.type === 'service' ? (
                                  <div>
                                    <p className="text-sm font-medium">{entry.nome_documento}</p>
                                    <p className="text-xs text-muted-foreground">CPF: {entry.cpf}</p>
                                  </div>
                                ) : entry.type === 'transfer' ? (
                                  <div>
                                    <p className="text-sm">{entry.from_nome} → {entry.to_nome}</p>
                                    <p className="text-xs font-semibold text-primary">{entry.amount} créditos</p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-sm">{entry.to_nome}</p>
                                    <p className="text-xs font-semibold text-green-600">+{entry.amount} créditos {entry.total_price ? `(R$ ${entry.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : ''}</p>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {entry.type === 'service' ? entry.admin_nome : entry.type === 'transfer' ? entry.from_nome : entry.to_nome}
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-sm">
                                  {entry.type === 'service'
                                    ? entry.admin_saldo_atual?.toLocaleString('pt-BR')
                                    : entry.type === 'transfer'
                                      ? `${entry.from_saldo_atual?.toLocaleString('pt-BR')} / ${entry.to_saldo_atual?.toLocaleString('pt-BR')}`
                                      : entry.to_saldo_atual?.toLocaleString('pt-BR')
                                  }
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(entry.created_at)}
                              </TableCell>
                            </TableRow>
                          ))}
                          {auditLog.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                Nenhum registro encontrado
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* RANKING TAB */}
              <TabsContent value="ranking" className="space-y-4">
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Top Revendedores
                    </CardTitle>
                    <CardDescription>Ranking por total de serviços realizados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topResellers.length > 0 ? (
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
                              <div>
                                <span className={`font-medium text-sm sm:text-base ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                                  {reseller.nome}
                                </span>
                                <p className="text-xs text-muted-foreground">{reseller.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary">
                                <CreditCard className="h-3 w-3 mr-1" />
                                {reseller.creditos.toLocaleString('pt-BR')}
                              </Badge>
                              <Badge variant={index === 0 ? "default" : "outline"} className={index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 border-0' : ''}>
                                <Activity className="h-3 w-3 mr-1" />
                                {reseller.total_services} serviços
                              </Badge>
                            </div>
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
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog.open} onOpenChange={(o) => setPasswordDialog({ open: o, admin: o ? passwordDialog.admin : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Alterar Senha
            </DialogTitle>
            <DialogDescription>
              Alterar senha de <strong>{passwordDialog.admin?.nome}</strong> ({passwordDialog.admin?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Nova senha (mín. 4 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
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
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Transferir Créditos
            </DialogTitle>
            <DialogDescription>
              Transferir para <strong>{transferDialog.admin?.nome}</strong> (saldo atual: {transferDialog.admin?.creditos.toLocaleString('pt-BR')})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Seu saldo: <strong>{credits.toLocaleString('pt-BR')}</strong> créditos</p>
              <Input
                type="number"
                placeholder="Quantidade de créditos"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min={1}
                max={credits}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialog({ open: false, admin: null })}>Cancelar</Button>
            <Button onClick={handleTransferCredits} disabled={!transferAmount || parseInt(transferAmount) <= 0 || parseInt(transferAmount) > credits}>
              Transferir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
