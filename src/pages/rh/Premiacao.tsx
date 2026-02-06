import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Gift, Star, Crown } from "lucide-react";

const premiacoes = [
  { id: 1, nome: "Entregador do Mês", meta: "Mais entregas realizadas", premio: "R$ 500 + Folga", ganhador: "João Silva", status: "Atingida" },
  { id: 2, nome: "Pontualidade Perfeita", meta: "30 dias sem atrasos", premio: "R$ 200", ganhador: null, status: "Em andamento" },
  { id: 3, nome: "Avaliação 5 Estrelas", meta: "Média 5.0 no mês", premio: "R$ 300", ganhador: null, status: "Em andamento" },
  { id: 4, nome: "Economizador", meta: "Menor consumo de combustível", premio: "R$ 250", ganhador: "Pedro Santos", status: "Atingida" },
];

const progressoMetas = [
  { funcionario: "João Silva", meta: "Entregador do Mês", progresso: 100, entregas: 245, objetivo: 200 },
  { funcionario: "Pedro Santos", meta: "Pontualidade", progresso: 87, diasSemAtraso: 26, objetivo: 30 },
  { funcionario: "André Costa", meta: "Avaliação 5★", progresso: 94, avaliacao: 4.7, objetivo: 5.0 },
  { funcionario: "Carlos Oliveira", meta: "Economizador", progresso: 78, consumo: 8.2, objetivo: 9.0 },
];

export default function Premiacao() {
  return (
    <MainLayout>
      <Header title="Premiações" subtitle="Incentivos e reconhecimento da equipe" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Premiações</h1>
            <p className="text-muted-foreground">Incentivos e reconhecimento da equipe</p>
          </div>
          <Button className="gap-2">
            <Gift className="h-4 w-4" />
            Nova Premiação
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premiações Ativas</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Metas Atingidas</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">2</div>
              <p className="text-xs text-muted-foreground">De 4 totais</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total em Prêmios</CardTitle>
              <Gift className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">R$ 1.250</div>
              <p className="text-xs text-muted-foreground">Distribuídos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Funcionários Premiados</CardTitle>
              <Crown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">2</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <CardTitle>Premiações do Mês</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {premiacoes.map((premiacao) => (
                <div key={premiacao.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{premiacao.nome}</h3>
                    <Badge variant={premiacao.status === "Atingida" ? "default" : "secondary"}>
                      {premiacao.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{premiacao.meta}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">{premiacao.premio}</span>
                    {premiacao.ganhador && (
                      <div className="flex items-center gap-1 text-sm">
                        <Crown className="h-3 w-3 text-yellow-500" />
                        {premiacao.ganhador}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle>Progresso das Metas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {progressoMetas.map((meta, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{meta.funcionario}</span>
                      <span className="text-sm text-muted-foreground ml-2">({meta.meta})</span>
                    </div>
                    <span className="text-sm font-medium">{meta.progresso}%</span>
                  </div>
                  <Progress value={meta.progresso} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
