import { lazy, Suspense } from "react";
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
import { PageLoader } from "@/components/ui/page-loader";

// Eager load: Auth + Dashboard (critical path)
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";

// Lazy load everything else
const Vendas = lazy(() => import("./pages/Vendas"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Vendas
const NovaVenda = lazy(() => import("./pages/vendas/NovaVenda"));
const Pedidos = lazy(() => import("./pages/vendas/Pedidos"));
const EditarPedido = lazy(() => import("./pages/vendas/EditarPedido"));
const PDV = lazy(() => import("./pages/vendas/PDV"));
const RelatorioVendas = lazy(() => import("./pages/vendas/RelatorioVendas"));

// Caixa
const AcertoEntregador = lazy(() => import("./pages/caixa/AcertoEntregador"));
const CaixaDia = lazy(() => import("./pages/caixa/CaixaDia"));
const Despesas = lazy(() => import("./pages/caixa/Despesas"));

// Operacional
const ConselhosIA = lazy(() => import("./pages/operacional/ConselhosIA"));
const CentralIndicadores = lazy(() => import("./pages/operacional/CentralIndicadores"));
const MapaOperacional = lazy(() => import("./pages/operacional/MapaOperacional"));
const CockpitGestor = lazy(() => import("./pages/operacional/CockpitGestor"));
const AlertasInteligentes = lazy(() => import("./pages/operacional/AlertasInteligentes"));
const AnaliseConcorrencia = lazy(() => import("./pages/operacional/AnaliseConcorrencia"));
const DashboardExecutivo = lazy(() => import("./pages/operacional/DashboardExecutivo"));
const DashboardAvancado = lazy(() => import("./pages/operacional/DashboardAvancado"));
const DashboardTrabalhista = lazy(() => import("./pages/operacional/DashboardTrabalhista"));
const DashboardLogistico = lazy(() => import("./pages/operacional/DashboardLogistico"));
const DRE = lazy(() => import("./pages/operacional/DRE"));
const MetasDesafios = lazy(() => import("./pages/operacional/MetasDesafios"));
const MapaEntregadores = lazy(() => import("./pages/operacional/MapaEntregadores"));
const PlanejamentoAnual = lazy(() => import("./pages/operacional/PlanejamentoAnual"));
const PlanejamentoMensal = lazy(() => import("./pages/operacional/PlanejamentoMensal"));
const CanaisVenda = lazy(() => import("./pages/operacional/CanaisVenda"));
const PontoEquilibrio = lazy(() => import("./pages/operacional/PontoEquilibrio"));
const ResultadoOperacional = lazy(() => import("./pages/operacional/ResultadoOperacional"));
const CategoriasDespesa = lazy(() => import("./pages/config/CategoriasDespesa"));

// Clientes
const CadastroClientes = lazy(() => import("./pages/clientes/CadastroClientes"));
const Campanhas = lazy(() => import("./pages/clientes/Campanhas"));
const Fidelidade = lazy(() => import("./pages/clientes/Fidelidade"));
const CRM = lazy(() => import("./pages/clientes/CRM"));
const RankingClientes = lazy(() => import("./pages/clientes/RankingClientes"));

// Estoque
const Estoque = lazy(() => import("./pages/Estoque"));
const Entregas = lazy(() => import("./pages/Entregas"));
const Compras = lazy(() => import("./pages/estoque/Compras"));
const Comodatos = lazy(() => import("./pages/estoque/Comodatos"));
const EstoqueRota = lazy(() => import("./pages/estoque/EstoqueRota"));
const MCMM = lazy(() => import("./pages/estoque/MCMM"));
const TransferenciaEstoque = lazy(() => import("./pages/estoque/TransferenciaEstoque"));

// Cadastros
const Entregadores = lazy(() => import("./pages/cadastros/Entregadores"));
const Fornecedores = lazy(() => import("./pages/cadastros/Fornecedores"));
const Veiculos = lazy(() => import("./pages/cadastros/Veiculos"));
const Funcionarios = lazy(() => import("./pages/cadastros/Funcionarios"));
const Produtos = lazy(() => import("./pages/cadastros/Produtos"));

// Financeiro
const FluxoCaixa = lazy(() => import("./pages/financeiro/FluxoCaixa"));
const PrevisaoCaixa = lazy(() => import("./pages/financeiro/PrevisaoCaixa"));
const ContasPagar = lazy(() => import("./pages/financeiro/ContasPagar"));
const ContasReceber = lazy(() => import("./pages/financeiro/ContasReceber"));
const AprovarDespesas = lazy(() => import("./pages/financeiro/AprovarDespesas"));
const Conciliacao = lazy(() => import("./pages/financeiro/Conciliacao"));
const Contador = lazy(() => import("./pages/financeiro/Contador"));
const TerminaisCartao = lazy(() => import("./pages/financeiro/TerminaisCartao"));
const EmissaoBoleto = lazy(() => import("./pages/financeiro/EmissaoBoleto"));
const CalendarioFinanceiro = lazy(() => import("./pages/financeiro/CalendarioFinanceiro"));
const ValeGasParceiros = lazy(() => import("./pages/financeiro/ValeGasParceiros"));
const ValeGasEmissao = lazy(() => import("./pages/financeiro/ValeGasEmissao"));
const ValeGasControle = lazy(() => import("./pages/financeiro/ValeGasControle"));
const ValeGasAcerto = lazy(() => import("./pages/financeiro/ValeGasAcerto"));
const ValeGasRelatorio = lazy(() => import("./pages/financeiro/ValeGasRelatorio"));

// Frota
const Combustivel = lazy(() => import("./pages/frota/Combustivel"));
const Manutencao = lazy(() => import("./pages/frota/Manutencao"));
const RelatoriosFrota = lazy(() => import("./pages/frota/RelatoriosFrota"));
const Gamificacao = lazy(() => import("./pages/frota/Gamificacao"));

// RH
const FolhaPagamento = lazy(() => import("./pages/rh/FolhaPagamento"));
const ValeFuncionario = lazy(() => import("./pages/rh/ValeFuncionario"));
const ComissaoEntregador = lazy(() => import("./pages/rh/ComissaoEntregador"));
const Premiacao = lazy(() => import("./pages/rh/Premiacao"));
const Bonus = lazy(() => import("./pages/rh/Bonus"));
const AlertaJornada = lazy(() => import("./pages/rh/AlertaJornada"));
const BancoHoras = lazy(() => import("./pages/rh/BancoHoras"));
const Horarios = lazy(() => import("./pages/rh/Horarios"));
const PrevencaoTrabalhistaIA = lazy(() => import("./pages/rh/PrevencaoTrabalhistaIA"));
const ProdutividadeIA = lazy(() => import("./pages/rh/ProdutividadeIA"));
const Ferias = lazy(() => import("./pages/rh/Ferias"));

// Fiscal
const EmitirNFe = lazy(() => import("./pages/fiscal/EmitirNFe"));
const EmitirNFCe = lazy(() => import("./pages/fiscal/EmitirNFCe"));
const EmitirMDFe = lazy(() => import("./pages/fiscal/EmitirMDFe"));
const EmitirCTe = lazy(() => import("./pages/fiscal/EmitirCTe"));
const GerarXML = lazy(() => import("./pages/fiscal/GerarXML"));
const RelatoriosNotas = lazy(() => import("./pages/fiscal/RelatoriosNotas"));

// Configurações
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Auditoria = lazy(() => import("./pages/config/Auditoria"));
const Permissoes = lazy(() => import("./pages/config/Permissoes"));
const UnidadesConfig = lazy(() => import("./pages/config/Unidades"));
const Usuarios = lazy(() => import("./pages/config/Usuarios"));
const DocumentosEmpresa = lazy(() => import("./pages/config/DocumentosEmpresa"));

// Assistente IA
const AssistenteIA = lazy(() => import("./pages/AssistenteIA"));

// App Entregador
const EntregadorDashboard = lazy(() => import("./pages/entregador/EntregadorDashboard"));
const EntregadorEntregas = lazy(() => import("./pages/entregador/EntregadorEntregas"));
const FinalizarEntrega = lazy(() => import("./pages/entregador/FinalizarEntrega"));
const EntregadorNovaVenda = lazy(() => import("./pages/entregador/EntregadorNovaVenda"));
const EntregadorDespesas = lazy(() => import("./pages/entregador/EntregadorDespesas"));
const EntregadorCombustivel = lazy(() => import("./pages/entregador/EntregadorCombustivel"));
const EntregadorPerfil = lazy(() => import("./pages/entregador/EntregadorPerfil"));
const EntregadorHistorico = lazy(() => import("./pages/entregador/EntregadorHistorico"));
const EntregadorIniciarJornada = lazy(() => import("./pages/entregador/EntregadorIniciarJornada"));
const EntregadorConfiguracoes = lazy(() => import("./pages/entregador/EntregadorConfiguracoes"));
const EntregadorEstoque = lazy(() => import("./pages/entregador/EntregadorEstoque"));
const EntregadorTransferencia = lazy(() => import("./pages/entregador/EntregadorTransferencia"));

// Gestão Operacional
const GestaoRotas = lazy(() => import("./pages/operacional/GestaoRotas"));
const GestaoEscalas = lazy(() => import("./pages/operacional/GestaoEscalas"));

// App Parceiro
const ParceiroDashboard = lazy(() => import("./pages/parceiro/ParceiroDashboard"));
const ParceiroVenderVale = lazy(() => import("./pages/parceiro/ParceiroVenderVale"));
const ParceiroVales = lazy(() => import("./pages/parceiro/ParceiroVales"));
const ParceiroQRCode = lazy(() => import("./pages/parceiro/ParceiroQRCode"));

// Página Pública
const ComprarValeGas = lazy(() => import("./pages/publico/ComprarValeGas"));

// App Cliente
const ClienteHome = lazy(() => import("./pages/cliente/ClienteHome"));
const ClienteCadastro = lazy(() => import("./pages/cliente/ClienteCadastro"));
const ClienteCarrinho = lazy(() => import("./pages/cliente/ClienteCarrinho"));
const ClienteCheckout = lazy(() => import("./pages/cliente/ClienteCheckout"));
const ClienteIndicacao = lazy(() => import("./pages/cliente/ClienteIndicacao"));
const ClienteCarteira = lazy(() => import("./pages/cliente/ClienteCarteira"));
const ClienteValeGas = lazy(() => import("./pages/cliente/ClienteValeGas"));
const ClienteHistorico = lazy(() => import("./pages/cliente/ClienteHistorico"));
const ClienteDicas = lazy(() => import("./pages/cliente/ClienteDicas"));
const ClienteConsumo = lazy(() => import("./pages/cliente/ClienteConsumo"));
const ClientePerfil = lazy(() => import("./pages/cliente/ClientePerfil"));
const ClienteRastreamento = lazy(() => import("./pages/cliente/ClienteRastreamento"));

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
                <Suspense fallback={<PageLoader />}>
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
                  <Route path="/estoque/transferencia" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <TransferenciaEstoque />
                    </ProtectedRoute>
                  } />
                  
                  {/* Entregas - Monitoramento */}
                  <Route path="/entregas" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <Entregas />
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
                  <Route path="/financeiro/terminais" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <TerminaisCartao />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/boletos" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <EmissaoBoleto />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro/calendario" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <CalendarioFinanceiro />
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
                  <Route path="/rh/ferias" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <Ferias />
                    </ProtectedRoute>
                  } />
                  
                  {/* Fiscal - Admin/Gestor */}
                  <Route path="/fiscal/nfe" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <EmitirNFe />
                    </ProtectedRoute>
                  } />
                  <Route path="/fiscal/nfce" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <EmitirNFCe />
                    </ProtectedRoute>
                  } />
                  <Route path="/fiscal/mdfe" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <EmitirMDFe />
                    </ProtectedRoute>
                  } />
                  <Route path="/fiscal/cte" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <EmitirCTe />
                    </ProtectedRoute>
                  } />
                  <Route path="/fiscal/xml" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <GerarXML />
                    </ProtectedRoute>
                  } />
                  <Route path="/fiscal/relatorios" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "operacional"]}>
                      <RelatoriosNotas />
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
                  <Route path="/config/documentos" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "financeiro"]}>
                      <DocumentosEmpresa />
                    </ProtectedRoute>
                  } />

                  <Route path="/assistente-ia" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <AssistenteIA />
                    </ProtectedRoute>
                  } />
                  
                  {/* Gestão de Rotas e Escalas */}
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
                  <Route path="/operacional/ponto-equilibrio" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <PontoEquilibrio />
                    </ProtectedRoute>
                  } />
                  <Route path="/operacional/resultado" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <ResultadoOperacional />
                    </ProtectedRoute>
                  } />
                  <Route path="/config/categorias-despesa" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                      <CategoriasDespesa />
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
                  <Route path="/entregador/combustivel" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorCombustivel />
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
                  <Route path="/entregador/estoque" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorEstoque />
                    </ProtectedRoute>
                  } />
                  <Route path="/entregador/transferencia" element={
                    <ProtectedRoute allowedRoles={["admin", "gestor", "entregador"]}>
                      <EntregadorTransferencia />
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
                </Suspense>
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
