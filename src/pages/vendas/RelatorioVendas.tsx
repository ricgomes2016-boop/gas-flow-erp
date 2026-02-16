import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileSpreadsheet, Download, Filter, TrendingUp, DollarSign, ShoppingCart, Calendar, RefreshCw, Users, Megaphone, Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnidade } from "@/contexts/UnidadeContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_preparo: { label: "Em Preparo", variant: "outline" },
  em_rota: { label: "Em Rota", variant: "outline" },
  entregue: { label: "Entregue", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const canalLabels: Record<string, string> = {
  telefone: "Telefone",
  whatsapp: "WhatsApp",
  portaria: "Portaria",
  balcao: "Balcão",
  Entregador: "Entregador",
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
  const { unidadeAtual } = useUnidade();
  const queryClient = useQueryClient();
  const hoje = new Date();

  const [dataInicio, setDataInicio] = useState(format(startOfMonth(hoje), "yyyy-MM-dd"));
  const [dataFim, setDataFim] = useState(format(endOfMonth(hoje), "yyyy-MM-dd"));
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [canalFiltro, setCanalFiltro] = useState<string>("todos");
  const [editandoCanalId, setEditandoCanalId] = useState<string | null>(null);

  // Buscar canais de venda cadastrados
  const { data: canaisVenda = [] } = useQuery({
    queryKey: ["canais-venda", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase.from("canais_venda").select("id, nome").eq("ativo", true);
      if (unidadeAtual?.id) {
        query = query.or(`unidade_id.eq.${unidadeAtual.id},unidade_id.is.null`);
      }
      const { data } = await query;
      return data || [];
    },
  });

  const alterarCanalVenda = async (pedidoId: string, novoCanal: string) => {
    const { error } = await supabase.from("pedidos").update({ canal_venda: novoCanal }).eq("id", pedidoId);
    if (error) {
      toast({ title: "Erro ao alterar canal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Canal de venda atualizado!" });
      queryClient.invalidateQueries({ queryKey: ["relatorio-vendas"] });
    }
    setEditandoCanalId(null);
  };

  const { data: pedidos = [], isLoading, refetch } = useQuery({
    queryKey: ["relatorio-vendas", dataInicio, dataFim, unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase
        .from("pedidos")
        .select(`
          id, created_at, valor_total, status, forma_pagamento, canal_venda,
          clientes (nome), entregadores (nome),
          pedido_itens (quantidade, preco_unitario, produtos (nome))
        `)
        .gte("created_at", `${dataInicio}T00:00:00`)
        .lte("created_at", `${dataFim}T23:59:59`)
        .order("created_at", { ascending: false });

      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PedidoRelatorio[];
    },
  });

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (statusFiltro !== "todos" && p.status !== statusFiltro) return false;
      if (canalFiltro !== "todos" && p.canal_venda !== canalFiltro) return false;
      return true;
    });
  }, [pedidos, statusFiltro, canalFiltro]);

  const metricas = useMemo(() => {
    const vendas = pedidosFiltrados.filter((p) => p.status !== "cancelado");
    const totalVendas = vendas.reduce((acc, p) => acc + (p.valor_total || 0), 0);
    const totalPedidos = pedidosFiltrados.length;
    const pedidosEntregues = pedidosFiltrados.filter((p) => p.status === "entregue").length;
    const pedidosCancelados = pedidosFiltrados.filter((p) => p.status === "cancelado").length;
    const ticketMedio = vendas.length > 0 ? totalVendas / vendas.length : 0;
    return { totalVendas, totalPedidos, pedidosEntregues, pedidosCancelados, ticketMedio };
  }, [pedidosFiltrados]);

  // Agrupamento por Entregador
  const dadosPorEntregador = useMemo(() => {
    const map = new Map<string, { nome: string; total: number; qtd: number }>();
    pedidosFiltrados.filter(p => p.status !== "cancelado").forEach(p => {
      const nome = p.entregadores?.nome || "Sem entregador";
      const cur = map.get(nome) || { nome, total: 0, qtd: 0 };
      cur.total += p.valor_total || 0;
      cur.qtd += 1;
      map.set(nome, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [pedidosFiltrados]);

  // Agrupamento cruzado: Entregador x Canal de Venda (com produto)
  const dadosEntregadorCanal = useMemo(() => {
    const map = new Map<string, { nome: string; canais: Record<string, { qtd: number; valor: number }>; totalQtd: number; totalValor: number }>();
    const canaisSet = new Set<string>();
    pedidosFiltrados.filter(p => p.status !== "cancelado").forEach(p => {
      const nomeEntregador = p.entregadores?.nome || "Sem entregador";
      const canal = p.canal_venda || "outros";
      canaisSet.add(canal);
      const cur = map.get(nomeEntregador) || { nome: nomeEntregador, canais: {}, totalQtd: 0, totalValor: 0 };
      if (!cur.canais[canal]) cur.canais[canal] = { qtd: 0, valor: 0 };
      const qtdItens = p.pedido_itens?.reduce((acc, i) => acc + i.quantidade, 0) || 1;
      cur.canais[canal].qtd += qtdItens;
      cur.canais[canal].valor += p.valor_total || 0;
      cur.totalQtd += qtdItens;
      cur.totalValor += p.valor_total || 0;
      map.set(nomeEntregador, cur);
    });
    return { entregadores: Array.from(map.values()).sort((a, b) => b.totalQtd - a.totalQtd), canais: Array.from(canaisSet).sort() };
  }, [pedidosFiltrados]);

  // Agrupamento por Canal de Venda
  const dadosPorCanal = useMemo(() => {
    const map = new Map<string, { canal: string; label: string; total: number; qtd: number }>();
    pedidosFiltrados.filter(p => p.status !== "cancelado").forEach(p => {
      const canal = p.canal_venda || "outros";
      const label = canalLabels[canal] || canal;
      const cur = map.get(canal) || { canal, label, total: 0, qtd: 0 };
      cur.total += p.valor_total || 0;
      cur.qtd += 1;
      map.set(canal, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [pedidosFiltrados]);

  const exportarExcel = () => {
    if (pedidosFiltrados.length === 0) {
      toast({ title: "Nenhum dado para exportar", variant: "destructive" });
      return;
    }

    const dadosExport = pedidosFiltrados.map((p) => ({
      "Data/Hora": format(parseISO(p.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      "Pedido": p.id.slice(0, 8).toUpperCase(),
      "Cliente": p.clientes?.nome || "Não identificado",
      "Entregador": p.entregadores?.nome || "-",
      "Itens": p.pedido_itens?.map((i) => `${i.quantidade}x ${i.produtos?.nome || "?"}`).join(", ") || "-",
      "Qtd. Itens": p.pedido_itens?.reduce((acc, i) => acc + i.quantidade, 0) || 0,
      "Valor Total": p.valor_total || 0,
      "Forma Pagamento": p.forma_pagamento || "-",
      "Canal": canalLabels[p.canal_venda || ""] || p.canal_venda || "-",
      "Status": statusConfig[p.status || "pendente"]?.label || p.status,
    }));

    const resumo = [
      { "Métrica": "Total de Vendas", "Valor": `R$ ${metricas.totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
      { "Métrica": "Total de Pedidos", "Valor": metricas.totalPedidos.toString() },
      { "Métrica": "Pedidos Entregues", "Valor": metricas.pedidosEntregues.toString() },
      { "Métrica": "Pedidos Cancelados", "Valor": metricas.pedidosCancelados.toString() },
      { "Métrica": "Ticket Médio", "Valor": `R$ ${metricas.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
      { "Métrica": "Período", "Valor": `${format(parseISO(dataInicio), "dd/MM/yyyy")} a ${format(parseISO(dataFim), "dd/MM/yyyy")}` },
    ];

    const wb = XLSX.utils.book_new();
    const wsPedidos = XLSX.utils.json_to_sheet(dadosExport);
    wsPedidos["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 40 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsPedidos, "Pedidos");

    const wsResumo = XLSX.utils.json_to_sheet(resumo);
    wsResumo["!cols"] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

    // Aba por Entregador
    const wsEntregador = XLSX.utils.json_to_sheet(dadosPorEntregador.map(e => ({
      Entregador: e.nome, Pedidos: e.qtd,
      "Faturamento": `R$ ${e.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      "Ticket Médio": `R$ ${(e.qtd > 0 ? e.total / e.qtd : 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    })));
    XLSX.utils.book_append_sheet(wb, wsEntregador, "Por Entregador");

    // Aba por Canal
    const wsCanal = XLSX.utils.json_to_sheet(dadosPorCanal.map(c => ({
      Canal: c.label, Pedidos: c.qtd,
      "Faturamento": `R$ ${c.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      "Ticket Médio": `R$ ${(c.qtd > 0 ? c.total / c.qtd : 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    })));
    XLSX.utils.book_append_sheet(wb, wsCanal, "Por Canal");

    const nomeArquivo = `relatorio-vendas-${format(parseISO(dataInicio), "ddMMyyyy")}-${format(parseISO(dataFim), "ddMMyyyy")}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
    toast({ title: "Relatório exportado!", description: `Arquivo ${nomeArquivo} gerado.` });
  };

  const exportarPDF = () => {
    if (pedidosFiltrados.length === 0) {
      toast({ title: "Nenhum dado para exportar", variant: "destructive" });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Vendas", 14, 15);
    doc.setFontSize(10);
    doc.text(`Período: ${format(parseISO(dataInicio), "dd/MM/yyyy")} a ${format(parseISO(dataFim), "dd/MM/yyyy")}`, 14, 22);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);

    // Resumo geral
    autoTable(doc, {
      head: [["Métrica", "Valor"]],
      body: [
        ["Total Vendas", `R$ ${metricas.totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
        ["Total Pedidos", String(metricas.totalPedidos)],
        ["Entregues", String(metricas.pedidosEntregues)],
        ["Cancelados", String(metricas.pedidosCancelados)],
        ["Ticket Médio", `R$ ${metricas.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ],
      startY: 34,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 65, 85] },
    });

    // Por Entregador
    const y1 = (doc as any).lastAutoTable?.finalY || 80;
    doc.setFontSize(12);
    doc.text("Vendas por Entregador", 14, y1 + 10);
    autoTable(doc, {
      head: [["Entregador", "Pedidos", "Faturamento", "Ticket Médio"]],
      body: dadosPorEntregador.map(e => [
        e.nome, String(e.qtd),
        `R$ ${e.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        `R$ ${(e.qtd > 0 ? e.total / e.qtd : 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      ]),
      startY: y1 + 14,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 65, 85] },
    });

    // Por Canal
    const y2 = (doc as any).lastAutoTable?.finalY || 140;
    doc.setFontSize(12);
    doc.text("Vendas por Canal", 14, y2 + 10);
    autoTable(doc, {
      head: [["Canal", "Pedidos", "Faturamento", "Ticket Médio"]],
      body: dadosPorCanal.map(c => [
        c.label, String(c.qtd),
        `R$ ${c.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        `R$ ${(c.qtd > 0 ? c.total / c.qtd : 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      ]),
      startY: y2 + 14,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 65, 85] },
    });

    doc.save(`relatorio-vendas-${format(parseISO(dataInicio), "ddMMyyyy")}-${format(parseISO(dataFim), "ddMMyyyy")}.pdf`);
    toast({ title: "PDF exportado!" });
  };

  const formatCurrency = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <MainLayout>
      <Header title="Relatório de Vendas" subtitle="Análise detalhada das vendas" />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Relatório de Vendas</h1>
            <p className="text-muted-foreground">Análise detalhada por entregador e canal de venda</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={exportarPDF}>
              <Download className="h-4 w-4" />PDF
            </Button>
            <Button className="gap-2" onClick={exportarExcel}>
              <FileSpreadsheet className="h-4 w-4" />Excel
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              <div className="space-y-2">
                <Label className="text-xs">Data Início</Label>
                <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Data Fim</Label>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="portaria">Portaria</SelectItem>
                    <SelectItem value="balcao">Balcão</SelectItem>
                    <SelectItem value="Entregador">Entregador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">&nbsp;</Label>
                <Button variant="outline" className="w-full gap-2" onClick={() => refetch()} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-5">
          <Card><CardContent className="flex items-center gap-3 p-3 md:p-4"><div className="rounded-lg bg-primary/10 p-2"><DollarSign className="h-5 w-5 text-primary" /></div><div className="min-w-0"><p className="text-xs text-muted-foreground">Total Vendas</p><p className="text-lg font-bold truncate">{formatCurrency(metricas.totalVendas)}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-3 md:p-4"><div className="rounded-lg bg-info/10 p-2"><ShoppingCart className="h-5 w-5 text-info" /></div><div className="min-w-0"><p className="text-xs text-muted-foreground">Total Pedidos</p><p className="text-lg font-bold">{metricas.totalPedidos}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-3 md:p-4"><div className="rounded-lg bg-success/10 p-2"><TrendingUp className="h-5 w-5 text-success" /></div><div className="min-w-0"><p className="text-xs text-muted-foreground">Entregues</p><p className="text-lg font-bold text-success">{metricas.pedidosEntregues}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-3 md:p-4"><div className="rounded-lg bg-destructive/10 p-2"><Calendar className="h-5 w-5 text-destructive" /></div><div className="min-w-0"><p className="text-xs text-muted-foreground">Cancelados</p><p className="text-lg font-bold text-destructive">{metricas.pedidosCancelados}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-3 md:p-4"><div className="rounded-lg bg-warning/10 p-2"><Download className="h-5 w-5 text-warning" /></div><div className="min-w-0"><p className="text-xs text-muted-foreground">Ticket Médio</p><p className="text-lg font-bold truncate">{formatCurrency(metricas.ticketMedio)}</p></div></CardContent></Card>
        </div>

        {/* Tabs: Pedidos / Entregador / Canal */}
        <Tabs defaultValue="pedidos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pedidos" className="gap-2"><ShoppingCart className="h-4 w-4" />Pedidos</TabsTrigger>
            <TabsTrigger value="entregador" className="gap-2"><Users className="h-4 w-4" />Por Entregador</TabsTrigger>
            <TabsTrigger value="entregador-canal" className="gap-2"><FileSpreadsheet className="h-4 w-4" />Entregador x Canal</TabsTrigger>
            <TabsTrigger value="canal" className="gap-2"><Megaphone className="h-4 w-4" />Por Canal</TabsTrigger>
          </TabsList>

          {/* Tab Pedidos */}
          <TabsContent value="pedidos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pedidos do Período</span>
                  <Badge variant="secondary">{pedidosFiltrados.length} registros</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {isLoading ? (
                  <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : pedidosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum pedido encontrado no período.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="hidden sm:table-cell">Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="hidden md:table-cell">Entregador</TableHead>
                        <TableHead className="hidden md:table-cell">Canal</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="hidden lg:table-cell">Pagamento</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosFiltrados.slice(0, 50).map((pedido) => (
                        <TableRow key={pedido.id}>
                          <TableCell className="text-xs md:text-sm">{format(parseISO(pedido.created_at), "dd/MM HH:mm", { locale: ptBR })}</TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-xs">#{pedido.id.slice(0, 6).toUpperCase()}</TableCell>
                          <TableCell className="text-xs md:text-sm">{pedido.clientes?.nome || "Não identificado"}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs">{pedido.entregadores?.nome || "-"}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs">
                            <Popover open={editandoCanalId === pedido.id} onOpenChange={(open) => setEditandoCanalId(open ? pedido.id : null)}>
                              <PopoverTrigger asChild>
                                <button className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                                  <Badge variant="outline">{canalLabels[pedido.canal_venda || ""] || pedido.canal_venda || "-"}</Badge>
                                  <Pencil className="h-3 w-3 text-muted-foreground" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 p-2 bg-popover border border-border shadow-lg z-50" align="start">
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Trocar canal:</p>
                                  {["telefone", "whatsapp", "portaria", "balcao", "Entregador"].map((canal) => (
                                    <button
                                      key={canal}
                                      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors ${pedido.canal_venda === canal ? "bg-accent font-medium" : ""}`}
                                      onClick={() => alterarCanalVenda(pedido.id, canal)}
                                    >
                                      {canalLabels[canal] || canal}
                                    </button>
                                  ))}
                                  {canaisVenda.filter(c => !["telefone", "whatsapp", "portaria", "balcao", "Entregador"].includes(c.nome)).map((c) => (
                                    <button
                                      key={c.id}
                                      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors ${pedido.canal_venda === c.nome ? "bg-accent font-medium" : ""}`}
                                      onClick={() => alterarCanalVenda(pedido.id, c.nome)}
                                    >
                                      {c.nome}
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="font-semibold text-xs md:text-sm">{formatCurrency(pedido.valor_total || 0)}</TableCell>
                          <TableCell className="hidden lg:table-cell"><Badge variant="outline" className="text-xs">{pedido.forma_pagamento || "-"}</Badge></TableCell>
                          <TableCell><Badge variant={statusConfig[pedido.status || "pendente"]?.variant || "secondary"} className="text-xs">{statusConfig[pedido.status || "pendente"]?.label || pedido.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {pedidosFiltrados.length > 50 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">Mostrando 50 de {pedidosFiltrados.length} registros. Exporte para ver todos.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Por Entregador */}
          <TabsContent value="entregador">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Faturamento por Entregador</CardTitle></CardHeader>
                <CardContent>
                  {dadosPorEntregador.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Sem dados no período.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dadosPorEntregador.slice(0, 10)} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} className="text-xs" />
                        <YAxis type="category" dataKey="nome" width={120} className="text-xs" />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} labelStyle={{ fontWeight: "bold" }} />
                        <Bar dataKey="total" name="Faturamento" radius={[0, 4, 4, 0]}>
                          {dadosPorEntregador.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Detalhamento por Entregador</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entregador</TableHead>
                        <TableHead className="text-right">Pedidos</TableHead>
                        <TableHead className="text-right">Faturamento</TableHead>
                        <TableHead className="text-right">Ticket Médio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dadosPorEntregador.map((e, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{e.nome}</TableCell>
                          <TableCell className="text-right">{e.qtd}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(e.total)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(e.qtd > 0 ? e.total / e.qtd : 0)}</TableCell>
                        </TableRow>
                      ))}
                      {dadosPorEntregador.length > 0 && (
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">{dadosPorEntregador.reduce((s, e) => s + e.qtd, 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(dadosPorEntregador.reduce((s, e) => s + e.total, 0))}</TableCell>
                          <TableCell className="text-right">—</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Entregador x Canal */}
          <TabsContent value="entregador-canal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />Quantidade por Entregador e Canal de Venda
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {dadosEntregadorCanal.entregadores.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Sem dados no período.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background z-10">Entregador</TableHead>
                        {dadosEntregadorCanal.canais.map(canal => (
                          <TableHead key={canal} className="text-center">{canalLabels[canal] || canal}</TableHead>
                        ))}
                        <TableHead className="text-center font-bold">Total Qtd</TableHead>
                        <TableHead className="text-right font-bold">Total R$</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dadosEntregadorCanal.entregadores.map((ent, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium sticky left-0 bg-background z-10">{ent.nome}</TableCell>
                          {dadosEntregadorCanal.canais.map(canal => (
                            <TableCell key={canal} className="text-center">
                              {ent.canais[canal]?.qtd || 0}
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-bold">{ent.totalQtd}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(ent.totalValor)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell className="sticky left-0 bg-muted/50 z-10">Total</TableCell>
                        {dadosEntregadorCanal.canais.map(canal => {
                          const totalCanal = dadosEntregadorCanal.entregadores.reduce((s, e) => s + (e.canais[canal]?.qtd || 0), 0);
                          return <TableCell key={canal} className="text-center">{totalCanal}</TableCell>;
                        })}
                        <TableCell className="text-center">{dadosEntregadorCanal.entregadores.reduce((s, e) => s + e.totalQtd, 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dadosEntregadorCanal.entregadores.reduce((s, e) => s + e.totalValor, 0))}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Por Canal */}
          <TabsContent value="canal">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" />Distribuição por Canal</CardTitle></CardHeader>
                <CardContent>
                  {dadosPorCanal.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Sem dados no período.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={dadosPorCanal} dataKey="total" nameKey="label" cx="50%" cy="50%" outerRadius={100} label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}>
                          {dadosPorCanal.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Detalhamento por Canal</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Canal</TableHead>
                        <TableHead className="text-right">Pedidos</TableHead>
                        <TableHead className="text-right">Faturamento</TableHead>
                        <TableHead className="text-right">Ticket Médio</TableHead>
                        <TableHead className="text-right">% do Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dadosPorCanal.map((c, i) => {
                        const totalGeral = dadosPorCanal.reduce((s, x) => s + x.total, 0);
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{c.label}</TableCell>
                            <TableCell className="text-right">{c.qtd}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(c.total)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(c.qtd > 0 ? c.total / c.qtd : 0)}</TableCell>
                            <TableCell className="text-right">{totalGeral > 0 ? ((c.total / totalGeral) * 100).toFixed(1) : 0}%</TableCell>
                          </TableRow>
                        );
                      })}
                      {dadosPorCanal.length > 0 && (
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">{dadosPorCanal.reduce((s, c) => s + c.qtd, 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(dadosPorCanal.reduce((s, c) => s + c.total, 0))}</TableCell>
                          <TableCell className="text-right">—</TableCell>
                          <TableCell className="text-right">100%</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
