import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Plus, AlertTriangle, CheckCircle2, Clock, XCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, isBefore, addDays } from "date-fns";

export default function ControleCheques() {
  const { unidadeAtual } = useUnidade();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [form, setForm] = useState({
    numero_cheque: "", banco_emitente: "", agencia: "", conta: "",
    valor: "", data_emissao: new Date().toISOString().split("T")[0],
    data_vencimento: "", observacoes: "",
  });

  const { data: cheques = [], isLoading } = useQuery({
    queryKey: ["cheques", unidadeAtual?.id, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("cheques")
        .select("*, clientes(nome), unidades(nome)")
        .order("data_vencimento", { ascending: true });
      if (unidadeAtual?.id) query = query.or(`unidade_id.eq.${unidadeAtual.id},unidade_id.is.null`);
      if (statusFilter !== "todos") query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const cadastrarCheque = async () => {
    const valor = parseFloat(form.valor.replace(",", "."));
    if (!form.numero_cheque || !form.banco_emitente || !valor || !form.data_vencimento) {
      toast.error("Preencha os campos obrigatórios"); return;
    }
    const { error } = await supabase.from("cheques").insert({
      numero_cheque: form.numero_cheque, banco_emitente: form.banco_emitente,
      agencia: form.agencia || null, conta: form.conta || null, valor,
      data_emissao: form.data_emissao, data_vencimento: form.data_vencimento,
      observacoes: form.observacoes || null,
      unidade_id: unidadeAtual?.id || null, user_id: user?.id,
    });
    if (error) { toast.error("Erro ao cadastrar"); console.error(error); return; }
    toast.success("Cheque cadastrado!");
    setDialogOpen(false);
    setForm({ numero_cheque: "", banco_emitente: "", agencia: "", conta: "", valor: "", data_emissao: new Date().toISOString().split("T")[0], data_vencimento: "", observacoes: "" });
    queryClient.invalidateQueries({ queryKey: ["cheques"] });
  };

  const atualizarStatus = async (id: string, novoStatus: string) => {
    const updates: any = { status: novoStatus };
    if (novoStatus === "compensado") updates.data_compensacao = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("cheques").update(updates).eq("id", id);
    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success(`Cheque marcado como ${novoStatus}`);
    queryClient.invalidateQueries({ queryKey: ["cheques"] });
  };

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
    em_maos: { label: "Em Mãos", variant: "outline", icon: Clock },
    depositado: { label: "Depositado", variant: "secondary", icon: FileText },
    compensado: { label: "Compensado", variant: "default", icon: CheckCircle2 },
    devolvido: { label: "Devolvido", variant: "destructive", icon: XCircle },
    reapresentado: { label: "Reapresentado", variant: "secondary", icon: RotateCcw },
  };

  const totalEmMaos = cheques.filter((c: any) => c.status === "em_maos").reduce((a: number, c: any) => a + Number(c.valor), 0);
  const totalVencendo = cheques.filter((c: any) => c.status === "em_maos" && isBefore(new Date(c.data_vencimento), addDays(new Date(), 7))).length;
  const totalDevolvidos = cheques.filter((c: any) => c.status === "devolvido").reduce((a: number, c: any) => a + Number(c.valor), 0);

  return (
    <MainLayout>
      <Header title="Controle de Cheques" subtitle="Gestão e acompanhamento de cheques recebidos" />
      <div className="p-4 md:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" />Em Mãos</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {totalEmMaos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground">{cheques.filter((c: any) => c.status === "em_maos").length} cheques</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" />Vencendo em 7 dias</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-warning">{totalVencendo}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive" />Devolvidos</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-destructive">R$ {totalDevolvidos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap items-center">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Cadastrar Cheque</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Cheque</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Nº Cheque *</Label><Input value={form.numero_cheque} onChange={e => setForm({ ...form, numero_cheque: e.target.value })} /></div>
                  <div><Label>Banco *</Label><Input value={form.banco_emitente} onChange={e => setForm({ ...form, banco_emitente: e.target.value })} placeholder="Itaú, BB..." /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Agência</Label><Input value={form.agencia} onChange={e => setForm({ ...form, agencia: e.target.value })} /></div>
                  <div><Label>Conta</Label><Input value={form.conta} onChange={e => setForm({ ...form, conta: e.target.value })} /></div>
                </div>
                <div><Label>Valor *</Label><Input value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="0,00" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Data Emissão</Label><Input type="date" value={form.data_emissao} onChange={e => setForm({ ...form, data_emissao: e.target.value })} /></div>
                  <div><Label>Data Vencimento *</Label><Input type="date" value={form.data_vencimento} onChange={e => setForm({ ...form, data_vencimento: e.target.value })} /></div>
                </div>
                <div><Label>Observações</Label><Input value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={cadastrarCheque}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="em_maos">Em Mãos</SelectItem>
              <SelectItem value="depositado">Depositados</SelectItem>
              <SelectItem value="compensado">Compensados</SelectItem>
              <SelectItem value="devolvido">Devolvidos</SelectItem>
              <SelectItem value="reapresentado">Reapresentados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <p className="text-center py-6 text-muted-foreground">Carregando...</p> : cheques.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">Nenhum cheque encontrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Cheque</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cheques.map((c: any) => {
                    const cfg = statusConfig[c.status] || statusConfig.em_maos;
                    const vencido = c.status === "em_maos" && isBefore(new Date(c.data_vencimento), new Date());
                    return (
                      <TableRow key={c.id} className={vencido ? "bg-destructive/5" : ""}>
                        <TableCell className="font-mono font-medium">{c.numero_cheque}</TableCell>
                        <TableCell>{c.banco_emitente}</TableCell>
                        <TableCell className="font-bold">R$ {Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-sm">{format(new Date(c.data_emissao), "dd/MM/yyyy")}</TableCell>
                        <TableCell className={`text-sm ${vencido ? "text-destructive font-medium" : ""}`}>
                          {format(new Date(c.data_vencimento), "dd/MM/yyyy")}
                          {vencido && <span className="ml-1 text-xs">(vencido)</span>}
                        </TableCell>
                        <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {c.status === "em_maos" && (
                              <Button size="sm" variant="outline" onClick={() => atualizarStatus(c.id, "depositado")}>Depositar</Button>
                            )}
                            {c.status === "depositado" && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => atualizarStatus(c.id, "compensado")}>Compensar</Button>
                                <Button size="sm" variant="destructive" onClick={() => atualizarStatus(c.id, "devolvido")}>Devolvido</Button>
                              </>
                            )}
                            {c.status === "devolvido" && (
                              <Button size="sm" variant="outline" onClick={() => atualizarStatus(c.id, "reapresentado")}>Reapresentar</Button>
                            )}
                          </div>
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
