import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, RefreshCw, Clock, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { DeliveryRoutesMap, Entregador, ClienteEntrega } from "@/components/mapa/DeliveryRoutesMap";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";

export default function CentroOperacoes() {
  const { unidadeAtual } = useUnidade();
  const [selectedEntregador, setSelectedEntregador] = useState<number | null>(null);
  const [showPercurso, setShowPercurso] = useState(false);
  const [pedidosAtivos, setPedidosAtivos] = useState<any[]>([]);
  const [entregadoresData, setEntregadoresData] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<string[]>([]);

  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 30000); return () => clearInterval(interval); }, [unidadeAtual]);

  const fetchData = async () => {
    try {
      const hojeInicio = new Date(); hojeInicio.setHours(0, 0, 0, 0);
      
      let pq = supabase.from("pedidos").select("*, clientes(nome, bairro, endereco)").gte("created_at", hojeInicio.toISOString()).in("status", ["pendente", "confirmado", "em_rota"]);
      if (unidadeAtual?.id) pq = pq.eq("unidade_id", unidadeAtual.id);
      const { data: pedidos } = await pq;
      setPedidosAtivos(pedidos || []);

      const { data: entregs } = await supabase.from("entregadores").select("*").eq("ativo", true);
      setEntregadoresData(entregs || []);

      // Gerar alertas inteligentes
      const newAlertas: string[] = [];
      const pendentes = pedidos?.filter(p => p.status === "pendente") || [];
      if (pendentes.length > 5) newAlertas.push(`${pendentes.length} pedidos aguardando atribuição`);
      const emRotaCount = entregs?.filter(e => e.status === "em_rota").length || 0;
      const disponiveisCount = entregs?.filter(e => e.status === "disponivel").length || 0;
      if (disponiveisCount === 0 && pendentes.length > 0) newAlertas.push("Nenhum entregador disponível!");
      setAlertas(newAlertas);
    } catch (e) { console.error(e); }
  };

  // Convert to map format
  const entregadoresMapa: Entregador[] = entregadoresData.filter(e => e.latitude && e.longitude).map((e, i) => ({
    id: i + 1, nome: e.nome, status: e.status || "disponivel",
    lat: e.latitude, lng: e.longitude, ultimaAtualizacao: "agora",
  }));

  const clientesMapa: ClienteEntrega[] = pedidosAtivos.filter(p => p.latitude && p.longitude).map((p, i) => ({
    id: i + 1, cliente: (p.clientes as any)?.nome || "Cliente", endereco: p.endereco_entrega || "",
    lat: p.latitude, lng: p.longitude, status: p.status, horarioPrevisto: new Date(p.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  }));

  const totalEmRota = entregadoresData.filter(e => e.status === "em_rota").length;
  const totalDisponivel = entregadoresData.filter(e => e.status === "disponivel").length;
  const totalPendentes = pedidosAtivos.filter(p => p.status === "pendente").length;
  const totalConfirmados = pedidosAtivos.filter(p => p.status === "confirmado" || p.status === "em_rota").length;

  return (
    <MainLayout>
      <Header title="Centro de Operações" subtitle="Monitoramento em tempo real" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Centro de Operações</h1>
            <p className="text-muted-foreground">Visão em tempo real de entregas, entregadores e alertas</p>
          </div>
          <Button variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-2" />Atualizar</Button>
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {alertas.map((a, i) => (
              <Badge key={i} variant="destructive" className="flex items-center gap-1 py-1">
                <AlertTriangle className="h-3 w-3" />{a}
              </Badge>
            ))}
          </div>
        )}

        {/* KPIs compactos */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Card><CardContent className="flex items-center gap-3 py-3 px-4"><Truck className="h-5 w-5 text-chart-3" /><div><p className="text-lg font-bold">{totalEmRota}</p><p className="text-xs text-muted-foreground">Em Rota</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 py-3 px-4"><CheckCircle className="h-5 w-5 text-primary" /><div><p className="text-lg font-bold">{totalDisponivel}</p><p className="text-xs text-muted-foreground">Disponíveis</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 py-3 px-4"><Clock className="h-5 w-5 text-chart-4" /><div><p className="text-lg font-bold">{totalPendentes}</p><p className="text-xs text-muted-foreground">Pendentes</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 py-3 px-4"><Package className="h-5 w-5 text-chart-2" /><div><p className="text-lg font-bold">{totalConfirmados}</p><p className="text-xs text-muted-foreground">Em Andamento</p></div></CardContent></Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Mapa */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Mapa em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] rounded-b-lg overflow-hidden">
                <DeliveryRoutesMap
                  entregadores={entregadoresMapa}
                  clientes={clientesMapa}
                  percurso={[]}
                  selectedEntregador={selectedEntregador}
                  onSelectEntregador={setSelectedEntregador}
                  showPercurso={showPercurso}
                />
              </div>
            </CardContent>
          </Card>

          {/* Painel lateral */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Pedidos Ativos</CardTitle></CardHeader>
              <CardContent className="max-h-[250px] overflow-y-auto space-y-2">
                {pedidosAtivos.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum pedido ativo</p>}
                {pedidosAtivos.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg border text-sm">
                    <div>
                      <p className="font-medium">{(p.clientes as any)?.nome || "Cliente"}</p>
                      <p className="text-xs text-muted-foreground">{(p.clientes as any)?.bairro || p.endereco_entrega || "-"}</p>
                    </div>
                    <Badge variant={p.status === "pendente" ? "secondary" : "default"} className="text-[10px]">
                      {p.status === "pendente" ? "Pendente" : p.status === "confirmado" ? "Confirmado" : "Em Rota"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Entregadores</CardTitle></CardHeader>
              <CardContent className="max-h-[200px] overflow-y-auto space-y-2">
                {entregadoresData.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-2 rounded-lg border text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${e.status === "em_rota" ? "bg-chart-3" : "bg-primary"}`} />
                      <span className="font-medium">{e.nome}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{e.status === "em_rota" ? "Em Rota" : "Livre"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
