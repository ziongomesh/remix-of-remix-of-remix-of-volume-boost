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

      {/* Blue glow - reluzente, fast pulse */}
      <div className="absolute top-[5%] left-[25%] w-[600px] h-[600px] rounded-full pointer-events-none blur-[180px]"
        style={{ background: 'hsl(200 80% 55% / 0.25)', animation: 'loginPulse 3s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full pointer-events-none blur-[140px]"
        style={{ background: 'hsl(200 90% 60% / 0.2)', animation: 'loginPulse 4s ease-in-out infinite alternate-reverse' }} />
      <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none blur-[160px]"
        style={{ background: 'hsl(190 70% 50% / 0.15)', animation: 'loginPulse 5s ease-in-out infinite alternate' }} />
      
      {/* Bright accent streaks */}
      <div className="absolute top-[15%] left-[35%] w-[300px] h-[2px] pointer-events-none opacity-30 rotate-[-15deg]"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(200 80% 65%), transparent)', animation: 'loginStreak 4s ease-in-out infinite' }} />
      <div className="absolute bottom-[25%] left-[40%] w-[250px] h-[1px] pointer-events-none opacity-20 rotate-[10deg]"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(190 80% 70%), transparent)', animation: 'loginStreak 5s ease-in-out infinite 1s' }} />

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
      <div className="relative z-10 w-full lg:w-[420px] lg:min-w-[420px] flex flex-col items-center justify-center px-8 py-10 bg-[hsl(220,25%,6%)]/95 lg:bg-[hsl(220,25%,6%)]">
        <div className="w-full max-w-[340px]">
          <LoginForm />
        </div>
      </div>

      {/* Right spacer (desktop) */}
      <div className="hidden lg:block flex-1" />
    </div>
  );
}
