import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard, Calendar, Settings, BarChart3,
} from "lucide-react";
import { RecebiveisPipeline } from "@/components/financeiro/RecebiveisPipeline";
import { ConferenciaCartao } from "@/components/financeiro/ConferenciaCartao";
import PagamentosCartaoRelatorio from "@/pages/financeiro/PagamentosCartao";

export default function GestaoCartoes() {
  const [activeTab, setActiveTab] = useState("pipeline");

  return (
    <MainLayout>
      <Header title="Gestão de Cartões" subtitle="Recebíveis, conciliação, liquidação e operadoras" />
      <div className="p-3 sm:p-4 md:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-wrap h-auto gap-1">
            <TabsTrigger value="pipeline" className="gap-1.5">
              <CreditCard className="h-4 w-4" />Recebíveis
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />Relatório
            </TabsTrigger>
            <TabsTrigger value="operadoras" className="gap-1.5">
              <Settings className="h-4 w-4" />Operadoras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <RecebiveisPipeline />
          </TabsContent>

          <TabsContent value="relatorio">
            <PagamentosCartaoRelatorio />
          </TabsContent>

          <TabsContent value="operadoras">
            <ConferenciaCartao />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
