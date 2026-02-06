import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, CheckCircle } from "lucide-react";

const deliveries = [
  { id: 1, address: "Rua das Flores, 123", status: "em_rota", time: "10:30" },
  { id: 2, address: "Av. Brasil, 456", status: "pendente", time: "11:00" },
  { id: 3, address: "Rua São Paulo, 789", status: "entregue", time: "09:15" },
  { id: 4, address: "Rua Minas Gerais, 321", status: "pendente", time: "11:30" },
];

const statusIcons = {
  entregue: CheckCircle,
  em_rota: Clock,
  pendente: MapPin,
};

const statusColors = {
  entregue: "text-success",
  em_rota: "text-warning",
  pendente: "text-muted-foreground",
};

export function DeliveriesMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entregas do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deliveries.map((delivery) => {
            const StatusIcon = statusIcons[delivery.status as keyof typeof statusIcons];
            const colorClass = statusColors[delivery.status as keyof typeof statusColors];

            return (
              <div
                key={delivery.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <StatusIcon className={`h-5 w-5 ${colorClass}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {delivery.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Previsão: {delivery.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
