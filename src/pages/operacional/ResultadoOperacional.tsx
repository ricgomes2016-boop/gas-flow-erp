import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Target, Plus, Trash2, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface CustoItem {
  id: string;
  nome: string;
  valor: number;
  valorReal: number; // valor buscado do sistema
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

export default function ResultadoOperacional() {
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

      // Fetch all in parallel
      const [
        { data: categorias },
        pedidosRes,
        despesasRes,
        funcionariosRes,
        abastecimentosRes,
        manutencoesRes,
        { data: produtos },
        comissoesRes,
        conferenciasRes,
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
          let q = supabase.from("movimentacoes_caixa")
            .select("valor, categoria, descricao, tipo")
            .eq("tipo", "saida")
            .gte("created_at", inicio).lte("created_at", fim);
          if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
          return q;
        })(),
        (() => {
          let q = supabase.from("funcionarios").select("salario").eq("ativo", true);
          if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
          return q;
        })(),
        (() => {
          let q = supabase.from("abastecimentos").select("valor").gte("created_at", inicio).lte("created_at", fim);
          if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
          return q;
        })(),
        (() => {
          let q = supabase.from("manutencoes").select("valor").gte("created_at", inicio).lte("created_at", fim);
          if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
          return q;
        })(),
        supabase.from("produtos").select("id, nome, preco"),
        (() => {
          let q = supabase.from("bonus").select("valor").gte("created_at", inicio).lte("created_at", fim);
          if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
          return q;
        })(),
        (() => {
          let q = supabase.from("conferencia_cartao").select("valor_taxa").gte("created_at", inicio).lte("created_at", fim);
          if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
          return q;
        })(),
      ]);

      const pedidos = pedidosRes.data || [];
      const despesas = despesasRes.data || [];
      const funcionarios = funcionariosRes.data || [];
      const abastecimentos = abastecimentosRes.data || [];
      const manutencoes = manutencoesRes.data || [];
      const bonus = comissoesRes.data || [];
      const conferencias = conferenciasRes.data || [];

      // Calculate real values from system
      const totalSalarios = funcionarios.reduce((s, f) => s + (Number(f.salario) || 0), 0);
      const totalCombustivel = abastecimentos.reduce((s, a) => s + (Number(a.valor) || 0), 0);
      const totalManutencao = manutencoes.reduce((s, m) => s + (Number(m.valor) || 0), 0);
      const totalBonus = bonus.reduce((s, b) => s + (Number(b.valor) || 0), 0);
      const totalTaxasCartao = conferencias.reduce((s, c) => s + (Number(c.valor_taxa) || 0), 0);

      // Map despesas by categoria name (lowercase matching)
      const despesasPorCategoria: Record<string, number> = {};
      despesas.forEach(d => {
        const cat = (d.categoria || d.descricao || "Diversos").toLowerCase();
        despesasPorCategoria[cat] = (despesasPorCategoria[cat] || 0) + (Number(d.valor) || 0);
      });

      // Build custos from categorias_despesa table with real system values
      const custosCalculados: CustoItem[] = ((categorias || []) as any[]).map(cat => {
        let valorReal = 0;
        const nomeLC = cat.nome.toLowerCase();

        // Auto-fill from system data
        if (nomeLC.includes("salário") || nomeLC === "salários") {
          valorReal = totalSalarios;
        } else if (nomeLC.includes("combustível") || nomeLC.includes("combustivel")) {
          valorReal = totalCombustivel;
        } else if (nomeLC.includes("manutenção") || nomeLC.includes("manutencao") || nomeLC.includes("manut")) {
          valorReal = totalManutencao;
        } else if (nomeLC.includes("premiação") || nomeLC.includes("bônus") || nomeLC.includes("bonus")) {
          valorReal = totalBonus;
        } else if (nomeLC.includes("taxa") && nomeLC.includes("cartão") || nomeLC.includes("maquininha")) {
          valorReal = totalTaxasCartao;
        } else {
          // Try to match from movimentacoes_caixa categories
          for (const [despCat, val] of Object.entries(despesasPorCategoria)) {
            if (despCat.includes(nomeLC.split("/")[0].trim().substring(0, 5)) ||
                nomeLC.includes(despCat.substring(0, 5))) {
              valorReal = val;
              break;
            }
          }
        }

        return {
          id: cat.id,
          nome: cat.nome,
          valor: valorReal || cat.valor_padrao || 0,
          valorReal,
          grupo: cat.grupo,
          tipo: cat.tipo,
        };
      });

      setCustos(custosCalculados);

      // Product map
      const produtoMap = new Map(
        (produtos || []).map(p => [p.id, { nome: p.nome, preco: Number(p.preco) || 0 }])
      );

      const p13 = (produtos || []).find(p => p.nome?.toLowerCase().includes("p13") || p.nome?.toLowerCase().includes("13kg"));
      if (p13) {
        setPrecoCompraP13(Number(p13.preco) * 0.7);
        setPrecoVendaP13(Number(p13.preco) || 0);
      }

      // Group sales by channel
      const canalMap: Record<string, { qtde: number; totalRS: number; custoTotal: number; tonelagem: number }> = {};
      pedidos.forEach(pedido => {
        const canal = pedido.canal_venda || "Venda Direta";
        if (!canalMap[canal]) canalMap[canal] = { qtde: 0, totalRS: 0, custoTotal: 0, tonelagem: 0 };
        canalMap[canal].totalRS += Number(pedido.valor_total) || 0;

        (pedido.pedido_itens || []).forEach((item: any) => {
          const prod = produtoMap.get(item.produto_id);
          const qty = item.quantidade || 0;
          canalMap[canal].qtde += qty;
          canalMap[canal].custoTotal += qty * (prod?.preco || 0) * 0.7;
          const nomeProd = prod?.nome?.toLowerCase() || "";
          if (nomeProd.includes("p13") || nomeProd.includes("13kg")) canalMap[canal].tonelagem += qty * 13 / 1000;
          else if (nomeProd.includes("p45") || nomeProd.includes("45kg")) canalMap[canal].tonelagem += qty * 45 / 1000;
          else if (nomeProd.includes("p20") || nomeProd.includes("20kg")) canalMap[canal].tonelagem += qty * 20 / 1000;
          else if (nomeProd.includes("p05") || nomeProd.includes("5kg")) canalMap[canal].tonelagem += qty * 5 / 1000;
        });
      });

      setCanais(Object.entries(canalMap).map(([canal, d]) => ({
        canal,
        qtde: d.qtde,
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

  // Calculations
  const totalCustos = custos.reduce((s, c) => s + c.valor, 0);
  const totalQtde = canais.reduce((s, c) => s + c.qtde, 0);
  const receitaBruta = canais.reduce((s, c) => s + c.totalRS, 0);
  const custoMatPrima = canais.reduce((s, c) => s + (c.precoCompra * c.qtde), 0);
  const lucroBruto = receitaBruta - custoMatPrima;
  const lucroLiquido = lucroBruto - totalCustos;
  const totalTonelagem = canais.reduce((s, c) => s + c.tonelagem, 0);
  const margemContribuicaoUnit = totalQtde > 0 ? (receitaBruta - custoMatPrima) / totalQtde : 0;
  const pontoEquilibrio = margemContribuicaoUnit > 0 ? Math.ceil(totalCustos / margemContribuicaoUnit) : 0;
  const totalCanaisQtde = canais.reduce((s, c) => s + c.qtde, 0);
  const mesLabel = format(new Date(Number(anoSelecionado), Number(mesSelecionado), 1), "MMMM yyyy", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase());

  // Group custos by grupo
  const custosAgrupados = Object.entries(grupoLabels).reduce((acc, [key, label]) => {
    const items = custos.filter(c => c.grupo === key);
    if (items.length > 0) acc.push({ key, label, items, total: items.reduce((s, c) => s + c.valor, 0) });
    return acc;
  }, [] as { key: string; label: string; items: CustoItem[]; total: number }[]);

  if (loading) {
    return (
      <MainLayout>
        <Header title="Resultado Operacional" subtitle={mesLabel} />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header title="Resultado Operacional" subtitle={mesLabel} />
      <div className="p-3 md:p-6 space-y-6">
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
        </div>

        {/* KPIs */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10"><DollarSign className="h-5 w-5 text-green-500" /></div>
                <div className="min-w-0">
                  <p className="text-lg md:text-xl font-bold truncate">R$ {receitaBruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">Receita Bruta</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
                <div className="min-w-0">
                  <p className="text-lg md:text-xl font-bold truncate">R$ {lucroBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">Lucro Bruto</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${lucroLiquido >= 0 ? "bg-green-500/10" : "bg-destructive/10"}`}>
                  {lucroLiquido >= 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
                </div>
                <div className="min-w-0">
                  <p className={`text-lg md:text-xl font-bold truncate ${lucroLiquido >= 0 ? "text-green-600" : "text-destructive"}`}>
                    R$ {lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Resultado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10"><Target className="h-5 w-5 text-blue-500" /></div>
                <div className="min-w-0">
                  <p className="text-lg md:text-xl font-bold truncate">{pontoEquilibrio} un.</p>
                  <p className="text-xs text-muted-foreground">Ponto de Equilíbrio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Custos / Despesas agrupados */}
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
                                className="h-7 text-right text-sm w-28 ml-auto"
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
                      <TableCell className="py-2 text-right text-destructive">
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
                      <TableHead className="text-right hidden md:table-cell">Preço Venda</TableHead>
                      <TableHead className="text-right">Total R$</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">Preço Compra</TableHead>
                      <TableHead className="text-right hidden md:table-cell">MC R$</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">Ton.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {canais.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Nenhuma venda no período</TableCell></TableRow>
                    ) : canais.map(c => (
                      <TableRow key={c.canal}>
                        <TableCell className="py-1.5 text-sm font-medium">{c.canal}</TableCell>
                        <TableCell className="py-1.5 text-right text-sm">{c.qtde}</TableCell>
                        <TableCell className="py-1.5 text-right text-sm hidden md:table-cell">{c.precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="py-1.5 text-right text-sm">{c.totalRS.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="py-1.5 text-right text-sm hidden lg:table-cell">{c.precoCompra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="py-1.5 text-right text-sm hidden md:table-cell text-green-600">{c.margemRS.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="py-1.5 text-right text-sm hidden lg:table-cell">{c.tonelagem.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))}
                    {canais.length > 0 && (
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell className="py-2">Total</TableCell>
                        <TableCell className="py-2 text-right">{totalQtde}</TableCell>
                        <TableCell className="py-2 hidden md:table-cell"></TableCell>
                        <TableCell className="py-2 text-right">{receitaBruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="py-2 hidden lg:table-cell"></TableCell>
                        <TableCell className="py-2 text-right hidden md:table-cell text-green-600">{(receitaBruta - custoMatPrima).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="py-2 text-right hidden lg:table-cell">{totalTonelagem.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro + Participação */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Demonstrativo de Resultado</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Receita Bruta</TableCell>
                    <TableCell className="text-right font-bold">R$ {receitaBruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-destructive">(-) Custo Mat. Prima</TableCell>
                    <TableCell className="text-right text-destructive">R$ {custoMatPrima.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="font-bold">= Lucro Bruto</TableCell>
                    <TableCell className="text-right font-bold">R$ {lucroBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                  {custosAgrupados.map(g => (
                    <TableRow key={g.key}>
                      <TableCell className="font-medium text-destructive text-sm">(-) {g.label}</TableCell>
                      <TableCell className="text-right text-destructive text-sm">R$ {g.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className={lucroLiquido >= 0 ? "bg-green-500/5" : "bg-destructive/5"}>
                    <TableCell className="font-bold text-lg">Resultado</TableCell>
                    <TableCell className={`text-right font-bold text-lg ${lucroLiquido >= 0 ? "text-green-600" : "text-destructive"}`}>
                      R$ {lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                <span className="text-sm font-medium">Ponto de Equilíbrio</span>
                <span className="text-lg font-bold text-primary">{pontoEquilibrio.toLocaleString("pt-BR")} un.</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Participação por Canal</CardTitle></CardHeader>
            <CardContent>
              {canais.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Nenhuma venda no período</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Canal</TableHead>
                      <TableHead className="text-right">Share</TableHead>
                      <TableHead className="text-right">Qtde</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {canais.sort((a, b) => b.qtde - a.qtde).map(c => {
                      const share = totalCanaisQtde > 0 ? ((c.qtde / totalCanaisQtde) * 100) : 0;
                      return (
                        <TableRow key={c.canal}>
                          <TableCell className="py-1.5 text-sm font-medium">{c.canal}</TableCell>
                          <TableCell className="py-1.5 text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 rounded-full bg-muted overflow-hidden hidden sm:block">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
                              </div>
                              <span>{share.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 text-right text-sm font-medium">{c.qtde.toLocaleString("pt-BR")}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell className="py-2">Total</TableCell>
                      <TableCell className="py-2 text-right">100%</TableCell>
                      <TableCell className="py-2 text-right">{totalCanaisQtde.toLocaleString("pt-BR")}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dados de Referência</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-xs text-muted-foreground">Preço Compra P13</p>
                    <p className="font-medium">R$ {precoCompraP13.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-xs text-muted-foreground">Preço Venda P13</p>
                    <p className="font-medium">R$ {precoVendaP13.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-xs text-muted-foreground">Margem Bruta P13</p>
                    <p className="font-medium text-green-600">R$ {(precoVendaP13 - precoCompraP13).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-xs text-muted-foreground">Tonelagem Total</p>
                    <p className="font-medium">{totalTonelagem.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ton</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
