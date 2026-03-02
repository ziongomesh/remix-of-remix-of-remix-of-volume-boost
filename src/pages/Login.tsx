import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/LoadingScreen';
import waveBg from '@/assets/wave-bg.png';

export default function Login() {
  const { admin, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
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
