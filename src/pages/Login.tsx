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
      {/* Animated background image */}
      <div
        className="absolute inset-0 transition-transform duration-[20s] ease-in-out"
        style={{ animation: 'loginBgFloat 25s ease-in-out infinite alternate' }}
      >
        <img
          src={waveBg}
          alt=""
          className="w-full h-full object-cover scale-110"
          draggable={false}
        />
      </div>

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" style={{ animation: 'loginGlow 8s ease-in-out infinite alternate' }} />

      <style>{`
        @keyframes loginBgFloat {
          0% { transform: scale(1.1) translate(0, 0); }
          50% { transform: scale(1.15) translate(-1%, 1%); }
          100% { transform: scale(1.1) translate(1%, -0.5%); }
        }
        @keyframes loginGlow {
          0% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0.7; transform: scale(1.3); }
        }
      `}</style>

      {/* Left panel - Form */}
      <div className="relative z-10 w-full lg:w-[420px] lg:min-w-[420px] flex flex-col items-center justify-center px-8 py-10 bg-[hsl(220,25%,6%)]/95 lg:bg-[hsl(220,25%,6%)] backdrop-blur-sm lg:backdrop-blur-none">
        <div className="w-full max-w-[340px]">
          <LoginForm />
        </div>
      </div>

      {/* Right spacer (desktop) */}
      <div className="hidden lg:block flex-1" />
    </div>
  );
}
