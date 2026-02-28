import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import loginBg from '@/assets/login-bg.jpg';

export default function Login() {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left panel - Login form */}
      <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col justify-center px-8 md:px-10 py-12 relative z-10">
        <LoginForm />
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
