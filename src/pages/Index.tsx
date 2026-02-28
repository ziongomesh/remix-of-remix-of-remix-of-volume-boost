import { Logo } from '@/components/Logo';
import minerImg from '@/assets/miner-construction.png';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center px-4">
      <div className="text-center space-y-6 animate-fade-in">
        <Logo className="h-16 w-16 mx-auto" />

        <img
          src={minerImg}
          alt="Mineiro em construção"
          className="h-48 w-48 mx-auto"
        />

        <h1 className="text-6xl font-bold tracking-tighter text-white">404</h1>
        <p className="text-xl font-semibold text-gray-300">Em Construção</p>
        <p className="text-sm text-gray-500">Estamos trabalhando duro para trazer algo incrível.</p>
      </div>
    </div>
  );
};

export default Index;
