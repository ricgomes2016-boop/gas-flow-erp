import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor } from "lucide-react";

export default function EmitirNFCe() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Monitor className="h-6 w-6" />
        Emitir NFC-e
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Nota Fiscal de Consumidor Eletrônica</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo de emissão de NFC-e em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
