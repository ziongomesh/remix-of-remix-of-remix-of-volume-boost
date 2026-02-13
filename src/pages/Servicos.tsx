import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, CheckCircle, Clock, CreditCard, AlertTriangle, Anchor, IdCard, Car, Home, Stethoscope, ImageIcon, Eye } from 'lucide-react';
import exemploCnh from '@/assets/exemplo-cnh.png';
import exemploGovbr from '@/assets/exemplo-govbr.png';
import exemploAbafe from '@/assets/exemplo-abafe.png';
import { Badge } from '@/components/ui/badge';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Service {
  id: string;
  name: string;
  description: string;
  credits: number;
  available: boolean;
  route: string;
  icon?: React.ElementType;
  exampleImage?: string;
}

interface ServiceCategory {
  title: string;
  services: Service[];
}

const categories: ServiceCategory[] = [
  {
    title: 'Documentos Digitais',
    services: [
      {
        id: 'cnh-digital-2026',
        name: 'CNH Digital (2026)',
        description: 'Carteira Nacional de Habilitação',
        credits: 1,
        available: true,
        route: '/servicos/cnh-digital',
        icon: FileText,
        exampleImage: exemploCnh,
      },
      {
        id: 'rg-digital',
        name: 'CIN (RG Digital)',
        description: 'Carteira de Identidade Nacional',
        credits: 1,
        available: true,
        route: '/servicos/rg-digital',
        icon: FileText,
        exampleImage: exemploGovbr,
      },
      {
        id: 'cnh-arrais-nautica',
        name: 'Arrais Náutica',
        description: 'Habilitação Náutica',
        credits: 1,
        available: true,
        route: '/servicos/cnh-nautica',
        icon: Anchor,
        exampleImage: exemploGovbr,
      },
      {
        id: 'passaporte-digital',
        name: 'Passaporte Digital',
        description: 'Passaporte Brasileiro',
        credits: 1,
        available: false,
        route: '#',
        icon: FileText,
      },
    ],
  },
  {
    title: 'Carteira Estudantil',
    services: [
      {
        id: 'carteira-abafe',
        name: 'ABAFE',
        description: 'Carteira de Estudante',
        credits: 1,
        available: true,
        route: '/servicos/carteira-estudante',
        icon: IdCard,
        exampleImage: exemploAbafe,
      },
    ],
  },
  {
    title: 'PDF',
    services: [
      {
        id: 'crlv-digital',
        name: 'CRLV Digital',
        description: 'Certificado de Registro e Licenciamento de Veículo',
        credits: 1,
        available: false,
        route: '#',
        icon: Car,
      },
      {
        id: 'comprovante-residencia',
        name: 'Comprovante de Residência',
        description: 'Comprovante de endereço',
        credits: 1,
        available: false,
        route: '#',
        icon: Home,
      },
    ],
  },
  {
    title: 'Atestados',
    services: [
      {
        id: 'atestado-upa24h',
        name: 'UPA 24H',
        description: 'Atestado médico - Todos os estados',
        credits: 1,
        available: false,
        route: '#',
        icon: Stethoscope,
      },
      {
        id: 'atestado-unimed',
        name: 'Unimed',
        description: 'Atestado médico - Todos os estados',
        credits: 1,
        available: false,
        route: '#',
        icon: Stethoscope,
      },
      {
        id: 'atestado-hapvida',
        name: 'Hapvida',
        description: 'Atestado médico - Todos os estados',
        credits: 1,
        available: false,
        route: '#',
        icon: Stethoscope,
      },
    ],
  },
  {
    title: 'Imagens Manipuladas',
    services: [
      {
        id: 'mockup-cnh-mesa',
        name: 'CNH em cima da mesa',
        description: 'Mockup realista de CNH',
        credits: 1,
        available: false,
        route: '#',
        icon: ImageIcon,
      },
      {
        id: 'mockup-rg-mesa',
        name: 'RG em cima da mesa',
        description: 'Mockup realista de RG',
        credits: 1,
        available: false,
        route: '#',
        icon: ImageIcon,
      },
      {
        id: 'mockup-passaporte-mesa',
        name: 'Passaporte em cima da mesa',
        description: 'Mockup realista de Passaporte',
        credits: 1,
        available: false,
        route: '#',
        icon: ImageIcon,
      },
    ],
  },
];

function ServiceCard({ service, hasCredits }: { service: Service; hasCredits: boolean }) {
  const navigate = useNavigate();
  const canAccess = service.available && hasCredits;
  const Icon = service.icon || FileText;
  const [showExample, setShowExample] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showExample) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowExample(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExample]);

  return (
    <div ref={cardRef} className="relative">
      <div
        className={`bg-card border border-border rounded-lg p-3 flex items-center gap-3 transition-shadow ${service.available ? (canAccess ? 'hover:shadow-md hover:border-primary/30 cursor-pointer' : 'cursor-default') : 'opacity-50 cursor-default'}`}
        onClick={() => canAccess && navigate(service.route)}
      >
        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{service.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{service.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {service.exampleImage && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowExample(!showExample); }}
              className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition-colors px-1.5 py-0.5 rounded bg-primary/5 hover:bg-primary/10"
            >
              <Eye className="h-2.5 w-2.5" />
              Exemplo
            </button>
          )}
          <span className="text-xs text-muted-foreground hidden sm:inline">{service.credits} cred.</span>
          {service.available ? (
            <Badge variant="default" className="bg-success text-success-foreground text-[10px] px-1.5 py-0">
              <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Ativo
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              <Clock className="h-2.5 w-2.5 mr-0.5" /> Breve
            </Badge>
          )}
        </div>
      </div>
      {showExample && service.exampleImage && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <img
            src={service.exampleImage}
            alt={`Exemplo ${service.name}`}
            className="w-full object-contain max-h-[300px]"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}
    </div>
  );
}

export default function Servicos() {
  const { admin, credits, loading } = useAuth();
  const hasCredits = credits > 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!admin) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground mt-1">Escolha um serviço para começar</p>
        </div>

        {!hasCredits && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Você está sem créditos</p>
              <p className="text-sm text-muted-foreground">Recarregue com seu master para continuar utilizando os serviços.</p>
            </div>
          </div>
        )}

        {categories.map((cat) => (
          <div key={cat.title} className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{cat.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {cat.services.map((service) => (
                <ServiceCard key={service.id} service={service} hasCredits={hasCredits} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
