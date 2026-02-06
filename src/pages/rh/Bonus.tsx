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
import { Gift, Plus, DollarSign, Users, Target, TrendingUp } from "lucide-react";

const bonusList = [
  { id: 1, funcionario: "João Silva", tipo: "Meta Vendas", valor: 350, mes: "Janeiro", status: "Pago" },
  { id: 2, funcionario: "Pedro Santos", tipo: "Indicação Cliente", valor: 100, mes: "Janeiro", status: "Pago" },
  { id: 3, funcionario: "Maria Costa", tipo: "Aniversário Empresa", valor: 200, mes: "Janeiro", status: "Pendente" },
  { id: 4, funcionario: "André Oliveira", tipo: "Meta Vendas", valor: 280, mes: "Janeiro", status: "Pago" },
  { id: 5, funcionario: "Carlos Ferreira", tipo: "Pontualidade", valor: 150, mes: "Janeiro", status: "Pendente" },
];

export default function Bonus() {
  const totalPago = bonusList.filter(b => b.status === "Pago").reduce((acc, b) => acc + b.valor, 0);
  const totalPendente = bonusList.filter(b => b.status === "Pendente").reduce((acc, b) => acc + b.valor, 0);

  return (
    <MainLayout>
      <Header title="Bônus" subtitle="Gestão de bonificações extras" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bônus</h1>
            <p className="text-muted-foreground">Gestão de bonificações extras</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Bônus
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bônus (Mês)</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(totalPago + totalPendente).toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Janeiro 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pagos</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalPago.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Já liberados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Target className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">R$ {totalPendente.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">A pagar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Beneficiados</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{bonusList.length}</div>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Bônus</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mês Ref.</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonusList.map((bonus) => (
                  <TableRow key={bonus.id}>
                    <TableCell className="font-medium">{bonus.funcionario}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{bonus.tipo}</Badge>
                    </TableCell>
                    <TableCell>{bonus.mes}</TableCell>
                    <TableCell className="font-medium">R$ {bonus.valor.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={bonus.status === "Pago" ? "default" : "secondary"}>
                        {bonus.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {bonus.status === "Pendente" && (
                        <Button size="sm">Pagar</Button>
                      )}
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
