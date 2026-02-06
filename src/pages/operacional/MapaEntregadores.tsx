import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Navigation, RefreshCw } from "lucide-react";

const entregadores = [
  {
    id: 1,
    nome: "Carlos Souza",
    status: "em_rota",
    localizacao: "Rua das Flores, 123 - Centro",
    ultimaAtualizacao: "há 2 min",
    entregaAtual: "João Silva",
  },
  {
    id: 2,
    nome: "Roberto Lima",
    status: "disponivel",
    localizacao: "Base - Matriz",
    ultimaAtualizacao: "há 5 min",
    entregaAtual: null,
  },
  {
    id: 3,
    nome: "Fernando Alves",
    status: "em_rota",
    localizacao: "Av. Brasil, 456 - Zona Sul",
    ultimaAtualizacao: "há 1 min",
    entregaAtual: "Maria Santos",
  },
];

export default function MapaEntregadores() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Mapa dos Entregadores
            </h1>
            <p className="text-muted-foreground">
              Localização em tempo real da frota
            </p>
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lista de Entregadores */}
          <div className="space-y-4">
            <h3 className="font-semibold">Entregadores Ativos</h3>
            {entregadores.map((entregador) => (
              <Card key={entregador.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{entregador.nome}</p>
                        <Badge
                          variant={
                            entregador.status === "em_rota" ? "default" : "secondary"
                          }
                        >
                          {entregador.status === "em_rota" ? "Em Rota" : "Disponível"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {entregador.localizacao}
                      </p>
                      {entregador.entregaAtual && (
                        <p className="text-sm text-primary mt-1">
                          → {entregador.entregaAtual}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Atualizado {entregador.ultimaAtualizacao}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mapa */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Mapa em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Integração com Google Maps
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Visualização em tempo real dos entregadores
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
