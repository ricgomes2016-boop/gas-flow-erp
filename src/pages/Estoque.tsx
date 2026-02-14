import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Package, AlertTriangle, ArrowUpDown, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUnidade } from "@/contexts/UnidadeContext";
import { EstoqueDiaTable } from "@/components/estoque/EstoqueDiaTable";

interface ProdutoEstoque {
  id: string;
  nome: string;
  tipo_botijao: string | null;
  estoque: number;
  preco: number;
  categoria: string | null;
  botijao_par_id: string | null;
}

interface VendaDia {
  produto_id: string | null;
  quantidade: number;
}

export default function Estoque() {
  const { toast } = useToast();
  const { unidadeAtual } = useUnidade();
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [vendasDia, setVendasDia] = useState<VendaDia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [movimentacaoDialogOpen, setMovimentacaoDialogOpen] = useState(false);
  const [movimentacao, setMovimentacao] = useState({
    produtoId: "",
    tipo: "entrada" as "entrada" | "saida",
    quantidade: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let prodQuery = supabase
        .from("produtos")
        .select("id, nome, tipo_botijao, estoque, preco, categoria, botijao_par_id")
        .eq("ativo", true)
        .order("nome");

      if (unidadeAtual?.id) {
        prodQuery = prodQuery.eq("unidade_id", unidadeAtual.id);
      }

      // Fetch today's sales
      const inicioHoje = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), dataInicio.getDate()).toISOString();
      const fimHoje = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate(), 23, 59, 59).toISOString();

      let vendasQuery = supabase
        .from("pedido_itens")
        .select("produto_id, quantidade, pedidos!inner(created_at, status, unidade_id)")
        .gte("pedidos.created_at", inicioHoje)
        .lte("pedidos.created_at", fimHoje)
        .neq("pedidos.status", "cancelado");

      if (unidadeAtual?.id) {
        vendasQuery = vendasQuery.or(`unidade_id.eq.${unidadeAtual.id},unidade_id.is.null`, { referencedTable: "pedidos" });
      }

      const [{ data: prodData, error: prodError }, { data: vendasData, error: vendasError }] = await Promise.all([
        prodQuery,
        vendasQuery,
      ]);

      if (prodError) throw prodError;
      if (vendasError) console.error("Erro vendas:", vendasError);

      setProdutos(prodData || []);
      setVendasDia(
        (vendasData || []).map((v: any) => ({
          produto_id: v.produto_id,
          quantidade: v.quantidade,
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({ title: "Erro", description: "Não foi possível carregar o estoque.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [unidadeAtual?.id, dataInicio, dataFim]);

  const handleMovimentacao = async () => {
    const quantidade = parseInt(movimentacao.quantidade);
    if (!movimentacao.produtoId || isNaN(quantidade) || quantidade <= 0) {
      toast({ title: "Erro", description: "Preencha todos os campos corretamente.", variant: "destructive" });
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
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
      toast({ title: "Erro", description: "Não foi possível registrar a movimentação.", variant: "destructive" });
    }
  };

  const produtosGas = produtos.filter((p) => p.categoria === "gas");
  const getTotalCheios = () => produtosGas.filter((p) => p.tipo_botijao === "cheio").reduce((acc, p) => acc + (p.estoque || 0), 0);
  const getTotalVazios = () => produtosGas.filter((p) => p.tipo_botijao === "vazio").reduce((acc, p) => acc + (p.estoque || 0), 0);
  const getValorEstoque = () => produtos.filter((p) => p.tipo_botijao !== "vazio").reduce((acc, p) => acc + (p.estoque || 0) * (p.preco || 0), 0);
  const totalVendasDia = vendasDia.reduce((acc, v) => acc + v.quantidade, 0);

  return (
    <MainLayout>
      <Header title="Estoque" subtitle="Controle de estoque do dia" />
      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cheios</p>
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
                <p className="text-sm text-muted-foreground">Vazios</p>
                <p className="text-2xl font-bold">{getTotalVazios()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-accent p-3">
                <ArrowUpDown className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas Hoje</p>
                <p className="text-2xl font-bold">{totalVendasDia}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-destructive/10 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Estoque</p>
                <p className="text-2xl font-bold">R$ {getValorEstoque().toLocaleString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date filters */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !dataInicio && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dataInicio, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dataInicio} onSelect={(d) => d && setDataInicio(d)} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !dataFim && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dataFim, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dataFim} onSelect={(d) => d && setDataFim(d)} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Dialog open={movimentacaoDialogOpen} onOpenChange={setMovimentacaoDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Movimentação de Estoque</DialogTitle>
                <DialogDescription>Registre entrada ou saída de produtos</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Produto</Label>
                  <Select value={movimentacao.produtoId} onValueChange={(v) => setMovimentacao({ ...movimentacao, produtoId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                    <SelectContent>
                      {produtos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nome} (Estoque: {p.estoque})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={movimentacao.tipo} onValueChange={(v: "entrada" | "saida") => setMovimentacao({ ...movimentacao, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">➕ Entrada</SelectItem>
                      <SelectItem value="saida">➖ Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input id="quantidade" type="number" min="1" value={movimentacao.quantidade} onChange={(e) => setMovimentacao({ ...movimentacao, quantidade: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMovimentacaoDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleMovimentacao}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Daily stock table */}
        <EstoqueDiaTable produtos={produtos} vendasDia={vendasDia} isLoading={isLoading} />
      </div>
    </MainLayout>
  );
}
