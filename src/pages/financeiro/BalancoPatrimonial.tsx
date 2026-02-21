import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { useState, useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Landmark, TrendingUp, TrendingDown, Scale, ArrowUpRight, ArrowDownRight,
  Building2, Truck, Package, Banknote, CreditCard, HandCoins, DollarSign,
  BarChart3,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function BalancoPatrimonial() {
  const { unidadeAtual } = useUnidade();
  const [mesRef, setMesRef] = useState(format(new Date(), "yyyy-MM"));

  const mesesOpcoes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const d = subMonths(new Date(), i);
      arr.push({ value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy", { locale: ptBR }) });
    }
    return arr;
  }, []);

  const fimMes = endOfMonth(new Date(mesRef + "-01")).toISOString().split("T")[0];

  // Saldos bancários (Ativo Circulante — Caixa/Bancos)
  const { data: contasBancarias = [] } = useQuery({
    queryKey: ["balanco_contas", unidadeAtual?.id],
    queryFn: async () => {
      const { data } = await supabase.from("contas_bancarias").select("nome, saldo_atual, tipo").eq("ativo", true);
      return data || [];
    },
  });

  // Contas a Receber pendentes (Ativo Circulante)
  const { data: receber = [] } = useQuery({
    queryKey: ["balanco_receber", unidadeAtual?.id, fimMes],
    queryFn: async () => {
      let q = supabase.from("contas_receber").select("valor, status").eq("status", "pendente").lte("vencimento", fimMes);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  // Estoque (Ativo Circulante)
  const { data: estoque = [] } = useQuery({
    queryKey: ["balanco_estoque", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("produtos").select("nome, preco_custo, estoque_atual").gt("estoque_atual", 0);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  // Veículos (Ativo Não Circulante — Imobilizado)
  const { data: veiculos = [] } = useQuery({
    queryKey: ["balanco_veiculos"],
    queryFn: async () => {
      const { data } = await supabase.from("veiculos").select("modelo, placa, valor_fipe").eq("ativo", true);
      return data || [];
    },
  });

  // Contas a Pagar pendentes (Passivo Circulante)
  const { data: pagar = [] } = useQuery({
    queryKey: ["balanco_pagar", unidadeAtual?.id, fimMes],
    queryFn: async () => {
      let q = supabase.from("contas_pagar").select("valor, status, origem").eq("status", "pendente").lte("vencimento", fimMes);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  // Empréstimos (Passivo Não Circulante)
  const { data: emprestimos = [] } = useQuery({
    queryKey: ["balanco_emprestimos", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("emprestimos").select("descricao, valor_total, parcelas_pagas, parcelas_total, status").eq("status", "ativo");
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  // Cheques a compensar (Ativo Circulante)
  const { data: cheques = [] } = useQuery({
    queryKey: ["balanco_cheques", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("cheques").select("valor, status").in("status", ["em_maos", "depositado"]);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  // === CÁLCULOS ===
  const saldoBancos = contasBancarias.reduce((s: number, c: any) => s + Number(c.saldo_atual || 0), 0);
  const totalReceber = receber.reduce((s: number, c: any) => s + Number(c.valor), 0);
  const totalEstoque = estoque.reduce((s: number, p: any) => s + (Number(p.preco_custo || 0) * Number(p.estoque_atual || 0)), 0);
  const totalCheques = cheques.reduce((s: number, c: any) => s + Number(c.valor), 0);
  const ativoCirculante = saldoBancos + totalReceber + totalEstoque + totalCheques;

  const totalVeiculos = veiculos.reduce((s: number, v: any) => s + Number(v.valor_fipe || 0), 0);
  const ativoNaoCirculante = totalVeiculos;

  const totalAtivo = ativoCirculante + ativoNaoCirculante;

  const totalPagar = pagar.reduce((s: number, c: any) => s + Number(c.valor), 0);
  const totalEmprestimos = emprestimos.reduce((s: number, e: any) => {
    const restante = Number(e.valor_total || 0) * ((Number(e.parcelas_total || 1) - Number(e.parcelas_pagas || 0)) / Number(e.parcelas_total || 1));
    return s + restante;
  }, 0);
  const passivoCirculante = totalPagar;
  const passivoNaoCirculante = totalEmprestimos;
  const totalPassivo = passivoCirculante + passivoNaoCirculante;

  const patrimonioLiquido = totalAtivo - totalPassivo;

  // Gráfico comparativo
  const chartData = [
    { grupo: "Ativo Circ.", valor: ativoCirculante },
    { grupo: "Ativo Não Circ.", valor: ativoNaoCirculante },
    { grupo: "Passivo Circ.", valor: passivoCirculante },
    { grupo: "Passivo Não Circ.", valor: passivoNaoCirculante },
    { grupo: "PL", valor: Math.max(patrimonioLiquido, 0) },
  ];

  const ativoRows = [
    { grupo: "ATIVO CIRCULANTE", items: [
      { label: "Caixa e Bancos", valor: saldoBancos, icon: Banknote },
      { label: "Contas a Receber", valor: totalReceber, icon: ArrowUpRight },
      { label: "Estoque", valor: totalEstoque, icon: Package },
      { label: "Cheques a Compensar", valor: totalCheques, icon: CreditCard },
    ], subtotal: ativoCirculante },
    { grupo: "ATIVO NÃO CIRCULANTE", items: [
      { label: "Veículos (Imobilizado)", valor: totalVeiculos, icon: Truck },
    ], subtotal: ativoNaoCirculante },
  ];

  const passivoRows = [
    { grupo: "PASSIVO CIRCULANTE", items: [
      { label: "Contas a Pagar", valor: totalPagar, icon: ArrowDownRight },
    ], subtotal: passivoCirculante },
    { grupo: "PASSIVO NÃO CIRCULANTE", items: [
      { label: "Empréstimos", valor: totalEmprestimos, icon: HandCoins },
    ], subtotal: passivoNaoCirculante },
  ];

  return (
    <MainLayout>
      <Header title="Balanço Patrimonial" subtitle="Visão da posição financeira da empresa" />
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Filtro de mês */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Referência:</span>
          <Select value={mesRef} onValueChange={setMesRef}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mesesOpcoes.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Ativo</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-success">{fmt(totalAtivo)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Passivo</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-destructive">{fmt(totalPassivo)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Patrimônio Líquido</CardTitle>
              <Scale className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-2xl font-bold ${patrimonioLiquido >= 0 ? "text-primary" : "text-destructive"}`}>
                {fmt(patrimonioLiquido)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Índice de Liquidez</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-primary">
                {passivoCirculante > 0 ? (ativoCirculante / passivoCirculante).toFixed(2) : "∞"}
              </div>
              <p className="text-xs text-muted-foreground">Corrente (AC/PC)</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Composição Patrimonial</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grupo" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabelas Ativo e Passivo lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ATIVO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="h-5 w-5 text-success" />
                ATIVO
                <Badge variant="outline" className="ml-auto text-success border-success">
                  {fmt(totalAtivo)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conta</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ativoRows.map((grupo) => (
                    <>
                      <TableRow key={grupo.grupo} className="bg-muted/50">
                        <TableCell colSpan={2} className="font-semibold text-xs tracking-wide">
                          {grupo.grupo}
                        </TableCell>
                      </TableRow>
                      {grupo.items.map((item) => (
                        <TableRow key={item.label}>
                          <TableCell className="pl-8 flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            {item.label}
                          </TableCell>
                          <TableCell className="text-right font-mono">{fmt(item.valor)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow key={`sub-${grupo.grupo}`} className="border-t-2">
                        <TableCell className="pl-8 font-semibold text-sm">Subtotal</TableCell>
                        <TableCell className="text-right font-bold font-mono text-success">{fmt(grupo.subtotal)}</TableCell>
                      </TableRow>
                    </>
                  ))}
                  <TableRow className="bg-success/10 border-t-2 border-success/30">
                    <TableCell className="font-bold">TOTAL DO ATIVO</TableCell>
                    <TableCell className="text-right font-bold font-mono text-success text-lg">{fmt(totalAtivo)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* PASSIVO + PL */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-destructive" />
                PASSIVO + PL
                <Badge variant="outline" className="ml-auto text-destructive border-destructive">
                  {fmt(totalPassivo + patrimonioLiquido)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conta</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passivoRows.map((grupo) => (
                    <>
                      <TableRow key={grupo.grupo} className="bg-muted/50">
                        <TableCell colSpan={2} className="font-semibold text-xs tracking-wide">
                          {grupo.grupo}
                        </TableCell>
                      </TableRow>
                      {grupo.items.map((item) => (
                        <TableRow key={item.label}>
                          <TableCell className="pl-8 flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            {item.label}
                          </TableCell>
                          <TableCell className="text-right font-mono">{fmt(item.valor)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow key={`sub-${grupo.grupo}`} className="border-t-2">
                        <TableCell className="pl-8 font-semibold text-sm">Subtotal</TableCell>
                        <TableCell className="text-right font-bold font-mono text-destructive">{fmt(grupo.subtotal)}</TableCell>
                      </TableRow>
                    </>
                  ))}
                  {/* Patrimônio Líquido */}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={2} className="font-semibold text-xs tracking-wide">
                      PATRIMÔNIO LÍQUIDO
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      Capital / Lucros Acumulados
                    </TableCell>
                    <TableCell className={`text-right font-mono ${patrimonioLiquido >= 0 ? "text-primary" : "text-destructive"}`}>
                      {fmt(patrimonioLiquido)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/10 border-t-2 border-primary/30">
                    <TableCell className="font-bold">TOTAL PASSIVO + PL</TableCell>
                    <TableCell className="text-right font-bold font-mono text-primary text-lg">{fmt(totalAtivo)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Detalhamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contas Bancárias</CardTitle>
            </CardHeader>
            <CardContent>
              {contasBancarias.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada</p>
              ) : (
                <div className="space-y-2">
                  {contasBancarias.map((c: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span>{c.nome}</span>
                      <span className={`font-mono font-medium ${Number(c.saldo_atual) >= 0 ? "text-success" : "text-destructive"}`}>
                        {fmt(Number(c.saldo_atual || 0))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Empréstimos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {emprestimos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum empréstimo ativo</p>
              ) : (
                <div className="space-y-2">
                  {emprestimos.map((e: any, i: number) => {
                    const restante = Number(e.valor_total || 0) * ((Number(e.parcelas_total || 1) - Number(e.parcelas_pagas || 0)) / Number(e.parcelas_total || 1));
                    return (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div>
                          <span>{e.descricao}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({e.parcelas_pagas}/{e.parcelas_total})
                          </span>
                        </div>
                        <span className="font-mono font-medium text-destructive">{fmt(restante)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
