import { ClienteLayout } from "@/components/cliente/ClienteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Package, Tag, Megaphone } from "lucide-react";
import { useState } from "react";

export default function ClienteNotificacoes() {
  const [notifs, setNotifs] = useState({
    pedidos: true,
    promocoes: false,
    novidades: true,
    marketing: false,
  });

  const toggle = (key: keyof typeof notifs) =>
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  const items = [
    { key: "pedidos" as const, icon: Package, title: "Status do pedido", desc: "Atualizações sobre suas entregas" },
    { key: "promocoes" as const, icon: Tag, title: "Promoções", desc: "Ofertas e descontos exclusivos" },
    { key: "novidades" as const, icon: Bell, title: "Novidades", desc: "Novos produtos e funcionalidades" },
    { key: "marketing" as const, icon: Megaphone, title: "Marketing", desc: "Comunicações gerais da empresa" },
  ];

  return (
    <ClienteLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Notificações</h1>
        <Card>
          <CardContent className="p-0">
            {items.map((item, i) => (
              <div key={item.key} className={`flex items-center justify-between p-4 ${i > 0 ? "border-t" : ""}`}>
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="font-medium">{item.title}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch checked={notifs[item.key]} onCheckedChange={() => toggle(item.key)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ClienteLayout>
  );
}
