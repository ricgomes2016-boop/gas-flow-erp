import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Truck, Package, MapPin, Clock } from "lucide-react";

const entregadores = [
  {
    id: 1,
    nome: "Carlos Souza",
    veiculo: "Moto 01",
    p13Cheio: 8,
    p13Vazio: 2,
    p20Cheio: 2,
    p20Vazio: 0,
    ultimaAtualizacao: "10:30",
  },
  {
    id: 2,
    nome: "Roberto Lima",
    veiculo: "Moto 02",
    p13Cheio: 6,
    p13Vazio: 4,
    p20Cheio: 1,
    p20Vazio: 1,
    ultimaAtualizacao: "10:25",
  },
  {
    id: 3,
    nome: "Fernando Alves",
    veiculo: "Caminhonete",
    p13Cheio: 20,
    p13Vazio: 10,
    p20Cheio: 8,
    p20Vazio: 2,
    ultimaAtualizacao: "10:15",
  },
];

export default function EstoqueRota() {
  const totalP13 = entregadores.reduce((acc, e) => acc + e.p13Cheio, 0);
  const totalP20 = entregadores.reduce((acc, e) => acc + e.p20Cheio, 0);
  const totalVazios = entregadores.reduce(
    (acc, e) => acc + e.p13Vazio + e.p20Vazio,
    0
  );

  return (
    <MainLayout>
      <Header title="Estoque em Rota" subtitle="Controle de estoque dos entregadores" />
      <div className="p-6 space-y-6">


        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalP13}</p>
                  <p className="text-sm text-muted-foreground">P13 em Rota</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalP20}</p>
                  <p className="text-sm text-muted-foreground">P20 em Rota</p>
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
                  <p className="text-2xl font-bold">{totalVazios}</p>
                  <p className="text-sm text-muted-foreground">Vazios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Truck className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{entregadores.length}</p>
                  <p className="text-sm text-muted-foreground">Entregadores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Estoque por Entregador</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entregador</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>P13 Cheio</TableHead>
                  <TableHead>P13 Vazio</TableHead>
                  <TableHead>P20 Cheio</TableHead>
                  <TableHead>P20 Vazio</TableHead>
                  <TableHead>Atualização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entregadores.map((entregador) => (
                  <TableRow key={entregador.id}>
                    <TableCell className="font-medium">
                      {entregador.nome}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entregador.veiculo}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">{entregador.p13Cheio}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entregador.p13Vazio}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">{entregador.p20Cheio}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entregador.p20Vazio}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {entregador.ultimaAtualizacao}
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
