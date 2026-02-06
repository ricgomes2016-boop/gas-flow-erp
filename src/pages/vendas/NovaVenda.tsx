import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Search, ShoppingCart } from "lucide-react";
import { SugestaoEntregador } from "@/components/sugestao/SugestaoEntregador";
import { useToast } from "@/hooks/use-toast";

interface ItemVenda {
  id: number;
  produto: string;
  quantidade: number;
  preco: number;
  total: number;
}

export default function NovaVenda() {
  const [itens, setItens] = useState<ItemVenda[]>([
    { id: 1, produto: "Gás P13", quantidade: 2, preco: 110.0, total: 220.0 },
  ]);
  const [endereco, setEndereco] = useState("");
  const [entregadorSelecionado, setEntregadorSelecionado] = useState<string | null>(null);
  const { toast } = useToast();

  const total = itens.reduce((acc, item) => acc + item.total, 0);

  const adicionarItem = () => {
    setItens([
      ...itens,
      {
        id: itens.length + 1,
        produto: "",
        quantidade: 1,
        preco: 0,
        total: 0,
      },
    ]);
  };

  const removerItem = (id: number) => {
    setItens(itens.filter((item) => item.id !== id));
  };

  const handleSelecionarEntregador = (id: number, nome: string) => {
    setEntregadorSelecionado(nome);
    toast({
      title: "Entregador selecionado!",
      description: `${nome} foi atribuído a esta venda.`,
    });
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nova Venda</h1>
            <p className="text-muted-foreground">Registrar novo pedido de venda</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cliente */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Buscar Cliente</Label>
                  <Input placeholder="Nome, telefone ou endereço..." />
                </div>
                <Button className="mt-6">Buscar</Button>
                <Button variant="outline" className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nome</Label>
                  <Input placeholder="Nome do cliente" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input placeholder="(00) 00000-0000" />
                </div>
                <div className="md:col-span-2">
                  <Label>Endereço</Label>
                  <Input 
                    placeholder="Endereço completo" 
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </div>
              </div>

              {/* Sugestão de Entregador */}
              {endereco.length > 10 && (
                <div className="pt-4 border-t border-border">
                  <SugestaoEntregador
                    endereco={endereco}
                    onSelecionar={handleSelecionarEntregador}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Desconto</span>
                <span>R$ 0,00</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-4">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>

              {entregadorSelecionado && (
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>Entregador</span>
                  <span className="font-medium text-success">{entregadorSelecionado}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select defaultValue="dinheiro">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="fiado">Fiado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" size="lg">
                Finalizar Venda
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Itens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Itens do Pedido</CardTitle>
            <Button onClick={adicionarItem}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="w-32">Quantidade</TableHead>
                  <TableHead className="w-32">Preço Unit.</TableHead>
                  <TableHead className="w-32">Total</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Select defaultValue={item.produto || undefined}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gás P13">Gás P13</SelectItem>
                          <SelectItem value="Gás P20">Gás P20</SelectItem>
                          <SelectItem value="Gás P45">Gás P45</SelectItem>
                          <SelectItem value="Água 20L">Água 20L</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" defaultValue={item.quantidade} min={1} />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={item.preco.toFixed(2)}
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {item.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removerItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
