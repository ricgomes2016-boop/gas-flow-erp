import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, Plus, Search, AlertTriangle, CheckCircle2, Clock, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";

export default function Manutencao() {
  const { unidadeAtual } = useUnidade();
  const [loading, setLoading] = useState(true);
  const [manutencoes, setManutencoes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => { fetchData(); }, [unidadeAtual]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let mq = supabase.from("manutencoes").select("*, veiculos(placa)").order("data", { ascending: false });
      if (unidadeAtual?.id) mq = mq.eq("unidade_id", unidadeAtual.id);
      const { data } = await mq;
      setManutencoes(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const agendadas = manutencoes.filter(m => m.status === "Agendada").length;
  const emAndamento = manutencoes.filter(m => m.status === "Em andamento").length;
  const gastoMensal = manutencoes.reduce((s, m) => s + Number(m.valor), 0);

  const filtered = manutencoes.filter(m =>
    !busca || (m.veiculos as any)?.placa?.toLowerCase().includes(busca.toLowerCase()) || m.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <Header title="Manutenção de Veículos" subtitle="Controle preventivo e corretivo" />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header title="Manutenção de Veículos" subtitle="Controle preventivo e corretivo" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manutenção de Veículos</h1>
            <p className="text-muted-foreground">Controle preventivo e corretivo da frota</p>
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4" />Nova Manutenção</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Gasto Total</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">R$ {gastoMensal.toLocaleString("pt-BR")}</div><p className="text-xs text-muted-foreground">Em manutenções</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Agendadas</CardTitle><Clock className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{agendadas}</div><p className="text-xs text-muted-foreground">Próximas manutenções</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Em Andamento</CardTitle><Wrench className="h-4 w-4 text-orange-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{emAndamento}</div><p className="text-xs text-muted-foreground">Na oficina agora</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Concluídas</CardTitle><CheckCircle2 className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{manutencoes.filter(m => m.status === "Concluída").length}</div><p className="text-xs text-muted-foreground">Finalizadas</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Manutenções</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-10 w-[250px]" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Veículo</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Oficina</TableHead><TableHead>Data</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhuma manutenção registrada</TableCell></TableRow>}
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{(m.veiculos as any)?.placa || "-"}</TableCell>
                    <TableCell><Badge variant={m.tipo === "Preventiva" ? "secondary" : "destructive"}>{m.tipo}</Badge></TableCell>
                    <TableCell>{m.descricao}</TableCell>
                    <TableCell>{m.oficina}</TableCell>
                    <TableCell>{new Date(m.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-medium">R$ {Number(m.valor).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {m.status === "Concluída" && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                        {m.status === "Em andamento" && <Wrench className="h-3 w-3 text-orange-600" />}
                        {m.status === "Agendada" && <Clock className="h-3 w-3 text-blue-600" />}
                        <Badge variant={m.status === "Concluída" ? "default" : m.status === "Em andamento" ? "secondary" : "outline"}>{m.status}</Badge>
                      </div>
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
