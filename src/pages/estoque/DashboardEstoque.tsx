import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Package, Flame, Droplets, AlertTriangle, TrendingUp, DollarSign, BarChart3, Cylinder,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function DashboardEstoque() {
  const { unidadeAtual } = useUnidade();

  const { data: produtos = [] } = useQuery({
    queryKey: ["dashboard-estoque-produtos", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("produtos").select("id, nome, categoria, tipo_botijao, estoque, preco").eq("ativo", true);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: vendasRaw = [] } = useQuery({
    queryKey: ["dashboard-estoque-vendas", unidadeAtual?.id],
    queryFn: async () => {
      const desde = subDays(new Date(), 30);
      let q = supabase
        .from("pedido_itens")
        .select("produto_id, quantidade, pedidos!inner(created_at, status, unidade_id)")
        .gte("pedidos.created_at", startOfDay(desde).toISOString())
        .neq("pedidos.status", "cancelado");
      if (unidadeAtual?.id) q = q.eq("pedidos.unidade_id", unidadeAtual.id);
      const { data } = await q;
      return (data || []) as any[];
    },
  });

  const { data: alertasEstoque = [] } = useQuery({
    queryKey: ["dashboard-estoque-alertas", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("produtos").select("id, nome, estoque, categoria, tipo_botijao").eq("ativo", true).lt("estoque", 10);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  // KPIs
  const kpis = useMemo(() => {
    const cheios = produtos.filter((p: any) => p.tipo_botijao === "cheio");
    const vazios = produtos.filter((p: any) => p.tipo_botijao === "vazio");
    const totalCheios = cheios.reduce((s: number, p: any) => s + (p.estoque || 0), 0);
    const totalVazios = vazios.reduce((s: number, p: any) => s + (p.estoque || 0), 0);
    const valorEstoque = produtos.filter((p: any) => p.tipo_botijao !== "vazio").reduce((s: number, p: any) => s + (p.estoque || 0) * (p.preco || 0), 0);
    const totalProdutos = produtos.length;
    return { totalCheios, totalVazios, valorEstoque, totalProdutos };
  }, [produtos]);

  // Curva ABC
  const curvaABC = useMemo(() => {
    const vendasPorProduto: Record<string, number> = {};
    vendasRaw.forEach((v: any) => {
      vendasPorProduto[v.produto_id] = (vendasPorProduto[v.produto_id] || 0) + v.quantidade;
    });

    const items = Object.entries(vendasPorProduto)
      .map(([id, qty]) => {
        const prod = produtos.find((p: any) => p.id === id);
        return { id, nome: prod?.nome || "Desconhecido", quantidade: qty, valor: qty * (prod?.preco || 0) };
      })
      .sort((a, b) => b.valor - a.valor);

    const totalValor = items.reduce((s, i) => s + i.valor, 0);
    let acumulado = 0;
    return items.map((item) => {
      acumulado += item.valor;
      const percentual = totalValor > 0 ? (acumulado / totalValor) * 100 : 0;
      const classe = percentual <= 80 ? "A" : percentual <= 95 ? "B" : "C";
      return { ...item, percentual: Math.round(percentual), classe };
    });
  }, [produtos, vendasRaw]);

  // Giro por categoria
  const giroPorCategoria = useMemo(() => {
    const categorias: Record<string, { vendas: number; estoque: number }> = {};
    vendasRaw.forEach((v: any) => {
      const prod = produtos.find((p: any) => p.id === v.produto_id);
      const cat = prod?.categoria || "outro";
      if (!categorias[cat]) categorias[cat] = { vendas: 0, estoque: 0 };
      categorias[cat].vendas += v.quantidade;
    });
    produtos.forEach((p: any) => {
      const cat = p.categoria || "outro";
      if (!categorias[cat]) categorias[cat] = { vendas: 0, estoque: 0 };
      if (p.tipo_botijao !== "vazio") categorias[cat].estoque += p.estoque || 0;
    });
    return Object.entries(categorias).map(([cat, data]) => ({
      categoria: cat === "gas" ? "Gás" : cat === "agua" ? "Água" : cat === "acessorio" ? "Acessórios" : "Outros",
      giro: data.estoque > 0 ? +(data.vendas / data.estoque).toFixed(2) : 0,
      vendas: data.vendas,
      estoque: data.estoque,
    }));
  }, [produtos, vendasRaw]);

  // Distribuição valor por categoria (para pie chart)
  const distribuicaoValor = useMemo(() => {
    const cats: Record<string, number> = {};
    produtos.filter((p: any) => p.tipo_botijao !== "vazio").forEach((p: any) => {
      const cat = p.categoria === "gas" ? "Gás" : p.categoria === "agua" ? "Água" : p.categoria === "acessorio" ? "Acessórios" : "Outros";
      cats[cat] = (cats[cat] || 0) + (p.estoque || 0) * (p.preco || 0);
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value: +value.toFixed(2) }));
  }, [produtos]);

  return (
    <MainLayout>
      <Header title="Dashboard de Estoque" subtitle="Visão consolidada do inventário" />
      <div className="p-3 sm:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-3"><Flame className="h-5 w-5 text-primary" /></div>
              <div><p className="text-xs text-muted-foreground">Cheios</p><p className="text-2xl font-bold">{kpis.totalCheios}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-muted p-3"><Cylinder className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="text-xs text-muted-foreground">Vazios</p><p className="text-2xl font-bold">{kpis.totalVazios}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-accent p-3"><DollarSign className="h-5 w-5 text-accent-foreground" /></div>
              <div><p className="text-xs text-muted-foreground">Valor Imobilizado</p><p className="text-xl font-bold">R$ {kpis.valorEstoque.toLocaleString("pt-BR")}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-destructive/10 p-3"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
              <div><p className="text-xs text-muted-foreground">Alertas Ruptura</p><p className="text-2xl font-bold">{alertasEstoque.length}</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Giro por Categoria */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Giro de Estoque por Categoria (30d)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={giroPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="categoria" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip />
                  <Bar dataKey="giro" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Giro" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição Valor */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Valor Imobilizado por Categoria</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={distribuicaoValor} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {distribuicaoValor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Ruptura */}
        {alertasEstoque.length > 0 && (
          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" /> Produtos com Estoque Crítico (&lt;10 un)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {alertasEstoque.map((p: any) => (
                  <Badge key={p.id} variant="destructive" className="text-sm">
                    {p.nome}: {p.estoque ?? 0} un
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Curva ABC */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Curva ABC — Últimos 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Vendas (un)</TableHead>
                    <TableHead className="text-center">Faturamento</TableHead>
                    <TableHead className="text-center">% Acumulado</TableHead>
                    <TableHead className="text-center">Classe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {curvaABC.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sem dados de vendas nos últimos 30 dias</TableCell></TableRow>
                  ) : curvaABC.slice(0, 20).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell className="text-center">{item.quantidade}</TableCell>
                      <TableCell className="text-center">R$ {item.valor.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-center">{item.percentual}%</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.classe === "A" ? "default" : item.classe === "B" ? "secondary" : "outline"}>
                          {item.classe}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
