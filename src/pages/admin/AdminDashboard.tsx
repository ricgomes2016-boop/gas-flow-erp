import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Users, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  empresas: number;
  unidades: number;
  usuarios: number;
  mrr: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ empresas: 0, unidades: 0, usuarios: 0, mrr: "R$ 0" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [empresasRes, unidadesRes, usuariosRes] = await Promise.all([
        supabase.from("empresas").select("id", { count: "exact", head: true }),
        supabase.from("unidades").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        empresas: empresasRes.count || 0,
        unidades: unidadesRes.count || 0,
        usuarios: usuariosRes.count || 0,
        mrr: "R$ 0", // TODO: integrate Stripe MRR
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Empresas", value: stats.empresas, icon: Building2, color: "text-blue-500" },
    { title: "Unidades", value: stats.unidades, icon: MapPin, color: "text-green-500" },
    { title: "Usuários", value: stats.usuarios, icon: Users, color: "text-orange-500" },
    { title: "MRR Estimado", value: stats.mrr, icon: DollarSign, color: "text-emerald-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Painel da Plataforma</h1>
          <p className="text-muted-foreground">Visão geral de todas as empresas e métricas do SaaS.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{loading ? "..." : card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
