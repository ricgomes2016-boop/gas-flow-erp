import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Package, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TAXA_COMISSAO = 0.05;

export default function ComissaoEntregador() {
  const { unidadeAtual } = useUnidade();
  const now = new Date();

  const { data: comissoes = [], isLoading } = useQuery({
    queryKey: ["comissao-entregador", unidadeAtual?.id],
    queryFn: async () => {
      const mesInicio = startOfMonth(now).toISOString();
      const mesFim = endOfMonth(now).toISOString();

      let query = supabase
        .from("pedidos")
        .select("entregador_id, valor_total, entregadores(nome)")
        .eq("status", "entregue")
        .gte("created_at", mesInicio)
        .lte("created_at", mesFim);

      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);

      const { data, error } = await query;
      if (error) throw error;

      // Agrupar por entregador
      const map = new Map<string, { nome: string; entregas: number; valorVendido: number }>();
      (data || []).forEach((p: any) => {
        if (!p.entregador_id) return;
        const existing = map.get(p.entregador_id) || { nome: p.entregadores?.nome || "N/A", entregas: 0, valorVendido: 0 };
        existing.entregas++;
        existing.valorVendido += Number(p.valor_total) || 0;
        map.set(p.entregador_id, existing);
      });

      return Array.from(map.entries()).map(([id, v]) => ({
        id,
        entregador: v.nome,
        entregas: v.entregas,
        valorVendido: v.valorVendido,
        comissao: v.valorVendido * TAXA_COMISSAO,
        bonus: v.entregas >= 200 ? 200 : v.entregas >= 150 ? 100 : 0,
        get total() { return this.comissao + this.bonus; },
      })).sort((a, b) => b.entregas - a.entregas);
    },
  });

  // Comparativo mensal (últimos 6 meses de pedidos entregues)
  const { data: comparativo = [] } = useQuery({
    queryKey: ["comissao-comparativo", unidadeAtual?.id],
    queryFn: async () => {
      const meses = [];
      for (let i = 5; i >= 0; i--) {
        const mes = subMonths(now, i);
        const inicio = startOfMonth(mes).toISOString();
        const fim = endOfMonth(mes).toISOString();

        let query = supabase
          .from("pedidos")
          .select("valor_total")
          .eq("status", "entregue")
          .not("entregador_id", "is", null)
          .gte("created_at", inicio)
          .lte("created_at", fim);

        if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);

        const { data } = await query;
        const total = (data || []).reduce((acc: number, p: any) => acc + (Number(p.valor_total) || 0), 0);
        meses.push({ mes: format(mes, "MMM", { locale: ptBR }), comissao: Math.round(total * TAXA_COMISSAO) });
      }
      return meses;
    },
  });

  const totalComissao = comissoes.reduce((acc, c) => acc + c.total, 0);
  const totalEntregas = comissoes.reduce((acc, c) => acc + c.entregas, 0);

  return (
    <MainLayout>
      <Header title="Comissão do Entregador" subtitle="Relatório de comissões e bônus" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Comissão do Entregador</h1>
            <p className="text-muted-foreground">Cálculo de comissões por entrega</p>
          </div>
          <Button className="gap-2"><Calculator className="h-4 w-4" />Calcular Comissões</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Comissões</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Entregas</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalEntregas}</div>
              <p className="text-xs text-muted-foreground">Realizadas no mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Média/Entregador</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">R$ {comissoes.length > 0 ? (totalComissao / comissoes.length).toFixed(2) : "0.00"}</div>
              <p className="text-xs text-muted-foreground">Por funcionário</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa Comissão</CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{(TAXA_COMISSAO * 100)}%</div>
              <p className="text-xs text-muted-foreground">Sobre vendas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Comparativo Mensal</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={comparativo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                  <Bar dataKey="comissao" fill="hsl(var(--primary))" name="Comissão" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Detalhamento por Entregador</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : comissoes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma entrega no período</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entregador</TableHead>
                      <TableHead>Entregas</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Bônus</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comissoes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.entregador}</TableCell>
                        <TableCell>{c.entregas}</TableCell>
                        <TableCell>R$ {c.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          {c.bonus > 0 ? <Badge variant="default">+ R$ {c.bonus}</Badge> : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="font-bold">R$ {c.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
