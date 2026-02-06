import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentSales = [
  {
    id: 1,
    customer: "Maria Silva",
    product: "Botijão P13",
    quantity: 2,
    total: 220,
    status: "entregue",
    time: "10:30",
  },
  {
    id: 2,
    customer: "João Santos",
    product: "Botijão P13",
    quantity: 1,
    total: 110,
    status: "pendente",
    time: "11:15",
  },
  {
    id: 3,
    customer: "Ana Oliveira",
    product: "Botijão P45",
    quantity: 1,
    total: 380,
    status: "em_rota",
    time: "12:00",
  },
  {
    id: 4,
    customer: "Carlos Ferreira",
    product: "Botijão P13",
    quantity: 3,
    total: 330,
    status: "entregue",
    time: "14:20",
  },
  {
    id: 5,
    customer: "Lucia Costa",
    product: "Botijão P13",
    quantity: 1,
    total: 110,
    status: "pendente",
    time: "15:45",
  },
];

const statusConfig = {
  entregue: { label: "Entregue", variant: "default" as const },
  pendente: { label: "Pendente", variant: "secondary" as const },
  em_rota: { label: "Em Rota", variant: "outline" as const },
};

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{sale.customer}</p>
                <p className="text-sm text-muted-foreground">
                  {sale.quantity}x {sale.product}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={statusConfig[sale.status].variant}>
                  {statusConfig[sale.status].label}
                </Badge>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    R$ {sale.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{sale.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
