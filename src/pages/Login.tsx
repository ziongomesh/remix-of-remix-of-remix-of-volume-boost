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
      {/* Animated background image */}
      <div
        className="absolute inset-0"
        style={{ animation: 'loginBgFloat 25s ease-in-out infinite alternate' }}
      >
        <img
          src={waveBg}
          alt=""
          className="w-full h-full object-cover scale-110"
          draggable={false}
        />
      </div>

      {/* Overlay gradient to blend edges */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,25%,6%)] via-[hsl(220,25%,6%)]/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,25%,6%)]/80 via-transparent to-[hsl(220,25%,6%)]/50 pointer-events-none" />

      {/* Ambient glow effects */}
      <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px] pointer-events-none" style={{ animation: 'loginGlow 6s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-[20%] right-[25%] w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" style={{ animation: 'loginGlow 8s ease-in-out infinite alternate-reverse' }} />
      <div className="absolute top-[40%] right-[5%] w-64 h-64 bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" style={{ animation: 'loginGlow 10s ease-in-out infinite alternate' }} />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-1 h-1 bg-white/20 rounded-full" style={{ top: '20%', right: '30%', animation: 'loginParticle 12s ease-in-out infinite' }} />
        <div className="absolute w-1.5 h-1.5 bg-primary/30 rounded-full" style={{ top: '60%', right: '20%', animation: 'loginParticle 15s ease-in-out infinite 2s' }} />
        <div className="absolute w-1 h-1 bg-cyan-400/25 rounded-full" style={{ top: '35%', right: '45%', animation: 'loginParticle 10s ease-in-out infinite 4s' }} />
        <div className="absolute w-0.5 h-0.5 bg-white/15 rounded-full" style={{ top: '75%', right: '35%', animation: 'loginParticle 18s ease-in-out infinite 1s' }} />
        <div className="absolute w-1 h-1 bg-primary/20 rounded-full" style={{ top: '45%', right: '15%', animation: 'loginParticle 14s ease-in-out infinite 3s' }} />
      </div>

      <style>{`
        @keyframes loginBgFloat {
          0% { transform: scale(1.1) translate(0, 0); }
          33% { transform: scale(1.15) translate(-1.5%, 1%); }
          66% { transform: scale(1.12) translate(0.5%, -1%); }
          100% { transform: scale(1.1) translate(1%, -0.5%); }
        }
        @keyframes loginGlow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
          100% { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes loginParticle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(-80px) translateX(30px); opacity: 0.6; }
          90% { opacity: 0; }
          100% { transform: translateY(-160px) translateX(-20px); opacity: 0; }
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
