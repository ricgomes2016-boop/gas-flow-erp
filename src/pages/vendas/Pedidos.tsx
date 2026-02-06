import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Search, Eye, Truck, CheckCircle, Clock, XCircle, Sparkles, User } from "lucide-react";
import { SugestaoEntregador } from "@/components/sugestao/SugestaoEntregador";
import { useToast } from "@/hooks/use-toast";

interface Pedido {
  id: string;
  cliente: string;
  endereco: string;
  produtos: string;
  valor: number;
  status: "pendente" | "em_rota" | "entregue" | "cancelado";
  data: string;
  entregador?: string;
}

const pedidosIniciais: Pedido[] = [
  {
    id: "001",
    cliente: "João Silva",
    endereco: "Rua das Flores, 123",
    produtos: "2x Gás P13",
    valor: 220.0,
    status: "pendente",
    data: "06/02/2026 10:30",
  },
  {
    id: "002",
    cliente: "Maria Santos",
    endereco: "Av. Brasil, 456",
    produtos: "1x Gás P20",
    valor: 180.0,
    status: "em_rota",
    data: "06/02/2026 10:15",
    entregador: "Carlos Souza",
  },
  {
    id: "003",
    cliente: "Pedro Costa",
    endereco: "Rua do Comércio, 789",
    produtos: "1x Gás P13, 1x Água 20L",
    valor: 125.0,
    status: "entregue",
    data: "06/02/2026 09:45",
    entregador: "Roberto Lima",
  },
  {
    id: "004",
    cliente: "Ana Oliveira",
    endereco: "Rua Nova, 321",
    produtos: "3x Gás P13",
    valor: 330.0,
    status: "cancelado",
    data: "06/02/2026 09:00",
  },
];

const statusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const, icon: Clock },
  em_rota: { label: "Em Rota", variant: "default" as const, icon: Truck },
  entregue: { label: "Entregue", variant: "outline" as const, icon: CheckCircle },
  cancelado: { label: "Cancelado", variant: "destructive" as const, icon: XCircle },
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const { toast } = useToast();

  const atribuirEntregador = (pedidoId: string, entregadorId: number, entregadorNome: string) => {
    setPedidos(prev => 
      prev.map(p => 
        p.id === pedidoId 
          ? { ...p, entregador: entregadorNome } 
          : p
      )
    );
    toast({
      title: "Entregador atribuído!",
      description: `${entregadorNome} foi atribuído ao pedido #${pedidoId}`,
    });
    setDialogAberto(false);
  };

  const pedidosPendentes = pedidos.filter(p => p.status === "pendente" && !p.entregador);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground">Gerenciar pedidos de venda</p>
          </div>
          <Button>Nova Venda</Button>
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
                  <Dialog key={pedido.id} open={dialogAberto && pedidoSelecionado?.id === pedido.id} onOpenChange={(open) => {
                    setDialogAberto(open);
                    if (!open) setPedidoSelecionado(null);
                  }}>
                    <DialogTrigger asChild>
                      <div 
                        className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setPedidoSelecionado(pedido)}
                      >
                        <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-warning" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{pedido.cliente}</p>
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
                        <DialogTitle>Sugerir Entregador - Pedido #{pedido.id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="font-medium">{pedido.cliente}</p>
                          <p className="text-sm text-muted-foreground">{pedido.endereco}</p>
                          <p className="text-sm mt-2">{pedido.produtos}</p>
                        </div>
                        <SugestaoEntregador
                          endereco={pedido.endereco}
                          onSelecionar={(id, nome) => atribuirEntregador(pedido.id, id, nome)}
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
                <Input placeholder="Buscar por cliente, endereço..." />
              </div>
              <Select defaultValue="todos">
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
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pedidos.filter(p => p.status === "pendente").length}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Truck className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pedidos.filter(p => p.status === "em_rota").length}</p>
                  <p className="text-sm text-muted-foreground">Em Rota</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pedidos.filter(p => p.status === "entregue").length}</p>
                  <p className="text-sm text-muted-foreground">Entregues Hoje</p>
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
                  <p className="text-2xl font-bold">R$ {pedidos.filter(p => p.status !== "cancelado").reduce((acc, p) => acc + p.valor, 0).toLocaleString("pt-BR")}</p>
                  <p className="text-sm text-muted-foreground">Vendas Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos do Dia</CardTitle>
          </CardHeader>
          <CardContent>
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
                {pedidos.map((pedido) => {
                  const config = statusConfig[pedido.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={pedido.id}>
                      <TableCell className="font-medium">#{pedido.id}</TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {pedido.endereco}
                      </TableCell>
                      <TableCell>{pedido.produtos}</TableCell>
                      <TableCell>
                        {pedido.entregador ? (
                          <Badge variant="outline">{pedido.entregador}</Badge>
                        ) : pedido.status === "pendente" ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-primary" onClick={() => setPedidoSelecionado(pedido)}>
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
                                  onSelecionar={(id, nome) => atribuirEntregador(pedido.id, id, nome)}
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
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {pedido.data}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
