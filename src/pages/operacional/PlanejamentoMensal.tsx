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
import { Calendar, DollarSign, TrendingUp, Save, Plus } from "lucide-react";

const categorias = [
  { nome: "Receita de Vendas", previsto: 150000, realizado: 125400 },
  { nome: "Custo de Mercadoria", previsto: -75000, realizado: -62700 },
  { nome: "Salários e Encargos", previsto: -25000, realizado: -24500 },
  { nome: "Aluguel", previsto: -5000, realizado: -5000 },
  { nome: "Combustível", previsto: -8000, realizado: -7200 },
  { nome: "Manutenção Veículos", previsto: -3000, realizado: -2800 },
  { nome: "Energia/Água", previsto: -1500, realizado: -1400 },
  { nome: "Marketing", previsto: -2000, realizado: -1800 },
  { nome: "Outros", previsto: -2000, realizado: -1500 },
];

export default function PlanejamentoMensal() {
  const totalPrevisto = categorias.reduce((acc, c) => acc + c.previsto, 0);
  const totalRealizado = categorias.reduce((acc, c) => acc + c.realizado, 0);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Planejamento Financeiro - Mês
            </h1>
            <p className="text-muted-foreground">Fevereiro 2026</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    R$ {totalPrevisto.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Resultado Previsto</p>
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
                  <p className="text-sm text-muted-foreground">Resultado Atual</p>
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
                  <p className="text-2xl font-bold">22 dias</p>
                  <p className="text-sm text-muted-foreground">Restantes no Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Previsto</TableHead>
                  <TableHead>Realizado</TableHead>
                  <TableHead>Diferença</TableHead>
                  <TableHead>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map((cat) => {
                  const diferenca = cat.realizado - cat.previsto;
                  const percentual = (cat.realizado / cat.previsto) * 100;
                  return (
                    <TableRow key={cat.nome}>
                      <TableCell className="font-medium">{cat.nome}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          defaultValue={cat.previsto}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell
                        className={cat.realizado < 0 ? "text-destructive" : "text-green-600"}
                      >
                        R$ {cat.realizado.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={
                          diferenca > 0
                            ? "text-green-600"
                            : diferenca < 0
                            ? "text-destructive"
                            : ""
                        }
                      >
                        {diferenca > 0 ? "+" : ""}
                        R$ {diferenca.toLocaleString()}
                      </TableCell>
                      <TableCell>{percentual.toFixed(0)}%</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell>R$ {totalPrevisto.toLocaleString()}</TableCell>
                  <TableCell className={totalRealizado > 0 ? "text-green-600" : "text-destructive"}>
                    R$ {totalRealizado.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={
                      totalRealizado - totalPrevisto > 0
                        ? "text-green-600"
                        : "text-destructive"
                    }
                  >
                    {totalRealizado - totalPrevisto > 0 ? "+" : ""}
                    R$ {(totalRealizado - totalPrevisto).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {((totalRealizado / totalPrevisto) * 100).toFixed(0)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
