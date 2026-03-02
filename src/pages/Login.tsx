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
    <div className="min-h-screen flex bg-[hsl(220,25%,6%)] relative">
      {/* Background image - visible on all sizes, behind everything */}
      <div className="absolute inset-0">
        <img
          src={waveBg}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Left panel - Form */}
      <div className="relative z-10 w-full lg:w-[420px] lg:min-w-[420px] flex flex-col items-center justify-center px-8 py-10 bg-[hsl(220,25%,6%)]/95 lg:bg-[hsl(220,25%,6%)]">
        <div className="w-full max-w-[340px]">
          <LoginForm />
        </div>
      </div>

      {/* Right spacer (desktop) - image shows through */}
      <div className="hidden lg:block flex-1" />
    </div>
  );
}
