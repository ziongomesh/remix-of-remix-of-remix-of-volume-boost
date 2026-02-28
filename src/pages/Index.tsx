import { Logo } from '@/components/Logo';
import waveBg from '@/assets/wave-bg.png';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated wave background */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage: `url(${waveBg})`,
          backgroundSize: '200% 200%',
          backgroundPosition: 'center',
          animation: 'waveMove 12s ease-in-out infinite alternate',
        }}
      />
      <style>{`
        @keyframes waveMove {
          0% { background-position: 0% 30%; transform: scale(1.05); }
          25% { background-position: 50% 60%; }
          50% { background-position: 100% 40%; transform: scale(1.15); }
          75% { background-position: 60% 20%; }
          100% { background-position: 20% 70%; transform: scale(1.05); }
        }
      `}</style>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <Logo className="h-8 w-8" />
        <div className="h-8 w-8 rounded-full border border-gray-600" />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-[120px] md:text-[160px] font-bold tracking-tighter leading-none text-white drop-shadow-2xl">
          404
        </h1>
        <p className="text-gray-400 text-base mt-4">A página não foi encontrada.</p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-10 flex flex-col items-center gap-6 bg-black/60 backdrop-blur-sm">
        <Logo className="h-8 w-8 opacity-50" />
        <p className="text-gray-500 text-sm text-center">
          © 2024 – 2026 // <span className="text-white font-semibold">Data Sistemas</span>.
          <br />
          Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Index;
