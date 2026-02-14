import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Megaphone, Plus, Users, Send, Calendar, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";

export default function Campanhas() {
  const { unidadeAtual } = useUnidade();
  const [loading, setLoading] = useState(true);
  const [campanhas, setCampanhas] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, [unidadeAtual]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let q = supabase.from("campanhas").select("*").order("created_at", { ascending: false });
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      setCampanhas(data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) {
    return (<MainLayout><Header title="Campanhas" subtitle="Marketing e comunicação" /><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></MainLayout>);
  }

  const ativas = campanhas.filter(c => c.status === "ativa").length;
  const totalAlcance = campanhas.reduce((s, c) => s + (c.alcance || 0), 0);
  const totalEnviados = campanhas.reduce((s, c) => s + (c.enviados || 0), 0);

  return (
    <MainLayout>
      <Header title="Campanhas" subtitle="Marketing e comunicação" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-foreground">Campanhas</h1><p className="text-muted-foreground">Gerenciar campanhas de marketing</p></div><Button><Plus className="h-4 w-4 mr-2" />Nova Campanha</Button></div>
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><Megaphone className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">{campanhas.length}</p><p className="text-sm text-muted-foreground">Campanhas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-500/10"><Users className="h-6 w-6 text-blue-500" /></div><div><p className="text-2xl font-bold">{totalAlcance}</p><p className="text-sm text-muted-foreground">Alcance Total</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><Send className="h-6 w-6 text-green-500" /></div><div><p className="text-2xl font-bold">{totalEnviados}</p><p className="text-sm text-muted-foreground">Mensagens Enviadas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-yellow-500/10"><Calendar className="h-6 w-6 text-yellow-500" /></div><div><p className="text-2xl font-bold">{ativas}</p><p className="text-sm text-muted-foreground">Ativas Agora</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Todas as Campanhas</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Alcance</TableHead><TableHead>Enviados</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
              <TableBody>
                {campanhas.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhuma campanha cadastrada</TableCell></TableRow>}
                {campanhas.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell><Badge variant="outline">{c.tipo}</Badge></TableCell>
                    <TableCell>{c.alcance}</TableCell>
                    <TableCell>{c.enviados}</TableCell>
                    <TableCell><Badge variant={c.status === "ativa" ? "default" : c.status === "concluida" ? "secondary" : "outline"}>{c.status === "ativa" ? "Ativa" : c.status === "concluida" ? "Concluída" : "Rascunho"}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.data_criacao).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></TableCell>
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
