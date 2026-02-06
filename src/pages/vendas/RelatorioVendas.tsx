import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  FileSpreadsheet,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_preparo: { label: "Em Preparo", variant: "outline" },
  em_rota: { label: "Em Rota", variant: "outline" },
  entregue: { label: "Entregue", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

interface PedidoRelatorio {
  id: string;
  created_at: string;
  valor_total: number | null;
  status: string | null;
  forma_pagamento: string | null;
  canal_venda: string | null;
  clientes: { nome: string } | null;
  entregadores: { nome: string } | null;
  pedido_itens: Array<{
    quantidade: number;
    preco_unitario: number;
    produtos: { nome: string } | null;
  }>;
}

export default function RelatorioVendas() {
  const { toast } = useToast();
  const hoje = new Date();
  
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(hoje), "yyyy-MM-dd"));
  const [dataFim, setDataFim] = useState(format(endOfMonth(hoje), "yyyy-MM-dd"));
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [canalFiltro, setCanalFiltro] = useState<string>("todos");

  // Buscar pedidos
  const { data: pedidos = [], isLoading, refetch } = useQuery({
    queryKey: ["relatorio-vendas", dataInicio, dataFim],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          id,
          created_at,
          valor_total,
          status,
          forma_pagamento,
          canal_venda,
          clientes (nome),
          entregadores (nome),
          pedido_itens (
            quantidade,
            preco_unitario,
            produtos (nome)
          )
        `)
        .gte("created_at", `${dataInicio}T00:00:00`)
        .lte("created_at", `${dataFim}T23:59:59`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as PedidoRelatorio[];
    },
  });

  // Aplicar filtros locais
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (statusFiltro !== "todos" && p.status !== statusFiltro) return false;
      if (canalFiltro !== "todos" && p.canal_venda !== canalFiltro) return false;
      return true;
    });
  }, [pedidos, statusFiltro, canalFiltro]);

  // Calcular métricas
  const metricas = useMemo(() => {
    const vendas = pedidosFiltrados.filter((p) => p.status !== "cancelado");
    const totalVendas = vendas.reduce((acc, p) => acc + (p.valor_total || 0), 0);
    const totalPedidos = pedidosFiltrados.length;
    const pedidosEntregues = pedidosFiltrados.filter((p) => p.status === "entregue").length;
    const pedidosCancelados = pedidosFiltrados.filter((p) => p.status === "cancelado").length;
    const ticketMedio = vendas.length > 0 ? totalVendas / vendas.length : 0;

    return { totalVendas, totalPedidos, pedidosEntregues, pedidosCancelados, ticketMedio };
  }, [pedidosFiltrados]);

  // Exportar para Excel
  const exportarExcel = () => {
    if (pedidosFiltrados.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Aplique filtros diferentes ou verifique o período.",
        variant: "destructive",
      });
      return;
    }

    // Preparar dados para exportação
    const dadosExport = pedidosFiltrados.map((p) => ({
      "Data/Hora": format(parseISO(p.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      "Pedido": p.id.slice(0, 8).toUpperCase(),
      "Cliente": p.clientes?.nome || "Não identificado",
      "Entregador": p.entregadores?.nome || "-",
      "Itens": p.pedido_itens?.map((i) => `${i.quantidade}x ${i.produtos?.nome || "?"}`).join(", ") || "-",
      "Qtd. Itens": p.pedido_itens?.reduce((acc, i) => acc + i.quantidade, 0) || 0,
      "Valor Total": p.valor_total || 0,
      "Forma Pagamento": p.forma_pagamento || "-",
      "Canal": p.canal_venda || "-",
      "Status": statusConfig[p.status || "pendente"]?.label || p.status,
    }));

    // Criar resumo
    const resumo = [
      { "Métrica": "Total de Vendas", "Valor": `R$ ${metricas.totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
      { "Métrica": "Total de Pedidos", "Valor": metricas.totalPedidos.toString() },
      { "Métrica": "Pedidos Entregues", "Valor": metricas.pedidosEntregues.toString() },
      { "Métrica": "Pedidos Cancelados", "Valor": metricas.pedidosCancelados.toString() },
      { "Métrica": "Ticket Médio", "Valor": `R$ ${metricas.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
      { "Métrica": "Período", "Valor": `${format(parseISO(dataInicio), "dd/MM/yyyy")} a ${format(parseISO(dataFim), "dd/MM/yyyy")}` },
    ];

    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Aba de Pedidos
    const wsPedidos = XLSX.utils.json_to_sheet(dadosExport);
    
    // Ajustar largura das colunas
    wsPedidos["!cols"] = [
      { wch: 18 }, // Data/Hora
      { wch: 10 }, // Pedido
      { wch: 25 }, // Cliente
      { wch: 20 }, // Entregador
      { wch: 40 }, // Itens
      { wch: 10 }, // Qtd
      { wch: 12 }, // Valor
      { wch: 15 }, // Pagamento
      { wch: 12 }, // Canal
      { wch: 12 }, // Status
    ];
    
    XLSX.utils.book_append_sheet(wb, wsPedidos, "Pedidos");

    // Aba de Resumo
    const wsResumo = XLSX.utils.json_to_sheet(resumo);
    wsResumo["!cols"] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

    // Gerar arquivo
    const nomeArquivo = `relatorio-vendas-${format(parseISO(dataInicio), "ddMMyyyy")}-${format(parseISO(dataFim), "ddMMyyyy")}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);

    toast({
      title: "Relatório exportado!",
      description: `Arquivo ${nomeArquivo} gerado com sucesso.`,
    });
  };

  return (
    <MainLayout>
      <Header title="Relatório de Vendas" subtitle="Análise detalhada das vendas" />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Relatório de Vendas</h1>
            <p className="text-muted-foreground">Análise detalhada das vendas com exportação</p>
          </div>
          <Button className="gap-2" onClick={exportarExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              <div className="space-y-2">
                <Label className="text-xs">Data Início</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Data Fim</Label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_preparo">Em Preparo</SelectItem>
                    <SelectItem value="em_rota">Em Rota</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Canal</Label>
                <Select value={canalFiltro} onValueChange={setCanalFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="portaria">Portaria</SelectItem>
                    <SelectItem value="balcao">Balcão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">&nbsp;</Label>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="flex items-center gap-3 p-3 md:p-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total Vendas</p>
                <p className="text-lg font-bold truncate">
                  R$ {metricas.totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-3 md:p-4">
              <div className="rounded-lg bg-info/10 p-2">
                <ShoppingCart className="h-5 w-5 text-info" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total Pedidos</p>
                <p className="text-lg font-bold">{metricas.totalPedidos}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-3 md:p-4">
              <div className="rounded-lg bg-success/10 p-2">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Entregues</p>
                <p className="text-lg font-bold text-success">{metricas.pedidosEntregues}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-3 md:p-4">
              <div className="rounded-lg bg-destructive/10 p-2">
                <Calendar className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Cancelados</p>
                <p className="text-lg font-bold text-destructive">{metricas.pedidosCancelados}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-3 md:p-4">
              <div className="rounded-lg bg-warning/10 p-2">
                <Download className="h-5 w-5 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Ticket Médio</p>
                <p className="text-lg font-bold truncate">
                  R$ {metricas.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pedidos do Período</span>
              <Badge variant="secondary">{pedidosFiltrados.length} registros</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum pedido encontrado no período selecionado.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead className="hidden sm:table-cell">Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Itens</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="hidden lg:table-cell">Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosFiltrados.slice(0, 50).map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell className="text-xs md:text-sm">
                        {format(parseISO(pedido.created_at), "dd/MM HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-xs">
                        #{pedido.id.slice(0, 6).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">
                        {pedido.clientes?.nome || "Não identificado"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        {pedido.pedido_itens?.reduce((acc, i) => acc + i.quantidade, 0) || 0} item(s)
                      </TableCell>
                      <TableCell className="font-semibold text-xs md:text-sm">
                        R$ {(pedido.valor_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {pedido.forma_pagamento || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusConfig[pedido.status || "pendente"]?.variant || "secondary"}
                          className="text-xs"
                        >
                          {statusConfig[pedido.status || "pendente"]?.label || pedido.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {pedidosFiltrados.length > 50 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Mostrando 50 de {pedidosFiltrados.length} registros. Exporte para Excel para ver todos.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
