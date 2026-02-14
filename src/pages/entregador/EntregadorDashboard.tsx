import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Star,
  Package,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Flame,
  Medal,
  BellRing,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDeliveryNotifications } from "@/contexts/DeliveryNotificationContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function EntregadorDashboard() {
  const { simulateNewDelivery, pendingDeliveries } = useDeliveryNotifications();
  const { permission, requestPermission } = useNotifications();
  const { user, profile } = useAuth();
  
  const [stats, setStats] = useState({
    entregasHoje: 0,
    entregasMes: 0,
    metaMensal: 200,
  });
  const [entregasPendentes, setEntregasPendentes] = useState<any[]>([]);

  const nomeEntregador = profile?.full_name || user?.user_metadata?.full_name || "Entregador";

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      const { data: entregador } = await supabase
        .from("entregadores")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (!entregador) return;

      const hoje = new Date().toISOString().split("T")[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [hojRes, mesRes, pendRes] = await Promise.all([
        supabase.from("pedidos").select("id", { count: "exact", head: true })
          .eq("entregador_id", entregador.id).eq("status", "entregue")
          .gte("created_at", hoje),
        supabase.from("pedidos").select("id", { count: "exact", head: true })
          .eq("entregador_id", entregador.id).eq("status", "entregue")
          .gte("created_at", inicioMes),
        supabase.from("pedidos").select("id, created_at, endereco_entrega, clientes(nome)")
          .eq("entregador_id", entregador.id)
          .in("status", ["pendente", "em_rota"])
          .order("created_at", { ascending: true })
          .limit(5),
      ]);

      setStats({
        entregasHoje: hojRes.count || 0,
        entregasMes: mesRes.count || 0,
        metaMensal: 200,
      });

      setEntregasPendentes(
        (pendRes.data || []).map((p: any) => ({
          id: p.id,
          cliente: p.clientes?.nome || "Cliente",
          endereco: p.endereco_entrega || "Sem endereço",
          horario: new Date(p.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }))
      );
    };

    fetchStats();
  }, [user]);

  const progressoMeta = (stats.entregasMes / stats.metaMensal) * 100;

  const todasEntregasPendentes = [
    ...entregasPendentes,
    ...pendingDeliveries.map((d) => ({
      id: d.id,
      cliente: d.cliente,
      endereco: d.endereco,
      horario: d.horarioPrevisto,
    })),
  ];

  return (
    <EntregadorLayout title="Início">
      <div className="p-4 space-y-4">
        {/* Banner de ativar notificações */}
        {permission !== "granted" && (
          <Card className="border-none shadow-md bg-primary/5 border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BellRing className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Ative as notificações</p>
                  <p className="text-xs text-muted-foreground">
                    Receba alertas de novas entregas em tempo real
                  </p>
                </div>
                <Button size="sm" onClick={requestPermission}>
                  Ativar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão de teste (remover em produção) */}
        {permission === "granted" && (
          <Button
            variant="outline"
            size="sm"
            onClick={simulateNewDelivery}
            className="w-full"
          >
            <BellRing className="h-4 w-4 mr-2" />
            Simular Nova Entrega (Teste)
          </Button>
        )}
        {/* Header com saudação */}
        <div className="gradient-primary rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Olá,</p>
              <h1 className="text-xl font-bold">{nomeEntregador}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-primary-foreground/20 text-primary-foreground border-none">
                  <Package className="h-3 w-3 mr-1" />
                  {stats.entregasHoje} hoje
                </Badge>
              </div>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {stats.entregasMes}
              </div>
              <p className="text-xs text-white/80 mt-1">no mês</p>
            </div>
          </div>
        </div>

        {/* Cards de estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.entregasHoje}</p>
                  <p className="text-xs text-muted-foreground">Entregas hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.entregasMes}</p>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meta mensal */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Meta Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{stats.entregasMes} entregas</span>
                <span className="text-muted-foreground">Meta: {stats.metaMensal}</span>
              </div>
              <Progress value={progressoMeta} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                Faltam {stats.metaMensal - stats.entregasMes} entregas para atingir a meta
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Entregas pendentes */}
        {todasEntregasPendentes.length > 0 && (
          <Card className="border-none shadow-md border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                Entregas Pendentes
                {pendingDeliveries.length > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground ml-auto">
                    +{pendingDeliveries.length} novas
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todasEntregasPendentes.slice(0, 4).map((entrega) => (
                <Link
                  key={entrega.id}
                  to={`/entregador/entregas`}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{entrega.cliente}</p>
                    <p className="text-xs text-muted-foreground">{entrega.endereco}</p>
                  </div>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {entrega.horario}
                  </Badge>
                </Link>
              ))}
              <Link
                to="/entregador/entregas"
                className="block text-center text-sm text-primary font-medium mt-2"
              >
                Ver todas as entregas →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </EntregadorLayout>
  );
}
