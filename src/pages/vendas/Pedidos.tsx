import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Truck, CheckCircle, Clock, XCircle, Sparkles, User, RefreshCw } from "lucide-react";
import { SugestaoEntregador } from "@/components/sugestao/SugestaoEntregador";
import { useToast } from "@/hooks/use-toast";
import { PedidoViewDialog } from "@/components/pedidos/PedidoViewDialog";
import { StatusDropdown } from "@/components/pedidos/StatusDropdown";
import { usePedidos } from "@/hooks/usePedidos";
import { PedidoFormatado, PedidoStatus } from "@/types/pedido";

export default function Pedidos() {
  const navigate = useNavigate();
  const { pedidos, isLoading, atualizarStatus, atribuirEntregador, isUpdating } = usePedidos();
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoFormatado | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [viewDialogAberto, setViewDialogAberto] = useState(false);
  const [pedidoView, setPedidoView] = useState<PedidoFormatado | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const { toast } = useToast();

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
    toast({
      title: "Pedido cancelado",
      description: "O pedido foi cancelado.",
      variant: "destructive",
    });
  };

  const abrirVisualizacao = (pedido: PedidoFormatado) => {
    setPedidoView(pedido);
    setViewDialogAberto(true);
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
      p.id.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const pedidosPendentes = pedidos.filter((p) => p.status === "pendente" && !p.entregador);

  // Contadores
  const contadores = {
    pendente: pedidos.filter((p) => p.status === "pendente").length,
    em_rota: pedidos.filter((p) => p.status === "em_rota").length,
    entregue: pedidos.filter((p) => p.status === "entregue").length,
    total: pedidos.filter((p) => p.status !== "cancelado").reduce((acc, p) => acc + p.valor, 0),
  };

  // ID curto para exibição
  const getIdCurto = (id: string) => id.substring(0, 8).toUpperCase();

  return (
    <MainLayout>
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
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Buscar por cliente, endereço, ID..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
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
              <Button variant="outline" onClick={() => setBusca("")}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
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
                <div className="p-3 rounded-lg bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
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
                <div className="p-3 rounded-lg bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
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
            <CardTitle>Pedidos</CardTitle>
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
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosFiltrados.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>
                        <Button
                          variant="link"
                          className="font-medium p-0 h-auto text-primary"
                          onClick={() => editarPedido(pedido.id)}
                        >
                          #{getIdCurto(pedido.id)}
                        </Button>
                      </TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{pedido.endereco}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{pedido.produtos}</TableCell>
                      <TableCell>
                        {pedido.entregador ? (
                          <Badge variant="outline">{pedido.entregador}</Badge>
                        ) : pedido.status === "pendente" ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-primary"
                                onClick={() => setPedidoSelecionado(pedido)}
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Sugerir
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Sugerir Entregador</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="p-4 bg-muted rounded-lg">
                                  <p className="font-medium">{pedido.cliente}</p>
                                  <p className="text-sm text-muted-foreground">{pedido.endereco}</p>
                                </div>
                                <SugestaoEntregador
                                  endereco={pedido.endereco}
                                  onSelecionar={(id, nome) =>
                                    handleAtribuirEntregador(pedido.id, String(id), nome)
                                  }
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>R$ {pedido.valor.toFixed(2)}</TableCell>
                      <TableCell>
                        <StatusDropdown
                          status={pedido.status}
                          onStatusChange={(novoStatus) => alterarStatusPedido(pedido.id, novoStatus)}
                          disabled={isUpdating}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{pedido.data}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => abrirVisualizacao(pedido)}>
                          <Eye className="h-4 w-4" />
                        </Button>
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
      </div>
    </MainLayout>
  );
}
