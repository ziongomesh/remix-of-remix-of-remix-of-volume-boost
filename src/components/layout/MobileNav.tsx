import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  Home, 
  CreditCard, 
  Users, 
  BarChart3, 
  LogOut,
  UserPlus,
  Send,
  Crown,
  Shield,
  Menu,
  History,
  FolderOpen,
  Wrench,
  Download,
  ChevronDown,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roles: Array<'dono' | 'master' | 'revendedor'>;
  group?: string;
}

const navItems: NavItem[] = [
  { label: 'Início', icon: Home, href: '/dashboard-dono', roles: ['dono'] },
  { label: 'Início', icon: Home, href: '/dashboard', roles: ['master', 'revendedor'] },
  { label: 'Serviços', icon: FolderOpen, href: '/servicos', roles: ['dono', 'master', 'revendedor'] },
  { label: 'Histórico Serviços', icon: History, href: '/historico-servicos', roles: ['dono', 'master', 'revendedor'] },
  { label: 'Estatísticas', icon: BarChart3, href: '/estatisticas', roles: ['dono'] },
  { label: 'Criar Usuário', icon: UserPlus, href: '/criar-master', roles: ['dono'] },
  { label: 'Recarregar', icon: CreditCard, href: '/recarregar', roles: ['master'], group: 'master' },
  { label: 'Recarregar', icon: CreditCard, href: '/recarregar', roles: ['revendedor'] },
  { label: 'Meus Revendedores', icon: Users, href: '/revendedores', roles: ['master'], group: 'master' },
  { label: 'Transferir Créditos', icon: Send, href: '/transferir', roles: ['master'], group: 'master' },
  { label: 'Histórico & Métricas', icon: History, href: '/historico-transferencias', roles: ['master'], group: 'master' },
  { label: 'Criar Revendedor', icon: UserPlus, href: '/criar-revendedor', roles: ['master'], group: 'master' },
  { label: 'Ferramentas', icon: Wrench, href: '/ferramentas', roles: ['dono', 'master', 'revendedor'] },
  { label: 'Downloads', icon: Download, href: '/downloads', roles: ['dono', 'master', 'revendedor'] },
  { label: 'Configurações', icon: Settings, href: '/configuracoes', roles: ['dono', 'master'] },
];

const masterGroupHrefs = navItems.filter(i => i.group === 'master').map(i => i.href);

export function MobileNav() {
  const { role, signOut, admin } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isMasterGroupActive = masterGroupHrefs.includes(location.pathname);
  const [masterOpen, setMasterOpen] = useState(isMasterGroupActive);

  const filteredItems = navItems.filter(item => 
    role && item.roles.includes(role)
  );

  const topItems = filteredItems.filter(i => !i.group);
  const masterItems = filteredItems.filter(i => i.group === 'master');

  const bottomHrefs = ['/ferramentas', '/downloads', '/configuracoes'];
  const mainItems = topItems.filter(i => !bottomHrefs.includes(i.href));
  const bottomItems = topItems.filter(i => bottomHrefs.includes(i.href));

  const getRoleIcon = () => {
    switch (role) {
      case 'dono': return <Crown className="h-4 w-4" />;
      case 'master': return <Shield className="h-4 w-4" />;
      default: return null;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'dono': return 'Dono';
      case 'master': return 'Master';
      case 'revendedor': return 'Revendedor';
      default: return '';
    }
  };

  const renderNavButton = (item: NavItem) => (
    <SheetClose asChild key={item.href}>
      <Link to={item.href}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 h-11 hover:bg-primary/10 hover:text-primary',
            location.pathname === item.href && 'bg-primary/10 text-primary'
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Button>
      </Link>
    </SheetClose>
  );

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8" />
          <div>
            <h1 className="text-lg font-bold text-primary">Data Sistemas</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getRoleIcon()}
              <span>{getRoleLabel()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Logo className="h-10 w-10" />
                    <h1 className="text-xl font-bold text-primary">Data Sistemas</h1>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    {getRoleIcon()}
                    <span>{getRoleLabel()}</span>
                  </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {mainItems.map(renderNavButton)}

                  {/* Master collapsible group */}
                  {masterItems.length > 0 && (
                    <div className="pt-1">
                      <button
                        onClick={() => setMasterOpen(!masterOpen)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
                          isMasterGroupActive
                            ? 'text-primary bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5" />
                          <span>Área Master</span>
                        </div>
                        <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', masterOpen && 'rotate-180')} />
                      </button>
                      <div className={cn(
                        'overflow-hidden transition-all duration-200',
                        masterOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                      )}>
                        <div className="pl-3 space-y-0.5 border-l-2 border-primary/20 ml-6">
                          {masterItems.map(renderNavButton)}
                        </div>
                      </div>
                    </div>
                  )}

                  {bottomItems.map(renderNavButton)}
                </nav>

                <div className="p-4 border-t border-border mt-auto">
                  <div className="text-sm text-muted-foreground mb-3 truncate">
                    {admin?.email}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    Sair
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
