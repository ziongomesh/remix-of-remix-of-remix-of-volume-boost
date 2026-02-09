import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Smartphone, Apple, Copy, Check, Save, Loader2, ChevronDown, CreditCard, Shield, GraduationCap, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Downloads() {
  const { admin, loading, role } = useAuth();
  const [cnhIphone, setCnhIphone] = useState('');
  const [cnhApk, setCnhApk] = useState('');
  const [govbrIphone, setGovbrIphone] = useState('');
  const [govbrApk, setGovbrApk] = useState('');
  const [abafeIphone, setAbafeIphone] = useState('');
  const [abafeApk, setAbafeApk] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [cnhOpen, setCnhOpen] = useState(false);
  const [govbrOpen, setGovbrOpen] = useState(false);
  const [abafeOpen, setAbafeOpen] = useState(false);

  const isDono = role === 'dono';

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoadingData(true);
    try {
      const { data } = await supabase
        .from('downloads')
        .select('cnh_iphone, cnh_apk, govbr_iphone, govbr_apk, abafe_apk, abafe_iphone')
        .eq('id', 1)
        .maybeSingle();

      if (data) {
        setCnhIphone(data.cnh_iphone || '');
        setCnhApk(data.cnh_apk || '');
        setGovbrIphone(data.govbr_iphone || '');
        setGovbrApk(data.govbr_apk || '');
        setAbafeApk((data as any).abafe_apk || '');
        setAbafeIphone((data as any).abafe_iphone || '');
      }
    } catch (err) {
      console.error('Erro ao carregar links:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!admin) return;
    setSaving(true);
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
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) {
      toast.error('Nenhum link para copiar');
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Link copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Download className="h-6 w-6" /> Downloads
          </h1>
          <p className="text-muted-foreground mt-1">Aplicativos disponíveis para download</p>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* CNH Digital 2026 */}
            <DownloadModule
              title="CNH Digital 2026"
              description="Aplicativo para visualização da CNH Digital"
              icon={CreditCard}
              open={cnhOpen}
              onToggle={() => setCnhOpen(!cnhOpen)}
              iphoneLink={cnhIphone}
              apkLink={cnhApk}
              copiedField={copiedField}
              onCopy={copyToClipboard}
              iphoneField="cnh_iphone"
              apkField="cnh_apk"
            />

            {/* Gov.br */}
            <DownloadModule
              title="Gov.br"
              description="RG Digital e CNH Náutica Arrais inclusos"
              icon={Shield}
              open={govbrOpen}
              onToggle={() => setGovbrOpen(!govbrOpen)}
              iphoneLink={govbrIphone}
              apkLink={govbrApk}
              copiedField={copiedField}
              onCopy={copyToClipboard}
              iphoneField="govbr_iphone"
              apkField="govbr_apk"
            />

            {/* ABAFE */}
            <DownloadModule
              title="ABAFE - Carteira Estudante"
              description="Aplicativo da Carteira de Estudante digital"
              icon={GraduationCap}
              open={abafeOpen}
              onToggle={() => setAbafeOpen(!abafeOpen)}
              iphoneLink={abafeIphone}
              apkLink={abafeApk}
              copiedField={copiedField}
              onCopy={copyToClipboard}
              iphoneField="abafe_iphone"
              apkField="abafe_apk"
            />

            {/* Edição (apenas dono) */}
            {isDono && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-base">Gerenciar Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CNH Digital 2026</p>
                  <div className="space-y-2">
                    <Label>Link CNH iPhone</Label>
                    <Input value={cnhIphone} onChange={(e) => setCnhIphone(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Link CNH Android (APK)</Label>
                    <Input value={cnhApk} onChange={(e) => setCnhApk(e.target.value)} placeholder="https://..." />
                  </div>

                  <div className="border-t pt-4 mt-4" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gov.br</p>
                  <div className="space-y-2">
                    <Label>Link Gov.br iPhone</Label>
                    <Input value={govbrIphone} onChange={(e) => setGovbrIphone(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Link Gov.br Android (APK)</Label>
                    <Input value={govbrApk} onChange={(e) => setGovbrApk(e.target.value)} placeholder="https://..." />
                  </div>

                  <div className="border-t pt-4 mt-4" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ABAFE - Carteira Estudante</p>
                  <div className="space-y-2">
                    <Label>Link ABAFE iPhone</Label>
                    <Input value={abafeIphone} onChange={(e) => setAbafeIphone(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Link ABAFE Android (APK)</Label>
                    <Input value={abafeApk} onChange={(e) => setAbafeApk(e.target.value)} placeholder="https://..." />
                  </div>

                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Links
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ======== Reusable Download Module ========
function DownloadModule({
  title, description, icon: Icon, open, onToggle,
  iphoneLink, apkLink, copiedField, onCopy, iphoneField, apkField,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  open: boolean;
  onToggle: () => void;
  iphoneLink: string;
  apkLink: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  iphoneField: string;
  apkField: string;
}) {
  const hasAnyLink = !!iphoneLink || !!apkLink;

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center justify-between cursor-pointer p-5 hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              {!hasAnyLink && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Wrench className="h-3 w-3" /> Manutenção
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
          {!hasAnyLink ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Wrench className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Em Manutenção</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Links serão disponibilizados em breve.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* iPhone */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${iphoneLink ? 'bg-card hover:bg-muted/20' : 'bg-muted/20 opacity-60'} transition-colors`}>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Apple className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">iPhone</p>
                  <p className="text-[10px] text-muted-foreground">{iphoneLink ? 'Link disponível' : 'Indisponível'}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={(e) => { e.stopPropagation(); onCopy(iphoneLink, iphoneField); }}
                  disabled={!iphoneLink}
                >
                  {copiedField === iphoneField ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              {/* Android */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${apkLink ? 'bg-card hover:bg-muted/20' : 'bg-muted/20 opacity-60'} transition-colors`}>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Android (APK)</p>
                  <p className="text-[10px] text-muted-foreground">{apkLink ? 'Link disponível' : 'Indisponível'}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={(e) => { e.stopPropagation(); onCopy(apkLink, apkField); }}
                  disabled={!apkLink}
                >
                  {copiedField === apkField ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
