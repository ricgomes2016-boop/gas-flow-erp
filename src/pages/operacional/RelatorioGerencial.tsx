import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { DollarSign, TrendingUp, ShoppingCart, Truck, Package, Users, Percent, AlertTriangle } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RelatorioGerencial() {
  const [vendas, setVendas] = useState<any[]>([]);
  const [despesas, setDespesas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const inicio = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const fim = format(endOfMonth(new Date()), "yyyy-MM-dd");

      const [vendasRes, despesasRes, produtosRes, clientesRes] = await Promise.all([
        supabase.from("pedidos").select("id, valor_total, status, created_at, forma_pagamento").gte("created_at", inicio).lte("created_at", fim + "T23:59:59"),
        supabase.from("contas_pagar").select("id, valor, categoria, status, vencimento").gte("vencimento", inicio).lte("vencimento", fim),
        supabase.from("produtos").select("id, nome, preco_venda, preco_custo, estoque_atual"),
        supabase.from("clientes").select("id, nome, created_at"),
      ]);

      setVendas(vendasRes.data || []);
      setDespesas(despesasRes.data || []);
      setProdutos(produtosRes.data || []);
      setClientes(clientesRes.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // KPIs
  const vendasConcluidas = vendas.filter((v) => v.status === "entregue" || v.status === "concluido");
  const faturamento = vendasConcluidas.reduce((s, v) => s + Number(v.valor_total), 0);
  const totalDespesas = despesas.reduce((s, d) => s + Number(d.valor), 0);
  const lucroOperacional = faturamento - totalDespesas;
  const margemOperacional = faturamento > 0 ? (lucroOperacional / faturamento) * 100 : 0;
  const ticketMedio = vendasConcluidas.length > 0 ? faturamento / vendasConcluidas.length : 0;
  const totalPedidos = vendas.length;
  const custoMedioEntrega = vendasConcluidas.length > 0 ? totalDespesas * 0.3 / vendasConcluidas.length : 0;

  // Charts data
  const vendasPorDia = Array.from({ length: 30 }, (_, i) => {
    const dia = subDays(new Date(), 29 - i);
    const diaStr = format(dia, "yyyy-MM-dd");
    const total = vendas.filter((v) => v.created_at?.startsWith(diaStr)).reduce((s, v) => s + Number(v.valor_total), 0);
    return { dia: format(dia, "dd/MM"), total };
  });

  const despesasPorCategoria = despesas.reduce((acc: Record<string, number>, d) => {
    const cat = d.categoria || "Outros";
    acc[cat] = (acc[cat] || 0) + Number(d.valor);
    return acc;
  }, {});
  const despesasChart = Object.entries(despesasPorCategoria).map(([name, value]) => ({ name, value }));

  const formaPagamento = vendas.reduce((acc: Record<string, number>, v) => {
    const fp = v.forma_pagamento || "Não informado";
    acc[fp] = (acc[fp] || 0) + 1;
    return acc;
  }, {});
  const pagamentoChart = Object.entries(formaPagamento).map(([name, value]) => ({ name, value }));

  // Top produtos by margin
  const topProdutos = produtos
    .filter((p) => p.preco_venda && p.preco_custo)
    .map((p) => ({
      nome: p.nome,
      margem: ((Number(p.preco_venda) - Number(p.preco_custo)) / Number(p.preco_venda)) * 100,
      estoque: p.estoque_atual || 0,
    }))
    .sort((a, b) => b.margem - a.margem)
    .slice(0, 8);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "#8884d8", "#82ca9d", "#ffc658"];

  return (
    <MainLayout>
      <Header title="Relatório Gerencial" subtitle={`Consolidado de ${format(new Date(), "MMMM yyyy", { locale: ptBR })}`} />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
          {[
            { icon: DollarSign, label: "Faturamento", value: `R$ ${(faturamento / 1000).toFixed(1)}k`, color: "text-green-600" },
            { icon: TrendingUp, label: "Lucro Op.", value: `R$ ${(lucroOperacional / 1000).toFixed(1)}k`, color: lucroOperacional >= 0 ? "text-green-600" : "text-destructive" },
            { icon: Percent, label: "Margem", value: `${margemOperacional.toFixed(1)}%`, color: "text-blue-600" },
            { icon: ShoppingCart, label: "Pedidos", value: totalPedidos.toString(), color: "text-primary" },
            { icon: DollarSign, label: "Ticket Médio", value: `R$ ${ticketMedio.toFixed(0)}`, color: "text-primary" },
            { icon: AlertTriangle, label: "Despesas", value: `R$ ${(totalDespesas / 1000).toFixed(1)}k`, color: "text-destructive" },
            { icon: Truck, label: "Custo/Entrega", value: `R$ ${custoMedioEntrega.toFixed(2)}`, color: "text-orange-600" },
            { icon: Users, label: "Clientes", value: clientes.length.toString(), color: "text-primary" },
          ].map((kpi, i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-3 px-3">
                <kpi.icon className={`h-4 w-4 ${kpi.color} mb-1`} />
                <p className="text-lg font-bold">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Faturamento Diário</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={vendasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Despesas por Categoria</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={despesasChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {despesasChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Margem por Produto (Top 8)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topProdutos} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
                  <YAxis dataKey="nome" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  <Bar dataKey="margem" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Formas de Pagamento</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pagamentoChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                    {pagamentoChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
