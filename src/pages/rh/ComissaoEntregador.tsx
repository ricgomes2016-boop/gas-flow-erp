import { MainLayout } from "@/components/layout/MainLayout";
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
import { DollarSign, TrendingUp, Package, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const comissoes = [
  { id: 1, entregador: "João Silva", entregas: 245, valorVendido: 26950, comissao: 1347.50, bonus: 200, total: 1547.50 },
  { id: 2, entregador: "Pedro Santos", entregas: 228, valorVendido: 25080, comissao: 1254.00, bonus: 150, total: 1404.00 },
  { id: 3, entregador: "André Costa", entregas: 215, valorVendido: 23650, comissao: 1182.50, bonus: 100, total: 1282.50 },
  { id: 4, entregador: "Carlos Oliveira", entregas: 195, valorVendido: 21450, comissao: 1072.50, bonus: 0, total: 1072.50 },
  { id: 5, entregador: "Marcos Souza", entregas: 180, valorVendido: 19800, comissao: 990.00, bonus: 0, total: 990.00 },
];

const comparativoMensal = [
  { mes: "Ago", comissao: 5200 },
  { mes: "Set", comissao: 5800 },
  { mes: "Out", comissao: 5400 },
  { mes: "Nov", comissao: 6200 },
  { mes: "Dez", comissao: 7100 },
  { mes: "Jan", comissao: 6296 },
];

export default function ComissaoEntregador() {
  const totalComissao = comissoes.reduce((acc, c) => acc + c.total, 0);
  const totalEntregas = comissoes.reduce((acc, c) => acc + c.entregas, 0);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Comissão do Entregador</h1>
            <p className="text-muted-foreground">Cálculo de comissões por entrega</p>
          </div>
          <Button className="gap-2">
            <Calculator className="h-4 w-4" />
            Calcular Comissões
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Comissões</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalComissao.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Entregas</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalEntregas}</div>
              <p className="text-xs text-muted-foreground">Realizadas no mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Média/Entregador</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {(totalComissao / comissoes.length).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Por funcionário</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa Comissão</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">5%</div>
              <p className="text-xs text-muted-foreground">Sobre vendas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={comparativoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                  <Bar dataKey="comissao" fill="hsl(var(--primary))" name="Comissão" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Entregador</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entregador</TableHead>
                    <TableHead>Entregas</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Bônus</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoes.map((comissao) => (
                    <TableRow key={comissao.id}>
                      <TableCell className="font-medium">{comissao.entregador}</TableCell>
                      <TableCell>{comissao.entregas}</TableCell>
                      <TableCell>R$ {comissao.comissao.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        {comissao.bonus > 0 ? (
                          <Badge variant="default">+ R$ {comissao.bonus}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold">R$ {comissao.total.toLocaleString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
