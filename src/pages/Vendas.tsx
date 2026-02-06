import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Eye, FileText, DollarSign, ShoppingCart, TrendingUp, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Venda {
  id: number;
  cliente: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  formaPagamento: string;
  status: "pendente" | "pago" | "cancelado";
  data: string;
  hora: string;
}

const vendasIniciais: Venda[] = [
  {
    id: 1001,
    cliente: "Maria Silva",
    produto: "Botijão P13",
    quantidade: 2,
    valorUnitario: 110,
    valorTotal: 220,
    formaPagamento: "PIX",
    status: "pago",
    data: "06/02/2026",
    hora: "10:30",
  },
  {
    id: 1002,
    cliente: "João Santos",
    produto: "Botijão P13",
    quantidade: 1,
    valorUnitario: 110,
    valorTotal: 110,
    formaPagamento: "Dinheiro",
    status: "pendente",
    data: "06/02/2026",
    hora: "11:15",
  },
  {
    id: 1003,
    cliente: "Ana Oliveira",
    produto: "Botijão P45",
    quantidade: 1,
    valorUnitario: 380,
    valorTotal: 380,
    formaPagamento: "Cartão",
    status: "pago",
    data: "06/02/2026",
    hora: "12:00",
  },
  {
    id: 1004,
    cliente: "Carlos Ferreira",
    produto: "Botijão P13",
    quantidade: 3,
    valorUnitario: 110,
    valorTotal: 330,
    formaPagamento: "PIX",
    status: "pago",
    data: "05/02/2026",
    hora: "14:20",
  },
  {
    id: 1005,
    cliente: "Lucia Costa",
    produto: "Botijão P20",
    quantidade: 1,
    valorUnitario: 180,
    valorTotal: 180,
    formaPagamento: "Dinheiro",
    status: "pendente",
    data: "05/02/2026",
    hora: "15:45",
  },
];

const statusConfig = {
  pago: { label: "Pago", variant: "default" as const },
  pendente: { label: "Pendente", variant: "secondary" as const },
  cancelado: { label: "Cancelado", variant: "destructive" as const },
};

const clientes = ["Maria Silva", "João Santos", "Ana Oliveira", "Carlos Ferreira", "Lucia Costa"];
const produtos = [
  { nome: "Botijão P13", preco: 110 },
  { nome: "Botijão P20", preco: 180 },
  { nome: "Botijão P45", preco: 380 },
];

export default function Vendas() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState<Venda[]>(vendasIniciais);
  const [busca, setBusca] = useState("");
  const [novaVendaOpen, setNovaVendaOpen] = useState(false);
  const [novaVenda, setNovaVenda] = useState({
    cliente: "",
    produto: "",
    quantidade: "1",
    formaPagamento: "",
  });

  const vendasFiltradas = vendas.filter(
    (venda) =>
      venda.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      venda.id.toString().includes(busca)
  );

  const totalVendasHoje = vendas
    .filter((v) => v.data === "06/02/2026" && v.status !== "cancelado")
    .reduce((acc, v) => acc + v.valorTotal, 0);

  const totalPedidosHoje = vendas.filter((v) => v.data === "06/02/2026").length;

  const handleNovaVenda = () => {
    const produtoSelecionado = produtos.find((p) => p.nome === novaVenda.produto);
    if (!produtoSelecionado) return;

    const quantidade = parseInt(novaVenda.quantidade);
    const nova: Venda = {
      id: vendas.length + 1001,
      cliente: novaVenda.cliente,
      produto: novaVenda.produto,
      quantidade,
      valorUnitario: produtoSelecionado.preco,
      valorTotal: produtoSelecionado.preco * quantidade,
      formaPagamento: novaVenda.formaPagamento,
      status: "pendente",
      data: "06/02/2026",
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setVendas([nova, ...vendas]);
    setNovaVenda({ cliente: "", produto: "", quantidade: "1", formaPagamento: "" });
    setNovaVendaOpen(false);
  };

  const produtoSelecionado = produtos.find((p) => p.nome === novaVenda.produto);
  const valorPreview = produtoSelecionado
    ? produtoSelecionado.preco * parseInt(novaVenda.quantidade || "1")
    : 0;

  return (
    <MainLayout>
      <Header title="Vendas" subtitle="Gerenciamento de vendas e pedidos" />
      <div className="p-6">
        {/* Cards de resumo */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas Hoje</p>
                <p className="text-2xl font-bold">
                  R$ {totalVendasHoje.toLocaleString("pt-BR")}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-info/10 p-3">
                <ShoppingCart className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Hoje</p>
                <p className="text-2xl font-bold">{totalPedidosHoje}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-success/10 p-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  R$ {(totalVendasHoje / (totalPedidosHoje || 1)).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão de acesso rápido ao PDV */}
        <div className="mb-6">
          <Button 
            size="lg" 
            className="w-full sm:w-auto gap-2 h-14 text-lg"
            onClick={() => navigate("/vendas/pdv")}
          >
            <Store className="h-5 w-5" />
            Abrir PDV - Portaria
            <span className="text-xs opacity-70 ml-2">(Venda Balcão)</span>
          </Button>
        </div>

        {/* Tabela de vendas */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Histórico de Vendas</CardTitle>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar venda..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
                <Dialog open={novaVendaOpen} onOpenChange={setNovaVendaOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Venda
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Nova Venda</DialogTitle>
                      <DialogDescription>
                        Preencha os dados da venda
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Cliente</Label>
                        <Select
                          value={novaVenda.cliente}
                          onValueChange={(value) =>
                            setNovaVenda({ ...novaVenda, cliente: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clientes.map((cliente) => (
                              <SelectItem key={cliente} value={cliente}>
                                {cliente}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Produto</Label>
                        <Select
                          value={novaVenda.produto}
                          onValueChange={(value) =>
                            setNovaVenda({ ...novaVenda, produto: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {produtos.map((produto) => (
                              <SelectItem key={produto.nome} value={produto.nome}>
                                {produto.nome} - R$ {produto.preco}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quantidade">Quantidade</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          min="1"
                          value={novaVenda.quantidade}
                          onChange={(e) =>
                            setNovaVenda({ ...novaVenda, quantidade: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Forma de Pagamento</Label>
                        <Select
                          value={novaVenda.formaPagamento}
                          onValueChange={(value) =>
                            setNovaVenda({ ...novaVenda, formaPagamento: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PIX">PIX</SelectItem>
                            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="Cartão">Cartão</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {valorPreview > 0 && (
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground">Valor Total</p>
                          <p className="text-2xl font-bold text-primary">
                            R$ {valorPreview.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNovaVendaOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleNovaVenda}>Confirmar Venda</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendasFiltradas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell className="font-medium">#{venda.id}</TableCell>
                    <TableCell>{venda.cliente}</TableCell>
                    <TableCell>{venda.produto}</TableCell>
                    <TableCell>{venda.quantidade}</TableCell>
                    <TableCell className="font-semibold">
                      R$ {venda.valorTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{venda.formaPagamento}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[venda.status].variant}>
                        {statusConfig[venda.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {venda.data} {venda.hora}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
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
