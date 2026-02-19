import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarDays } from "lucide-react";
import PlanejamentoAnual from "./PlanejamentoAnual";
import PlanejamentoMensal from "./PlanejamentoMensal";

export default function Planejamento() {
  return (
    <MainLayout>
      <Header title="Planejamento" subtitle="Visão anual e mensal da operação" />
      <div className="p-3 sm:p-4 md:p-6">
        <Tabs defaultValue="mensal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="mensal" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Planejamento Mensal</span>
            </TabsTrigger>
            <TabsTrigger value="anual" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Planejamento Anual</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mensal">
            <PlanejamentoMensal embedded />
          </TabsContent>
          <TabsContent value="anual">
            <PlanejamentoAnual embedded />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
