import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Truck, Clock, Check, RefreshCw, User } from "lucide-react";

// Mock data de entregadores com localização
const entregadoresDisponiveis = [
  {
    id: 1,
    nome: "Carlos Souza",
    status: "em_rota",
    lat: -23.5605,
    lng: -46.6433,
    entregasPendentes: 2,
    distanciaKm: 0,
  },
  {
    id: 2,
    nome: "Roberto Lima",
    status: "disponivel",
    lat: -23.5505,
    lng: -46.6333,
    entregasPendentes: 0,
    distanciaKm: 0,
  },
  {
    id: 3,
    nome: "Fernando Alves",
    status: "em_rota",
    lat: -23.5405,
    lng: -46.6533,
    entregasPendentes: 1,
    distanciaKm: 0,
  },
  {
    id: 4,
    nome: "Pedro Santos",
    status: "disponivel",
    lat: -23.5555,
    lng: -46.6383,
    entregasPendentes: 0,
    distanciaKm: 0,
  },
];

// Função para calcular distância entre dois pontos (Haversine formula)
function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Mock coordenadas de endereços
const enderecosCoordenadas: Record<string, { lat: number; lng: number }> = {
  "Rua das Flores, 123": { lat: -23.5655, lng: -46.6483 },
  "Av. Brasil, 456": { lat: -23.5555, lng: -46.6383 },
  "Rua São Paulo, 789": { lat: -23.5355, lng: -46.6583 },
  "Rua do Comércio, 789": { lat: -23.5455, lng: -46.6433 },
  "Rua Nova, 321": { lat: -23.5705, lng: -46.6533 },
};

interface SugestaoEntregadorProps {
  endereco?: string;
  onSelecionar?: (entregadorId: number, entregadorNome: string) => void;
  compact?: boolean;
}

export function SugestaoEntregador({ endereco, onSelecionar, compact = false }: SugestaoEntregadorProps) {
  const [isCalculando, setIsCalculando] = useState(false);
  const [sugestao, setSugestao] = useState<{
    entregador: typeof entregadoresDisponiveis[0] | null;
    distancia: number;
    motivo: string;
  } | null>(null);

  const calcularMelhorEntregador = () => {
    setIsCalculando(true);
    
    // Simular delay de cálculo
    setTimeout(() => {
      // Obter coordenadas do endereço
      const coords = endereco 
        ? enderecosCoordenadas[endereco] || { lat: -23.5505, lng: -46.6333 }
        : { lat: -23.5505, lng: -46.6333 };

      // Calcular distância para cada entregador
      const entregadoresComDistancia = entregadoresDisponiveis
        .filter(e => e.status === "disponivel" || e.status === "em_rota")
        .map(e => ({
          ...e,
          distanciaKm: calcularDistancia(e.lat, e.lng, coords.lat, coords.lng)
        }))
        .sort((a, b) => a.distanciaKm - b.distanciaKm);

      const melhor = entregadoresComDistancia[0];

      if (melhor) {
        setSugestao({
          entregador: melhor,
          distancia: melhor.distanciaKm,
          motivo: melhor.status === "disponivel" 
            ? "Mais próximo e disponível" 
            : `Mais próximo (${melhor.entregasPendentes} entregas pendentes)`
        });
      }

      setIsCalculando(false);
    }, 800);
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
              {isCalculando ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Sugerir
                </>
              )}
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
                <p className="font-medium text-sm">Sugestão da IA</p>
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
                      {sugestao.distancia.toFixed(1)} km
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

  return null;
}
