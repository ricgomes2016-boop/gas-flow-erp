import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Users, Shield, Bell } from "lucide-react";

const alertas = [
  { id: 1, funcionario: "João Silva", tipo: "Horas Extras", descricao: "Ultrapassou limite de 44h semanais", nivel: "Alto", data: "2024-01-16" },
  { id: 2, funcionario: "Pedro Santos", tipo: "Intervalo", descricao: "Intervalo de almoço inferior a 1h", nivel: "Médio", data: "2024-01-16" },
  { id: 3, funcionario: "Maria Costa", tipo: "Descanso Semanal", descricao: "Trabalhou no domingo sem compensação", nivel: "Alto", data: "2024-01-14" },
  { id: 4, funcionario: "Carlos Oliveira", tipo: "Jornada Noturna", descricao: "Jornada noturna sem adicional", nivel: "Médio", data: "2024-01-15" },
  { id: 5, funcionario: "Ana Souza", tipo: "Horas Extras", descricao: "Mais de 2h extras no dia", nivel: "Baixo", data: "2024-01-16" },
];

export default function AlertaJornada() {
  const alertasAltos = alertas.filter(a => a.nivel === "Alto").length;
  const alertasMedios = alertas.filter(a => a.nivel === "Médio").length;

  return (
    <MainLayout>
      <Header title="Alerta de Jornada" subtitle="Monitoramento de irregularidades" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Alerta de Jornada</h1>
            <p className="text-muted-foreground">Monitoramento de irregularidades trabalhistas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alertas.length}</div>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{alertasAltos}</div>
              <p className="text-xs text-muted-foreground">Requer ação imediata</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Média Prioridade</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{alertasMedios}</div>
              <p className="text-xs text-muted-foreground">Monitorar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">4</div>
              <p className="text-xs text-muted-foreground">Com alertas ativos</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <CardTitle>Alertas de Jornada</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div key={alerta.id} className={`p-4 rounded-lg border-l-4 ${
                  alerta.nivel === "Alto" ? "border-l-red-600 bg-red-50 dark:bg-red-950/20" :
                  alerta.nivel === "Médio" ? "border-l-yellow-600 bg-yellow-50 dark:bg-yellow-950/20" :
                  "border-l-blue-600 bg-blue-50 dark:bg-blue-950/20"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${
                        alerta.nivel === "Alto" ? "text-red-600" :
                        alerta.nivel === "Médio" ? "text-yellow-600" : "text-blue-600"
                      }`} />
                      <div>
                        <p className="font-medium">{alerta.funcionario}</p>
                        <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        alerta.nivel === "Alto" ? "destructive" :
                        alerta.nivel === "Médio" ? "secondary" : "outline"
                      }>
                        {alerta.tipo}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(alerta.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
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
