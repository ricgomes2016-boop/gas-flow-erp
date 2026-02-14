import { useEffect, useState } from "react";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  Star,
  Trophy,
  Calendar,
  Clock,
  TrendingUp,
  LogOut,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface EntregadorData {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  status: string | null;
  created_at: string;
}

interface Stats {
  entregasTotais: number;
  entregasMes: number;
}

const menuItems = [
  { label: "Configurações", icon: Settings, path: "/entregador/configuracoes" },
  { label: "Histórico de Entregas", icon: Clock, path: "/entregador/entregas" },
  { label: "Meus Ganhos", icon: TrendingUp, path: "/entregador/ganhos" },
];

export default function EntregadorPerfil() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [entregador, setEntregador] = useState<EntregadorData | null>(null);
  const [stats, setStats] = useState<Stats>({ entregasTotais: 0, entregasMes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: ent } = await supabase
          .from("entregadores")
          .select("*")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
          .single();

        if (!ent) { setLoading(false); return; }
        setEntregador(ent);

        const now = new Date();
        const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

        const [totalRes, mesRes] = await Promise.all([
          supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("entregador_id", ent.id).eq("status", "entregue"),
          supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("entregador_id", ent.id).eq("status", "entregue").gte("created_at", firstOfMonth),
        ]);

        setStats({
          entregasTotais: totalRes.count ?? 0,
          entregasMes: mesRes.count ?? 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const initials = (entregador?.nome || profile?.full_name || "")
    .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const dataAdmissao = entregador?.created_at
    ? new Date(entregador.created_at).toLocaleDateString("pt-BR")
    : "—";

  if (loading) {
    return (
      <EntregadorLayout title="Perfil">
        <div className="p-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </EntregadorLayout>
    );
  }

  return (
    <EntregadorLayout title="Perfil">
      <div className="p-4 space-y-4">
        {/* Card do perfil */}
        <Card className="border-none shadow-md overflow-hidden">
          <div className="gradient-primary p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold">{entregador?.nome || profile?.full_name}</h2>
                <Badge className="mt-2 bg-primary-foreground/20 text-primary-foreground border-none">
                  {entregador?.status === "disponivel" ? "Disponível" : entregador?.status === "em_rota" ? "Em Rota" : entregador?.status || "—"}
                </Badge>
              </div>
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{entregador?.email || profile?.email || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{entregador?.telefone || profile?.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Desde {dataAdmissao}</span>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.entregasTotais}</p>
                <p className="text-xs text-muted-foreground">Entregas Totais</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.entregasMes}</p>
                <p className="text-xs text-muted-foreground">Este Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu */}
        <Card className="border-none shadow-md">
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center justify-between p-4 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Botão Sair */}
        <Button
          variant="outline"
          className="w-full h-12 text-destructive border-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sair do App
        </Button>
      </div>
    </EntregadorLayout>
  );
}
