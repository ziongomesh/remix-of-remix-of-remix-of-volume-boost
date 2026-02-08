import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { cnhService } from '@/lib/cnh-service';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  History, Search, IdCard, Eye, Edit, Loader2, Clock, FileText, ChevronDown, ChevronUp, ExternalLink, Trash2, AlertTriangle
} from 'lucide-react';
import CnhEditView from '@/components/cnh/CnhEditView';

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
  // all other fields
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

export default function HistoricoServicos() {
  const { admin, loading } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModule, setExpandedModule] = useState<string | null>('cnh');
  const [editingUsuario, setEditingUsuario] = useState<UsuarioRecord | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (usuarioId: number) => {
    if (!admin) return;
    setDeletingId(usuarioId);
    try {
      await cnhService.delete(admin.id, admin.session_token, usuarioId);
      toast.success('Acesso excluído com sucesso');
      fetchUsuarios();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir');
    } finally {
      setDeletingId(null);
    }
  };

  const fetchUsuarios = async () => {
    if (!admin) return;
    setLoadingData(true);
    try {
      const data = await cnhService.list(admin.id, admin.session_token);
      setUsuarios(data?.usuarios || []);
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
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
            fetchUsuarios();
            toast.success('CNH atualizada com sucesso!');
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

  const lastCreated = filteredUsuarios.length > 0 ? filteredUsuarios[0] : null;
  const restUsuarios = filteredUsuarios.slice(1);

  const formatCpf = (cpf: string) => {
    const c = cpf.replace(/\D/g, '');
    return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateStr: string | null) => {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <History className="h-6 w-6" /> Histórico de Serviços
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie seus serviços criados</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {usuarios.length} registro{usuarios.length !== 1 ? 's' : ''}
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
        ) : filteredUsuarios.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum serviço encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Último serviço criado */}
            {lastCreated && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-primary flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Último Serviço Criado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CnhHistoryCard
                    usuario={lastCreated}
                    formatCpf={formatCpf}
                    formatDate={formatDate}
                    onEdit={() => setEditingUsuario(lastCreated)}
                    onDelete={() => handleDelete(lastCreated.id)}
                    highlight
                  />
                </CardContent>
              </Card>
            )}

            {/* Módulo CNH */}
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
                      formatDate={formatDate}
                      onEdit={() => setEditingUsuario(u)}
                      onDelete={() => handleDelete(u.id)}
                    />
                  ))}
                </CardContent>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function CnhHistoryCard({
  usuario,
  formatCpf,
  formatDate,
  onEdit,
  onDelete,
  highlight,
}: {
  usuario: UsuarioRecord;
  formatCpf: (cpf: string) => string;
  formatDate: (d: string | null) => string;
  onEdit: () => void;
  onDelete: () => void;
  highlight?: boolean;
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {usuario.foto_url ? (
              <img
                src={usuario.foto_url}
                alt="Foto"
                className="h-16 w-16 object-cover rounded-full border cursor-pointer hover:ring-2 hover:ring-primary/50"
                onClick={() => setShowPreview(!showPreview)}
                {...imgProps}
              />
            ) : usuario.cnh_frente_url ? (
              <img
                src={usuario.cnh_frente_url}
                alt="CNH Frente"
                className="h-16 w-24 object-cover rounded border cursor-pointer hover:ring-2 hover:ring-primary/50"
                onClick={() => setShowPreview(!showPreview)}
                {...imgProps}
              />
            ) : null}
            <div>
              <h3 className="font-semibold text-foreground">{usuario.nome}</h3>
              <p className="text-sm text-muted-foreground">CPF: {formatCpf(usuario.cpf)}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>Cat: {usuario.categoria || '—'}</span>
                <span>UF: {usuario.uf || '—'}</span>
                <span>Criado: {formatDate(usuario.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {usuario.pdf_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={usuario.pdf_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-1" /> PDF
                </a>
              </Button>
            )}
            <Button variant="default" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Excluir acesso
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Tem certeza que deseja excluir o acesso de <strong>{usuario.nome}</strong>?</p>
                    <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm text-destructive">
                      <strong>⚠️ Atenção:</strong> Esta ação é irreversível. O crédito utilizado <strong>não será devolvido</strong> e todos os arquivos (matrizes, PDF, QR code) serão permanentemente apagados.
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Preview expandido das 3 matrizes */}
        {showPreview && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
            {usuario.cnh_frente_url && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Frente</p>
                <img
                  src={usuario.cnh_frente_url}
                  alt="Frente"
                  className="w-full rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setExpandedImage(usuario.cnh_frente_url)}
                  {...imgProps}
                />
              </div>
            )}
            {usuario.cnh_meio_url && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Meio</p>
                <img
                  src={usuario.cnh_meio_url}
                  alt="Meio"
                  className="w-full rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setExpandedImage(usuario.cnh_meio_url)}
                  {...imgProps}
                />
              </div>
            )}
            {usuario.cnh_verso_url && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Verso</p>
                <img
                  src={usuario.cnh_verso_url}
                  alt="Verso"
                  className="w-full rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setExpandedImage(usuario.cnh_verso_url)}
                  {...imgProps}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de imagem expandida */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
          onClick={() => setExpandedImage(null)}
          onContextMenu={preventContext}
        >
          <img
            src={expandedImage}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            {...imgProps}
          />
        </div>
      )}
    </>
  );
}
