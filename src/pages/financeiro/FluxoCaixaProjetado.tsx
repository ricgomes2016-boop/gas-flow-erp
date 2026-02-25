import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format, addDays, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getBrasiliaDateString, parseLocalDate } from "@/lib/utils";

export default function FluxoCaixaProjetado() {
  const { unidadeAtual } = useUnidade();
  const [periodo, setPeriodo] = useState<"30" | "60" | "90">("30");
  const hoje = getBrasiliaDateString();
  const dias = parseInt(periodo);

  // Saldo bancário atual
  const { data: saldoAtual = 0 } = useQuery({
    queryKey: ["fluxo_saldo", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("contas_bancarias").select("saldo_atual").eq("ativo", true);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data?.reduce((s, c) => s + Number(c.saldo_atual || 0), 0) || 0;
    },
  });

  // Saldo caixa físico
  const { data: saldoCaixa = 0 } = useQuery({
    queryKey: ["fluxo_caixa_fisico", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("movimentacoes_caixa").select("tipo, valor");
      if (unidadeAtual?.id) q = q.or(`unidade_id.eq.${unidadeAtual.id},unidade_id.is.null`);
      const { data } = await q;
      if (!data) return 0;
      return data.reduce((s, m) => s + (m.tipo === "entrada" ? Number(m.valor) : -Number(m.valor)), 0);
    },
  });

  // Contas a receber futuras
  const { data: receber = [] } = useQuery({
    queryKey: ["fluxo_receber", unidadeAtual?.id, dias],
    queryFn: async () => {
      const limite = format(addDays(new Date(), dias), "yyyy-MM-dd");
      let q = supabase.from("contas_receber").select("valor, vencimento, forma_pagamento, valor_liquido")
        .eq("status", "pendente").lte("vencimento", limite);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  // Contas a pagar futuras
  const { data: pagar = [] } = useQuery({
    queryKey: ["fluxo_pagar", unidadeAtual?.id, dias],
    queryFn: async () => {
      const limite = format(addDays(new Date(), dias), "yyyy-MM-dd");
      let q = supabase.from("contas_pagar").select("valor, vencimento, categoria")
        .eq("status", "pendente").lte("vencimento", limite);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  // Movimentações bancárias realizadas (últimos 30 dias)
  const { data: movsRealizadas = [] } = useQuery({
    queryKey: ["fluxo_realizadas", unidadeAtual?.id],
    queryFn: async () => {
      const desde = format(subDays(new Date(), 30), "yyyy-MM-dd");
      let q = supabase.from("movimentacoes_bancarias").select("tipo, valor, data").gte("data", desde);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  // KPIs
  const totalReceber = receber.reduce((s, r: any) => s + Number(r.valor_liquido || r.valor), 0);
  const totalPagar = pagar.reduce((s, r: any) => s + Number(r.valor), 0);
  const saldoTotal = saldoAtual + saldoCaixa;
  const saldoProjetado = saldoTotal + totalReceber - totalPagar;

  // Gráfico: Fluxo projetado dia a dia
  const chartData = useMemo(() => {
    const interval = eachDayOfInterval({ start: new Date(), end: addDays(new Date(), dias) });
    let saldoAcum = saldoTotal;

    return interval.map(day => {
      const dataStr = format(day, "yyyy-MM-dd");
      const entradasDia = receber
        .filter((r: any) => r.vencimento === dataStr)
        .reduce((s, r: any) => s + Number(r.valor_liquido || r.valor), 0);
      const saidasDia = pagar
        .filter((p: any) => p.vencimento === dataStr)
        .reduce((s, p: any) => s + Number(p.valor), 0);

      saldoAcum += entradasDia - saidasDia;

      return {
        data: format(day, "dd/MM"),
        entradas: entradasDia,
        saidas: saidasDia,
        saldo: saldoAcum,
      };
    });
  }, [receber, pagar, saldoTotal, dias]);

  // Gráfico realizado (últimos 30 dias)
  const chartRealizado = useMemo(() => {
    const interval = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return interval.map(day => {
      const dataStr = format(day, "yyyy-MM-dd");
      const entradasDia = movsRealizadas.filter((m: any) => m.data === dataStr && m.tipo === "entrada").reduce((s, m: any) => s + Number(m.valor), 0);
      const saidasDia = movsRealizadas.filter((m: any) => m.data === dataStr && m.tipo === "saida").reduce((s, m: any) => s + Number(m.valor), 0);
      return {
        data: format(day, "dd/MM"),
        entradas: entradasDia,
        saidas: saidasDia,
      };
    });
  }, [movsRealizadas]);

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <MainLayout>
      <Header title="Fluxo de Caixa" subtitle="Projeção financeira — previsto vs realizado" />
      <div className="p-3 sm:p-4 md:p-6 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">Saldo Bancário</CardTitle></CardHeader>
            <CardContent><p className={`text-xl font-bold ${saldoAtual >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(saldoAtual)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">Saldo Caixa</CardTitle></CardHeader>
            <CardContent><p className={`text-xl font-bold ${saldoCaixa >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(saldoCaixa)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">A Receber</CardTitle></CardHeader>
            <CardContent><p className="text-xl font-bold text-success">{fmt(totalReceber)}</p>
              <p className="text-xs text-muted-foreground">{receber.length} título(s)</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">A Pagar</CardTitle></CardHeader>
            <CardContent><p className="text-xl font-bold text-destructive">{fmt(totalPagar)}</p>
              <p className="text-xs text-muted-foreground">{pagar.length} título(s)</p></CardContent>
          </Card>
          <Card className={saldoProjetado < 0 ? "border-destructive/50" : "border-success/50"}>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">Saldo Projetado</CardTitle></CardHeader>
            <CardContent><p className={`text-xl font-bold ${saldoProjetado >= 0 ? "text-success" : "text-destructive"}`}>{fmt(saldoProjetado)}</p>
              <p className="text-xs text-muted-foreground">em {periodo} dias</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projetado">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="projetado" className="gap-1.5"><TrendingUp className="h-4 w-4" />Projetado</TabsTrigger>
              <TabsTrigger value="realizado" className="gap-1.5"><BarChart3 className="h-4 w-4" />Realizado</TabsTrigger>
            </TabsList>
            <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="projetado" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Projeção de Saldo — Próximos {periodo} dias</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" tick={{ fontSize: 11 }} interval={Math.floor(dias / 10)} />
                    <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Legend />
                    <Area type="monotone" dataKey="saldo" name="Saldo Projetado" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="entradas" name="Entradas" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.05} />
                    <Area type="monotone" dataKey="saidas" name="Saídas" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.05} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realizado" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Fluxo Realizado — Últimos 30 dias</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartRealizado}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" tick={{ fontSize: 11 }} interval={4} />
                    <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Legend />
                    <Bar dataKey="entradas" name="Entradas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="saidas" name="Saídas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
