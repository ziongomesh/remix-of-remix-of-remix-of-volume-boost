import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { cnhService } from '@/lib/cnh-service';
import { rgService, type RgRecord } from '@/lib/rg-service';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  History, Search, IdCard, Eye, Edit, Loader2, Clock, FileText, ChevronDown, ChevronUp, ExternalLink, Trash2, AlertTriangle, CreditCard, RefreshCw, Timer
} from 'lucide-react';
import CnhEditView from '@/components/cnh/CnhEditView';
import RgEditView from '@/components/rg/RgEditView';

interface UsuarioRecord {
  id: number;
  cpf: string;
  nome: string;
  categoria: string | null;
  uf: string | null;
  data_emissao: string | null;
  data_validade: string | null;
  created_at: string | null;
  data_expiracao: string | null;
  pdf_url: string | null;
  cnh_frente_url: string | null;
  cnh_meio_url: string | null;
  cnh_verso_url: string | null;
  foto_url: string | null;
  data_nascimento: string | null;
  sexo: string | null;
  nacionalidade: string | null;
  doc_identidade: string | null;
  numero_registro: string | null;
  hab: string | null;
  pai: string | null;
  mae: string | null;
  local_emissao: string | null;
  estado_extenso: string | null;
  espelho: string | null;
  codigo_seguranca: string | null;
  renach: string | null;
  obs: string | null;
  matriz_final: string | null;
  cnh_definitiva: string | null;
  senha: string | null;
  admin_id: number;
}

// Helper: days until expiration
function daysUntilExpiration(dataExpiracao: string | null): number | null {
  if (!dataExpiracao) return null;
  const exp = new Date(dataExpiracao);
  const now = new Date();
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function ExpirationBadge({ dataExpiracao }: { dataExpiracao: string | null }) {
  const days = daysUntilExpiration(dataExpiracao);
  if (days === null) return null;

  if (days <= 0) {
    return (
      <Badge variant="destructive" className="text-[10px] gap-1">
        <Timer className="h-3 w-3" /> Expirado
      </Badge>
    );
  }
  if (days <= 5) {
    return (
      <Badge className="text-[10px] gap-1 bg-orange-500 text-white border-orange-500">
        <Timer className="h-3 w-3" /> {days}d restante{days > 1 ? 's' : ''}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
      <Clock className="h-3 w-3" /> Expira {new Date(dataExpiracao).toLocaleDateString('pt-BR')}
    </Badge>
  );
}

export default function HistoricoServicos() {
  const { admin, loading, refreshCredits } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioRecord[]>([]);
  const [rgRegistros, setRgRegistros] = useState<RgRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModule, setExpandedModule] = useState<string | null>('cnh');
  const [editingUsuario, setEditingUsuario] = useState<UsuarioRecord | null>(null);
  const [editingRg, setEditingRg] = useState<RgRecord | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const handleDeleteCnh = async (usuarioId: number) => {
    if (!admin) return;
    setDeletingId(usuarioId);
    try {
      await cnhService.delete(admin.id, admin.session_token, usuarioId);
      toast.success('Acesso excluído com sucesso');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteRg = async (rgId: number) => {
    if (!admin) return;
    setDeletingId(rgId);
    try {
      await rgService.delete(admin.id, admin.session_token, rgId);
      toast.success('RG excluído com sucesso');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRenewCnh = async (recordId: number) => {
    if (!admin) return;
    const key = `cnh-${recordId}`;
    setRenewingId(key);
    try {
      const result = await cnhService.renew(admin.id, admin.session_token, recordId);
      toast.success('CNH renovada! +45 dias de validade');
      await refreshCredits();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao renovar');
    } finally {
      setRenewingId(null);
    }
  };

  const handleRenewRg = async (recordId: number) => {
    if (!admin) return;
    const key = `rg-${recordId}`;
    setRenewingId(key);
    try {
      const result = await rgService.renew(admin.id, admin.session_token, recordId);
      toast.success('RG renovado! +45 dias de validade');
      await refreshCredits();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao renovar');
    } finally {
      setRenewingId(null);
    }
  };

  const fetchData = async () => {
    if (!admin) return;
    setLoadingData(true);
    try {
      const [cnhData, rgData] = await Promise.all([
        cnhService.list(admin.id, admin.session_token),
        rgService.list(admin.id, admin.session_token),
      ]);
      setUsuarios(cnhData?.usuarios || []);
      setRgRegistros(rgData?.registros || []);
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [admin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  if (editingUsuario) {
    return (
      <DashboardLayout>
        <CnhEditView
          usuario={editingUsuario}
          onClose={() => setEditingUsuario(null)}
          onSaved={() => {
            setEditingUsuario(null);
            fetchData();
            toast.success('CNH atualizada com sucesso!');
          }}
        />
      </DashboardLayout>
    );
  }

  if (editingRg) {
    return (
      <DashboardLayout>
        <RgEditView
          registro={editingRg}
          onClose={() => setEditingRg(null)}
          onSaved={() => {
            setEditingRg(null);
            fetchData();
            toast.success('RG atualizado com sucesso!');
          }}
        />
      </DashboardLayout>
    );
  }

  const filteredUsuarios = usuarios.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.nome.toLowerCase().includes(q) || u.cpf.includes(q);
  });

  const filteredRgs = rgRegistros.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nome = r.nome_completo || r.nome || '';
    return nome.toLowerCase().includes(q) || r.cpf.includes(q);
  });

  const totalRecords = filteredUsuarios.length + filteredRgs.length;

  // Records expiring within 5 days
  const expiringCnhs = usuarios.filter(u => {
    const days = daysUntilExpiration(u.data_expiracao);
    return days !== null && days >= 0 && days <= 5;
  });
  const expiringRgs = rgRegistros.filter(r => {
    const days = daysUntilExpiration(r.data_expiracao);
    return days !== null && days >= 0 && days <= 5;
  });
  const totalExpiring = expiringCnhs.length + expiringRgs.length;

  // Last created across both types
  const allRecords = [
    ...filteredUsuarios.map(u => ({ type: 'cnh' as const, data: u, created: u.created_at })),
    ...filteredRgs.map(r => ({ type: 'rg' as const, data: r, created: r.created_at })),
  ].sort((a, b) => {
    const da = a.created ? new Date(a.created).getTime() : 0;
    const db = b.created ? new Date(b.created).getTime() : 0;
    return db - da;
  });

  const lastCreated = allRecords.length > 0 ? allRecords[0] : null;

  const formatCpf = (cpf: string) => {
    const c = cpf.replace(/\D/g, '');
    return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDateStr = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <History className="h-5 w-5 sm:h-6 sm:w-6" /> Histórico de Serviços
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Gerencie seus serviços criados</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {totalRecords} registro{totalRecords !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando histórico...</span>
          </div>
        ) : totalRecords === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum serviço encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Serviços próximos a expirar */}
            {totalExpiring > 0 && (
              <Card className="border-orange-500/40 bg-orange-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Serviços Próximos a Expirar ({totalExpiring})
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Estes serviços expiram em 5 dias ou menos. Renove por 1 crédito para +45 dias.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {expiringCnhs.map(u => (
                    <CnhHistoryCard
                      key={`exp-cnh-${u.id}`}
                      usuario={u}
                      formatCpf={formatCpf}
                      formatDate={formatDateStr}
                      onEdit={() => setEditingUsuario(u)}
                      onDelete={() => handleDeleteCnh(u.id)}
                      onRenew={() => handleRenewCnh(u.id)}
                      renewingId={renewingId}
                      highlight
                      showExpiring
                    />
                  ))}
                  {expiringRgs.map(r => (
                    <RgHistoryCard
                      key={`exp-rg-${r.id}`}
                      registro={r}
                      formatCpf={formatCpf}
                      formatDate={formatDateStr}
                      onEdit={() => setEditingRg(r)}
                      onDelete={() => handleDeleteRg(r.id)}
                      onRenew={() => handleRenewRg(r.id)}
                      renewingId={renewingId}
                      highlight
                      showExpiring
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Último serviço criado */}
            {lastCreated && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-primary flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Último Serviço Criado ({lastCreated.type === 'cnh' ? 'CNH' : 'RG'})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lastCreated.type === 'cnh' ? (
                    <CnhHistoryCard
                      usuario={lastCreated.data as UsuarioRecord}
                      formatCpf={formatCpf}
                      formatDate={formatDateStr}
                      onEdit={() => setEditingUsuario(lastCreated.data as UsuarioRecord)}
                      onDelete={() => handleDeleteCnh((lastCreated.data as UsuarioRecord).id)}
                      onRenew={() => handleRenewCnh((lastCreated.data as UsuarioRecord).id)}
                      renewingId={renewingId}
                      highlight
                    />
                  ) : (
                    <RgHistoryCard
                      registro={lastCreated.data as RgRecord}
                      formatCpf={formatCpf}
                      formatDate={formatDateStr}
                      onEdit={() => setEditingRg(lastCreated.data as RgRecord)}
                      onDelete={() => handleDeleteRg((lastCreated.data as RgRecord).id)}
                      onRenew={() => handleRenewRg((lastCreated.data as RgRecord).id)}
                      renewingId={renewingId}
                      highlight
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Módulo CNH */}
            {filteredUsuarios.length > 0 && (
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedModule(expandedModule === 'cnh' ? null : 'cnh')}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IdCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-base">CNH Digital</span>
                        <p className="text-sm text-muted-foreground font-normal">{filteredUsuarios.length} registro{filteredUsuarios.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    {expandedModule === 'cnh' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </CardTitle>
                </CardHeader>
                {expandedModule === 'cnh' && (
                  <CardContent className="space-y-3 pt-0">
                    {filteredUsuarios.map((u) => (
                      <CnhHistoryCard
                        key={u.id}
                        usuario={u}
                        formatCpf={formatCpf}
                        formatDate={formatDateStr}
                        onEdit={() => setEditingUsuario(u)}
                        onDelete={() => handleDeleteCnh(u.id)}
                        onRenew={() => handleRenewCnh(u.id)}
                        renewingId={renewingId}
                      />
                    ))}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Módulo RG */}
            {filteredRgs.length > 0 && (
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedModule(expandedModule === 'rg' ? null : 'rg')}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <span className="text-base">RG Digital</span>
                        <p className="text-sm text-muted-foreground font-normal">{filteredRgs.length} registro{filteredRgs.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    {expandedModule === 'rg' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </CardTitle>
                </CardHeader>
                {expandedModule === 'rg' && (
                  <CardContent className="space-y-3 pt-0">
                    {filteredRgs.map((r) => (
                      <RgHistoryCard
                        key={r.id}
                        registro={r}
                        formatCpf={formatCpf}
                        formatDate={formatDateStr}
                        onEdit={() => setEditingRg(r)}
                        onDelete={() => handleDeleteRg(r.id)}
                        onRenew={() => handleRenewRg(r.id)}
                        renewingId={renewingId}
                      />
                    ))}
                  </CardContent>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ======== Renew Button (shared) ========
function RenewButton({ id, type, onRenew, renewingId }: { id: number; type: 'cnh' | 'rg'; onRenew: () => void; renewingId: string | null }) {
  const key = `${type}-${id}`;
  const isRenewing = renewingId === key;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700" disabled={isRenewing}>
          {isRenewing ? <Loader2 className="h-4 w-4 animate-spin sm:mr-1" /> : <RefreshCw className="h-4 w-4 sm:mr-1" />}
          <span className="hidden sm:inline">Renovar</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-orange-500" />
            Renovar serviço
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Deseja renovar este serviço por mais <strong>45 dias</strong>?</p>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-3 text-sm text-orange-700 dark:text-orange-400">
              <strong>💳 Custo:</strong> 1 crédito será descontado do seu saldo.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onRenew} className="bg-orange-500 text-white hover:bg-orange-600">
            Renovar por 1 crédito
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ======== CNH Card ========
function CnhHistoryCard({
  usuario, formatCpf, formatDate, onEdit, onDelete, onRenew, renewingId, highlight, showExpiring,
}: {
  usuario: UsuarioRecord;
  formatCpf: (cpf: string) => string;
  formatDate: (d: string | null) => string;
  onEdit: () => void;
  onDelete: () => void;
  onRenew: () => void;
  renewingId: string | null;
  highlight?: boolean;
  showExpiring?: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const preventDrag = (e: React.DragEvent) => e.preventDefault();
  const preventContext = (e: React.MouseEvent) => e.preventDefault();
  const imgProps = {
    draggable: false,
    onDragStart: preventDrag,
    onContextMenu: preventContext,
    style: { userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties,
  };

  return (
    <>
      <div className={`border rounded-lg p-4 ${highlight ? 'border-primary/30' : 'border-border'} hover:bg-muted/20 transition-colors`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {usuario.foto_url ? (
              <img src={usuario.foto_url} alt="Foto" className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-full border cursor-pointer hover:ring-2 hover:ring-muted-foreground/30 shrink-0" onClick={() => setShowPreview(!showPreview)} {...imgProps} />
            ) : usuario.cnh_frente_url ? (
              <img src={usuario.cnh_frente_url} alt="CNH Frente" className="h-12 w-16 sm:h-16 sm:w-24 object-cover rounded border cursor-pointer hover:ring-2 hover:ring-muted-foreground/30 shrink-0" onClick={() => setShowPreview(!showPreview)} {...imgProps} />
            ) : null}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{usuario.nome}</h3>
                <ExpirationBadge dataExpiracao={usuario.data_expiracao} />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">CPF: {formatCpf(usuario.cpf)}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-muted-foreground">
                <span>Cat: {usuario.categoria || '—'}</span>
                <span>UF: {usuario.uf || '—'}</span>
                <span>Criado: {formatDate(usuario.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <RenewButton id={usuario.id} type="cnh" onRenew={onRenew} renewingId={renewingId} />
            {usuario.pdf_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={usuario.pdf_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">PDF</span>
                </a>
              </Button>
            )}
            <Button variant="default" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Editar</span>
            </Button>
            <DeleteButton nome={usuario.nome} onDelete={onDelete} />
          </div>
        </div>

        {showPreview && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
            {usuario.cnh_frente_url && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Frente</p>
                <img src={usuario.cnh_frente_url} alt="Frente" className="w-full rounded border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setExpandedImage(usuario.cnh_frente_url)} {...imgProps} />
              </div>
            )}
            {usuario.cnh_meio_url && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Meio</p>
                <img src={usuario.cnh_meio_url} alt="Meio" className="w-full rounded border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setExpandedImage(usuario.cnh_meio_url)} {...imgProps} />
              </div>
            )}
            {usuario.cnh_verso_url && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Verso</p>
                <img src={usuario.cnh_verso_url} alt="Verso" className="w-full rounded border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setExpandedImage(usuario.cnh_verso_url)} {...imgProps} />
              </div>
            )}
          </div>
        )}
      </div>

      {expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setExpandedImage(null)} onContextMenu={preventContext}>
          <img src={expandedImage} alt="Preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} {...imgProps} />
        </div>
      )}
    </>
  );
}

// ======== RG Card ========
function RgHistoryCard({
  registro, formatCpf, formatDate, onEdit, onDelete, onRenew, renewingId, highlight, showExpiring,
}: {
  registro: RgRecord;
  formatCpf: (cpf: string) => string;
  formatDate: (d: string | null) => string;
  onEdit: () => void;
  onDelete: () => void;
  onRenew: () => void;
  renewingId: string | null;
  highlight?: boolean;
  showExpiring?: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const preventDrag = (e: React.DragEvent) => e.preventDefault();
  const preventContext = (e: React.MouseEvent) => e.preventDefault();
  const imgProps = {
    draggable: false,
    onDragStart: preventDrag,
    onContextMenu: preventContext,
    style: { userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties,
  };

  const nome = registro.nome_completo || registro.nome || '';

  return (
    <>
      <div className={`border rounded-lg p-4 ${highlight ? 'border-primary/30' : 'border-border'} hover:bg-muted/20 transition-colors`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {registro.foto_url ? (
              <img src={registro.foto_url} alt="Foto" className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-full border cursor-pointer hover:ring-2 hover:ring-muted-foreground/30 shrink-0" onClick={() => setShowPreview(!showPreview)} {...imgProps} />
            ) : registro.rg_frente_url ? (
              <img src={registro.rg_frente_url} alt="RG Frente" className="h-12 w-16 sm:h-16 sm:w-24 object-cover rounded border cursor-pointer hover:ring-2 hover:ring-muted-foreground/30 shrink-0" onClick={() => setShowPreview(!showPreview)} {...imgProps} />
            ) : null}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{nome}</h3>
                <ExpirationBadge dataExpiracao={registro.data_expiracao} />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">CPF: {formatCpf(registro.cpf)}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-muted-foreground">
                <span>UF: {registro.uf || '—'}</span>
                <span>Criado: {formatDate(registro.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <RenewButton id={registro.id} type="rg" onRenew={onRenew} renewingId={renewingId} />
            {registro.pdf_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={registro.pdf_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">PDF</span>
                </a>
              </Button>
            )}
            <Button variant="default" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Editar</span>
            </Button>
            <DeleteButton nome={nome} onDelete={onDelete} />
          </div>
        </div>

        {showPreview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
            {registro.rg_frente_url && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Frente</p>
                <img src={registro.rg_frente_url} alt="Frente" className="w-full rounded border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setExpandedImage(registro.rg_frente_url)} {...imgProps} />
              </div>
            )}
            {registro.rg_verso_url && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Verso</p>
                <img src={registro.rg_verso_url} alt="Verso" className="w-full rounded border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setExpandedImage(registro.rg_verso_url)} {...imgProps} />
              </div>
            )}
          </div>
        )}
      </div>

      {expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setExpandedImage(null)} onContextMenu={preventContext}>
          <img src={expandedImage} alt="Preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} {...imgProps} />
        </div>
      )}
    </>
  );
}

// ======== Delete Button (shared) ========
function DeleteButton({ nome, onDelete }: { nome: string; onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Excluir</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Excluir acesso
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Tem certeza que deseja excluir o acesso de <strong>{nome}</strong>?</p>
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm text-destructive">
              <strong>⚠️ Atenção:</strong> Esta ação é irreversível. O crédito utilizado <strong>não será devolvido</strong> e todos os arquivos serão permanentemente apagados.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Excluir permanentemente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
