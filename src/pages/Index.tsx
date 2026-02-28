import { Logo } from '@/components/Logo';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Logo className="h-20 w-20 mx-auto" />
          <h1 className="text-3xl font-bold tracking-tight">Data Sistemas</h1>
          <p className="text-gray-500 text-sm">Inovando e Recriando o Futuro Digital</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-colors"
          >
            Acessar Painel
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-2xl mx-auto flex flex-col items-center space-y-6 px-4">
          {/* Telegram */}
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white transition-colors"
          >
            <Send className="h-5 w-5" />
          </a>

          {/* Logo */}
          <Logo className="h-10 w-10" />

          {/* Copyright */}
          <p className="text-gray-500 text-xs text-center">
            © 2024 – 2026 // <span className="text-white font-semibold">Data Sistemas</span>.
            <br />
            Todos os direitos reservados.
          </p>

          {/* Age badge */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
            <div className="bg-yellow-500 text-black font-bold text-sm rounded-lg h-10 w-10 flex items-center justify-center">
              18
            </div>
            <div className="text-left">
              <p className="text-gray-300 text-sm font-medium">Compras On-line</p>
              <p className="text-gray-500 text-xs">A partir de 18 anos</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
