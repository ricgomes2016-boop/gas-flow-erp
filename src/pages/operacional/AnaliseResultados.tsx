import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, Calculator } from "lucide-react";
import ResultadoOperacional from "./ResultadoOperacional";
import DRE from "./DRE";
import PontoEquilibrio from "./PontoEquilibrio";

export default function AnaliseResultados() {
  return (
    <MainLayout>
      <Header title="Análise de Resultados" subtitle="DRE, resultado operacional e ponto de equilíbrio" />
      <div className="p-3 sm:p-4 md:p-6">
        <Tabs defaultValue="resultado" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="resultado" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Resultado Operacional</span>
              <span className="sm:hidden">RO</span>
            </TabsTrigger>
            <TabsTrigger value="dre" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>DRE</span>
            </TabsTrigger>
            <TabsTrigger value="equilibrio" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Ponto de Equilíbrio</span>
              <span className="sm:hidden">PE</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resultado">
            <ResultadoOperacional embedded />
          </TabsContent>
          <TabsContent value="dre">
            <DRE embedded />
          </TabsContent>
          <TabsContent value="equilibrio">
            <PontoEquilibrio embedded />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
