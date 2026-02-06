import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Star, TrendingUp, Plus } from "lucide-react";

const metas = [
  {
    id: 1,
    titulo: "Vendas Mensais",
    descricao: "Atingir R$ 150.000 em vendas",
    atual: 125400,
    objetivo: 150000,
    tipo: "financeiro",
    prazo: "28/02/2026",
  },
  {
    id: 2,
    titulo: "Novos Clientes",
    descricao: "Cadastrar 50 novos clientes",
    atual: 38,
    objetivo: 50,
    tipo: "clientes",
    prazo: "28/02/2026",
  },
  {
    id: 3,
    titulo: "Tempo de Entrega",
    descricao: "Manter média abaixo de 30 min",
    atual: 28,
    objetivo: 30,
    tipo: "operacional",
    prazo: "Contínuo",
  },
];

const desafios = [
  {
    id: 1,
    titulo: "Rei das Entregas",
    descricao: "Entregador com mais entregas no mês",
    premio: "R$ 200,00",
    lider: "Carlos Souza",
    pontos: 145,
  },
  {
    id: 2,
    titulo: "Sem Reclamações",
    descricao: "Mês inteiro sem reclamações de clientes",
    premio: "Folga Extra",
    lider: "Equipe",
    pontos: 28,
  },
];

export default function MetasDesafios() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Metas e Desafios</h1>
            <p className="text-muted-foreground">Acompanhe o progresso e gamificação</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Metas Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">78%</p>
                  <p className="text-sm text-muted-foreground">Média Progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Desafios Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Star className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Metas Atingidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {metas.map((meta) => {
                const progresso = (meta.atual / meta.objetivo) * 100;
                return (
                  <div key={meta.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{meta.titulo}</p>
                        <p className="text-sm text-muted-foreground">{meta.descricao}</p>
                      </div>
                      <Badge variant="outline">{meta.prazo}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={Math.min(progresso, 100)} className="flex-1" />
                      <span className="text-sm font-medium w-16 text-right">
                        {progresso.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {meta.tipo === "financeiro"
                        ? `R$ ${meta.atual.toLocaleString()} / R$ ${meta.objetivo.toLocaleString()}`
                        : `${meta.atual} / ${meta.objetivo}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Desafios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Desafios Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {desafios.map((desafio) => (
                <div key={desafio.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{desafio.titulo}</p>
                      <p className="text-sm text-muted-foreground">{desafio.descricao}</p>
                    </div>
                    <Badge className="bg-yellow-500">{desafio.premio}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Líder: {desafio.lider}</span>
                    <span className="font-medium">{desafio.pontos} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
