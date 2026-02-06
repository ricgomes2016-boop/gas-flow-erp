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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Plus, Package, DollarSign, Truck } from "lucide-react";

const compras = [
  {
    id: 1,
    fornecedor: "Distribuidora ABC",
    produtos: "100x P13, 50x P20",
    valor: 15000,
    status: "recebido",
    data: "05/02/2026",
  },
  {
    id: 2,
    fornecedor: "Gás Sul",
    produtos: "80x P13, 30x P45",
    valor: 12500,
    status: "em_transito",
    data: "06/02/2026",
  },
  {
    id: 3,
    fornecedor: "Nacional Gás",
    produtos: "50x P13",
    valor: 5000,
    status: "pendente",
    data: "07/02/2026",
  },
];

export default function Compras() {
  return (
    <MainLayout>
      <Header title="Compras" subtitle="Gestão de compras e pedidos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compras</h1>
            <p className="text-muted-foreground">Gestão de compras e pedidos</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Compra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Compra</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Fornecedor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Distribuidora ABC</SelectItem>
                      <SelectItem value="2">Gás Sul</SelectItem>
                      <SelectItem value="3">Nacional Gás</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <Label>Produto</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p13">P13</SelectItem>
                        <SelectItem value="p20">P20</SelectItem>
                        <SelectItem value="p45">P45</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantidade</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
                <div>
                  <Label>Valor Total</Label>
                  <Input type="number" placeholder="0,00" step="0.01" />
                </div>
                <div>
                  <Label>Data Prevista</Label>
                  <Input type="date" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Registrar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Truck className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Em Trânsito</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Package className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">280</p>
                  <p className="text-sm text-muted-foreground">Unid. Pedidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ 32.5k</p>
                  <p className="text-sm text-muted-foreground">Total Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos de Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell className="font-medium">#{compra.id}</TableCell>
                    <TableCell>{compra.fornecedor}</TableCell>
                    <TableCell>{compra.produtos}</TableCell>
                    <TableCell>R$ {compra.valor.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          compra.status === "recebido"
                            ? "default"
                            : compra.status === "em_transito"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {compra.status === "recebido"
                          ? "Recebido"
                          : compra.status === "em_transito"
                          ? "Em Trânsito"
                          : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>{compra.data}</TableCell>
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
