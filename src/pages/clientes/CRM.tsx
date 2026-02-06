import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  MessageSquare,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
} from "lucide-react";

const leads = [
  {
    id: 1,
    cliente: "João Silva",
    telefone: "(11) 99999-0001",
    ultimoContato: "06/02/2026",
    status: "quente",
    proxAcao: "Ligar hoje",
  },
  {
    id: 2,
    cliente: "Maria Santos",
    telefone: "(11) 99999-0002",
    ultimoContato: "04/02/2026",
    status: "morno",
    proxAcao: "Enviar promoção",
  },
  {
    id: 3,
    cliente: "Pedro Costa",
    telefone: "(11) 99999-0003",
    ultimoContato: "01/02/2026",
    status: "frio",
    proxAcao: "Reativar",
  },
];

const tarefas = [
  { id: 1, tarefa: "Ligar para João Silva", prioridade: "alta", vencimento: "Hoje" },
  { id: 2, tarefa: "Enviar proposta Maria Santos", prioridade: "media", vencimento: "Amanhã" },
  { id: 3, tarefa: "Follow-up Pedro Costa", prioridade: "baixa", vencimento: "Esta semana" },
];

export default function CRM() {
  return (
    <MainLayout>
      <Header title="CRM" subtitle="Gestão de relacionamento com clientes" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CRM</h1>
            <p className="text-muted-foreground">
              Gestão de relacionamento com clientes
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Leads Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Leads Quentes</p>
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
                  <p className="text-2xl font-bold">28</p>
                  <p className="text-sm text-muted-foreground">Conversões Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Tarefas Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pipeline de Leads</CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="Buscar..." className="w-64" />
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Último Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Próxima Ação</TableHead>
                      <TableHead className="w-32"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.cliente}</TableCell>
                        <TableCell>{lead.telefone}</TableCell>
                        <TableCell>{lead.ultimoContato}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              lead.status === "quente"
                                ? "destructive"
                                : lead.status === "morno"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.proxAcao}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tarefas">
            <Card>
              <CardHeader>
                <CardTitle>Tarefas do CRM</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tarefas.map((tarefa) => (
                    <div
                      key={tarefa.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <input type="checkbox" className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{tarefa.tarefa}</p>
                          <p className="text-sm text-muted-foreground">
                            Vencimento: {tarefa.vencimento}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          tarefa.prioridade === "alta"
                            ? "destructive"
                            : tarefa.prioridade === "media"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {tarefa.prioridade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
