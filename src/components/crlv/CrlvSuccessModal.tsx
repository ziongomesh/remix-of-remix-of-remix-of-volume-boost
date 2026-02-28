import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Copy, Loader2, Calendar, KeyRound, Clock } from "lucide-react";
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

export default function CrlvSuccessModal({ isOpen, onClose, placa, senha, pdfUrl, nomeProprietario, createdAt }: CrlvSuccessModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const now = createdAt ? new Date(createdAt) : new Date();
  const dataFormatada = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const horaFormatada = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });

  const copyToClipboard = (text: string, msg = 'Copiado!') => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(msg);
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(msg);
    });
  };

  const dataText = `✅ *CRLV Digital Gerado com Sucesso!*

🚗 *Placa:* ${placa}
${nomeProprietario ? `👤 *Proprietário:* ${nomeProprietario}` : ''}
🔑 *Senha:* ${senha}

📅 *Criado em:* ${dataFormatada} às ${horaFormatada}

📄 *Arquivo:* CRLV_${placa.replace(/[^A-Za-z0-9]/g, '')}.pdf`;

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
      a.download = `CRLV_${placa.replace(/[^A-Za-z0-9]/g, '')}.pdf`;
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
      <DialogContent className="max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span>CRLV Criado com Sucesso!</span>
              <div className="text-sm text-muted-foreground mt-1">
                Documento pronto para download
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info do CRLV */}
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Dados do CRLV</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>🚗</span>
                  <span className="text-muted-foreground">Placa:</span>
                </div>
                <span className="font-mono font-semibold">{placa}</span>
              </div>
              {nomeProprietario && (
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span className="text-muted-foreground">Proprietário:</span>
                  </div>
                  <span className="font-semibold text-sm truncate max-w-[200px]">{nomeProprietario}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>🔑</span>
                  <span className="text-muted-foreground">Senha:</span>
                </div>
                <span className="font-mono font-semibold">{senha}</span>
              </div>
            </div>
          </div>

          {/* Data e Hora */}
          <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Criado em</h4>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{dataFormatada}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{horaFormatada}</span>
              </div>
            </div>
          </div>

          {/* Arquivo */}
          <div className="bg-muted/50 rounded-xl p-4 border">
            <p className="text-sm text-muted-foreground">
              📄 Arquivo: <strong className="text-foreground">CRLV_{placa.replace(/[^A-Za-z0-9]/g, '')}.pdf</strong>
            </p>
          </div>

          {/* Ações */}
          <div className="space-y-3">
            <Button
              onClick={() => copyToClipboard(dataText, 'Dados copiados!')}
              className="w-full"
              variant="outline"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Dados
            </Button>

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
              📄 Baixar CRLV_{placa.replace(/[^A-Za-z0-9]/g, '')}.pdf
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
