import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AsciiBackground } from '@/components/auth/AsciiBackground';

export default function Login() {
  const { admin, loading } = useAuth();
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading || splash) {
    return <LoadingScreen />;
  }

  if (admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[hsl(220,20%,5%)] relative overflow-hidden">
      {/* ASCII animated background */}
      <div className="absolute inset-0">
        <AsciiBackground />
      </div>

      {/* Edge fade - left panel blend */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to right, hsl(220 20% 5%) 26%, hsl(220 20% 5% / 0.8) 32%, hsl(220 20% 5% / 0.3) 45%, transparent 55%)'
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, hsl(220 20% 5% / 0.4) 0%, transparent 15%, transparent 85%, hsl(220 20% 5% / 0.5) 100%)'
      }} />

      {/* Subtle cyan glow */}
      <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full pointer-events-none blur-[200px]"
        style={{ background: 'hsl(190 40% 30% / 0.08)' }} />

      {/* Left panel - Form */}
      <div className="relative z-10 w-full lg:w-[480px] lg:min-w-[480px] flex flex-col items-center justify-center px-10 py-10"
        style={{
          background: 'linear-gradient(to right, hsl(220 20% 5%) 80%, hsl(220 20% 5% / 0.9) 88%, hsl(220 20% 5% / 0.5) 94%, transparent 100%)',
        }}
      >
        <div className="w-full max-w-[380px]">
          <LoginForm />
        </div>
      </div>

      {/* Right spacer (desktop) */}
      <div className="hidden lg:block flex-1" />
    </div>
  );
}
