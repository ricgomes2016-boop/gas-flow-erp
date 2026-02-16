import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Gift, Plus, DollarSign, Users, Target } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const tipoLabel: Record<string, string> = {
  meta_vendas: "Meta Vendas",
  indicacao: "Indicação Cliente",
  aniversario: "Aniversário Empresa",
  pontualidade: "Pontualidade",
};

export default function Bonus() {
  const queryClient = useQueryClient();

  const { data: bonusList = [], isLoading } = useQuery({
    queryKey: ["bonus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bonus")
        .select("*, funcionarios(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const pagarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bonus").update({ status: "pago" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonus"] });
      toast.success("Bônus marcado como pago");
    },
  });

  const totalPago = bonusList.filter((b: any) => b.status === "pago").reduce((acc: number, b: any) => acc + Number(b.valor), 0);
  const totalPendente = bonusList.filter((b: any) => b.status === "pendente").reduce((acc: number, b: any) => acc + Number(b.valor), 0);

  return (
    <MainLayout>
      <Header title="Bônus" subtitle="Gestão de bonificações extras" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button className="gap-2"><Plus className="h-4 w-4" />Novo Bônus</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bônus (Mês)</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(totalPago + totalPendente).toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pagos</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">R$ {totalPago.toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Target className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">R$ {totalPendente.toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Beneficiados</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{bonusList.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Lista de Bônus</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : bonusList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum bônus cadastrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Mês Ref.</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonusList.map((bonus: any) => (
                    <TableRow key={bonus.id}>
                      <TableCell className="font-medium">{bonus.funcionarios?.nome || "N/A"}</TableCell>
                      <TableCell><Badge variant="outline">{tipoLabel[bonus.tipo] || bonus.tipo}</Badge></TableCell>
                      <TableCell>{bonus.mes_referencia || "-"}</TableCell>
                      <TableCell className="font-medium">R$ {Number(bonus.valor).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge variant={bonus.status === "pago" ? "default" : "secondary"}>
                          {bonus.status === "pago" ? "Pago" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {bonus.status === "pendente" && (
                          <Button size="sm" onClick={() => pagarMutation.mutate(bonus.id)}>Pagar</Button>
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
