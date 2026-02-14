import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Package, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { startOfDay, format } from "date-fns";

interface Entregador { id: string; nome: string; }
interface Entrega {
  id: string;
  valor_total: number;
  forma_pagamento: string | null;
  status: string | null;
  cliente: { nome: string } | null;
}

export default function AcertoEntregador() {
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const { unidadeAtual } = useUnidade();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("entregadores").select("id, nome").eq("ativo", true).order("nome");
      if (data) setEntregadores(data);
    };
    fetch();
  }, []);

  const carregarEntregas = async () => {
    if (!selectedId) { toast.error("Selecione um entregador"); return; }
    setLoading(true);
    const inicio = startOfDay(new Date(dataInicio + "T00:00:00")).toISOString();
    const fim = new Date(new Date(dataFim + "T00:00:00").getTime() + 86400000).toISOString();
    let query = supabase.from("pedidos").select("id, valor_total, forma_pagamento, status, cliente:clientes(nome)")
      .eq("entregador_id", selectedId).gte("created_at", inicio).lt("created_at", fim).eq("status", "entregue");
    if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
    const { data, error } = await query;
    if (error) { console.error(error); toast.error("Erro ao carregar"); }
    else setEntregas((data as any) || []);
    setLoading(false);
  };

  const totalVendas = entregas.reduce((a, e) => a + Number(e.valor_total || 0), 0);
  const totalDinheiro = entregas.filter(e => e.forma_pagamento === "dinheiro").reduce((a, e) => a + Number(e.valor_total || 0), 0);
  const totalPix = entregas.filter(e => e.forma_pagamento === "pix").reduce((a, e) => a + Number(e.valor_total || 0), 0);

  return (
    <MainLayout>
      <Header title="Acerto do Entregador" subtitle="Conferência de entregas e valores" />
      <div className="p-6 space-y-6">
        <div><h1 className="text-2xl font-bold text-foreground">Acerto Diário do Entregador</h1><p className="text-muted-foreground">Conferência de entregas e valores</p></div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Selecionar Entregador</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div><Label>Entregador</Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{entregadores.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Data Início</Label><Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} /></div>
              <div><Label>Data Fim</Label><Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} /></div>
              <div className="flex items-end"><Button className="w-full" onClick={carregarEntregas}>Carregar Entregas</Button></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><Package className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">{entregas.length}</p><p className="text-sm text-muted-foreground">Entregas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-success/10"><Wallet className="h-6 w-6 text-success" /></div><div><p className="text-2xl font-bold">R$ {totalVendas.toFixed(2)}</p><p className="text-sm text-muted-foreground">Total Vendas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><Wallet className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">R$ {totalDinheiro.toFixed(2)}</p><p className="text-sm text-muted-foreground">Em Dinheiro</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-warning/10"><Wallet className="h-6 w-6 text-warning" /></div><div><p className="text-2xl font-bold">R$ {totalPix.toFixed(2)}</p><p className="text-sm text-muted-foreground">Em PIX</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Entregas Realizadas</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : entregas.length === 0 ? <p className="text-center py-8 text-muted-foreground">{selectedId ? "Nenhuma entrega encontrada para este período" : "Selecione um entregador e clique em Carregar"}</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Valor</TableHead><TableHead>Pagamento</TableHead></TableRow></TableHeader>
                <TableBody>
                  {entregas.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.cliente?.nome || "—"}</TableCell>
                      <TableCell>R$ {Number(e.valor_total || 0).toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline">{e.forma_pagamento || "—"}</Badge></TableCell>
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
