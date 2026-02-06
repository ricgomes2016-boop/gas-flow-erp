import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const dre = [
  { categoria: "Receita Bruta", jan: 98000, fev: 125400, mar: 110000, tipo: "receita" },
  { categoria: "(-) Deduções", jan: -4900, fev: -6270, mar: -5500, tipo: "deducao" },
  { categoria: "Receita Líquida", jan: 93100, fev: 119130, mar: 104500, tipo: "subtotal" },
  { categoria: "(-) CMV", jan: -45000, fev: -52000, mar: -48000, tipo: "custo" },
  { categoria: "Lucro Bruto", jan: 48100, fev: 67130, mar: 56500, tipo: "subtotal" },
  { categoria: "(-) Despesas Operacionais", jan: -18000, fev: -20000, mar: -19000, tipo: "despesa" },
  { categoria: "(-) Despesas Administrativas", jan: -8000, fev: -9000, mar: -8500, tipo: "despesa" },
  { categoria: "(-) Despesas com Pessoal", jan: -15000, fev: -16000, mar: -15500, tipo: "despesa" },
  { categoria: "Lucro Operacional", jan: 7100, fev: 22130, mar: 13500, tipo: "subtotal" },
  { categoria: "(-) Despesas Financeiras", jan: -1200, fev: -1500, mar: -1300, tipo: "despesa" },
  { categoria: "Lucro Líquido", jan: 5900, fev: 20630, mar: 12200, tipo: "resultado" },
];

export default function DRE() {
  const formatCurrency = (value: number) => {
    const formatted = Math.abs(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return value < 0 ? `(${formatted})` : formatted;
  };

  const getRowClass = (tipo: string) => {
    switch (tipo) {
      case "subtotal":
        return "bg-muted/50 font-medium";
      case "resultado":
        return "bg-primary/10 font-bold";
      default:
        return "";
    }
  };

  return (
    <MainLayout>
      <Header title="DRE" subtitle="Demonstrativo de Resultados do Exercício" />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            DRE - Demonstração do Resultado
          </h1>
          <p className="text-muted-foreground">
            Demonstrativo de Resultado do Exercício
          </p>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ 333.4k</p>
                  <p className="text-sm text-muted-foreground">Receita Trimestre</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ 294.7k</p>
                  <p className="text-sm text-muted-foreground">Custos Trimestre</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ 38.7k</p>
                  <p className="text-sm text-muted-foreground">Lucro Trimestre</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DRE Table */}
        <Card>
          <CardHeader>
            <CardTitle>Demonstrativo Trimestral</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Descrição</TableHead>
                  <TableHead className="text-right">Janeiro</TableHead>
                  <TableHead className="text-right">Fevereiro</TableHead>
                  <TableHead className="text-right">Março</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dre.map((item, index) => (
                  <TableRow key={index} className={getRowClass(item.tipo)}>
                    <TableCell>{item.categoria}</TableCell>
                    <TableCell
                      className={`text-right ${item.jan < 0 ? "text-destructive" : ""}`}
                    >
                      {formatCurrency(item.jan)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${item.fev < 0 ? "text-destructive" : ""}`}
                    >
                      {formatCurrency(item.fev)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${item.mar < 0 ? "text-destructive" : ""}`}
                    >
                      {formatCurrency(item.mar)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        item.jan + item.fev + item.mar < 0 ? "text-destructive" : ""
                      }`}
                    >
                      {formatCurrency(item.jan + item.fev + item.mar)}
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
