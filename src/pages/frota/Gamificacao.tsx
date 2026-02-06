import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Award, Flame, Medal } from "lucide-react";

const ranking = [
  { posicao: 1, nome: "João Silva", pontos: 2850, entregas: 245, avaliacao: 4.9, conquistas: 12 },
  { posicao: 2, nome: "Pedro Santos", pontos: 2620, entregas: 228, avaliacao: 4.8, conquistas: 10 },
  { posicao: 3, nome: "André Costa", pontos: 2480, entregas: 215, avaliacao: 4.7, conquistas: 9 },
  { posicao: 4, nome: "Carlos Oliveira", pontos: 2150, entregas: 195, avaliacao: 4.6, conquistas: 7 },
  { posicao: 5, nome: "Marcos Souza", pontos: 1980, entregas: 180, avaliacao: 4.5, conquistas: 6 },
];

const conquistas = [
  { id: 1, nome: "100 Entregas", icone: "🎯", descricao: "Completou 100 entregas", desbloqueado: true },
  { id: 2, nome: "Sem Atrasos", icone: "⏰", descricao: "30 dias sem atrasos", desbloqueado: true },
  { id: 3, nome: "5 Estrelas", icone: "⭐", descricao: "Avaliação média 5.0", desbloqueado: false },
  { id: 4, nome: "Madrugador", icone: "🌅", descricao: "20 entregas antes das 8h", desbloqueado: true },
  { id: 5, nome: "Economizador", icone: "⛽", descricao: "Melhor consumo do mês", desbloqueado: false },
  { id: 6, nome: "Velocista", icone: "🚀", descricao: "Menor tempo médio de entrega", desbloqueado: true },
];

export default function Gamificacao() {
  return (
    <MainLayout>
      <Header title="Gamificação" subtitle="Ranking e conquistas dos motoristas" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gamificação</h1>
            <p className="text-muted-foreground">Ranking e conquistas dos motoristas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Líder do Mês</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">João Silva</div>
              <p className="text-xs text-muted-foreground">2.850 pontos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">12.080</div>
              <p className="text-xs text-muted-foreground">Distribuídos este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Metas Atingidas</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">85%</div>
              <p className="text-xs text-muted-foreground">Da equipe</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">44</div>
              <p className="text-xs text-muted-foreground">Desbloqueadas total</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <CardTitle>Ranking do Mês</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ranking.map((motorista) => (
                  <div key={motorista.posicao} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg" style={{
                      background: motorista.posicao === 1 ? 'linear-gradient(135deg, #ffd700, #ffb700)' :
                                  motorista.posicao === 2 ? 'linear-gradient(135deg, #c0c0c0, #a0a0a0)' :
                                  motorista.posicao === 3 ? 'linear-gradient(135deg, #cd7f32, #b87333)' : 'hsl(var(--muted))',
                      color: motorista.posicao <= 3 ? 'white' : 'inherit'
                    }}>
                      {motorista.posicao}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{motorista.nome}</span>
                        <span className="font-bold text-primary">{motorista.pontos} pts</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{motorista.entregas} entregas</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {motorista.avaliacao}
                        </span>
                        <span className="flex items-center gap-1">
                          <Medal className="h-3 w-3" />
                          {motorista.conquistas}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <CardTitle>Conquistas Disponíveis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {conquistas.map((conquista) => (
                  <div 
                    key={conquista.id} 
                    className={`p-4 rounded-lg border ${conquista.desbloqueado ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 opacity-60'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{conquista.icone}</span>
                      <div>
                        <p className="font-medium">{conquista.nome}</p>
                        <p className="text-xs text-muted-foreground">{conquista.descricao}</p>
                      </div>
                    </div>
                    {conquista.desbloqueado && (
                      <Badge className="mt-2" variant="default">Desbloqueado</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
