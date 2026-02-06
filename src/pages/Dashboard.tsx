import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { StockOverview } from "@/components/dashboard/StockOverview";
import { DeliveriesMap } from "@/components/dashboard/DeliveriesMap";
import { ShoppingCart, Package, Truck, Users, TrendingUp, DollarSign } from "lucide-react";

export default function Dashboard() {
  return (
    <MainLayout>
      <Header
        title="Dashboard"
        subtitle="Bem-vindo ao GásPro - Sua revenda de gás"
      />
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Vendas Hoje"
            value="R$ 2.450,00"
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
            variant="primary"
          />
          <StatCard
            title="Pedidos"
            value={28}
            icon={ShoppingCart}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Entregas Pendentes"
            value={7}
            icon={Truck}
            variant="warning"
          />
          <StatCard
            title="Clientes Ativos"
            value={156}
            icon={Users}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Charts and Lists */}
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
