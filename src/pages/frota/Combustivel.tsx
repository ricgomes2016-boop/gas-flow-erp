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
import { Fuel, Plus, Search, TrendingUp, Truck, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const abastecimentos = [
  { id: 1, veiculo: "ABC-1234", motorista: "João Silva", data: "2024-01-16", litros: 45, valor: 270, km: 45250, tipo: "Gasolina" },
  { id: 2, veiculo: "DEF-5678", motorista: "Pedro Santos", data: "2024-01-16", litros: 50, valor: 300, km: 62150, tipo: "Gasolina" },
  { id: 3, veiculo: "MNO-7890", motorista: "André Costa", data: "2024-01-15", litros: 80, valor: 520, km: 98200, tipo: "Diesel" },
  { id: 4, veiculo: "GHI-9012", motorista: "Carlos Oliveira", data: "2024-01-15", litros: 40, valor: 240, km: 85100, tipo: "Gasolina" },
];

const consumoSemanal = [
  { dia: "Seg", litros: 120, valor: 720 },
  { dia: "Ter", litros: 95, valor: 570 },
  { dia: "Qua", litros: 145, valor: 870 },
  { dia: "Qui", litros: 110, valor: 660 },
  { dia: "Sex", litros: 130, valor: 780 },
  { dia: "Sáb", litros: 85, valor: 510 },
];

export default function Combustivel() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Combustível</h1>
            <p className="text-muted-foreground">Gerencie abastecimentos e consumo da frota</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Abastecimento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gasto Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 8.450</div>
              <p className="text-xs text-muted-foreground">Janeiro 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Litros Consumidos</CardTitle>
              <Fuel className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">1.420 L</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Média Km/L</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">8.5 km/L</div>
              <p className="text-xs text-muted-foreground">+0.3 vs mês anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Veículos Ativos</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">10</div>
              <p className="text-xs text-muted-foreground">Com consumo registrado</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consumo Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={consumoSemanal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="litros" fill="hsl(var(--primary))" name="Litros" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Abastecimentos</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar..." className="pl-10 w-[250px]" />
                </div>
                <Button variant="outline">Exportar</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>KM</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abastecimentos.map((abast) => (
                  <TableRow key={abast.id}>
                    <TableCell className="font-medium">{abast.veiculo}</TableCell>
                    <TableCell>{abast.motorista}</TableCell>
                    <TableCell>{new Date(abast.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{abast.km.toLocaleString('pt-BR')} km</TableCell>
                    <TableCell>{abast.litros} L</TableCell>
                    <TableCell>
                      <Badge variant="outline">{abast.tipo}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">R$ {abast.valor.toLocaleString('pt-BR')}</TableCell>
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
