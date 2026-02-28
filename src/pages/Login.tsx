import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import loginBg from '@/assets/login-bg.jpg';
import { Logo } from '@/components/Logo';

export default function Login() {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
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
    <div className="min-h-screen flex bg-black">
      {/* Left panel - Login form */}
      <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col items-center justify-center px-8 md:px-10 py-12 relative z-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>

      {/* Right panel - Background image */}
      <div className="hidden md:block flex-1 relative overflow-hidden">
        <img
          src={loginBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
      </div>
    </div>
  );
}
