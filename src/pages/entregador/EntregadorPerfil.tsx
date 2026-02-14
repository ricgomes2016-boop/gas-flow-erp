import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  Star,
  Trophy,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  LogOut,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const perfilData = {
  nome: "Carlos Silva",
  email: "carlos.silva@empresa.com",
  telefone: "(11) 99999-8888",
  endereco: "Rua das Palmeiras, 456 - Centro",
  dataAdmissao: "15/03/2023",
  veiculo: "Honda CG 160 - ABC-1234",
  avaliacaoMedia: 4.8,
  totalAvaliacoes: 245,
  ranking: 3,
  pontosMes: 850,
  entregasTotais: 1847,
  entregasMes: 156,
  kmRodados: 4520,
  tempoMedio: "18 min",
};

const conquistas = [
  { id: 1, nome: "100 Entregas", icon: "🎯", conquistada: true },
  { id: 2, nome: "500 Entregas", icon: "🚀", conquistada: true },
  { id: 3, nome: "1000 Entregas", icon: "⭐", conquistada: true },
  { id: 4, nome: "Nota 5.0", icon: "🏆", conquistada: false },
  { id: 5, nome: "Top 3 Mensal", icon: "🥉", conquistada: true },
  { id: 6, nome: "Sem Atrasos", icon: "⏰", conquistada: true },
];

const menuItems = [
  { label: "Configurações", icon: Settings, path: "/entregador/configuracoes" },
  { label: "Histórico de Entregas", icon: Clock, path: "/entregador/historico" },
  { label: "Meus Ganhos", icon: TrendingUp, path: "/entregador/ganhos" },
];

export default function EntregadorPerfil() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <EntregadorLayout title="Perfil">
      <div className="p-4 space-y-4">
        {/* Card do perfil */}
        <Card className="border-none shadow-md overflow-hidden">
          <div className="gradient-primary p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                CS
              </div>
              <div>
                <h2 className="text-xl font-bold">{perfilData.nome}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{perfilData.avaliacaoMedia}</span>
                  <span className="text-white/70 text-sm">
                    ({perfilData.totalAvaliacoes} avaliações)
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-none">
                    <Trophy className="h-3 w-3 mr-1" />
                    #{perfilData.ranking} no ranking
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{perfilData.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{perfilData.telefone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{perfilData.endereco}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>{perfilData.veiculo}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Desde {perfilData.dataAdmissao}</span>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {perfilData.entregasTotais}
                </p>
                <p className="text-xs text-muted-foreground">Entregas Totais</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {perfilData.entregasMes}
                </p>
                <p className="text-xs text-muted-foreground">Este Mês</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {perfilData.kmRodados}
                </p>
                <p className="text-xs text-muted-foreground">Km Rodados</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {perfilData.tempoMedio}
                </p>
                <p className="text-xs text-muted-foreground">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {conquistas.map((conquista) => (
                <Badge
                  key={conquista.id}
                  variant={conquista.conquistada ? "default" : "outline"}
                  className={
                    conquista.conquistada
                      ? "gradient-primary text-white"
                      : "opacity-50"
                  }
                >
                  <span className="mr-1">{conquista.icon}</span>
                  {conquista.nome}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu */}
        <Card className="border-none shadow-md">
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center justify-between p-4 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Botão Sair */}
        <Button
          variant="outline"
          className="w-full h-12 text-destructive border-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sair do App
        </Button>
      </div>
    </EntregadorLayout>
  );
}
