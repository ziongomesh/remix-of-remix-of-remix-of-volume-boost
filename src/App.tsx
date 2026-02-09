import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "next-themes";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Recarregar from "./pages/Recarregar";
import CriarMaster from "./pages/CriarMaster";
import CriarRevendedor from "./pages/CriarRevendedor";
import Revendedores from "./pages/Revendedores";
import RevendedorDetalhes from "./pages/RevendedorDetalhes";
import Transferir from "./pages/Transferir";
import Estatisticas from "./pages/Estatisticas";
import HistoricoTransferencias from "./pages/HistoricoTransferencias";
import Servicos from "./pages/Servicos";
import CnhDigital from "./pages/CnhDigital";
import PdfPositionTool from "./pages/PdfPositionTool";
import RgQrPositionTool from "./pages/RgQrPositionTool";
import Ferramentas from "./pages/Ferramentas";
import RemoverFundo from "./pages/RemoverFundo";
import EditorPdf from "./pages/EditorPdf";
import GeradorAssinatura from "./pages/GeradorAssinatura";
import HistoricoServicos from "./pages/HistoricoServicos";
import Downloads from "./pages/Downloads";
import RgDigital from "./pages/RgDigital";
import NotFound from "./pages/NotFound";
import Configuracoes from "./pages/Configuracoes";
import CarteiraEstudante from "./pages/CarteiraEstudante";
import CnhNautica from "./pages/CnhNautica";
import ChaPositionTool from "./pages/ChaPositionTool";
import MockupGenerator from "./pages/MockupGenerator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
