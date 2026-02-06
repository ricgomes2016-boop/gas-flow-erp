import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
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
import { Package, Plus, Users, AlertTriangle, CheckCircle } from "lucide-react";

const comodatos = [
  {
    id: 1,
    cliente: "João Silva",
    produto: "Botijão P13",
    quantidade: 2,
    dataEmprestimo: "01/01/2026",
    status: "ativo",
    deposito: 100,
  },
  {
    id: 2,
    cliente: "Restaurante Central",
    produto: "Botijão P45",
    quantidade: 4,
    dataEmprestimo: "15/12/2025",
    status: "ativo",
    deposito: 400,
  },
  {
    id: 3,
    cliente: "Maria Santos",
    produto: "Botijão P13",
    quantidade: 1,
    dataEmprestimo: "10/01/2026",
    status: "devolvido",
    deposito: 50,
  },
];

export default function Comodatos() {
  return (
    <MainLayout>
      <Header title="Comodatos" subtitle="Controle de botijões emprestados" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comodatos</h1>
            <p className="text-muted-foreground">
              Controle de botijões em comodato
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Comodato
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Total Comodatos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ 7.8k</p>
                  <p className="text-sm text-muted-foreground">Em Depósitos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Comodatos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Data Empréstimo</TableHead>
                  <TableHead>Depósito</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comodatos.map((comodato) => (
                  <TableRow key={comodato.id}>
                    <TableCell className="font-medium">#{comodato.id}</TableCell>
                    <TableCell>{comodato.cliente}</TableCell>
                    <TableCell>{comodato.produto}</TableCell>
                    <TableCell>{comodato.quantidade}</TableCell>
                    <TableCell>{comodato.dataEmprestimo}</TableCell>
                    <TableCell>R$ {comodato.deposito}</TableCell>
                    <TableCell>
                      <Badge
                        variant={comodato.status === "ativo" ? "default" : "secondary"}
                      >
                        {comodato.status === "ativo" ? "Ativo" : "Devolvido"}
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
