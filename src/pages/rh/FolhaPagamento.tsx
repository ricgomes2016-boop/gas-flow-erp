import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DollarSign, Users, Download, Calendar, Calculator, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUnidade } from "@/contexts/UnidadeContext";
import { generateFolhaRecibo, type FolhaReciboData } from "@/services/receiptRhService";
import { toast } from "sonner";

export default function FolhaPagamento() {
  const mesAtual = format(new Date(), "MMMM yyyy", { locale: ptBR });
  const { unidadeAtual } = useUnidade();

  const { data: empresaConfig } = useQuery({
    queryKey: ["empresa-config"],
    queryFn: async () => {
      const { data } = await supabase.from("configuracoes_empresa").select("*").limit(1).single();
      return data;
    },
  });

  const { data: funcionarios = [], isLoading } = useQuery({
    queryKey: ["folha-pagamento", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase
        .from("funcionarios")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((f) => ({
        id: f.id,
        funcionario: f.nome,
        cargo: f.cargo || "N/A",
        salarioBase: Number(f.salario) || 0,
        horasExtras: 0,
        descontos: Math.round((Number(f.salario) || 0) * 0.11),
        get liquido() { return this.salarioBase + this.horasExtras - this.descontos; },
      }));
    },
  });

  // Buscar banco de horas para agregar horas extras
  const { data: bancoHoras = [] } = useQuery({
    queryKey: ["folha-banco-horas", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase.from("banco_horas").select("funcionario_id, saldo_positivo");
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data } = await query;
      return data || [];
    },
  });

  // Enriquecer com horas extras do banco de horas
  const funcionariosComExtras = funcionarios.map((f) => {
    const bh = bancoHoras.find((b: any) => b.funcionario_id === f.id);
    const horasExtras = bh ? Math.round(Number(bh.saldo_positivo) * 15) : 0; // R$15/h extra estimado
    return {
      ...f,
      horasExtras,
      get liquido() { return this.salarioBase + this.horasExtras - this.descontos; },
    };
  });

  const totalBruto = funcionariosComExtras.reduce((acc, f) => acc + f.salarioBase + f.horasExtras, 0);
  const totalDescontos = funcionariosComExtras.reduce((acc, f) => acc + f.descontos, 0);
  const totalLiquido = funcionariosComExtras.reduce((acc, f) => acc + f.liquido, 0);

  const handlePrintRecibo = (func: typeof funcionariosComExtras[0]) => {
    if (!empresaConfig) {
      toast.error("Configure os dados da empresa primeiro");
      return;
    }
    generateFolhaRecibo({
      empresa: {
        nome_empresa: empresaConfig.nome_empresa,
        cnpj: empresaConfig.cnpj,
        telefone: empresaConfig.telefone,
        endereco: empresaConfig.endereco,
      },
      funcionario: func.funcionario,
      cargo: func.cargo,
      mesReferencia: mesAtual,
      salarioBase: func.salarioBase,
      horasExtras: func.horasExtras,
      descontos: func.descontos,
      liquido: func.liquido,
    });
    toast.success("Recibo gerado com sucesso!");
  };

  return (
    <MainLayout>
      <Header title="Folha de Pagamento" subtitle="Gestão de salários e encargos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Calculator className="h-4 w-4" />Calcular Folha</Button>
            <Button className="gap-2"><Download className="h-4 w-4" />Exportar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bruto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalBruto.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">Salários + extras</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Descontos</CardTitle>
              <DollarSign className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">R$ {totalDescontos.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">INSS, IR, etc</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">R$ {totalLiquido.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">A pagar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{funcionariosComExtras.length}</div>
              <p className="text-xs text-muted-foreground">Na folha</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <CardTitle>Folha de {mesAtual}</CardTitle>
              </div>
              <Badge>Em aberto</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : funcionariosComExtras.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum funcionário ativo cadastrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Salário Base</TableHead>
                    <TableHead>Horas Extras</TableHead>
                    <TableHead>Descontos</TableHead>
                    <TableHead>Líquido</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionariosComExtras.map((func) => (
                    <TableRow key={func.id}>
                      <TableCell className="font-medium">{func.funcionario}</TableCell>
                      <TableCell>{func.cargo}</TableCell>
                      <TableCell>R$ {func.salarioBase.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-success">+ R$ {func.horasExtras.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-destructive">- R$ {func.descontos.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="font-bold">R$ {func.liquido.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => handlePrintRecibo(func)}>
                          <Printer className="h-3 w-3" />
                          Recibo
                        </Button>
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
