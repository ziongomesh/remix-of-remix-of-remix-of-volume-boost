import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Copy, Loader2, Calendar, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import iconCnh from "@/assets/icon-cnh.png";
import exemploCnh from "@/assets/exemplo-cnh.png";
import AppExamplePreview from "@/components/AppExamplePreview";

interface CnhSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  cpf: string;
  senha?: string;
  nome?: string;
  pdfUrl?: string;
}

export default function CnhSuccessModal({ isOpen, onClose, cpf, senha, nome, pdfUrl }: CnhSuccessModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [cnhIphone, setCnhIphone] = useState('');
  const [cnhApk, setCnhApk] = useState('');

  useEffect(() => {
    supabase
      .from('downloads')
      .select('cnh_iphone, cnh_apk')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCnhIphone(data.cnh_iphone || '');
          setCnhApk(data.cnh_apk || '');
        }
      });
  }, []);

  const formatCpf = (cpf: string) => {
    const clean = cpf.replace(/\D/g, '');
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getPassword = () => senha || cpf.replace(/\D/g, '').substring(0, 8);

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

  const dataText = `Olá! Sua CNH Digital está pronta!

📋 *DADOS DE ACESSO:*

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓

┃ 👤 *CPF:* ${formatCpf(cpf)}

┃ 🔑 *Senha:* ${getPassword()}

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📅 *VALIDADE:*

⏳ Documento válido por 45 dias!

🗓️ Expiração automática após esse período.

⚠️ *IMPORTANTE:*

✅ Mantenha suas credenciais seguras

🎉 *Obrigado por adquirir seu acesso!*`;

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const downloadUrl = pdfUrl || '';
      if (!downloadUrl) {
        toast.error('PDF não disponível');
        return;
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Erro ao baixar');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `CNH-e.pdf`;
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

  const expirationDate = (() => {
    const now = new Date();
    now.setDate(now.getDate() + 45);
    return now.toLocaleDateString('pt-BR');
  })();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span>CNH Criada com Sucesso!</span>
              <div className="text-sm text-muted-foreground mt-1">
                Documento digital pronto para uso
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Dados de Acesso */}
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Dados de Acesso</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span className="text-muted-foreground">CPF:</span>
                </div>
                <span className="font-mono font-semibold">{formatCpf(cpf)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>🔑</span>
                  <span className="text-muted-foreground">Senha:</span>
                </div>
                <span className="font-mono font-semibold">{getPassword()}</span>
              </div>
            </div>
          </div>

          {/* Validade */}
          <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Validade: 45 dias</h4>
            </div>
            <p className="text-sm text-muted-foreground">Expira em: <strong>{expirationDate}</strong></p>
          </div>

          <AppExamplePreview appName="CNH do Brasil" exampleImage={exemploCnh} />

          {/* Ações */}
          <div className="space-y-3">
            <Button
              onClick={() => copyToClipboard(dataText, 'Dados copiados!')}
              className="w-full"
              variant="outline"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Dados do Usuário
            </Button>

            <Button
              onClick={() => {
                if (!cnhIphone) { toast.error('Link iPhone não configurado'); return; }
                copyToClipboard(cnhIphone, 'Link iPhone copiado!');
              }}
              variant="outline"
              className="w-full"
            >
               <Copy className="w-4 h-4 mr-2" />
              Copiar Link iPhone
            </Button>

            <Button
              onClick={() => {
                if (!cnhApk) { toast.error('Link APK não configurado'); return; }
                copyToClipboard(cnhApk, 'Link APK copiado!');
              }}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Link Android
            </Button>

            <Button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="w-full"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              📄 Baixar PDF CNH Digital
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
