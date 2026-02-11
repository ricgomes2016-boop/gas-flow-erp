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
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { startOfDay } from "date-fns";

interface Mov {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  categoria: string | null;
  created_at: string;
}

export default function CaixaDia() {
  const [movs, setMovs] = useState<Mov[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { unidadeAtual } = useUnidade();
  const [form, setForm] = useState({ tipo: "entrada", descricao: "", valor: "", categoria: "" });

  const fetchMovs = async () => {
    setLoading(true);
    const hojeISO = startOfDay(new Date()).toISOString();
    let query = supabase.from("movimentacoes_caixa").select("*").gte("created_at", hojeISO).order("created_at", { ascending: false });
    if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
    const { data, error } = await query;
    if (error) console.error(error);
    else setMovs((data as Mov[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchMovs(); }, [unidadeAtual]);

  const handleSubmit = async () => {
    if (!form.descricao || !form.valor) { toast.error("Preencha os campos"); return; }
    const { error } = await supabase.from("movimentacoes_caixa").insert({
      tipo: form.tipo, descricao: form.descricao,
      valor: parseFloat(form.valor), categoria: form.categoria || null,
      unidade_id: unidadeAtual?.id || null,
    });
    if (error) { toast.error("Erro ao registrar"); console.error(error); }
    else { toast.success("Registrado!"); setDialogOpen(false); setForm({ tipo: "entrada", descricao: "", valor: "", categoria: "" }); fetchMovs(); }
  };

  const totalEntradas = movs.filter(m => m.tipo === "entrada").reduce((a, m) => a + Number(m.valor), 0);
  const totalSaidas = movs.filter(m => m.tipo === "saida").reduce((a, m) => a + Number(m.valor), 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <MainLayout>
      <Header title="Caixa do Dia" subtitle="Controle de movimentações financeiras" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Caixa do Dia</h1>
            <p className="text-muted-foreground">Controle de movimentações financeiras</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Movimentação</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Movimentação</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Descrição *</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
                <div><Label>Valor *</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                <div><Label>Categoria</Label>
                  <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vendas">Vendas</SelectItem><SelectItem value="Combustível">Combustível</SelectItem>
                      <SelectItem value="Alimentação">Alimentação</SelectItem><SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Troco">Troco</SelectItem><SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSubmit}>Registrar</Button></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-success/10"><TrendingUp className="h-6 w-6 text-success" /></div><div><p className="text-2xl font-bold text-success">R$ {totalEntradas.toFixed(2)}</p><p className="text-sm text-muted-foreground">Total Entradas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-destructive/10"><TrendingDown className="h-6 w-6 text-destructive" /></div><div><p className="text-2xl font-bold text-destructive">R$ {totalSaidas.toFixed(2)}</p><p className="text-sm text-muted-foreground">Total Saídas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><DollarSign className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">R$ {saldo.toFixed(2)}</p><p className="text-sm text-muted-foreground">Saldo Atual</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Movimentações do Dia</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : movs.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhuma movimentação hoje</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Hora</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
                <TableBody>
                  {movs.map(mov => (
                    <TableRow key={mov.id}>
                      <TableCell className="text-muted-foreground">{new Date(mov.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                      <TableCell><Badge variant={mov.tipo === "entrada" ? "default" : "destructive"}>{mov.tipo === "entrada" ? "Entrada" : "Saída"}</Badge></TableCell>
                      <TableCell>{mov.descricao}</TableCell>
                      <TableCell><Badge variant="outline">{mov.categoria || "—"}</Badge></TableCell>
                      <TableCell className={`text-right font-medium ${mov.tipo === "entrada" ? "text-success" : "text-destructive"}`}>
                        {mov.tipo === "entrada" ? "+" : "-"} R$ {Number(mov.valor).toFixed(2)}
                      </TableCell>
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
