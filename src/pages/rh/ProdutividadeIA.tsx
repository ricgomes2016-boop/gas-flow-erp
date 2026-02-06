import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Users, Target, Zap, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const produtividadeEquipe = [
  { nome: "João Silva", produtividade: 95, entregas: 245, meta: 200 },
  { nome: "Pedro Santos", produtividade: 88, entregas: 228, meta: 220 },
  { nome: "André Costa", produtividade: 82, entregas: 215, meta: 230 },
  { nome: "Carlos Oliveira", produtividade: 78, entregas: 195, meta: 220 },
  { nome: "Marcos Souza", produtividade: 72, entregas: 180, meta: 220 },
];

const insights = [
  { id: 1, tipo: "Positivo", mensagem: "João Silva superou a meta em 22.5% este mês. Considere reconhecimento especial.", icone: "🏆" },
  { id: 2, tipo: "Atenção", mensagem: "Marcos Souza apresentou queda de 15% na produtividade. Sugestão: verificar necessidade de treinamento.", icone: "📉" },
  { id: 3, tipo: "Oportunidade", mensagem: "Terças e quintas são os dias mais produtivos. Otimize as rotas nesses dias.", icone: "💡" },
  { id: 4, tipo: "Positivo", mensagem: "Média geral da equipe subiu 8% em relação ao mês anterior.", icone: "📈" },
];

const produtividadeSemanal = [
  { dia: "Seg", entregas: 180 },
  { dia: "Ter", entregas: 220 },
  { dia: "Qua", entregas: 195 },
  { dia: "Qui", entregas: 235 },
  { dia: "Sex", entregas: 210 },
  { dia: "Sáb", entregas: 165 },
];

export default function ProdutividadeIA() {
  const mediaProdutividade = Math.round(produtividadeEquipe.reduce((acc, p) => acc + p.produtividade, 0) / produtividadeEquipe.length);

  return (
    <MainLayout>
      <Header title="Produtividade - IA" subtitle="Análise inteligente de desempenho" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produtividade - IA</h1>
            <p className="text-muted-foreground">Análise inteligente de desempenho da equipe</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            Powered by AI
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Produtividade Média</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mediaProdutividade}%</div>
              <p className="text-xs text-muted-foreground">Da equipe</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Acima da Meta</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">3</div>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Precisam Atenção</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">2</div>
              <p className="text-xs text-muted-foreground">Abaixo de 80%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Insights IA</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{insights.length}</div>
              <p className="text-xs text-muted-foreground">Recomendações</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Produtividade por Dia da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={produtividadeSemanal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="entregas" fill="hsl(var(--primary))" name="Entregas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle>Insights da IA</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className={`p-3 rounded-lg ${
                  insight.tipo === "Positivo" ? "bg-green-50 dark:bg-green-950/20" :
                  insight.tipo === "Atenção" ? "bg-yellow-50 dark:bg-yellow-950/20" :
                  "bg-blue-50 dark:bg-blue-950/20"
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{insight.icone}</span>
                    <p className="text-sm">{insight.mensagem}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Desempenho Individual</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {produtividadeEquipe.map((funcionario) => (
              <div key={funcionario.nome} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{funcionario.nome}</span>
                    {funcionario.produtividade >= 90 && (
                      <Award className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{funcionario.entregas}/{funcionario.meta} entregas</span>
                    <Badge variant={funcionario.produtividade >= 80 ? "default" : "secondary"}>
                      {funcionario.produtividade}%
                    </Badge>
                  </div>
                </div>
                <Progress value={funcionario.produtividade} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
