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
import { Building2, Plus, Search, Edit, Trash2, Phone, Mail, FileText } from "lucide-react";

const fornecedores = [
  { id: 1, razaoSocial: "Distribuidora de Gás ABC Ltda", cnpj: "12.345.678/0001-90", telefone: "(11) 3333-1111", email: "contato@gasabc.com.br", cidade: "São Paulo", status: "Ativo", tipo: "Gás" },
  { id: 2, razaoSocial: "Fornecedora de Água Pura S.A.", cnpj: "23.456.789/0001-01", telefone: "(11) 3333-2222", email: "vendas@aguapura.com.br", cidade: "São Paulo", status: "Ativo", tipo: "Água" },
  { id: 3, razaoSocial: "Transportadora Rápida", cnpj: "34.567.890/0001-12", telefone: "(11) 3333-3333", email: "frete@rapida.com.br", cidade: "Guarulhos", status: "Ativo", tipo: "Transporte" },
  { id: 4, razaoSocial: "Equipamentos para Gás ME", cnpj: "45.678.901/0001-23", telefone: "(11) 3333-4444", email: "equip@gasequip.com.br", cidade: "Osasco", status: "Inativo", tipo: "Equipamentos" },
  { id: 5, razaoSocial: "Nacional Gás Distribuidora", cnpj: "56.789.012/0001-34", telefone: "(11) 3333-5555", email: "pedidos@nacionalgas.com.br", cidade: "São Paulo", status: "Ativo", tipo: "Gás" },
];

export default function Fornecedores() {
  return (
    <MainLayout>
      <Header title="Fornecedores" subtitle="Gerencie seus fornecedores" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground">Gerencie seus fornecedores e parceiros</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Fornecedor</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2 col-span-2">
                  <Label>Razão Social</Label>
                  <Input placeholder="Nome da empresa" />
                </div>
                <div className="space-y-2">
                  <Label>Nome Fantasia</Label>
                  <Input placeholder="Nome fantasia" />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-2">
                  <Label>Inscrição Estadual</Label>
                  <Input placeholder="Inscrição estadual" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Fornecedor</Label>
                  <Input placeholder="Gás, Água, Equipamentos..." />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input placeholder="(00) 0000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" placeholder="email@empresa.com.br" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Endereço Completo</Label>
                  <Input placeholder="Rua, número, bairro, cidade - UF" />
                </div>
                <div className="space-y-2">
                  <Label>Contato Principal</Label>
                  <Input placeholder="Nome do contato" />
                </div>
                <div className="space-y-2">
                  <Label>Cargo do Contato</Label>
                  <Input placeholder="Cargo" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Fornecedor</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">21</div>
              <p className="text-xs text-muted-foreground">88% do total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores de Gás</CardTitle>
              <Building2 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">8</div>
              <p className="text-xs text-muted-foreground">Principal categoria</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pedidos este Mês</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">156</div>
              <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Fornecedores</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar fornecedor..." className="pl-10 w-[300px]" />
                </div>
                <Button variant="outline">Filtros</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fornecedores.map((fornecedor) => (
                  <TableRow key={fornecedor.id}>
                    <TableCell className="font-medium">{fornecedor.razaoSocial}</TableCell>
                    <TableCell>{fornecedor.cnpj}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {fornecedor.telefone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {fornecedor.email}
                      </div>
                    </TableCell>
                    <TableCell>{fornecedor.cidade}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{fornecedor.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={fornecedor.status === "Ativo" ? "default" : "destructive"}>
                        {fornecedor.status}
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
