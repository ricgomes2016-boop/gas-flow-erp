import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const previsaoData = [
  { mes: "Jan", realizado: 85000, previsto: 80000 },
  { mes: "Fev", realizado: 92000, previsto: 88000 },
  { mes: "Mar", realizado: 78000, previsto: 85000 },
  { mes: "Abr", realizado: null, previsto: 90000 },
  { mes: "Mai", realizado: null, previsto: 95000 },
  { mes: "Jun", realizado: null, previsto: 100000 },
];

const projecoes = [
  { periodo: "Próxima Semana", entrada: 45000, saida: 32000, saldo: 13000 },
  { periodo: "Próximo Mês", entrada: 180000, saida: 145000, saldo: 35000 },
  { periodo: "Próximo Trimestre", entrada: 540000, saida: 420000, saldo: 120000 },
];

export default function PrevisaoCaixa() {
  return (
    <MainLayout>
      <Header title="Previsão de Caixa" subtitle="Projeções financeiras baseadas em histórico" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Previsão de Caixa</h1>
            <p className="text-muted-foreground">Projeções financeiras baseadas em histórico</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Configurar Parâmetros</Button>
            <Button>Gerar Nova Projeção</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45.680</div>
              <p className="text-xs text-muted-foreground">Base para projeção</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Previsão 30 dias</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 80.680</div>
              <p className="text-xs text-muted-foreground">+R$ 35.000 previstos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">A Receber</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ 28.500</div>
              <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <p className="text-xs text-muted-foreground">Períodos críticos</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo Realizado vs Previsto</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={previsaoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => value ? `R$ ${Number(value).toLocaleString('pt-BR')}` : 'N/A'} />
                <Legend />
                <Line type="monotone" dataKey="realizado" stroke="#22c55e" strokeWidth={2} name="Realizado" connectNulls={false} />
                <Line type="monotone" dataKey="previsto" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Previsto" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projecoes.map((proj) => (
            <Card key={proj.periodo}>
              <CardHeader>
                <CardTitle className="text-lg">{proj.periodo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entradas Previstas</span>
                  <span className="font-medium text-green-600">R$ {proj.entrada.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saídas Previstas</span>
                  <span className="font-medium text-red-600">R$ {proj.saida.toLocaleString('pt-BR')}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium">Saldo Previsto</span>
                  <span className="font-bold text-blue-600">R$ {proj.saldo.toLocaleString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
