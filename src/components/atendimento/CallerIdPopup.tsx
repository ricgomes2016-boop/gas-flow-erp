import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Phone, MessageSquare, X, ShoppingCart, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChamadaRecebida {
  id: string;
  telefone: string;
  cliente_id: string | null;
  cliente_nome: string | null;
  tipo: string;
  status: string;
  created_at: string;
}

export function CallerIdPopup() {
  const [chamada, setChamada] = useState<ChamadaRecebida | null>(null);
  const [ultimoPedido, setUltimoPedido] = useState<any>(null);
  const navigate = useNavigate();

  const handleNovaChamada = useCallback(async (nova: ChamadaRecebida) => {
    setChamada(nova);
    setUltimoPedido(null);

    // Fetch last order if client identified
    if (nova.cliente_id) {
      const { data } = await supabase
        .from("pedidos")
        .select("id, valor_total, created_at, status")
        .eq("cliente_id", nova.cliente_id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data?.[0]) setUltimoPedido(data[0]);
    }

    // Auto-dismiss after 30s
    setTimeout(() => setChamada(null), 30000);
  }, []);

  useEffect(() => {
    let lastSeenId: string | null = null;

    const checkRecentCalls = async () => {
      const since = new Date(Date.now() - 90000).toISOString();
      const { data } = await supabase
        .from("chamadas_recebidas")
        .select("*")
        .eq("status", "recebida")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data?.[0] && data[0].id !== lastSeenId) {
        lastSeenId = data[0].id;
        handleNovaChamada(data[0] as ChamadaRecebida);
      }
    };

    // Check immediately on mount
    checkRecentCalls();

    // Poll every 5 seconds as fallback for when Realtime WebSocket fails
    const pollInterval = setInterval(checkRecentCalls, 5000);

    // Also subscribe to Realtime for instant notifications
    const channel = supabase
      .channel("caller-id-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chamadas_recebidas" },
        async (payload) => {
          const nova = payload.new as ChamadaRecebida;
          lastSeenId = nova.id;
          handleNovaChamada(nova);
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [handleNovaChamada]);

  if (!chamada) return null;

  const handleNovaVenda = async () => {
    // Mark as attended
    await supabase
      .from("chamadas_recebidas")
      .update({ status: "atendida" })
      .eq("id", chamada.id);

    if (chamada.cliente_id) {
      navigate(`/vendas/nova?cliente=${chamada.cliente_id}`);
    } else {
      navigate(`/vendas/nova?telefone=${encodeURIComponent(chamada.telefone)}`);
    }
    setChamada(null);
  };

  const handleVerPerfil = () => {
    if (chamada.cliente_id) {
      navigate(`/clientes/${chamada.cliente_id}`);
    }
    setChamada(null);
  };

  const handleDismiss = async () => {
    await supabase
      .from("chamadas_recebidas")
      .update({ status: "atendida" })
      .eq("id", chamada.id);
    setChamada(null);
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right-5 duration-300">
      <Card className="w-[380px] border-2 border-primary shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-500/10 animate-pulse">
                {chamada.tipo === "whatsapp" ? (
                  <MessageSquare className="h-5 w-5 text-green-600" />
                ) : (
                  <Phone className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  {chamada.tipo === "whatsapp" ? "WhatsApp" : "Chamada"} recebida
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(chamada.created_at), "HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {chamada.cliente_nome || chamada.telefone}
              </span>
              {chamada.cliente_id ? (
                <Badge variant="default" className="text-xs">Cliente</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Novo</Badge>
              )}
            </div>

            {chamada.cliente_nome && (
              <p className="text-sm text-muted-foreground">{chamada.telefone}</p>
            )}

            {ultimoPedido && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Último pedido: R$ {Number(ultimoPedido.valor_total).toFixed(2)} -{" "}
                  {format(new Date(ultimoPedido.created_at), "dd/MM/yy", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button size="sm" className="flex-1 gap-1.5" onClick={handleNovaVenda}>
              <ShoppingCart className="h-3.5 w-3.5" />
              Nova Venda
            </Button>
            {chamada.cliente_id && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleVerPerfil}>
                <User className="h-3.5 w-3.5" />
                Perfil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
