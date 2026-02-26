import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Plus, Pencil, Trash2, Search, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";

interface Terminal {
  id: string;
  nome: string;
  numero_serie: string | null;
  modelo: string | null;
  operadora: string;
  status: string;
  unidade_id: string | null;
  entregador_id: string | null;
  observacoes: string | null;
  created_at: string;
}

const emptyForm = {
  nome: "",
  numero_serie: "",
  modelo: "",
  operadora: "PagSeguro",
  status: "ativo",
  observacoes: "",
  entregador_id: "",
};

export default function TerminaisCartao() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { unidadeAtual } = useUnidade();
  const [busca, setBusca] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: terminais = [], isLoading } = useQuery({
    queryKey: ["terminais-cartao", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase
        .from("terminais_cartao")
        .select("*, operadoras_cartao(nome)")
        .order("nome");
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        operadora_display: t.operadoras_cartao?.nome || t.operadora || "—",
      })) as (Terminal & { operadora_display: string })[];
    },
  });

  const { data: entregadores = [] } = useQuery({
    queryKey: ["entregadores-ativos-terminal", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase
        .from("entregadores")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const payload = {
        nome: values.nome,
        numero_serie: values.numero_serie || null,
        modelo: values.modelo || null,
        operadora: values.operadora,
        status: values.status,
        observacoes: values.observacoes || null,
        entregador_id: values.entregador_id || null,
        unidade_id: unidadeAtual?.id || null,
      };
      if (editId) {
        const { error } = await supabase.from("terminais_cartao").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("terminais_cartao").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminais-cartao"] });
      toast({ title: editId ? "Terminal atualizado!" : "Terminal cadastrado!" });
      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Erro ao salvar terminal", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("terminais_cartao").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminais-cartao"] });
      toast({ title: "Terminal removido" });
    },
    onError: () => toast({ title: "Erro ao remover", variant: "destructive" }),
  });

  const openEdit = (t: Terminal) => {
    setEditId(t.id);
    setForm({
      nome: t.nome,
      numero_serie: t.numero_serie || "",
      modelo: t.modelo || "",
      operadora: t.operadora,
      status: t.status,
      observacoes: t.observacoes || "",
      entregador_id: t.entregador_id || "",
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const filtrados = terminais.filter((t) =>
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (t.numero_serie || "").toLowerCase().includes(busca.toLowerCase()) ||
    t.operadora.toLowerCase().includes(busca.toLowerCase())
  );

  const entregadorNome = (id: string | null) => {
    if (!id) return "—";
    return entregadores.find((e) => e.id === id)?.nome || "—";
  };

  return (
    <MainLayout>
      <Header title="Terminais / Máquinas de Cartão" subtitle="Gestão Financeira" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Terminais Cadastrados</h2>
            <Badge variant="secondary">{terminais.length}</Badge>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar terminal..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Novo Terminal</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editId ? "Editar Terminal" : "Novo Terminal"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome / Apelido *</Label>
                      <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Maquininha Balcão" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nº Série</Label>
                      <Input value={form.numero_serie} onChange={(e) => setForm({ ...form, numero_serie: e.target.value })} placeholder="Ex: SN123456" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="Ex: Moderninha Smart 2" />
                    </div>
                    <div className="space-y-2">
                      <Label>Operadora</Label>
                      <Select value={form.operadora} onValueChange={(v) => setForm({ ...form, operadora: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PagSeguro">PagSeguro</SelectItem>
                          <SelectItem value="Stone">Stone</SelectItem>
                          <SelectItem value="Cielo">Cielo</SelectItem>
                          <SelectItem value="Rede">Rede</SelectItem>
                          <SelectItem value="Getnet">Getnet</SelectItem>
                          <SelectItem value="Sumup">Sumup</SelectItem>
                          <SelectItem value="Outra">Outra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="manutencao">Em Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Entregador Vinculado</Label>
                      <Select value={form.entregador_id} onValueChange={(v) => setForm({ ...form, entregador_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum (Fixo na loja)</SelectItem>
                          {entregadores.map((e) => (
                            <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Anotações sobre o terminal..." rows={2} />
                  </div>
                  <Button className="w-full" disabled={!form.nome || saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
                    {saveMutation.isPending ? "Salvando..." : editId ? "Atualizar Terminal" : "Cadastrar Terminal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nº Série</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Operadora</TableHead>
                  <TableHead>Entregador</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum terminal cadastrado</TableCell></TableRow>
                ) : filtrados.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.nome}</TableCell>
                    <TableCell className="font-mono text-sm">{t.numero_serie || "—"}</TableCell>
                    <TableCell>{t.modelo || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{(t as any).operadora_display}</Badge></TableCell>
                    <TableCell>{entregadorNome(t.entregador_id)}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === "ativo" ? "default" : t.status === "inativo" ? "secondary" : "destructive"}>
                        {t.status === "ativo" ? "Ativo" : t.status === "inativo" ? "Inativo" : "Manutenção"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
