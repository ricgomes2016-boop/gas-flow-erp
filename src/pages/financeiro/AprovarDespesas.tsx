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
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye } from "lucide-react";

const despesas = [
  { id: 1, solicitante: "Carlos Silva", descricao: "Manutenção veículo ABC-1234", valor: 850, categoria: "Frota", data: "2024-01-16", status: "Pendente", urgencia: "Alta" },
  { id: 2, solicitante: "Maria Santos", descricao: "Material de escritório", valor: 320, categoria: "Administrativo", data: "2024-01-16", status: "Pendente", urgencia: "Baixa" },
  { id: 3, solicitante: "Pedro Oliveira", descricao: "EPI para entregadores", valor: 1200, categoria: "RH", data: "2024-01-15", status: "Aprovada", urgencia: "Média" },
  { id: 4, solicitante: "Ana Costa", descricao: "Reparo no portão", valor: 450, categoria: "Infraestrutura", data: "2024-01-15", status: "Rejeitada", urgencia: "Baixa" },
  { id: 5, solicitante: "João Ferreira", descricao: "Combustível extra", valor: 600, categoria: "Frota", data: "2024-01-14", status: "Aprovada", urgencia: "Alta" },
];

export default function AprovarDespesas() {
  const pendentes = despesas.filter(d => d.status === "Pendente");
  const totalPendente = pendentes.reduce((acc, d) => acc + d.valor, 0);

  return (
    <MainLayout>
      <Header title="Aprovar Despesas" subtitle="Analise e aprove solicitações de despesas" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Aprovar Despesas</h1>
            <p className="text-muted-foreground">Analise e aprove solicitações de despesas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendentes.length}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">R$ {totalPendente.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">A ser aprovado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aprovadas (Mês)</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 12.500</div>
              <p className="text-xs text-muted-foreground">28 despesas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejeitadas (Mês)</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ 2.150</div>
              <p className="text-xs text-muted-foreground">5 despesas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Urgência</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell className="font-medium">{despesa.solicitante}</TableCell>
                    <TableCell>{despesa.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{despesa.categoria}</Badge>
                    </TableCell>
                    <TableCell>{new Date(despesa.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        despesa.urgencia === "Alta" ? "destructive" :
                        despesa.urgencia === "Média" ? "secondary" : "outline"
                      }>
                        {despesa.urgencia}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">R$ {despesa.valor.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        despesa.status === "Aprovada" ? "default" :
                        despesa.status === "Rejeitada" ? "destructive" : "secondary"
                      }>
                        {despesa.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {despesa.status === "Pendente" && (
                          <>
                            <Button size="sm" variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Aprovar
                            </Button>
                            <Button size="sm" variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
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
