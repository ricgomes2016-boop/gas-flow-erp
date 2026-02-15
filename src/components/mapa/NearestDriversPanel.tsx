import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Truck, X } from "lucide-react";
import { haversineDistance } from "@/lib/haversine";
import { Entregador, ClienteEntrega } from "./DeliveryRoutesMap";

interface NearestDriversPanelProps {
  selectedCliente: ClienteEntrega | null;
  entregadores: Entregador[];
  onClose: () => void;
  onSelectRoute: (entregadorId: string) => void;
}

export function NearestDriversPanel({
  selectedCliente,
  entregadores,
  onClose,
  onSelectRoute,
}: NearestDriversPanelProps) {
  if (!selectedCliente) return null;

  const driversWithDistance = entregadores
    .map((e) => ({
      ...e,
      distancia: haversineDistance(
        selectedCliente.lat,
        selectedCliente.lng,
        e.lat,
        e.lng
      ),
    }))
    .sort((a, b) => a.distancia - b.distancia);

  return (
    <Card className="absolute bottom-4 left-4 z-[1000] w-72 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {selectedCliente.cliente}
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1.5 max-h-[200px] overflow-y-auto">
        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">
          Entregadores mais próximos
        </p>
        {driversWithDistance.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Nenhum entregador com localização
          </p>
        )}
        {driversWithDistance.map((e, idx) => (
          <button
            key={e.id}
            onClick={() => onSelectRoute(e.id)}
            className="flex items-center justify-between p-2 rounded-lg border text-sm w-full text-left transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                {idx + 1}
              </div>
              <div>
                <span className="font-medium block text-xs">{e.nome}</span>
                <Badge
                  variant={e.status === "em_rota" ? "default" : "secondary"}
                  className="text-[9px] h-4"
                >
                  {e.status === "em_rota" ? "Em Rota" : "Livre"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-primary">
                {e.distancia < 1
                  ? `${Math.round(e.distancia * 1000)}m`
                  : `${e.distancia.toFixed(1)}km`}
              </span>
              <Navigation className="h-3 w-3 text-muted-foreground" />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
