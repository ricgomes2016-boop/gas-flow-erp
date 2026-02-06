import { useState } from "react";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Users,
  Package,
  Clock,
  CheckCircle,
  Navigation,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Rota {
  id: number;
  nome: string;
  bairros: string[];
  entregasPrevistas: number;
  distanciaKm: number;
  tempoEstimado: string;
  status: "disponivel" | "ocupada" | "selecionada";
  entregadorAtual?: string;
}

const rotasDisponiveis: Rota[] = [
  {
    id: 1,
    nome: "Rota Centro",
    bairros: ["Centro", "Vila Nova", "Jardim Europa"],
    entregasPrevistas: 15,
    distanciaKm: 12,
    tempoEstimado: "4h",
    status: "disponivel",
  },
  {
    id: 2,
    nome: "Rota Zona Norte",
    bairros: ["Santana", "Tucuruvi", "Tremembé"],
    entregasPrevistas: 12,
    distanciaKm: 18,
    tempoEstimado: "5h",
    status: "disponivel",
  },
  {
    id: 3,
    nome: "Rota Zona Sul",
    bairros: ["Moema", "Itaim Bibi", "Brooklin"],
    entregasPrevistas: 18,
    distanciaKm: 15,
    tempoEstimado: "5h30",
    status: "ocupada",
    entregadorAtual: "Pedro Santos",
  },
  {
    id: 4,
    nome: "Rota Zona Leste",
    bairros: ["Tatuapé", "Penha", "Mooca"],
    entregasPrevistas: 20,
    distanciaKm: 22,
    tempoEstimado: "6h",
    status: "selecionada",
  },
  {
    id: 5,
    nome: "Rota Zona Oeste",
    bairros: ["Pinheiros", "Perdizes", "Lapa"],
    entregasPrevistas: 14,
    distanciaKm: 14,
    tempoEstimado: "4h30",
    status: "disponivel",
  },
];

export default function EntregadorRotas() {
  const [rotas, setRotas] = useState<Rota[]>(rotasDisponiveis);
  const [rotaSelecionada, setRotaSelecionada] = useState<number | null>(4);
  const { toast } = useToast();

  const selecionarRota = (rotaId: number) => {
    const rota = rotas.find((r) => r.id === rotaId);
    if (rota?.status === "ocupada") {
      toast({
        title: "Rota indisponível",
        description: "Esta rota já está sendo atendida por outro entregador.",
        variant: "destructive",
      });
      return;
    }

    setRotas((prev) =>
      prev.map((r) => ({
        ...r,
        status:
          r.id === rotaId
            ? "selecionada"
            : r.status === "selecionada"
            ? "disponivel"
            : r.status,
      }))
    );
    setRotaSelecionada(rotaId);
    toast({
      title: "Rota selecionada!",
      description: `Você selecionou a ${rota?.nome}.`,
    });
  };

  const rotaAtual = rotas.find((r) => r.status === "selecionada");

  return (
    <EntregadorLayout title="Rotas">
      <div className="p-4 space-y-4">
        {/* Rota atual */}
        {rotaAtual && (
          <Card className="border-none shadow-md gradient-primary text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Navigation className="h-5 w-5" />
                Sua Rota de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold mb-3">{rotaAtual.nome}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {rotaAtual.bairros.map((bairro) => (
                  <Badge
                    key={bairro}
                    className="bg-white/20 text-white border-none"
                  >
                    {bairro}
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Package className="h-5 w-5 mx-auto mb-1 text-white/80" />
                  <p className="text-lg font-bold">{rotaAtual.entregasPrevistas}</p>
                  <p className="text-xs text-white/70">Entregas</p>
                </div>
                <div>
                  <MapPin className="h-5 w-5 mx-auto mb-1 text-white/80" />
                  <p className="text-lg font-bold">{rotaAtual.distanciaKm} km</p>
                  <p className="text-xs text-white/70">Distância</p>
                </div>
                <div>
                  <Clock className="h-5 w-5 mx-auto mb-1 text-white/80" />
                  <p className="text-lg font-bold">{rotaAtual.tempoEstimado}</p>
                  <p className="text-xs text-white/70">Tempo est.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de rotas */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Escolher Rota de Trabalho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={String(rotaSelecionada)}
              onValueChange={(value) => selecionarRota(Number(value))}
            >
              <div className="space-y-3">
                {rotas.map((rota) => (
                  <div
                    key={rota.id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      rota.status === "selecionada"
                        ? "border-primary bg-primary/5"
                        : rota.status === "ocupada"
                        ? "border-muted bg-muted/50 opacity-60"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem
                        value={String(rota.id)}
                        id={`rota-${rota.id}`}
                        disabled={rota.status === "ocupada"}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={`rota-${rota.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{rota.nome}</span>
                          {rota.status === "selecionada" && (
                            <Badge className="bg-primary text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Selecionada
                            </Badge>
                          )}
                          {rota.status === "ocupada" && (
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              {rota.entregadorAtual}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {rota.bairros.map((bairro) => (
                            <Badge
                              key={bairro}
                              variant="outline"
                              className="text-xs"
                            >
                              {bairro}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {rota.entregasPrevistas} entregas
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {rota.distanciaKm} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {rota.tempoEstimado}
                          </span>
                        </div>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Dica */}
        <Card className="border-none shadow-md bg-info/5 border-info/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-info mt-0.5" />
              <div>
                <p className="font-medium text-sm">Dica de performance</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rotas com mais entregas rendem mais pontos no ranking. A Rota
                  Zona Leste tem o maior número de entregas previstas hoje!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </EntregadorLayout>
  );
}
