import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, Package, Wallet, Download, CreditCard, Banknote, Receipt, Minus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const paymentLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_credito: "Cartão Crédito",
  cartao_debito: "Cartão Débito",
  fiado: "Fiado",
  vale_gas: "Vale Gás",
};

export default function AcertoEntregador() {
  const { unidadeAtual } = useUnidade();
  const hoje = format(new Date(), "yyyy-MM-dd");

  const [selectedId, setSelectedId] = useState("");
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [buscar, setBuscar] = useState(false);

  // Entregadores
  const { data: entregadores = [] } = useQuery({
    queryKey: ["entregadores-ativos", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase
        .from("entregadores")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

      if (unidadeAtual?.id) {
        query = query.eq("unidade_id", unidadeAtual.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Entregas do período
  const { data: entregas = [], isLoading: loadingEntregas } = useQuery({
    queryKey: ["acerto-entregas", selectedId, dataInicio, dataFim, unidadeAtual?.id],
    queryFn: async () => {
      if (!selectedId) return [];
      let query = supabase
        .from("pedidos")
        .select(`
          id, created_at, valor_total, forma_pagamento, status, canal_venda,
          clientes (nome),
          pedido_itens (quantidade, preco_unitario, produtos (nome))
        `)
        .eq("entregador_id", selectedId)
        .eq("status", "entregue")
        .gte("created_at", `${dataInicio}T00:00:00`)
        .lte("created_at", `${dataFim}T23:59:59`)
        .order("created_at", { ascending: true });

      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: buscar && !!selectedId,
  });

  // Despesas do entregador no período
  const { data: despesas = [], isLoading: loadingDespesas } = useQuery({
    queryKey: ["acerto-despesas", selectedId, dataInicio, dataFim, unidadeAtual?.id],
    queryFn: async () => {
      if (!selectedId) return [];
      // Find entregador to get ID for movimentacoes
      let query = supabase
        .from("movimentacoes_caixa")
        .select("id, descricao, valor, categoria, created_at")
        .eq("entregador_id", selectedId)
        .eq("tipo", "saida")
        .gte("created_at", `${dataInicio}T00:00:00`)
        .lte("created_at", `${dataFim}T23:59:59`)
        .order("created_at", { ascending: true });

      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: buscar && !!selectedId,
  });

  const handleBuscar = () => {
    if (!selectedId) {
      toast.error("Selecione um entregador");
      return;
    }
    setBuscar(true);
  };

  // Métricas
  const metricas = useMemo(() => {
    const totalVendas = entregas.reduce((a, e) => a + Number(e.valor_total || 0), 0);
    const porForma: Record<string, number> = {};
    entregas.forEach((e) => {
      const forma = e.forma_pagamento || "outros";
      porForma[forma] = (porForma[forma] || 0) + Number(e.valor_total || 0);
    });
    const totalDespesas = despesas.reduce((a, d) => a + Number(d.valor || 0), 0);
    const saldoLiquido = totalVendas - totalDespesas;
    return { totalVendas, porForma, totalDespesas, saldoLiquido };
  }, [entregas, despesas]);

  // Resumo consolidado de produtos
  const resumoProdutos = useMemo(() => {
    const map = new Map<string, { nome: string; qtd: number; total: number }>();
    entregas.forEach((e) => {
      (e.pedido_itens || []).forEach((item: any) => {
        const nome = item.produtos?.nome || "Produto";
        const cur = map.get(nome) || { nome, qtd: 0, total: 0 };
        cur.qtd += item.quantidade;
        cur.total += item.quantidade * Number(item.preco_unitario);
        map.set(nome, cur);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qtd - a.qtd);
  }, [entregas]);

  const nomeEntregador = entregadores.find((e) => e.id === selectedId)?.nome || "";

  // Exportar PDF do acerto
  const exportarPDF = () => {
    if (entregas.length === 0) {
      toast.error("Nenhuma entrega para exportar");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Acerto do Entregador", 14, 15);
    doc.setFontSize(10);
    doc.text(`Entregador: ${nomeEntregador}`, 14, 22);
    doc.text(`Período: ${format(parseISO(dataInicio), "dd/MM/yyyy")} a ${format(parseISO(dataFim), "dd/MM/yyyy")}`, 14, 28);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 34);

    // Resumo financeiro
    autoTable(doc, {
      head: [["Métrica", "Valor"]],
      body: [
        ["Total Entregas", String(entregas.length)],
        ["Total Vendas", formatCurrency(metricas.totalVendas)],
        ...Object.entries(metricas.porForma).map(([forma, valor]) => [
          paymentLabels[forma] || forma,
          formatCurrency(valor),
        ]),
        ["Total Despesas", formatCurrency(metricas.totalDespesas)],
        ["Saldo Líquido", formatCurrency(metricas.saldoLiquido)],
      ],
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 65, 85] },
    });

    // Resumo de produtos
    let y = (doc as any).lastAutoTable?.finalY || 90;
    doc.setFontSize(12);
    doc.text("Produtos Vendidos", 14, y + 10);
    autoTable(doc, {
      head: [["Produto", "Qtd", "Total"]],
      body: resumoProdutos.map((p) => [p.nome, String(p.qtd), formatCurrency(p.total)]),
      startY: y + 14,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 65, 85] },
    });

    // Lista de entregas
    y = (doc as any).lastAutoTable?.finalY || 140;
    doc.setFontSize(12);
    doc.text("Entregas Detalhadas", 14, y + 10);
    autoTable(doc, {
      head: [["Hora", "Cliente", "Itens", "Pagamento", "Valor"]],
      body: entregas.map((e) => [
        format(parseISO(e.created_at), "HH:mm"),
        e.clientes?.nome || "—",
        (e.pedido_itens || []).map((i: any) => `${i.quantidade}x ${i.produtos?.nome || "?"}`).join(", ") || "—",
        paymentLabels[e.forma_pagamento || ""] || e.forma_pagamento || "—",
        formatCurrency(Number(e.valor_total || 0)),
      ]),
      startY: y + 14,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 65, 85] },
    });

    // Despesas
    if (despesas.length > 0) {
      y = (doc as any).lastAutoTable?.finalY || 180;
      doc.setFontSize(12);
      doc.text("Despesas", 14, y + 10);
      autoTable(doc, {
        head: [["Hora", "Descrição", "Categoria", "Valor"]],
        body: despesas.map((d) => [
          format(parseISO(d.created_at), "HH:mm"),
          d.descricao,
          d.categoria || "—",
          formatCurrency(Number(d.valor || 0)),
        ]),
        startY: y + 14,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [51, 65, 85] },
      });
    }

    // Assinatura
    y = (doc as any).lastAutoTable?.finalY || 220;
    doc.setFontSize(9);
    doc.text("_____________________________", 14, y + 25);
    doc.text(`Assinatura: ${nomeEntregador}`, 14, y + 30);
    doc.text("_____________________________", 120, y + 25);
    doc.text("Conferido por:", 120, y + 30);

    doc.save(`acerto-${nomeEntregador.replace(/\s/g, "-")}-${dataInicio}.pdf`);
    toast.success("PDF do acerto exportado!");
  };

  const isLoading = loadingEntregas || loadingDespesas;

  return (
    <MainLayout>
      <Header title="Acerto do Entregador" subtitle="Conferência de entregas e valores" />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />Selecionar Entregador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
              <div className="col-span-2 md:col-span-1 space-y-1">
                <Label className="text-xs">Entregador</Label>
                <Select value={selectedId} onValueChange={(v) => { setSelectedId(v); setBuscar(false); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {entregadores.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data Início</Label>
                <Input type="date" value={dataInicio} onChange={(e) => { setDataInicio(e.target.value); setBuscar(false); }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data Fim</Label>
                <Input type="date" value={dataFim} onChange={(e) => { setDataFim(e.target.value); setBuscar(false); }} />
              </div>
              <div className="flex items-end">
                <Button className="w-full gap-2" onClick={handleBuscar} disabled={isLoading}>
                  {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" /> : <Package className="h-4 w-4" />}
                  Carregar
                </Button>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full gap-2" onClick={exportarPDF} disabled={entregas.length === 0}>
                  <Download className="h-4 w-4" />PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas */}
        {buscar && (
          <>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardContent className="flex items-center gap-3 p-3 md:p-4">
                  <div className="rounded-lg bg-primary/10 p-2"><Package className="h-5 w-5 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Entregas</p>
                    <p className="text-lg font-bold">{isLoading ? "..." : entregas.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-3 md:p-4">
                  <div className="rounded-lg bg-success/10 p-2"><Wallet className="h-5 w-5 text-success" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Total Vendas</p>
                    <p className="text-lg font-bold truncate">{isLoading ? "..." : formatCurrency(metricas.totalVendas)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-3 md:p-4">
                  <div className="rounded-lg bg-destructive/10 p-2"><Minus className="h-5 w-5 text-destructive" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Despesas</p>
                    <p className="text-lg font-bold truncate text-destructive">{isLoading ? "..." : formatCurrency(metricas.totalDespesas)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-3 md:p-4">
                  <div className="rounded-lg bg-warning/10 p-2"><Receipt className="h-5 w-5 text-warning" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Saldo Líquido</p>
                    <p className={`text-lg font-bold truncate ${metricas.saldoLiquido >= 0 ? "text-success" : "text-destructive"}`}>
                      {isLoading ? "..." : formatCurrency(metricas.saldoLiquido)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-3 md:p-4">
                  <div className="rounded-lg bg-info/10 p-2"><CreditCard className="h-5 w-5 text-info" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Formas Pgto</p>
                    <p className="text-lg font-bold">{isLoading ? "..." : Object.keys(metricas.porForma).length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formas de pagamento + Resumo de produtos */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Formas de Pagamento */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Banknote className="h-5 w-5" />Resumo por Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
                  ) : Object.keys(metricas.porForma).length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground text-sm">Sem dados</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Forma</TableHead>
                          <TableHead className="text-right">Pedidos</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(metricas.porForma)
                          .sort(([, a], [, b]) => b - a)
                          .map(([forma, valor]) => {
                            const qtd = entregas.filter((e) => (e.forma_pagamento || "outros") === forma).length;
                            const pct = metricas.totalVendas > 0 ? ((valor / metricas.totalVendas) * 100).toFixed(1) : "0";
                            return (
                              <TableRow key={forma}>
                                <TableCell className="font-medium">
                                  <Badge variant="outline">{paymentLabels[forma] || forma}</Badge>
                                </TableCell>
                                <TableCell className="text-right">{qtd}</TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(valor)}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{pct}%</TableCell>
                              </TableRow>
                            );
                          })}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">{entregas.length}</TableCell>
                          <TableCell className="text-right">{formatCurrency(metricas.totalVendas)}</TableCell>
                          <TableCell className="text-right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Resumo de Produtos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-5 w-5" />Produtos Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
                  ) : resumoProdutos.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground text-sm">Sem dados</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resumoProdutos.map((p) => (
                          <TableRow key={p.nome}>
                            <TableCell className="font-medium">{p.nome}</TableCell>
                            <TableCell className="text-right">{p.qtd}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(p.total)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">{resumoProdutos.reduce((s, p) => s + p.qtd, 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(resumoProdutos.reduce((s, p) => s + p.total, 0))}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Despesas do entregador */}
            {despesas.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-destructive">
                    <Minus className="h-5 w-5" />Despesas do Entregador
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hora</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {despesas.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="text-xs">{format(parseISO(d.created_at), "HH:mm")}</TableCell>
                          <TableCell className="text-sm">{d.descricao}</TableCell>
                          <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-xs">{d.categoria || "—"}</Badge></TableCell>
                          <TableCell className="text-right font-semibold text-destructive">{formatCurrency(Number(d.valor || 0))}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={3}>Total Despesas</TableCell>
                        <TableCell className="text-right text-destructive">{formatCurrency(metricas.totalDespesas)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Lista de entregas com produtos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-base"><Receipt className="h-5 w-5" />Entregas Detalhadas</span>
                  <Badge variant="secondary">{entregas.length} registros</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {isLoading ? (
                  <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : entregas.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    {selectedId ? "Nenhuma entrega encontrada para este período" : "Selecione um entregador e clique em Carregar"}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hora</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="hidden md:table-cell">Produtos</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entregas.map((e) => {
                        const itensStr = (e.pedido_itens || [])
                          .map((i: any) => `${i.quantidade}x ${i.produtos?.nome || "?"}`)
                          .join(", ") || "—";
                        return (
                          <TableRow key={e.id}>
                            <TableCell className="text-xs">{format(parseISO(e.created_at), "HH:mm")}</TableCell>
                            <TableCell className="text-sm font-medium">{e.clientes?.nome || "—"}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">{itensStr}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{paymentLabels[e.forma_pagamento || ""] || e.forma_pagamento || "—"}</Badge></TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(Number(e.valor_total || 0))}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
