import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
} from "lucide-react";

const funcionarios = [
  {
    id: 1,
    nome: "Carlos Souza",
    cargo: "Entregador",
    horasSemanais: 44,
    horasExtras: 6,
    status: "regular",
    ultimoRegistro: "06/02/2026 08:00",
  },
  {
    id: 2,
    nome: "Roberto Lima",
    cargo: "Entregador",
    horasSemanais: 48,
    horasExtras: 12,
    status: "alerta",
    ultimoRegistro: "06/02/2026 07:45",
  },
  {
    id: 3,
    nome: "Fernando Alves",
    cargo: "Atendente",
    horasSemanais: 40,
    horasExtras: 0,
    status: "regular",
    ultimoRegistro: "06/02/2026 08:30",
  },
];

export default function DashboardTrabalhista() {
  return (
    <MainLayout>
      <Header title="Dashboard Trabalhista" subtitle="Controle de jornadas e horas extras" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard Trabalhista
            </h1>
            <p className="text-muted-foreground">
              Controle de jornada e conformidade trabalhista
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Funcionários</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">528h</p>
                  <p className="text-sm text-muted-foreground">Horas Trabalhadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">95%</p>
                  <p className="text-sm text-muted-foreground">Conformidade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Jornada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                <div>
                  <p className="font-medium">Roberto Lima - Excesso de horas extras</p>
                  <p className="text-sm text-muted-foreground">
                    12 horas extras esta semana (limite: 10h)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                <div>
                  <p className="font-medium">Carlos Souza - Intervalo irregular</p>
                  <p className="text-sm text-muted-foreground">
                    Intervalo de almoço menor que 1 hora ontem
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Funcionários */}
        <Card>
          <CardHeader>
            <CardTitle>Controle de Jornada</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Horas Semanais</TableHead>
                  <TableHead>Horas Extras</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionarios.map((func) => (
                  <TableRow key={func.id}>
                    <TableCell className="font-medium">{func.nome}</TableCell>
                    <TableCell>{func.cargo}</TableCell>
                    <TableCell>{func.horasSemanais}h</TableCell>
                    <TableCell>{func.horasExtras}h</TableCell>
                    <TableCell>
                      <Badge
                        variant={func.status === "regular" ? "default" : "destructive"}
                      >
                        {func.status === "regular" ? "Regular" : "Alerta"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {func.ultimoRegistro}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
