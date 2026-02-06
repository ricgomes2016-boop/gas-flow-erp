import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fluxoData = [
  { data: "01/01", entradas: 8500, saidas: 6200, saldo: 2300 },
  { data: "02/01", entradas: 12000, saidas: 8500, saldo: 3500 },
  { data: "03/01", entradas: 9800, saidas: 7200, saldo: 2600 },
  { data: "04/01", entradas: 15000, saidas: 11000, saldo: 4000 },
  { data: "05/01", entradas: 11500, saidas: 9800, saldo: 1700 },
  { data: "06/01", entradas: 13200, saidas: 8900, saldo: 4300 },
  { data: "07/01", entradas: 16800, saidas: 12500, saldo: 4300 },
];

const movimentacoes = [
  { id: 1, tipo: "entrada", descricao: "Vendas do dia", valor: 8500, categoria: "Vendas", data: "2024-01-16" },
  { id: 2, tipo: "saida", descricao: "Compra de botijões", valor: 5200, categoria: "Fornecedores", data: "2024-01-16" },
  { id: 3, tipo: "entrada", descricao: "Recebimento PIX", valor: 1200, categoria: "Recebíveis", data: "2024-01-16" },
  { id: 4, tipo: "saida", descricao: "Combustível", valor: 850, categoria: "Frota", data: "2024-01-16" },
  { id: 5, tipo: "saida", descricao: "Folha de pagamento", valor: 3500, categoria: "RH", data: "2024-01-15" },
  { id: 6, tipo: "entrada", descricao: "Vendas do dia", valor: 12000, categoria: "Vendas", data: "2024-01-15" },
];

export default function FluxoCaixa() {
  return (
    <MainLayout>
      <Header title="Fluxo de Caixa" subtitle="Entradas e saídas em tempo real" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fluxo de Caixa</h1>
            <p className="text-muted-foreground">Acompanhe entradas e saídas em tempo real</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Exportar</Button>
            <Button>Nova Movimentação</Button>
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
              <p className="text-xs text-muted-foreground">Em caixa</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Entradas Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 9.700</div>
              <p className="text-xs text-muted-foreground">+15% vs ontem</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saídas Hoje</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ 6.050</div>
              <p className="text-xs text-muted-foreground">-8% vs ontem</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo do Dia</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ 3.650</div>
              <p className="text-xs text-muted-foreground">Positivo</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa - Últimos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={fluxoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Area type="monotone" dataKey="entradas" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Entradas" />
                <Area type="monotone" dataKey="saidas" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Saídas" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movimentacoes.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${mov.tipo === "entrada" ? "bg-green-100" : "bg-red-100"}`}>
                      {mov.tipo === "entrada" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{mov.descricao}</p>
                      <p className="text-sm text-muted-foreground">{new Date(mov.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{mov.categoria}</Badge>
                    <span className={`font-bold ${mov.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}>
                      {mov.tipo === "entrada" ? "+" : "-"} R$ {mov.valor.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
