import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Fuel, Wrench, Truck, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";

export default function RelatoriosFrota() {
  const { unidadeAtual } = useUnidade();
  const [loading, setLoading] = useState(true);
  const [custoMensal, setCustoMensal] = useState<any[]>([]);
  const [kmPorVeiculo, setKmPorVeiculo] = useState<any[]>([]);
  const [custoTotal, setCustoTotal] = useState(0);
  const [consumoMedio, setConsumoMedio] = useState(0);
  const [disponibilidade, setDisponibilidade] = useState(0);

  useEffect(() => { fetchData(); }, [unidadeAtual]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const dados: any[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const inicio = d.toISOString();
        const fim = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

        let aq = supabase.from("abastecimentos").select("valor").gte("data", inicio.split("T")[0]).lt("data", fim.split("T")[0]);
        if (unidadeAtual?.id) aq = aq.eq("unidade_id", unidadeAtual.id);
        const { data: abast } = await aq;

        let mq = supabase.from("manutencoes").select("valor").gte("data", inicio.split("T")[0]).lt("data", fim.split("T")[0]);
        if (unidadeAtual?.id) mq = mq.eq("unidade_id", unidadeAtual.id);
        const { data: manut } = await mq;

        dados.push({
          mes: meses[d.getMonth()],
          combustivel: abast?.reduce((s, a) => s + Number(a.valor), 0) || 0,
          manutencao: manut?.reduce((s, m) => s + Number(m.valor), 0) || 0,
        });
      }
      setCustoMensal(dados);
      const ultimo = dados[dados.length - 1];
      setCustoTotal((ultimo?.combustivel || 0) + (ultimo?.manutencao || 0));

      // Veículos
      const { data: veiculos } = await supabase.from("veiculos").select("id, placa, km_atual, ativo");
      const ativos = veiculos?.filter(v => v.ativo) || [];
      const total = veiculos?.length || 1;
      setDisponibilidade(Math.round((ativos.length / total) * 100));

      setKmPorVeiculo(ativos.slice(0, 5).map(v => ({ veiculo: v.placa, km: v.km_atual || 0 })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Header title="Relatórios de Frota" subtitle="Análises e indicadores" />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header title="Relatórios de Frota" subtitle="Análises e indicadores" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exportar PDF</Button>
            <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" />Exportar Excel</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Custo Total Mensal</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {custoTotal.toLocaleString("pt-BR")}</div><p className="text-xs text-muted-foreground">Combustível + Manutenção</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Custo/KM</CardTitle><Truck className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">-</div><p className="text-xs text-muted-foreground">Média da frota</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Consumo Médio</CardTitle><Fuel className="h-4 w-4 text-orange-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">-</div><p className="text-xs text-muted-foreground">Toda a frota</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Disponibilidade</CardTitle><Wrench className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{disponibilidade}%</div><p className="text-xs text-muted-foreground">Veículos operacionais</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Custos Mensais (Últimos 6 meses)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={custoMensal}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                  <Legend />
                  <Bar dataKey="combustivel" fill="hsl(var(--primary))" name="Combustível" />
                  <Bar dataKey="manutencao" fill="hsl(var(--muted-foreground))" name="Manutenção" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>KM por Veículo</CardTitle></CardHeader>
            <CardContent>
              {kmPorVeiculo.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={kmPorVeiculo} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="veiculo" type="category" width={80} />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString("pt-BR")} km`} />
                    <Bar dataKey="km" fill="hsl(var(--primary))" name="KM" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Sem dados de veículos</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
