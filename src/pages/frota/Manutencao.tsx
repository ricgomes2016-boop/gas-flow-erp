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
import { Wrench, Plus, Search, AlertTriangle, CheckCircle2, Clock, DollarSign } from "lucide-react";

const manutencoes = [
  { id: 1, veiculo: "ABC-1234", tipo: "Preventiva", descricao: "Troca de óleo e filtros", data: "2024-01-20", valor: 450, status: "Agendada", oficina: "Oficina Central" },
  { id: 2, veiculo: "DEF-5678", tipo: "Corretiva", descricao: "Reparo no freio", data: "2024-01-16", valor: 850, status: "Em andamento", oficina: "Auto Mecânica Silva" },
  { id: 3, veiculo: "GHI-9012", tipo: "Corretiva", descricao: "Troca de embreagem", data: "2024-01-14", valor: 1200, status: "Concluída", oficina: "Oficina Central" },
  { id: 4, veiculo: "JKL-3456", tipo: "Preventiva", descricao: "Revisão 15.000 km", data: "2024-01-25", valor: 680, status: "Agendada", oficina: "Concessionária" },
  { id: 5, veiculo: "MNO-7890", tipo: "Corretiva", descricao: "Suspensão dianteira", data: "2024-01-12", valor: 950, status: "Concluída", oficina: "Auto Mecânica Silva" },
];

export default function Manutencao() {
  const agendadas = manutencoes.filter(m => m.status === "Agendada").length;
  const emAndamento = manutencoes.filter(m => m.status === "Em andamento").length;
  const gastoMensal = manutencoes.reduce((acc, m) => acc + m.valor, 0);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manutenção de Veículos</h1>
            <p className="text-muted-foreground">Controle preventivo e corretivo da frota</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Manutenção
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gasto Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {gastoMensal.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Em manutenções</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{agendadas}</div>
              <p className="text-xs text-muted-foreground">Próximas manutenções</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Wrench className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{emAndamento}</div>
              <p className="text-xs text-muted-foreground">Na oficina agora</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-xs text-muted-foreground">Revisões atrasadas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Manutenções</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar..." className="pl-10 w-[250px]" />
                </div>
                <Button variant="outline">Filtros</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Oficina</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manutencoes.map((manut) => (
                  <TableRow key={manut.id}>
                    <TableCell className="font-medium">{manut.veiculo}</TableCell>
                    <TableCell>
                      <Badge variant={manut.tipo === "Preventiva" ? "secondary" : "destructive"}>
                        {manut.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{manut.descricao}</TableCell>
                    <TableCell>{manut.oficina}</TableCell>
                    <TableCell>{new Date(manut.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">R$ {manut.valor.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {manut.status === "Concluída" && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                        {manut.status === "Em andamento" && <Wrench className="h-3 w-3 text-orange-600" />}
                        {manut.status === "Agendada" && <Clock className="h-3 w-3 text-blue-600" />}
                        <Badge variant={
                          manut.status === "Concluída" ? "default" :
                          manut.status === "Em andamento" ? "secondary" : "outline"
                        }>
                          {manut.status}
                        </Badge>
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
