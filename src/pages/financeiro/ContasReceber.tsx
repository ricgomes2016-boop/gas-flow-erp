import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
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
import { Wallet, Search, Plus, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const contasReceber = [
  { id: 1, cliente: "Empresa ABC Ltda", descricao: "Venda a prazo", valor: 5500, vencimento: "2024-01-22", status: "Pendente", formaPagamento: "Boleto" },
  { id: 2, cliente: "Condomínio Central", descricao: "Entrega mensal", valor: 3200, vencimento: "2024-01-18", status: "Vencida", formaPagamento: "Boleto" },
  { id: 3, cliente: "Restaurante Sabor", descricao: "Fornecimento P45", valor: 1900, vencimento: "2024-01-25", status: "Pendente", formaPagamento: "PIX" },
  { id: 4, cliente: "Padaria Trigo Bom", descricao: "Entrega semanal", valor: 800, vencimento: "2024-01-20", status: "Pendente", formaPagamento: "Dinheiro" },
  { id: 5, cliente: "Hotel Plaza", descricao: "Contrato mensal", valor: 4500, vencimento: "2024-01-15", status: "Recebida", formaPagamento: "Transferência" },
];

export default function ContasReceber() {
  const totalPendente = contasReceber.filter(c => c.status === "Pendente").reduce((acc, c) => acc + c.valor, 0);
  const totalVencido = contasReceber.filter(c => c.status === "Vencida").reduce((acc, c) => acc + c.valor, 0);
  const totalRecebido = contasReceber.filter(c => c.status === "Recebida").reduce((acc, c) => acc + c.valor, 0);

  return (
    <MainLayout>
      <Header title="Contas a Receber" subtitle="Acompanhe os recebíveis" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas a Receber</h1>
            <p className="text-muted-foreground">Acompanhe todos os recebíveis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Recebível
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
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
              <p className="text-xs text-muted-foreground">Cobrar urgente</p>
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
              <CardTitle className="text-sm font-medium">Recebidas (Mês)</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalRecebido.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Confirmadas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Recebíveis</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar recebível..." className="pl-10 w-[300px]" />
                </div>
                <Button variant="outline">Filtros</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Forma Pgto</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasReceber.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">{conta.cliente}</TableCell>
                    <TableCell>{conta.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{conta.formaPagamento}</Badge>
                    </TableCell>
                    <TableCell>{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">R$ {conta.valor.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        conta.status === "Recebida" ? "default" :
                        conta.status === "Vencida" ? "destructive" : "secondary"
                      }>
                        {conta.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {conta.status !== "Recebida" && (
                          <Button size="sm">Receber</Button>
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
