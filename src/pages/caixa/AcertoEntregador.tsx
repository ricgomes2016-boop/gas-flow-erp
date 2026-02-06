import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Package, Wallet, CheckCircle } from "lucide-react";

const entregadores = [
  { id: 1, nome: "Carlos Souza" },
  { id: 2, nome: "Roberto Lima" },
  { id: 3, nome: "Fernando Alves" },
];

const entregas = [
  { id: 1, cliente: "João Silva", produto: "2x P13", valor: 220, pagamento: "Dinheiro" },
  { id: 2, cliente: "Maria Santos", produto: "1x P20", valor: 180, pagamento: "PIX" },
  { id: 3, cliente: "Pedro Costa", produto: "1x P13", valor: 110, pagamento: "Dinheiro" },
  { id: 4, cliente: "Ana Oliveira", produto: "1x P13", valor: 110, pagamento: "Cartão" },
];

export default function AcertoEntregador() {
  const totalVendas = entregas.reduce((acc, e) => acc + e.valor, 0);
  const totalDinheiro = entregas
    .filter((e) => e.pagamento === "Dinheiro")
    .reduce((acc, e) => acc + e.valor, 0);

  return (
    <MainLayout>
      <Header title="Acerto do Entregador" subtitle="Conferência de entregas e valores" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Acerto Diário do Entregador
            </h1>
            <p className="text-muted-foreground">
              Conferência de entregas e valores
            </p>
          </div>
        </div>

        {/* Seleção de Entregador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Selecionar Entregador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Entregador</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o entregador" />
                  </SelectTrigger>
                  <SelectContent>
                    {entregadores.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" defaultValue="2026-02-06" />
              </div>
              <div className="flex items-end">
                <Button className="w-full">Carregar Entregas</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{entregas.length}</p>
                  <p className="text-sm text-muted-foreground">Entregas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Wallet className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {totalVendas.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Vendas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Wallet className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {totalDinheiro.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Em Dinheiro</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Package className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Vazios Retornados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entregas */}
        <Card>
          <CardHeader>
            <CardTitle>Entregas Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Conferido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entregas.map((entrega) => (
                  <TableRow key={entrega.id}>
                    <TableCell className="font-medium">{entrega.cliente}</TableCell>
                    <TableCell>{entrega.produto}</TableCell>
                    <TableCell>R$ {entrega.valor.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entrega.pagamento}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Acerto Final */}
        <Card>
          <CardHeader>
            <CardTitle>Acerto Final</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Dinheiro Entregue</Label>
                <Input type="number" placeholder="0,00" step="0.01" />
              </div>
              <div>
                <Label>Comprovantes PIX</Label>
                <Input type="number" placeholder="0,00" step="0.01" />
              </div>
              <div>
                <Label>Comprovantes Cartão</Label>
                <Input type="number" placeholder="0,00" step="0.01" />
              </div>
              <div>
                <Label>Diferença</Label>
                <Input type="number" value="0,00" disabled className="bg-muted" />
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-4">
              <Button variant="outline">Cancelar</Button>
              <Button>Confirmar Acerto</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
