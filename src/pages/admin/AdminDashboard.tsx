import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, DollarSign, TrendingUp, Activity, ArrowUpRight, Flame, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface Stats {
  empresas: number;
  unidades: number;
  usuarios: number;
  mrr: string;
}

interface RecentEmpresa {
  id: string;
  nome: string;
  plano: string;
  ativo: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ empresas: 0, unidades: 0, usuarios: 0, mrr: "R$ 0" });
  const [recentEmpresas, setRecentEmpresas] = useState<RecentEmpresa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [empresasRes, unidadesRes, usuariosRes, recentRes] = await Promise.all([
        supabase.from("empresas").select("id", { count: "exact", head: true }),
        supabase.from("unidades").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("empresas").select("id, nome, plano, ativo, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        empresas: empresasRes.count || 0,
        unidades: unidadesRes.count || 0,
        usuarios: usuariosRes.count || 0,
        mrr: "R$ 0",
      });
      setRecentEmpresas(recentRes.data || []);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Empresas Ativas",
      value: stats.empresas,
      icon: Building2,
      trend: "+2 este mês",
      gradient: "from-primary/15 to-primary/5",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
    },
    {
      title: "Unidades Operando",
      value: stats.unidades,
      icon: MapPin,
      trend: "Todas ativas",
      gradient: "from-success/15 to-success/5",
      iconBg: "bg-success/15",
      iconColor: "text-success",
    },
    {
      title: "Usuários Totais",
      value: stats.usuarios,
      icon: Users,
      trend: "Plataforma inteira",
      gradient: "from-accent/15 to-accent/5",
      iconBg: "bg-accent/15",
      iconColor: "text-accent",
    },
    {
      title: "MRR Estimado",
      value: stats.mrr,
      icon: DollarSign,
      trend: "Em desenvolvimento",
      gradient: "from-warning/15 to-warning/5",
      iconBg: "bg-warning/15",
      iconColor: "text-warning",
    },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5" />
              <Badge className="bg-white/20 text-white border-white/20 text-xs">
                Super Admin
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {greeting()}, {profile?.full_name?.split(" ")[0] || "Admin"} 👋
            </h1>
            <p className="text-white/70 mt-1 text-sm md:text-base">
              Painel de controle da plataforma Gás Fácil. Monitore todas as empresas e métricas em um só lugar.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.title} className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                    <p className="text-3xl font-bold mt-2 tracking-tight">
                      {loading ? (
                        <span className="inline-block w-12 h-8 bg-muted/60 animate-pulse rounded" />
                      ) : (
                        card.value
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {card.trend}
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Empresas */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Empresas Recentes
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{stats.empresas} total</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/40 animate-pulse rounded-xl" />
                ))
              ) : recentEmpresas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma empresa cadastrada.</p>
              ) : (
                recentEmpresas.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{emp.nome}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(emp.created_at), "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={emp.ativo ? "default" : "destructive"} className="text-[10px]">
                        {emp.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{emp.plano}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-primary" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Cadastrar nova empresa", desc: "Adicione um novo tenant à plataforma", href: "/admin/empresas", icon: Building2 },
                { label: "Criar unidade", desc: "Nova filial ou matriz para empresa existente", href: "/admin/unidades", icon: MapPin },
                { label: "Adicionar administrador", desc: "Vincule um gestor a uma empresa", href: "/admin/admins", icon: Users },
              ].map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-xl bg-muted/60 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                    <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{action.label}</p>
                    <p className="text-[11px] text-muted-foreground">{action.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
