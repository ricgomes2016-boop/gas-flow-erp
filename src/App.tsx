import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DeliveryNotificationProvider } from "@/contexts/DeliveryNotificationContext";
import { ClienteProvider } from "@/contexts/ClienteContext";
import { ValeGasProvider } from "@/contexts/ValeGasContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UnidadeProvider } from "@/contexts/UnidadeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Vendas from "./pages/Vendas";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

// Vendas
import NovaVenda from "./pages/vendas/NovaVenda";
import Pedidos from "./pages/vendas/Pedidos";
import EditarPedido from "./pages/vendas/EditarPedido";
import PDV from "./pages/vendas/PDV";
import RelatorioVendas from "./pages/vendas/RelatorioVendas";

// Caixa
import AcertoEntregador from "./pages/caixa/AcertoEntregador";
import CaixaDia from "./pages/caixa/CaixaDia";
import Despesas from "./pages/caixa/Despesas";

// Operacional
import ConselhosIA from "./pages/operacional/ConselhosIA";
import CentralIndicadores from "./pages/operacional/CentralIndicadores";
import MapaOperacional from "./pages/operacional/MapaOperacional";
import CockpitGestor from "./pages/operacional/CockpitGestor";
import AlertasInteligentes from "./pages/operacional/AlertasInteligentes";
import AnaliseConcorrencia from "./pages/operacional/AnaliseConcorrencia";
import DashboardExecutivo from "./pages/operacional/DashboardExecutivo";
import DashboardAvancado from "./pages/operacional/DashboardAvancado";
import DashboardTrabalhista from "./pages/operacional/DashboardTrabalhista";
import DashboardLogistico from "./pages/operacional/DashboardLogistico";
import DRE from "./pages/operacional/DRE";
import MetasDesafios from "./pages/operacional/MetasDesafios";
import MapaEntregadores from "./pages/operacional/MapaEntregadores";
import PlanejamentoAnual from "./pages/operacional/PlanejamentoAnual";
import PlanejamentoMensal from "./pages/operacional/PlanejamentoMensal";
import CanaisVenda from "./pages/operacional/CanaisVenda";

// Clientes
import CadastroClientes from "./pages/clientes/CadastroClientes";
import Campanhas from "./pages/clientes/Campanhas";
import Fidelidade from "./pages/clientes/Fidelidade";
import CRM from "./pages/clientes/CRM";
import RankingClientes from "./pages/clientes/RankingClientes";

// Estoque
import Estoque from "./pages/Estoque";
import Compras from "./pages/estoque/Compras";
import Comodatos from "./pages/estoque/Comodatos";
import EstoqueRota from "./pages/estoque/EstoqueRota";
import MCMM from "./pages/estoque/MCMM";

// Cadastros
import Entregadores from "./pages/cadastros/Entregadores";
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
import ValeGasParceiros from "./pages/financeiro/ValeGasParceiros";
import ValeGasEmissao from "./pages/financeiro/ValeGasEmissao";
import ValeGasControle from "./pages/financeiro/ValeGasControle";
import ValeGasAcerto from "./pages/financeiro/ValeGasAcerto";
import ValeGasRelatorio from "./pages/financeiro/ValeGasRelatorio";

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
import Configuracoes from "./pages/Configuracoes";
import Auditoria from "./pages/config/Auditoria";
import Permissoes from "./pages/config/Permissoes";
import UnidadesConfig from "./pages/config/Unidades";
import Usuarios from "./pages/config/Usuarios";

// App Entregador
import EntregadorDashboard from "./pages/entregador/EntregadorDashboard";
import EntregadorEntregas from "./pages/entregador/EntregadorEntregas";
import FinalizarEntrega from "./pages/entregador/FinalizarEntrega";

import EntregadorNovaVenda from "./pages/entregador/EntregadorNovaVenda";
import EntregadorDespesas from "./pages/entregador/EntregadorDespesas";
import EntregadorPerfil from "./pages/entregador/EntregadorPerfil";
import EntregadorHistorico from "./pages/entregador/EntregadorHistorico";
import EntregadorIniciarJornada from "./pages/entregador/EntregadorIniciarJornada";
import EntregadorConfiguracoes from "./pages/entregador/EntregadorConfiguracoes";

// Gestão Operacional - Rotas e Escalas
import GestaoRotas from "./pages/operacional/GestaoRotas";
import GestaoEscalas from "./pages/operacional/GestaoEscalas";

// App Parceiro
import ParceiroDashboard from "./pages/parceiro/ParceiroDashboard";
import ParceiroVenderVale from "./pages/parceiro/ParceiroVenderVale";
import ParceiroVales from "./pages/parceiro/ParceiroVales";
import ParceiroQRCode from "./pages/parceiro/ParceiroQRCode";

// Página Pública
import ComprarValeGas from "./pages/publico/ComprarValeGas";

// App Cliente
import ClienteHome from "./pages/cliente/ClienteHome";
import ClienteCadastro from "./pages/cliente/ClienteCadastro";
import ClienteCarrinho from "./pages/cliente/ClienteCarrinho";
import ClienteCheckout from "./pages/cliente/ClienteCheckout";
import ClienteIndicacao from "./pages/cliente/ClienteIndicacao";
import ClienteCarteira from "./pages/cliente/ClienteCarteira";
import ClienteValeGas from "./pages/cliente/ClienteValeGas";
import ClienteHistorico from "./pages/cliente/ClienteHistorico";
import ClienteDicas from "./pages/cliente/ClienteDicas";
import ClienteConsumo from "./pages/cliente/ClienteConsumo";
import ClientePerfil from "./pages/cliente/ClientePerfil";
import ClienteRastreamento from "./pages/cliente/ClienteRastreamento";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <UnidadeProvider>
            <DeliveryNotificationProvider>
              <ClienteProvider>
                <ValeGasProvider>
                  <Toaster />
                  <Sonner />
                <ErrorBoundary>
                <Routes>
                  {/* Auth - Pública */}
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Dashboard - Protegida */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Vendas - Operacional+ */}
                  <Route path="/vendas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional", "entregador"]}>
                      <Vendas />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendas/nova" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional", "entregador"]}>
                      <NovaVenda />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendas/pedidos" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional", "entregador"]}>
                      <Pedidos />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendas/pedidos/:id/editar" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <EditarPedido />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendas/pdv" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <PDV />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendas/relatorio" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <RelatorioVendas />
                    </ProtectedRoute>
                  } />
                  
                  {/* Caixa - Financeiro+ */}
                  <Route path="/caixa/acerto" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <AcertoEntregador />
                    </ProtectedRoute>
                  } />
                  <Route path="/caixa/dia" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <CaixaDia />
                    </ProtectedRoute>
                  } />
                  <Route path="/caixa/despesas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <Despesas />
                    </ProtectedRoute>
                  } />
                  
                  {/* Operacional - Gestor+ */}
                  <Route path="/operacional/cockpit" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <CockpitGestor />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/indicadores" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <CentralIndicadores />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/centro" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <MapaOperacional />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/alertas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <AlertasInteligentes />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/concorrencia" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <AnaliseConcorrencia />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/ia" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <ConselhosIA />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/executivo" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <DashboardExecutivo />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/avancado" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <DashboardAvancado />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/trabalhista" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <DashboardTrabalhista />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/logistico" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <DashboardLogistico />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/dre" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <DRE />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/metas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <MetasDesafios />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/mapa" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <MapaEntregadores />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/anual" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <PlanejamentoAnual />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/mensal" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <PlanejamentoMensal />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/canais-venda" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <CanaisVenda />
                    </ProtectedRoute>
                  } />
                  
                  {/* Clientes - Operacional+ */}
                  <Route path="/clientes/cadastro" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <CadastroClientes />
                    </ProtectedRoute>
                  } />
                  <Route path="/clientes/campanhas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Campanhas />
                    </ProtectedRoute>
                  } />
                  <Route path="/clientes/fidelidade" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Fidelidade />
                    </ProtectedRoute>
                  } />
                  <Route path="/clientes/crm" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <CRM />
                    </ProtectedRoute>
                  } />
                  <Route path="/clientes/ranking" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <RankingClientes />
                    </ProtectedRoute>
                  } />
                  
                  {/* Estoque - Operacional+ */}
                  <Route path="/estoque" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <Estoque />
                    </ProtectedRoute>
                  } />
                  <Route path="/estoque/compras" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <Compras />
                    </ProtectedRoute>
                  } />
                  <Route path="/estoque/comodatos" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <Comodatos />
                    </ProtectedRoute>
                  } />
                  <Route path="/estoque/rota" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional", "entregador"]}>
                      <EstoqueRota />
                    </ProtectedRoute>
                  } />
                  <Route path="/estoque/mcmm" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <MCMM />
                    </ProtectedRoute>
                  } />
                  
                   {/* Cadastros - Gestor+ */}
                  <Route path="/cadastros/entregadores" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Entregadores />
                    </ProtectedRoute>
                  } />
                  <Route path="/cadastros/fornecedores" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Fornecedores />
                    </ProtectedRoute>
                  } />
                  <Route path="/cadastros/veiculos" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Veiculos />
                    </ProtectedRoute>
                  } />
                  <Route path="/cadastros/funcionarios" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Funcionarios />
                    </ProtectedRoute>
                  } />
                  <Route path="/cadastros/produtos" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <Produtos />
                    </ProtectedRoute>
                  } />
                  
                  {/* Financeiro */}
                  <Route path="/financeiro/fluxo" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <FluxoCaixa />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/previsao" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <PrevisaoCaixa />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/pagar" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <ContasPagar />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/receber" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <ContasReceber />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/aprovar" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <AprovarDespesas />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/conciliacao" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <Conciliacao />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/contador" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <Contador />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/vale-gas/parceiros" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <ValeGasParceiros />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/vale-gas/emissao" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <ValeGasEmissao />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/vale-gas/controle" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <ValeGasControle />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/vale-gas/acerto" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <ValeGasAcerto />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/vale-gas/relatorio" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <ValeGasRelatorio />
                    </ProtectedRoute>
                  } />
                  
                  {/* Frota */}
                  <Route path="/frota/combustivel" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <Combustivel />
                    </ProtectedRoute>
                  } />
                  <Route path="/frota/manutencao" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Manutencao />
                    </ProtectedRoute>
                  } />
                  <Route path="/frota/relatorios" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <RelatoriosFrota />
                    </ProtectedRoute>
                  } />
                  <Route path="/frota/gamificacao" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Gamificacao />
                    </ProtectedRoute>
                  } />
                  
                  {/* RH */}
                  <Route path="/rh/folha" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <FolhaPagamento />
                    </ProtectedRoute>
                  } />
                  <Route path="/rh/vale" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <ValeFuncionario />
                    </ProtectedRoute>
                  } />
                  <Route path="/rh/comissao" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <ComissaoEntregador />
                    </ProtectedRoute>
                  } />
                  <Route path="/rh/premiacao" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Premiacao />
                    </ProtectedRoute>
                  } />
                  <Route path="/rh/bonus" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Bonus />
                    </ProtectedRoute>
                  } />
                  <Route path="/rh/jornada" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <AlertaJornada />
                    </ProtectedRoute>
                  } />
                  <Route path="/rh/banco-horas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <BancoHoras />
                    </ProtectedRoute>
                  } />
                  <Route path="/rh/horarios" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Horarios />
                    </ProtectedRoute>
                  } />
                  <Route path="/rh/prevencao-ia" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <PrevencaoTrabalhistaIA />
                    </ProtectedRoute>
                  } />
                  <Route path="/rh/produtividade-ia" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <ProdutividadeIA />
                    </ProtectedRoute>
                  } />
                  
                  {/* Configurações - Admin */}
                  <Route path="/config/auditoria" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Auditoria />
                    </ProtectedRoute>
                  } />
                  <Route path="/config/permissoes" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Permissoes />
                    </ProtectedRoute>
                  } />
                  <Route path="/config/unidades" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <UnidadesConfig />
                    </ProtectedRoute>
                  } />
                  <Route path="/config/usuarios" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Usuarios />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracoes" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Configuracoes />
                    </ProtectedRoute>
                  } />
                  
                  {/* Gestão de Rotas e Escalas - Admin */}
                  <Route path="/operacional/rotas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <GestaoRotas />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/escalas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <GestaoEscalas />
                    </ProtectedRoute>
                  } />
                  
                  {/* App Entregador */}
                  <Route path="/entregador" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/entregador/jornada" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorIniciarJornada />
                    </ProtectedRoute>
                  } />
                  <Route path="/entregador/entregas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorEntregas />
                    </ProtectedRoute>
                  } />
                  <Route path="/entregador/entregas/:id/finalizar" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <FinalizarEntrega />
                    </ProtectedRoute>
                  } />
                  <Route path="/entregador/nova-venda" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorNovaVenda />
                    </ProtectedRoute>
                  } />
                  <Route path="/entregador/despesas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorDespesas />
                    </ProtectedRoute>
                  } />
                  <Route path="/entregador/historico" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorHistorico />
                    </ProtectedRoute>
                  } />
                  <Route path="/entregador/perfil" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorPerfil />
                    </ProtectedRoute>
                  } />
                  <Route path="/entregador/configuracoes" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorConfiguracoes />
                    </ProtectedRoute>
                  } />
                  
                  {/* Portal Parceiro */}
                  <Route path="/parceiro" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "parceiro"]}>
                      <ParceiroDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/parceiro/vender" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "parceiro"]}>
                      <ParceiroVenderVale />
                    </ProtectedRoute>
                  } />
                  <Route path="/parceiro/vales" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "parceiro"]}>
                      <ParceiroVales />
                    </ProtectedRoute>
                  } />
                  <Route path="/parceiro/qrcode" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "parceiro"]}>
                      <ParceiroQRCode />
                    </ProtectedRoute>
                  } />
                  
                  {/* Página pública - Vale Gás via QR Code */}
                  <Route path="/vale-gas/comprar/:parceiroId" element={<ComprarValeGas />} />
                  
                  {/* App Cliente - Público (sem autenticação) */}
                  <Route path="/cliente" element={<ClienteHome />} />
                  <Route path="/cliente/cadastro" element={<ClienteCadastro />} />
                  <Route path="/cliente/carrinho" element={<ClienteCarrinho />} />
                  <Route path="/cliente/checkout" element={<ClienteCheckout />} />
                  <Route path="/cliente/indicacao" element={<ClienteIndicacao />} />
                  <Route path="/cliente/carteira" element={<ClienteCarteira />} />
                  <Route path="/cliente/vale-gas" element={<ClienteValeGas />} />
                  <Route path="/cliente/historico" element={<ClienteHistorico />} />
                  <Route path="/cliente/dicas" element={<ClienteDicas />} />
                  <Route path="/cliente/consumo" element={<ClienteConsumo />} />
                  <Route path="/cliente/perfil" element={<ClientePerfil />} />
                  <Route path="/cliente/rastreamento/:orderId" element={<ClienteRastreamento />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </ErrorBoundary>
              </ValeGasProvider>
            </ClienteProvider>
          </DeliveryNotificationProvider>
        </UnidadeProvider>
      </AuthProvider>
    </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
