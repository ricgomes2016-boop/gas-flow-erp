import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Barcode, AlertTriangle } from "lucide-react";
import EmissaoBoleto from "./EmissaoBoleto";
import AgingReport from "./AgingReport";

export default function Cobrancas() {
  const [tab, setTab] = useState("boletos");

  return (
    <MainLayout>
      <Header title="Cobranças" subtitle="Boletos emitidos e análise de inadimplência" />
      <div className="p-4 md:p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="boletos" className="gap-1.5"><Barcode className="h-4 w-4" />Boletos</TabsTrigger>
            <TabsTrigger value="aging" className="gap-1.5"><AlertTriangle className="h-4 w-4" />Aging Report</TabsTrigger>
          </TabsList>

          <TabsContent value="boletos"><EmissaoBoleto embedded /></TabsContent>
          <TabsContent value="aging"><AgingReport embedded /></TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
