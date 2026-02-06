import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Package,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  CheckCircle,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const produtos = [
  { id: 1, nome: "Botijão P13", preco: 120.0, estoque: 15 },
  { id: 2, nome: "Botijão P20", preco: 180.0, estoque: 8 },
  { id: 3, nome: "Botijão P45", preco: 450.0, estoque: 5 },
  { id: 4, nome: "Água Mineral 20L", preco: 15.0, estoque: 50 },
  { id: 5, nome: "Mangueira de Gás", preco: 35.0, estoque: 20 },
  { id: 6, nome: "Regulador de Gás", preco: 45.0, estoque: 12 },
];

const clientesRecentes = [
  { id: 1, nome: "Maria Silva", endereco: "Rua das Flores, 123", telefone: "(11) 99999-1111" },
  { id: 2, nome: "João Santos", endereco: "Av. Brasil, 456", telefone: "(11) 99999-2222" },
  { id: 3, nome: "Ana Oliveira", endereco: "Rua São Paulo, 789", telefone: "(11) 99999-3333" },
];

const formasPagamento = [
  "Dinheiro",
  "PIX",
  "Cartão Crédito",
  "Cartão Débito",
  "Vale Gás",
];

interface ItemVenda {
  produtoId: number;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

interface Cliente {
  nome: string;
  telefone: string;
  endereco: string;
  numero: string;
  bairro: string;
  complemento: string;
}

export default function EntregadorNovaVenda() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cliente, setCliente] = useState<Cliente>({
    nome: "",
    telefone: "",
    endereco: "",
    numero: "",
    bairro: "",
    complemento: "",
  });
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacao, setObservacao] = useState("");
  const [dialogClienteAberto, setDialogClienteAberto] = useState(false);
  const [buscaCliente, setBuscaCliente] = useState("");

  const total = itens.reduce(
    (acc, item) => acc + item.quantidade * item.precoUnitario,
    0
  );

  const adicionarProduto = (produtoId: string) => {
    const produto = produtos.find((p) => p.id === Number(produtoId));
    if (produto) {
      const existente = itens.findIndex((i) => i.produtoId === produto.id);
      if (existente >= 0) {
        alterarQuantidade(existente, 1);
      } else {
        setItens((prev) => [
          ...prev,
          {
            produtoId: produto.id,
            nome: produto.nome,
            quantidade: 1,
            precoUnitario: produto.preco,
          },
        ]);
      }
    }
  };

  const alterarQuantidade = (index: number, delta: number) => {
    setItens((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const novaQtd = Math.max(1, item.quantidade + delta);
          return { ...item, quantidade: novaQtd };
        }
        return item;
      })
    );
  };

  const removerItem = (index: number) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  };

  const selecionarClienteRecente = (clienteRecente: typeof clientesRecentes[0]) => {
    setCliente({
      nome: clienteRecente.nome,
      telefone: clienteRecente.telefone,
      endereco: clienteRecente.endereco.split(",")[0],
      numero: clienteRecente.endereco.split(",")[1]?.trim() || "",
      bairro: "",
      complemento: "",
    });
    setDialogClienteAberto(false);
  };

  const finalizarVenda = () => {
    if (!cliente.nome || !cliente.telefone || !cliente.endereco) {
      toast({
        title: "Dados incompletos",
        description: "Preencha os dados do cliente.",
        variant: "destructive",
      });
      return;
    }

    if (itens.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione pelo menos um produto.",
        variant: "destructive",
      });
      return;
    }

    if (!formaPagamento) {
      toast({
        title: "Forma de pagamento",
        description: "Selecione uma forma de pagamento.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Venda registrada!",
      description: "Canal: Entregador. A venda foi enviada ao sistema.",
    });
    navigate("/entregador");
  };

  const clientesFiltrados = clientesRecentes.filter(
    (c) =>
      c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      c.telefone.includes(buscaCliente)
  );

  return (
    <EntregadorLayout title="Nova Venda">
      <div className="p-4 space-y-4">
        {/* Cliente */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Cliente
              </CardTitle>
              <Dialog open={dialogClienteAberto} onOpenChange={setDialogClienteAberto}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Search className="h-4 w-4 mr-1" />
                    Buscar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Buscar Cliente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nome ou telefone..."
                      value={buscaCliente}
                      onChange={(e) => setBuscaCliente(e.target.value)}
                    />
                    <div className="space-y-2 max-h-60 overflow-auto">
                      {clientesFiltrados.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => selecionarClienteRecente(c)}
                          className="p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
                        >
                          <p className="font-medium">{c.nome}</p>
                          <p className="text-sm text-muted-foreground">{c.telefone}</p>
                          <p className="text-xs text-muted-foreground">{c.endereco}</p>
                        </div>
                      ))}
                      {clientesFiltrados.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhum cliente encontrado
                        </p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Nome *</Label>
                <Input
                  value={cliente.nome}
                  onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={cliente.telefone}
                    onChange={(e) =>
                      setCliente({ ...cliente, telefone: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Endereço *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={cliente.endereco}
                    onChange={(e) =>
                      setCliente({ ...cliente, endereco: e.target.value })
                    }
                    placeholder="Rua, Avenida..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Número</Label>
                <Input
                  value={cliente.numero}
                  onChange={(e) => setCliente({ ...cliente, numero: e.target.value })}
                  placeholder="123"
                />
              </div>
              <div>
                <Label className="text-xs">Bairro</Label>
                <Input
                  value={cliente.bairro}
                  onChange={(e) => setCliente({ ...cliente, bairro: e.target.value })}
                  placeholder="Bairro"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Complemento</Label>
                <Input
                  value={cliente.complemento}
                  onChange={(e) =>
                    setCliente({ ...cliente, complemento: e.target.value })
                  }
                  placeholder="Apto, bloco..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Produtos
              </CardTitle>
              <Select onValueChange={adicionarProduto}>
                <SelectTrigger className="w-auto h-8 text-xs">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{p.nome}</span>
                        <span className="text-muted-foreground">
                          R$ {p.preco.toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {itens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum produto adicionado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {itens.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        R$ {item.precoUnitario.toFixed(2)} un.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => alterarQuantidade(index, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-bold">
                        {item.quantidade}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => alterarQuantidade(index, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removerItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-xl text-primary">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagamento */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Forma de Pagamento *</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {formasPagamento.map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {forma}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Observação</Label>
              <Textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Observações sobre a venda..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Canal de venda */}
        <Card className="border-none shadow-md bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Canal de Venda:</span>
              <Badge className="gradient-primary text-white">
                🛵 Entregador
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Botão Finalizar */}
        <Button
          onClick={finalizarVenda}
          className="w-full h-14 text-lg gradient-primary text-white shadow-glow"
          disabled={itens.length === 0 || !cliente.nome || !formaPagamento}
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Finalizar Venda • R$ {total.toFixed(2)}
        </Button>
      </div>
    </EntregadorLayout>
  );
}
