import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  MapPin,
  Clock,
  Package,
  TrendingUp,
  Route,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const entregadoresStatus = [
  { id: 1, nome: "Carlos Souza", entregas: 8, status: "em_rota", ultimaLocalizacao: "Centro" },
  { id: 2, nome: "Roberto Lima", entregas: 12, status: "disponivel", ultimaLocalizacao: "Base" },
  { id: 3, nome: "Fernando Alves", entregas: 6, status: "em_rota", ultimaLocalizacao: "Zona Sul" },
];

const entregasPorBairro = [
  { bairro: "Centro", entregas: 45 },
  { bairro: "Zona Sul", entregas: 32 },
  { bairro: "Zona Norte", entregas: 28 },
  { bairro: "Zona Leste", entregas: 22 },
  { bairro: "Zona Oeste", entregas: 18 },
];

export default function DashboardLogistico() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Logístico</h1>
          <p className="text-muted-foreground">Monitoramento de entregas e rotas</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground">Entregas Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">28 min</p>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-muted-foreground">Taxa Sucesso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Route className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Em Rota</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status Entregadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Status dos Entregadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entregadoresStatus.map((entregador) => (
                  <div
                    key={entregador.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{entregador.nome}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {entregador.ultimaLocalizacao}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={entregador.status === "em_rota" ? "default" : "secondary"}
                      >
                        {entregador.status === "em_rota" ? "Em Rota" : "Disponível"}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {entregador.entregas} entregas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Entregas por Bairro */}
          <Card>
            <CardHeader>
              <CardTitle>Entregas por Bairro</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={entregasPorBairro} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="bairro" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="entregas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Mapa placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de Entregas em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">
                Mapa será exibido aqui (integração com Google Maps)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
