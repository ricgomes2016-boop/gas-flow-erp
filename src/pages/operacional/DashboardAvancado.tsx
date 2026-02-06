import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";

const dadosMensais = [
  { mes: "Jan", vendas: 98000, despesas: 45000, lucro: 53000 },
  { mes: "Fev", vendas: 125400, despesas: 52000, lucro: 73400 },
  { mes: "Mar", vendas: 110000, despesas: 48000, lucro: 62000 },
  { mes: "Abr", vendas: 135000, despesas: 55000, lucro: 80000 },
  { mes: "Mai", vendas: 142000, despesas: 58000, lucro: 84000 },
  { mes: "Jun", vendas: 138000, despesas: 54000, lucro: 84000 },
];

const vendasPorHora = [
  { hora: "08h", vendas: 5 },
  { hora: "09h", vendas: 8 },
  { hora: "10h", vendas: 12 },
  { hora: "11h", vendas: 15 },
  { hora: "12h", vendas: 10 },
  { hora: "13h", vendas: 8 },
  { hora: "14h", vendas: 14 },
  { hora: "15h", vendas: 18 },
  { hora: "16h", vendas: 22 },
  { hora: "17h", vendas: 28 },
  { hora: "18h", vendas: 35 },
  { hora: "19h", vendas: 25 },
  { hora: "20h", vendas: 12 },
];

export default function DashboardAvancado() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Avançado</h1>
          <p className="text-muted-foreground">Análises detalhadas e métricas avançadas</p>
        </div>

        <Tabs defaultValue="financeiro" className="space-y-6">
          <TabsList>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="operacional">Operacional</TabsTrigger>
          </TabsList>

          <TabsContent value="financeiro" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">R$ 748.4k</p>
                      <p className="text-sm text-muted-foreground">Faturamento Anual</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-destructive/10">
                      <BarChart3 className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">R$ 312k</p>
                      <p className="text-sm text-muted-foreground">Despesas Anuais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <PieChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">R$ 436.4k</p>
                      <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Evolução Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={dadosMensais}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString()}`} />
                    <Area
                      type="monotone"
                      dataKey="vendas"
                      stackId="1"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="Vendas"
                    />
                    <Area
                      type="monotone"
                      dataKey="lucro"
                      stackId="2"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.3}
                      name="Lucro"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Hora do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={vendasPorHora}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hora" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operacional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métricas Operacionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Tempo Médio de Entrega</p>
                    <p className="text-2xl font-bold">28 min</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold">97.8%</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Entregas por Entregador</p>
                    <p className="text-2xl font-bold">12.5/dia</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Custo por Entrega</p>
                    <p className="text-2xl font-bold">R$ 4,80</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
