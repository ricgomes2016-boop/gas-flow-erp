import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, ArrowRightLeft, Landmark, Wallet, Send, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import Conciliacao from "./Conciliacao";

interface ContaBancaria {
  id: string;
  nome: string;
  banco: string;
  agencia: string | null;
  conta: string | null;
  tipo: string;
  saldo_atual: number;
  chave_pix: string | null;
  ativo: boolean;
  unidade_id: string | null;
  unidades?: { nome: string } | null;
}

interface Transferencia {
  id: string;
  valor: number;
  descricao: string | null;
  data_transferencia: string;
  status: string;
  conta_origem: ContaBancaria;
  conta_destino: ContaBancaria;
  created_at: string;
}

export default function ContasBancarias() {
  const { unidadeAtual, unidades } = useUnidade();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", banco: "", agencia: "", conta: "", tipo: "corrente", chave_pix: "", unidade_id: "" });
  const [transferForm, setTransferForm] = useState({ conta_origem_id: "", conta_destino_id: "", valor: "", descricao: "" });

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ["contas-bancarias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_bancarias")
        .select("*, unidades(nome)")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return (data || []) as ContaBancaria[];
    },
  });

  const { data: transferencias = [] } = useQuery({
    queryKey: ["transferencias-bancarias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transferencias_bancarias")
        .select("*, conta_origem:contas_bancarias!transferencias_bancarias_conta_origem_id_fkey(id,nome,banco,unidades(nome)), conta_destino:contas_bancarias!transferencias_bancarias_conta_destino_id_fkey(id,nome,banco,unidades(nome))")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const criarConta = async () => {
    if (!form.nome || !form.banco) { toast.error("Nome e banco são obrigatórios"); return; }
    const { error } = await supabase.from("contas_bancarias").insert({
      nome: form.nome, banco: form.banco, agencia: form.agencia || null,
      conta: form.conta || null, tipo: form.tipo, chave_pix: form.chave_pix || null,
      unidade_id: form.unidade_id || unidadeAtual?.id || null,
    });
    if (error) { toast.error("Erro ao criar conta"); console.error(error); return; }
    toast.success("Conta bancária criada!");
    setDialogOpen(false);
    setForm({ nome: "", banco: "", agencia: "", conta: "", tipo: "corrente", chave_pix: "", unidade_id: "" });
    queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
  };

  const realizarTransferencia = async () => {
    const valor = parseFloat(transferForm.valor.replace(",", "."));
    if (!transferForm.conta_origem_id || !transferForm.conta_destino_id || !valor || valor <= 0) {
      toast.error("Preencha todos os campos"); return;
    }
    if (transferForm.conta_origem_id === transferForm.conta_destino_id) {
      toast.error("Conta origem e destino devem ser diferentes"); return;
    }

    const { error: transError } = await supabase.from("transferencias_bancarias").insert({
      conta_origem_id: transferForm.conta_origem_id,
      conta_destino_id: transferForm.conta_destino_id,
      valor, descricao: transferForm.descricao || null,
      user_id: user?.id,
    });
    if (transError) { toast.error("Erro na transferência"); console.error(transError); return; }

    // Atualizar saldos
    const contaOrigem = contas.find(c => c.id === transferForm.conta_origem_id);
    const contaDestino = contas.find(c => c.id === transferForm.conta_destino_id);
    if (contaOrigem) {
      await supabase.from("contas_bancarias").update({ saldo_atual: contaOrigem.saldo_atual - valor }).eq("id", contaOrigem.id);
    }
    if (contaDestino) {
      await supabase.from("contas_bancarias").update({ saldo_atual: contaDestino.saldo_atual + valor }).eq("id", contaDestino.id);
    }

    toast.success("Transferência realizada!");
    setTransferOpen(false);
    setTransferForm({ conta_origem_id: "", conta_destino_id: "", valor: "", descricao: "" });
    queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    queryClient.invalidateQueries({ queryKey: ["transferencias-bancarias"] });
  };

  const tipoLabel = (tipo: string) => {
    const map: Record<string, string> = { corrente: "Conta Corrente", poupanca: "Poupança", caixa_interno: "Caixa Interno" };
    return map[tipo] || tipo;
  };

  const saldoTotal = contas.reduce((acc, c) => acc + Number(c.saldo_atual), 0);

  return (
    <MainLayout>
      <Header title="Contas Bancárias" subtitle="Gestão de contas e transferências" />
      <div className="p-4 md:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Contas</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{contas.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Saldo Total</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-primary">R$ {saldoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Transferências (últimas)</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{transferencias.length}</p></CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Conta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Nova Conta Bancária</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Nome da Conta *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Conta Principal Itaú" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Banco *</Label><Input value={form.banco} onChange={e => setForm({ ...form, banco: e.target.value })} placeholder="Itaú, Bradesco..." /></div>
                  <div><Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrente">Conta Corrente</SelectItem>
                        <SelectItem value="poupanca">Poupança</SelectItem>
                        <SelectItem value="caixa_interno">Caixa Interno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Agência</Label><Input value={form.agencia} onChange={e => setForm({ ...form, agencia: e.target.value })} /></div>
                  <div><Label>Conta</Label><Input value={form.conta} onChange={e => setForm({ ...form, conta: e.target.value })} /></div>
                </div>
                <div><Label>Chave PIX</Label><Input value={form.chave_pix} onChange={e => setForm({ ...form, chave_pix: e.target.value })} /></div>
                <div><Label>Unidade / Filial</Label>
                  <Select value={form.unidade_id} onValueChange={v => setForm({ ...form, unidade_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                    <SelectContent>
                      {unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome} ({u.tipo})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={criarConta}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><ArrowRightLeft className="h-4 w-4 mr-2" />Transferência entre Contas</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5" />Nova Transferência</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Conta Origem *</Label>
                  <Select value={transferForm.conta_origem_id} onValueChange={v => setTransferForm({ ...transferForm, conta_origem_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {contas.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome} ({c.banco}) — {(c as any).unidades?.nome || "Sem unidade"} | R$ {Number(c.saldo_atual).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Conta Destino *</Label>
                  <Select value={transferForm.conta_destino_id} onValueChange={v => setTransferForm({ ...transferForm, conta_destino_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {contas.filter(c => c.id !== transferForm.conta_origem_id).map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome} ({c.banco}) — {(c as any).unidades?.nome || "Sem unidade"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Valor *</Label><Input value={transferForm.valor} onChange={e => setTransferForm({ ...transferForm, valor: e.target.value })} placeholder="0,00" /></div>
                <div><Label>Descrição</Label><Input value={transferForm.descricao} onChange={e => setTransferForm({ ...transferForm, descricao: e.target.value })} placeholder="Ex: Depósito do caixa" /></div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancelar</Button>
                  <Button onClick={realizarTransferencia}>Transferir</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="contas">
          <TabsList>
            <TabsTrigger value="contas"><Landmark className="h-4 w-4 mr-1" />Contas</TabsTrigger>
            <TabsTrigger value="transferencias"><ArrowRightLeft className="h-4 w-4 mr-1" />Transferências</TabsTrigger>
            <TabsTrigger value="conciliacao"><FileSpreadsheet className="h-4 w-4 mr-1" />Extrato / Conciliação</TabsTrigger>
          </TabsList>

          <TabsContent value="contas" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? <p className="text-center py-6 text-muted-foreground">Carregando...</p> : contas.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">Nenhuma conta cadastrada</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Conta</TableHead>
                        <TableHead>Banco</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contas.map(c => (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{c.nome}</p>
                              {c.agencia && c.conta && <p className="text-xs text-muted-foreground">Ag: {c.agencia} | Cc: {c.conta}</p>}
                            </div>
                          </TableCell>
                          <TableCell>{c.banco}</TableCell>
                          <TableCell><Badge variant="outline">{tipoLabel(c.tipo)}</Badge></TableCell>
                          <TableCell>{(c as any).unidades?.nome || "—"}</TableCell>
                          <TableCell className={`text-right font-bold ${Number(c.saldo_atual) >= 0 ? "text-success" : "text-destructive"}`}>
                            R$ {Number(c.saldo_atual).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transferencias" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {transferencias.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">Nenhuma transferência registrada</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferencias.map((t: any) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-sm">{format(new Date(t.data_transferencia), "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{t.conta_origem?.nome}</p>
                              <p className="text-xs text-muted-foreground">{t.conta_origem?.unidades?.nome}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{t.conta_destino?.nome}</p>
                              <p className="text-xs text-muted-foreground">{t.conta_destino?.unidades?.nome}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{t.descricao || "—"}</TableCell>
                          <TableCell className="text-right font-bold">R$ {Number(t.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell>
                            <Badge variant={t.status === "confirmada" ? "default" : "secondary"}>{t.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conciliacao" className="mt-4">
            <Conciliacao embedded />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
