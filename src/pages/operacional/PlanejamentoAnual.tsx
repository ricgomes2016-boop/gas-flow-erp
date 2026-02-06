import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Target, TrendingUp, Save } from "lucide-react";

const planejamentoAnual = [
  { mes: "Janeiro", meta: 100000, realizado: 98000, diferenca: -2000 },
  { mes: "Fevereiro", meta: 120000, realizado: 125400, diferenca: 5400 },
  { mes: "Março", meta: 115000, realizado: 0, diferenca: 0 },
  { mes: "Abril", meta: 130000, realizado: 0, diferenca: 0 },
  { mes: "Maio", meta: 140000, realizado: 0, diferenca: 0 },
  { mes: "Junho", meta: 135000, realizado: 0, diferenca: 0 },
  { mes: "Julho", meta: 145000, realizado: 0, diferenca: 0 },
  { mes: "Agosto", meta: 150000, realizado: 0, diferenca: 0 },
  { mes: "Setembro", meta: 155000, realizado: 0, diferenca: 0 },
  { mes: "Outubro", meta: 160000, realizado: 0, diferenca: 0 },
  { mes: "Novembro", meta: 170000, realizado: 0, diferenca: 0 },
  { mes: "Dezembro", meta: 180000, realizado: 0, diferenca: 0 },
];

export default function PlanejamentoAnual() {
  const totalMeta = planejamentoAnual.reduce((acc, m) => acc + m.meta, 0);
  const totalRealizado = planejamentoAnual.reduce((acc, m) => acc + m.realizado, 0);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Planejamento Anual</h1>
            <p className="text-muted-foreground">Metas e objetivos para 2026</p>
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    R$ {(totalMeta / 1000000).toFixed(2)}M
                  </p>
                  <p className="text-sm text-muted-foreground">Meta Anual</p>
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
                  <p className="text-2xl font-bold">
                    R$ {totalRealizado.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Realizado YTD</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {((totalRealizado / totalMeta) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">% do Ano</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Planejamento */}
        <Card>
          <CardHeader>
            <CardTitle>Metas Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Realizado</TableHead>
                  <TableHead>Diferença</TableHead>
                  <TableHead>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planejamentoAnual.map((item) => (
                  <TableRow key={item.mes}>
                    <TableCell className="font-medium">{item.mes}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={item.meta}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      {item.realizado > 0
                        ? `R$ ${item.realizado.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell
                      className={
                        item.diferenca > 0
                          ? "text-green-600"
                          : item.diferenca < 0
                          ? "text-destructive"
                          : ""
                      }
                    >
                      {item.diferenca !== 0
                        ? `${item.diferenca > 0 ? "+" : ""}R$ ${item.diferenca.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {item.realizado > 0
                        ? `${((item.realizado / item.meta) * 100).toFixed(0)}%`
                        : "-"}
                    </TableCell>
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
