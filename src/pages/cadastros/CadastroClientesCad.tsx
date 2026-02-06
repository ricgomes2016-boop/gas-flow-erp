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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search, Edit, Trash2, Phone, MapPin, FileText } from "lucide-react";

const clientes = [
  { id: 1, nome: "João Silva", telefone: "(11) 99999-1111", endereco: "Rua A, 123", bairro: "Centro", tipo: "Residencial", status: "Ativo", ultimaCompra: "2024-01-15" },
  { id: 2, nome: "Maria Santos", telefone: "(11) 99999-2222", endereco: "Av. B, 456", bairro: "Jardim", tipo: "Comercial", status: "Ativo", ultimaCompra: "2024-01-14" },
  { id: 3, nome: "Pedro Oliveira", telefone: "(11) 99999-3333", endereco: "Rua C, 789", bairro: "Vila Nova", tipo: "Residencial", status: "Inativo", ultimaCompra: "2023-12-20" },
  { id: 4, nome: "Ana Costa", telefone: "(11) 99999-4444", endereco: "Rua D, 321", bairro: "Centro", tipo: "Residencial", status: "Ativo", ultimaCompra: "2024-01-16" },
  { id: 5, nome: "Carlos Ferreira", telefone: "(11) 99999-5555", endereco: "Av. E, 654", bairro: "Industrial", tipo: "Comercial", status: "Ativo", ultimaCompra: "2024-01-10" },
];

export default function CadastroClientesCad() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cadastro de Clientes</h1>
            <p className="text-muted-foreground">Gerencie todos os clientes da revenda</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="dados" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="endereco">Endereço</TabsTrigger>
                  <TabsTrigger value="observacoes">Observações</TabsTrigger>
                </TabsList>
                <TabsContent value="dados" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input placeholder="Nome do cliente" />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF/CNPJ</Label>
                      <Input placeholder="000.000.000-00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone Principal</Label>
                      <Input placeholder="(00) 00000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone Secundário</Label>
                      <Input placeholder="(00) 00000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input type="email" placeholder="email@exemplo.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Cliente</Label>
                      <Input placeholder="Residencial / Comercial" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="endereco" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input placeholder="00000-000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Rua</Label>
                      <Input placeholder="Nome da rua" />
                    </div>
                    <div className="space-y-2">
                      <Label>Número</Label>
                      <Input placeholder="123" />
                    </div>
                    <div className="space-y-2">
                      <Label>Complemento</Label>
                      <Input placeholder="Apto, Bloco, etc" />
                    </div>
                    <div className="space-y-2">
                      <Label>Bairro</Label>
                      <Input placeholder="Nome do bairro" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input placeholder="Nome da cidade" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="observacoes" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Ponto de Referência</Label>
                    <Input placeholder="Próximo a..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Observações Gerais</Label>
                    <textarea 
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Observações sobre o cliente..."
                    />
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Cliente</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.234</div>
              <p className="text-xs text-muted-foreground">+45 este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">1.180</div>
              <p className="text-xs text-muted-foreground">96% do total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Residenciais</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">890</div>
              <p className="text-xs text-muted-foreground">72% do total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comerciais</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">344</div>
              <p className="text-xs text-muted-foreground">28% do total</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Clientes</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar cliente..." className="pl-10 w-[300px]" />
                </div>
                <Button variant="outline">Filtros</Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Bairro</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Compra</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cliente.telefone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {cliente.endereco}
                      </div>
                    </TableCell>
                    <TableCell>{cliente.bairro}</TableCell>
                    <TableCell>
                      <Badge variant={cliente.tipo === "Comercial" ? "default" : "secondary"}>
                        {cliente.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cliente.status === "Ativo" ? "default" : "destructive"}>
                        {cliente.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(cliente.ultimaCompra).toLocaleDateString('pt-BR')}</TableCell>
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
