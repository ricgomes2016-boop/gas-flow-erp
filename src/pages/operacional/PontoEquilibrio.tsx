import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Line, ComposedChart, Area } from "recharts";
import { Calculator, TrendingUp, DollarSign, Package, AlertTriangle, Plus, Trash2 } from "lucide-react";

interface CustoFixo {
  id: string;
  descricao: string;
  valor: number;
}

const custosFixosIniciais: CustoFixo[] = [
  { id: "1", descricao: "Aluguel", valor: 3500 },
  { id: "2", descricao: "Salários e encargos", valor: 12000 },
  { id: "3", descricao: "Energia elétrica", valor: 800 },
  { id: "4", descricao: "Telefone / Internet", valor: 250 },
  { id: "5", descricao: "Contador", valor: 600 },
  { id: "6", descricao: "Seguro", valor: 450 },
  { id: "7", descricao: "Manutenção veículos (fixo)", valor: 1200 },
];

export default function PontoEquilibrio({ embedded = false }: { embedded?: boolean }) {
  const [custosFixos, setCustosFixos] = useState<CustoFixo[]>(custosFixosIniciais);
  const [novoDesc, setNovoDesc] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [precoVendaUnit, setPrecoVendaUnit] = useState(120);
  const [custoVariavelUnit, setCustoVariavelUnit] = useState(75);

  const totalCustosFixos = useMemo(() => custosFixos.reduce((s, c) => s + c.valor, 0), [custosFixos]);
  const margemContribuicao = precoVendaUnit - custoVariavelUnit;
  const margemPercentual = precoVendaUnit > 0 ? (margemContribuicao / precoVendaUnit) * 100 : 0;
  const peUnidades = margemContribuicao > 0 ? Math.ceil(totalCustosFixos / margemContribuicao) : 0;
  const peReais = margemPercentual > 0 ? totalCustosFixos / (margemPercentual / 100) : 0;

  const addCusto = () => {
    if (!novoDesc || !novoValor) return;
    setCustosFixos([...custosFixos, { id: Date.now().toString(), descricao: novoDesc, valor: parseFloat(novoValor) }]);
    setNovoDesc("");
    setNovoValor("");
  };

  const removeCusto = (id: string) => {
    setCustosFixos(custosFixos.filter((c) => c.id !== id));
  };

  // Chart data: simulate from 0 to 2x PE
  const chartData = useMemo(() => {
    const maxUnid = Math.max(peUnidades * 2, 20);
    const step = Math.max(1, Math.floor(maxUnid / 15));
    const data = [];
    for (let q = 0; q <= maxUnid; q += step) {
      const receita = q * precoVendaUnit;
      const custoTotal = totalCustosFixos + q * custoVariavelUnit;
      const lucro = receita - custoTotal;
      data.push({ unidades: q, receita, custoTotal, lucro });
    }
    return data;
  }, [peUnidades, precoVendaUnit, custoVariavelUnit, totalCustosFixos]);

  const content = (
    <div className="space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">PE em Unidades</p>
              </div>
              <p className="text-2xl font-bold">{peUnidades.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-muted-foreground">botijões / mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">PE em Faturamento</p>
              </div>
              <p className="text-2xl font-bold">R$ {peReais.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground">receita mínima / mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Margem de Contribuição</p>
              </div>
              <p className="text-2xl font-bold">R$ {margemContribuicao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground">{margemPercentual.toFixed(1)}% por unidade</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Custos Fixos Totais</p>
              </div>
              <p className="text-2xl font-bold">R$ {totalCustosFixos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground">despesas mensais fixas</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Gráfico de Ponto de Equilíbrio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="unidades" label={{ value: "Unidades vendidas", position: "insideBottom", offset: -5 }} />
                <YAxis tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                <Area type="monotone" dataKey="lucro" fill="hsl(var(--primary) / 0.1)" stroke="none" />
                <Line type="monotone" dataKey="receita" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Receita Total" dot={false} />
                <Line type="monotone" dataKey="custoTotal" stroke="hsl(var(--destructive))" strokeWidth={2} name="Custo Total" dot={false} />
                <Line type="monotone" dataKey="lucro" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" name="Lucro / Prejuízo" dot={false} />
                {peUnidades > 0 && (
                  <ReferenceLine x={peUnidades} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: `PE: ${peUnidades} un.`, position: "top", fill: "hsl(var(--foreground))" }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parâmetros de Venda */}
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros de Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preço de Venda Unitário (R$)</Label>
                <Input type="number" step="0.01" value={precoVendaUnit} onChange={(e) => setPrecoVendaUnit(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Custo Variável Unitário (R$)</Label>
                <Input type="number" step="0.01" value={custoVariavelUnit} onChange={(e) => setCustoVariavelUnit(parseFloat(e.target.value) || 0)} />
                <p className="text-xs text-muted-foreground">Custo do produto + comissão + impostos por unidade</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margem de Contribuição</span>
                  <span className="font-medium">R$ {margemContribuicao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({margemPercentual.toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PE em Unidades</span>
                  <span className="font-bold text-primary">{peUnidades.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PE em Faturamento</span>
                  <span className="font-bold text-primary">R$ {peReais.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custos Fixos */}
          <Card>
            <CardHeader>
              <CardTitle>Custos Fixos Mensais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor (R$)</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {custosFixos.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.descricao}</TableCell>
                      <TableCell className="text-right font-medium">{c.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeCusto(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">R$ {totalCustosFixos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="flex gap-2">
                <Input placeholder="Descrição" value={novoDesc} onChange={(e) => setNovoDesc(e.target.value)} className="flex-1" />
                <Input type="number" step="0.01" placeholder="Valor" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} className="w-28" />
                <Button size="icon" onClick={addCusto}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );

  if (embedded) return content;
  return (
    <MainLayout>
      <Header title="Ponto de Equilíbrio" subtitle="Análise de break-even da operação" />
      <div className="p-4 md:p-6">{content}</div>
    </MainLayout>
  );
}
