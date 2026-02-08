import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Smartphone, Apple, Copy, Check, Save, Loader2 } from 'lucide-react';

export default function Downloads() {
  const { admin, loading, role } = useAuth();
  const [cnhIphone, setCnhIphone] = useState('');
  const [cnhApk, setCnhApk] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isDono = role === 'dono';

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('cnh_iphone, cnh_apk')
        .eq('id', 1)
        .maybeSingle();

      if (data) {
        setCnhIphone(data.cnh_iphone || '');
        setCnhApk(data.cnh_apk || '');
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
          <p className="text-muted-foreground mt-1">Aplicativos CNH Digital</p>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* CNH iPhone */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Apple className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">CNH Digital - iPhone</h3>
                    <p className="text-sm text-muted-foreground truncate">{cnhIphone || 'Nenhum link configurado'}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(cnhIphone, 'iphone')}
                    disabled={!cnhIphone}
                  >
                    {copiedField === 'iphone' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copiedField === 'iphone' ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CNH APK */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                    <Smartphone className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">CNH Digital - Android (APK)</h3>
                    <p className="text-sm text-muted-foreground truncate">{cnhApk || 'Nenhum link configurado'}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(cnhApk, 'apk')}
                    disabled={!cnhApk}
                  >
                    {copiedField === 'apk' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copiedField === 'apk' ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Edição (apenas dono) */}
            {isDono && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-base">Gerenciar Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Link CNH iPhone</Label>
                    <Input
                      value={cnhIphone}
                      onChange={(e) => setCnhIphone(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link CNH Android (APK)</Label>
                    <Input
                      value={cnhApk}
                      onChange={(e) => setCnhApk(e.target.value)}
                      placeholder="https://..."
                    />
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
