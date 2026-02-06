import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search, Edit, Trash2, Phone, Briefcase, Calendar } from "lucide-react";

const funcionarios = [
  { id: 1, nome: "João Silva", cargo: "Entregador", telefone: "(11) 99999-1111", admissao: "2022-03-15", salario: 2500, status: "Ativo", setor: "Operacional" },
  { id: 2, nome: "Maria Santos", cargo: "Atendente", telefone: "(11) 99999-2222", admissao: "2021-06-01", salario: 1800, status: "Ativo", setor: "Vendas" },
  { id: 3, nome: "Pedro Oliveira", cargo: "Motorista", telefone: "(11) 99999-3333", admissao: "2020-01-10", salario: 2800, status: "Ativo", setor: "Operacional" },
  { id: 4, nome: "Ana Costa", cargo: "Gerente", telefone: "(11) 99999-4444", admissao: "2019-04-20", salario: 5500, status: "Ativo", setor: "Administrativo" },
  { id: 5, nome: "Carlos Ferreira", cargo: "Entregador", telefone: "(11) 99999-5555", admissao: "2023-02-01", salario: 2500, status: "Férias", setor: "Operacional" },
];

export default function Funcionarios() {
  return (
    <MainLayout>
      <Header title="Funcionários" subtitle="Gerencie a equipe da empresa" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
            <p className="text-muted-foreground">Gerencie a equipe da empresa</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Funcionário</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="pessoal" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="profissional">Profissional</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  <TabsTrigger value="bancario">Dados Bancários</TabsTrigger>
                </TabsList>
                <TabsContent value="pessoal" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input placeholder="Nome do funcionário" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Nascimento</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input placeholder="000.000.000-00" />
                    </div>
                    <div className="space-y-2">
                      <Label>RG</Label>
                      <Input placeholder="00.000.000-0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input placeholder="(00) 00000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input type="email" placeholder="email@exemplo.com" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Endereço Completo</Label>
                      <Input placeholder="Rua, número, bairro, cidade - UF" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="profissional" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cargo</Label>
                      <Input placeholder="Entregador, Atendente..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Setor</Label>
                      <Input placeholder="Operacional, Vendas..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Admissão</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Salário Base</Label>
                      <Input placeholder="R$ 0,00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Contrato</Label>
                      <Input placeholder="CLT, PJ, Temporário..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Carga Horária</Label>
                      <Input placeholder="44h semanais" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="documentos" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CTPS (Carteira de Trabalho)</Label>
                      <Input placeholder="Número da CTPS" />
                    </div>
                    <div className="space-y-2">
                      <Label>PIS/PASEP</Label>
                      <Input placeholder="000.00000.00-0" />
                    </div>
                    <div className="space-y-2">
                      <Label>CNH (se aplicável)</Label>
                      <Input placeholder="Número da CNH" />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria CNH</Label>
                      <Input placeholder="A, B, C, D, E" />
                    </div>
                    <div className="space-y-2">
                      <Label>Validade CNH</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Título de Eleitor</Label>
                      <Input placeholder="Número do título" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bancario" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Banco</Label>
                      <Input placeholder="Nome do banco" />
                    </div>
                    <div className="space-y-2">
                      <Label>Agência</Label>
                      <Input placeholder="0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Conta</Label>
                      <Input placeholder="00000-0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Conta</Label>
                      <Input placeholder="Corrente, Poupança" />
                    </div>
                    <div className="space-y-2">
                      <Label>Chave PIX</Label>
                      <Input placeholder="CPF, Telefone, E-mail..." />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Funcionário</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Funcionários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Na empresa</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">15</div>
              <p className="text-xs text-muted-foreground">Trabalhando</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Férias</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">2</div>
              <p className="text-xs text-muted-foreground">Em descanso</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Entregadores</CardTitle>
              <Briefcase className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">8</div>
              <p className="text-xs text-muted-foreground">No operacional</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Folha Mensal</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 48.500</div>
              <p className="text-xs text-muted-foreground">Custo total</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Funcionários</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar funcionário..." className="pl-10 w-[300px]" />
                </div>
                <Button variant="outline">Filtros</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Admissão</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionarios.map((funcionario) => (
                  <TableRow key={funcionario.id}>
                    <TableCell className="font-medium">{funcionario.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {funcionario.cargo}
                      </div>
                    </TableCell>
                    <TableCell>{funcionario.setor}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {funcionario.telefone}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(funcionario.admissao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>R$ {funcionario.salario.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        funcionario.status === "Ativo" ? "default" :
                        funcionario.status === "Férias" ? "secondary" : "destructive"
                      }>
                        {funcionario.status}
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
