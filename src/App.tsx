import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DeliveryNotificationProvider } from "@/contexts/DeliveryNotificationContext";
import Dashboard from "./pages/Dashboard";
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

// Cadastros
import CadastroClientesCad from "./pages/cadastros/CadastroClientesCad";
import Fornecedores from "./pages/cadastros/Fornecedores";
import Veiculos from "./pages/cadastros/Veiculos";
import Funcionarios from "./pages/cadastros/Funcionarios";
import Produtos from "./pages/cadastros/Produtos";

// Financeiro
import FluxoCaixa from "./pages/financeiro/FluxoCaixa";
import PrevisaoCaixa from "./pages/financeiro/PrevisaoCaixa";
import ContasPagar from "./pages/financeiro/ContasPagar";
import ContasReceber from "./pages/financeiro/ContasReceber";
import AprovarDespesas from "./pages/financeiro/AprovarDespesas";
import Conciliacao from "./pages/financeiro/Conciliacao";
import Contador from "./pages/financeiro/Contador";

// Frota
import Combustivel from "./pages/frota/Combustivel";
import Manutencao from "./pages/frota/Manutencao";
import RelatoriosFrota from "./pages/frota/RelatoriosFrota";
import Gamificacao from "./pages/frota/Gamificacao";

// RH
import FolhaPagamento from "./pages/rh/FolhaPagamento";
import ValeFuncionario from "./pages/rh/ValeFuncionario";
import ComissaoEntregador from "./pages/rh/ComissaoEntregador";
import Premiacao from "./pages/rh/Premiacao";
import Bonus from "./pages/rh/Bonus";
import AlertaJornada from "./pages/rh/AlertaJornada";
import BancoHoras from "./pages/rh/BancoHoras";
import Horarios from "./pages/rh/Horarios";
import PrevencaoTrabalhistaIA from "./pages/rh/PrevencaoTrabalhistaIA";
import ProdutividadeIA from "./pages/rh/ProdutividadeIA";

// Configurações
import Auditoria from "./pages/config/Auditoria";
import Permissoes from "./pages/config/Permissoes";

// App Entregador
import EntregadorDashboard from "./pages/entregador/EntregadorDashboard";
import EntregadorEntregas from "./pages/entregador/EntregadorEntregas";
import FinalizarEntrega from "./pages/entregador/FinalizarEntrega";
import EntregadorRotas from "./pages/entregador/EntregadorRotas";
import EntregadorNovaVenda from "./pages/entregador/EntregadorNovaVenda";
import EntregadorDespesas from "./pages/entregador/EntregadorDespesas";
import EntregadorPerfil from "./pages/entregador/EntregadorPerfil";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DeliveryNotificationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          
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
          
          {/* Cadastros */}
          <Route path="/cadastros/clientes" element={<CadastroClientesCad />} />
          <Route path="/cadastros/fornecedores" element={<Fornecedores />} />
          <Route path="/cadastros/veiculos" element={<Veiculos />} />
          <Route path="/cadastros/funcionarios" element={<Funcionarios />} />
          <Route path="/cadastros/produtos" element={<Produtos />} />
          
          {/* Financeiro */}
          <Route path="/financeiro/fluxo" element={<FluxoCaixa />} />
          <Route path="/financeiro/previsao" element={<PrevisaoCaixa />} />
          <Route path="/financeiro/pagar" element={<ContasPagar />} />
          <Route path="/financeiro/receber" element={<ContasReceber />} />
          <Route path="/financeiro/aprovar" element={<AprovarDespesas />} />
          <Route path="/financeiro/conciliacao" element={<Conciliacao />} />
          <Route path="/financeiro/contador" element={<Contador />} />
          
          {/* Frota */}
          <Route path="/frota/combustivel" element={<Combustivel />} />
          <Route path="/frota/manutencao" element={<Manutencao />} />
          <Route path="/frota/relatorios" element={<RelatoriosFrota />} />
          <Route path="/frota/gamificacao" element={<Gamificacao />} />
          
          {/* RH */}
          <Route path="/rh/folha" element={<FolhaPagamento />} />
          <Route path="/rh/vale" element={<ValeFuncionario />} />
          <Route path="/rh/comissao" element={<ComissaoEntregador />} />
          <Route path="/rh/premiacao" element={<Premiacao />} />
          <Route path="/rh/bonus" element={<Bonus />} />
          <Route path="/rh/jornada" element={<AlertaJornada />} />
          <Route path="/rh/banco-horas" element={<BancoHoras />} />
          <Route path="/rh/horarios" element={<Horarios />} />
          <Route path="/rh/prevencao-ia" element={<PrevencaoTrabalhistaIA />} />
          <Route path="/rh/produtividade-ia" element={<ProdutividadeIA />} />
          
          {/* Configurações */}
          <Route path="/config/auditoria" element={<Auditoria />} />
          <Route path="/config/permissoes" element={<Permissoes />} />
          
          {/* App Entregador */}
          <Route path="/entregador" element={<EntregadorDashboard />} />
          <Route path="/entregador/entregas" element={<EntregadorEntregas />} />
          <Route path="/entregador/entregas/:id/finalizar" element={<FinalizarEntrega />} />
          <Route path="/entregador/rotas" element={<EntregadorRotas />} />
          <Route path="/entregador/nova-venda" element={<EntregadorNovaVenda />} />
          <Route path="/entregador/despesas" element={<EntregadorDespesas />} />
          <Route path="/entregador/perfil" element={<EntregadorPerfil />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </DeliveryNotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
