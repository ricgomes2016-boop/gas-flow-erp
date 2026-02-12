import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { StockOverview } from "@/components/dashboard/StockOverview";
import { DeliveriesMap } from "@/components/dashboard/DeliveriesMap";
import { ShoppingCart, Truck, Users, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { startOfDay, endOfDay } from "date-fns";

export default function Dashboard() {
  const { unidadeAtual } = useUnidade();
  const today = new Date();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", unidadeAtual?.id],
    queryFn: async () => {
      const dayStart = startOfDay(today).toISOString();
      const dayEnd = endOfDay(today).toISOString();

      // Build base filters
      const baseFilter = (q: any) => {
        if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
        return q;
      };

      // Pedidos de hoje
      const { data: pedidosHoje } = await baseFilter(
        supabase.from("pedidos").select("valor_total, status")
          .gte("created_at", dayStart).lte("created_at", dayEnd)
      );

      const vendasHoje = (pedidosHoje || [])
        .filter((p: any) => p.status !== "cancelado")
        .reduce((sum: number, p: any) => sum + (Number(p.valor_total) || 0), 0);

      const totalPedidos = pedidosHoje?.length || 0;
      const pendentes = (pedidosHoje || []).filter((p: any) => p.status === "pendente" || p.status === "em_rota").length;

      // Clientes ativos
      const { count: clientesAtivos } = await supabase
        .from("clientes").select("id", { count: "exact", head: true }).eq("ativo", true);

      return {
        vendasHoje,
        totalPedidos,
        pendentes,
        clientesAtivos: clientesAtivos || 0,
      };
    },
  });

  return (
    <MainLayout>
      <Header title="Dashboard" subtitle="Bem-vindo ao GásPro - Sua revenda de gás" />
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Vendas Hoje"
            value={`R$ ${(stats?.vendasHoje ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            variant="primary"
          />
          <StatCard title="Pedidos" value={stats?.totalPedidos ?? 0} icon={ShoppingCart} />
          <StatCard title="Entregas Pendentes" value={stats?.pendentes ?? 0} icon={Truck} variant="warning" />
          <StatCard title="Clientes Ativos" value={stats?.clientesAtivos ?? 0} icon={Users} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
