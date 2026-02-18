import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function EmitirMDFe() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Truck className="h-6 w-6" />
        Emitir MDF-e
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Manifesto Eletrônico de Documentos Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo de emissão de MDF-e em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
