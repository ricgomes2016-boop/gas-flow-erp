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
import { Package, Plus, Search, Edit, Trash2, Flame, Droplets, Box } from "lucide-react";

const produtos = [
  { id: 1, codigo: "P13-001", nome: "Botijão P13 Cheio", categoria: "Gás", preco: 110.00, custo: 85.00, estoque: 150, minimo: 50, unidade: "UN", status: "Ativo" },
  { id: 2, codigo: "P20-001", nome: "Botijão P20 Cheio", categoria: "Gás", preco: 180.00, custo: 140.00, estoque: 45, minimo: 20, unidade: "UN", status: "Ativo" },
  { id: 3, codigo: "P45-001", nome: "Botijão P45 Cheio", categoria: "Gás", preco: 380.00, custo: 300.00, estoque: 12, minimo: 10, unidade: "UN", status: "Ativo" },
  { id: 4, codigo: "AGU-020", nome: "Galão Água 20L", categoria: "Água", preco: 12.00, custo: 6.00, estoque: 200, minimo: 100, unidade: "UN", status: "Ativo" },
  { id: 5, codigo: "REG-001", nome: "Registro Regulador", categoria: "Acessório", preco: 45.00, custo: 28.00, estoque: 30, minimo: 15, unidade: "UN", status: "Ativo" },
  { id: 6, codigo: "MAN-001", nome: "Mangueira 1,25m", categoria: "Acessório", preco: 25.00, custo: 15.00, estoque: 8, minimo: 20, unidade: "UN", status: "Baixo Estoque" },
];

export default function Produtos() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground">Gerencie o catálogo de produtos</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input placeholder="P13-001" />
                </div>
                <div className="space-y-2">
                  <Label>Código de Barras</Label>
                  <Input placeholder="7891234567890" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Nome do Produto</Label>
                  <Input placeholder="Nome completo do produto" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input placeholder="Gás, Água, Acessório..." />
                </div>
                <div className="space-y-2">
                  <Label>Unidade de Medida</Label>
                  <Input placeholder="UN, KG, LT..." />
                </div>
                <div className="space-y-2">
                  <Label>Preço de Custo</Label>
                  <Input placeholder="R$ 0,00" />
                </div>
                <div className="space-y-2">
                  <Label>Preço de Venda</Label>
                  <Input placeholder="R$ 0,00" />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Mínimo</Label>
                  <Input placeholder="50" />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Atual</Label>
                  <Input placeholder="150" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Descrição</Label>
                  <textarea 
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Descrição detalhada do produto..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Produto</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">No catálogo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Produtos de Gás</CardTitle>
              <Flame className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">12</div>
              <p className="text-xs text-muted-foreground">P13, P20, P45</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Produtos de Água</CardTitle>
              <Droplets className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">8</div>
              <p className="text-xs text-muted-foreground">Galões e garrafas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Acessórios</CardTitle>
              <Box className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">28</div>
              <p className="text-xs text-muted-foreground">Registros, mangueiras...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Baixo Estoque</CardTitle>
              <Package className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">5</div>
              <p className="text-xs text-muted-foreground">Precisam reposição</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Produtos</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar produto..." className="pl-10 w-[300px]" />
                </div>
                <Button variant="outline">Filtros</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => {
                  const margem = ((produto.preco - produto.custo) / produto.preco * 100).toFixed(1);
                  return (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.codigo}</TableCell>
                      <TableCell>{produto.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{produto.categoria}</Badge>
                      </TableCell>
                      <TableCell>R$ {produto.custo.toFixed(2)}</TableCell>
                      <TableCell>R$ {produto.preco.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{margem}%</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={produto.estoque <= produto.minimo ? "text-destructive font-medium" : ""}>
                          {produto.estoque} / {produto.minimo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={produto.status === "Ativo" ? "default" : "destructive"}>
                          {produto.status}
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
