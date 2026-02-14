import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Link2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { toast } from "sonner";

export default function Conciliacao() {
  const { unidadeAtual } = useUnidade();
  const queryClient = useQueryClient();

  const { data: extrato = [], isLoading } = useQuery({
    queryKey: ["extrato_bancario", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase
        .from("extrato_bancario")
        .select("*")
        .order("data", { ascending: false });

      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const conciliarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("extrato_bancario")
        .update({ conciliado: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extrato_bancario"] });
      toast.success("Lançamento conciliado com sucesso!");
    },
  });

  const conciliados = extrato.filter((e: any) => e.conciliado).length;
  const pendentes = extrato.filter((e: any) => !e.conciliado).length;
  const saldoExtrato = extrato.reduce((acc: number, e: any) => acc + Number(e.valor), 0);

  return (
    <MainLayout>
      <Header title="Conciliação Bancária" subtitle="Importe e concilie extratos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Conciliação Bancária</h1>
            <p className="text-muted-foreground">Importe e concilie extratos OFX/CSV</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar OFX
            </Button>
            <Button variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Importar CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lançamentos</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{extrato.length}</div>
              <p className="text-xs text-muted-foreground">Total importados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conciliados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{conciliados}</div>
              <p className="text-xs text-muted-foreground">
                {extrato.length > 0 ? `${Math.round(conciliados / extrato.length * 100)}% do total` : "0%"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendentes}</div>
              <p className="text-xs text-muted-foreground">Aguardando vínculo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo Extrato</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {saldoExtrato.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Saldo calculado</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Extrato Importado</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Carregando...</p>
            ) : extrato.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum lançamento importado ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extrato.map((lancamento: any) => (
                    <TableRow key={lancamento.id}>
                      <TableCell>{new Date(lancamento.data).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="font-medium">{lancamento.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={lancamento.tipo === "credito" ? "default" : "secondary"}>
                          {lancamento.tipo === "credito" ? "Crédito" : "Débito"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${Number(lancamento.valor) > 0 ? "text-green-600" : "text-red-600"}`}>
                        R$ {Math.abs(Number(lancamento.valor)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={lancamento.conciliado ? "default" : "secondary"}>
                          {lancamento.conciliado ? "Conciliado" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!lancamento.conciliado && (
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => conciliarMutation.mutate(lancamento.id)}
                            disabled={conciliarMutation.isPending}
                          >
                            <Link2 className="h-3 w-3" />
                            Vincular
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
