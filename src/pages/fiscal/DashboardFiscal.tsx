import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  Receipt, Monitor, Truck, Route, ArrowRight 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { obterEstatisticasFiscais } from "@/services/focusNfeService";
import { useNavigate } from "react-router-dom";

export default function DashboardFiscal() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{ tipo: string; status: string; valor_total: number; data_emissao: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obterEstatisticasFiscais()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalNotas = stats.length;
  const autorizadas = stats.filter(n => n.status === "autorizada").length;
  const canceladas = stats.filter(n => n.status === "cancelada").length;
  const rejeitadas = stats.filter(n => n.status === "rejeitada" || n.status === "denegada").length;
  const valorTotal = stats.filter(n => n.status === "autorizada").reduce((s, n) => s + Number(n.valor_total), 0);

  const porTipo = ["nfe", "nfce", "cte", "mdfe"].map(t => ({
    tipo: t.toUpperCase().replace("NFE", "NF-e").replace("NFCE", "NFC-e").replace("CTE", "CT-e").replace("MDFE", "MDF-e"),
    total: stats.filter(n => n.tipo === t).length,
    autorizadas: stats.filter(n => n.tipo === t && n.status === "autorizada").length,
  }));

  const statusPizza = [
    { name: "Autorizadas", value: autorizadas || 1, color: "hsl(var(--primary))" },
    { name: "Canceladas", value: canceladas || 0, color: "hsl(var(--destructive))" },
    { name: "Rejeitadas", value: rejeitadas || 0, color: "hsl(var(--muted-foreground))" },
  ].filter(s => s.value > 0);

  // Agrupar por mês
  const porMes = stats.reduce((acc, n) => {
    const mes = n.data_emissao?.substring(0, 7) || "desconhecido";
    if (!acc[mes]) acc[mes] = { mes, nfe: 0, nfce: 0, cte: 0, mdfe: 0 };
    const key = n.tipo as keyof typeof acc[typeof mes];
    if (key in acc[mes]) (acc[mes] as any)[key]++;
    return acc;
  }, {} as Record<string, any>);

  const dadosMensais = Object.values(porMes).sort((a: any, b: any) => a.mes.localeCompare(b.mes)).slice(-6);

  const atalhos = [
    { icon: Receipt, label: "NF-e", path: "/fiscal/nfe", desc: "Nota Fiscal Eletrônica" },
    { icon: Monitor, label: "NFC-e", path: "/fiscal/nfce", desc: "Cupom Fiscal" },
    { icon: Route, label: "CT-e", path: "/fiscal/cte", desc: "Conhecimento Transporte" },
    { icon: Truck, label: "MDF-e", path: "/fiscal/mdfe", desc: "Manifesto de Carga" },
  ];

  return (
    <MainLayout>
      <Header title="Dashboard Fiscal" subtitle="Gestão Fiscal" />
      <div className="space-y-6 p-4 md:p-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalNotas}</p>
                  <p className="text-sm text-muted-foreground">Total Emitidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{autorizadas}</p>
                  <p className="text-sm text-muted-foreground">Autorizadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{canceladas}</p>
                  <p className="text-sm text-muted-foreground">Canceladas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rejeitadas}</p>
                  <p className="text-sm text-muted-foreground">Rejeitadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {(valorTotal / 1000).toFixed(0)}k</p>
                  <p className="text-sm text-muted-foreground">Valor Autorizado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Atalhos rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {atalhos.map(a => (
            <Card key={a.path} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(a.path)}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <a.icon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-bold">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Por tipo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {porTipo.map(t => (
            <Card key={t.tipo}>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{t.total}</p>
                <p className="text-sm text-muted-foreground">{t.tipo}</p>
                <Badge variant="outline" className="mt-1">{t.autorizadas} autorizadas</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-lg">Emissões por Mês</CardTitle></CardHeader>
            <CardContent>
              {dadosMensais.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosMensais}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="mes" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="nfe" name="NF-e" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="nfce" name="NFC-e" fill="hsl(var(--primary) / 0.6)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cte" name="CT-e" fill="hsl(var(--primary) / 0.35)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mdfe" name="MDF-e" fill="hsl(var(--primary) / 0.2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {loading ? "Carregando..." : "Nenhum documento fiscal emitido ainda. Comece emitindo sua primeira nota!"}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Status das Notas</CardTitle></CardHeader>
            <CardContent>
              {statusPizza.length > 0 && totalNotas > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusPizza} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {statusPizza.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {loading ? "Carregando..." : "Sem dados para exibir"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerta Focus NFe */}
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-accent-foreground mt-0.5" />
              <div>
                <p className="font-semibold">Integração Focus NFe</p>
                <p className="text-sm text-muted-foreground mt-1">
                  O sistema está preparado para integração com a API Focus NFe. Para ativar a transmissão real 
                  para a SEFAZ, configure o token da API nas configurações do sistema. 
                  As funcionalidades de emissão, cancelamento, carta de correção e inutilização já estão prontas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
