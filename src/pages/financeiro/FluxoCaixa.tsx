import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format, subDays } from "date-fns";
import { getBrasiliaDate, getBrasiliaStartOfDay } from "@/lib/utils";

interface Movimentacao {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  categoria: string | null;
  created_at: string;
}

export default function FluxoCaixa({ embedded }: { embedded?: boolean } = {}) {
  const [movs, setMovs] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { unidadeAtual } = useUnidade();
  const [form, setForm] = useState({ tipo: "entrada", descricao: "", valor: "", categoria: "" });

  const fetchMovs = async () => {
    setLoading(true);
    const sevenDaysAgo = subDays(new Date(), 7).toISOString();
    let query = supabase.from("movimentacoes_caixa").select("*").gte("created_at", sevenDaysAgo).order("created_at", { ascending: false });
    if (unidadeAtual?.id) query = query.or(`unidade_id.eq.${unidadeAtual.id},unidade_id.is.null`);
    const { data, error } = await query;
    if (error) console.error(error);
    else setMovs((data as Movimentacao[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchMovs(); }, [unidadeAtual]);

  const handleSubmit = async () => {
    if (!form.descricao || !form.valor) { toast.error("Preencha os campos obrigatórios"); return; }
    const { error } = await supabase.from("movimentacoes_caixa").insert({
      tipo: form.tipo, descricao: form.descricao,
      valor: parseFloat(form.valor), categoria: form.categoria || null,
      unidade_id: unidadeAtual?.id || null,
    });
    if (error) { toast.error("Erro ao registrar"); console.error(error); }
    else { toast.success("Movimentação registrada!"); setDialogOpen(false); setForm({ tipo: "entrada", descricao: "", valor: "", categoria: "" }); fetchMovs(); }
  };

  const hoje = new Date(getBrasiliaStartOfDay());
  const entradaHoje = movs.filter(m => m.tipo === "entrada" && new Date(m.created_at) >= hoje).reduce((a, m) => a + Number(m.valor), 0);
  const saidaHoje = movs.filter(m => m.tipo === "saida" && new Date(m.created_at) >= hoje).reduce((a, m) => a + Number(m.valor), 0);
  const totalEntradas = movs.filter(m => m.tipo === "entrada").reduce((a, m) => a + Number(m.valor), 0);
  const totalSaidas = movs.filter(m => m.tipo === "saida").reduce((a, m) => a + Number(m.valor), 0);

  const chartData = useMemo(() => {
    const days: Record<string, { entradas: number; saidas: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "dd/MM");
      days[d] = { entradas: 0, saidas: 0 };
    }
    movs.forEach(m => {
      const d = format(new Date(m.created_at), "dd/MM");
      if (days[d]) { if (m.tipo === "entrada") days[d].entradas += Number(m.valor); else days[d].saidas += Number(m.valor); }
    });
    return Object.entries(days).map(([data, v]) => ({ data, ...v }));
  }, [movs]);

  const content = (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
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
                      <SelectItem value="Vendas">Vendas</SelectItem><SelectItem value="Fornecedores">Fornecedores</SelectItem>
                      <SelectItem value="Frota">Frota</SelectItem><SelectItem value="RH">RH</SelectItem>
                      <SelectItem value="Recebíveis">Recebíveis</SelectItem><SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSubmit}>Salvar</Button></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Saldo 7 dias</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-lg sm:text-2xl font-bold">R$ {(totalEntradas - totalSaidas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Entradas Hoje</CardTitle><TrendingUp className="h-4 w-4 text-success" /></CardHeader><CardContent><div className="text-lg sm:text-2xl font-bold text-success">R$ {entradaHoje.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Saídas Hoje</CardTitle><TrendingDown className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-lg sm:text-2xl font-bold text-destructive">R$ {saidaHoje.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Saldo do Dia</CardTitle><DollarSign className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-lg sm:text-2xl font-bold text-primary">R$ {(entradaHoje - saidaHoje).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Fluxo de Caixa — Últimos 7 dias</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" /><YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                <Area type="monotone" dataKey="entradas" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.4} name="Entradas" />
                <Area type="monotone" dataKey="saidas" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.4} name="Saídas" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Últimas Movimentações</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-center py-6 text-muted-foreground">Carregando...</p> : movs.length === 0 ? <p className="text-center py-6 text-muted-foreground">Nenhuma movimentação encontrada</p> : (
              <div className="space-y-4">
                {movs.slice(0, 20).map(mov => (
                  <div key={mov.id} className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-full shrink-0 ${mov.tipo === "entrada" ? "bg-success/10" : "bg-destructive/10"}`}>
                        {mov.tipo === "entrada" ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{mov.descricao}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(mov.created_at), "dd/MM/yyyy HH:mm")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <Badge variant="outline" className="hidden sm:inline-flex text-xs">{mov.categoria || "—"}</Badge>
                      <span className={`font-bold text-sm whitespace-nowrap ${mov.tipo === "entrada" ? "text-success" : "text-destructive"}`}>
                        {mov.tipo === "entrada" ? "+" : "-"} R$ {Number(mov.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );

  if (embedded) return content;
  return (
    <MainLayout>
      <Header title="Fluxo de Caixa" subtitle="Entradas e saídas em tempo real" />
      {content}
    </MainLayout>
  );
}
