import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Truck, Check, RefreshCw, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { haversineDistance } from "@/lib/haversine";
import { geocodeAddress } from "@/lib/geocoding";
import { useUnidade } from "@/contexts/UnidadeContext";

interface EntregadorReal {
  id: string;
  nome: string;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  entregasPendentes: number;
  distanciaKm: number;
}

interface SugestaoEntregadorProps {
  endereco?: string;
  onSelecionar?: (entregadorId: number | string, entregadorNome: string) => void;
  compact?: boolean;
}

export function SugestaoEntregador({ endereco, onSelecionar, compact = false }: SugestaoEntregadorProps) {
  const [isCalculando, setIsCalculando] = useState(false);
  const { unidadeAtual } = useUnidade();
  const [sugestao, setSugestao] = useState<{
    entregador: EntregadorReal | null;
    distancia: number;
    motivo: string;
  } | null>(null);

  const calcularMelhorEntregador = async () => {
    if (!endereco) return;
    setIsCalculando(true);
    setSugestao(null);

    try {
      // 1. Geocode the delivery address
      const coords = await geocodeAddress(endereco);
      if (!coords) {
        setSugestao({ entregador: null, distancia: 0, motivo: "Não foi possível localizar o endereço." });
        setIsCalculando(false);
        return;
      }

      // 2. Fetch real entregadores with coordinates
      let query = supabase
        .from("entregadores")
        .select("id, nome, status, latitude, longitude")
        .eq("ativo", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (unidadeAtual?.id) {
        query = query.eq("unidade_id", unidadeAtual.id);
      }

      const { data: entregadores, error } = await query;

      if (error || !entregadores || entregadores.length === 0) {
        setSugestao({ entregador: null, distancia: 0, motivo: "Nenhum entregador com localização disponível." });
        setIsCalculando(false);
        return;
      }

      // 3. Count pending deliveries per driver
      const { data: pedidosPendentes } = await supabase
        .from("pedidos")
        .select("entregador_id")
        .in("status", ["pendente", "confirmado", "em_rota"])
        .not("entregador_id", "is", null);

      const pendentesMap = new Map<string, number>();
      (pedidosPendentes || []).forEach((p) => {
        if (p.entregador_id) {
          pendentesMap.set(p.entregador_id, (pendentesMap.get(p.entregador_id) || 0) + 1);
        }
      });

      // 4. Calculate distances using Haversine
      const entregadoresComDistancia: EntregadorReal[] = entregadores
        .filter((e) => e.latitude != null && e.longitude != null)
        .map((e) => ({
          id: e.id,
          nome: e.nome,
          status: e.status,
          latitude: e.latitude,
          longitude: e.longitude,
          entregasPendentes: pendentesMap.get(e.id) || 0,
          distanciaKm: haversineDistance(
            coords.latitude, coords.longitude,
            e.latitude!, e.longitude!
          ),
        }))
        .sort((a, b) => a.distanciaKm - b.distanciaKm);

      const melhor = entregadoresComDistancia[0];

      if (melhor) {
        setSugestao({
          entregador: melhor,
          distancia: melhor.distanciaKm,
          motivo: melhor.status === "disponivel"
            ? "Mais próximo e disponível"
            : `Mais próximo (${melhor.entregasPendentes} entregas pendentes)`,
        });
      } else {
        setSugestao({ entregador: null, distancia: 0, motivo: "Nenhum entregador encontrado com localização." });
      }
    } catch (err) {
      console.error("Erro ao calcular sugestão:", err);
      setSugestao({ entregador: null, distancia: 0, motivo: "Erro ao calcular sugestão." });
    } finally {
      setIsCalculando(false);
    }
  };

  if (!sugestao && !isCalculando) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className={compact ? "p-3" : "pt-4"}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Sugestão de Entregador por IA</p>
              <p className="text-xs text-muted-foreground">
                {endereco
                  ? `Calcular melhor entregador para: ${endereco.substring(0, 30)}...`
                  : "Preencha o endereço para receber sugestão"}
              </p>
            </div>
            <Button
              size="sm"
              onClick={calcularMelhorEntregador}
              disabled={!endereco || isCalculando}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Sugerir
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCalculando) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className={compact ? "p-3" : "pt-4"}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Calculando melhor entregador...</p>
              <p className="text-xs text-muted-foreground">
                Analisando proximidade e disponibilidade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sugestao?.entregador) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className={compact ? "p-3" : "pt-4"}>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">Sugestão Inteligente</p>
                <Badge variant="secondary" className="text-[10px]">
                  Proximidade
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{sugestao.entregador.nome}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {sugestao.distancia < 1
                        ? `${(sugestao.distancia * 1000).toFixed(0)} m`
                        : `${sugestao.distancia.toFixed(1)} km`}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      {sugestao.entregador.entregasPendentes} pendentes
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-success mt-2">
                ✓ {sugestao.motivo}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {onSelecionar && (
                <Button
                  size="sm"
                  onClick={() => onSelecionar(sugestao.entregador!.id, sugestao.entregador!.nome)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Atribuir
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSugestao(null)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No suggestion found
  if (sugestao && !sugestao.entregador) {
    return (
      <Card className="border-muted">
        <CardContent className={compact ? "p-3" : "pt-4"}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Sem sugestão disponível</p>
              <p className="text-xs text-muted-foreground">{sugestao.motivo}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSugestao(null)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
