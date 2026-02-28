import { Logo } from '@/components/Logo';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="flex items-center justify-between p-6">
        <Logo className="h-8 w-8" />
        <div className="h-8 w-8 rounded-full border border-gray-600" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-[120px] md:text-[160px] font-bold tracking-tighter leading-none text-white">
          404
        </h1>
        <p className="text-gray-400 text-base mt-4">A página não foi encontrada.</p>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10 flex flex-col items-center gap-6 bg-[#0a0a0a]">
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
