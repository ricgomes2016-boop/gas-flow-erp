import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Package,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Flame,
  Medal,
} from "lucide-react";
import { Link } from "react-router-dom";

const entregadorData = {
  nome: "Carlos Silva",
  pontuacao: 850,
  ranking: 3,
  totalEntregadores: 12,
  metaMensal: 200,
  entregasMes: 156,
  entregasHoje: 8,
  avaliacaoMedia: 4.8,
  escalaHoje: { inicio: "08:00", fim: "17:00" },
  proximaFolga: "Domingo, 09/02",
};

const rankingTop5 = [
  { posicao: 1, nome: "Pedro Santos", pontos: 920, avatar: "PS" },
  { posicao: 2, nome: "João Oliveira", pontos: 875, avatar: "JO" },
  { posicao: 3, nome: "Carlos Silva", pontos: 850, avatar: "CS", isUser: true },
  { posicao: 4, nome: "André Costa", pontos: 810, avatar: "AC" },
  { posicao: 5, nome: "Lucas Ferreira", pontos: 780, avatar: "LF" },
];

const escalaProximosDias = [
  { dia: "Hoje", data: "06/02", turno: "08:00 - 17:00", status: "ativo" },
  { dia: "Sex", data: "07/02", turno: "08:00 - 17:00", status: "normal" },
  { dia: "Sáb", data: "08/02", turno: "08:00 - 14:00", status: "normal" },
  { dia: "Dom", data: "09/02", turno: "Folga", status: "folga" },
  { dia: "Seg", data: "10/02", turno: "08:00 - 17:00", status: "normal" },
];

const entregasPendentes = [
  { id: 1, cliente: "Maria Silva", endereco: "Rua das Flores, 123", horario: "10:30" },
  { id: 2, cliente: "João Santos", endereco: "Av. Brasil, 456", horario: "11:00" },
];

export default function EntregadorDashboard() {
  const progressoMeta = (entregadorData.entregasMes / entregadorData.metaMensal) * 100;

  return (
    <EntregadorLayout title="Início">
      <div className="p-4 space-y-4">
        {/* Header com saudação */}
        <div className="gradient-primary rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Olá,</p>
              <h1 className="text-xl font-bold">{entregadorData.nome}</h1>
              <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-none">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {entregadorData.avaliacaoMedia}
                </Badge>
                <Badge className="bg-white/20 text-white border-none">
                  <Trophy className="h-3 w-3 mr-1" />
                  #{entregadorData.ranking} lugar
                </Badge>
              </div>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {entregadorData.pontuacao}
              </div>
              <p className="text-xs text-white/80 mt-1">pontos</p>
            </div>
          </div>
        </div>

        {/* Cards de estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{entregadorData.entregasHoje}</p>
                  <p className="text-xs text-muted-foreground">Entregas hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{entregadorData.entregasMes}</p>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meta mensal */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Meta Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{entregadorData.entregasMes} entregas</span>
                <span className="text-muted-foreground">Meta: {entregadorData.metaMensal}</span>
              </div>
              <Progress value={progressoMeta} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                Faltam {entregadorData.metaMensal - entregadorData.entregasMes} entregas para atingir a meta
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Entregas pendentes */}
        {entregasPendentes.length > 0 && (
          <Card className="border-none shadow-md border-l-4 border-l-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="h-5 w-5 text-warning" />
                Entregas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entregasPendentes.map((entrega) => (
                <Link
                  key={entrega.id}
                  to={`/entregador/entregas/${entrega.id}`}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{entrega.cliente}</p>
                    <p className="text-xs text-muted-foreground">{entrega.endereco}</p>
                  </div>
                  <Badge variant="outline" className="text-warning border-warning">
                    <Clock className="h-3 w-3 mr-1" />
                    {entrega.horario}
                  </Badge>
                </Link>
              ))}
              <Link
                to="/entregador/entregas"
                className="block text-center text-sm text-primary font-medium mt-2"
              >
                Ver todas as entregas →
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Escala da semana */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Escala da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {escalaProximosDias.map((dia, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-20 p-3 rounded-lg text-center ${
                    dia.status === "ativo"
                      ? "gradient-primary text-white"
                      : dia.status === "folga"
                      ? "bg-success/10 text-success"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-xs font-medium">{dia.dia}</p>
                  <p className="text-lg font-bold">{dia.data.split("/")[0]}</p>
                  <p className="text-xs mt-1 truncate">
                    {dia.turno === "Folga" ? "🎉 Folga" : dia.turno.split(" - ")[0]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              Ranking do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rankingTop5.map((entregador) => (
              <div
                key={entregador.posicao}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  entregador.isUser ? "gradient-primary text-white" : "bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8">
                  {entregador.posicao <= 3 ? (
                    <Medal
                      className={`h-6 w-6 ${
                        entregador.posicao === 1
                          ? "text-yellow-500"
                          : entregador.posicao === 2
                          ? "text-gray-400"
                          : "text-amber-600"
                      }`}
                    />
                  ) : (
                    <span className="font-bold text-muted-foreground">
                      {entregador.posicao}º
                    </span>
                  )}
                </div>
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    entregador.isUser ? "bg-white/20" : "bg-primary/10 text-primary"
                  }`}
                >
                  {entregador.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {entregador.nome} {entregador.isUser && "(Você)"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{entregador.pontos}</p>
                  <p className={`text-xs ${entregador.isUser ? "text-white/70" : "text-muted-foreground"}`}>
                    pontos
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </EntregadorLayout>
  );
}
