import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, CheckCircle, Clock, CreditCard, AlertTriangle, Anchor, IdCard } from 'lucide-react';
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
}

interface ServiceCategory {
  title: string;
  services: Service[];
}

const categories: ServiceCategory[] = [
  {
    title: 'Documentos Oficiais',
    services: [
      {
        id: 'cnh-digital-2026',
        name: 'CNH Digital (2026)',
        description: 'Carteira Nacional de Habilitação',
        credits: 1,
        available: true,
        route: '/servicos/cnh-digital',
        icon: FileText,
      },
      {
        id: 'rg-digital',
        name: 'CIN (RG Digital)',
        description: 'Carteira de Identidade Nacional',
        credits: 1,
        available: true,
        route: '/servicos/rg-digital',
        icon: FileText,
      },
      {
        id: 'cnh-arrais-nautica',
        name: 'Arrais Náutica',
        description: 'Habilitação Náutica',
        credits: 1,
        available: true,
        route: '/servicos/cnh-nautica',
        icon: Anchor,
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
      },
    ],
  },
];

function ServiceCard({ service, hasCredits }: { service: Service; hasCredits: boolean }) {
  const navigate = useNavigate();
  const canAccess = service.available && hasCredits;
  const Icon = service.icon || FileText;

  return (
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
