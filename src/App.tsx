import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas";
import Entregas from "./pages/Entregas";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

// Vendas
import NovaVenda from "./pages/vendas/NovaVenda";
import Pedidos from "./pages/vendas/Pedidos";

// Caixa
import AcertoEntregador from "./pages/caixa/AcertoEntregador";
import CaixaDia from "./pages/caixa/CaixaDia";
import Despesas from "./pages/caixa/Despesas";

// Operacional
import ConselhosIA from "./pages/operacional/ConselhosIA";
import DashboardExecutivo from "./pages/operacional/DashboardExecutivo";
import DashboardAvancado from "./pages/operacional/DashboardAvancado";
import DashboardTrabalhista from "./pages/operacional/DashboardTrabalhista";
import DashboardLogistico from "./pages/operacional/DashboardLogistico";
import DRE from "./pages/operacional/DRE";
import MetasDesafios from "./pages/operacional/MetasDesafios";
import MapaEntregadores from "./pages/operacional/MapaEntregadores";
import PlanejamentoAnual from "./pages/operacional/PlanejamentoAnual";
import PlanejamentoMensal from "./pages/operacional/PlanejamentoMensal";

// Clientes
import CadastroClientes from "./pages/clientes/CadastroClientes";
import Campanhas from "./pages/clientes/Campanhas";
import Fidelidade from "./pages/clientes/Fidelidade";
import CRM from "./pages/clientes/CRM";
import RankingClientes from "./pages/clientes/RankingClientes";

// Estoque
import Compras from "./pages/estoque/Compras";
import Comodatos from "./pages/estoque/Comodatos";
import EstoqueRota from "./pages/estoque/EstoqueRota";
import MCMM from "./pages/estoque/MCMM";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/entregas" element={<Entregas />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          
          {/* Vendas */}
          <Route path="/vendas/nova" element={<NovaVenda />} />
          <Route path="/vendas/pedidos" element={<Pedidos />} />
          
          {/* Caixa */}
          <Route path="/caixa/acerto" element={<AcertoEntregador />} />
          <Route path="/caixa/dia" element={<CaixaDia />} />
          <Route path="/caixa/despesas" element={<Despesas />} />
          
          {/* Operacional */}
          <Route path="/operacional/ia" element={<ConselhosIA />} />
          <Route path="/operacional/executivo" element={<DashboardExecutivo />} />
          <Route path="/operacional/avancado" element={<DashboardAvancado />} />
          <Route path="/operacional/trabalhista" element={<DashboardTrabalhista />} />
          <Route path="/operacional/logistico" element={<DashboardLogistico />} />
          <Route path="/operacional/dre" element={<DRE />} />
          <Route path="/operacional/metas" element={<MetasDesafios />} />
          <Route path="/operacional/mapa" element={<MapaEntregadores />} />
          <Route path="/operacional/anual" element={<PlanejamentoAnual />} />
          <Route path="/operacional/mensal" element={<PlanejamentoMensal />} />
          
          {/* Clientes */}
          <Route path="/clientes/cadastro" element={<CadastroClientes />} />
          <Route path="/clientes/campanhas" element={<Campanhas />} />
          <Route path="/clientes/fidelidade" element={<Fidelidade />} />
          <Route path="/clientes/crm" element={<CRM />} />
          <Route path="/clientes/ranking" element={<RankingClientes />} />
          
          {/* Estoque */}
          <Route path="/estoque/compras" element={<Compras />} />
          <Route path="/estoque/comodatos" element={<Comodatos />} />
          <Route path="/estoque/rota" element={<EstoqueRota />} />
          <Route path="/estoque/mcmm" element={<MCMM />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
