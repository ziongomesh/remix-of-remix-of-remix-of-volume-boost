import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CrlvSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  placa: string;
  senha: string;
  pdfUrl: string | null;
  nomeProprietario?: string;
  createdAt?: string;
}

export default function CrlvSuccessModal({ isOpen, onClose, placa, pdfUrl, createdAt }: CrlvSuccessModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, '');

  const handleDownloadPdf = async () => {
    if (!pdfUrl) {
      toast.error('PDF não disponível');
      return;
    }
    try {
      setIsDownloading(true);
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Erro ao baixar');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `CRLV_${cleanPlaca}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      toast.success('Download do PDF iniciado!');
    } catch {
      toast.error('Erro ao baixar PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span>CRLV Criado com Sucesso!</span>
              <div className="text-sm text-muted-foreground mt-1">
                {createdAt ? new Date(createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloading || !pdfUrl}
            className="w-full"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            📄 Baixar CRLV_{cleanPlaca}.pdf
          </Button>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
