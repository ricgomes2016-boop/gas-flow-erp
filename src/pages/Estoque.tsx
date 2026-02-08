import { useState, useEffect } from "react";
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
import { Package, AlertTriangle, ArrowUpDown, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUnidade } from "@/contexts/UnidadeContext";

interface ProdutoEstoque {
  id: string;
  nome: string;
  tipo_botijao: string | null;
  estoque: number;
  preco: number;
  categoria: string | null;
}

// Limites de estoque por tipo de produto
const LIMITES_ESTOQUE: Record<string, { minimo: number; maximo: number }> = {
  "Gás P13": { minimo: 20, maximo: 100 },
  "Gás P20": { minimo: 5, maximo: 30 },
  "Gás P45": { minimo: 3, maximo: 20 },
  default: { minimo: 10, maximo: 100 },
};

function getLimites(nome: string) {
  // Extrair nome base (sem " (Vazio)")
  const nomeBase = nome.replace(" (Vazio)", "");
  return LIMITES_ESTOQUE[nomeBase] || LIMITES_ESTOQUE.default;
}

export default function Estoque() {
  const { toast } = useToast();
  const { unidadeAtual } = useUnidade();
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [movimentacaoDialogOpen, setMovimentacaoDialogOpen] = useState(false);
  const [movimentacao, setMovimentacao] = useState({
    produtoId: "",
    tipo: "entrada" as "entrada" | "saida",
    quantidade: "",
  });

  const fetchProdutos = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("produtos")
        .select("id, nome, tipo_botijao, estoque, preco, categoria")
        .eq("ativo", true)
        .order("nome");

      // Filtrar por unidade se houver unidade selecionada
      if (unidadeAtual?.id) {
        query = query.eq("unidade_id", unidadeAtual.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o estoque.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [unidadeAtual?.id]);

  const handleMovimentacao = async () => {
    const quantidade = parseInt(movimentacao.quantidade);
    if (!movimentacao.produtoId || isNaN(quantidade) || quantidade <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente.",
        variant: "destructive",
      });
      return;
    }

    const produto = produtos.find((p) => p.id === movimentacao.produtoId);
    if (!produto) return;

    const novaQuantidade =
      movimentacao.tipo === "entrada"
        ? produto.estoque + quantidade
        : Math.max(0, produto.estoque - quantidade);

    try {
      const { error } = await supabase
        .from("produtos")
        .update({ estoque: novaQuantidade })
        .eq("id", movimentacao.produtoId);

      if (error) throw error;

      toast({
        title: "Movimentação registrada!",
        description: `${movimentacao.tipo === "entrada" ? "Entrada" : "Saída"} de ${quantidade} unidades.`,
      });

      setMovimentacao({ produtoId: "", tipo: "entrada", quantidade: "" });
      setMovimentacaoDialogOpen(false);
      fetchProdutos();
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a movimentação.",
        variant: "destructive",
      });
    }
  };

  // Filtrar apenas produtos de gás para exibição principal
  const produtosGas = produtos.filter((p) => p.categoria === "gas");
  const outrosProdutos = produtos.filter((p) => p.categoria !== "gas");

  const getTotalCheios = () =>
    produtosGas
      .filter((p) => p.tipo_botijao === "cheio")
      .reduce((acc, p) => acc + (p.estoque || 0), 0);

  const getTotalVazios = () =>
    produtosGas
      .filter((p) => p.tipo_botijao === "vazio")
      .reduce((acc, p) => acc + (p.estoque || 0), 0);

  const getValorEstoque = () =>
    produtos
      .filter((p) => p.tipo_botijao !== "vazio")
      .reduce((acc, p) => acc + (p.estoque || 0) * (p.preco || 0), 0);

  const produtosBaixoEstoque = produtosGas.filter((p) => {
    const limites = getLimites(p.nome);
    return (p.estoque || 0) <= limites.minimo;
  });

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

        {/* Tabela de estoque de Gás */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Botijões de Gás</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchProdutos} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
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
                            {produtos.map((produto) => (
                              <SelectItem key={produto.id} value={produto.id}>
                                {produto.nome} (Estoque: {produto.estoque})
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
                                ➕ Entrada
                              </div>
                            </SelectItem>
                            <SelectItem value="saida">
                              <div className="flex items-center gap-2">
                                ➖ Saída
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
                          min="1"
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
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : (
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
                  {produtosGas.map((produto) => {
                    const limites = getLimites(produto.nome);
                    const porcentagem = ((produto.estoque || 0) / limites.maximo) * 100;
                    const isBaixo = (produto.estoque || 0) <= limites.minimo;

                    return (
                      <TableRow key={produto.id}>
                        <TableCell className="font-medium">{produto.nome}</TableCell>
                        <TableCell>
                          <Badge
                            variant={produto.tipo_botijao === "cheio" ? "default" : "secondary"}
                          >
                            {produto.tipo_botijao === "cheio" ? "Cheio" : "Vazio"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {produto.estoque} / {limites.maximo}
                        </TableCell>
                        <TableCell className="w-32">
                          <Progress value={Math.min(100, porcentagem)} className="h-2" />
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
            )}
          </CardContent>
        </Card>

        {/* Outros Produtos */}
        {outrosProdutos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Outros Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outrosProdutos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{produto.categoria || "Sem categoria"}</Badge>
                      </TableCell>
                      <TableCell>{produto.estoque}</TableCell>
                      <TableCell>R$ {produto.preco.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}