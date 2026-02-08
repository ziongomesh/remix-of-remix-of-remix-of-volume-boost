import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Shield, FileText, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: string;
  name: string;
  description: string;
  features: string[];
  validity: string;
  credits: number;
  available: boolean;
  route: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  services: Service[];
}

const categories: ServiceCategory[] = [
  {
    id: 'documentacoes-oficiais',
    name: 'Documentações Oficiais',
    description: 'Documentos oficiais com validade digital',
    icon: Shield,
    services: [
      {
        id: 'cnh-digital-2026',
        name: 'CNH Digital 2026',
        description: 'Carteira Nacional de Habilitação - Versão mais recente',
        features: [
          'Validade nacional',
          'QR Code de verificação',
          'Design premium 2026',
        ],
        validity: '45 dias',
        credits: 1,
        available: true,
        route: '/servicos/cnh-digital',
      },
    ],
  },
];

function ServiceCard({ service }: { service: Service }) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <Badge
          variant={service.available ? 'default' : 'secondary'}
          className={service.available ? 'bg-success text-success-foreground' : ''}
        >
          {service.available ? 'Disponível' : 'Em breve'}
        </Badge>
      </div>

      <div>
        <h3 className="font-semibold text-lg text-foreground">{service.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
      </div>

      <ul className="space-y-2">
        {service.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4 mt-auto">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {service.validity}
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-4 w-4" />
          {service.credits} crédito{service.credits > 1 ? 's' : ''}
        </div>
      </div>

      <Button
        className="w-full"
        disabled={!service.available}
        onClick={() => navigate(service.route)}
      >
        Acessar Serviço
      </Button>
    </div>
  );
}

function CategorySection({ category }: { category: ServiceCategory }) {
  const Icon = category.icon;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl gradient-blue flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {category.services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}

export default function Servicos() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground mt-1">Escolha um serviço para começar</p>
        </div>

        {categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </DashboardLayout>
  );
}
