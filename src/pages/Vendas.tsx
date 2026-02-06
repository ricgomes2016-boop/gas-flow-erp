import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Store, 
  Plus, 
  List,
  Clock,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_preparo: { label: "Em Preparo", variant: "outline" },
  em_rota: { label: "Em Rota", variant: "outline" },
  entregue: { label: "Entregue", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

export default function Vendas() {
  const navigate = useNavigate();
  const today = new Date();

  // Buscar pedidos de hoje
  const { data: pedidosHoje = [], isLoading } = useQuery({
    queryKey: ["pedidos-hoje"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          *,
          clientes (nome),
          pedido_itens (
            quantidade,
            preco_unitario,
            produtos (nome)
          )
        `)
        .gte("created_at", startOfDay(today).toISOString())
        .lte("created_at", endOfDay(today).toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Calcular métricas
  const totalVendasHoje = pedidosHoje
    .filter((p) => p.status !== "cancelado")
    .reduce((acc, p) => acc + (p.valor_total || 0), 0);

  const totalPedidosHoje = pedidosHoje.length;
  
  const pedidosPagos = pedidosHoje.filter((p) => p.status === "entregue").length;
  
  const pedidosPendentes = pedidosHoje.filter(
    (p) => p.status === "pendente" || p.status === "em_preparo" || p.status === "em_rota"
  ).length;

  const ticketMedio = totalPedidosHoje > 0 ? totalVendasHoje / totalPedidosHoje : 0;

  // Últimos 5 pedidos
  const ultimosPedidos = pedidosHoje.slice(0, 5);

  return (
    <MainLayout>
      <Header title="Vendas" subtitle="Visão geral das vendas do dia" />
      <div className="p-6 space-y-6">
        {/* Cards de métricas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas Hoje</p>
                <p className="text-2xl font-bold">
                  R$ {totalVendasHoje.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-info/10 p-3">
                <ShoppingCart className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Hoje</p>
                <p className="text-2xl font-bold">{totalPedidosHoje}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-success/10 p-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  R$ {ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-warning/10 p-3">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pedidosPendentes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações rápidas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button 
            size="lg" 
            className="h-16 gap-3 text-lg"
            onClick={() => navigate("/vendas/pdv")}
          >
            <Store className="h-6 w-6" />
            Abrir PDV - Portaria
          </Button>
          
          <Button 
            size="lg" 
            variant="secondary"
            className="h-16 gap-3 text-lg"
            onClick={() => navigate("/vendas/nova")}
          >
            <Plus className="h-6 w-6" />
            Nova Venda Entrega
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="h-16 gap-3 text-lg"
            onClick={() => navigate("/vendas/pedidos")}
          >
            <List className="h-6 w-6" />
            Ver Todos os Pedidos
          </Button>
        </div>

        {/* Últimos pedidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Últimos Pedidos de Hoje
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/vendas/pedidos")}>
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : ultimosPedidos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum pedido registrado hoje
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ultimosPedidos.map((pedido) => (
                    <TableRow 
                      key={pedido.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate("/vendas/pedidos")}
                    >
                      <TableCell className="font-medium">
                        {format(new Date(pedido.created_at), "HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {pedido.clientes?.nome || "Cliente não identificado"}
                      </TableCell>
                      <TableCell>
                        {pedido.pedido_itens?.length || 0} item(s)
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {(pedido.valor_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pedido.forma_pagamento || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[pedido.status || "pendente"]?.variant || "secondary"}>
                          {statusConfig[pedido.status || "pendente"]?.label || pedido.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
