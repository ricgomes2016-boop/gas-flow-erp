import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, FileText, Trash2, Eye, Copy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  aprovado: "bg-green-500/20 text-green-400 border-green-500/30",
  recusado: "bg-red-500/20 text-red-400 border-red-500/30",
  convertido: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  vencido: "bg-muted text-muted-foreground border-muted",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  convertido: "Convertido em Venda",
  vencido: "Vencido",
};

interface OrcamentoItem {
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  produto_id?: string;
}

export default function Orcamentos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<any>(null);

  // Form state
  const [clienteNome, setClienteNome] = useState("");
  const [validade, setValidade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [itens, setItens] = useState<OrcamentoItem[]>([
    { descricao: "", quantidade: 1, preco_unitario: 0, subtotal: 0 },
  ]);

  const { data: orcamentos = [], isLoading } = useQuery({
    queryKey: ["orcamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: viewItens = [] } = useQuery({
    queryKey: ["orcamento-itens", selectedOrcamento?.id],
    queryFn: async () => {
      if (!selectedOrcamento) return [];
      const { data, error } = await supabase
        .from("orcamento_itens")
        .select("*")
        .eq("orcamento_id", selectedOrcamento.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrcamento,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const valorTotal = itens.reduce((sum, i) => sum + i.subtotal, 0) - desconto;
      const { data: orc, error } = await supabase
        .from("orcamentos")
        .insert({
          cliente_nome: clienteNome,
          validade: validade || undefined,
          observacoes,
          desconto,
          valor_total: valorTotal,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;

      const itensToInsert = itens
        .filter((i) => i.descricao.trim())
        .map((i) => ({
          orcamento_id: orc.id,
          descricao: i.descricao,
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario,
          subtotal: i.quantidade * i.preco_unitario,
        }));

      if (itensToInsert.length > 0) {
        const { error: itensError } = await supabase
          .from("orcamento_itens")
          .insert(itensToInsert);
        if (itensError) throw itensError;
      }

      return orc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento criado com sucesso!");
      resetForm();
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orcamentos")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Status atualizado!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orcamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento excluído!");
    },
  });

  const resetForm = () => {
    setClienteNome("");
    setValidade("");
    setObservacoes("");
    setDesconto(0);
    setItens([{ descricao: "", quantidade: 1, preco_unitario: 0, subtotal: 0 }]);
  };

  const updateItem = (index: number, field: keyof OrcamentoItem, value: any) => {
    const updated = [...itens];
    (updated[index] as any)[field] = value;
    updated[index].subtotal = updated[index].quantidade * updated[index].preco_unitario;
    setItens(updated);
  };

  const addItem = () =>
    setItens([...itens, { descricao: "", quantidade: 1, preco_unitario: 0, subtotal: 0 }]);

  const removeItem = (index: number) => {
    if (itens.length > 1) setItens(itens.filter((_, i) => i !== index));
  };

  const totalItens = itens.reduce((s, i) => s + i.subtotal, 0);
  const totalFinal = totalItens - desconto;

  const filtered = orcamentos.filter((o: any) => {
    const matchSearch =
      o.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.numero).includes(search);
    const matchStatus = filterStatus === "todos" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const duplicar = (orc: any) => {
    setClienteNome(orc.cliente_nome);
    setObservacoes(orc.observacoes || "");
    setDesconto(orc.desconto || 0);
    setDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
            <p className="text-muted-foreground">Crie e gerencie orçamentos para seus clientes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Orçamento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Orçamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente *</Label>
                    <Input value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Nome do cliente" />
                  </div>
                  <div>
                    <Label>Validade</Label>
                    <Input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Itens</Label>
                  <div className="space-y-2">
                    {itens.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Input
                            placeholder="Descrição"
                            value={item.descricao}
                            onChange={(e) => updateItem(idx, "descricao", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min={1}
                            placeholder="Qtd"
                            value={item.quantidade}
                            onChange={(e) => updateItem(idx, "quantidade", Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="Preço"
                            value={item.preco_unitario}
                            onChange={(e) => updateItem(idx, "preco_unitario", Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-1 text-right text-sm font-medium pt-2">
                          R$ {item.subtotal.toFixed(2)}
                        </div>
                        <div className="col-span-1">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={itens.length === 1}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-3 w-3 mr-1" />Adicionar Item
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Desconto (R$)</Label>
                    <Input type="number" min={0} step={0.01} value={desconto} onChange={(e) => setDesconto(Number(e.target.value))} />
                  </div>
                  <div className="flex items-end">
                    <div className="text-lg font-bold">Total: R$ {totalFinal.toFixed(2)}</div>
                  </div>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
                </div>

                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate()}
                  disabled={!clienteNome.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? "Salvando..." : "Salvar Orçamento"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por cliente ou nº..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="recusado">Recusado</SelectItem>
              <SelectItem value="convertido">Convertido</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: orcamentos.length, color: "text-foreground" },
            { label: "Pendentes", value: orcamentos.filter((o: any) => o.status === "pendente").length, color: "text-yellow-400" },
            { label: "Aprovados", value: orcamentos.filter((o: any) => o.status === "aprovado").length, color: "text-green-400" },
            {
              label: "Valor Total Pendente",
              value: `R$ ${orcamentos.filter((o: any) => o.status === "pendente").reduce((s: number, o: any) => s + Number(o.valor_total || 0), 0).toFixed(2)}`,
              color: "text-primary",
            },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum orçamento encontrado</TableCell></TableRow>
                ) : (
                  filtered.map((orc: any) => (
                    <TableRow key={orc.id}>
                      <TableCell className="font-mono">#{orc.numero}</TableCell>
                      <TableCell className="font-medium">{orc.cliente_nome}</TableCell>
                      <TableCell>{format(new Date(orc.data_emissao), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(new Date(orc.validade), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="font-medium">R$ {Number(orc.valor_total).toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={orc.status}
                          onValueChange={(v) => updateStatusMutation.mutate({ id: orc.id, status: v })}
                        >
                          <SelectTrigger className="w-40 h-7 text-xs">
                            <Badge variant="outline" className={statusColors[orc.status] || ""}>
                              {statusLabels[orc.status] || orc.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedOrcamento(orc); setViewDialogOpen(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => duplicar(orc)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { if (confirm("Excluir orçamento?")) deleteMutation.mutate(orc.id); }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog Visualizar */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Orçamento #{selectedOrcamento?.numero}
              </DialogTitle>
            </DialogHeader>
            {selectedOrcamento && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cliente:</span>
                    <p className="font-medium">{selectedOrcamento.cliente_nome}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className={`ml-2 ${statusColors[selectedOrcamento.status]}`}>
                      {statusLabels[selectedOrcamento.status]}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Emissão:</span>
                    <p>{format(new Date(selectedOrcamento.data_emissao), "dd/MM/yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Validade:</span>
                    <p>{format(new Date(selectedOrcamento.validade), "dd/MM/yyyy")}</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewItens.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell className="text-right">{item.quantidade}</TableCell>
                        <TableCell className="text-right">R$ {Number(item.preco_unitario).toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">R$ {Number(item.subtotal).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="border-t pt-3 space-y-1 text-sm">
                  {Number(selectedOrcamento.desconto) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Desconto:</span>
                      <span className="text-destructive">- R$ {Number(selectedOrcamento.desconto).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold">
                    <span>Total:</span>
                    <span>R$ {Number(selectedOrcamento.valor_total).toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrcamento.observacoes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Observações:</span>
                    <p className="mt-1">{selectedOrcamento.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
