import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Loader2, ArrowUpRight, ArrowDownRight, BarChart3, FileDown, Printer } from "lucide-react";
import { exportDREtoPdf, handlePrint } from "@/services/reportPdfService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { getBrasiliaDate } from "@/lib/utils";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DRELine {
  categoria: string;
  valores: number[];
  tipo: string;
}

const mesesOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2025, i, 1), "MMMM", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase()),
}));

export default function DRE({ embedded = false }: { embedded?: boolean }) {
  const { unidadeAtual } = useUnidade();
  const [loading, setLoading] = useState(true);
  const [dre, setDre] = useState<DRELine[]>([]);
  const [meses, setMeses] = useState<string[]>([]);
  const now = new Date();
  const [periodoMeses, setPeriodoMeses] = useState("3");

  useEffect(() => { fetchData(); }, [unidadeAtual, periodoMeses]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const hoje = getBrasiliaDate();
      const qtdMeses = Number(periodoMeses);
      const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const mesesCalc: string[] = [];
      const receitaBruta: number[] = [];
      const cmv: number[] = [];
      const despOp: number[] = [];
      const despAdmin: number[] = [];
      const despPessoal: number[] = [];
      const despFin: number[] = [];

      for (let i = qtdMeses - 1; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const inicio = startOfMonth(d).toISOString();
        const fim = endOfMonth(d).toISOString();
        const inicioDate = format(d, "yyyy-MM-dd");
        const fimDate = format(endOfMonth(d), "yyyy-MM-dd");
        mesesCalc.push(`${nomesMeses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`);

        // Fetch all in parallel
        let pq = supabase.from("pedidos").select("valor_total").gte("created_at", inicio).lte("created_at", fim).neq("status", "cancelado");
        if (unidadeAtual?.id) pq = pq.eq("unidade_id", unidadeAtual.id);

        let dq = supabase.from("movimentacoes_bancarias").select("valor, categoria").eq("tipo", "saida").gte("data", inicioDate).lte("data", fimDate);
        if (unidadeAtual?.id) dq = dq.eq("unidade_id", unidadeAtual.id);

        let cpq = supabase.from("contas_pagar").select("valor, categoria").eq("status", "pago").gte("vencimento", inicioDate).lte("vencimento", fimDate);
        if (unidadeAtual?.id) cpq = cpq.eq("unidade_id", unidadeAtual.id);

        const [{ data: pedidos }, { data: despesasBanco }, { data: contasPagas }] = await Promise.all([pq, dq, cpq]);

        receitaBruta.push(pedidos?.reduce((s, p) => s + (p.valor_total || 0), 0) || 0);

        const todasDespesas = [
          ...(despesasBanco || []).map(d => ({ categoria: d.categoria, valor: Number(d.valor) })),
          ...(contasPagas || []).map(d => ({ categoria: (d as any).categoria, valor: Number(d.valor) })),
        ];

        let op = 0, admin = 0, pessoal = 0, fin = 0, custo = 0;
        todasDespesas.forEach(d => {
          const cat = (d.categoria || "").toLowerCase();
          const val = d.valor || 0;
          if (cat.includes("mercadoria") || cat.includes("compra") || cat.includes("estoque")) custo += val;
          else if (cat.includes("pessoal") || cat.includes("salário") || cat.includes("salario")) pessoal += val;
          else if (cat.includes("financ")) fin += val;
          else if (cat.includes("admin")) admin += val;
          else op += val;
        });
        cmv.push(custo);
        despOp.push(op);
        despAdmin.push(admin);
        despPessoal.push(pessoal);
        despFin.push(fin);
      }

      setMeses(mesesCalc);

      const deducoes = receitaBruta.map(r => r * 0.05);
      const receitaLiquida = receitaBruta.map((r, i) => r - deducoes[i]);
      const lucroBruto = receitaLiquida.map((r, i) => r - cmv[i]);
      const lucroOp = lucroBruto.map((r, i) => r - despOp[i] - despAdmin[i] - despPessoal[i]);
      const lucroLiquido = lucroOp.map((r, i) => r - despFin[i]);

      setDre([
        { categoria: "Receita Bruta", valores: receitaBruta, tipo: "receita" },
        { categoria: "(-) Deduções (5%)", valores: deducoes.map(v => -v), tipo: "deducao" },
        { categoria: "Receita Líquida", valores: receitaLiquida, tipo: "subtotal" },
        { categoria: "(-) CMV", valores: cmv.map(v => -v), tipo: "custo" },
        { categoria: "Lucro Bruto", valores: lucroBruto, tipo: "subtotal" },
        { categoria: "(-) Desp. Operacionais", valores: despOp.map(v => -v), tipo: "despesa" },
        { categoria: "(-) Desp. Administrativas", valores: despAdmin.map(v => -v), tipo: "despesa" },
        { categoria: "(-) Desp. com Pessoal", valores: despPessoal.map(v => -v), tipo: "despesa" },
        { categoria: "Lucro Operacional", valores: lucroOp, tipo: "subtotal" },
        { categoria: "(-) Desp. Financeiras", valores: despFin.map(v => -v), tipo: "despesa" },
        { categoria: "Lucro Líquido", valores: lucroLiquido, tipo: "resultado" },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    const formatted = Math.abs(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    return value < 0 ? `(${formatted})` : formatted;
  };

  const getRowClass = (tipo: string) => {
    switch (tipo) {
      case "subtotal": return "bg-muted/50 font-medium";
      case "resultado": return "bg-primary/10 font-bold text-base";
      case "receita": return "font-medium";
      default: return "text-sm";
    }
  };

  if (loading) {
    const loader = <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    if (embedded) return loader;
    return (
      <MainLayout>
        <Header title="DRE" subtitle="Demonstrativo de Resultados do Exercício" />
        {loader}
      </MainLayout>
    );
  }

  const totalReceita = dre.find(d => d.categoria === "Receita Bruta")?.valores.reduce((s, v) => s + v, 0) || 0;
  const totalLucro = dre.find(d => d.categoria === "Lucro Líquido")?.valores.reduce((s, v) => s + v, 0) || 0;
  const totalDesp = Math.abs(totalReceita - totalLucro);
  const margemLiquida = totalReceita > 0 ? (totalLucro / totalReceita) * 100 : 0;

  // Chart data: lucro líquido por mês
  const chartData = meses.map((mes, i) => {
    const lucro = dre.find(d => d.categoria === "Lucro Líquido")?.valores[i] || 0;
    const receita = dre.find(d => d.categoria === "Receita Bruta")?.valores[i] || 0;
    return { mes, lucro, receita };
  });

  // Waterfall chart data
  const waterfallData = [
    { name: "Receita", value: totalReceita, fill: "hsl(152, 69%, 40%)" },
    { name: "Deduções", value: -(dre.find(d => d.tipo === "deducao")?.valores.reduce((s, v) => s + Math.abs(v), 0) || 0), fill: "hsl(0, 72%, 51%)" },
    { name: "CMV", value: -(dre.find(d => d.tipo === "custo")?.valores.reduce((s, v) => s + Math.abs(v), 0) || 0), fill: "hsl(0, 72%, 51%)" },
    { name: "Desp. Op.", value: -(dre.filter(d => d.tipo === "despesa").reduce((s, d) => s + d.valores.reduce((a, v) => a + Math.abs(v), 0), 0)), fill: "hsl(0, 72%, 51%)" },
    { name: "Resultado", value: totalLucro, fill: totalLucro >= 0 ? "hsl(152, 69%, 40%)" : "hsl(0, 72%, 51%)" },
  ];

  const content = (
    <div className="space-y-6">
      {/* Filtro de período */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={periodoMeses} onValueChange={setPeriodoMeses}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {meses[0]} a {meses[meses.length - 1]}
        </Badge>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportDREtoPdf(dre, meses, `${meses[0]} a ${meses[meses.length - 1]}`)}>
            <FileDown className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-4 w-4 text-green-600" /></div>
            </div>
            <p className="text-xl font-bold tabular-nums">{(totalReceita / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">Receita Acumulada</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent pointer-events-none" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-destructive/10"><TrendingDown className="h-4 w-4 text-destructive" /></div>
            </div>
            <p className="text-xl font-bold tabular-nums">{(totalDesp / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">Custos + Despesas</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${totalLucro >= 0 ? "from-primary/5" : "from-destructive/5"} to-transparent pointer-events-none`} />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-2 rounded-lg ${totalLucro >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                <DollarSign className={`h-4 w-4 ${totalLucro >= 0 ? "text-primary" : "text-destructive"}`} />
              </div>
            </div>
            <p className={`text-xl font-bold tabular-nums ${totalLucro >= 0 ? "text-green-600" : "text-destructive"}`}>
              {(totalLucro / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-muted-foreground">Lucro Líquido</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-blue-500/10">
                {margemLiquida >= 0 ? <ArrowUpRight className="h-4 w-4 text-blue-600" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            <p className={`text-xl font-bold tabular-nums ${margemLiquida >= 0 ? "" : "text-destructive"}`}>
              {margemLiquida.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Margem Líquida</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Lucro por Mês */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Lucro Líquido por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Lucro"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Bar dataKey="lucro" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.lucro >= 0 ? "hsl(152, 69%, 40%)" : "hsl(0, 72%, 51%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Composição do Resultado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Composição do Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={waterfallData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={75} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, ""]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {waterfallData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela DRE */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Demonstrativo Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px] sticky left-0 bg-card z-10">Descrição</TableHead>
                  {meses.map(m => <TableHead key={m} className="text-right min-w-[100px]">{m}</TableHead>)}
                  <TableHead className="text-right min-w-[110px] font-bold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dre.map((item, index) => {
                  const total = item.valores.reduce((s, v) => s + v, 0);
                  return (
                    <TableRow key={index} className={getRowClass(item.tipo)}>
                      <TableCell className="sticky left-0 bg-card z-10">{item.categoria}</TableCell>
                      {item.valores.map((v, i) => (
                        <TableCell key={i} className={`text-right tabular-nums ${v < 0 ? "text-destructive" : ""}`}>
                          {formatCurrency(v)}
                        </TableCell>
                      ))}
                      <TableCell className={`text-right tabular-nums font-semibold ${total < 0 ? "text-destructive" : ""}`}>
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (embedded) return content;
  return (
    <MainLayout>
      <Header title="DRE" subtitle="Demonstrativo de Resultados do Exercício" />
      <div className="p-4 md:p-6">{content}</div>
    </MainLayout>
  );
}
