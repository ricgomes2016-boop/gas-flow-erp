import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreditCard, Search, Plus, AlertCircle, CheckCircle2, Clock, MoreHorizontal, Pencil, Trash2, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format } from "date-fns";

interface ContaPagar {
  id: string;
  fornecedor: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  categoria: string | null;
  observacoes: string | null;
  created_at: string;
}

const FORMAS_PAGAMENTO = ["Boleto", "PIX", "Transferência", "Dinheiro", "Cartão", "Cheque"];
const CATEGORIAS = ["Fornecedores", "Frota", "Infraestrutura", "Utilidades", "RH", "Compras", "Outros"];

export default function ContasPagar() {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagarDialogOpen, setPagarDialogOpen] = useState(false);
  const [pagarConta, setPagarConta] = useState<ContaPagar | null>(null);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const { unidadeAtual } = useUnidade();

  const [form, setForm] = useState({
    fornecedor: "", descricao: "", valor: "", vencimento: "", categoria: "", observacoes: "",
  });

  const [pagarForm, setPagarForm] = useState({
    formasPagamento: [{ forma: "", valor: "" }] as { forma: string; valor: string }[],
  });

  const resetForm = () => setForm({ fornecedor: "", descricao: "", valor: "", vencimento: "", categoria: "", observacoes: "" });

  const fetchContas = async () => {
    setLoading(true);
    let query = supabase.from("contas_pagar").select("*").order("vencimento", { ascending: true });
    if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
    const { data, error } = await query;
    if (error) { toast.error("Erro ao carregar contas"); console.error(error); }
    else setContas((data as ContaPagar[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchContas(); }, [unidadeAtual]);

  const handleSubmit = async () => {
    if (!form.fornecedor || !form.descricao || !form.valor || !form.vencimento) {
      toast.error("Preencha os campos obrigatórios"); return;
    }
    const payload = {
      fornecedor: form.fornecedor, descricao: form.descricao,
      valor: parseFloat(form.valor), vencimento: form.vencimento,
      categoria: form.categoria || null,
      observacoes: form.observacoes || null,
      unidade_id: unidadeAtual?.id || null,
    };

    if (editId) {
      const { error } = await supabase.from("contas_pagar").update(payload).eq("id", editId);
      if (error) { toast.error("Erro ao atualizar"); console.error(error); }
      else { toast.success("Conta atualizada!"); setDialogOpen(false); setEditId(null); resetForm(); fetchContas(); }
    } else {
      const { error } = await supabase.from("contas_pagar").insert(payload);
      if (error) { toast.error("Erro ao criar conta"); console.error(error); }
      else { toast.success("Conta criada!"); setDialogOpen(false); resetForm(); fetchContas(); }
    }
  };

  const handleEdit = (conta: ContaPagar) => {
    setEditId(conta.id);
    setForm({
      fornecedor: conta.fornecedor, descricao: conta.descricao,
      valor: String(conta.valor), vencimento: conta.vencimento,
      categoria: conta.categoria || "",
      observacoes: conta.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("contas_pagar").delete().eq("id", deleteId);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Conta excluída!"); fetchContas(); }
    setDeleteId(null);
  };

  const openPagarDialog = (conta: ContaPagar) => {
    setPagarConta(conta);
    setPagarForm({
      formasPagamento: [{ forma: "", valor: String(conta.valor) }],
    });
    setPagarDialogOpen(true);
  };

  const handlePagar = async () => {
    if (!pagarConta) return;
    const totalPago = pagarForm.formasPagamento.reduce((sum, f) => sum + (parseFloat(f.valor) || 0), 0);
    const valorConta = Number(pagarConta.valor);

    if (totalPago <= 0) { toast.error("Informe o valor pago"); return; }
    if (totalPago > valorConta + 0.01) { toast.error("Valor pago excede o valor da conta"); return; }

    const isParcial = totalPago < valorConta - 0.01;
    const formasStr = pagarForm.formasPagamento
      .filter(f => f.forma && parseFloat(f.valor) > 0)
      .map(f => `${f.forma}: R$ ${parseFloat(f.valor).toFixed(2)}`)
      .join(", ");

    if (isParcial) {
      const restante = valorConta - totalPago;
      const obs = `${pagarConta.observacoes || ""}\nPago parcial R$ ${totalPago.toFixed(2)} em ${format(new Date(), "dd/MM/yyyy")} (${formasStr})`.trim();
      const { error } = await supabase.from("contas_pagar").update({
        valor: restante, observacoes: obs,
      }).eq("id", pagarConta.id);
      if (error) { toast.error("Erro ao processar pagamento parcial"); return; }
      toast.success(`Pago R$ ${totalPago.toFixed(2)} — Restante: R$ ${restante.toFixed(2)}`);
    } else {
      const { error } = await supabase.from("contas_pagar").update({
        status: "paga",
        observacoes: formasStr ? `${pagarConta.observacoes || ""}\nPago via ${formasStr}`.trim() : pagarConta.observacoes,
      }).eq("id", pagarConta.id);
      if (error) { toast.error("Erro ao confirmar pagamento"); return; }
      toast.success("Conta paga integralmente!");
    }
    setPagarDialogOpen(false);
    fetchContas();
  };

  const addFormaPagamento = () => {
    setPagarForm(prev => ({
      ...prev,
      formasPagamento: [...prev.formasPagamento, { forma: "", valor: "" }],
    }));
  };

  const removeFormaPagamento = (idx: number) => {
    setPagarForm(prev => ({
      ...prev,
      formasPagamento: prev.formasPagamento.filter((_, i) => i !== idx),
    }));
  };

  const updateFormaPagamento = (idx: number, field: "forma" | "valor", value: string) => {
    setPagarForm(prev => ({
      ...prev,
      formasPagamento: prev.formasPagamento.map((f, i) => i === idx ? { ...f, [field]: value } : f),
    }));
  };

  const hoje = new Date().toISOString().split("T")[0];

  const filtered = contas.filter(c => {
    const matchSearch = c.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      c.descricao.toLowerCase().includes(search.toLowerCase());
    const matchDataIni = !dataInicial || c.vencimento >= dataInicial;
    const matchDataFim = !dataFinal || c.vencimento <= dataFinal;
    const vencida = c.status === "pendente" && c.vencimento < hoje;
    const statusAtual = c.status === "paga" ? "paga" : vencida ? "vencida" : "pendente";
    const matchStatus = filtroStatus === "todos" || statusAtual === filtroStatus;
    return matchSearch && matchDataIni && matchDataFim && matchStatus;
  });

  const totalPendente = filtered.filter(c => c.status === "pendente" && c.vencimento >= hoje).reduce((a, c) => a + Number(c.valor), 0);
  const totalVencido = filtered.filter(c => c.status === "pendente" && c.vencimento < hoje).reduce((a, c) => a + Number(c.valor), 0);
  const totalPago = filtered.filter(c => c.status === "paga").reduce((a, c) => a + Number(c.valor), 0);

  return (
    <MainLayout>
      <Header title="Contas a Pagar" subtitle="Gerencie todas as contas" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas a Pagar</h1>
            <p className="text-muted-foreground">Gerencie todas as contas e despesas</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditId(null); resetForm(); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Nova Conta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? "Editar Conta" : "Nova Conta a Pagar"}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Fornecedor *</Label><Input value={form.fornecedor} onChange={e => setForm({ ...form, fornecedor: e.target.value })} /></div>
                <div><Label>Descrição *</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Valor *</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                  <div><Label>Vencimento *</Label><Input type="date" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={2} /></div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); setEditId(null); resetForm(); }}>Cancelar</Button>
                  <Button onClick={handleSubmit}>{editId ? "Atualizar" : "Salvar"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total a Pagar</CardTitle><CreditCard className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">R$ {(totalPendente + totalVencido).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground">Em aberto</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Vencidas</CardTitle><AlertCircle className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">R$ {totalVencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground">Atenção urgente</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pendentes</CardTitle><Clock className="h-4 w-4 text-warning" /></CardHeader><CardContent><div className="text-2xl font-bold text-warning">R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground">A vencer</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pagas</CardTitle><CheckCircle2 className="h-4 w-4 text-success" /></CardHeader><CardContent><div className="text-2xl font-bold text-success">R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground">Quitadas</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Contas</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar conta..." className="pl-10 w-[250px]" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Data Inicial</Label>
                  <Input type="date" className="w-[160px]" value={dataInicial} onChange={e => setDataInicial(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Data Final</Label>
                  <Input type="date" className="w-[160px]" value={dataFinal} onChange={e => setDataFinal(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pendente">Pendentes</SelectItem>
                      <SelectItem value="vencida">Vencidas</SelectItem>
                      <SelectItem value="paga">Pagas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(dataInicial || dataFinal || filtroStatus !== "todos") && (
                  <Button variant="ghost" size="sm" onClick={() => { setDataInicial(""); setDataFinal(""); setFiltroStatus("todos"); }}>Limpar filtros</Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : filtered.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhuma conta encontrada</p> : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Fornecedor</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Vencimento</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(conta => {
                    const vencida = conta.status === "pendente" && conta.vencimento < hoje;
                    const displayStatus = vencida ? "Vencida" : conta.status === "paga" ? "Paga" : "Pendente";
                    return (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                        <TableCell>{conta.descricao}</TableCell>
                        <TableCell><Badge variant="outline">{conta.categoria || "—"}</Badge></TableCell>
                        <TableCell>{format(new Date(conta.vencimento + "T12:00:00"), "dd/MM/yyyy")}</TableCell>
                        <TableCell className="font-medium">R$ {Number(conta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell><Badge variant={displayStatus === "Paga" ? "default" : displayStatus === "Vencida" ? "destructive" : "secondary"}>{displayStatus}</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {conta.status !== "paga" && (
                                <DropdownMenuItem onClick={() => openPagarDialog(conta)}>
                                  <DollarSign className="h-4 w-4 mr-2" />Pagar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleEdit(conta)}>
                                <Pencil className="h-4 w-4 mr-2" />Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(conta.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Pagar com múltiplas formas */}
      <Dialog open={pagarDialogOpen} onOpenChange={setPagarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Pagar Conta</DialogTitle></DialogHeader>
          {pagarConta && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm font-medium">{pagarConta.fornecedor}</p>
                <p className="text-xs text-muted-foreground">{pagarConta.descricao}</p>
                <p className="text-lg font-bold">R$ {Number(pagarConta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Formas de Pagamento</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFormaPagamento}>+ Forma</Button>
                </div>
                {pagarForm.formasPagamento.map((fp, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={fp.forma} onValueChange={v => updateFormaPagamento(idx, "forma", v)}>
                        <SelectTrigger><SelectValue placeholder="Forma" /></SelectTrigger>
                        <SelectContent>
                          {FORMAS_PAGAMENTO.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-[120px]">
                      <Input type="number" step="0.01" placeholder="Valor" value={fp.valor}
                        onChange={e => updateFormaPagamento(idx, "valor", e.target.value)} />
                    </div>
                    {pagarForm.formasPagamento.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeFormaPagamento(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="text-sm text-muted-foreground">
                  Total informado: <span className="font-medium text-foreground">
                    R$ {pagarForm.formasPagamento.reduce((s, f) => s + (parseFloat(f.valor) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  {pagarForm.formasPagamento.reduce((s, f) => s + (parseFloat(f.valor) || 0), 0) < Number(pagarConta.valor) - 0.01 && (
                    <span className="ml-2 text-warning">(Pagamento parcial)</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPagarDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handlePagar}>Confirmar Pagamento</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
