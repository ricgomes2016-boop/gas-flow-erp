import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CalendarRange, Landmark, CreditCard, Layers, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export function CompromissosFuturos() {
  const { unidadeAtual } = useUnidade();

  const { data, isLoading } = useQuery({
    queryKey: ["compromissos-futuros", unidadeAtual?.id],
    queryFn: async () => {
      const hoje = new Date();
      const meses: Array<{
        mes: string; label: string;
        parcelas: number; emprestimos: number; cartao: number; avulsas: number;
      }> = [];

      for (let i = 0; i < 6; i++) {
        const d = addMonths(hoje, i);
        const mesKey = format(d, "yyyy-MM");
        const inicioMes = `${mesKey}-01`;
        const fimD = addMonths(new Date(`${mesKey}-01`), 1);
        const fimMes = format(fimD, "yyyy-MM-dd");

        let q = supabase
          .from("contas_pagar")
          .select("valor, origem, parcela_numero")
          .eq("status", "pendente")
          .gte("vencimento", inicioMes)
          .lt("vencimento", fimMes);
        if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
        const { data: contas } = await q;

        let parcelas = 0, emprestimos = 0, cartao = 0, avulsas = 0;
        (contas || []).forEach((c: any) => {
          const val = Number(c.valor);
          if (c.origem === "emprestimo") emprestimos += val;
          else if (c.origem === "cartao_credito") cartao += val;
          else if (c.parcela_numero) parcelas += val;
          else avulsas += val;
        });

        meses.push({
          mes: mesKey,
          label: format(d, "MMM/yy", { locale: ptBR }),
          parcelas, emprestimos, cartao, avulsas,
        });
      }

      // Totais globais
      let qEmp = supabase.from("emprestimos").select("id, valor_total, num_parcelas, descricao, instituicao").eq("status", "ativo");
      if (unidadeAtual?.id) qEmp = qEmp.eq("unidade_id", unidadeAtual.id);
      const { data: emprestimosAtivos } = await qEmp;

      let qFat = supabase.from("faturas_cartao").select("id, cartao_nome, valor_total, mes_referencia, vencimento").eq("status", "aberta");
      if (unidadeAtual?.id) qFat = qFat.eq("unidade_id", unidadeAtual.id);
      const { data: faturasAbertas } = await qFat;

      const totalFuturo = meses.reduce((s, m) => s + m.parcelas + m.emprestimos + m.cartao + m.avulsas, 0);

      return {
        meses,
        emprestimosAtivos: emprestimosAtivos || [],
        faturasAbertas: faturasAbertas || [],
        totalFuturo,
      };
    },
    staleTime: 60_000,
  });

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  const { meses = [], emprestimosAtivos = [], faturasAbertas = [], totalFuturo = 0 } = data || {};
  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const chartData = meses.map(m => ({
    mes: m.label,
    Parcelas: m.parcelas,
    Empréstimos: m.emprestimos,
    Cartão: m.cartao,
    Avulsas: m.avulsas,
  }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Futuro (6m)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{fmt(totalFuturo)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Empréstimos Ativos</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{emprestimosAtivos.length}</p>
            <p className="text-xs text-muted-foreground">
              {fmt(emprestimosAtivos.reduce((s: number, e: any) => s + Number(e.valor_total), 0))} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Faturas Abertas</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{faturasAbertas.length}</p>
            <p className="text-xs text-muted-foreground">
              {fmt(faturasAbertas.reduce((s: number, f: any) => s + Number(f.valor_total), 0))} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Média Mensal</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{fmt(totalFuturo / 6)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico empilhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="h-5 w-5" />
            Compromissos Futuros — Próximos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Legend />
              <Bar dataKey="Avulsas" stackId="a" fill="hsl(var(--muted-foreground))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Parcelas" stackId="a" fill="hsl(var(--primary))" />
              <Bar dataKey="Empréstimos" stackId="a" fill="hsl(var(--destructive))" />
              <Bar dataKey="Cartão" stackId="a" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Empréstimos ativos */}
      {emprestimosAtivos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="h-5 w-5" />Empréstimos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emprestimosAtivos.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{e.descricao}</p>
                  <p className="text-sm text-muted-foreground">{e.instituicao} — {e.num_parcelas}x</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{fmt(Number(e.valor_total))}</p>
                  <Badge variant="outline" className="text-xs">Ativo</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Faturas abertas */}
      {faturasAbertas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5" />Faturas de Cartão Abertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {faturasAbertas.map((f: any) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{f.cartao_nome}</p>
                  <p className="text-sm text-muted-foreground">Ref: {f.mes_referencia} | Venc: {new Date(f.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-destructive">{fmt(Number(f.valor_total))}</p>
                  <Badge variant="destructive" className="text-xs">Aberta</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
