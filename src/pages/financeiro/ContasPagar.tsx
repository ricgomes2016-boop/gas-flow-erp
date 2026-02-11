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
import { CreditCard, Search, Plus, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";
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
  created_at: string;
}

export default function ContasPagar() {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { unidadeAtual } = useUnidade();
  const [form, setForm] = useState({
    fornecedor: "", descricao: "", valor: "", vencimento: "", categoria: "",
  });

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
    const { error } = await supabase.from("contas_pagar").insert({
      fornecedor: form.fornecedor,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      vencimento: form.vencimento,
      categoria: form.categoria || null,
      unidade_id: unidadeAtual?.id || null,
    });
    if (error) { toast.error("Erro ao criar conta"); console.error(error); }
    else { toast.success("Conta criada!"); setDialogOpen(false); setForm({ fornecedor: "", descricao: "", valor: "", vencimento: "", categoria: "" }); fetchContas(); }
  };

  const handlePagar = async (id: string) => {
    const { error } = await supabase.from("contas_pagar").update({ status: "paga" }).eq("id", id);
    if (error) toast.error("Erro ao atualizar");
    else { toast.success("Conta marcada como paga!"); fetchContas(); }
  };

  const hoje = new Date().toISOString().split("T")[0];
  const filtered = contas.filter(c =>
    c.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
    c.descricao.toLowerCase().includes(search.toLowerCase())
  );
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Nova Conta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Conta a Pagar</DialogTitle></DialogHeader>
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
                      <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                      <SelectItem value="Frota">Frota</SelectItem>
                      <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="Utilidades">Utilidades</SelectItem>
                      <SelectItem value="RH">RH</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSubmit}>Salvar</Button>
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
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Contas</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar conta..." className="pl-10 w-[300px]" value={search} onChange={e => setSearch(e.target.value)} />
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
                          {conta.status !== "paga" && <Button size="sm" onClick={() => handlePagar(conta.id)}>Pagar</Button>}
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
    </MainLayout>
  );
}
