import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Download, Loader2, ImageMinus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type OutputMode = 'transparent' | 'white';

export default function RemoverFundo() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setResultImage(null);
      setOutputMode(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async (mode: OutputMode) => {
    if (!originalImage) return;

    setOutputMode(mode);
    setLoading(true);
    setResultImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('remove-background', {
        body: { imageBase64: originalImage, outputMode: mode },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.image) {
        setResultImage(data.image);
        toast.success('Fundo removido com sucesso!');
      } else {
        throw new Error('Resultado inesperado');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao remover fundo');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `foto-sem-fundo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Imagem salva!');
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setOutputMode(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/ferramentas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ImageMinus className="h-6 w-6 text-primary" />
              Removedor de Fundo
            </h1>
            <p className="text-muted-foreground">Envie uma foto 3x4 e remova o fundo com IA</p>
          </div>
        </div>

        {/* Upload Area */}
        {!originalImage && (
          <Card
            className="border-dashed border-2 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-medium">Clique para enviar uma imagem</p>
                <p className="text-sm text-muted-foreground">PNG, JPG ou WEBP (máx 10MB)</p>
              </div>
            </CardContent>
          </Card>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Image Preview + Actions */}
        {originalImage && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Original */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Original</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-4">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="max-h-80 rounded-lg object-contain"
                  />
                </CardContent>
              </Card>

              {/* Result */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resultado</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-4 min-h-[280px]">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm">Removendo fundo...</p>
                    </div>
                  ) : resultImage ? (
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\'%3E%3Crect width=\'10\' height=\'10\' fill=\'%23ccc\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23ccc\'/%3E%3C/svg%3E")',
                        backgroundSize: '20px 20px',
                      }}
                    >
                      <img
                        src={resultImage}
                        alt="Sem fundo"
                        className="max-h-80 object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Escolha o tipo de fundo abaixo</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {!loading && !resultImage && (
                <>
                  <Button
                    onClick={() => handleRemoveBackground('transparent')}
                    className="gap-2"
                    size="lg"
                  >
                    <ImageMinus className="h-4 w-4" />
                    Sem Fundo (Transparente)
                  </Button>
                  <Button
                    onClick={() => handleRemoveBackground('white')}
                    variant="secondary"
                    className="gap-2"
                    size="lg"
                  >
                    <ImageMinus className="h-4 w-4" />
                    Fundo Branco
                  </Button>
                </>
              )}

              {resultImage && (
                <>
                  <Button onClick={handleDownload} className="gap-2" size="lg">
                    <Download className="h-4 w-4" />
                    Salvar Imagem
                  </Button>
                  <Button
                    onClick={() => {
                      setResultImage(null);
                      setOutputMode(null);
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Tentar outro modo
                  </Button>
                </>
              )}

              <Button onClick={handleReset} variant="ghost" size="lg">
                Nova imagem
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
