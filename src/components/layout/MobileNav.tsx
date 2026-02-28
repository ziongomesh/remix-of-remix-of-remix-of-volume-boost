import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  Home, LogOut, Menu, FolderOpen, Wrench, Download, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Logo } from '@/components/Logo';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roles: Array<'dono' | 'sub' | 'master' | 'revendedor'>;
}

const navItems: NavItem[] = [
  { label: 'Início', icon: Home, href: '/dashboard', roles: ['dono', 'sub', 'master', 'revendedor'] },
  { label: 'Serviços', icon: FolderOpen, href: '/servicos', roles: ['dono', 'sub', 'master', 'revendedor'] },
  { label: 'Ferramentas', icon: Wrench, href: '/ferramentas', roles: ['dono', 'sub', 'master', 'revendedor'] },
  { label: 'Downloads', icon: Download, href: '/downloads', roles: ['dono', 'sub', 'master', 'revendedor'] },
  { label: 'Configurações', icon: Settings, href: '/configuracoes', roles: ['dono', 'sub', 'master'] },
];

export function MobileNav() {
  const { role, signOut, admin } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const filteredItems = navItems.filter(item => 
    role && item.roles.includes(role)
  );

  const getRoleLabel = () => {
    switch (role) {
      case 'dono': return 'Dono';
      case 'sub': return 'Sub Dono';
      case 'master': return 'Master';
      case 'revendedor': return 'Revendedor';
      default: return '';
    }
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar-background border-b border-sidebar-border">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <span className="text-sm font-semibold text-sidebar-foreground">Data Sistemas</span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0 bg-sidebar-background border-sidebar-border">
            <div className="flex flex-col h-full">
              <div className="p-5 pb-3">
                <div className="flex items-center gap-2.5">
                  <Logo className="h-8 w-8" />
                  <span className="text-sm font-semibold text-sidebar-foreground">Data Sistemas</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 ml-[42px]">{getRoleLabel()}</p>
              </div>

              <nav className="flex-1 px-3 py-2 space-y-0.5">
                {filteredItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <SheetClose asChild key={item.href}>
                      <Link to={item.href}>
                        <button
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                            isActive
                              ? 'bg-primary/15 text-primary'
                              : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </button>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              <div className="px-3 py-4 border-t border-sidebar-border">
                <p className="text-[11px] text-muted-foreground truncate px-3 mb-2">{admin?.email}</p>
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
