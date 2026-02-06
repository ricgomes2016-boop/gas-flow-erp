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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Truck, Plus, Search, Edit, Trash2, Wrench, Fuel, Calendar } from "lucide-react";

const veiculos = [
  { id: 1, placa: "ABC-1234", modelo: "Fiorino 1.4", ano: 2022, km: 45000, combustivel: "Flex", status: "Disponível", proximaRevisao: "2024-02-15", motorista: "João Silva" },
  { id: 2, placa: "DEF-5678", modelo: "Strada 1.4", ano: 2021, km: 62000, combustivel: "Flex", status: "Em rota", proximaRevisao: "2024-01-30", motorista: "Pedro Santos" },
  { id: 3, placa: "GHI-9012", modelo: "Kombi 1.4", ano: 2020, km: 85000, combustivel: "Flex", status: "Manutenção", proximaRevisao: "2024-01-20", motorista: "-" },
  { id: 4, placa: "JKL-3456", modelo: "Saveiro 1.6", ano: 2023, km: 15000, combustivel: "Flex", status: "Disponível", proximaRevisao: "2024-03-10", motorista: "Carlos Oliveira" },
  { id: 5, placa: "MNO-7890", modelo: "HR 2.5", ano: 2021, km: 98000, combustivel: "Diesel", status: "Em rota", proximaRevisao: "2024-02-05", motorista: "André Costa" },
];

export default function Veiculos() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Veículos</h1>
            <p className="text-muted-foreground">Gerencie a frota de veículos da empresa</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Veículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Veículo</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Placa</Label>
                  <Input placeholder="ABC-1234" />
                </div>
                <div className="space-y-2">
                  <Label>Renavam</Label>
                  <Input placeholder="00000000000" />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input placeholder="Fiat, Volkswagen..." />
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input placeholder="Fiorino, Saveiro..." />
                </div>
                <div className="space-y-2">
                  <Label>Ano Fabricação</Label>
                  <Input placeholder="2023" />
                </div>
                <div className="space-y-2">
                  <Label>Ano Modelo</Label>
                  <Input placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <Label>Combustível</Label>
                  <Input placeholder="Flex, Diesel, GNV..." />
                </div>
                <div className="space-y-2">
                  <Label>Capacidade de Carga (kg)</Label>
                  <Input placeholder="800" />
                </div>
                <div className="space-y-2">
                  <Label>Quilometragem Atual</Label>
                  <Input placeholder="45000" />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Input placeholder="Branco" />
                </div>
                <div className="space-y-2">
                  <Label>Chassi</Label>
                  <Input placeholder="9BWZZZ377VT004251" />
                </div>
                <div className="space-y-2">
                  <Label>Data de Aquisição</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Veículo</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Na frota</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <Truck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">4</div>
              <p className="text-xs text-muted-foreground">Prontos para uso</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Rota</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">6</div>
              <p className="text-xs text-muted-foreground">Em operação</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
              <Wrench className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">2</div>
              <p className="text-xs text-muted-foreground">Na oficina</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revisão Próxima</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-xs text-muted-foreground">Nos próximos 15 dias</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Veículos</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar veículo..." className="pl-10 w-[300px]" />
                </div>
                <Button variant="outline">Filtros</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>KM</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Próxima Revisão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {veiculos.map((veiculo) => (
                  <TableRow key={veiculo.id}>
                    <TableCell className="font-medium">{veiculo.placa}</TableCell>
                    <TableCell>{veiculo.modelo}</TableCell>
                    <TableCell>{veiculo.ano}</TableCell>
                    <TableCell>{veiculo.km.toLocaleString('pt-BR')} km</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Fuel className="h-3 w-3" />
                        {veiculo.combustivel}
                      </div>
                    </TableCell>
                    <TableCell>{veiculo.motorista}</TableCell>
                    <TableCell>{new Date(veiculo.proximaRevisao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        veiculo.status === "Disponível" ? "default" :
                        veiculo.status === "Em rota" ? "secondary" : "destructive"
                      }>
                        {veiculo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
