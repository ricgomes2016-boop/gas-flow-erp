import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, AlertTriangle, CheckCircle2, TrendingDown, FileText } from "lucide-react";

const analises = [
  { 
    id: 1, 
    titulo: "Risco de Horas Extras Excessivas", 
    descricao: "3 funcionários ultrapassaram 44h semanais nos últimos 30 dias. Risco de processo trabalhista por excesso de jornada.",
    risco: "Alto",
    recomendacao: "Redistribuir carga de trabalho e contratar temporário para período de pico.",
    funcionarios: ["João Silva", "Pedro Santos", "Carlos Oliveira"]
  },
  { 
    id: 2, 
    titulo: "Intervalos Não Cumpridos", 
    descricao: "Identificados 12 registros de intervalos inferiores a 1h no setor operacional.",
    risco: "Médio",
    recomendacao: "Implementar sistema de alerta para garantir cumprimento do intervalo mínimo.",
    funcionarios: ["Setor Operacional"]
  },
  { 
    id: 3, 
    titulo: "Férias Vencidas", 
    descricao: "2 funcionários estão com período aquisitivo vencido há mais de 30 dias.",
    risco: "Alto",
    recomendacao: "Agendar férias imediatamente para evitar multas e passivos trabalhistas.",
    funcionarios: ["Maria Costa", "André Ferreira"]
  },
  { 
    id: 4, 
    titulo: "Documentação Vencida", 
    descricao: "3 motoristas com CNH próxima do vencimento (menos de 30 dias).",
    risco: "Médio",
    recomendacao: "Notificar funcionários e acompanhar renovação da documentação.",
    funcionarios: ["João Silva", "Carlos Oliveira", "Marcos Souza"]
  },
];

export default function PrevencaoTrabalhistaIA() {
  const riscoAlto = analises.filter(a => a.risco === "Alto").length;
  const riscoMedio = analises.filter(a => a.risco === "Médio").length;

  return (
    <MainLayout>
      <Header title="Prevenção Trabalhista - IA" subtitle="Análise inteligente de riscos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            Powered by AI
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Análises Ativas</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{analises.length}</div>
              <p className="text-xs text-muted-foreground">Pontos identificados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Risco Alto</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{riscoAlto}</div>
              <p className="text-xs text-muted-foreground">Ação imediata</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Risco Médio</CardTitle>
              <Shield className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{riscoMedio}</div>
              <p className="text-xs text-muted-foreground">Monitorar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Economia Potencial</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 45K</div>
              <p className="text-xs text-muted-foreground">Em multas evitadas</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {analises.map((analise) => (
            <Card key={analise.id} className={`border-l-4 ${
              analise.risco === "Alto" ? "border-l-red-600" : "border-l-yellow-600"
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {analise.risco === "Alto" ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Shield className="h-5 w-5 text-yellow-600" />
                    )}
                    <CardTitle className="text-lg">{analise.titulo}</CardTitle>
                  </div>
                  <Badge variant={analise.risco === "Alto" ? "destructive" : "secondary"}>
                    Risco {analise.risco}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{analise.descricao}</p>
                
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">Recomendação da IA</p>
                      <p className="text-sm text-muted-foreground">{analise.recomendacao}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Funcionários envolvidos:</span>
                  {analise.funcionarios.map((func, index) => (
                    <Badge key={index} variant="outline">{func}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
