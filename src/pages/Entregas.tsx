import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, Clock, CheckCircle, MapPin, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Entrega {
  id: number;
  pedidoId: number;
  cliente: string;
  telefone: string;
  endereco: string;
  bairro: string;
  produto: string;
  quantidade: number;
  status: "pendente" | "em_rota" | "entregue";
  entregador: string;
  horarioPrevisto: string;
  horarioEntrega?: string;
}

const entregasIniciais: Entrega[] = [
  {
    id: 1,
    pedidoId: 1002,
    cliente: "João Santos",
    telefone: "(11) 99999-2222",
    endereco: "Av. Brasil, 456",
    bairro: "Jardim América",
    produto: "Botijão P13",
    quantidade: 1,
    status: "pendente",
    entregador: "Pedro",
    horarioPrevisto: "11:30",
  },
  {
    id: 2,
    pedidoId: 1003,
    cliente: "Ana Oliveira",
    telefone: "(11) 99999-3333",
    endereco: "Rua São Paulo, 789",
    bairro: "Vila Nova",
    produto: "Botijão P45",
    quantidade: 1,
    status: "em_rota",
    entregador: "Carlos",
    horarioPrevisto: "12:00",
  },
  {
    id: 3,
    pedidoId: 1005,
    cliente: "Lucia Costa",
    telefone: "(11) 99999-5555",
    endereco: "Av. Paulista, 1000",
    bairro: "Consolação",
    produto: "Botijão P20",
    quantidade: 1,
    status: "pendente",
    entregador: "Pedro",
    horarioPrevisto: "15:45",
  },
  {
    id: 4,
    pedidoId: 1001,
    cliente: "Maria Silva",
    telefone: "(11) 99999-1111",
    endereco: "Rua das Flores, 123",
    bairro: "Centro",
    produto: "Botijão P13",
    quantidade: 2,
    status: "entregue",
    entregador: "Carlos",
    horarioPrevisto: "10:30",
    horarioEntrega: "10:25",
  },
  {
    id: 5,
    pedidoId: 1004,
    cliente: "Carlos Ferreira",
    telefone: "(11) 99999-4444",
    endereco: "Rua Minas Gerais, 321",
    bairro: "Centro",
    produto: "Botijão P13",
    quantidade: 3,
    status: "entregue",
    entregador: "Pedro",
    horarioPrevisto: "14:20",
    horarioEntrega: "14:15",
  },
];

const statusConfig = {
  pendente: {
    label: "Pendente",
    variant: "secondary" as const,
    icon: Clock,
    color: "text-muted-foreground",
  },
  em_rota: {
    label: "Em Rota",
    variant: "default" as const,
    icon: Truck,
    color: "text-warning",
  },
  entregue: {
    label: "Entregue",
    variant: "outline" as const,
    icon: CheckCircle,
    color: "text-success",
  },
};

const entregadores = ["Pedro", "Carlos", "João"];

export default function Entregas() {
  const [entregas, setEntregas] = useState<Entrega[]>(entregasIniciais);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const entregasFiltradas =
    filtroStatus === "todos"
      ? entregas
      : entregas.filter((e) => e.status === filtroStatus);

  const pendentes = entregas.filter((e) => e.status === "pendente").length;
  const emRota = entregas.filter((e) => e.status === "em_rota").length;
  const entregues = entregas.filter((e) => e.status === "entregue").length;

  const handleAtualizarStatus = (id: number, novoStatus: Entrega["status"]) => {
    setEntregas(
      entregas.map((entrega) => {
        if (entrega.id === id) {
          return {
            ...entrega,
            status: novoStatus,
            horarioEntrega:
              novoStatus === "entregue"
                ? new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : entrega.horarioEntrega,
          };
        }
        return entrega;
      })
    );
  };

  return (
    <MainLayout>
      <Header title="Entregas" subtitle="Gestão de entregas e rotas" />
      <div className="p-6">
        {/* Cards de resumo */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card
            className="cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setFiltroStatus("pendente")}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-muted p-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendentes}</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setFiltroStatus("em_rota")}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-warning/10 p-3">
                <Truck className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Rota</p>
                <p className="text-2xl font-bold">{emRota}</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setFiltroStatus("entregue")}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-success/10 p-3">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entregues Hoje</p>
                <p className="text-2xl font-bold">{entregues}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de entregas */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Lista de Entregas</CardTitle>
              <div className="flex gap-3">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtrar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="em_rota">Em Rota</SelectItem>
                    <SelectItem value="entregue">Entregues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Entregador</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entregasFiltradas.map((entrega) => {
                  const StatusIcon = statusConfig[entrega.status].icon;
                  const statusColor = statusConfig[entrega.status].color;

                  return (
                    <TableRow key={entrega.id}>
                      <TableCell className="font-medium">
                        #{entrega.pedidoId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {entrega.cliente}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {entrega.telefone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p>{entrega.endereco}</p>
                            <Badge variant="secondary" className="mt-1">
                              {entrega.bairro}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entrega.quantidade}x {entrega.produto}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entrega.entregador}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            Previsto: {entrega.horarioPrevisto}
                          </p>
                          {entrega.horarioEntrega && (
                            <p className="text-sm text-success">
                              Entregue: {entrega.horarioEntrega}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                          <Badge variant={statusConfig[entrega.status].variant}>
                            {statusConfig[entrega.status].label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {entrega.status === "pendente" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleAtualizarStatus(entrega.id, "em_rota")
                            }
                          >
                            <Truck className="mr-1 h-4 w-4" />
                            Iniciar
                          </Button>
                        )}
                        {entrega.status === "em_rota" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAtualizarStatus(entrega.id, "entregue")
                            }
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Finalizar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
