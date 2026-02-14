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
import { Wallet, Search, Plus, AlertCircle, CheckCircle2, Clock, MoreHorizontal, Pencil, Trash2, DollarSign, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ContaReceber {
  id: string;
  cliente: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  forma_pagamento: string | null;
  observacoes: string | null;
  created_at: string;
}

const FORMAS_PAGAMENTO = ["Boleto", "PIX", "Transferência", "Dinheiro", "Cartão", "Cheque"];

export default function ContasReceber() {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [receberDialogOpen, setReceberDialogOpen] = useState(false);
  const [receberConta, setReceberConta] = useState<ContaReceber | null>(null);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const { unidadeAtual } = useUnidade();

  const [form, setForm] = useState({
    cliente: "", descricao: "", valor: "", vencimento: "", forma_pagamento: "", observacoes: "",
  });

  const [receberForm, setReceberForm] = useState({
    valorRecebido: "",
    formasPagamento: [{ forma: "", valor: "" }] as { forma: string; valor: string }[],
    parcial: false,
  });

  const resetForm = () => setForm({ cliente: "", descricao: "", valor: "", vencimento: "", forma_pagamento: "", observacoes: "" });

  const fetchContas = async () => {
    setLoading(true);
    let query = supabase.from("contas_receber").select("*").order("vencimento", { ascending: true });
    if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
    const { data, error } = await query;
    if (error) { toast.error("Erro ao carregar recebíveis"); console.error(error); }
    else setContas((data as ContaReceber[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchContas(); }, [unidadeAtual]);

  const handleSubmit = async () => {
    if (!form.cliente || !form.descricao || !form.valor || !form.vencimento) {
      toast.error("Preencha os campos obrigatórios"); return;
    }
    const payload = {
      cliente: form.cliente, descricao: form.descricao,
      valor: parseFloat(form.valor), vencimento: form.vencimento,
      forma_pagamento: form.forma_pagamento || null,
      observacoes: form.observacoes || null,
      unidade_id: unidadeAtual?.id || null,
    };

    if (editId) {
      const { error } = await supabase.from("contas_receber").update(payload).eq("id", editId);
      if (error) { toast.error("Erro ao atualizar"); console.error(error); }
      else { toast.success("Recebível atualizado!"); setDialogOpen(false); setEditId(null); resetForm(); fetchContas(); }
    } else {
      const { error } = await supabase.from("contas_receber").insert(payload);
      if (error) { toast.error("Erro ao criar recebível"); console.error(error); }
      else { toast.success("Recebível criado!"); setDialogOpen(false); resetForm(); fetchContas(); }
    }
  };

  const handleEdit = (conta: ContaReceber) => {
    setEditId(conta.id);
    setForm({
      cliente: conta.cliente, descricao: conta.descricao,
      valor: String(conta.valor), vencimento: conta.vencimento,
      forma_pagamento: conta.forma_pagamento || "",
      observacoes: conta.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("contas_receber").delete().eq("id", deleteId);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Recebível excluído!"); fetchContas(); }
    setDeleteId(null);
  };

  const openReceberDialog = (conta: ContaReceber) => {
    setReceberConta(conta);
    setReceberForm({
      valorRecebido: String(conta.valor),
      formasPagamento: [{ forma: conta.forma_pagamento || "", valor: String(conta.valor) }],
      parcial: false,
    });
    setReceberDialogOpen(true);
  };

  const handleReceber = async () => {
    if (!receberConta) return;
    const totalRecebido = receberForm.formasPagamento.reduce((sum, f) => sum + (parseFloat(f.valor) || 0), 0);
    const valorConta = Number(receberConta.valor);

    if (totalRecebido <= 0) { toast.error("Informe o valor recebido"); return; }
    if (totalRecebido > valorConta + 0.01) { toast.error("Valor recebido excede o valor da conta"); return; }

    const isParcial = totalRecebido < valorConta - 0.01;
    const formasStr = receberForm.formasPagamento
      .filter(f => f.forma && parseFloat(f.valor) > 0)
      .map(f => `${f.forma}: R$ ${parseFloat(f.valor).toFixed(2)}`)
      .join(", ");

    if (isParcial) {
      // Update current with remaining
      const restante = valorConta - totalRecebido;
      const obs = `${receberConta.observacoes || ""}\nRecebido parcial R$ ${totalRecebido.toFixed(2)} em ${format(new Date(), "dd/MM/yyyy")} (${formasStr})`.trim();
      const { error } = await supabase.from("contas_receber").update({
        valor: restante, observacoes: obs,
      }).eq("id", receberConta.id);
      if (error) { toast.error("Erro ao processar recebimento parcial"); return; }
      toast.success(`Recebido R$ ${totalRecebido.toFixed(2)} — Restante: R$ ${restante.toFixed(2)}`);
    } else {
      const { error } = await supabase.from("contas_receber").update({
        status: "recebida",
        forma_pagamento: formasStr || receberConta.forma_pagamento,
      }).eq("id", receberConta.id);
      if (error) { toast.error("Erro ao confirmar recebimento"); return; }
      toast.success("Conta recebida integralmente!");
    }
    setReceberDialogOpen(false);
    fetchContas();
  };

  const addFormaPagamento = () => {
    setReceberForm(prev => ({
      ...prev,
      formasPagamento: [...prev.formasPagamento, { forma: "", valor: "" }],
    }));
  };

  const removeFormaPagamento = (idx: number) => {
    setReceberForm(prev => ({
      ...prev,
      formasPagamento: prev.formasPagamento.filter((_, i) => i !== idx),
    }));
  };

  const updateFormaPagamento = (idx: number, field: "forma" | "valor", value: string) => {
    setReceberForm(prev => ({
      ...prev,
      formasPagamento: prev.formasPagamento.map((f, i) => i === idx ? { ...f, [field]: value } : f),
    }));
  };

  const hoje = new Date().toISOString().split("T")[0];

  const filtered = contas.filter(c => {
    const matchSearch = c.cliente.toLowerCase().includes(search.toLowerCase()) ||
      c.descricao.toLowerCase().includes(search.toLowerCase());
    const matchDataIni = !dataInicial || c.vencimento >= dataInicial;
    const matchDataFim = !dataFinal || c.vencimento <= dataFinal;
    const vencida = c.status === "pendente" && c.vencimento < hoje;
    const statusAtual = c.status === "recebida" ? "recebida" : vencida ? "vencida" : "pendente";
    const matchStatus = filtroStatus === "todos" || statusAtual === filtroStatus;
    return matchSearch && matchDataIni && matchDataFim && matchStatus;
  });

  const totalPendente = filtered.filter(c => c.status === "pendente" && c.vencimento >= hoje).reduce((a, c) => a + Number(c.valor), 0);
  const totalVencido = filtered.filter(c => c.status === "pendente" && c.vencimento < hoje).reduce((a, c) => a + Number(c.valor), 0);
  const totalRecebido = filtered.filter(c => c.status === "recebida").reduce((a, c) => a + Number(c.valor), 0);

  const exportToExcel = () => {
    const data = filtered.map(c => ({
      Cliente: c.cliente,
      Descrição: c.descricao,
      "Forma Pgto": c.forma_pagamento || "—",
      Vencimento: format(new Date(c.vencimento + "T12:00:00"), "dd/MM/yyyy"),
      Valor: `R$ ${Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      Status: c.status === "recebida" ? "Recebida" : c.status === "pendente" && c.vencimento < hoje ? "Vencida" : "Pendente",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recebíveis");
    XLSX.writeFile(wb, `contas_receber_${format(new Date(), "ddMMyyyy_HHmm")}.xlsx`);
    toast.success("Arquivo Excel exportado!");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Contas a Receber", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 22);

    const tableData = filtered.map(c => [
      c.cliente,
      c.descricao,
      c.forma_pagamento || "—",
      format(new Date(c.vencimento + "T12:00:00"), "dd/MM/yyyy"),
      `R$ ${Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      c.status === "recebida" ? "Recebida" : c.status === "pendente" && c.vencimento < hoje ? "Vencida" : "Pendente",
    ]);

    autoTable(doc, {
      head: [["Cliente", "Descrição", "Forma Pgto", "Vencimento", "Valor", "Status"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`contas_receber_${format(new Date(), "ddMMyyyy_HHmm")}.pdf`);
    toast.success("PDF exportado!");
  };

  return (
    <MainLayout>
      <Header title="Contas a Receber" subtitle="Acompanhe os recebíveis" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas a Receber</h1>
            <p className="text-muted-foreground">Acompanhe todos os recebíveis</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditId(null); resetForm(); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Novo Recebível</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? "Editar Recebível" : "Novo Recebível"}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Cliente *</Label><Input value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} /></div>
                <div><Label>Descrição *</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Valor *</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                  <div><Label>Vencimento *</Label><Input type="date" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select value={form.forma_pagamento} onValueChange={v => setForm({ ...form, forma_pagamento: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
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
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total a Receber</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">R$ {(totalPendente + totalVencido).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground">Em aberto</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Vencidas</CardTitle><AlertCircle className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">R$ {totalVencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground">Cobrar urgente</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pendentes</CardTitle><Clock className="h-4 w-4 text-warning" /></CardHeader><CardContent><div className="text-2xl font-bold text-warning">R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground">A vencer</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Recebidas</CardTitle><CheckCircle2 className="h-4 w-4 text-success" /></CardHeader><CardContent><div className="text-2xl font-bold text-success">R$ {totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground">Confirmadas</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Recebíveis</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar recebível..." className="pl-10 w-[250px]" value={search} onChange={e => setSearch(e.target.value)} />
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
                      <SelectItem value="recebida">Recebidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(dataInicial || dataFinal || filtroStatus !== "todos") && (
                   <Button variant="ghost" size="sm" onClick={() => { setDataInicial(""); setDataFinal(""); setFiltroStatus("todos"); }}>Limpar filtros</Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-2">
                    <Download className="h-4 w-4" />Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-2">
                    <Download className="h-4 w-4" />PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : filtered.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhum recebível encontrado</p> : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Cliente</TableHead><TableHead>Descrição</TableHead><TableHead>Forma Pgto</TableHead><TableHead>Vencimento</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(conta => {
                    const vencida = conta.status === "pendente" && conta.vencimento < hoje;
                    const displayStatus = vencida ? "Vencida" : conta.status === "recebida" ? "Recebida" : "Pendente";
                    return (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.cliente}</TableCell>
                        <TableCell>{conta.descricao}</TableCell>
                        <TableCell><Badge variant="outline">{conta.forma_pagamento || "—"}</Badge></TableCell>
                        <TableCell>{format(new Date(conta.vencimento + "T12:00:00"), "dd/MM/yyyy")}</TableCell>
                        <TableCell className="font-medium">R$ {Number(conta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell><Badge variant={displayStatus === "Recebida" ? "default" : displayStatus === "Vencida" ? "destructive" : "secondary"}>{displayStatus}</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {conta.status !== "recebida" && (
                                <DropdownMenuItem onClick={() => openReceberDialog(conta)}>
                                  <DollarSign className="h-4 w-4 mr-2" />Receber
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

      {/* Dialog Receber com múltiplas formas */}
      <Dialog open={receberDialogOpen} onOpenChange={setReceberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Receber Conta</DialogTitle></DialogHeader>
          {receberConta && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm font-medium">{receberConta.cliente}</p>
                <p className="text-xs text-muted-foreground">{receberConta.descricao}</p>
                <p className="text-lg font-bold">R$ {Number(receberConta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Formas de Pagamento</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFormaPagamento}>+ Forma</Button>
                </div>
                {receberForm.formasPagamento.map((fp, idx) => (
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
                    {receberForm.formasPagamento.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeFormaPagamento(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="text-sm text-muted-foreground">
                  Total informado: <span className="font-medium text-foreground">
                    R$ {receberForm.formasPagamento.reduce((s, f) => s + (parseFloat(f.valor) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  {receberForm.formasPagamento.reduce((s, f) => s + (parseFloat(f.valor) || 0), 0) < Number(receberConta.valor) - 0.01 && (
                    <span className="ml-2 text-warning">(Recebimento parcial)</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setReceberDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleReceber}>Confirmar Recebimento</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir recebível?</AlertDialogTitle>
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
