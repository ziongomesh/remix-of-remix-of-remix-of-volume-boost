import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  adminId: number;
}

const STORAGE_KEY = 'crlv_module_seen_';

export default function NewModuleNotification({ adminId }: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const key = STORAGE_KEY + adminId;
    if (!localStorage.getItem(key)) {
      setOpen(true);
    }
  }, [adminId]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY + adminId, '1');
    setOpen(false);
  };

  const handleGoToCrlv = () => {
    localStorage.setItem(STORAGE_KEY + adminId, '1');
    setOpen(false);
    navigate('/servicos/crlv-digital');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="max-w-xs p-6 gap-4 text-center">
        <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Novo módulo disponível</h3>
          <p className="text-xs text-muted-foreground">
            O CRLV Digital já está disponível para uso. Gere documentos de veículos diretamente pelo painel.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={handleDismiss}>
            Depois
          </Button>
          <Button size="sm" className="flex-1 text-xs" onClick={handleGoToCrlv}>
            Experimentar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
