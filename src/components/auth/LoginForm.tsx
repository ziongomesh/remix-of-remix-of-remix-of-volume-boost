import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Play, Home } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { PinPad } from './PinPad';
import { TurnstileWidget, TURNSTILE_ENABLED } from './TurnstileWidget';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface PendingAdmin {
  id: number;
  nome: string;
  email: string;
  creditos: number;
  rank: string;
  profile_photo: string | null;
  hasPin: boolean;
}

export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAdmin, setPendingAdmin] = useState<PendingAdmin | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const verifyTurnstile = async (token: string): Promise<boolean> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/turnstile/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      return data?.success === true;
    } catch (error) {
      console.error('Erro ao verificar Turnstile:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (TURNSTILE_ENABLED) {
      if (!turnstileToken) {
        toast.error('Por favor, complete a verificação de segurança');
        return;
      }
      setLoading(true);
      const isValid = await verifyTurnstile(turnstileToken);
      if (!isValid) {
        toast.error('Verificação de segurança falhou. Tente novamente.');
        setTurnstileToken(null);
        setLoading(false);
        return;
      }
    } else {
      setLoading(true);
    }

    try {
      const data = await api.auth.login(email, password);

      if (!data?.admin) {
        toast.error('Erro ao fazer login', { description: 'Email ou senha incorretos' });
        setLoading(false);
        return;
      }

      const adminData = data.admin;
      const hasPin = !!adminData.pin;

      setPendingAdmin({
        id: adminData.id,
        nome: adminData.nome,
        email: adminData.email,
        creditos: adminData.creditos,
        rank: adminData.rank,
        profile_photo: adminData.profile_photo,
        hasPin,
      });

      setLoading(false);
    } catch (error: any) {
      toast.error('Erro ao fazer login', { description: error.message || 'Email ou senha incorretos' });
      setLoading(false);
    }
  };

  const handlePinSubmit = async (pin: string) => {
    if (!pendingAdmin) return;
    setPinLoading(true);

    try {
      if (pendingAdmin.hasPin) {
        const result = await api.auth.validatePin(pendingAdmin.id, pin);
        if (!result.valid) {
          toast.error('PIN incorreto');
          setPinLoading(false);
          return;
        }
      } else {
        await api.auth.setPin(pendingAdmin.id, pin);
        toast.success('PIN registrado com sucesso!');
      }

      const { error } = await signIn(email, password);
      if (error) {
        toast.error('Erro ao fazer login');
      } else {
        toast.success('Login realizado com sucesso!');
      }
    } catch (err: any) {
      toast.error('Erro ao processar PIN', { description: err.message });
    }

    setPinLoading(false);
  };

  // PIN pad view
  if (pendingAdmin) {
    return (
      <div className="w-full">
        <PinPad
          mode={pendingAdmin.hasPin ? 'verify' : 'register'}
          onSubmit={handlePinSubmit}
          loading={pinLoading}
        />
        <Button
          variant="ghost"
          className="w-full mt-4 text-gray-500 hover:text-gray-300"
          onClick={() => setPendingAdmin(null)}
        >
          Voltar ao login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Home icon - top left */}
      <button
        onClick={() => navigate('/')}
        className="text-gray-500 hover:text-white transition-colors"
      >
        <Home className="h-5 w-5" />
      </button>

      {/* Logo - centered */}
      <div className="flex justify-center pt-4">
        <Logo className="h-24 w-24" />
      </div>

      {/* Title - centered */}
      <h1 className="text-2xl font-bold text-white text-center">Iniciar Sessão</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-2">
        <div className="relative">
          <label className="absolute top-2 left-3 text-[11px] text-gray-500 pointer-events-none">Usuário</label>
          <Input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 pt-6 pb-2 bg-white/5 border-white/10 text-white placeholder:text-transparent rounded-lg focus:border-primary/50 focus:ring-primary/20 text-sm"
          />
        </div>
        <div className="relative">
          <label className="absolute top-2 left-3 text-[11px] text-gray-500 pointer-events-none">Senha</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-14 pt-6 pb-2 bg-white/5 border-white/10 text-white placeholder:text-transparent rounded-lg focus:border-primary/50 focus:ring-primary/20 text-sm"
          />
        </div>

        {TURNSTILE_ENABLED && (
          <TurnstileWidget
            onVerify={handleTurnstileVerify}
            onExpire={handleTurnstileExpire}
          />
        )}

        {/* Play button - centered, larger, blue */}
        <div className="flex justify-center pt-6">
          <Button
            type="submit"
            disabled={loading || !email || !password || (TURNSTILE_ENABLED && !turnstileToken)}
            className="h-16 w-16 rounded-2xl text-white shadow-lg shadow-primary/30 transition-all disabled:opacity-30 disabled:shadow-none bg-primary hover:bg-primary/90"
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <Play className="h-7 w-7 ml-0.5" />
            )}
          </Button>
        </div>
      </form>

      {/* Footer - centered */}
      <p className="text-sm text-gray-500 text-center">
        Não tem uma conta?{' '}
        <button
          type="button"
          onClick={() => setShowCreateAccount(true)}
          className="text-primary hover:underline font-medium"
        >
          Criar Conta
        </button>
      </p>

      {/* Create Account Modal */}
      {showCreateAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-6 shadow-2xl">
            <div className="flex justify-center">
              <Logo className="h-16 w-16" />
            </div>
            <h2 className="text-xl font-bold text-white text-center">Criar uma Conta</h2>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              Para criar sua conta, entre em contato com um administrador para liberar seu acesso.
            </p>
            <Button
              onClick={() => setShowCreateAccount(false)}
              className="w-full h-11"
              variant="outline"
            >
              Voltar ao Login
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
