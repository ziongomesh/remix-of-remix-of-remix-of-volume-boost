import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/LoadingScreen';
import waveBg from '@/assets/wave-bg.png';

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
    <div className="min-h-screen flex bg-[hsl(220,25%,6%)] relative overflow-hidden">
      {/* Background image - fast & vivid */}
      <div className="absolute inset-0">
        <img
          src={waveBg}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
          style={{ animation: 'loginBgFloat 20s ease-in-out infinite alternate' }}
        />
      </div>

      {/* Edge fade - soft opacity blend into left panel */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to right, hsl(220 25% 6%) 26%, hsl(220 25% 6% / 0.7) 32%, transparent 50%)'
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, hsl(220 25% 6% / 0.3) 0%, transparent 20%, transparent 80%, hsl(220 25% 6% / 0.4) 100%)'
      }} />

      {/* Subtle atmospheric glows - muted tones */}
      <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full pointer-events-none blur-[200px]"
        style={{ background: 'hsl(200 50% 35% / 0.15)', animation: 'loginPulse 6s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-[15%] left-[20%] w-[350px] h-[350px] rounded-full pointer-events-none blur-[160px]"
        style={{ background: 'hsl(195 45% 30% / 0.12)', animation: 'loginPulse 8s ease-in-out infinite alternate-reverse' }} />
      <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] rounded-full pointer-events-none blur-[180px]"
        style={{ background: 'hsl(190 40% 28% / 0.1)', animation: 'loginPulse 10s ease-in-out infinite alternate' }} />
      
      {/* Soft accent lines */}
      <div className="absolute top-[20%] left-[30%] w-[250px] h-[1px] pointer-events-none opacity-15 rotate-[-15deg]"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(200 40% 50%), transparent)', animation: 'loginStreak 6s ease-in-out infinite' }} />
      <div className="absolute bottom-[30%] left-[35%] w-[200px] h-[1px] pointer-events-none opacity-10 rotate-[10deg]"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(190 40% 45%), transparent)', animation: 'loginStreak 8s ease-in-out infinite 2s' }} />

      <style>{`
        @keyframes loginBgFloat {
          0% { transform: scale(1.05) translate(0, 0); }
          50% { transform: scale(1.08) translate(-0.5%, 0.5%); }
          100% { transform: scale(1.05) translate(0.5%, -0.3%); }
        }
        @keyframes loginPulse {
          0% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.6; transform: scale(1); }
        }
        @keyframes loginStreak {
          0% { opacity: 0; transform: translateX(-60px) scaleX(0.5); }
          50% { opacity: 0.4; transform: translateX(0) scaleX(1); }
          100% { opacity: 0; transform: translateX(60px) scaleX(0.5); }
        }
      `}</style>

      {/* Left panel - Form */}
      <div className="relative z-10 w-full lg:w-[480px] lg:min-w-[480px] flex flex-col items-center justify-center px-10 py-10"
        style={{
          background: 'linear-gradient(to right, hsl(220 25% 6%) 85%, hsl(220 25% 6% / 0.85) 92%, hsl(220 25% 6% / 0.5) 96%, transparent 100%)',
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
