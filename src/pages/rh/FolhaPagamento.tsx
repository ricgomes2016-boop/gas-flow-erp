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
import { DollarSign, Users, Download, Calendar, Calculator } from "lucide-react";

const folha = [
  { id: 1, funcionario: "João Silva", cargo: "Entregador", salarioBase: 2500, horasExtras: 350, descontos: 280, liquido: 2570 },
  { id: 2, funcionario: "Maria Santos", cargo: "Atendente", salarioBase: 1800, horasExtras: 0, descontos: 180, liquido: 1620 },
  { id: 3, funcionario: "Pedro Oliveira", cargo: "Motorista", salarioBase: 2800, horasExtras: 420, descontos: 320, liquido: 2900 },
  { id: 4, funcionario: "Ana Costa", cargo: "Gerente", salarioBase: 5500, horasExtras: 0, descontos: 650, liquido: 4850 },
  { id: 5, funcionario: "Carlos Ferreira", cargo: "Entregador", salarioBase: 2500, horasExtras: 280, descontos: 280, liquido: 2500 },
];

export default function FolhaPagamento() {
  const totalBruto = folha.reduce((acc, f) => acc + f.salarioBase + f.horasExtras, 0);
  const totalDescontos = folha.reduce((acc, f) => acc + f.descontos, 0);
  const totalLiquido = folha.reduce((acc, f) => acc + f.liquido, 0);

  return (
    <MainLayout>
      <Header title="Folha de Pagamento" subtitle="Gestão de salários e encargos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Folha de Pagamento</h1>
            <p className="text-muted-foreground">Gestão de salários e encargos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calculator className="h-4 w-4" />
              Calcular Folha
            </Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bruto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalBruto.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Salários + extras</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Descontos</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {totalDescontos.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">INSS, IR, etc</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalLiquido.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">A pagar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{folha.length}</div>
              <p className="text-xs text-muted-foreground">Na folha</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <CardTitle>Folha de Janeiro 2024</CardTitle>
              </div>
              <Badge>Em aberto</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Salário Base</TableHead>
                  <TableHead>Horas Extras</TableHead>
                  <TableHead>Descontos</TableHead>
                  <TableHead>Líquido</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {folha.map((func) => (
                  <TableRow key={func.id}>
                    <TableCell className="font-medium">{func.funcionario}</TableCell>
                    <TableCell>{func.cargo}</TableCell>
                    <TableCell>R$ {func.salarioBase.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-green-600">+ R$ {func.horasExtras.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-red-600">- R$ {func.descontos.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="font-bold">R$ {func.liquido.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Detalhes</Button>
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
