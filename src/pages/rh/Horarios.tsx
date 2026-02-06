import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Users, Edit, Calendar, Sun, Moon } from "lucide-react";

const horarios = [
  { id: 1, funcionario: "João Silva", cargo: "Entregador", turno: "Manhã", entrada: "07:00", saida: "16:00", intervalo: "1h", diasSemana: "Seg-Sáb" },
  { id: 2, funcionario: "Pedro Santos", cargo: "Entregador", turno: "Tarde", entrada: "12:00", saida: "21:00", intervalo: "1h", diasSemana: "Seg-Sáb" },
  { id: 3, funcionario: "Maria Costa", cargo: "Atendente", turno: "Comercial", entrada: "08:00", saida: "18:00", intervalo: "2h", diasSemana: "Seg-Sex" },
  { id: 4, funcionario: "Carlos Oliveira", cargo: "Motorista", turno: "Manhã", entrada: "06:00", saida: "15:00", intervalo: "1h", diasSemana: "Seg-Sáb" },
  { id: 5, funcionario: "Ana Souza", cargo: "Gerente", turno: "Comercial", entrada: "08:00", saida: "18:00", intervalo: "2h", diasSemana: "Seg-Sex" },
];

export default function Horarios() {
  const turnoManha = horarios.filter(h => h.turno === "Manhã").length;
  const turnoTarde = horarios.filter(h => h.turno === "Tarde").length;

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Horários</h1>
            <p className="text-muted-foreground">Gestão de jornadas e turnos de trabalho</p>
          </div>
          <Button className="gap-2">
            <Calendar className="h-4 w-4" />
            Novo Horário
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Funcionários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{horarios.length}</div>
              <p className="text-xs text-muted-foreground">Com horário definido</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Turno Manhã</CardTitle>
              <Sun className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{turnoManha}</div>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Turno Tarde</CardTitle>
              <Moon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{turnoTarde}</div>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comercial</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{horarios.length - turnoManha - turnoTarde}</div>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quadro de Horários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Intervalo</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {horarios.map((horario) => (
                  <TableRow key={horario.id}>
                    <TableCell className="font-medium">{horario.funcionario}</TableCell>
                    <TableCell>{horario.cargo}</TableCell>
                    <TableCell>
                      <Badge variant={
                        horario.turno === "Manhã" ? "default" :
                        horario.turno === "Tarde" ? "secondary" : "outline"
                      }>
                        {horario.turno}
                      </Badge>
                    </TableCell>
                    <TableCell>{horario.entrada}</TableCell>
                    <TableCell>{horario.saida}</TableCell>
                    <TableCell>{horario.intervalo}</TableCell>
                    <TableCell>{horario.diasSemana}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
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
