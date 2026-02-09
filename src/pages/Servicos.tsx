import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, CheckCircle, Clock, CreditCard, AlertTriangle, Anchor, IdCard, ScrollText, Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Service {
  id: string;
  name: string;
  description: string;
  features: string[];
  validity: string;
  credits: number;
  available: boolean;
  route: string;
  icon?: React.ElementType;
}

const services: Service[] = [
  {
    id: 'cnh-digital-2026',
    name: 'CNH Digital 2026',
    description: 'Carteira Nacional de Habilitação - Versão mais recente',
    features: ['Validade nacional', 'QR Code de verificação', 'Design premium 2026'],
    validity: '45 dias',
    credits: 1,
    available: true,
    route: '/servicos/cnh-digital',
    icon: FileText,
  },
  {
    id: 'rg-digital',
    name: 'RG Digital',
    description: 'Carteira de Identidade Nacional Digital',
    features: ['Validade nacional', 'QR Code de verificação', 'Frente e verso'],
    validity: '45 dias',
    credits: 1,
    available: true,
    route: '/servicos/rg-digital',
    icon: FileText,
  },
  {
    id: 'cnh-arrais-nautica',
    name: 'CNH Arrais Náutica',
    description: 'Habilitação Náutica - Arrais Amador',
    features: ['Documento náutico oficial', 'Validade nacional', 'QR Code de verificação'],
    validity: '45 dias',
    credits: 1,
    available: true,
    route: '/servicos/cnh-nautica',
    icon: Anchor,
  },
  {
    id: 'crlv-digital-2026',
    name: 'CRLV Digital 2026',
    description: 'Certificado de Registro e Licenciamento de Veículo',
    features: ['Dados completos do veículo', 'QR Code de verificação', 'Design 2026'],
    validity: '45 dias',
    credits: 1,
    available: false,
    route: '#',
    icon: Car,
  },
  {
    id: 'carteira-abafe',
    name: 'Carteira ABAFE',
    description: 'Carteira de Estudante ABAFE',
    features: ['QR Code de verificação', 'Dados personalizáveis', 'Senha de 6 dígitos'],
    validity: '45 dias',
    credits: 1,
    available: true,
    route: '/servicos/carteira-estudante',
    icon: IdCard,
  },
  {
    id: 'certidao-nascimento',
    name: 'Certidão de Nascimento',
    description: 'Certidão de Nascimento Digital em PDF com QR Code',
    features: ['Geração em PDF', 'QR Code de verificação', 'Dados personalizáveis'],
    validity: '45 dias',
    credits: 1,
    available: false,
    route: '#',
    icon: ScrollText,
  },
];

function ServiceCard({ service, hasCredits }: { service: Service; hasCredits: boolean }) {
  const navigate = useNavigate();
  const canAccess = service.available && hasCredits;
  const Icon = service.icon || FileText;

  return (
    <div className={`bg-card border border-border rounded-xl p-4 flex flex-col gap-3 transition-shadow ${service.available ? (canAccess ? 'hover:shadow-lg' : '') : 'opacity-50'}`}>
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <Badge
          variant={service.available ? 'default' : 'secondary'}
          className={service.available ? 'bg-success text-success-foreground' : ''}
        >
          {service.available ? (
            <><CheckCircle className="h-3 w-3 mr-1" /> Disponível</>
          ) : (
            <><Clock className="h-3 w-3 mr-1" /> Em Breve</>
          )}
        </Badge>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-foreground">{service.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
      </div>

      <ul className="space-y-1">
        {service.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 mt-auto">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {service.validity}
        </div>
        <div className="flex items-center gap-1">
          <CreditCard className="h-3.5 w-3.5" />
          <strong>{service.credits} crédito{service.credits > 1 ? 's' : ''}</strong>
        </div>
      </div>

      <Button
        className="w-full"
        size="sm"
        disabled={!canAccess}
        variant={service.available ? 'default' : 'secondary'}
        onClick={() => service.available && navigate(service.route)}
      >
        {!service.available ? 'Em Breve' : hasCredits ? 'Acessar Serviço' : 'Sem Créditos'}
      </Button>
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
      <div className="space-y-8">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} hasCredits={hasCredits} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
