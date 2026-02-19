import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { obterEstatisticasFiscais } from "@/services/focusNfeService";

export default function RelatoriosNotas() {
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
  const valorTotal = stats.filter(n => n.status === "autorizada").reduce((s, n) => s + Number(n.valor_total), 0);

  const statusPizza = [
    { name: "Autorizadas", value: autorizadas || 0, color: "hsl(var(--primary))" },
    { name: "Canceladas", value: canceladas || 0, color: "hsl(var(--destructive))" },
    { name: "Outras", value: Math.max(0, totalNotas - autorizadas - canceladas), color: "hsl(var(--muted-foreground))" },
  ].filter(s => s.value > 0);

  // Agrupar por mês
  const porMes = stats.reduce((acc, n) => {
    const mes = n.data_emissao?.substring(0, 7) || "?";
    if (!acc[mes]) acc[mes] = { mes, nfe: 0, nfce: 0, cte: 0, mdfe: 0 };
    if (n.tipo in acc[mes]) (acc[mes] as any)[n.tipo]++;
    return acc;
  }, {} as Record<string, any>);
  const dadosMensais = Object.values(porMes).sort((a: any, b: any) => a.mes.localeCompare(b.mes)).slice(-6);

  // Top destinatários
  const destMap = stats
    .filter(n => n.status === "autorizada" && n.tipo)
    .reduce((acc, n) => {
      const nome = (n as any).destinatario_nome || "Desconhecido";
      if (!acc[nome]) acc[nome] = { nome, qtd: 0, valor: 0 };
      acc[nome].qtd++;
      acc[nome].valor += Number(n.valor_total);
      return acc;
    }, {} as Record<string, { nome: string; qtd: number; valor: number }>);
  const topDest = Object.values(destMap).sort((a, b) => b.valor - a.valor).slice(0, 6);

  return (
    <MainLayout>
      <Header title="Painel Fiscal" subtitle="Gestão Fiscal" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Input type="month" className="w-[180px]" />
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportar PDF</Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold">{totalNotas}</p>
                  <p className="text-sm text-muted-foreground">Total de Notas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-primary" /></div>
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
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><XCircle className="h-5 w-5 text-destructive" /></div>
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
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold">R$ {(valorTotal / 1000).toFixed(0)}k</p>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
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
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {loading ? "Carregando..." : "Nenhum dado para exibir"}
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

        {/* Top Destinatários */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Destinatários por Volume</CardTitle></CardHeader>
          <CardContent>
            {topDest.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead className="text-right">Qtd. Notas</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDest.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell><Badge variant="outline">{i + 1}º</Badge></TableCell>
                      <TableCell className="font-medium">{d.nome}</TableCell>
                      <TableCell className="text-right">{d.qtd}</TableCell>
                      <TableCell className="text-right font-semibold">R$ {d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">{loading ? "Carregando..." : "Nenhum dado para exibir"}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
