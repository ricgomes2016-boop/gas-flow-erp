import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, Fuel, Wrench, Truck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const custoMensal = [
  { mes: "Ago", combustivel: 7800, manutencao: 3200 },
  { mes: "Set", combustivel: 8200, manutencao: 2800 },
  { mes: "Out", combustivel: 7500, manutencao: 4500 },
  { mes: "Nov", combustivel: 8800, manutencao: 2100 },
  { mes: "Dez", combustivel: 9200, manutencao: 3800 },
  { mes: "Jan", combustivel: 8450, manutencao: 4130 },
];

const kmPorVeiculo = [
  { veiculo: "ABC-1234", km: 4500 },
  { veiculo: "DEF-5678", km: 5200 },
  { veiculo: "GHI-9012", km: 3800 },
  { veiculo: "JKL-3456", km: 4100 },
  { veiculo: "MNO-7890", km: 5800 },
];

export default function RelatoriosFrota() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios de Frota</h1>
            <p className="text-muted-foreground">Análises e indicadores da frota</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Custo Total Mensal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 12.580</div>
              <p className="text-xs text-muted-foreground">Combustível + Manutenção</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Custo/KM</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ 0,54</div>
              <p className="text-xs text-muted-foreground">Média da frota</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Consumo Médio</CardTitle>
              <Fuel className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">8.5 km/L</div>
              <p className="text-xs text-muted-foreground">Toda a frota</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
              <Wrench className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">92%</div>
              <p className="text-xs text-muted-foreground">Veículos operacionais</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Custos Mensais (Últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={custoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                  <Legend />
                  <Bar dataKey="combustivel" fill="hsl(var(--primary))" name="Combustível" />
                  <Bar dataKey="manutencao" fill="hsl(var(--muted-foreground))" name="Manutenção" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>KM Rodados por Veículo (Mês)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kmPorVeiculo} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="veiculo" type="category" width={80} />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('pt-BR')} km`} />
                  <Bar dataKey="km" fill="hsl(var(--primary))" name="KM" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
