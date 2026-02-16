import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Fuel, Plus, Search, TrendingUp, Truck, DollarSign, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";

export default function Combustivel() {
  const { unidadeAtual } = useUnidade();
  const [loading, setLoading] = useState(true);
  const [abastecimentos, setAbastecimentos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [gastoMensal, setGastoMensal] = useState(0);
  const [litrosMensal, setLitrosMensal] = useState(0);
  const [veiculosAtivos, setVeiculosAtivos] = useState(0);

  useEffect(() => { fetchData(); }, [unidadeAtual]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const mesInicio = new Date();
      mesInicio.setDate(1);
      mesInicio.setHours(0, 0, 0, 0);

      let aq = supabase.from("abastecimentos").select("*, veiculos(placa)").order("data", { ascending: false });
      if (unidadeAtual?.id) aq = aq.eq("unidade_id", unidadeAtual.id);
      const { data } = await aq;
      setAbastecimentos(data || []);

      const mesData = (data || []).filter(a => new Date(a.data) >= mesInicio);
      setGastoMensal(mesData.reduce((s, a) => s + Number(a.valor), 0));
      setLitrosMensal(mesData.reduce((s, a) => s + Number(a.litros), 0));

      const { count } = await supabase.from("veiculos").select("id", { count: "exact" }).eq("ativo", true);
      setVeiculosAtivos(count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = abastecimentos.filter(a =>
    !busca || (a.veiculos as any)?.placa?.toLowerCase().includes(busca.toLowerCase()) || a.motorista?.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <Header title="Controle de Combustível" subtitle="Gerencie abastecimentos da frota" />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header title="Controle de Combustível" subtitle="Gerencie abastecimentos da frota" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button className="gap-2"><Plus className="h-4 w-4" />Novo Abastecimento</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Gasto Mensal</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">R$ {gastoMensal.toLocaleString("pt-BR")}</div><p className="text-xs text-muted-foreground">Este mês</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Litros Consumidos</CardTitle><Fuel className="h-4 w-4 text-orange-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{litrosMensal.toLocaleString("pt-BR")} L</div><p className="text-xs text-muted-foreground">Este mês</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Média Km/L</CardTitle><TrendingUp className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{litrosMensal > 0 ? "-" : "-"}</div><p className="text-xs text-muted-foreground">Calculado do consumo</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Veículos Ativos</CardTitle><Truck className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{veiculosAtivos}</div><p className="text-xs text-muted-foreground">Na frota</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Abastecimentos</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-10 w-[250px]" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Veículo</TableHead><TableHead>Motorista</TableHead><TableHead>Data</TableHead><TableHead>KM</TableHead><TableHead>Litros</TableHead><TableHead>Tipo</TableHead><TableHead>Valor</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum abastecimento registrado</TableCell></TableRow>}
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{(a.veiculos as any)?.placa || "-"}</TableCell>
                    <TableCell>{a.motorista}</TableCell>
                    <TableCell>{new Date(a.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{Number(a.km).toLocaleString("pt-BR")} km</TableCell>
                    <TableCell>{Number(a.litros)} L</TableCell>
                    <TableCell><Badge variant="outline">{a.tipo}</Badge></TableCell>
                    <TableCell className="font-medium">R$ {Number(a.valor).toLocaleString("pt-BR")}</TableCell>
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
