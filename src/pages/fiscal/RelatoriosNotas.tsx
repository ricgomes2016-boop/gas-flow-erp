import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, FileText, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const resumoMensal = [
  { mes: "Set", nfe: 45, nfce: 320, cte: 12, mdfe: 8 },
  { mes: "Out", nfe: 52, nfce: 345, cte: 15, mdfe: 10 },
  { mes: "Nov", nfe: 48, nfce: 380, cte: 18, mdfe: 9 },
  { mes: "Dez", nfe: 60, nfce: 420, cte: 20, mdfe: 12 },
  { mes: "Jan", nfe: 55, nfce: 390, cte: 16, mdfe: 11 },
  { mes: "Fev", nfe: 38, nfce: 280, cte: 10, mdfe: 7 },
];

const statusPizza = [
  { name: "Autorizadas", value: 1245, color: "hsl(var(--primary))" },
  { name: "Canceladas", value: 42, color: "hsl(var(--destructive))" },
  { name: "Denegadas", value: 8, color: "hsl(var(--muted-foreground))" },
];

const topDestinatarios = [
  { nome: "Distribuidora Central Gás Ltda", qtdNotas: 85, valorTotal: 412500.00 },
  { nome: "Comercial Fogão & Cia", qtdNotas: 62, valorTotal: 142600.00 },
  { nome: "Supermercado Bom Preço", qtdNotas: 48, valorTotal: 345600.00 },
  { nome: "Posto Estrela Azul", qtdNotas: 35, valorTotal: 55300.00 },
  { nome: "Padaria Pão Quente", qtdNotas: 28, valorTotal: 26880.00 },
  { nome: "Restaurante Sabor Caseiro", qtdNotas: 22, valorTotal: 20900.00 },
];

export default function RelatoriosNotas() {
  return (
    <MainLayout>
      <Header title="Relatórios de Notas" subtitle="Gestão Fiscal" />
      <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Relatórios de Notas Emitidas
        </h1>
        <div className="flex gap-2">
          <Input type="month" className="w-[180px]" defaultValue="2026-02" />
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
                <p className="text-2xl font-bold">1.295</p>
                <p className="text-sm text-muted-foreground">Total de Notas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-2xl font-bold">1.245</p>
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
                <p className="text-2xl font-bold">42</p>
                <p className="text-sm text-muted-foreground">Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-yellow-500" /></div>
              <div>
                <p className="text-2xl font-bold">R$ 1,2M</p>
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resumoMensal}>
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Status das Notas</CardTitle></CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Top Destinatários */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Top Destinatários por Volume</CardTitle></CardHeader>
        <CardContent>
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
              {topDestinatarios.map((d, i) => (
                <TableRow key={i}>
                  <TableCell><Badge variant="outline">{i + 1}º</Badge></TableCell>
                  <TableCell className="font-medium">{d.nome}</TableCell>
                  <TableCell className="text-right">{d.qtdNotas}</TableCell>
                  <TableCell className="text-right font-semibold">R$ {d.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
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
