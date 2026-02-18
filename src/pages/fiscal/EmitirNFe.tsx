import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default function EmitirNFe() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Receipt className="h-6 w-6" />
        Emitir NF-e
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Nota Fiscal Eletrônica</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo de emissão de NF-e em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
