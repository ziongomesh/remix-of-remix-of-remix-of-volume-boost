import { useRef, useEffect, useState } from "react";
import { Download, X, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateCNH } from "@/lib/cnh-generator";
import { generateCNHMeio } from "@/lib/cnh-generator-meio";
import { generateCNHVerso } from "@/lib/cnh-generator-verso";
import { toast } from "sonner";
import { getStateFullName } from "@/lib/cnh-utils";
import CnhSuccessModal from "./CnhSuccessModal";
import { api } from "@/lib/api";

interface CnhPreviewProps {
  cnhData: any;
  onClose: () => void;
  onSaveSuccess?: () => void;
  onEdit?: () => void;
}

export default function CnhPreview({ cnhData, onClose, onSaveSuccess, onEdit }: CnhPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasMeioRef = useRef<HTMLCanvasElement>(null);
  const canvasVersoRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMeioUrl, setPreviewMeioUrl] = useState<string | null>(null);
  const [previewVersoUrl, setPreviewVersoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingCnh, setIsCreatingCnh] = useState(false);
  const [creationStep, setCreationStep] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [modalImageTitle, setModalImageTitle] = useState('');

  // Formatar observações
  const formatarObs = (obs: string): string => {
    if (!obs) return '';
    const limpa = obs.toString().trim().replace(/;+$/g, '').trim();
    if (!limpa) return '';
    if (!limpa.includes(',')) return limpa + ';';
    const itens = limpa.split(',').map(item => item.trim()).filter(item => item.length > 0);
    if (itens.length === 0) return '';
    return itens.join(', ') + ';';
  };

  useEffect(() => {
    const generatePreviews = async () => {
      if (!canvasRef.current || !canvasMeioRef.current || !canvasVersoRef.current || !cnhData) return;

      try {
        setLoading(true);

        // Frente
        const canvas = canvasRef.current;
        const cnhDefinitivaValue = cnhData.cnhDefinitiva || 'sim';
        await generateCNH(canvas, cnhData, cnhDefinitivaValue);
        setPreviewUrl(canvas.toDataURL('image/png'));

        // Meio
        const canvasMeio = canvasMeioRef.current;
        const meioData = {
          ...cnhData,
          obs: formatarObs(cnhData.obs),
          estadoExtenso: cnhData.estadoExtenso || getStateFullName(cnhData.uf),
        };
        await generateCNHMeio(canvasMeio, meioData);
        setPreviewMeioUrl(canvasMeio.toDataURL('image/png'));

        // Verso
        const canvasVerso = canvasVersoRef.current;
        await generateCNHVerso(canvasVerso, cnhData);
        setPreviewVersoUrl(canvasVerso.toDataURL('image/png'));
      } catch (error) {
        console.error('Erro ao gerar previews:', error);
        toast.error('Erro ao gerar preview da CNH');
      } finally {
        setLoading(false);
      }
    };

    generatePreviews();
  }, [cnhData]);

  const handleDownload = () => {
    if (!canvasRef.current || !canvasMeioRef.current || !canvasVersoRef.current) return;

    const link1 = document.createElement('a');
    link1.download = 'cnh-frente.png';
    link1.href = canvasRef.current.toDataURL('image/png');
    link1.click();

    setTimeout(() => {
      const link2 = document.createElement('a');
      link2.download = 'cnh-meio.png';
      link2.href = canvasMeioRef.current!.toDataURL('image/png');
      link2.click();
    }, 100);

    setTimeout(() => {
      const link3 = document.createElement('a');
      link3.download = 'cnh-verso.png';
      link3.href = canvasVersoRef.current!.toDataURL('image/png');
      link3.click();
    }, 200);
  };

  const handleSaveToDatabase = async () => {
    if (isCreatingCnh) return;

    const cpf = cnhData.cpf?.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) {
      toast.error('CPF inválido');
      return;
    }

    // Verificar créditos
    const adminStr = localStorage.getItem('admin');
    if (!adminStr) {
      toast.error('Sessão expirada. Faça login novamente.');
      return;
    }
    const admin = JSON.parse(adminStr);
    if (admin.creditos <= 0) {
      toast.error('Créditos insuficientes para criar CNH.');
      return;
    }

    setIsCreatingCnh(true);
    setCreationStep('Preparando dados da CNH...');

    try {
      // Preparar FormData com as imagens do canvas
      const formData = new FormData();

      // Adicionar todos os campos de texto
      Object.entries(cnhData).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          formData.append(key, value);
        }
      });

      if (!cnhData.cnhDefinitiva) {
        formData.append('cnhDefinitiva', 'sim');
      }

      // Converter canvas para blobs
      if (canvasRef.current && canvasMeioRef.current && canvasVersoRef.current) {
        setCreationStep('Gerando imagens...');

        const cnhFinalBlob = await new Promise<Blob>((resolve) => {
          canvasRef.current!.toBlob((blob) => resolve(blob!), 'image/png');
        });
        const cnhMeioBlob = await new Promise<Blob>((resolve) => {
          canvasMeioRef.current!.toBlob((blob) => resolve(blob!), 'image/png');
        });
        const cnhVersoBlob = await new Promise<Blob>((resolve) => {
          canvasVersoRef.current!.toBlob((blob) => resolve(blob!), 'image/png');
        });

        formData.append('cnhFinalEditada', cnhFinalBlob, 'cnh-final.png');
        formData.append('cnhMeio', cnhMeioBlob, 'cnh-meio.png');
        formData.append('cnhVerso', cnhVersoBlob, 'cnh-verso.png');
      }

      // Adicionar foto se for File
      if (cnhData.foto instanceof File) {
        formData.append('foto', cnhData.foto);
      }

      setCreationStep('Salvando no servidor...');

      // Enviar para a API (MySQL backend)
      const response = await fetch(`${getApiUrl()}/api/cnh`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.status === 409) {
        const errorData = await response.json();
        toast.error(`CPF já cadastrado: ${errorData.details?.existingCnh?.nome || ''}`);
        setIsCreatingCnh(false);
        setCreationStep('');
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Sucesso
      setSuccessData({
        id: result.id,
        cpf: cnhData.cpf,
        nome: cnhData.nome,
        senha: result.senha || cpf.slice(-6),
        pdf: result.pdf,
        qrcode: result.qrcode,
        dataExpiracao: result.dataExpiracao,
      });

      // Atualizar créditos localmente
      const updatedAdmin = { ...admin, creditos: admin.creditos - 1 };
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));

      setShowSuccessModal(true);
      toast.success('CNH criada com sucesso! 1 crédito descontado.');
      onSaveSuccess?.();
    } catch (error: any) {
      console.error('Erro ao salvar CNH:', error);
      toast.error(error.message || 'Erro ao salvar CNH');
    } finally {
      setIsCreatingCnh(false);
      setCreationStep('');
    }
  };

  const openImageModal = (url: string, title: string) => {
    setModalImageUrl(url);
    setModalImageTitle(title);
    setShowImageModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Canvas ocultos para geração */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={canvasMeioRef} className="hidden" />
      <canvas ref={canvasVersoRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Preview da CNH</h2>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Editar Dados
            </Button>
          )}
          <Button variant="outline" onClick={handleDownload} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PNGs
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Gerando preview...</span>
        </div>
      ) : (
        <>
          {/* Preview das 3 imagens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Frente */}
            <Card className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => previewUrl && openImageModal(previewUrl, 'CNH Frente')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Frente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewUrl && (
                  <img src={previewUrl} alt="CNH Frente" className="w-full rounded-lg border" />
                )}
              </CardContent>
            </Card>

            {/* Meio */}
            <Card className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => previewMeioUrl && openImageModal(previewMeioUrl, 'CNH Meio')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Meio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewMeioUrl && (
                  <img src={previewMeioUrl} alt="CNH Meio" className="w-full rounded-lg border" />
                )}
              </CardContent>
            </Card>

            {/* Verso */}
            <Card className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => previewVersoUrl && openImageModal(previewVersoUrl, 'CNH Verso')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Verso
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewVersoUrl && (
                  <img src={previewVersoUrl} alt="CNH Verso" className="w-full rounded-lg border" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Botão criar */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSaveToDatabase}
              disabled={isCreatingCnh}
              size="lg"
              className="min-w-[280px]"
            >
              {isCreatingCnh ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {creationStep}
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Criar CNH Digital (1 crédito)
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Modal de imagem ampliada */}
      {showImageModal && modalImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="absolute -top-12 right-0 text-white" onClick={() => setShowImageModal(false)}>
              <X className="h-6 w-6" />
            </Button>
            <h3 className="text-white text-center mb-2 font-semibold">{modalImageTitle}</h3>
            <img src={modalImageUrl} alt={modalImageTitle} className="w-full rounded-lg" />
          </div>
        </div>
      )}

      {/* Modal de sucesso */}
      {showSuccessModal && successData && (
        <CnhSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            onClose();
          }}
          cpf={successData.cpf}
          senha={successData.senha}
          nome={successData.nome}
        />
      )}
    </div>
  );
}

// Helper icon component
function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function getApiUrl(): string {
  // Em produção, usa mesma origem; em dev, usa localhost:4000
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  return 'http://localhost:4000';
}
