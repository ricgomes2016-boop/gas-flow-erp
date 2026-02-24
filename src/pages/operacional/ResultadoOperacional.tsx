import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Target, Plus, Trash2, Settings2, BarChart3, FileDown, Printer } from "lucide-react";
import { exportROtoPdf, handlePrint } from "@/services/reportPdfService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface CustoItem {
  id: string;
  nome: string;
  valor: number;
  valorReal: number;
  grupo: string;
  tipo: string;
}

interface CanalVenda {
  canal: string;
  qtde: number;
  precoVenda: number;
  totalRS: number;
  precoCompra: number;
  margemRS: number;
  tonelagem: number;
}

const mesesOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2025, i, 1), "MMMM", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase()),
}));

const grupoLabels: Record<string, string> = {
  custos_fixos: "Custos Fixos",
  pessoal: "Pessoal",
  operacional: "Operacional",
  comercial: "Comercial",
  administrativo: "Administrativo",
  financeiro: "Financeiro",
  impostos: "Impostos",
  diversos: "Diversos",
};

const COLORS = [
  "hsl(187, 65%, 38%)",
  "hsl(215, 90%, 52%)",
  "hsl(152, 69%, 40%)",
  "hsl(45, 93%, 47%)",
  "hsl(0, 72%, 51%)",
  "hsl(270, 60%, 55%)",
  "hsl(30, 80%, 50%)",
  "hsl(190, 80%, 45%)",
];

export default function ResultadoOperacional({ embedded = false }: { embedded?: boolean }) {
  const { unidadeAtual } = useUnidade();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(String(now.getMonth()));
  const [anoSelecionado, setAnoSelecionado] = useState(String(now.getFullYear()));
  const [custos, setCustos] = useState<CustoItem[]>([]);
  const [canais, setCanais] = useState<CanalVenda[]>([]);
  const [novoCusto, setNovoCusto] = useState({ nome: "", valor: "" });
  const [precoCompraP13, setPrecoCompraP13] = useState(0);
  const [precoVendaP13, setPrecoVendaP13] = useState(0);

  useEffect(() => { fetchData(); }, [unidadeAtual, mesSelecionado, anoSelecionado]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const mes = Number(mesSelecionado);
      const ano = Number(anoSelecionado);
      const inicio = startOfMonth(new Date(ano, mes, 1)).toISOString();
      const fim = endOfMonth(new Date(ano, mes, 1)).toISOString();

      const inicioDate = format(new Date(ano, mes, 1), "yyyy-MM-dd");
      const fimDate = format(endOfMonth(new Date(ano, mes, 1)), "yyyy-MM-dd");

      const [
        { data: categorias },
        pedidosRes,
        contasPagarRes,
        { data: produtos },
      ] = await Promise.all([
        supabase.from("categorias_despesa").select("*").eq("ativo", true).order("ordem"),
        (() => {
          let q = supabase.from("pedidos")
            .select("id, valor_total, canal_venda, created_at, status, pedido_itens(quantidade, preco_unitario, produto_id)")
            .gte("created_at", inicio).lte("created_at", fim).neq("status", "cancelado");
          if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
          return q;
        })(),
        (() => {
          let q = supabase.from("contas_pagar")
            .select("valor, categoria, descricao, status")
            .eq("status", "pago")
            .gte("vencimento", inicioDate).lte("vencimento", fimDate);
          if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
          return q;
        })(),
        supabase.from("produtos").select("id, nome, preco, preco_custo"),
      ]);

      const pedidos = pedidosRes.data || [];
      const contasPagar = contasPagarRes.data || [];

      // Agrupa todas as contas pagas por categoria
      const cpPorCategoria: Record<string, number> = {};
      contasPagar.forEach(cp => {
        const cat = (cp.categoria || cp.descricao || "Diversos").toString().toLowerCase().trim();
        cpPorCategoria[cat] = (cpPorCategoria[cat] || 0) + (Number(cp.valor) || 0);
      });

      // Mapeia cada categoria de despesa cadastrada ao valor real vindo de contas_pagar
      const custosCalculados: CustoItem[] = ((categorias || []) as any[]).map(cat => {
        let valorReal = 0;
        const nomeLC = cat.nome.toLowerCase().trim();

        // Busca correspondência na tabela contas_pagar pela categoria
        for (const [cpCat, val] of Object.entries(cpPorCategoria)) {
          // Match exato ou parcial (primeiros 5 chars ou contém)
          if (
            cpCat === nomeLC ||
            cpCat.includes(nomeLC) ||
            nomeLC.includes(cpCat) ||
            (nomeLC.length >= 5 && cpCat.includes(nomeLC.substring(0, 5))) ||
            (cpCat.length >= 5 && nomeLC.includes(cpCat.substring(0, 5)))
          ) {
            valorReal += val;
          }
        }

        return { id: cat.id, nome: cat.nome, valor: valorReal || cat.valor_padrao || 0, valorReal, grupo: cat.grupo, tipo: cat.tipo };
      });

      setCustos(custosCalculados);

      const produtoMap = new Map((produtos || []).map(p => [p.id, { nome: p.nome, preco: Number(p.preco) || 0, precoCusto: Number((p as any).preco_custo) || 0 }]));
      const p13 = (produtos || []).find(p => p.nome?.toLowerCase().includes("p13") || p.nome?.toLowerCase().includes("13kg"));
      if (p13) {
        const custoProduto = Number((p13 as any).preco_custo) || 0;
        setPrecoCompraP13(custoProduto > 0 ? custoProduto : Number(p13.preco) * 0.7);
        setPrecoVendaP13(Number(p13.preco) || 0);
      }

      const canalMap: Record<string, { qtde: number; totalRS: number; custoTotal: number; tonelagem: number }> = {};
      pedidos.forEach(pedido => {
        const canal = pedido.canal_venda || "Venda Direta";
        if (!canalMap[canal]) canalMap[canal] = { qtde: 0, totalRS: 0, custoTotal: 0, tonelagem: 0 };
        canalMap[canal].totalRS += Number(pedido.valor_total) || 0;
        (pedido.pedido_itens || []).forEach((item: any) => {
          const prod = produtoMap.get(item.produto_id);
          const qty = item.quantidade || 0;
          canalMap[canal].qtde += qty;
          // Usa preco_custo real quando disponível, senão estima 70% do preço de venda
          const custoUnit = prod?.precoCusto && prod.precoCusto > 0 ? prod.precoCusto : (prod?.preco || 0) * 0.7;
          canalMap[canal].custoTotal += qty * custoUnit;
          const nomeProd = prod?.nome?.toLowerCase() || "";
          if (nomeProd.includes("p13") || nomeProd.includes("13kg")) canalMap[canal].tonelagem += qty * 13 / 1000;
          else if (nomeProd.includes("p45") || nomeProd.includes("45kg")) canalMap[canal].tonelagem += qty * 45 / 1000;
          else if (nomeProd.includes("p20") || nomeProd.includes("20kg")) canalMap[canal].tonelagem += qty * 20 / 1000;
          else if (nomeProd.includes("p05") || nomeProd.includes("5kg")) canalMap[canal].tonelagem += qty * 5 / 1000;
        });
      });

      setCanais(Object.entries(canalMap).map(([canal, d]) => ({
        canal, qtde: d.qtde,
        precoVenda: d.qtde > 0 ? d.totalRS / d.qtde : 0,
        totalRS: d.totalRS,
        precoCompra: d.qtde > 0 ? d.custoTotal / d.qtde : 0,
        margemRS: d.totalRS - d.custoTotal,
        tonelagem: Number(d.tonelagem.toFixed(2)),
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarCusto = () => {
    if (!novoCusto.nome) return;
    setCustos(prev => [...prev, { id: String(Date.now()), nome: novoCusto.nome, valor: Number(novoCusto.valor) || 0, valorReal: 0, grupo: "diversos", tipo: "variavel" }]);
    setNovoCusto({ nome: "", valor: "" });
  };
  const handleRemoverCusto = (id: string) => setCustos(prev => prev.filter(c => c.id !== id));
  const handleCustoChange = (id: string, valor: number) => setCustos(prev => prev.map(c => c.id === id ? { ...c, valor } : c));

  const totalCustos = custos.reduce((s, c) => s + c.valor, 0);
  const totalQtde = canais.reduce((s, c) => s + c.qtde, 0);
  const receitaBruta = canais.reduce((s, c) => s + c.totalRS, 0);
  const custoMatPrima = canais.reduce((s, c) => s + (c.precoCompra * c.qtde), 0);
  const lucroBruto = receitaBruta - custoMatPrima;
  const lucroLiquido = lucroBruto - totalCustos;
  const totalTonelagem = canais.reduce((s, c) => s + c.tonelagem, 0);
  const margemContribuicaoUnit = totalQtde > 0 ? (receitaBruta - custoMatPrima) / totalQtde : 0;
  const pontoEquilibrio = margemContribuicaoUnit > 0 ? Math.ceil(totalCustos / margemContribuicaoUnit) : 0;
  const mesLabel = format(new Date(Number(anoSelecionado), Number(mesSelecionado), 1), "MMMM yyyy", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase());

  const custosAgrupados = Object.entries(grupoLabels).reduce((acc, [key, label]) => {
    const items = custos.filter(c => c.grupo === key);
    if (items.length > 0) acc.push({ key, label, items, total: items.reduce((s, c) => s + c.valor, 0) });
    return acc;
  }, [] as { key: string; label: string; items: CustoItem[]; total: number }[]);

  // Chart data for DRE waterfall
  const dreBarData = [
    { name: "Receita", value: receitaBruta },
    { name: "Mat. Prima", value: -custoMatPrima },
    ...custosAgrupados.map(g => ({ name: g.label.substring(0, 10), value: -g.total })),
    { name: "Resultado", value: lucroLiquido },
  ];

  // Pie data for channel share
  const pieData = canais.map((c, i) => ({
    name: c.canal,
    value: c.totalRS,
    fill: COLORS[i % COLORS.length],
  }));

  if (loading) {
    const loader = <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    if (embedded) return loader;
    return (
      <MainLayout>
        <Header title="Resultado Operacional" subtitle={mesLabel} />
        {loader}
      </MainLayout>
    );
  }

  const content = (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Mês" /></SelectTrigger>
          <SelectContent>
            {mesesOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
          <SelectTrigger className="w-28"><SelectValue placeholder="Ano" /></SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => navigate("/config/categorias-despesa")}>
          <Settings2 className="h-4 w-4 mr-2" /> Categorias
        </Button>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportROtoPdf(receitaBruta, custoMatPrima, lucroBruto, lucroLiquido, totalCustos, custosAgrupados, canais, mesLabel)}>
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
              <div className="p-2 rounded-lg bg-green-500/10"><DollarSign className="h-4 w-4 text-green-600" /></div>
            </div>
            <p className="text-xl font-bold tabular-nums">R$ {receitaBruta.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground">Receita Bruta</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
            </div>
            <p className="text-xl font-bold tabular-nums">R$ {lucroBruto.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground">Lucro Bruto</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${lucroLiquido >= 0 ? "from-green-500/5" : "from-destructive/5"} to-transparent pointer-events-none`} />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-2 rounded-lg ${lucroLiquido >= 0 ? "bg-green-500/10" : "bg-destructive/10"}`}>
                {lucroLiquido >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            <p className={`text-xl font-bold tabular-nums ${lucroLiquido >= 0 ? "text-green-600" : "text-destructive"}`}>
              R$ {lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">Resultado</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-blue-500/10"><Target className="h-4 w-4 text-blue-500" /></div>
            </div>
            <p className="text-xl font-bold tabular-nums">{pontoEquilibrio} un.</p>
            <p className="text-xs text-muted-foreground">Ponto de Equilíbrio</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Waterfall DRE + Canais Pie */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Composição do Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dreBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value: number) => [`R$ ${Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, ""]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {dreBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.value >= 0 ? "hsl(152, 69%, 40%)" : "hsl(0, 72%, 51%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Sem dados</p>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full">
                  {pieData.map((cat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs truncate">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.fill }} />
                      <span className="truncate text-muted-foreground">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Custos / Despesas agrupados */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Custos / Despesas</CardTitle>
              <Badge variant="outline" className="text-destructive">
                Total: R$ {totalCustos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right w-32">Valor (R$)</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {custosAgrupados.map(grupo => (
                    <>
                      <TableRow key={grupo.key} className="bg-muted/30">
                        <TableCell colSpan={2} className="py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {grupo.label}
                        </TableCell>
                        <TableCell className="py-1 text-right text-xs font-bold text-muted-foreground">
                          R$ {grupo.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                      {grupo.items.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="py-1.5 text-sm">
                            <div className="flex items-center gap-1.5">
                              {c.nome}
                              {c.valorReal > 0 && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-500/10 text-green-700 border-green-200">
                                  auto
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 text-right">
                            <Input
                              type="number"
                              value={c.valor || ""}
                              onChange={(e) => handleCustoChange(c.id, Number(e.target.value))}
                              className="h-7 text-right text-sm w-28 ml-auto tabular-nums"
                            />
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoverCusto(c.id)}>
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                  <TableRow className="bg-muted/50 font-bold border-t-2">
                    <TableCell className="py-2">Total Geral</TableCell>
                    <TableCell className="py-2 text-right text-destructive tabular-nums">
                      R$ {totalCustos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-2 mt-3">
              <Input placeholder="Novo custo" value={novoCusto.nome} onChange={e => setNovoCusto(p => ({ ...p, nome: e.target.value }))} className="h-8 text-sm" />
              <Input type="number" placeholder="Valor" value={novoCusto.valor} onChange={e => setNovoCusto(p => ({ ...p, valor: e.target.value }))} className="h-8 text-sm w-28" />
              <Button size="sm" variant="outline" className="h-8" onClick={handleAdicionarCusto}><Plus className="h-3 w-3" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Vendas por Canal */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Vendas por Canal</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead className="text-right">Qtde</TableHead>
                    <TableHead className="text-right hidden md:table-cell">P. Venda</TableHead>
                    <TableHead className="text-right">Total R$</TableHead>
                    <TableHead className="text-right hidden md:table-cell">MC R$</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {canais.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhuma venda no período</TableCell></TableRow>
                  ) : canais.map(c => (
                    <TableRow key={c.canal}>
                      <TableCell className="py-1.5 text-sm font-medium">{c.canal}</TableCell>
                      <TableCell className="py-1.5 text-right text-sm tabular-nums">{c.qtde}</TableCell>
                      <TableCell className="py-1.5 text-right text-sm tabular-nums hidden md:table-cell">{c.precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="py-1.5 text-right text-sm tabular-nums">{c.totalRS.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="py-1.5 text-right text-sm tabular-nums hidden md:table-cell text-green-600">{c.margemRS.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                  {canais.length > 0 && (
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell className="py-2">Total</TableCell>
                      <TableCell className="py-2 text-right tabular-nums">{totalQtde}</TableCell>
                      <TableCell className="py-2 hidden md:table-cell"></TableCell>
                      <TableCell className="py-2 text-right tabular-nums">{receitaBruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="py-2 text-right hidden md:table-cell text-green-600 tabular-nums">{(receitaBruta - custoMatPrima).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Demonstrativo de Resultado</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Receita Bruta</TableCell>
                  <TableCell className="text-right font-bold tabular-nums">R$ {receitaBruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-destructive">(-) Custo Mat. Prima</TableCell>
                  <TableCell className="text-right text-destructive tabular-nums">R$ {custoMatPrima.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/30">
                  <TableCell className="font-bold">= Lucro Bruto</TableCell>
                  <TableCell className="text-right font-bold tabular-nums">R$ {lucroBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
                {custosAgrupados.map(g => (
                  <TableRow key={g.key}>
                    <TableCell className="font-medium text-destructive text-sm">(-) {g.label}</TableCell>
                    <TableCell className="text-right text-destructive text-sm tabular-nums">R$ {g.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
                <TableRow className={lucroLiquido >= 0 ? "bg-green-500/5" : "bg-destructive/5"}>
                  <TableCell className="font-bold text-lg">Resultado</TableCell>
                  <TableCell className={`text-right font-bold text-lg tabular-nums ${lucroLiquido >= 0 ? "text-green-600" : "text-destructive"}`}>
                    R$ {lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <span className="text-sm font-medium">Ponto de Equilíbrio</span>
              <span className="text-lg font-bold text-primary tabular-nums">{pontoEquilibrio.toLocaleString("pt-BR")} un.</span>
            </div>
          </CardContent>
        </Card>

        {/* Dados Referência */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Indicadores de Referência</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 flex flex-col justify-between min-h-[72px]">
                <p className="text-xs text-muted-foreground">Preço Compra P13</p>
                <p className="font-bold tabular-nums mt-1">R$ {precoCompraP13.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {precoCompraP13 > 0 && precoVendaP13 > 0 && precoCompraP13 !== precoVendaP13 * 0.7 ? "Cadastro de produtos" : "Estimado (70% venda)"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 flex flex-col justify-between min-h-[72px]">
                <p className="text-xs text-muted-foreground">Preço Venda P13</p>
                <p className="font-bold tabular-nums mt-1">R$ {precoVendaP13.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Cadastro de produtos</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 flex flex-col justify-between min-h-[72px]">
                <p className="text-xs text-muted-foreground">Margem Bruta P13</p>
                <p className="font-bold text-green-600 tabular-nums mt-1">R$ {(precoVendaP13 - precoCompraP13).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {precoVendaP13 > 0 ? `${((1 - precoCompraP13 / precoVendaP13) * 100).toFixed(1)}% de margem` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 flex flex-col justify-between min-h-[72px]">
                <p className="text-xs text-muted-foreground">Tonelagem Total</p>
                <p className="font-bold tabular-nums mt-1">{totalTonelagem.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ton</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Pedidos do período</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 flex flex-col justify-between min-h-[72px]">
                <p className="text-xs text-muted-foreground">Margem Líquida</p>
                <p className={`font-bold tabular-nums mt-1 ${lucroLiquido >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {receitaBruta > 0 ? ((lucroLiquido / receitaBruta) * 100).toFixed(1) : "0.0"}%
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Lucro / Receita</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 flex flex-col justify-between min-h-[72px]">
                <p className="text-xs text-muted-foreground">Ticket Médio</p>
                <p className="font-bold tabular-nums mt-1">
                  R$ {totalQtde > 0 ? (receitaBruta / totalQtde).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Receita / Qtde vendida</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (embedded) return content;
  return (
    <MainLayout>
      <Header title="Resultado Operacional" subtitle={mesLabel} />
      <div className="p-3 md:p-6">{content}</div>
    </MainLayout>
  );
}
