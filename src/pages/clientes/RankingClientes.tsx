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
import { Trophy, Medal, Crown, TrendingUp, DollarSign } from "lucide-react";

const ranking = [
  {
    posicao: 1,
    cliente: "João Silva",
    compras: 48,
    valorTotal: 5280,
    ultimaCompra: "06/02/2026",
    frequencia: "Semanal",
  },
  {
    posicao: 2,
    cliente: "Maria Santos",
    compras: 42,
    valorTotal: 4620,
    ultimaCompra: "05/02/2026",
    frequencia: "Semanal",
  },
  {
    posicao: 3,
    cliente: "Pedro Costa",
    compras: 36,
    valorTotal: 3960,
    ultimaCompra: "04/02/2026",
    frequencia: "Quinzenal",
  },
  {
    posicao: 4,
    cliente: "Ana Oliveira",
    compras: 28,
    valorTotal: 3080,
    ultimaCompra: "03/02/2026",
    frequencia: "Quinzenal",
  },
  {
    posicao: 5,
    cliente: "Carlos Mendes",
    compras: 24,
    valorTotal: 2640,
    ultimaCompra: "02/02/2026",
    frequencia: "Mensal",
  },
];

export default function RankingClientes() {
  return (
    <MainLayout>
      <Header title="Ranking de Clientes" subtitle="Top clientes por volume de compras" />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Ranking dos Clientes
          </h1>
          <p className="text-muted-foreground">
            Top clientes por volume de compras
          </p>
        </div>

        {/* Top 3 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2 border-yellow-500/50">
            <CardContent className="pt-6 text-center">
              <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <Badge className="bg-yellow-500 mb-2">1º Lugar</Badge>
              <p className="text-xl font-bold">João Silva</p>
              <p className="text-2xl font-bold text-primary mt-2">
                R$ 5.280
              </p>
              <p className="text-sm text-muted-foreground">48 compras</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-gray-400/50">
            <CardContent className="pt-6 text-center">
              <Medal className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <Badge className="bg-gray-400 mb-2">2º Lugar</Badge>
              <p className="text-xl font-bold">Maria Santos</p>
              <p className="text-2xl font-bold text-primary mt-2">
                R$ 4.620
              </p>
              <p className="text-sm text-muted-foreground">42 compras</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-700/50">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-12 w-12 text-amber-700 mx-auto mb-2" />
              <Badge className="bg-amber-700 mb-2">3º Lugar</Badge>
              <p className="text-xl font-bold">Pedro Costa</p>
              <p className="text-2xl font-bold text-primary mt-2">
                R$ 3.960
              </p>
              <p className="text-sm text-muted-foreground">36 compras</p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ 125.400</p>
                  <p className="text-sm text-muted-foreground">
                    Total Top 100 Clientes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ 1.254</p>
                  <p className="text-sm text-muted-foreground">
                    Ticket Médio Top 100
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Completa */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Pos.</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Última Compra</TableHead>
                  <TableHead>Frequência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((cliente) => (
                  <TableRow key={cliente.posicao}>
                    <TableCell>
                      <Badge
                        variant={cliente.posicao <= 3 ? "default" : "outline"}
                        className={
                          cliente.posicao === 1
                            ? "bg-yellow-500"
                            : cliente.posicao === 2
                            ? "bg-gray-400"
                            : cliente.posicao === 3
                            ? "bg-amber-700"
                            : ""
                        }
                      >
                        #{cliente.posicao}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{cliente.cliente}</TableCell>
                    <TableCell>{cliente.compras}</TableCell>
                    <TableCell className="font-medium">
                      R$ {cliente.valorTotal.toLocaleString()}
                    </TableCell>
                    <TableCell>{cliente.ultimaCompra}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cliente.frequencia}</Badge>
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
