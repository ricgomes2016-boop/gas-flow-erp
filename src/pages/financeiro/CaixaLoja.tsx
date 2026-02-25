import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  Plus, Banknote, AlertCircle, RefreshCw, Landmark, ArrowRightLeft,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { criarMovimentacaoBancaria } from "@/services/paymentRoutingService";
import { format, subDays } from "date-fns";
import { getBrasiliaStartOfDay } from "@/lib/utils";

interface Movimentacao {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  categoria: string | null;
  created_at: string;
}

interface ContaBancaria {
  id: string;
  nome: string;
  banco: string;
  saldo_atual: number;
}

export default function CaixaLoja() {
  const [movs, setMovs] = useState<Movimentacao[]>([]);
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [depositoOpen, setDepositoOpen] = useState(false);
  const [transferenciaOpen, setTransferenciaOpen] = useState(false);
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const { unidadeAtual, unidades } = useUnidade();
  const [form, setForm] = useState({ tipo: "entrada", descricao: "", valor: "", categoria: "" });
  const [depositoForm, setDepositoForm] = useState({ contaId: "", valor: "", descricao: "" });
  const [transferenciaForm, setTransferenciaForm] = useState({ unidadeDestinoId: "", valor: "", descricao: "" });
  const [periodo, setPeriodo] = useState<"hoje" | "7dias" | "30dias">("hoje");

  const fetchMovs = async () => {
    setLoading(true);
    const daysBack = periodo === "hoje" ? 0 : periodo === "7dias" ? 7 : 30;
    const desde = subDays(new Date(), daysBack).toISOString();
    let query = supabase
      .from("movimentacoes_caixa")
      .select("*")
      .gte("created_at", desde)
      .order("created_at", { ascending: false });
    if (unidadeAtual?.id) query = query.or(`unidade_id.eq.${unidadeAtual.id},unidade_id.is.null`);
    const { data, error } = await query;
    if (error) console.error(error);
    else setMovs((data as Movimentacao[]) || []);

    // Buscar saldo total acumulado (ALL TIME) para o caixa da unidade
    let qTotal = supabase
      .from("movimentacoes_caixa")
      .select("tipo, valor");
    if (unidadeAtual?.id) qTotal = qTotal.or(`unidade_id.eq.${unidadeAtual.id},unidade_id.is.null`);
    const { data: allMovs } = await qTotal;
    if (allMovs) {
      const total = allMovs.reduce((acc, m: any) => {
        return acc + (m.tipo === "entrada" ? Number(m.valor) : -Number(m.valor));
      }, 0);
      setSaldoTotal(total);
    }

    setLoading(false);
  };

  const fetchContas = async () => {
    let query = supabase.from("contas_bancarias").select("id, nome, banco, saldo_atual").eq("ativo", true);
    if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
    const { data } = await query;
    setContas((data as ContaBancaria[]) || []);
  };

  useEffect(() => { fetchMovs(); fetchContas(); }, [unidadeAtual, periodo]);

  const handleSubmit = async () => {
    if (!form.descricao || !form.valor) { toast.error("Preencha os campos obrigatórios"); return; }
    const { error } = await supabase.from("movimentacoes_caixa").insert({
      tipo: form.tipo, descricao: form.descricao,
      valor: parseFloat(form.valor), categoria: form.categoria || null,
      unidade_id: unidadeAtual?.id || null,
    });
    if (error) { toast.error("Erro ao registrar"); console.error(error); }
    else {
      toast.success("Movimentação registrada!");
      setDialogOpen(false);
      setForm({ tipo: "entrada", descricao: "", valor: "", categoria: "" });
      fetchMovs();
    }
  };

  // DEPÓSITO: Sai do caixa → Entra na conta bancária
  const handleDeposito = async () => {
    const valor = parseFloat(depositoForm.valor);
    if (!depositoForm.contaId || !valor || valor <= 0) {
      toast.error("Selecione a conta e informe o valor"); return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const desc = depositoForm.descricao || "Depósito bancário do caixa";

    // 1. Saída do caixa
    const { error: errCaixa } = await supabase.from("movimentacoes_caixa").insert({
      tipo: "saida",
      descricao: `💰→🏦 ${desc}`,
      valor,
      categoria: "Depósito Bancário",
      unidade_id: unidadeAtual?.id || null,
    });

    if (errCaixa) { toast.error("Erro ao registrar saída do caixa"); return; }

    // 2. Entrada na conta bancária
    try {
      await criarMovimentacaoBancaria({
        contaBancariaId: depositoForm.contaId,
        valor,
        descricao: `Depósito do caixa - ${desc}`,
        categoria: "deposito_caixa",
        unidadeId: unidadeAtual?.id,
        userId: user?.id,
      });
    } catch (e) {
      console.error(e);
      toast.error("Erro ao creditar na conta bancária");
      return;
    }

    toast.success("Depósito realizado! Saiu do caixa → Entrou na conta bancária.");
    setDepositoOpen(false);
    setDepositoForm({ contaId: "", valor: "", descricao: "" });
    fetchMovs();
    fetchContas();
  };

  // TRANSFERÊNCIA ENTRE CAIXAS: Sai de uma unidade → Entra em outra
  const handleTransferencia = async () => {
    const valor = parseFloat(transferenciaForm.valor);
    if (!transferenciaForm.unidadeDestinoId || !valor || valor <= 0) {
      toast.error("Selecione a unidade destino e informe o valor"); return;
    }

    const unidadeDestino = unidades.find(u => u.id === transferenciaForm.unidadeDestinoId);
    const desc = transferenciaForm.descricao || `Transferência para ${unidadeDestino?.nome || "outra loja"}`;

    // 1. Saída do caixa origem
    const { error: err1 } = await supabase.from("movimentacoes_caixa").insert({
      tipo: "saida",
      descricao: `🔄 Saída: ${desc}`,
      valor,
      categoria: "Transferência Caixa",
      unidade_id: unidadeAtual?.id || null,
    });

    if (err1) { toast.error("Erro ao registrar saída"); return; }

    // 2. Entrada no caixa destino
    const { error: err2 } = await supabase.from("movimentacoes_caixa").insert({
      tipo: "entrada",
      descricao: `🔄 Entrada: Transferência de ${unidadeAtual?.nome || "outra loja"}`,
      valor,
      categoria: "Transferência Caixa",
      unidade_id: transferenciaForm.unidadeDestinoId,
    });

    if (err2) { toast.error("Erro ao registrar entrada no destino"); return; }

    toast.success(`Transferência de R$ ${valor.toFixed(2)} para ${unidadeDestino?.nome} realizada!`);
    setTransferenciaOpen(false);
    setTransferenciaForm({ unidadeDestinoId: "", valor: "", descricao: "" });
    fetchMovs();
  };

  const hoje = new Date(getBrasiliaStartOfDay());
  const entradaHoje = movs.filter(m => m.tipo === "entrada" && new Date(m.created_at) >= hoje).reduce((a, m) => a + Number(m.valor), 0);
  const saidaHoje = movs.filter(m => m.tipo === "saida" && new Date(m.created_at) >= hoje).reduce((a, m) => a + Number(m.valor), 0);
  const totalEntradas = movs.filter(m => m.tipo === "entrada").reduce((a, m) => a + Number(m.valor), 0);
  const totalSaidas = movs.filter(m => m.tipo === "saida").reduce((a, m) => a + Number(m.valor), 0);
  const saldo = totalEntradas - totalSaidas;

  const chartData = useMemo(() => {
    const daysBack = periodo === "hoje" ? 0 : periodo === "7dias" ? 6 : 29;
    const days: Record<string, { entradas: number; saidas: number }> = {};
    for (let i = daysBack; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "dd/MM");
      days[d] = { entradas: 0, saidas: 0 };
    }
    movs.forEach(m => {
      const d = format(new Date(m.created_at), "dd/MM");
      if (days[d]) {
        if (m.tipo === "entrada") days[d].entradas += Number(m.valor);
        else days[d].saidas += Number(m.valor);
      }
    });
    return Object.entries(days).map(([data, v]) => ({ data, ...v }));
  }, [movs, periodo]);

  const categorias = [
    "Venda Dinheiro", "Troco", "Sangria",
    "Suprimento", "Vale Gás", "Despesa Operacional", "Outros",
  ];

  return (
    <MainLayout>
      <Header title="Caixa da Loja" subtitle="Dinheiro físico — depósitos bancários e transferências entre lojas" />
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground font-medium">Dinheiro físico da loja</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={periodo} onValueChange={(v: "hoje" | "7dias" | "30dias") => setPeriodo(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="7dias">7 dias</SelectItem>
                <SelectItem value="30dias">30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => { fetchMovs(); fetchContas(); }}><RefreshCw className="h-4 w-4" /></Button>

            {/* Depósito Bancário */}
            <Dialog open={depositoOpen} onOpenChange={setDepositoOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary"><Landmark className="h-4 w-4 mr-2" />Depositar no Banco</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" />Depositar Dinheiro no Banco</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">O valor sairá do <strong>Caixa da Loja</strong> e entrará na <strong>Conta Bancária</strong> selecionada.</p>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Conta Bancária Destino *</Label>
                    <Select value={depositoForm.contaId} onValueChange={v => setDepositoForm({ ...depositoForm, contaId: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
                      <SelectContent>
                        {contas.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome} ({c.banco}) — R$ {Number(c.saldo_atual).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Valor *</Label><Input type="number" step="0.01" value={depositoForm.valor} onChange={e => setDepositoForm({ ...depositoForm, valor: e.target.value })} placeholder="0.00" /></div>
                  <div><Label>Descrição</Label><Input value={depositoForm.descricao} onChange={e => setDepositoForm({ ...depositoForm, descricao: e.target.value })} placeholder="Ex: Depósito diário" /></div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDepositoOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDeposito}><Landmark className="h-4 w-4 mr-2" />Confirmar Depósito</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Transferência entre Caixas */}
            {unidades.length > 1 && (
              <Dialog open={transferenciaOpen} onOpenChange={setTransferenciaOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline"><ArrowRightLeft className="h-4 w-4 mr-2" />Transferir Caixa</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5 text-primary" />Transferência entre Caixas</DialogTitle></DialogHeader>
                  <p className="text-sm text-muted-foreground">Transfere dinheiro físico do caixa de <strong>{unidadeAtual?.nome || "esta loja"}</strong> para outra unidade.</p>
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label>Unidade Destino *</Label>
                      <Select value={transferenciaForm.unidadeDestinoId} onValueChange={v => setTransferenciaForm({ ...transferenciaForm, unidadeDestinoId: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecione a loja" /></SelectTrigger>
                        <SelectContent>
                          {unidades.filter(u => u.id !== unidadeAtual?.id).map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Valor *</Label><Input type="number" step="0.01" value={transferenciaForm.valor} onChange={e => setTransferenciaForm({ ...transferenciaForm, valor: e.target.value })} placeholder="0.00" /></div>
                    <div><Label>Descrição</Label><Input value={transferenciaForm.descricao} onChange={e => setTransferenciaForm({ ...transferenciaForm, descricao: e.target.value })} placeholder="Ex: Troco para filial centro" /></div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setTransferenciaOpen(false)}>Cancelar</Button>
                      <Button onClick={handleTransferencia}><ArrowRightLeft className="h-4 w-4 mr-2" />Transferir</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Nova Movimentação Manual */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Nova Movimentação</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova Movimentação de Caixa</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Descrição *</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Venda balcão cliente X" /></div>
                  <div><Label>Valor *</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="0.00" /></div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit}>Salvar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">Caixa da Loja</strong> controla apenas <strong>dinheiro físico</strong>.
            <strong> PIX</strong> vai direto para a conta bancária configurada.
            <strong> Cartões</strong> ficam em Contas a Receber até serem liquidados.
            Use <strong>"Depositar no Banco"</strong> para mover dinheiro do caixa para uma conta bancária.
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-2 border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">💰 Total em Caixa</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-2xl font-bold ${saldoTotal >= 0 ? "text-success" : "text-destructive"}`}>
                R$ {saldoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Saldo acumulado total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Entradas Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-success">
                R$ {entradaHoje.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Saídas Hoje</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-destructive">
                R$ {saidaHoje.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Saldo do Dia</CardTitle>
              <Banknote className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-primary">
                R$ {(entradaHoje - saidaHoje).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        {periodo !== "hoje" && (
          <Card>
            <CardHeader><CardTitle>Movimentações — {periodo === "7dias" ? "Últimos 7 dias" : "Últimos 30 dias"}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                  <Area type="monotone" dataKey="entradas" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} name="Entradas" />
                  <Area type="monotone" dataKey="saidas" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} name="Saídas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Lista de movimentações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Movimentações do Caixa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-6 text-muted-foreground">Carregando...</p>
            ) : movs.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">Nenhuma movimentação encontrada no período</p>
            ) : (
              <div className="space-y-3">
                {movs.slice(0, 30).map(mov => (
                  <div key={mov.id} className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-full shrink-0 ${mov.tipo === "entrada" ? "bg-success/10" : "bg-destructive/10"}`}>
                        {mov.tipo === "entrada" ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{mov.descricao}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(mov.created_at), "dd/MM/yyyy HH:mm")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <Badge variant="outline" className="hidden sm:inline-flex text-xs">{mov.categoria || "—"}</Badge>
                      <span className={`font-bold text-sm whitespace-nowrap ${mov.tipo === "entrada" ? "text-success" : "text-destructive"}`}>
                        {mov.tipo === "entrada" ? "+" : "-"} R$ {Number(mov.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
