import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, CheckCircle, Clock, CreditCard, AlertTriangle, Anchor, IdCard, Car, Home, Stethoscope, Eye, ChevronDown, ChevronUp, Crown, Globe, Lock } from 'lucide-react';
import exemploCnh from '@/assets/exemplo-cnh.png';
import exemploGovbr from '@/assets/exemplo-govbr.png';
import exemploAbafe from '@/assets/exemplo-abafe.png';
import iconCnh from '@/assets/icon-cnh.png';
import iconGovbr from '@/assets/icon-govbr.png';
import iconAbafe from '@/assets/icon-abafe.png';
import iconHapvida from '@/assets/icon-hapvida.png';
import iconCnh2022 from '@/assets/icon-cnh-2022.jpg';
import iconMarinha from '@/assets/icon-marinha.png';
import iconDne from '@/assets/icon-dne.png';
import iconCie from '@/assets/icon-cie.png';
import iconPagmeia from '@/assets/icon-pagmeia.png';
import iconUpa24h from '@/assets/icon-upa24h.png';
import iconUnimed from '@/assets/icon-unimed.png';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  iconImage?: string;
  exampleImage?: string;
  isHot?: boolean;
}

interface ServiceCategory {
  title: string;
  icon: React.ElementType;
  services: Service[];
}

const categories: ServiceCategory[] = [
  {
    title: 'Documentos Digitais',
    icon: FileText,
    services: [
      { id: 'cnh-digital-2026', name: 'CNH DIGITAL (2026)', description: 'Carteira Nacional de Habilitação', credits: 1, available: true, route: '/servicos/cnh-digital', icon: FileText, iconImage: iconCnh, exampleImage: exemploCnh },
      { id: 'cnh-digital-2022', name: 'CNH DIGITAL (2022)', description: 'Modelo anterior da CNH Digital', credits: 1, available: false, route: '#', icon: FileText, iconImage: iconCnh2022 },
      { id: 'rg-digital', name: 'CIN (RG DIGITAL)', description: 'Carteira de Identidade Nacional', credits: 1, available: true, route: '/servicos/rg-digital', icon: FileText, iconImage: iconGovbr, exampleImage: exemploGovbr },
      { id: 'cnh-arrais-nautica', name: 'ARRAIS NÁUTICA', description: 'Habilitação Náutica', credits: 1, available: true, route: '/servicos/cnh-nautica', icon: Anchor, iconImage: iconMarinha, exampleImage: exemploGovbr },
    ],
  },
  {
    title: 'Carteira Estudantil',
    icon: IdCard,
    services: [
      { id: 'carteira-abafe', name: 'ABAFE', description: 'Carteira de Estudante', credits: 1, available: true, route: '/servicos/carteira-estudante', icon: IdCard, iconImage: iconAbafe, exampleImage: exemploAbafe },
      { id: 'dne-digital', name: 'DNE', description: 'Documento Nacional do Estudante', credits: 1, available: false, route: '#', icon: IdCard, iconImage: iconDne },
      { id: 'cie-estudante', name: 'CIE', description: 'Carteira de Identidade Estudantil', credits: 1, available: false, route: '#', icon: IdCard, iconImage: iconCie },
      { id: 'pagmeia-estudante', name: 'PAGMEIA', description: 'Carteira de Estudante PagMeia', credits: 1, available: false, route: '#', icon: IdCard, iconImage: iconPagmeia },
    ],
  },
  {
    title: 'CRLV',
    icon: Car,
    services: [
      { id: 'crlv-digital', name: 'CRLV PDF (QR OFF)', description: 'Certificado de Registro e Licenciamento de Veículo', credits: 1, available: true, route: '/servicos/crlv-digital', icon: Car },
      { id: 'crlv-digital-qr', name: 'CRLV PDF (QR ON)', description: 'CRLV com QR Code integrado', credits: 1, available: false, route: '#', icon: Car },
    ],
  },
  {
    title: 'Certidão de Nascimento',
    icon: FileText,
    services: [
      { id: 'certidao-nascimento-qr-off', name: 'CERTIDÃO (QR OFF)', description: 'Certidão de nascimento sem QR Code', credits: 1, available: false, route: '#', icon: FileText },
      { id: 'certidao-nascimento-qr-on', name: 'CERTIDÃO (QR ON)', description: 'Certidão de nascimento com QR Code', credits: 1, available: false, route: '#', icon: FileText },
    ],
  },
  {
    title: 'PDF',
    icon: FileText,
    services: [
      { id: 'comprovante-residencia', name: 'COMPROVANTE DE RESIDÊNCIA', description: 'Comprovante de endereço', credits: 1, available: false, route: '#', icon: Home },
      { id: 'certidao-obito', name: 'CERTIDÃO DE ÓBITO', description: 'Certidão de óbito digital', credits: 1, available: false, route: '#', icon: FileText },
      { id: 'certidao-casamento', name: 'CERTIDÃO DE CASAMENTO', description: 'Certidão de casamento digital', credits: 1, available: false, route: '#', icon: FileText },
    ],
  },
  {
    title: 'Atestados',
    icon: Stethoscope,
    services: [
      { id: 'atestado-upa24h', name: 'UPA 24H', description: 'Atestado médico - Todos os estados', credits: 1, available: false, route: '#', icon: Stethoscope, iconImage: iconUpa24h },
      { id: 'atestado-unimed', name: 'UNIMED', description: 'Atestado médico - Todos os estados', credits: 1, available: false, route: '#', icon: Stethoscope, iconImage: iconUnimed },
      { id: 'atestado-hapvida', name: 'HAPVIDA', description: 'Atestado médico - Todos os estados', credits: 1, available: true, route: '/servicos/atestado-hapvida', icon: Stethoscope, iconImage: iconHapvida },
    ],
  },
];

interface InternationalCountry {
  name: string;
  flag: string;
  available: boolean;
}

interface InternationalCategory {
  title: string;
  emoji: string;
  countries: InternationalCountry[];
}

const internationalCategories: InternationalCategory[] = [
  {
    title: 'Passaportes',
    emoji: '🛂',
    countries: [
      { name: 'Estados Unidos', flag: '🇺🇸', available: false },
      { name: 'Reino Unido', flag: '🇬🇧', available: false },
      { name: 'Canadá', flag: '🇨🇦', available: false },
      { name: 'Austrália', flag: '🇦🇺', available: false },
      { name: 'Japão', flag: '🇯🇵', available: false },
      { name: 'Alemanha', flag: '🇩🇪', available: false },
      { name: 'França', flag: '🇫🇷', available: false },
      { name: 'Itália', flag: '🇮🇹', available: false },
      { name: 'Portugal', flag: '🇵🇹', available: false },
      { name: 'México', flag: '🇲🇽', available: false },
    ],
  },
  {
    title: 'Carteiras de Identidade',
    emoji: '🪪',
    countries: [
      { name: 'Eslováquia', flag: '🇸🇰', available: false },
      { name: 'Alemanha', flag: '🇩🇪', available: false },
      { name: 'Ucrânia', flag: '🇺🇦', available: false },
      { name: 'Noruega', flag: '🇳🇴', available: false },
      { name: 'Armênia', flag: '🇦🇲', available: false },
      { name: 'Áustria', flag: '🇦🇹', available: false },
      { name: 'Bangladesh', flag: '🇧🇩', available: false },
      { name: 'Bulgária', flag: '🇧🇬', available: false },
      { name: 'Bélgica', flag: '🇧🇪', available: false },
      { name: 'Camarões', flag: '🇨🇲', available: false },
      { name: 'Chile', flag: '🇨🇱', available: false },
      { name: 'Croácia', flag: '🇭🇷', available: false },
      { name: 'Tcheco', flag: '🇨🇿', available: false },
      { name: 'Chipre', flag: '🇨🇾', available: false },
      { name: 'Dinamarca', flag: '🇩🇰', available: false },
      { name: 'Dominicano', flag: '🇩🇴', available: false },
      { name: 'Egito', flag: '🇪🇬', available: false },
      { name: 'Estônia', flag: '🇪🇪', available: false },
      { name: 'Finlândia', flag: '🇫🇮', available: false },
      { name: 'Geórgia', flag: '🇬🇪', available: false },
      { name: 'Grécia', flag: '🇬🇷', available: false },
      { name: 'Hungria', flag: '🇭🇺', available: false },
      { name: 'Índia', flag: '🇮🇳', available: false },
      { name: 'Indonésia', flag: '🇮🇩', available: false },
      { name: 'Irlanda', flag: '🇮🇪', available: false },
      { name: 'Israel', flag: '🇮🇱', available: false },
      { name: 'Itália', flag: '🇮🇹', available: false },
      { name: 'Costa do Marfim', flag: '🇨🇮', available: false },
      { name: 'Cazaquistão', flag: '🇰🇿', available: false },
      { name: 'Quênia', flag: '🇰🇪', available: false },
      { name: 'Quirguistão', flag: '🇰🇬', available: false },
      { name: 'Letônia', flag: '🇱🇻', available: false },
      { name: 'Lituânia', flag: '🇱🇹', available: false },
      { name: 'Malásia', flag: '🇲🇾', available: false },
      { name: 'Malta', flag: '🇲🇹', available: false },
      { name: 'Holanda', flag: '🇳🇱', available: false },
      { name: 'Nova Zelândia', flag: '🇳🇿', available: false },
      { name: 'Nigéria', flag: '🇳🇬', available: false },
      { name: 'Macedônia do Norte', flag: '🇲🇰', available: false },
      { name: 'Peru', flag: '🇵🇪', available: false },
      { name: 'Portugal', flag: '🇵🇹', available: false },
      { name: 'Polônia', flag: '🇵🇱', available: false },
      { name: 'Romênia', flag: '🇷🇴', available: false },
    ],
  },
  {
    title: 'Carteiras de Motorista',
    emoji: '🚗',
    countries: [
      { name: 'Estados Unidos', flag: '🇺🇸', available: false },
      { name: 'Reino Unido', flag: '🇬🇧', available: false },
      { name: 'China', flag: '🇨🇳', available: false },
      { name: 'Hong Kong', flag: '🇭🇰', available: false },
      { name: 'França', flag: '🇫🇷', available: false },
      { name: 'Canadá', flag: '🇨🇦', available: false },
      { name: 'Alemanha', flag: '🇩🇪', available: false },
      { name: 'Japão', flag: '🇯🇵', available: false },
      { name: 'Austrália', flag: '🇦🇺', available: false },
      { name: 'México', flag: '🇲🇽', available: false },
    ],
  },
  {
    title: 'Contas',
    emoji: '🧾',
    countries: [
      { name: 'Estados Unidos', flag: '🇺🇸', available: false },
      { name: 'Reino Unido', flag: '🇬🇧', available: false },
      { name: 'Canadá', flag: '🇨🇦', available: false },
      { name: 'Austrália', flag: '🇦🇺', available: false },
      { name: 'Alemanha', flag: '🇩🇪', available: false },
    ],
  },
  {
    title: 'Extratos Bancários',
    emoji: '🏦',
    countries: [
      { name: 'Estados Unidos', flag: '🇺🇸', available: false },
      { name: 'Reino Unido', flag: '🇬🇧', available: false },
      { name: 'Canadá', flag: '🇨🇦', available: false },
      { name: 'Austrália', flag: '🇦🇺', available: false },
      { name: 'Alemanha', flag: '🇩🇪', available: false },
    ],
  },
];

// ─── Service Card (Nacional) ───
function ServiceCard({ service, hasCredits }: { service: Service; hasCredits: boolean }) {
  const navigate = useNavigate();
  const canAccess = service.available && hasCredits;
  const Icon = service.icon || FileText;
  const [showExample, setShowExample] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showExample) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setShowExample(false);
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
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
          {service.iconImage
            ? <img src={service.iconImage} alt={service.name} className="h-10 w-10 object-contain rounded-full" />
            : <Icon className="h-6 w-6 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{service.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{service.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {service.exampleImage && (
            <button onClick={(e) => { e.stopPropagation(); setShowExample(!showExample); }} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition-colors px-1.5 py-0.5 rounded bg-primary/5 hover:bg-primary/10">
              <Eye className="h-2.5 w-2.5" /> Exemplo
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
          <img src={service.exampleImage} alt={`Exemplo ${service.name}`} className="w-full object-contain max-h-[300px]" draggable={false} onContextMenu={(e) => e.preventDefault()} />
        </div>
      )}
    </div>
  );
}

// ─── Accordion Category (Nacional) ───
function CategoryAccordion({ cat, hasCredits }: { cat: ServiceCategory; hasCredits: boolean }) {
  const [open, setOpen] = useState(true);
  const Icon = cat.icon;
  const activeCount = cat.services.filter(s => s.available).length;
  const sorted = [...cat.services.filter(s => s.available), ...cat.services.filter(s => !s.available)];

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        <Icon className="h-5 w-5" />
        <span className="flex-1 text-left">{cat.title}</span>
        {activeCount > 0 && (
          <Badge className="bg-primary-foreground/20 text-primary-foreground text-[10px] border-0">{activeCount} ativo{activeCount > 1 ? 's' : ''}</Badge>
        )}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-2 space-y-2 bg-card">
          {sorted.map((service) => (
            <ServiceCard key={service.id} service={service} hasCredits={hasCredits} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── International Accordion ───
function InternationalAccordion({ cat }: { cat: InternationalCategory }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors"
      >
        <span className="text-lg">{cat.emoji}</span>
        <span className="flex-1 text-left">{cat.title}</span>
        <Badge className="bg-white/20 text-white text-[10px] border-0">{cat.countries.length}</Badge>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-2 space-y-1.5 bg-card">
          {cat.countries.map((country) => (
            <div key={country.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card opacity-60 cursor-default">
              <span className="text-2xl">{country.flag}</span>
              <span className="flex-1 font-medium text-sm text-foreground">{country.name}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                <Clock className="h-2.5 w-2.5 mr-0.5" /> Breve
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ───
export default function Servicos() {
  const { admin, credits, loading } = useAuth();
  const hasCredits = credits > 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!admin) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="space-y-4">
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

        <Tabs defaultValue="nacional" className="w-full">
          <TabsList className="w-full mb-4 h-11">
            <TabsTrigger value="nacional" className="flex-1 gap-2 text-sm font-semibold">
              <Globe className="h-4 w-4" /> Nacional
            </TabsTrigger>
            <TabsTrigger value="internacional" className="flex-1 gap-2 text-sm font-semibold">
              <Crown className="h-4 w-4" /> Internacional VIP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nacional" className="space-y-3 mt-0">
            {categories.map((cat) => (
              <CategoryAccordion key={cat.title} cat={cat} hasCredits={hasCredits} />
            ))}
          </TabsContent>

          <TabsContent value="internacional" className="space-y-3 mt-0">
            {/* VIP Banner */}
            <div className="relative overflow-hidden rounded-xl border-2 border-orange-400 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    Documentos Internacionais
                    <Badge className="bg-white/20 text-white border-0 text-[10px]">VIP</Badge>
                  </h3>
                  <p className="text-white/80 text-xs">Módulos premium com documentos de diversos países. Em breve disponível.</p>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 h-16 w-16 rounded-full bg-white/5" />
            </div>

            {internationalCategories.map((cat) => (
              <InternationalAccordion key={cat.title} cat={cat} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
