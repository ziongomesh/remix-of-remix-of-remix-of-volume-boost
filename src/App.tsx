import { Suspense, lazy } from "react";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { Loader2 } from "lucide-react";

// Eagerly loaded (lightweight pages)
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Lazy loaded (heavy pages with template assets)
const CnhDigital = lazy(() => import("./pages/CnhDigital"));
const CrlvDigital = lazy(() => import("./pages/CrlvDigital"));
const RgDigital = lazy(() => import("./pages/RgDigital"));
const CnhNautica = lazy(() => import("./pages/CnhNautica"));
const CarteiraEstudante = lazy(() => import("./pages/CarteiraEstudante"));
const PdfPositionTool = lazy(() => import("./pages/PdfPositionTool"));
const RgQrPositionTool = lazy(() => import("./pages/RgQrPositionTool"));
const ChaPositionTool = lazy(() => import("./pages/ChaPositionTool"));
const MockupGenerator = lazy(() => import("./pages/MockupGenerator"));
const EditorPdf = lazy(() => import("./pages/EditorPdf"));
const RemoverFundo = lazy(() => import("./pages/RemoverFundo"));
const GeradorAssinatura = lazy(() => import("./pages/GeradorAssinatura"));
const HistoricoServicos = lazy(() => import("./pages/HistoricoServicos"));

// Lazy loaded (medium pages)
const Recarregar = lazy(() => import("./pages/Recarregar"));
const CriarMaster = lazy(() => import("./pages/CriarMaster"));
const CriarRevendedor = lazy(() => import("./pages/CriarRevendedor"));
const Revendedores = lazy(() => import("./pages/Revendedores"));
const RevendedorDetalhes = lazy(() => import("./pages/RevendedorDetalhes"));
const Transferir = lazy(() => import("./pages/Transferir"));
const Estatisticas = lazy(() => import("./pages/Estatisticas"));
const HistoricoTransferencias = lazy(() => import("./pages/HistoricoTransferencias"));
const Servicos = lazy(() => import("./pages/Servicos"));
const Ferramentas = lazy(() => import("./pages/Ferramentas"));
const Downloads = lazy(() => import("./pages/Downloads"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));

const queryClient = new QueryClient();

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LazyFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/recarregar" element={<Recarregar />} />
                <Route path="/criar-master" element={<CriarMaster />} />
                <Route path="/criar-revendedor" element={<CriarRevendedor />} />
                <Route path="/revendedores" element={<Revendedores />} />
                <Route path="/revendedor/:id" element={<RevendedorDetalhes />} />
                <Route path="/transferir" element={<Transferir />} />
                <Route path="/historico-transferencias" element={<HistoricoTransferencias />} />
                <Route path="/estatisticas" element={<Estatisticas />} />
                <Route path="/servicos" element={<Servicos />} />
                <Route path="/servicos/cnh-digital" element={<CnhDigital />} />
                <Route path="/servicos/crlv-digital" element={<CrlvDigital />} />
                <Route path="/servicos/rg-digital" element={<RgDigital />} />
                <Route path="/teste" element={<PdfPositionTool />} />
                <Route path="/teste2" element={<RgQrPositionTool />} />
                <Route path="/teste3" element={<ChaPositionTool />} />
                <Route path="/teste4" element={<MockupGenerator />} />
                <Route path="/ferramentas" element={<Ferramentas />} />
                <Route path="/ferramentas/remover-fundo" element={<RemoverFundo />} />
                <Route path="/ferramentas/editor-pdf" element={<EditorPdf />} />
                <Route path="/ferramentas/gerador-assinatura" element={<GeradorAssinatura />} />
                <Route path="/historico-servicos" element={<HistoricoServicos />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/servicos/carteira-estudante" element={<CarteiraEstudante />} />
                <Route path="/servicos/cnh-nautica" element={<CnhNautica />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
