import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function RelatoriosNotas() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        Relatórios de Notas Emitidas
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo de relatórios fiscais em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
