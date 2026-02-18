import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet } from "lucide-react";

export default function GerarXML() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FileSpreadsheet className="h-6 w-6" />
        Gerar XML
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Exportação de Arquivos XML</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo de geração de XML em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
