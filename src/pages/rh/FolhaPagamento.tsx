import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { DollarSign, Users, Download, Calendar, Printer, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUnidade } from "@/contexts/UnidadeContext";
import { generateFolhaRecibo } from "@/services/receiptRhService";
import { toast } from "sonner";
import { useState, useMemo } from "react";

// Normalize string for fuzzy name matching (remove accents, lowercase, trim)
function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export default function FolhaPagamento() {
  const now = new Date();
  const mesAtual = format(now, "MMMM yyyy", { locale: ptBR });
  const mesInicio = startOfMonth(now).toISOString();
  const mesFim = endOfMonth(now).toISOString();
  const { unidadeAtual } = useUnidade();

  // Editable discounts per employee: { [funcId]: { inss, ir, outros } }
  const [descontosEdit, setDescontosEdit] = useState<Record<string, { inss: string; ir: string; outros: string }>>({});

  const { data: empresaConfig } = useQuery({
    queryKey: ["empresa-config"],
    queryFn: async () => {
      const { data } = await supabase.from("configuracoes_empresa").select("*").limit(1).single();
      return data;
    },
  });

  // Fetch active employees
  const { data: funcionarios = [], isLoading } = useQuery({
    queryKey: ["folha-pagamento", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase.from("funcionarios").select("*").eq("ativo", true).order("nome");
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch entregadores for name matching
  const { data: entregadores = [] } = useQuery({
    queryKey: ["folha-entregadores", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase.from("entregadores").select("id, nome").eq("ativo", true);
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data } = await query;
      return data || [];
    },
  });

  // Fetch banco de horas
  const { data: bancoHoras = [] } = useQuery({
    queryKey: ["folha-banco-horas", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase.from("banco_horas").select("funcionario_id, saldo_positivo");
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data } = await query;
      return data || [];
    },
  });

  // Fetch vales pendentes do mês
  const { data: valesMes = [] } = useQuery({
    queryKey: ["folha-vales", unidadeAtual?.id, format(now, "yyyy-MM")],
    queryFn: async () => {
      let query = supabase
        .from("vales_funcionario")
        .select("funcionario_id, valor, tipo")
        .eq("status", "pendente")
        .gte("data", format(startOfMonth(now), "yyyy-MM-dd"))
        .lte("data", format(endOfMonth(now), "yyyy-MM-dd"));
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data } = await query;
      return data || [];
    },
  });

  // Fetch comissão config
  const { data: comissaoConfig = [] } = useQuery({
    queryKey: ["folha-comissao-config", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase.from("comissao_config").select("produto_id, canal_venda, valor");
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data } = await query;
      return data || [];
    },
  });

  // Fetch pedidos entregues do mês com itens para calcular comissões
  const { data: pedidosMes = [] } = useQuery({
    queryKey: ["folha-pedidos-comissao", unidadeAtual?.id, format(now, "yyyy-MM")],
    queryFn: async () => {
      let query = supabase
        .from("pedidos")
        .select("id, entregador_id, canal_venda")
        .eq("status", "entregue")
        .not("entregador_id", "is", null)
        .gte("created_at", mesInicio)
        .lte("created_at", mesFim);
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data } = await query;
      return data || [];
    },
  });

  const { data: itensMes = [] } = useQuery({
    queryKey: ["folha-itens-comissao", pedidosMes.map((p: any) => p.id).join(",")],
    enabled: pedidosMes.length > 0,
    queryFn: async () => {
      const ids = pedidosMes.map((p: any) => p.id);
      if (ids.length === 0) return [];
      const { data } = await supabase
        .from("pedido_itens")
        .select("pedido_id, produto_id, quantidade")
        .in("pedido_id", ids);
      return data || [];
    },
  });

  // Build comissão map
  const comissaoMap = useMemo(() => {
    const map = new Map<string, number>();
    comissaoConfig.forEach((c: any) => map.set(`${c.produto_id}|${c.canal_venda}`, Number(c.valor)));
    return map;
  }, [comissaoConfig]);

  // Build pedido lookup
  const pedidoMap = useMemo(() => {
    const map = new Map<string, any>();
    pedidosMes.forEach((p: any) => map.set(p.id, p));
    return map;
  }, [pedidosMes]);

  // Calculate comissão per entregador_id
  const comissaoPorEntregador = useMemo(() => {
    const totals = new Map<string, number>();
    itensMes.forEach((item: any) => {
      const pedido = pedidoMap.get(item.pedido_id);
      if (!pedido) return;
      const canal = pedido.canal_venda || "balcao";
      const comUnit = comissaoMap.get(`${item.produto_id}|${canal}`) ?? 0;
      const total = (item.quantidade || 1) * comUnit;
      totals.set(pedido.entregador_id, (totals.get(pedido.entregador_id) || 0) + total);
    });
    return totals;
  }, [itensMes, pedidoMap, comissaoMap]);

  // Match funcionario → entregador by normalized name
  const funcToEntregadorId = useMemo(() => {
    const map = new Map<string, string>();
    funcionarios.forEach((f: any) => {
      const match = entregadores.find((e: any) => normalize(e.nome) === normalize(f.nome));
      if (match) map.set(f.id, match.id);
    });
    return map;
  }, [funcionarios, entregadores]);

  // Aggregate vales per funcionario
  const valesPorFunc = useMemo(() => {
    const map = new Map<string, number>();
    valesMes.forEach((v: any) => {
      map.set(v.funcionario_id, (map.get(v.funcionario_id) || 0) + Number(v.valor));
    });
    return map;
  }, [valesMes]);

  // Build enriched data
  const dadosFolha = useMemo(() => {
    return funcionarios.map((f: any) => {
      const salarioBase = Number(f.salario) || 0;

      // Horas extras from banco de horas
      const bh = bancoHoras.find((b: any) => b.funcionario_id === f.id);
      const horasExtras = bh ? Math.round(Number(bh.saldo_positivo) * 15) : 0;

      // Comissão
      const entId = funcToEntregadorId.get(f.id);
      const comissao = entId ? (comissaoPorEntregador.get(entId) || 0) : 0;

      // Vales to deduct
      const valesDesconto = valesPorFunc.get(f.id) || 0;

      // Editable discounts
      const edit = descontosEdit[f.id] || { inss: "", ir: "", outros: "" };
      const inss = edit.inss !== "" ? parseFloat(edit.inss) || 0 : Math.round(salarioBase * 0.11);
      const ir = edit.ir !== "" ? parseFloat(edit.ir) || 0 : 0;
      const outros = edit.outros !== "" ? parseFloat(edit.outros) || 0 : 0;

      const bruto = salarioBase + horasExtras + comissao;
      const totalDescontos = inss + ir + outros + valesDesconto;
      const liquido = bruto - totalDescontos;

      return {
        id: f.id,
        funcionario: f.nome,
        cargo: f.cargo || "N/A",
        salarioBase,
        horasExtras,
        comissao,
        valesDesconto,
        inss,
        ir,
        outros,
        bruto,
        totalDescontos,
        liquido,
      };
    });
  }, [funcionarios, bancoHoras, funcToEntregadorId, comissaoPorEntregador, valesPorFunc, descontosEdit]);

  const totalBruto = dadosFolha.reduce((acc, f) => acc + f.bruto, 0);
  const totalDescontos = dadosFolha.reduce((acc, f) => acc + f.totalDescontos, 0);
  const totalLiquido = dadosFolha.reduce((acc, f) => acc + f.liquido, 0);
  const totalComissoes = dadosFolha.reduce((acc, f) => acc + f.comissao, 0);

  const updateDesconto = (funcId: string, field: "inss" | "ir" | "outros", value: string) => {
    setDescontosEdit(prev => ({
      ...prev,
      [funcId]: { ...(prev[funcId] || { inss: "", ir: "", outros: "" }), [field]: value },
    }));
  };

  const handlePrintRecibo = (func: typeof dadosFolha[0]) => {
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
      descontos: func.totalDescontos,
      liquido: func.liquido,
    });
    toast.success("Recibo gerado com sucesso!");
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <MainLayout>
      <Header title="Folha de Pagamento" subtitle="Gestão de salários, comissões e descontos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button className="gap-2"><Download className="h-4 w-4" />Exportar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bruto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {fmt(totalBruto)}</div>
              <p className="text-xs text-muted-foreground">Salários + extras + comissões</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">R$ {fmt(totalComissoes)}</div>
              <p className="text-xs text-muted-foreground">Do mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Descontos</CardTitle>
              <DollarSign className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">R$ {fmt(totalDescontos)}</div>
              <p className="text-xs text-muted-foreground">INSS + IR + Vales + Outros</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">R$ {fmt(totalLiquido)}</div>
              <p className="text-xs text-muted-foreground">A pagar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dadosFolha.length}</div>
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
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : dadosFolha.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum funcionário ativo cadastrado</p>
            ) : (
              <div className="overflow-x-auto">
                <TooltipProvider>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead className="text-right">Salário</TableHead>
                        <TableHead className="text-right">H. Extras</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                        <TableHead className="text-right">Bruto</TableHead>
                        <TableHead className="text-right">
                          <span className="flex items-center justify-end gap-1">
                            INSS
                            <Tooltip>
                              <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent>Editável. Padrão: 11% do salário</TooltipContent>
                            </Tooltip>
                          </span>
                        </TableHead>
                        <TableHead className="text-right">IR</TableHead>
                        <TableHead className="text-right">Vales</TableHead>
                        <TableHead className="text-right">Outros</TableHead>
                        <TableHead className="text-right font-bold">Líquido</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dadosFolha.map((func) => (
                        <TableRow key={func.id}>
                          <TableCell className="font-medium">{func.funcionario}</TableCell>
                          <TableCell>{func.cargo}</TableCell>
                          <TableCell className="text-right">R$ {fmt(func.salarioBase)}</TableCell>
                          <TableCell className="text-right text-success">
                            {func.horasExtras > 0 ? `+ R$ ${fmt(func.horasExtras)}` : "-"}
                          </TableCell>
                          <TableCell className="text-right text-success">
                            {func.comissao > 0 ? `+ R$ ${fmt(func.comissao)}` : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium">R$ {fmt(func.bruto)}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              className="w-20 h-7 text-xs text-right ml-auto"
                              placeholder={String(Math.round(func.salarioBase * 0.11))}
                              value={descontosEdit[func.id]?.inss ?? ""}
                              onChange={e => updateDesconto(func.id, "inss", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              className="w-20 h-7 text-xs text-right ml-auto"
                              placeholder="0"
                              value={descontosEdit[func.id]?.ir ?? ""}
                              onChange={e => updateDesconto(func.id, "ir", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            {func.valesDesconto > 0 ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="cursor-help underline decoration-dotted">- R$ {fmt(func.valesDesconto)}</span>
                                </TooltipTrigger>
                                <TooltipContent>Vales/adiantamentos pendentes do mês</TooltipContent>
                              </Tooltip>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              className="w-20 h-7 text-xs text-right ml-auto"
                              placeholder="0"
                              value={descontosEdit[func.id]?.outros ?? ""}
                              onChange={e => updateDesconto(func.id, "outros", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            R$ {fmt(func.liquido)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => handlePrintRecibo(func)}>
                              <Printer className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right">R$ {fmt(dadosFolha.reduce((a, f) => a + f.salarioBase, 0))}</TableCell>
                        <TableCell className="text-right text-success">R$ {fmt(dadosFolha.reduce((a, f) => a + f.horasExtras, 0))}</TableCell>
                        <TableCell className="text-right text-success">R$ {fmt(totalComissoes)}</TableCell>
                        <TableCell className="text-right">R$ {fmt(totalBruto)}</TableCell>
                        <TableCell className="text-right text-destructive">R$ {fmt(dadosFolha.reduce((a, f) => a + f.inss, 0))}</TableCell>
                        <TableCell className="text-right text-destructive">R$ {fmt(dadosFolha.reduce((a, f) => a + f.ir, 0))}</TableCell>
                        <TableCell className="text-right text-destructive">R$ {fmt(dadosFolha.reduce((a, f) => a + f.valesDesconto, 0))}</TableCell>
                        <TableCell className="text-right text-destructive">R$ {fmt(dadosFolha.reduce((a, f) => a + f.outros, 0))}</TableCell>
                        <TableCell className="text-right text-primary">R$ {fmt(totalLiquido)}</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TooltipProvider>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}