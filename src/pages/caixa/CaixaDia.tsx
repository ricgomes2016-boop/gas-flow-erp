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
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Minus,
  Lock,
  Unlock,
} from "lucide-react";

const movimentacoes = [
  { id: 1, tipo: "entrada", descricao: "Venda #001 - João Silva", valor: 220.0, hora: "10:30" },
  { id: 2, tipo: "entrada", descricao: "Venda #002 - Maria Santos", valor: 180.0, hora: "10:45" },
  { id: 3, tipo: "saida", descricao: "Troco para entregador", valor: 50.0, hora: "11:00" },
  { id: 4, tipo: "entrada", descricao: "Venda #003 - Pedro Costa", valor: 110.0, hora: "11:15" },
  { id: 5, tipo: "saida", descricao: "Despesa - Combustível", valor: 100.0, hora: "12:00" },
];

export default function CaixaDia() {
  const totalEntradas = movimentacoes
    .filter((m) => m.tipo === "entrada")
    .reduce((acc, m) => acc + m.valor, 0);
  const totalSaidas = movimentacoes
    .filter((m) => m.tipo === "saida")
    .reduce((acc, m) => acc + m.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <MainLayout>
      <Header title="Caixa do Dia" subtitle="Controle de movimentações financeiras" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Caixa do Dia</h1>
            <p className="text-muted-foreground">
              Controle de movimentações financeiras
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Unlock className="h-4 w-4 mr-2" />
              Abrir Caixa
            </Button>
            <Button variant="destructive">
              <Lock className="h-4 w-4 mr-2" />
              Fechar Caixa
            </Button>
          </div>
        </div>

        {/* Status do Caixa */}
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-primary/10">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status do Caixa</p>
                  <Badge variant="default" className="mt-1">
                    Aberto desde 08:00
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Fundo de Caixa</p>
                <p className="text-2xl font-bold">R$ 200,00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalEntradas.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Entradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {totalSaidas.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Saídas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {saldo.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Saldo Atual</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="flex gap-4">
          <Button className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Nova Entrada
          </Button>
          <Button variant="outline" className="flex-1">
            <Minus className="h-4 w-4 mr-2" />
            Nova Saída
          </Button>
        </div>

        {/* Movimentações */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentacoes.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="text-muted-foreground">{mov.hora}</TableCell>
                    <TableCell>
                      <Badge variant={mov.tipo === "entrada" ? "default" : "destructive"}>
                        {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                      </Badge>
                    </TableCell>
                    <TableCell>{mov.descricao}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        mov.tipo === "entrada" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {mov.tipo === "entrada" ? "+" : "-"} R$ {mov.valor.toFixed(2)}
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
