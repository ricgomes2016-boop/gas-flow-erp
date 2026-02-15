import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, PlusCircle, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: "Nova Venda", icon: PlusCircle, path: "/vendas/nova", variant: "default" as const },
    { label: "Abrir PDV", icon: Monitor, path: "/vendas/pdv", variant: "outline" as const },
    { label: "Ver Pedidos", icon: ShoppingCart, path: "/vendas/pedidos", variant: "outline" as const },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button
            key={a.path}
            variant={a.variant}
            size="sm"
            className="gap-2"
            onClick={() => navigate(a.path)}
          >
            <a.icon className="h-4 w-4" />
            {a.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
