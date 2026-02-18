import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Route } from "lucide-react";

export default function EmitirCTe() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Route className="h-6 w-6" />
        Emitir CT-e
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Conhecimento de Transporte Eletrônico</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo de emissão de CT-e em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
