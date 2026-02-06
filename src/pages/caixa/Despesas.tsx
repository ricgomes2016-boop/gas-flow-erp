import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Receipt, Plus, Wallet, TrendingDown } from "lucide-react";

const despesas = [
  {
    id: 1,
    descricao: "Combustível - Moto 01",
    categoria: "Combustível",
    valor: 100.0,
    responsavel: "Carlos Souza",
    data: "06/02/2026 10:00",
    status: "aprovada",
  },
  {
    id: 2,
    descricao: "Almoço equipe",
    categoria: "Alimentação",
    valor: 80.0,
    responsavel: "Roberto Lima",
    data: "06/02/2026 12:30",
    status: "pendente",
  },
  {
    id: 3,
    descricao: "Manutenção moto",
    categoria: "Manutenção",
    valor: 150.0,
    responsavel: "Fernando Alves",
    data: "06/02/2026 14:00",
    status: "aprovada",
  },
];

export default function Despesas() {
  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
  const totalAprovadas = despesas
    .filter((d) => d.status === "aprovada")
    .reduce((acc, d) => acc + d.valor, 0);

  return (
    <MainLayout>
      <Header title="Despesas" subtitle="Controle de saídas e sangrias" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Despesas (Sangria)
            </h1>
            <p className="text-muted-foreground">
              Controle de saídas e despesas do caixa
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Despesa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Descrição</Label>
                  <Input placeholder="Descreva a despesa..." />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="combustivel">Combustível</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor</Label>
                  <Input type="number" placeholder="0,00" step="0.01" />
                </div>
                <div>
                  <Label>Responsável</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Carlos Souza</SelectItem>
                      <SelectItem value="2">Roberto Lima</SelectItem>
                      <SelectItem value="3">Fernando Alves</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea placeholder="Observações adicionais..." />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Registrar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {totalDespesas.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Despesas</p>
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
                  <p className="text-2xl font-bold">R$ {totalAprovadas.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Aprovadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Receipt className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{despesas.length}</p>
                  <p className="text-sm text-muted-foreground">Registros Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell className="font-medium">{despesa.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{despesa.categoria}</Badge>
                    </TableCell>
                    <TableCell>{despesa.responsavel}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {despesa.data}
                    </TableCell>
                    <TableCell className="font-medium text-red-600">
                      - R$ {despesa.valor.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={despesa.status === "aprovada" ? "default" : "secondary"}
                      >
                        {despesa.status === "aprovada" ? "Aprovada" : "Pendente"}
                      </Badge>
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
