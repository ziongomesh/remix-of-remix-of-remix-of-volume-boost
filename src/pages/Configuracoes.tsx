import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigate } from 'react-router-dom';
import { isUsingMySQL } from '@/lib/db-config';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings, Phone, Save, Loader2, User } from 'lucide-react';

export default function Configuracoes() {
  const { admin, role, loading } = useAuth();
  const [telefone, setTelefone] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!admin) return;
    const fetchPhone = async () => {
      try {
        if (isUsingMySQL()) {
          const envUrl = import.meta.env.VITE_API_URL as string | undefined;
          let apiBase = envUrl ? envUrl.replace(/\/+$/, '') : 'http://localhost:4000/api';
          if (!apiBase.endsWith('/api')) apiBase += '/api';
          const resp = await fetch(`${apiBase}/admins/${admin.id}`);
          const data = await resp.json();
          setTelefone(data?.telefone || '');
        } else {
          const { data, error } = await supabase
            .from('admins')
            .select('telefone')
            .eq('id', admin.id)
            .single();
          if (!error && data) {
            setTelefone((data as any).telefone || '');
          }
        }
      } catch (err) {
        console.error('Erro ao buscar telefone:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchPhone();
  }, [admin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;
  if (role !== 'master' && role !== 'dono') return <Navigate to="/dashboard" replace />;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isUsingMySQL()) {
        const envUrl = import.meta.env.VITE_API_URL as string | undefined;
        let apiBase = envUrl ? envUrl.replace(/\/+$/, '') : 'http://localhost:4000/api';
        if (!apiBase.endsWith('/api')) apiBase += '/api';
        const resp = await fetch(`${apiBase}/admins/${admin.id}/telefone`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telefone, session_token: admin.session_token }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Erro ao salvar');
      } else {
        const { error } = await supabase
          .from('admins')
          .update({ telefone } as any)
          .eq('id', admin.id);
        if (error) throw error;
      }
      toast.success('Telefone atualizado com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao salvar', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configurações da Conta
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as informações da sua conta
          </p>
        </div>

        {/* Info do usuário */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{admin.nome}</p>
                <p className="text-sm text-muted-foreground">{admin.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telefone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-5 w-5 text-primary" />
              Telefone de Contato
            </CardTitle>
            <CardDescription>
              Este telefone será exibido para seus revendedores na tela de recarga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingData ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Número do WhatsApp / Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    Seus revendedores verão este número na página de recarga com link direto para WhatsApp
                  </p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
