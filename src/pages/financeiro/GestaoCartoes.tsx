import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CreditCard, DollarSign, Clock, CheckCircle2, AlertCircle,
  TrendingDown, Calendar, Settings, RefreshCw, Banknote, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format, addDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getBrasiliaDateString } from "@/lib/utils";
import { ConferenciaCartao } from "@/components/financeiro/ConferenciaCartao";
import { criarMovimentacaoBancaria } from "@/services/paymentRoutingService";

interface RecebiveisCartao {
  id: string;
  cliente: string;
  descricao: string;
  valor: number;
  valor_taxa: number;
  valor_liquido: number | null;
  taxa_percentual: number;
  vencimento: string;
  status: string;
  forma_pagamento: string | null;
  operadora_id: string | null;
  operadora_nome?: string;
  pedido_id: string | null;
  parcela_atual: number;
  total_parcelas: number;
}

export default function GestaoCartoes() {
  const { unidadeAtual } = useUnidade();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recebiveis, setRecebiveis] = useState<RecebiveisCartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"7dias" | "30dias" | "60dias">("30dias");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [liquidandoLote, setLiquidandoLote] = useState(false);
  const hoje = getBrasiliaDateString();

  const fetchRecebiveis = async () => {
    setLoading(true);
    const formas = ["cartao_debito", "cartao_credito", "credito", "debito", "pix_maquininha"];
    let query = supabase
      .from("contas_receber")
      .select("*, operadoras_cartao(nome)")
      .in("forma_pagamento", formas)
      .order("vencimento", { ascending: true });
    if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
    const { data, error } = await query;
    if (error) { console.error(error); toast.error("Erro ao carregar recebíveis"); }
    else {
      setRecebiveis((data || []).map((d: any) => ({
        ...d,
        operadora_nome: d.operadoras_cartao?.nome || "—",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchRecebiveis(); }, [unidadeAtual]);

  // KPIs
  const pendentes = recebiveis.filter(r => r.status === "pendente");
  const recebidos = recebiveis.filter(r => r.status === "recebida");
  const totalBruto = pendentes.reduce((s, r) => s + Number(r.valor), 0);
  const totalTaxas = pendentes.reduce((s, r) => s + Number(r.valor_taxa || 0), 0);
  const totalLiquido = totalBruto - totalTaxas;
  const totalRecebido = recebidos.reduce((s, r) => s + Number(r.valor_liquido || r.valor), 0);

  // Agenda de recebimentos (próximos dias)
  const daysAhead = periodo === "7dias" ? 7 : periodo === "30dias" ? 30 : 60;
  const limiteData = format(addDays(new Date(), daysAhead), "yyyy-MM-dd");
  const agendaRecebiveis = pendentes.filter(r => r.vencimento >= hoje && r.vencimento <= limiteData);
  const vencidos = pendentes.filter(r => r.vencimento < hoje);

  // Agrupamento por data de vencimento para agenda
  const agendaAgrupada = useMemo(() => {
    const grupos: Record<string, RecebiveisCartao[]> = {};
    agendaRecebiveis.forEach(r => {
      if (!grupos[r.vencimento]) grupos[r.vencimento] = [];
      grupos[r.vencimento].push(r);
    });
    return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b));
  }, [agendaRecebiveis]);

  // Recebimento automático - liquidar e enviar para conta bancária
  const handleLiquidar = async (recebivel: RecebiveisCartao) => {
    const valorLiq = Number(recebivel.valor_liquido || recebivel.valor) - Number(recebivel.valor_taxa || 0);
    const { error } = await supabase.from("contas_receber")
      .update({ status: "recebida", valor_liquido: valorLiq })
      .eq("id", recebivel.id);
    if (error) { toast.error("Erro ao liquidar"); return; }

    // Creditar na conta bancária principal
    try {
      const { data: conta } = await supabase.from("contas_bancarias")
        .select("id").eq("ativo", true)
        .eq("unidade_id", unidadeAtual?.id || "")
        .limit(1).maybeSingle();
      if (conta) {
        const { data: { user } } = await supabase.auth.getUser();
        await criarMovimentacaoBancaria({
          contaBancariaId: conta.id,
          valor: valorLiq > 0 ? valorLiq : Number(recebivel.valor),
          descricao: `Liquidação Cartão: ${recebivel.descricao}`,
          categoria: "liquidacao_cartao",
          unidadeId: unidadeAtual?.id,
          userId: user?.id,
          pedidoId: recebivel.pedido_id || undefined,
        });
      }
    } catch (e) { console.error(e); }
    toast.success("Recebível liquidado e creditado no banco!");
    fetchRecebiveis();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const visible = pendentes.slice(0, 50);
    if (selectedIds.size === visible.length && visible.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visible.map(r => r.id)));
    }
  };

  const handleLiquidarLote = async () => {
    if (selectedIds.size === 0) return;
    setLiquidandoLote(true);
    let ok = 0;
    let fail = 0;
    for (const id of selectedIds) {
      const rec = recebiveis.find(r => r.id === id);
      if (!rec) { fail++; continue; }
      try {
        await handleLiquidar(rec);
        ok++;
      } catch {
        fail++;
      }
    }
    setSelectedIds(new Set());
    setLiquidandoLote(false);
  };

  const getFormaLabel = (f: string | null) => {
    if (!f) return "—";
    const map: Record<string, string> = {
      cartao_debito: "Débito", debito: "Débito",
      cartao_credito: "Crédito", credito: "Crédito",
      pix_maquininha: "PIX Maq.",
    };
    return map[f] || f;
  };

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <MainLayout>
      <Header title="Gestão de Cartões" subtitle="Recebíveis de cartão, conciliação e operadoras" />
      <div className="p-3 sm:p-4 md:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="gap-1.5">
              <CreditCard className="h-4 w-4" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="agenda" className="gap-1.5">
              <Calendar className="h-4 w-4" />Agenda
            </TabsTrigger>
            <TabsTrigger value="conferencia" className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" />Conciliação
            </TabsTrigger>
            <TabsTrigger value="operadoras" className="gap-1.5">
              <Settings className="h-4 w-4" />Operadoras
            </TabsTrigger>
          </TabsList>

          {/* === DASHBOARD === */}
          <TabsContent value="dashboard" className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">A Receber (Bruto)</CardTitle></CardHeader>
                <CardContent><p className="text-xl font-bold text-primary">{fmt(totalBruto)}</p>
                  <p className="text-xs text-muted-foreground">{pendentes.length} título(s)</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">Taxas Previstas</CardTitle></CardHeader>
                <CardContent><p className="text-xl font-bold text-destructive">{fmt(totalTaxas)}</p>
                  <p className="text-xs text-muted-foreground">Desconto operadora</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">Líquido Previsto</CardTitle></CardHeader>
                <CardContent><p className="text-xl font-bold text-success">{fmt(totalLiquido)}</p>
                  <p className="text-xs text-muted-foreground">Após taxas</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">Já Recebido</CardTitle></CardHeader>
                <CardContent><p className="text-xl font-bold">{fmt(totalRecebido)}</p>
                  <p className="text-xs text-muted-foreground">{recebidos.length} liquidado(s)</p></CardContent>
              </Card>
              <Card className={vencidos.length > 0 ? "border-destructive/50" : ""}>
                <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">Vencidos</CardTitle></CardHeader>
                <CardContent><p className="text-xl font-bold text-destructive">{vencidos.length}</p>
                  <p className="text-xs text-muted-foreground">{fmt(vencidos.reduce((s, r) => s + Number(r.valor), 0))}</p></CardContent>
              </Card>
            </div>

            {/* Tabela de recebíveis pendentes */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">Recebíveis Pendentes</CardTitle>
                  <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                      <Button
                        size="sm"
                        onClick={handleLiquidarLote}
                        disabled={liquidandoLote}
                        className="gap-1.5"
                      >
                        {liquidandoLote ? <Loader2 className="h-3 w-3 animate-spin" /> : <Banknote className="h-3 w-3" />}
                        Liquidar {selectedIds.size} selecionado(s)
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={fetchRecebiveis}><RefreshCw className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? <p className="text-center py-6 text-muted-foreground">Carregando...</p> :
                  pendentes.length === 0 ? <p className="text-center py-6 text-muted-foreground">Nenhum recebível de cartão pendente</p> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox
                                checked={selectedIds.size === pendentes.slice(0, 50).length && pendentes.length > 0}
                                onCheckedChange={toggleSelectAll}
                              />
                            </TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Operadora</TableHead>
                            <TableHead className="hidden md:table-cell">Descrição</TableHead>
                            <TableHead>Bruto</TableHead>
                            <TableHead className="hidden sm:table-cell">Taxa</TableHead>
                            <TableHead>Líquido</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendentes.slice(0, 50).map(r => {
                            const liq = Number(r.valor) - Number(r.valor_taxa || 0);
                            const vencido = r.vencimento < hoje;
                            return (
                              <TableRow key={r.id} className={vencido ? "bg-destructive/5" : ""}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedIds.has(r.id)}
                                    onCheckedChange={() => toggleSelect(r.id)}
                                  />
                                </TableCell>
                                <TableCell><Badge variant="outline" className="text-xs">{getFormaLabel(r.forma_pagamento)}</Badge></TableCell>
                                <TableCell className="text-sm">{r.operadora_nome}</TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.descricao}</TableCell>
                                <TableCell className="font-medium">{fmt(Number(r.valor))}</TableCell>
                                <TableCell className="hidden sm:table-cell text-destructive text-sm">
                                  {Number(r.taxa_percentual || 0) > 0 ? `${Number(r.taxa_percentual).toFixed(1)}%` : "—"}
                                </TableCell>
                                <TableCell className="font-bold text-success">{fmt(liq)}</TableCell>
                                <TableCell className={`text-sm ${vencido ? "text-destructive font-medium" : ""}`}>
                                  {format(new Date(r.vencimento + "T12:00:00"), "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button size="sm" variant="outline" onClick={() => handleLiquidar(r)}>
                                    <Banknote className="h-3 w-3 mr-1" />Liquidar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === AGENDA DE RECEBIMENTOS === */}
          <TabsContent value="agenda" className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7dias">Próximos 7 dias</SelectItem>
                  <SelectItem value="30dias">Próximos 30 dias</SelectItem>
                  <SelectItem value="60dias">Próximos 60 dias</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {agendaRecebiveis.length} recebível(is) — {fmt(agendaRecebiveis.reduce((s, r) => s + Number(r.valor), 0))}
              </span>
            </div>

            {vencidos.length > 0 && (
              <Card className="border-destructive/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {vencidos.length} recebível(is) vencido(s) — {fmt(vencidos.reduce((s, r) => s + Number(r.valor), 0))}
                  </CardTitle>
                </CardHeader>
              </Card>
            )}

            {agendaAgrupada.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum recebimento previsto neste período</p>
            ) : (
              <div className="space-y-3">
                {agendaAgrupada.map(([data, itens]) => {
                  const totalDia = itens.reduce((s, r) => s + Number(r.valor), 0);
                  const isHoje = data === hoje;
                  return (
                    <Card key={data} className={isHoje ? "border-primary/50 bg-primary/5" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {isHoje ? "Hoje" : format(new Date(data + "T12:00:00"), "EEEE, dd/MM", { locale: ptBR })}
                          </CardTitle>
                          <Badge variant={isHoje ? "default" : "secondary"}>{fmt(totalDia)}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-1">
                          {itens.map(r => (
                            <div key={r.id} className="flex items-center justify-between py-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{getFormaLabel(r.forma_pagamento)}</Badge>
                                <span className="text-muted-foreground">{r.operadora_nome}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{fmt(Number(r.valor))}</span>
                                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => handleLiquidar(r)}>
                                  Liquidar
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* === CONCILIAÇÃO (reusa componente existente) === */}
          <TabsContent value="conferencia">
            <ConferenciaCartao />
          </TabsContent>

          {/* === OPERADORAS (reusa aba do componente existente) === */}
          <TabsContent value="operadoras">
            <ConferenciaCartao />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
