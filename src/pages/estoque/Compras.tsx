import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Plus, Package, DollarSign, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { toast } from "sonner";

interface Compra {
  id: string;
  valor_total: number;
  status: string;
  data_prevista: string | null;
  created_at: string;
  fornecedores: { razao_social: string } | null;
}

interface Fornecedor {
  id: string;
  razao_social: string;
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
}

export default function Compras() {
  const { unidadeAtual } = useUnidade();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fornecedor_id: "", produto_id: "", quantidade: "1", valor_total: "", data_prevista: "",
  });

  const fetchCompras = async () => {
    let query = supabase
      .from("compras")
      .select("*, fornecedores(razao_social)")
      .order("created_at", { ascending: false });

    if (unidadeAtual?.id) {
      query = query.eq("unidade_id", unidadeAtual.id);
    }

    const { data, error } = await query;
    if (error) { console.error(error); return; }
    setCompras(data || []);
    setLoading(false);
  };

  const fetchFornecedores = async () => {
    const { data } = await supabase.from("fornecedores").select("id, razao_social").eq("ativo", true).order("razao_social");
    setFornecedores(data || []);
  };

  const fetchProdutos = async () => {
    const { data } = await supabase.from("produtos").select("id, nome, preco").eq("ativo", true);
    setProdutos(data || []);
  };

  useEffect(() => {
    fetchFornecedores();
    fetchProdutos();
  }, []);

  useEffect(() => { fetchCompras(); }, [unidadeAtual?.id]);

  const handleSave = async () => {
    if (!form.fornecedor_id) { toast.error("Selecione um fornecedor"); return; }
    if (!form.valor_total) { toast.error("Informe o valor total"); return; }

    const { data: compra, error } = await supabase.from("compras").insert({
      fornecedor_id: form.fornecedor_id,
      unidade_id: unidadeAtual?.id || null,
      valor_total: parseFloat(form.valor_total),
      data_prevista: form.data_prevista || null,
      status: "pendente",
    }).select("id").single();

    if (error) { toast.error("Erro: " + error.message); return; }

    if (form.produto_id && compra) {
      const produto = produtos.find(p => p.id === form.produto_id);
      await supabase.from("compra_itens").insert({
        compra_id: compra.id,
        produto_id: form.produto_id,
        quantidade: parseInt(form.quantidade) || 1,
        preco_unitario: produto?.preco || 0,
      });
    }

    toast.success("Compra registrada!");
    setOpen(false);
    setForm({ fornecedor_id: "", produto_id: "", quantidade: "1", valor_total: "", data_prevista: "" });
    fetchCompras();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("compras").update({ status }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success("Status atualizado!");
    fetchCompras();
  };

  const totalMes = compras.reduce((a, c) => a + (Number(c.valor_total) || 0), 0);
  const emTransito = compras.filter(c => c.status === "em_transito").length;
  const pendentes = compras.filter(c => c.status === "pendente").length;

  const statusLabel = (s: string) => {
    if (s === "recebido") return "Recebido";
    if (s === "em_transito") return "Em Trânsito";
    if (s === "cancelado") return "Cancelado";
    return "Pendente";
  };

  const statusVariant = (s: string) => {
    if (s === "recebido") return "default" as const;
    if (s === "em_transito") return "secondary" as const;
    if (s === "cancelado") return "destructive" as const;
    return "outline" as const;
  };

  return (
    <MainLayout>
      <Header title="Compras" subtitle="Gestão de compras e pedidos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compras</h1>
            <p className="text-muted-foreground">Gestão de compras e pedidos</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Compra</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Compra</DialogTitle>
                <DialogDescription>Preencha os dados da compra</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Fornecedor *</Label>
                  <Select value={form.fornecedor_id} onValueChange={v => setForm({...form, fornecedor_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione o fornecedor" /></SelectTrigger>
                    <SelectContent>
                      {fornecedores.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.razao_social}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <Label>Produto</Label>
                    <Select value={form.produto_id} onValueChange={v => setForm({...form, produto_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Produto" /></SelectTrigger>
                      <SelectContent>
                        {produtos.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantidade</Label>
                    <Input type="number" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label>Valor Total *</Label>
                  <Input type="number" step="0.01" value={form.valor_total} onChange={e => setForm({...form, valor_total: e.target.value})} placeholder="0,00" />
                </div>
                <div>
                  <Label>Data Prevista</Label>
                  <Input type="date" value={form.data_prevista} onChange={e => setForm({...form, data_prevista: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave}>Registrar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><ShoppingCart className="h-6 w-6 text-primary" /></div>
                <div><p className="text-2xl font-bold">{compras.length}</p><p className="text-sm text-muted-foreground">Pedidos</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-secondary"><Truck className="h-6 w-6 text-secondary-foreground" /></div>
                <div><p className="text-2xl font-bold">{emTransito}</p><p className="text-sm text-muted-foreground">Em Trânsito</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent"><Package className="h-6 w-6 text-accent-foreground" /></div>
                <div><p className="text-2xl font-bold">{pendentes}</p><p className="text-sm text-muted-foreground">Pendentes</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><DollarSign className="h-6 w-6 text-primary" /></div>
                <div><p className="text-2xl font-bold">R$ {(totalMes / 1000).toFixed(1)}k</p><p className="text-sm text-muted-foreground">Total</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Pedidos de Compra</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-muted-foreground">Carregando...</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.fornecedores?.razao_social || "-"}</TableCell>
                      <TableCell>R$ {Number(c.valor_total).toLocaleString("pt-BR")}</TableCell>
                      <TableCell><Badge variant={statusVariant(c.status)}>{statusLabel(c.status)}</Badge></TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {c.status === "pendente" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "em_transito")}>Enviar</Button>
                          )}
                          {c.status === "em_transito" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "recebido")}>Receber</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {compras.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma compra registrada</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
