import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import waveBg from '@/assets/wave-bg.png';

export default function Login() {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(220,25%,6%)] gap-4">
        <div className="relative">
          <Logo className="h-14 w-14 relative z-10" />
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        </div>
        <div className="h-10 w-10 rounded-full border-2 border-transparent border-b-primary animate-spin" />
      </div>
    );
  }

  if (admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[hsl(220,25%,6%)] relative overflow-hidden">
      {/* Subtle animated background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${waveBg})`,
          backgroundSize: '200% 200%',
          backgroundPosition: 'center',
          animation: 'loginWave 20s ease-in-out infinite alternate',
        }}
      />
      <style>{`
        @keyframes loginWave {
          0% { background-position: 0% 30%; transform: scale(1.05); }
          50% { background-position: 100% 40%; transform: scale(1.1); }
          100% { background-position: 20% 70%; transform: scale(1.05); }
        }
      `}</style>

      {/* Login form - centered */}
      <div className="relative z-10 w-full flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
