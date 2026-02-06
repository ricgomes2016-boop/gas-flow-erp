import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Plus, Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const vales = [
  { id: 1, funcionario: "João Silva", tipo: "Adiantamento", valor: 500, data: "2024-01-15", status: "Pago", desconto: "Folha Jan" },
  { id: 2, funcionario: "Pedro Santos", tipo: "Vale Alimentação", valor: 200, data: "2024-01-16", status: "Pendente", desconto: "Folha Jan" },
  { id: 3, funcionario: "Maria Costa", tipo: "Adiantamento", valor: 800, data: "2024-01-14", status: "Pago", desconto: "Folha Jan" },
  { id: 4, funcionario: "Carlos Oliveira", tipo: "Empréstimo", valor: 1500, data: "2024-01-10", status: "Parcelado", desconto: "3x de R$500" },
  { id: 5, funcionario: "Ana Souza", tipo: "Vale Transporte", valor: 150, data: "2024-01-16", status: "Pendente", desconto: "Folha Jan" },
];

export default function ValeFuncionario() {
  const totalPendente = vales.filter(v => v.status === "Pendente").reduce((acc, v) => acc + v.valor, 0);
  const totalPago = vales.filter(v => v.status === "Pago").reduce((acc, v) => acc + v.valor, 0);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vale Funcionário</h1>
            <p className="text-muted-foreground">Controle de adiantamentos e vales</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Vale
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 3.150</div>
              <p className="text-xs text-muted-foreground">Em vales liberados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">R$ {totalPendente.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pagos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalPago.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Já liberados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">A Descontar</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ 2.650</div>
              <p className="text-xs text-muted-foreground">Na próxima folha</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vales e Adiantamentos</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar funcionário..." className="pl-10 w-[250px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vales.map((vale) => (
                  <TableRow key={vale.id}>
                    <TableCell className="font-medium">{vale.funcionario}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{vale.tipo}</Badge>
                    </TableCell>
                    <TableCell>{new Date(vale.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">R$ {vale.valor.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{vale.desconto}</TableCell>
                    <TableCell>
                      <Badge variant={
                        vale.status === "Pago" ? "default" :
                        vale.status === "Pendente" ? "secondary" : "outline"
                      }>
                        {vale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {vale.status === "Pendente" && (
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
