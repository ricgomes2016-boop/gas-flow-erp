import { useState, useEffect, useCallback } from "react";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Navigation,
  User,
  Truck,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { IniciarRotaModal } from "@/components/entregador/IniciarRotaModal";

interface EntregaDB {
  id: string;
  created_at: string;
  valor_total: number | null;
  status: string | null;
  forma_pagamento: string | null;
  endereco_entrega: string | null;
  observacoes: string | null;
  cliente_id: string | null;
  clientes: {
    nome: string;
    telefone: string | null;
    bairro: string | null;
  } | null;
  pedido_itens: {
    id: string;
    quantidade: number;
    preco_unitario: number;
    produtos: {
      nome: string;
    } | null;
  }[];
}

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-muted text-muted-foreground", icon: Clock },
  em_rota: { label: "Em Rota", color: "bg-warning/10 text-warning", icon: Truck },
  entregue: { label: "Entregue", color: "bg-success/10 text-success", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive", icon: Package },
};

export default function EntregadorEntregas() {
  const [entregas, setEntregas] = useState<EntregaDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabAtiva, setTabAtiva] = useState("pendentes");
  const [modalIniciarRota, setModalIniciarRota] = useState(false);
  const [entregaParaIniciar, setEntregaParaIniciar] = useState<EntregaDB | null>(null);
  const [entregadorId, setEntregadorId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchEntregas = useCallback(async () => {
    if (!user) return;

    try {
      // Get entregador record for this user
      const { data: entregador } = await supabase
        .from("entregadores")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (entregador) {
        setEntregadorId(entregador.id);
      }

      // Query pedidos assigned to this entregador OR unassigned (pendente)
      let query = supabase
        .from("pedidos")
        .select(`
          id, created_at, valor_total, status, forma_pagamento, endereco_entrega, observacoes, cliente_id,
          clientes:cliente_id (nome, telefone, bairro),
          pedido_itens (
            id, quantidade, preco_unitario,
            produtos:produto_id (nome)
          )
        `)
        .in("status", ["pendente", "em_rota", "entregue"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (entregador) {
        // Show: pedidos assigned to me + unassigned pendentes
        query = query.or(`entregador_id.eq.${entregador.id},and(entregador_id.is.null,status.eq.pendente)`);
      } else {
        // If not linked as entregador, show all pendentes
        query = query.eq("status", "pendente");
      }

      const { data, error } = await query;

      if (!error && data) {
        setEntregas(data as unknown as EntregaDB[]);
      }
    } catch (err) {
      console.error("Erro ao buscar entregas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntregas();
  }, [fetchEntregas]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("pedidos-entregador")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchEntregas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEntregas]);

  const aceitarEntrega = async (pedidoId: string) => {
    if (!entregadorId) {
      toast({ title: "Erro", description: "Você não está cadastrado como entregador.", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("pedidos")
      .update({ entregador_id: entregadorId, status: "em_rota" })
      .eq("id", pedidoId);

    if (error) {
      toast({ title: "Erro ao aceitar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Entrega aceita!", description: "A entrega está em andamento." });
      setTabAtiva("aceitas");
      fetchEntregas();
    }
  };

  const handleIniciarRota = (entrega: EntregaDB) => {
    setEntregaParaIniciar(entrega);
    setModalIniciarRota(true);
  };

  const confirmarInicioRota = async (veiculoId: number, veiculoPlaca: string, kmInicial: number) => {
    if (!entregaParaIniciar) return;

    const { error } = await supabase
      .from("pedidos")
      .update({ status: "em_rota" })
      .eq("id", entregaParaIniciar.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Rota iniciada!",
        description: `Veículo ${veiculoPlaca} - KM Inicial: ${kmInicial.toLocaleString("pt-BR")}`,
      });
      fetchEntregas();
    }
    setModalIniciarRota(false);
    setEntregaParaIniciar(null);
  };

  const abrirMapa = (endereco: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, "_blank");
  };

  const ligar = (telefone: string) => {
    window.open(`tel:${telefone}`, "_self");
  };

  const getEntregasByTab = (tab: string) => {
    if (tab === "pendentes") return entregas.filter(e => e.status === "pendente");
    if (tab === "aceitas") return entregas.filter(e => e.status === "em_rota" || (e.status === "pendente" && entregadorId && false));
    if (tab === "finalizadas") return entregas.filter(e => e.status === "entregue");
    return entregas;
  };

  // Filter accepted = assigned to me but not yet em_rota, plus em_rota
  const getAceitas = () => entregas.filter(e => {
    // @ts-ignore - entregador_id is on the raw data
    const isAssignedToMe = e.entregador_id === entregadorId;
    return (e.status === "em_rota") || (e.status === "pendente" && isAssignedToMe);
  });

  const getPendentes = () => entregas.filter(e => e.status === "pendente");
  const getFinalizadas = () => entregas.filter(e => e.status === "entregue");

  const getProductsSummary = (itens: EntregaDB["pedido_itens"]) => {
    return itens.map(i => `${i.quantidade}x ${i.produtos?.nome || "Produto"}`).join(", ");
  };

  const renderEntrega = (entrega: EntregaDB) => {
    const status = statusConfig[entrega.status as keyof typeof statusConfig] || statusConfig.pendente;
    const StatusIcon = status.icon;
    const clienteNome = entrega.clientes?.nome || "Cliente";
    const clienteTelefone = entrega.clientes?.telefone || "";
    const bairro = entrega.clientes?.bairro || "";

    return (
      <Card key={entrega.id} className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{clienteNome}</p>
                <p className="text-xs text-muted-foreground">Pedido #{entrega.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>
            <Badge className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>

          <div className="p-4 space-y-3">
            {entrega.endereco_entrega && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">{entrega.endereco_entrega}</p>
                  {bairro && <Badge variant="secondary" className="mt-1 text-xs">{bairro}</Badge>}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{getProductsSummary(entrega.pedido_itens)}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">{entrega.forma_pagamento || "—"}</p>
              <p className="font-bold text-lg text-primary">
                R$ {(entrega.valor_total || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex border-t border-border">
            {entrega.status === "pendente" && (
              <Button
                onClick={() => aceitarEntrega(entrega.id)}
                className="flex-1 rounded-none gradient-primary text-white h-12"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aceitar Entrega
              </Button>
            )}

            {entrega.status === "em_rota" && (
              <>
                {entrega.endereco_entrega && (
                  <Button
                    variant="ghost"
                    onClick={() => abrirMapa(entrega.endereco_entrega!)}
                    className="flex-1 rounded-none h-12"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Mapa
                  </Button>
                )}
                {clienteTelefone && (
                  <Button
                    variant="ghost"
                    onClick={() => ligar(clienteTelefone)}
                    className="flex-1 rounded-none h-12 border-l border-border"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar
                  </Button>
                )}
                <Link to={`/entregador/entregas/${entrega.id}/finalizar`} className="flex-1">
                  <Button className="w-full rounded-none gradient-primary text-white h-12">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar
                  </Button>
                </Link>
              </>
            )}

            {entrega.status === "entregue" && (
              <div className="flex-1 flex items-center justify-center h-12 text-success text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                Entrega concluída
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <EntregadorLayout title="Entregas">
      <div className="p-4">
        <div className="flex justify-end mb-2">
          <Button variant="ghost" size="sm" onClick={() => { setIsLoading(true); fetchEntregas(); }}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="pendentes" className="relative">
                Pendentes
                {getPendentes().length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {getPendentes().length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="aceitas">Em Andamento</TabsTrigger>
              <TabsTrigger value="finalizadas">Finalizadas</TabsTrigger>
            </TabsList>

            <TabsContent value="pendentes" className="space-y-4 mt-0">
              {getPendentes().length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma entrega pendente</p>
                </div>
              ) : (
                getPendentes().map(renderEntrega)
              )}
            </TabsContent>

            <TabsContent value="aceitas" className="space-y-4 mt-0">
              {entregas.filter(e => e.status === "em_rota").length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma entrega em andamento</p>
                </div>
              ) : (
                entregas.filter(e => e.status === "em_rota").map(renderEntrega)
              )}
            </TabsContent>

            <TabsContent value="finalizadas" className="space-y-4 mt-0">
              {getFinalizadas().length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma entrega finalizada hoje</p>
                </div>
              ) : (
                getFinalizadas().map(renderEntrega)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <IniciarRotaModal
        isOpen={modalIniciarRota}
        onClose={() => {
          setModalIniciarRota(false);
          setEntregaParaIniciar(null);
        }}
        onConfirm={confirmarInicioRota}
        entregaNome={entregaParaIniciar?.clientes?.nome}
      />
    </EntregadorLayout>
  );
}
