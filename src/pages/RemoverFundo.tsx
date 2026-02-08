import { useState, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Download, Loader2, ImageMinus, ArrowLeft, Crop, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Cropper, { Area } from 'react-easy-crop';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

async function getCroppedImg(imageSrc: string, crop: Area): Promise<string> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  return canvas.toDataURL('image/png');
}

async function addWhiteBackground(imageBlob: Blob): Promise<string> {
  const url = URL.createObjectURL(imageBlob);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
  URL.revokeObjectURL(url);

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

export default function RemoverFundo() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione um arquivo de imagem'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Imagem muito grande (máx 10MB)'); return; }

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setCroppedImage(null);
      setResultImage(null);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!originalImage || !croppedAreaPixels) return;
    try {
      const cropped = await getCroppedImg(originalImage, croppedAreaPixels);
      setCroppedImage(cropped);
      setIsCropping(false);
    } catch { toast.error('Erro ao recortar imagem'); }
  };

  const handleSkipCrop = () => {
    setCroppedImage(originalImage);
    setIsCropping(false);
  };

  const handleRemoveBackground = async () => {
    const imageToProcess = croppedImage || originalImage;
    if (!imageToProcess) return;

    setLoading(true);
    setResultImage(null);
    setProgress(10);

    try {
      // Dynamic import to avoid loading the heavy library upfront
      const { removeBackground } = await import('@imgly/background-removal');
      setProgress(20);

      // Convert base64 to blob for the library
      const res = await fetch(imageToProcess);
      const blob = await res.blob();
      setProgress(30);

      // Remove background (runs ML model in browser)
      const resultBlob = await removeBackground(blob, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = 30 + Math.round((current / total) * 60);
            setProgress(Math.min(pct, 90));
          }
        },
      });
      setProgress(92);

      // Add white background
      const finalImage = await addWhiteBackground(resultBlob);
      setProgress(100);

      setResultImage(finalImage);
      toast.success('Fundo removido com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao remover fundo. Tente com outra imagem.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `foto-fundo-branco-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Imagem salva!');
  };

  const handleReset = () => {
    setOriginalImage(null);
    setCroppedImage(null);
    setResultImage(null);
    setIsCropping(false);
    setProgress(0);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/ferramentas">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ImageMinus className="h-6 w-6 text-primary" />
              Removedor de Fundo
            </h1>
            <p className="text-muted-foreground">Envie uma foto e receba com fundo branco</p>
          </div>
        </div>

        {/* Upload */}
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

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

        {/* Cropper */}
        {isCropping && originalImage && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Crop className="h-4 w-4" /> Recortar imagem (opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative w-full h-[400px] bg-black/50 rounded-lg overflow-hidden">
                <Cropper
                  image={originalImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 4}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Zoom</span>
                <Slider value={[zoom]} onValueChange={(v) => setZoom(v[0])} min={1} max={3} step={0.1} className="flex-1" />
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleCropConfirm} className="gap-2">
                  <Check className="h-4 w-4" /> Confirmar recorte
                </Button>
                <Button onClick={handleSkipCrop} variant="outline">Usar sem recortar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview + Result */}
        {!isCropping && (croppedImage || resultImage) && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {croppedImage !== originalImage ? 'Recortada' : 'Original'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-4">
                  <img src={croppedImage || originalImage!} alt="Foto" className="max-h-80 rounded-lg object-contain" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resultado</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-4 min-h-[280px]">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground w-full">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm">Removendo fundo... {progress > 0 && `${progress}%`}</p>
                      {progress > 0 && <Progress value={progress} className="w-full max-w-xs" />}
                      <p className="text-xs text-muted-foreground">Primeira vez pode demorar (carregando modelo IA)</p>
                    </div>
                  ) : resultImage ? (
                    <img src={resultImage} alt="Fundo branco" className="max-h-80 rounded-lg object-contain" />
                  ) : (
                    <p className="text-sm text-muted-foreground">Clique no botão abaixo</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {!loading && !resultImage && (
                <Button onClick={handleRemoveBackground} className="gap-2" size="lg">
                  <ImageMinus className="h-4 w-4" /> Remover Fundo
                </Button>
              )}
              {resultImage && (
                <Button onClick={handleDownload} className="gap-2" size="lg">
                  <Download className="h-4 w-4" /> Salvar Imagem
                </Button>
              )}
              <Button onClick={handleReset} variant="ghost" size="lg">Nova imagem</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
