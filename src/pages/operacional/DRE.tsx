import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getBrasiliaDate } from "@/lib/utils";
import { useUnidade } from "@/contexts/UnidadeContext";

interface DRELine {
  categoria: string;
  valores: number[];
  tipo: string;
}

export default function DRE({ embedded = false }: { embedded?: boolean }) {
  const { unidadeAtual } = useUnidade();
  const [loading, setLoading] = useState(true);
  const [dre, setDre] = useState<DRELine[]>([]);
  const [meses, setMeses] = useState<string[]>([]);

  useEffect(() => { fetchData(); }, [unidadeAtual]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = getBrasiliaDate();
      const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const mesesCalc: string[] = [];
      const receitaBruta: number[] = [];
      const cmv: number[] = [];
      const despOp: number[] = [];
      const despAdmin: number[] = [];
      const despPessoal: number[] = [];
      const despFin: number[] = [];

      // Últimos 3 meses
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const inicio = d.toISOString();
        const inicioDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
        const fimD = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const fim = fimD.toISOString();
        const fimDate = `${fimD.getFullYear()}-${String(fimD.getMonth() + 1).padStart(2, '0')}-01`;
        mesesCalc.push(nomesMeses[d.getMonth()]);

        // Receita bruta = total pedidos
        let pq = supabase.from("pedidos").select("valor_total").gte("created_at", inicio).lt("created_at", fim).neq("status", "cancelado");
        if (unidadeAtual?.id) pq = pq.eq("unidade_id", unidadeAtual.id);
        const { data: pedidos } = await pq;
        receitaBruta.push(pedidos?.reduce((s, p) => s + (p.valor_total || 0), 0) || 0);

        // Despesas reais do extrato bancário (movimentacoes_bancarias)
        let dq = supabase.from("movimentacoes_bancarias").select("valor, categoria").eq("tipo", "saida").gte("data", inicioDate).lt("data", fimDate);
        if (unidadeAtual?.id) dq = dq.eq("unidade_id", unidadeAtual.id);
        const { data: despesasBanco } = await dq;

        // Também puxar contas_pagar pagas no período
        let cpq = supabase.from("contas_pagar").select("valor, categoria").eq("status", "pago").gte("vencimento", inicioDate).lt("vencimento", fimDate);
        if (unidadeAtual?.id) cpq = cpq.eq("unidade_id", unidadeAtual.id);
        const { data: contasPagas } = await cpq;

        // Mesclar despesas
        const todasDespesas = [
          ...(despesasBanco || []).map(d => ({ categoria: d.categoria, valor: Number(d.valor) })),
          ...(contasPagas || []).map(d => ({ categoria: (d as any).categoria, valor: Number(d.valor) })),
        ];

        let op = 0, admin = 0, pessoal = 0, fin = 0, custo = 0;
        todasDespesas.forEach(d => {
          const cat = (d.categoria || "").toLowerCase();
          const val = d.valor || 0;
          if (cat.includes("mercadoria") || cat.includes("compra") || cat.includes("estoque")) custo += val;
          else if (cat.includes("pessoal") || cat.includes("salário") || cat.includes("salario")) pessoal += val;
          else if (cat.includes("financ")) fin += val;
          else if (cat.includes("admin")) admin += val;
          else op += val;
        });
        cmv.push(custo);
        despOp.push(op);
        despAdmin.push(admin);
        despPessoal.push(pessoal);
        despFin.push(fin);
      }

      setMeses(mesesCalc);

      const deducoes = receitaBruta.map(r => r * 0.05);
      const receitaLiquida = receitaBruta.map((r, i) => r - deducoes[i]);
      const lucroBruto = receitaLiquida.map((r, i) => r - cmv[i]);
      const lucroOp = lucroBruto.map((r, i) => r - despOp[i] - despAdmin[i] - despPessoal[i]);
      const lucroLiquido = lucroOp.map((r, i) => r - despFin[i]);

      setDre([
        { categoria: "Receita Bruta", valores: receitaBruta, tipo: "receita" },
        { categoria: "(-) Deduções", valores: deducoes.map(v => -v), tipo: "deducao" },
        { categoria: "Receita Líquida", valores: receitaLiquida, tipo: "subtotal" },
        { categoria: "(-) CMV", valores: cmv.map(v => -v), tipo: "custo" },
        { categoria: "Lucro Bruto", valores: lucroBruto, tipo: "subtotal" },
        { categoria: "(-) Despesas Operacionais", valores: despOp.map(v => -v), tipo: "despesa" },
        { categoria: "(-) Despesas Administrativas", valores: despAdmin.map(v => -v), tipo: "despesa" },
        { categoria: "(-) Despesas com Pessoal", valores: despPessoal.map(v => -v), tipo: "despesa" },
        { categoria: "Lucro Operacional", valores: lucroOp, tipo: "subtotal" },
        { categoria: "(-) Despesas Financeiras", valores: despFin.map(v => -v), tipo: "despesa" },
        { categoria: "Lucro Líquido", valores: lucroLiquido, tipo: "resultado" },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    const formatted = Math.abs(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    return value < 0 ? `(${formatted})` : formatted;
  };

  const getRowClass = (tipo: string) => {
    switch (tipo) {
      case "subtotal": return "bg-muted/50 font-medium";
      case "resultado": return "bg-primary/10 font-bold";
      default: return "";
    }
  };

  if (loading) {
    const loader = <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    if (embedded) return loader;
    return (
      <MainLayout>
        <Header title="DRE" subtitle="Demonstrativo de Resultados do Exercício" />
        {loader}
      </MainLayout>
    );
  }

  const totalReceita = dre.find(d => d.categoria === "Receita Bruta")?.valores.reduce((s, v) => s + v, 0) || 0;
  const totalCustos = dre.filter(d => d.tipo !== "receita" && d.tipo !== "subtotal" && d.tipo !== "resultado").reduce((s, d) => s + d.valores.reduce((a, v) => a + Math.abs(v), 0), 0);
  const totalLucro = dre.find(d => d.categoria === "Lucro Líquido")?.valores.reduce((s, v) => s + v, 0) || 0;

  const content = (
      <div className="space-y-6">

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><TrendingUp className="h-6 w-6 text-green-500" /></div><div><p className="text-2xl font-bold">R$ {(totalReceita / 1000).toFixed(1)}k</p><p className="text-sm text-muted-foreground">Receita Trimestre</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-destructive/10"><TrendingDown className="h-6 w-6 text-destructive" /></div><div><p className="text-2xl font-bold">R$ {(totalCustos / 1000).toFixed(1)}k</p><p className="text-sm text-muted-foreground">Custos Trimestre</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><DollarSign className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">R$ {(totalLucro / 1000).toFixed(1)}k</p><p className="text-sm text-muted-foreground">Lucro Trimestre</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Demonstrativo Trimestral</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Descrição</TableHead>
                  {meses.map(m => <TableHead key={m} className="text-right">{m}</TableHead>)}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dre.map((item, index) => {
                  const total = item.valores.reduce((s, v) => s + v, 0);
                  return (
                    <TableRow key={index} className={getRowClass(item.tipo)}>
                      <TableCell>{item.categoria}</TableCell>
                      {item.valores.map((v, i) => (
                        <TableCell key={i} className={`text-right ${v < 0 ? "text-destructive" : ""}`}>{formatCurrency(v)}</TableCell>
                      ))}
                      <TableCell className={`text-right ${total < 0 ? "text-destructive" : ""}`}>{formatCurrency(total)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
      </Card>
    </div>
  );

  if (embedded) return content;
  return (
    <MainLayout>
      <Header title="DRE" subtitle="Demonstrativo de Resultados do Exercício" />
      <div className="p-6">{content}</div>
    </MainLayout>
  );
}
