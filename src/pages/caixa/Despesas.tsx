import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Receipt, Plus, Wallet, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { startOfDay, format } from "date-fns";

interface Despesa {
  id: string;
  descricao: string;
  categoria: string | null;
  valor: number;
  responsavel: string | null;
  status: string;
  created_at: string;
}

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { unidadeAtual } = useUnidade();
  const [form, setForm] = useState({ descricao: "", categoria: "", valor: "", responsavel: "", observacoes: "" });

  const fetchDespesas = async () => {
    setLoading(true);
    const hojeISO = startOfDay(new Date()).toISOString();
    let query = supabase.from("movimentacoes_caixa").select("*").eq("tipo", "saida").gte("created_at", hojeISO).order("created_at", { ascending: false });
    if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
    const { data, error } = await query;
    if (error) console.error(error);
    else setDespesas((data as Despesa[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchDespesas(); }, [unidadeAtual]);

  const handleSubmit = async () => {
    if (!form.descricao || !form.valor) { toast.error("Preencha os campos"); return; }
    const { error } = await supabase.from("movimentacoes_caixa").insert({
      tipo: "saida", descricao: form.descricao,
      valor: parseFloat(form.valor), categoria: form.categoria || null,
      responsavel: form.responsavel || null, status: "pendente",
      observacoes: form.observacoes || null,
      unidade_id: unidadeAtual?.id || null,
    });
    if (error) { toast.error("Erro ao registrar"); console.error(error); }
    else { toast.success("Despesa registrada!"); setDialogOpen(false); setForm({ descricao: "", categoria: "", valor: "", responsavel: "", observacoes: "" }); fetchDespesas(); }
  };

  const totalDespesas = despesas.reduce((a, d) => a + Number(d.valor), 0);
  const totalAprovadas = despesas.filter(d => d.status === "aprovada").reduce((a, d) => a + Number(d.valor), 0);

  return (
    <MainLayout>
      <Header title="Despesas" subtitle="Controle de saídas e sangrias" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Despesas (Sangria)</h1>
            <p className="text-muted-foreground">Controle de saídas e despesas do caixa</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Despesa</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar Nova Despesa</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Descrição</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
                <div><Label>Categoria</Label>
                  <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Combustível">Combustível</SelectItem><SelectItem value="Alimentação">Alimentação</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem><SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Valor</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                <div><Label>Responsável</Label><Input value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })} /></div>
                <div><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
                <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSubmit}>Registrar</Button></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-destructive/10"><TrendingDown className="h-6 w-6 text-destructive" /></div><div><p className="text-2xl font-bold text-destructive">R$ {totalDespesas.toFixed(2)}</p><p className="text-sm text-muted-foreground">Total Despesas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-success/10"><Wallet className="h-6 w-6 text-success" /></div><div><p className="text-2xl font-bold">R$ {totalAprovadas.toFixed(2)}</p><p className="text-sm text-muted-foreground">Aprovadas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-warning/10"><Receipt className="h-6 w-6 text-warning" /></div><div><p className="text-2xl font-bold">{despesas.length}</p><p className="text-sm text-muted-foreground">Registros Hoje</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Despesas do Dia</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : despesas.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhuma despesa hoje</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Responsável</TableHead><TableHead>Data/Hora</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {despesas.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.descricao}</TableCell>
                      <TableCell><Badge variant="outline">{d.categoria || "—"}</Badge></TableCell>
                      <TableCell>{d.responsavel || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{format(new Date(d.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell className="font-medium text-destructive">- R$ {Number(d.valor).toFixed(2)}</TableCell>
                      <TableCell><Badge variant={d.status === "aprovada" ? "default" : "secondary"}>{d.status === "aprovada" ? "Aprovada" : "Pendente"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
