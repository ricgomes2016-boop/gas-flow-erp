import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Phone, MessageSquare, Clock, CheckCircle, AlertCircle, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function CRM() {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [totalAtivos, setTotalAtivos] = useState(0);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, count } = await supabase.from("clientes").select("*", { count: "exact" }).eq("ativo", true).order("updated_at", { ascending: false }).limit(50);
      setClientes(data || []);
      setTotalAtivos(count || 0);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = clientes.filter(c => !busca || c.nome?.toLowerCase().includes(busca.toLowerCase()) || c.telefone?.includes(busca));

  if (loading) {
    return (<MainLayout><Header title="CRM" subtitle="Gestão de relacionamento com clientes" /><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></MainLayout>);
  }

  return (
    <MainLayout>
      <Header title="CRM" subtitle="Gestão de relacionamento com clientes" />
      <div className="p-6 space-y-6">
        <div><h1 className="text-2xl font-bold text-foreground">CRM</h1><p className="text-muted-foreground">Gestão de relacionamento com clientes</p></div>
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><Users className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">{totalAtivos}</p><p className="text-sm text-muted-foreground">Clientes Ativos</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><CheckCircle className="h-6 w-6 text-green-500" /></div><div><p className="text-2xl font-bold">{clientes.filter(c => { const d = new Date(c.updated_at); const now = new Date(); return (now.getTime() - d.getTime()) < 30 * 24 * 60 * 60 * 1000; }).length}</p><p className="text-sm text-muted-foreground">Ativos (30 dias)</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-destructive/10"><AlertCircle className="h-6 w-6 text-destructive" /></div><div><p className="text-2xl font-bold">{clientes.filter(c => { const d = new Date(c.updated_at); const now = new Date(); return (now.getTime() - d.getTime()) > 90 * 24 * 60 * 60 * 1000; }).length}</p><p className="text-sm text-muted-foreground">Inativos (+90 dias)</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-yellow-500/10"><Clock className="h-6 w-6 text-yellow-500" /></div><div><p className="text-2xl font-bold">{clientes.filter(c => !c.telefone).length}</p><p className="text-sm text-muted-foreground">Sem Telefone</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><div className="flex items-center justify-between"><CardTitle>Clientes</CardTitle><div className="flex gap-2"><Input placeholder="Buscar..." className="w-64" value={busca} onChange={e => setBusca(e.target.value)} /><Button variant="outline"><Search className="h-4 w-4" /></Button></div></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Telefone</TableHead><TableHead>Tipo</TableHead><TableHead>Bairro</TableHead><TableHead className="w-32"></TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum cliente encontrado</TableCell></TableRow>}
                {filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>{c.telefone || "-"}</TableCell>
                    <TableCell><Badge variant="outline">{c.tipo || "residencial"}</Badge></TableCell>
                    <TableCell>{c.bairro || "-"}</TableCell>
                    <TableCell><div className="flex gap-1">{c.telefone && <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>}<Button variant="ghost" size="icon"><MessageSquare className="h-4 w-4" /></Button></div></TableCell>
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
