import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Plus, ShoppingCart, Package, CreditCard, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format, startOfDay, endOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Mov {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  categoria: string | null;
  created_at: string;
}

interface PedidoResumo {
  id: string;
  valor_total: number;
  forma_pagamento: string | null;
  status: string | null;
  created_at: string;
}

interface ProdutoVendido {
  nome: string;
  quantidade: number;
  total: number;
}

interface FormaPagamentoResumo {
  forma: string;
  quantidade: number;
  total: number;
}

export default function CaixaDia() {
  const [movs, setMovs] = useState<Mov[]>([]);
  const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);
  const [produtosVendidos, setProdutosVendidos] = useState<ProdutoVendido[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const { unidadeAtual } = useUnidade();
  const [form, setForm] = useState({ tipo: "entrada", descricao: "", valor: "", categoria: "" });

  const fetchData = async () => {
    setLoading(true);
    const inicio = startOfDay(dataSelecionada).toISOString();
    const fim = endOfDay(dataSelecionada).toISOString();

    // Fetch movimentações
    let qMov = supabase.from("movimentacoes_caixa").select("*").gte("created_at", inicio).lte("created_at", fim).order("created_at", { ascending: false });
    if (unidadeAtual?.id) qMov = qMov.eq("unidade_id", unidadeAtual.id);

    // Fetch pedidos do dia
    let qPed = supabase.from("pedidos").select("id, valor_total, forma_pagamento, status, created_at").gte("created_at", inicio).lte("created_at", fim);
    if (unidadeAtual?.id) qPed = qPed.eq("unidade_id", unidadeAtual.id);

    const [resMov, resPed] = await Promise.all([qMov, qPed]);

    if (resMov.error) console.error(resMov.error);
    else setMovs((resMov.data as Mov[]) || []);

    if (resPed.error) console.error(resPed.error);
    else {
      const pedidosData = (resPed.data as PedidoResumo[]) || [];
      setPedidos(pedidosData);

      // Resumo formas de pagamento
      const fpMap = new Map<string, { quantidade: number; total: number }>();
      pedidosData.forEach(p => {
        const fp = p.forma_pagamento || "Não informado";
        const existing = fpMap.get(fp) || { quantidade: 0, total: 0 };
        fpMap.set(fp, { quantidade: existing.quantidade + 1, total: existing.total + Number(p.valor_total || 0) });
      });
      setFormasPagamento(Array.from(fpMap.entries()).map(([forma, v]) => ({ forma, ...v })).sort((a, b) => b.total - a.total));

      // Fetch itens dos pedidos para resumo de produtos
      if (pedidosData.length > 0) {
        const pedidoIds = pedidosData.map(p => p.id);
        const { data: itens, error: itensErr } = await supabase
          .from("pedido_itens")
          .select("quantidade, preco_unitario, produto_id, produtos(nome)")
          .in("pedido_id", pedidoIds);

        if (itensErr) console.error(itensErr);
        else {
          const prodMap = new Map<string, { quantidade: number; total: number }>();
          (itens || []).forEach((item: any) => {
            const nome = item.produtos?.nome || "Produto removido";
            const existing = prodMap.get(nome) || { quantidade: 0, total: 0 };
            prodMap.set(nome, {
              quantidade: existing.quantidade + item.quantidade,
              total: existing.total + (item.quantidade * Number(item.preco_unitario)),
            });
          });
          setProdutosVendidos(Array.from(prodMap.entries()).map(([nome, v]) => ({ nome, ...v })).sort((a, b) => b.quantidade - a.quantidade));
        }
      } else {
        setProdutosVendidos([]);
      }
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [unidadeAtual, dataSelecionada]);

  const handleSubmit = async () => {
    if (!form.descricao || !form.valor) { toast.error("Preencha os campos"); return; }
    const { error } = await supabase.from("movimentacoes_caixa").insert({
      tipo: form.tipo, descricao: form.descricao,
      valor: parseFloat(form.valor), categoria: form.categoria || null,
      unidade_id: unidadeAtual?.id || null,
    });
    if (error) { toast.error("Erro ao registrar"); console.error(error); }
    else { toast.success("Registrado!"); setDialogOpen(false); setForm({ tipo: "entrada", descricao: "", valor: "", categoria: "" }); fetchData(); }
  };

  const totalEntradas = movs.filter(m => m.tipo === "entrada").reduce((a, m) => a + Number(m.valor), 0);
  const totalSaidas = movs.filter(m => m.tipo === "saida").reduce((a, m) => a + Number(m.valor), 0);
  const saldo = totalEntradas - totalSaidas;
  const totalVendas = pedidos.reduce((a, p) => a + Number(p.valor_total || 0), 0);
  const qtdPedidos = pedidos.length;

  return (
    <MainLayout>
      <Header title="Caixa do Dia" subtitle="Controle de movimentações financeiras" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !dataSelecionada && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dataSelecionada} onSelect={(d) => d && setDataSelecionada(d)} locale={ptBR} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Movimentação</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Movimentação</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Descrição *</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
                <div><Label>Valor *</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                <div><Label>Categoria</Label>
                  <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vendas">Vendas</SelectItem><SelectItem value="Combustível">Combustível</SelectItem>
                      <SelectItem value="Alimentação">Alimentação</SelectItem><SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Troco">Troco</SelectItem><SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSubmit}>Registrar</Button></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><ShoppingCart className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">R$ {totalVendas.toFixed(2)}</p><p className="text-sm text-muted-foreground">{qtdPedidos} vendas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-success/10"><TrendingUp className="h-6 w-6 text-success" /></div><div><p className="text-2xl font-bold text-success">R$ {totalEntradas.toFixed(2)}</p><p className="text-sm text-muted-foreground">Entradas Caixa</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-destructive/10"><TrendingDown className="h-6 w-6 text-destructive" /></div><div><p className="text-2xl font-bold text-destructive">R$ {totalSaidas.toFixed(2)}</p><p className="text-sm text-muted-foreground">Saídas Caixa</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><DollarSign className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">R$ {saldo.toFixed(2)}</p><p className="text-sm text-muted-foreground">Saldo Caixa</p></div></div></CardContent></Card>
        </div>

        {/* Abas de resumos */}
        <Tabs defaultValue="movimentacoes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
            <TabsTrigger value="produtos">Produtos Vendidos</TabsTrigger>
            <TabsTrigger value="pagamentos">Formas de Pagamento</TabsTrigger>
          </TabsList>

          <TabsContent value="movimentacoes">
            <Card>
              <CardHeader><CardTitle>Movimentações do Dia</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : movs.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhuma movimentação</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Hora</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {movs.map(mov => (
                        <TableRow key={mov.id}>
                          <TableCell className="text-muted-foreground">{new Date(mov.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                          <TableCell><Badge variant={mov.tipo === "entrada" ? "default" : "destructive"}>{mov.tipo === "entrada" ? "Entrada" : "Saída"}</Badge></TableCell>
                          <TableCell>{mov.descricao}</TableCell>
                          <TableCell><Badge variant="outline">{mov.categoria || "—"}</Badge></TableCell>
                          <TableCell className={`text-right font-medium ${mov.tipo === "entrada" ? "text-success" : "text-destructive"}`}>
                            {mov.tipo === "entrada" ? "+" : "-"} R$ {Number(mov.valor).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produtos">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Produtos Vendidos</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : produtosVendidos.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhuma venda registrada</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead className="text-center">Qtd</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {produtosVendidos.map(p => (
                        <TableRow key={p.nome}>
                          <TableCell className="font-medium">{p.nome}</TableCell>
                          <TableCell className="text-center"><Badge variant="secondary">{p.quantidade}</Badge></TableCell>
                          <TableCell className="text-right font-medium">R$ {p.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-center">{produtosVendidos.reduce((a, p) => a + p.quantidade, 0)}</TableCell>
                        <TableCell className="text-right">R$ {produtosVendidos.reduce((a, p) => a + p.total, 0).toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagamentos">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Formas de Pagamento</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : formasPagamento.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhuma venda registrada</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Forma</TableHead><TableHead className="text-center">Pedidos</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {formasPagamento.map(fp => (
                        <TableRow key={fp.forma}>
                          <TableCell className="font-medium capitalize">{fp.forma}</TableCell>
                          <TableCell className="text-center"><Badge variant="secondary">{fp.quantidade}</Badge></TableCell>
                          <TableCell className="text-right font-medium">R$ {fp.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-center">{formasPagamento.reduce((a, f) => a + f.quantidade, 0)}</TableCell>
                        <TableCell className="text-right">R$ {formasPagamento.reduce((a, f) => a + f.total, 0).toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
