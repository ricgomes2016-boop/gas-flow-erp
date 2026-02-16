import { useState, useEffect, useCallback } from "react";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { IniciarRotaModal } from "@/components/entregador/IniciarRotaModal";
import { EntregaCard, type EntregaDB } from "@/components/entregador/EntregaCard";

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
      const { data: entregador } = await supabase
        .from("entregadores")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (entregador) setEntregadorId(entregador.id);

      let query = supabase
        .from("pedidos")
        .select(`
          id, created_at, valor_total, status, forma_pagamento, endereco_entrega, observacoes, cliente_id,
          clientes:cliente_id (nome, telefone, bairro),
          pedido_itens (id, quantidade, preco_unitario, produtos:produto_id (nome))
        `)
        .in("status", ["pendente", "em_rota", "entregue"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (entregador) {
        query = query.or(`entregador_id.eq.${entregador.id},and(entregador_id.is.null,status.eq.pendente)`);
      } else {
        query = query.eq("status", "pendente");
      }

      const { data, error } = await query;
      if (!error && data) setEntregas(data as unknown as EntregaDB[]);
    } catch (err) {
      console.error("Erro ao buscar entregas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchEntregas(); }, [fetchEntregas]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("pedidos-entregador")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => fetchEntregas())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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

  const pendentes = entregas.filter(e => e.status === "pendente");
  const emRota = entregas.filter(e => e.status === "em_rota");
  const finalizadas = entregas.filter(e => e.status === "entregue");

  const EmptyState = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <div className="text-center py-12 text-muted-foreground">
      <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>{text}</p>
    </div>
  );

  return (
    <EntregadorLayout title="Entregas">
      <div className="p-3 sm:p-4">
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
              <TabsTrigger value="pendentes" className="relative text-xs sm:text-sm">
                Pendentes
                {pendentes.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {pendentes.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="aceitas" className="text-xs sm:text-sm">Em Andamento</TabsTrigger>
              <TabsTrigger value="finalizadas" className="text-xs sm:text-sm">Finalizadas</TabsTrigger>
            </TabsList>

            <TabsContent value="pendentes" className="space-y-4 mt-0">
              {pendentes.length === 0 ? (
                <EmptyState icon={Package} text="Nenhuma entrega pendente" />
              ) : (
                pendentes.map(e => <EntregaCard key={e.id} entrega={e} onAceitar={aceitarEntrega} />)
              )}
            </TabsContent>

            <TabsContent value="aceitas" className="space-y-4 mt-0">
              {emRota.length === 0 ? (
                <EmptyState icon={Truck} text="Nenhuma entrega em andamento" />
              ) : (
                emRota.map(e => <EntregaCard key={e.id} entrega={e} onAceitar={aceitarEntrega} />)
              )}
            </TabsContent>

            <TabsContent value="finalizadas" className="space-y-4 mt-0">
              {finalizadas.length === 0 ? (
                <EmptyState icon={CheckCircle} text="Nenhuma entrega finalizada hoje" />
              ) : (
                finalizadas.map(e => <EntregaCard key={e.id} entrega={e} onAceitar={aceitarEntrega} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <IniciarRotaModal
        isOpen={modalIniciarRota}
        onClose={() => { setModalIniciarRota(false); setEntregaParaIniciar(null); }}
        onConfirm={confirmarInicioRota}
        entregaNome={entregaParaIniciar?.clientes?.nome}
      />
    </EntregadorLayout>
  );
}
