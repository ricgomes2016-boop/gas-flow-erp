import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";

const produtos = [
  {
    produto: "P13",
    estoqueAtual: 85,
    mediaConsumo: 12,
    tempoReposicao: 3,
    estoqueMinimo: 36,
    estoqueMaximo: 100,
    pontoReposicao: 48,
    status: "ok",
  },
  {
    produto: "P20",
    estoqueAtual: 25,
    mediaConsumo: 4,
    tempoReposicao: 3,
    estoqueMinimo: 12,
    estoqueMaximo: 40,
    pontoReposicao: 16,
    status: "ok",
  },
  {
    produto: "P45",
    estoqueAtual: 8,
    mediaConsumo: 2,
    tempoReposicao: 5,
    estoqueMinimo: 10,
    estoqueMaximo: 25,
    pontoReposicao: 12,
    status: "alerta",
  },
];

export default function MCMM() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              MCMM - Média, Consumo, Mínimo, Máximo
            </h1>
            <p className="text-muted-foreground">
              Controle de níveis de estoque
            </p>
          </div>
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            Recalcular
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">118</p>
                  <p className="text-sm text-muted-foreground">Estoque Total</p>
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
                  <p className="text-2xl font-bold">18/dia</p>
                  <p className="text-sm text-muted-foreground">Consumo Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <TrendingDown className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">6.5 dias</p>
                  <p className="text-sm text-muted-foreground">Cobertura</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Alertas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela MCMM */}
        <Card>
          <CardHeader>
            <CardTitle>Análise MCMM</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Média Consumo/Dia</TableHead>
                  <TableHead>Tempo Reposição</TableHead>
                  <TableHead>Est. Mínimo</TableHead>
                  <TableHead>Est. Máximo</TableHead>
                  <TableHead>Ponto Reposição</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.produto}>
                    <TableCell className="font-medium">{produto.produto}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          produto.estoqueAtual <= produto.estoqueMinimo
                            ? "destructive"
                            : "default"
                        }
                      >
                        {produto.estoqueAtual}
                      </Badge>
                    </TableCell>
                    <TableCell>{produto.mediaConsumo}</TableCell>
                    <TableCell>{produto.tempoReposicao} dias</TableCell>
                    <TableCell>{produto.estoqueMinimo}</TableCell>
                    <TableCell>{produto.estoqueMaximo}</TableCell>
                    <TableCell>{produto.pontoReposicao}</TableCell>
                    <TableCell>
                      <Badge
                        variant={produto.status === "ok" ? "default" : "destructive"}
                      >
                        {produto.status === "ok" ? "OK" : "Alerta"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Legenda */}
        <Card>
          <CardHeader>
            <CardTitle>Fórmulas Utilizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium">Estoque Mínimo</p>
                <p className="text-sm text-muted-foreground">
                  = Média Consumo × Tempo Reposição
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium">Ponto de Reposição</p>
                <p className="text-sm text-muted-foreground">
                  = Estoque Mínimo + (Média Consumo × Margem Segurança)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
