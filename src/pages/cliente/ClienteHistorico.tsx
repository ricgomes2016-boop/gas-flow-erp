import { ClienteLayout } from "@/components/cliente/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCliente } from "@/contexts/ClienteContext";
import { 
  History, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck,
  ChevronRight,
  ShoppingBag,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700", icon: Package },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

export default function ClienteHistorico() {
  const { purchases, cartItemsCount } = useCliente();

  return (
    <ClienteLayout cartItemsCount={cartItemsCount}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Minhas Compras</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{purchases.length}</p>
              <p className="text-sm text-muted-foreground">Total de pedidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">
                {purchases.filter(p => p.status === "delivered").length}
              </p>
              <p className="text-sm text-muted-foreground">Entregas realizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Purchase List */}
        {purchases.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold mb-1">Nenhuma compra ainda</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Faça seu primeiro pedido agora!
              </p>
              <Button asChild>
                <Link to="/cliente">Ver Produtos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {purchases.map(purchase => {
              const status = statusConfig[purchase.status];
              const StatusIcon = status.icon;
              
              return (
                <Card key={purchase.id}>
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Pedido #{purchase.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm font-medium">
                          {format(purchase.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>

                    <Separator className="my-3" />

                    {/* Items */}
                    <div className="space-y-2 mb-3">
                      {purchase.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            {item.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qtd: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Pago via {purchase.paymentMethod}
                        </p>
                        {purchase.discountApplied && purchase.discountApplied > 0 && (
                          <p className="text-xs text-green-600">
                            Desconto: -R$ {purchase.discountApplied.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-primary">
                          R$ {purchase.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" className="flex-1 gap-2" size="sm">
                        <RotateCcw className="h-4 w-4" />
                        Repetir Pedido
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Detalhes
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}
