import { useState } from "react";
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
import { Plus, Minus, Package, AlertTriangle, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProdutoEstoque {
  id: number;
  nome: string;
  tipo: "cheio" | "vazio";
  quantidade: number;
  minimo: number;
  maximo: number;
  preco: number;
}

const estoqueInicial: ProdutoEstoque[] = [
  { id: 1, nome: "Botijão P13", tipo: "cheio", quantidade: 45, minimo: 20, maximo: 100, preco: 110 },
  { id: 2, nome: "Botijão P13", tipo: "vazio", quantidade: 30, minimo: 10, maximo: 100, preco: 0 },
  { id: 3, nome: "Botijão P45", tipo: "cheio", quantidade: 12, minimo: 5, maximo: 30, preco: 380 },
  { id: 4, nome: "Botijão P45", tipo: "vazio", quantidade: 8, minimo: 3, maximo: 30, preco: 0 },
  { id: 5, nome: "Botijão P20", tipo: "cheio", quantidade: 6, minimo: 3, maximo: 20, preco: 180 },
  { id: 6, nome: "Botijão P20", tipo: "vazio", quantidade: 4, minimo: 2, maximo: 20, preco: 0 },
];

export default function Estoque() {
  const [estoque, setEstoque] = useState<ProdutoEstoque[]>(estoqueInicial);
  const [movimentacaoDialogOpen, setMovimentacaoDialogOpen] = useState(false);
  const [movimentacao, setMovimentacao] = useState({
    produtoId: "",
    tipo: "entrada" as "entrada" | "saida",
    quantidade: "",
  });

  const handleMovimentacao = () => {
    const produtoId = parseInt(movimentacao.produtoId);
    const quantidade = parseInt(movimentacao.quantidade);

    setEstoque(
      estoque.map((produto) => {
        if (produto.id === produtoId) {
          const novaQuantidade =
            movimentacao.tipo === "entrada"
              ? produto.quantidade + quantidade
              : produto.quantidade - quantidade;
          return { ...produto, quantidade: Math.max(0, novaQuantidade) };
        }
        return produto;
      })
    );

    setMovimentacao({ produtoId: "", tipo: "entrada", quantidade: "" });
    setMovimentacaoDialogOpen(false);
  };

  const getTotalCheios = () =>
    estoque.filter((p) => p.tipo === "cheio").reduce((acc, p) => acc + p.quantidade, 0);

  const getTotalVazios = () =>
    estoque.filter((p) => p.tipo === "vazio").reduce((acc, p) => acc + p.quantidade, 0);

  const getValorEstoque = () =>
    estoque
      .filter((p) => p.tipo === "cheio")
      .reduce((acc, p) => acc + p.quantidade * p.preco, 0);

  const produtosBaixoEstoque = estoque.filter((p) => p.quantidade <= p.minimo);

  return (
    <MainLayout>
      <Header title="Estoque" subtitle="Controle de estoque de botijões" />
      <div className="p-6">
        {/* Cards de resumo */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Botijões Cheios</p>
                <p className="text-2xl font-bold">{getTotalCheios()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-muted p-3">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Botijões Vazios</p>
                <p className="text-2xl font-bold">{getTotalVazios()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-success/10 p-3">
                <ArrowUpDown className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor em Estoque</p>
                <p className="text-2xl font-bold">
                  R$ {getValorEstoque().toLocaleString("pt-BR")}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-destructive/10 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold">{produtosBaixoEstoque.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de estoque */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Produtos em Estoque</CardTitle>
              <Dialog
                open={movimentacaoDialogOpen}
                onOpenChange={setMovimentacaoDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Movimentação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Movimentação de Estoque</DialogTitle>
                    <DialogDescription>
                      Registre entrada ou saída de produtos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Produto</Label>
                      <Select
                        value={movimentacao.produtoId}
                        onValueChange={(value) =>
                          setMovimentacao({ ...movimentacao, produtoId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {estoque.map((produto) => (
                            <SelectItem key={produto.id} value={produto.id.toString()}>
                              {produto.nome} ({produto.tipo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Tipo</Label>
                      <Select
                        value={movimentacao.tipo}
                        onValueChange={(value: "entrada" | "saida") =>
                          setMovimentacao({ ...movimentacao, tipo: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4 text-success" />
                              Entrada
                            </div>
                          </SelectItem>
                          <SelectItem value="saida">
                            <div className="flex items-center gap-2">
                              <Minus className="h-4 w-4 text-destructive" />
                              Saída
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantidade">Quantidade</Label>
                      <Input
                        id="quantidade"
                        type="number"
                        value={movimentacao.quantidade}
                        onChange={(e) =>
                          setMovimentacao({
                            ...movimentacao,
                            quantidade: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setMovimentacaoDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleMovimentacao}>Confirmar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estoque.map((produto) => {
                  const porcentagem = (produto.quantidade / produto.maximo) * 100;
                  const isBaixo = produto.quantidade <= produto.minimo;

                  return (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>
                        <Badge
                          variant={produto.tipo === "cheio" ? "default" : "secondary"}
                        >
                          {produto.tipo === "cheio" ? "Cheio" : "Vazio"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {produto.quantidade} / {produto.maximo}
                      </TableCell>
                      <TableCell className="w-32">
                        <Progress value={porcentagem} className="h-2" />
                      </TableCell>
                      <TableCell>
                        {produto.preco > 0
                          ? `R$ ${produto.preco.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {isBaixo ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Baixo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-success border-success">
                            Normal
                          </Badge>
                        )}
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
