import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Shield, FileText, CheckCircle, Clock, CreditCard, AlertTriangle, ChevronDown, Anchor, BookOpen, GraduationCap, IdCard, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  icon?: React.ElementType;
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
    name: 'Documentos Governamentais',
    description: 'Documentos oficiais com validade nacional',
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
        icon: FileText,
      },
      {
        id: 'rg-digital',
        name: 'RG Digital',
        description: 'Carteira de Identidade Nacional Digital',
        features: [
          'Validade nacional',
          'QR Code de verificação',
          'Frente e verso',
        ],
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
        features: [
          'Documento náutico oficial',
          'Validade nacional',
          'QR Code de verificação',
        ],
        validity: '45 dias',
        credits: 1,
        available: false,
        route: '#',
        icon: Anchor,
      },
      {
        id: 'passaporte',
        name: 'Passaporte',
        description: 'Passaporte Digital Brasileiro',
        features: [
          'Documento internacional',
          'Validade digital',
          'Código de verificação',
        ],
        validity: '45 dias',
        credits: 1,
        available: false,
        route: '#',
        icon: BookOpen,
      },
    ],
  },
  {
    id: 'documentos-estudantis',
    name: 'Documentos Estudantis',
    description: 'Carteiras estudantis digitais',
    icon: GraduationCap,
    services: [
      {
        id: 'carteira-dne',
        name: 'Carteira DNE',
        description: 'Documento Nacional do Estudante',
        features: [
          'Validade estudantil',
          'Dados personalizáveis',
          'QR Code',
        ],
        validity: '45 dias',
        credits: 1,
        available: false,
        route: '#',
        icon: IdCard,
      },
      {
        id: 'pagmeia',
        name: 'PAGMEIA',
        description: 'Carteira de meia-entrada digital',
        features: [
          'Meia-entrada nacional',
          'Dados personalizáveis',
          'QR Code de verificação',
        ],
        validity: '45 dias',
        credits: 1,
        available: false,
        route: '#',
        icon: Wallet,
      },
    ],
  },
];

function ServiceCard({ service, hasCredits }: { service: Service; hasCredits: boolean }) {
  const navigate = useNavigate();
  const canAccess = service.available && hasCredits;
  const Icon = service.icon || FileText;

  return (
    <div className={`bg-card border border-border rounded-xl p-5 flex flex-col gap-4 transition-shadow ${service.available ? (canAccess ? 'hover:shadow-lg' : '') : 'opacity-50'}`}>
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
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
        <h3 className="font-semibold text-lg text-foreground">{service.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
      </div>

      <ul className="space-y-2">
        {service.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
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
          <strong>{service.credits} crédito{service.credits > 1 ? 's' : ''}</strong>
        </div>
      </div>

      <Button
        className="w-full"
        disabled={!canAccess}
        variant={service.available ? 'default' : 'secondary'}
        onClick={() => service.available && navigate(service.route)}
      >
        {!service.available ? 'Em Breve' : hasCredits ? 'Acessar Serviço' : 'Sem Créditos'}
      </Button>
    </div>
  );
}

function CategorySection({ category, hasCredits }: { category: ServiceCategory; hasCredits: boolean }) {
  const [open, setOpen] = useState(true);
  const Icon = category.icon;
  const activeCount = category.services.filter(s => s.available).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl gradient-blue flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {activeCount} ativos
            </Badge>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          {category.services.map((service) => (
            <ServiceCard key={service.id} service={service} hasCredits={hasCredits} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Servicos() {
  const adminStr = localStorage.getItem('admin');
  const admin = adminStr ? JSON.parse(adminStr) : null;
  const hasCredits = (admin?.creditos ?? 0) > 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground mt-1">Escolha entre nossas categorias de documentos e serviços</p>
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

        {categories.map((category) => (
          <CategorySection key={category.id} category={category} hasCredits={hasCredits} />
        ))}
      </div>
    </DashboardLayout>
  );
}
