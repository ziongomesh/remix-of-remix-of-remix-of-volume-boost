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
    <div className="min-h-screen flex bg-[hsl(220,25%,6%)]">
      {/* Left panel - Form */}
      <div className="relative z-10 w-full lg:w-[340px] lg:min-w-[340px] flex flex-col justify-center px-8 py-10 bg-[hsl(220,25%,6%)]">
        <LoginForm />
      </div>

      {/* Right panel - Background image (desktop only) */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src={waveBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
}
