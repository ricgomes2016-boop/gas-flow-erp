import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
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
import { Clock, TrendingUp, TrendingDown, Users, Calendar } from "lucide-react";

const bancoHoras = [
  { id: 1, funcionario: "João Silva", saldoPositivo: 12, saldoNegativo: 0, saldoTotal: 12, ultimaAtualizacao: "2024-01-16" },
  { id: 2, funcionario: "Pedro Santos", saldoPositivo: 8, saldoNegativo: 2, saldoTotal: 6, ultimaAtualizacao: "2024-01-16" },
  { id: 3, funcionario: "Maria Costa", saldoPositivo: 0, saldoNegativo: 4, saldoTotal: -4, ultimaAtualizacao: "2024-01-15" },
  { id: 4, funcionario: "Carlos Oliveira", saldoPositivo: 15, saldoNegativo: 0, saldoTotal: 15, ultimaAtualizacao: "2024-01-16" },
  { id: 5, funcionario: "Ana Souza", saldoPositivo: 5, saldoNegativo: 3, saldoTotal: 2, ultimaAtualizacao: "2024-01-14" },
];

export default function BancoHoras() {
  const totalPositivo = bancoHoras.reduce((acc, b) => acc + b.saldoPositivo, 0);
  const totalNegativo = bancoHoras.reduce((acc, b) => acc + b.saldoNegativo, 0);

  return (
    <MainLayout>
      <Header title="Banco de Horas" subtitle="Controle de horas trabalhadas" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Banco de Horas</h1>
            <p className="text-muted-foreground">Controle de horas trabalhadas e compensações</p>
          </div>
          <Button className="gap-2">
            <Clock className="h-4 w-4" />
            Lançar Horas
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPositivo - totalNegativo}h</div>
              <p className="text-xs text-muted-foreground">Equipe toda</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Horas Positivas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalPositivo}h</div>
              <p className="text-xs text-muted-foreground">A compensar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Horas Negativas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalNegativo}h</div>
              <p className="text-xs text-muted-foreground">A repor</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{bancoHoras.length}</div>
              <p className="text-xs text-muted-foreground">Com banco ativo</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Saldo por Funcionário</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Horas Positivas</TableHead>
                  <TableHead>Horas Negativas</TableHead>
                  <TableHead>Saldo Total</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bancoHoras.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell className="font-medium">{registro.funcionario}</TableCell>
                    <TableCell className="text-green-600">+{registro.saldoPositivo}h</TableCell>
                    <TableCell className="text-red-600">-{registro.saldoNegativo}h</TableCell>
                    <TableCell>
                      <Badge variant={registro.saldoTotal >= 0 ? "default" : "destructive"}>
                        {registro.saldoTotal >= 0 ? "+" : ""}{registro.saldoTotal}h
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(registro.ultimaAtualizacao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Histórico</Button>
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
