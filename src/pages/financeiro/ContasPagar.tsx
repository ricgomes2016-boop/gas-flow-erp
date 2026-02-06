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
import { CreditCard, Search, Plus, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const contasPagar = [
  { id: 1, fornecedor: "Distribuidora ABC", descricao: "Compra botijões P13", valor: 15000, vencimento: "2024-01-20", status: "Pendente", categoria: "Fornecedores" },
  { id: 2, fornecedor: "Posto Combustível", descricao: "Abastecimento frota", valor: 2500, vencimento: "2024-01-18", status: "Vencida", categoria: "Frota" },
  { id: 3, fornecedor: "Aluguel Galpão", descricao: "Aluguel Janeiro", valor: 4500, vencimento: "2024-01-25", status: "Pendente", categoria: "Infraestrutura" },
  { id: 4, fornecedor: "Energia Elétrica", descricao: "Conta de luz", valor: 1200, vencimento: "2024-01-22", status: "Pendente", categoria: "Utilidades" },
  { id: 5, fornecedor: "Nacional Gás", descricao: "Compra P45", valor: 8500, vencimento: "2024-01-15", status: "Paga", categoria: "Fornecedores" },
];

export default function ContasPagar() {
  const totalPendente = contasPagar.filter(c => c.status === "Pendente").reduce((acc, c) => acc + c.valor, 0);
  const totalVencido = contasPagar.filter(c => c.status === "Vencida").reduce((acc, c) => acc + c.valor, 0);
  const totalPago = contasPagar.filter(c => c.status === "Paga").reduce((acc, c) => acc + c.valor, 0);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas a Pagar</h1>
            <p className="text-muted-foreground">Gerencie todas as contas e despesas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(totalPendente + totalVencido).toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Em aberto</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {totalVencido.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Atenção urgente</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">R$ {totalPendente.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">A vencer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pagas (Mês)</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalPago.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Quitadas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Contas</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar conta..." className="pl-10 w-[300px]" />
                </div>
                <Button variant="outline">Filtros</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasPagar.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                    <TableCell>{conta.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{conta.categoria}</Badge>
                    </TableCell>
                    <TableCell>{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">R$ {conta.valor.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        conta.status === "Paga" ? "default" :
                        conta.status === "Vencida" ? "destructive" : "secondary"
                      }>
                        {conta.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {conta.status !== "Paga" && (
                          <Button size="sm">Pagar</Button>
                        )}
                        <Button variant="ghost" size="sm">Ver</Button>
                      </div>
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
