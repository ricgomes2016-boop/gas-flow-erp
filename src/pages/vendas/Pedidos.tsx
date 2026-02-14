import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search, Eye, Truck, CheckCircle, Clock, XCircle, Sparkles,
  User, RefreshCw, MoreHorizontal, Edit, ArrowRightLeft, Printer,
  Share2, DollarSign, Trash2, Lock,
} from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { SugestaoEntregador } from "@/components/sugestao/SugestaoEntregador";
import { useToast } from "@/hooks/use-toast";
import { PedidoViewDialog } from "@/components/pedidos/PedidoViewDialog";
import { StatusDropdown } from "@/components/pedidos/StatusDropdown";
import { usePedidos } from "@/hooks/usePedidos";
import { PedidoFormatado, PedidoStatus } from "@/types/pedido";
import { supabase } from "@/integrations/supabase/client";

interface Entregador {
  id: string;
  nome: string;
  status: string | null;
}

export default function Pedidos() {
  const navigate = useNavigate();
  const hoje = new Date().toISOString().split("T")[0];
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const { pedidos, isLoading, atualizarStatus, atribuirEntregador, excluirPedido, isUpdating, isDeleting } = usePedidos({ dataInicio, dataFim });
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoFormatado | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [viewDialogAberto, setViewDialogAberto] = useState(false);
  const [pedidoView, setPedidoView] = useState<PedidoFormatado | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const { toast } = useToast();

  // Transferir entregador
  const [transferDialogAberto, setTransferDialogAberto] = useState(false);
  const [pedidoTransferir, setPedidoTransferir] = useState<PedidoFormatado | null>(null);
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [loadingEntregadores, setLoadingEntregadores] = useState(false);

  // Delete with password
  const [deleteDialogAberto, setDeleteDialogAberto] = useState(false);
  const [pedidoExcluir, setPedidoExcluir] = useState<PedidoFormatado | null>(null);
  const [senhaExclusao, setSenhaExclusao] = useState("");
  const [senhaErro, setSenhaErro] = useState("");

  useEffect(() => {
    const fetchEntregadores = async () => {
      setLoadingEntregadores(true);
      const { data } = await supabase
        .from("entregadores")
        .select("id, nome, status")
        .eq("ativo", true)
        .order("nome");
      if (data) setEntregadores(data);
      setLoadingEntregadores(false);
    };
    fetchEntregadores();
  }, []);

  const handleAtribuirEntregador = (pedidoId: string, entregadorId: string, entregadorNome: string) => {
    atribuirEntregador(
      { pedidoId, entregadorId },
      {
        onSuccess: () => {
          toast({
            title: "Entregador atribuído!",
            description: `${entregadorNome} foi atribuído ao pedido.`,
          });
          setDialogAberto(false);
          setTransferDialogAberto(false);
        },
        onError: (error) => {
          toast({
            title: "Erro ao atribuir entregador",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const alterarStatusPedido = (pedidoId: string, novoStatus: PedidoStatus) => {
    const statusLabels = {
      pendente: "Pendente",
      em_rota: "Em Rota",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };

    atualizarStatus(
      { pedidoId, novoStatus },
      {
        onSuccess: () => {
          toast({
            title: "Status atualizado",
            description: `Pedido alterado para ${statusLabels[novoStatus]}.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Erro ao atualizar status",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const cancelarPedido = (pedidoId: string) => {
    alterarStatusPedido(pedidoId, "cancelado");
  };

  const abrirVisualizacao = (pedido: PedidoFormatado) => {
    setPedidoView(pedido);
    setViewDialogAberto(true);
  };

  const abrirExclusao = (pedido: PedidoFormatado) => {
    setPedidoExcluir(pedido);
    setSenhaExclusao("");
    setSenhaErro("");
    setDeleteDialogAberto(true);
  };

  const confirmarExclusao = async () => {
    if (!pedidoExcluir) return;
    
    // Validate password via Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: senhaExclusao,
    });

    if (authError) {
      setSenhaErro("Senha incorreta. Tente novamente.");
      return;
    }

    excluirPedido(
      { pedidoId: pedidoExcluir.id },
      {
        onSuccess: () => {
          toast({ title: "Pedido excluído", description: `Pedido #${getIdCurto(pedidoExcluir.id)} foi excluído permanentemente.` });
          setDeleteDialogAberto(false);
          setPedidoExcluir(null);
        },
        onError: (error: any) => {
          toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  const abrirTransferencia = (pedido: PedidoFormatado) => {
    setPedidoTransferir(pedido);
    setTransferDialogAberto(true);
  };

  const editarPedido = (pedidoId: string) => {
    navigate(`/vendas/pedidos/${pedidoId}/editar`);
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    const matchBusca =
      busca === "" ||
      p.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      p.endereco.toLowerCase().includes(busca.toLowerCase()) ||
      p.id.toLowerCase().includes(busca.toLowerCase()) ||
      (p.entregador && p.entregador.toLowerCase().includes(busca.toLowerCase()));
    return matchStatus && matchBusca;
  });

  const pedidosPendentes = pedidos.filter((p) => p.status === "pendente" && !p.entregador);

  // Contadores
  const contadores = {
    pendente: pedidos.filter((p) => p.status === "pendente").length,
    em_rota: pedidos.filter((p) => p.status === "em_rota").length,
    entregue: pedidos.filter((p) => p.status === "entregue").length,
    cancelado: pedidos.filter((p) => p.status === "cancelado").length,
    total: pedidos.filter((p) => p.status !== "cancelado").reduce((acc, p) => acc + p.valor, 0),
  };

  // ID curto para exibição
  const getIdCurto = (id: string) => id.substring(0, 8).toUpperCase();

  const getStatusBadgeEntregador = (status: string | null) => {
    switch (status) {
      case "disponivel":
        return <Badge variant="default" className="text-[10px] ml-2">Disponível</Badge>;
      case "em_rota":
        return <Badge variant="secondary" className="text-[10px] ml-2">Em Rota</Badge>;
      case "indisponivel":
        return <Badge variant="destructive" className="text-[10px] ml-2">Indisponível</Badge>;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <Header title="Pedidos" subtitle="Gerenciar pedidos de venda" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground">Gerenciar pedidos de venda</p>
          </div>
          <Button onClick={() => navigate("/vendas/nova")}>Nova Venda</Button>
        </div>

        {/* Sugestão IA para pedidos pendentes */}
        {pedidosPendentes.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Sugestão Inteligente</p>
                  <p className="text-sm text-muted-foreground">
                    {pedidosPendentes.length} pedido(s) pendente(s) sem entregador atribuído
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {pedidosPendentes.slice(0, 3).map((pedido) => (
                  <Dialog
                    key={pedido.id}
                    open={dialogAberto && pedidoSelecionado?.id === pedido.id}
                    onOpenChange={(open) => {
                      setDialogAberto(open);
                      if (!open) setPedidoSelecionado(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <div
                        className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setPedidoSelecionado(pedido)}
                      >
                        <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-warning" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{pedido.cliente}</p>
                          <p className="text-xs text-muted-foreground truncate">{pedido.endereco}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Sparkles className="h-3 w-3 mr-1" />
                          IA
                        </Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sugerir Entregador - Pedido #{getIdCurto(pedido.id)}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="font-medium">{pedido.cliente}</p>
                          <p className="text-sm text-muted-foreground">{pedido.endereco}</p>
                          <p className="text-sm mt-2">{pedido.produtos}</p>
                        </div>
                        <SugestaoEntregador
                          endereco={pedido.endereco}
                          onSelecionar={(id, nome) => handleAtribuirEntregador(pedido.id, String(id), nome)}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Buscar por cliente, endereço, entregador, ID..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-center">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Data Início</label>
                  <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-[150px]" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Data Fim</label>
                  <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-[150px]" />
                </div>
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_rota">Em Rota</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => { setBusca(""); setDataInicio(hoje); setDataFim(hoje); setFiltroStatus("todos"); }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contadores.pendente}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contadores.em_rota}</p>
                  <p className="text-sm text-muted-foreground">Em Rota</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contadores.entregue}</p>
                  <p className="text-sm text-muted-foreground">Entregues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contadores.cancelado}</p>
                  <p className="text-sm text-muted-foreground">Cancelados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    R$ {contadores.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Vendas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pedidos ({pedidosFiltrados.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum pedido encontrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead>Entregador</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead className="w-16">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosFiltrados.map((pedido) => (
                    <TableRow key={pedido.id} className={pedido.status === "cancelado" ? "opacity-60" : ""}>
                      <TableCell>
                        <Button
                          variant="link"
                          className="font-medium p-0 h-auto text-primary"
                          onClick={() => editarPedido(pedido.id)}
                        >
                          #{getIdCurto(pedido.id)}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{pedido.cliente}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">{pedido.endereco}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{pedido.produtos}</TableCell>
                      <TableCell>
                        {pedido.entregador ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => abrirTransferencia(pedido)}>
                              <Truck className="h-3 w-3 mr-1" />
                              {pedido.entregador}
                            </Badge>
                          </div>
                        ) : pedido.status !== "cancelado" && pedido.status !== "entregue" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary h-7 px-2"
                            onClick={() => abrirTransferencia(pedido)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Atribuir
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">R$ {pedido.valor.toFixed(2)}</TableCell>
                      <TableCell>
                        <StatusDropdown
                          status={pedido.status}
                          onStatusChange={(novoStatus) => alterarStatusPedido(pedido.id, novoStatus)}
                          disabled={isUpdating}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{pedido.data}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => abrirVisualizacao(pedido)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            {pedido.status !== "cancelado" && pedido.status !== "entregue" && (
                              <DropdownMenuItem onClick={() => editarPedido(pedido.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {pedido.status !== "cancelado" && pedido.status !== "entregue" && (
                              <DropdownMenuItem onClick={() => abrirTransferencia(pedido)}>
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                {pedido.entregador ? "Transferir Entregador" : "Atribuir Entregador"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {pedido.status !== "cancelado" && pedido.status !== "entregue" && (
                              <>
                                {pedido.status !== "em_rota" && (
                                  <DropdownMenuItem onClick={() => alterarStatusPedido(pedido.id, "em_rota")}>
                                    <Truck className="h-4 w-4 mr-2" />
                                    Marcar Em Rota
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => alterarStatusPedido(pedido.id, "entregue")}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar Entregue
                                </DropdownMenuItem>
                                {pedido.status !== "pendente" && (
                                  <DropdownMenuItem onClick={() => alterarStatusPedido(pedido.id, "pendente")}>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Voltar p/ Pendente
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => cancelarPedido(pedido.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancelar Pedido
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => abrirExclusao(pedido)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Pedido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <PedidoViewDialog
          pedido={pedidoView}
          open={viewDialogAberto}
          onOpenChange={setViewDialogAberto}
          onCancelar={cancelarPedido}
        />

        {/* Dialog de Transferência/Atribuição de Entregador */}
        <Dialog open={transferDialogAberto} onOpenChange={setTransferDialogAberto}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                {pedidoTransferir?.entregador ? "Transferir Entregador" : "Atribuir Entregador"}
              </DialogTitle>
            </DialogHeader>
            {pedidoTransferir && (
              <div className="space-y-4 mt-2">
                <div className="p-4 bg-muted rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">Pedido #{getIdCurto(pedidoTransferir.id)}</p>
                    <Badge variant="outline">R$ {pedidoTransferir.valor.toFixed(2)}</Badge>
                  </div>
                  <p className="text-sm">{pedidoTransferir.cliente}</p>
                  <p className="text-xs text-muted-foreground">{pedidoTransferir.endereco}</p>
                  {pedidoTransferir.entregador && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Entregador atual: <span className="font-medium text-foreground">{pedidoTransferir.entregador}</span>
                    </p>
                  )}
                </div>

                {/* Sugestão IA */}
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Sparkles className="h-3 w-3" />
                    Sugestão inteligente
                  </div>
                  <SugestaoEntregador
                    endereco={pedidoTransferir.endereco}
                    onSelecionar={(id, nome) => handleAtribuirEntregador(pedidoTransferir.id, String(id), nome)}
                    compact
                  />
                </div>

                {/* Seleção manual */}
                <div>
                  <p className="text-sm font-medium mb-2">Ou selecione manualmente:</p>
                  <Select
                    onValueChange={(entregadorId) => {
                      const ent = entregadores.find((e) => e.id === entregadorId);
                      if (ent) handleAtribuirEntregador(pedidoTransferir.id, ent.id, ent.nome);
                    }}
                    disabled={loadingEntregadores}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingEntregadores ? "Carregando..." : "Selecione o entregador"} />
                    </SelectTrigger>
                    <SelectContent>
                      {entregadores
                        .filter((e) => e.id !== pedidoTransferir.entregador_id)
                        .map((ent) => (
                          <SelectItem key={ent.id} value={ent.id}>
                            <div className="flex items-center">
                              <span>{ent.nome}</span>
                              {getStatusBadgeEntregador(ent.status)}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Exclusão com Senha */}
        <AlertDialog open={deleteDialogAberto} onOpenChange={setDeleteDialogAberto}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-destructive" />
                Excluir Pedido
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é irreversível. O pedido{" "}
                <span className="font-bold">#{pedidoExcluir ? getIdCurto(pedidoExcluir.id) : ""}</span>{" "}
                será excluído permanentemente. Digite sua senha para confirmar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3 py-2">
              {pedidoExcluir && (
                <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                  <p><span className="font-medium">Cliente:</span> {pedidoExcluir.cliente}</p>
                  <p><span className="font-medium">Valor:</span> R$ {pedidoExcluir.valor.toFixed(2)}</p>
                  <p><span className="font-medium">Data:</span> {pedidoExcluir.data}</p>
                </div>
              )}
              <div>
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senhaExclusao}
                  onChange={(e) => { setSenhaExclusao(e.target.value); setSenhaErro(""); }}
                  onKeyDown={(e) => e.key === "Enter" && confirmarExclusao()}
                />
                {senhaErro && (
                  <p className="text-sm text-destructive mt-1">{senhaErro}</p>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={confirmarExclusao}
                disabled={!senhaExclusao || isDeleting}
              >
                {isDeleting ? "Excluindo..." : "Excluir Permanentemente"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
