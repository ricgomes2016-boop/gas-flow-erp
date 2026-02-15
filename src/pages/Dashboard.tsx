import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { StockOverview } from "@/components/dashboard/StockOverview";
import { DeliveriesMap } from "@/components/dashboard/DeliveriesMap";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DeliveryDriverStatus } from "@/components/dashboard/DeliveryDriverStatus";
import { DailySalesGoal } from "@/components/dashboard/DailySalesGoal";
import { StockAlerts } from "@/components/dashboard/StockAlerts";
import { ShoppingCart, Truck, Users, DollarSign, TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

type Period = "hoje" | "semana" | "mes";

export default function Dashboard() {
  const { unidadeAtual } = useUnidade();
  const [period, setPeriod] = useState<Period>("hoje");
  const today = new Date();

  const getRange = (p: Period) => {
    switch (p) {
      case "semana":
        return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfDay(today) };
      case "mes":
        return { start: startOfMonth(today), end: endOfDay(today) };
      default:
        return { start: startOfDay(today), end: endOfDay(today) };
    }
  };

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", unidadeAtual?.id, period],
    queryFn: async () => {
      const { start, end } = getRange(period);

      const baseFilter = (q: any) => {
        if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
        return q;
      };

      // Current period orders
      const { data: pedidos } = await baseFilter(
        supabase.from("pedidos").select("valor_total, status")
          .gte("created_at", start.toISOString()).lte("created_at", end.toISOString())
      );

      const valid = (pedidos || []).filter((p: any) => p.status !== "cancelado");
      const vendasPeriodo = valid.reduce((sum: number, p: any) => sum + (Number(p.valor_total) || 0), 0);
      const totalPedidos = pedidos?.length || 0;
      const pendentes = (pedidos || []).filter((p: any) => p.status === "pendente" || p.status === "em_rota").length;
      const ticketMedio = valid.length > 0 ? vendasPeriodo / valid.length : 0;

      // Yesterday comparison (only for "hoje")
      let trendVendas: { value: number; isPositive: boolean } | undefined;
      let trendPedidos: { value: number; isPositive: boolean } | undefined;

      if (period === "hoje") {
        const yesterday = subDays(today, 1);
        const { data: pedidosOntem } = await baseFilter(
          supabase.from("pedidos").select("valor_total, status")
            .gte("created_at", startOfDay(yesterday).toISOString())
            .lte("created_at", endOfDay(yesterday).toISOString())
        );

        const validOntem = (pedidosOntem || []).filter((p: any) => p.status !== "cancelado");
        const vendasOntem = validOntem.reduce((sum: number, p: any) => sum + (Number(p.valor_total) || 0), 0);

        if (vendasOntem > 0) {
          const pctVendas = ((vendasPeriodo - vendasOntem) / vendasOntem) * 100;
          trendVendas = { value: Math.round(Math.abs(pctVendas)), isPositive: pctVendas >= 0 };
        }

        const totalOntem = pedidosOntem?.length || 0;
        if (totalOntem > 0) {
          const pctPedidos = ((totalPedidos - totalOntem) / totalOntem) * 100;
          trendPedidos = { value: Math.round(Math.abs(pctPedidos)), isPositive: pctPedidos >= 0 };
        }
      }

      // Active clients
      const { count: clientesAtivos } = await supabase
        .from("clientes").select("id", { count: "exact", head: true }).eq("ativo", true);

      return {
        vendasPeriodo,
        totalPedidos,
        pendentes,
        clientesAtivos: clientesAtivos || 0,
        ticketMedio,
        trendVendas,
        trendPedidos,
      };
    },
  });

  const periodLabel = { hoje: "Hoje", semana: "Semana", mes: "Mês" }[period];

  return (
    <MainLayout>
      <Header title="Dashboard" subtitle="Bem-vindo ao GásPro - Sua revenda de gás" />
      <div className="p-6 space-y-6">
        {/* Filtro de período (#8) */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList>
              <TabsTrigger value="hoje">Hoje</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
              <TabsTrigger value="mes">Mês</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Alertas de estoque crítico (#6) */}
        <StockAlerts />

        {/* Cards com comparativo (#1) e Ticket Médio (#3) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title={`Vendas ${periodLabel}`}
            value={`R$ ${(stats?.vendasPeriodo ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            variant="primary"
            trend={stats?.trendVendas}
          />
          <StatCard
            title="Pedidos"
            value={stats?.totalPedidos ?? 0}
            icon={ShoppingCart}
            trend={stats?.trendPedidos}
          />
          <StatCard
            title="Ticket Médio"
            value={`R$ ${(stats?.ticketMedio ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            variant="info"
          />
          <StatCard title="Entregas Pendentes" value={stats?.pendentes ?? 0} icon={Truck} variant="warning" />
          <StatCard title="Clientes Ativos" value={stats?.clientesAtivos ?? 0} icon={Users} />
        </div>

        {/* Atalhos rápidos (#4) */}
        <QuickActions />

        {/* Gráfico vendas/hora (#2) + Meta diária (#7) */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div className="space-y-6">
            <DailySalesGoal />
            <DeliveryDriverStatus />
          </div>
        </div>

        {/* Vendas recentes + Estoque + Entregas */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentSales />
          <div className="space-y-6">
            <StockOverview />
            <DeliveriesMap />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
