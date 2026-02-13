import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Clock, Users, Edit, Calendar, Sun, Moon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Horarios() {
  const { data: horarios = [], isLoading } = useQuery({
    queryKey: ["horarios-funcionario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horarios_funcionario")
        .select("*, funcionarios(nome, cargo)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const turnoManha = horarios.filter((h: any) => h.turno === "manha").length;
  const turnoTarde = horarios.filter((h: any) => h.turno === "tarde").length;

  return (
    <MainLayout>
      <Header title="Horários" subtitle="Gestão de jornadas e turnos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Horários</h1>
            <p className="text-muted-foreground">Gestão de jornadas e turnos de trabalho</p>
          </div>
          <Button className="gap-2"><Calendar className="h-4 w-4" />Novo Horário</Button>
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
              <Sun className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{turnoManha}</div>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Turno Tarde</CardTitle>
              <Moon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{turnoTarde}</div>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comercial</CardTitle>
              <Clock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{horarios.length - turnoManha - turnoTarde}</div>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Quadro de Horários</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : horarios.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum horário cadastrado</p>
            ) : (
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
                  {horarios.map((h: any) => {
                    const turnoLabel: Record<string, string> = { manha: "Manhã", tarde: "Tarde", comercial: "Comercial", noturno: "Noturno" };
                    return (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium">{h.funcionarios?.nome || "N/A"}</TableCell>
                        <TableCell>{h.funcionarios?.cargo || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={h.turno === "manha" ? "default" : h.turno === "tarde" ? "secondary" : "outline"}>
                            {turnoLabel[h.turno] || h.turno}
                          </Badge>
                        </TableCell>
                        <TableCell>{h.entrada}</TableCell>
                        <TableCell>{h.saida}</TableCell>
                        <TableCell>{h.intervalo}</TableCell>
                        <TableCell>{h.dias_semana}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
