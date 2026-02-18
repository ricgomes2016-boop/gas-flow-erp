import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { AiAssistantChat } from "@/components/ai/AiAssistantChat";
import { Bot } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AssistenteIA() {
  return (
    <MainLayout>
      <Header title="Assistente IA" subtitle="Consulte dados do sistema em linguagem natural" />
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-primary/5">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-semibold">Assistente Inteligente</span>
            <span className="text-xs text-muted-foreground ml-auto">Pergunte sobre vendas, estoque, financeiro, RH...</span>
          </div>
          <AiAssistantChat fullPage />
        </Card>
      </div>
    </MainLayout>
  );
}
