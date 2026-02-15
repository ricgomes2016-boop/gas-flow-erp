import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Plus, ShoppingCart, Package, CreditCard, CalendarIcon, DoorOpen, DoorClosed, FileDown, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Mov {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  categoria: string | null;
  created_at: string;
}

interface PedidoResumo {
  id: string;
  valor_total: number;
  forma_pagamento: string | null;
  status: string | null;
  created_at: string;
}

interface ProdutoVendido {
  nome: string;
  quantidade: number;
  total: number;
}

interface FormaPagamentoResumo {
  forma: string;
  quantidade: number;
  total: number;
}

interface CaixaSessao {
  id: string;
  valor_abertura: number;
  valor_fechamento: number | null;
  diferenca: number | null;
  status: string;
  observacoes_abertura: string | null;
  observacoes_fechamento: string | null;
  aberto_em: string;
  fechado_em: string | null;
}

export default function CaixaDia() {
  const [movs, setMovs] = useState<Mov[]>([]);
  const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);
  const [produtosVendidos, setProdutosVendidos] = useState<ProdutoVendido[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoResumo[]>([]);
  const [sessao, setSessao] = useState<CaixaSessao | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aberturaOpen, setAberturaOpen] = useState(false);
  const [fechamentoOpen, setFechamentoOpen] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const { unidadeAtual } = useUnidade();
  const { user } = useAuth();
  const [form, setForm] = useState({ tipo: "entrada", descricao: "", valor: "", categoria: "" });
  const [aberturaForm, setAberturaForm] = useState({ valor: "", obs: "" });
  const [fechamentoForm, setFechamentoForm] = useState({ valor: "", obs: "" });

  const fetchData = async () => {
    setLoading(true);
    const inicio = startOfDay(dataSelecionada).toISOString();
    const fim = endOfDay(dataSelecionada).toISOString();
    const dataStr = format(dataSelecionada, "yyyy-MM-dd");

    // Fetch movimentações, pedidos and sessão in parallel
    let qMov = supabase.from("movimentacoes_caixa").select("*").gte("created_at", inicio).lte("created_at", fim).order("created_at", { ascending: false });
    if (unidadeAtual?.id) qMov = qMov.eq("unidade_id", unidadeAtual.id);

    let qPed = supabase.from("pedidos").select("id, valor_total, forma_pagamento, status, created_at").gte("created_at", inicio).lte("created_at", fim);
    if (unidadeAtual?.id) qPed = qPed.eq("unidade_id", unidadeAtual.id);

    let qSes = supabase.from("caixa_sessoes").select("*").eq("data", dataStr).order("created_at", { ascending: false }).limit(1);
    if (unidadeAtual?.id) qSes = qSes.eq("unidade_id", unidadeAtual.id);

    const [resMov, resPed, resSes] = await Promise.all([qMov, qPed, qSes]);

    if (resMov.error) console.error(resMov.error);
    else setMovs((resMov.data as Mov[]) || []);

    if (resSes.error) console.error(resSes.error);
    else setSessao((resSes.data as CaixaSessao[])?.[0] || null);

    if (resPed.error) console.error(resPed.error);
    else {
      const pedidosData = (resPed.data as PedidoResumo[]) || [];
      setPedidos(pedidosData);

      const fpMap = new Map<string, { quantidade: number; total: number }>();
      pedidosData.forEach(p => {
        const fp = p.forma_pagamento || "Não informado";
        const existing = fpMap.get(fp) || { quantidade: 0, total: 0 };
        fpMap.set(fp, { quantidade: existing.quantidade + 1, total: existing.total + Number(p.valor_total || 0) });
      });
      setFormasPagamento(Array.from(fpMap.entries()).map(([forma, v]) => ({ forma, ...v })).sort((a, b) => b.total - a.total));

      if (pedidosData.length > 0) {
        const pedidoIds = pedidosData.map(p => p.id);
        const { data: itens, error: itensErr } = await supabase
          .from("pedido_itens")
          .select("quantidade, preco_unitario, produto_id, produtos(nome)")
          .in("pedido_id", pedidoIds);

        if (itensErr) console.error(itensErr);
        else {
          const prodMap = new Map<string, { quantidade: number; total: number }>();
          (itens || []).forEach((item: any) => {
            const nome = item.produtos?.nome || "Produto removido";
            const existing = prodMap.get(nome) || { quantidade: 0, total: 0 };
            prodMap.set(nome, {
              quantidade: existing.quantidade + item.quantidade,
              total: existing.total + (item.quantidade * Number(item.preco_unitario)),
            });
          });
          setProdutosVendidos(Array.from(prodMap.entries()).map(([nome, v]) => ({ nome, ...v })).sort((a, b) => b.quantidade - a.quantidade));
        }
      } else {
        setProdutosVendidos([]);
      }
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [unidadeAtual, dataSelecionada]);

  const handleSubmit = async () => {
    if (!form.descricao || !form.valor) { toast.error("Preencha os campos"); return; }
    const { error } = await supabase.from("movimentacoes_caixa").insert({
      tipo: form.tipo, descricao: form.descricao,
      valor: parseFloat(form.valor), categoria: form.categoria || null,
      unidade_id: unidadeAtual?.id || null,
    });
    if (error) { toast.error("Erro ao registrar"); console.error(error); }
    else { toast.success("Registrado!"); setDialogOpen(false); setForm({ tipo: "entrada", descricao: "", valor: "", categoria: "" }); fetchData(); }
  };

  const handleAbrirCaixa = async () => {
    if (!aberturaForm.valor) { toast.error("Informe o valor de abertura"); return; }
    const { error } = await supabase.from("caixa_sessoes").insert({
      valor_abertura: parseFloat(aberturaForm.valor),
      observacoes_abertura: aberturaForm.obs || null,
      unidade_id: unidadeAtual?.id || null,
      usuario_abertura_id: user?.id,
      data: format(dataSelecionada, "yyyy-MM-dd"),
    });
    if (error) { toast.error("Erro ao abrir caixa"); console.error(error); }
    else { toast.success("Caixa aberto!"); setAberturaOpen(false); setAberturaForm({ valor: "", obs: "" }); fetchData(); }
  };

  const handleFecharCaixa = async () => {
    if (!fechamentoForm.valor || !sessao) { toast.error("Informe o valor de fechamento"); return; }
    const valorFechamento = parseFloat(fechamentoForm.valor);
    const esperado = sessao.valor_abertura + saldo;
    const diferenca = valorFechamento - esperado;

    const { error } = await supabase.from("caixa_sessoes").update({
      valor_fechamento: valorFechamento,
      diferenca,
      observacoes_fechamento: fechamentoForm.obs || null,
      status: "fechado",
      fechado_em: new Date().toISOString(),
      usuario_fechamento_id: user?.id,
    }).eq("id", sessao.id);

    if (error) { toast.error("Erro ao fechar caixa"); console.error(error); }
    else { toast.success("Caixa fechado!"); setFechamentoOpen(false); setFechamentoForm({ valor: "", obs: "" }); fetchData(); }
  };

  const totalEntradas = movs.filter(m => m.tipo === "entrada").reduce((a, m) => a + Number(m.valor), 0);
  const totalSaidas = movs.filter(m => m.tipo === "saida").reduce((a, m) => a + Number(m.valor), 0);
  const saldo = totalEntradas - totalSaidas;
  const totalVendas = pedidos.reduce((a, p) => a + Number(p.valor_total || 0), 0);
  const qtdPedidos = pedidos.length;
  const dataFormatada = format(dataSelecionada, "dd/MM/yyyy");

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Relatório Caixa do Dia - ${dataFormatada}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Unidade: ${unidadeAtual?.nome || "Todas"}`, 14, 28);

    if (sessao) {
      doc.text(`Abertura: R$ ${Number(sessao.valor_abertura).toFixed(2)} | Status: ${sessao.status === "fechado" ? "Fechado" : "Aberto"}`, 14, 34);
      if (sessao.valor_fechamento != null) {
        doc.text(`Fechamento: R$ ${Number(sessao.valor_fechamento).toFixed(2)} | Diferença: R$ ${Number(sessao.diferenca || 0).toFixed(2)}`, 14, 40);
      }
    }

    let startY = sessao ? 48 : 36;

    // Resumo
    doc.setFontSize(12);
    doc.text("Resumo", 14, startY);
    autoTable(doc, {
      startY: startY + 4,
      head: [["Métrica", "Valor"]],
      body: [
        ["Total Vendas", `R$ ${totalVendas.toFixed(2)} (${qtdPedidos} pedidos)`],
        ["Entradas Caixa", `R$ ${totalEntradas.toFixed(2)}`],
        ["Saídas Caixa", `R$ ${totalSaidas.toFixed(2)}`],
        ["Saldo Caixa", `R$ ${saldo.toFixed(2)}`],
      ],
    });

    // Produtos
    if (produtosVendidos.length > 0) {
      const finalY = (doc as any).lastAutoTable?.finalY || startY + 40;
      doc.text("Produtos Vendidos", 14, finalY + 10);
      autoTable(doc, {
        startY: finalY + 14,
        head: [["Produto", "Qtd", "Total"]],
        body: produtosVendidos.map(p => [p.nome, String(p.quantidade), `R$ ${p.total.toFixed(2)}`]),
        foot: [["Total", String(produtosVendidos.reduce((a, p) => a + p.quantidade, 0)), `R$ ${produtosVendidos.reduce((a, p) => a + p.total, 0).toFixed(2)}`]],
      });
    }

    // Formas de pagamento
    if (formasPagamento.length > 0) {
      const finalY = (doc as any).lastAutoTable?.finalY || 100;
      doc.text("Formas de Pagamento", 14, finalY + 10);
      autoTable(doc, {
        startY: finalY + 14,
        head: [["Forma", "Pedidos", "Total"]],
        body: formasPagamento.map(fp => [fp.forma, String(fp.quantidade), `R$ ${fp.total.toFixed(2)}`]),
        foot: [["Total", String(formasPagamento.reduce((a, f) => a + f.quantidade, 0)), `R$ ${formasPagamento.reduce((a, f) => a + f.total, 0).toFixed(2)}`]],
      });
    }

    doc.save(`caixa-${format(dataSelecionada, "yyyy-MM-dd")}.pdf`);
    toast.success("PDF gerado!");
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Resumo
    const resumoData = [
      ["Relatório Caixa do Dia", dataFormatada],
      ["Unidade", unidadeAtual?.nome || "Todas"],
      [],
      ["Métrica", "Valor"],
      ["Total Vendas", totalVendas],
      ["Qtd Pedidos", qtdPedidos],
      ["Entradas Caixa", totalEntradas],
      ["Saídas Caixa", totalSaidas],
      ["Saldo Caixa", saldo],
    ];
    if (sessao) {
      resumoData.push(["Valor Abertura", sessao.valor_abertura]);
      if (sessao.valor_fechamento != null) {
        resumoData.push(["Valor Fechamento", sessao.valor_fechamento]);
        resumoData.push(["Diferença", sessao.diferenca || 0]);
      }
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumoData), "Resumo");

    // Movimentações
    if (movs.length > 0) {
      const movsSheet = [["Hora", "Tipo", "Descrição", "Categoria", "Valor"]];
      movs.forEach(m => movsSheet.push([
        new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        m.tipo === "entrada" ? "Entrada" : "Saída",
        m.descricao,
        m.categoria || "—",
        String(Number(m.valor).toFixed(2)),
      ]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(movsSheet), "Movimentações");
    }

    // Produtos
    if (produtosVendidos.length > 0) {
      const prodSheet = [["Produto", "Qtd", "Total"]];
      produtosVendidos.forEach(p => prodSheet.push([p.nome, String(p.quantidade), String(p.total.toFixed(2))]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prodSheet), "Produtos");
    }

    // Pagamentos
    if (formasPagamento.length > 0) {
      const fpSheet = [["Forma", "Pedidos", "Total"]];
      formasPagamento.forEach(fp => fpSheet.push([fp.forma, String(fp.quantidade), String(fp.total.toFixed(2))]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(fpSheet), "Pagamentos");
    }

    XLSX.writeFile(wb, `caixa-${format(dataSelecionada, "yyyy-MM-dd")}.xlsx`);
    toast.success("Excel gerado!");
  };

  return (
    <MainLayout>
      <Header title="Caixa do Dia" subtitle="Controle de movimentações financeiras" />
      <div className="p-6 space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dataSelecionada} onSelect={(d) => d && setDataSelecionada(d)} locale={ptBR} initialFocus />
            </PopoverContent>
          </Popover>
          <div className="flex flex-wrap gap-2">
            {/* Abertura / Fechamento */}
            {!sessao && (
              <Dialog open={aberturaOpen} onOpenChange={setAberturaOpen}>
                <DialogTrigger asChild><Button variant="outline" className="border-success text-success hover:bg-success/10"><DoorOpen className="h-4 w-4 mr-2" />Abrir Caixa</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Abertura de Caixa</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div><Label>Valor Inicial (fundo de troco) *</Label><Input type="number" step="0.01" value={aberturaForm.valor} onChange={e => setAberturaForm({ ...aberturaForm, valor: e.target.value })} placeholder="0.00" /></div>
                    <div><Label>Observações</Label><Textarea value={aberturaForm.obs} onChange={e => setAberturaForm({ ...aberturaForm, obs: e.target.value })} placeholder="Observações da abertura..." /></div>
                    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAberturaOpen(false)}>Cancelar</Button><Button onClick={handleAbrirCaixa}>Abrir Caixa</Button></div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {sessao?.status === "aberto" && (
              <Dialog open={fechamentoOpen} onOpenChange={setFechamentoOpen}>
                <DialogTrigger asChild><Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10"><DoorClosed className="h-4 w-4 mr-2" />Fechar Caixa</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Fechamento de Caixa</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
                      <p>Abertura: <strong>R$ {Number(sessao.valor_abertura).toFixed(2)}</strong></p>
                      <p>Entradas: <strong className="text-success">R$ {totalEntradas.toFixed(2)}</strong></p>
                      <p>Saídas: <strong className="text-destructive">R$ {totalSaidas.toFixed(2)}</strong></p>
                      <p className="pt-1 border-t">Valor esperado: <strong>R$ {(sessao.valor_abertura + saldo).toFixed(2)}</strong></p>
                    </div>
                    <div><Label>Valor contado no caixa *</Label><Input type="number" step="0.01" value={fechamentoForm.valor} onChange={e => setFechamentoForm({ ...fechamentoForm, valor: e.target.value })} placeholder="0.00" /></div>
                    {fechamentoForm.valor && (
                      <div className={`rounded-lg p-3 text-sm font-medium ${parseFloat(fechamentoForm.valor) - (sessao.valor_abertura + saldo) === 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        Diferença: R$ {(parseFloat(fechamentoForm.valor) - (sessao.valor_abertura + saldo)).toFixed(2)}
                      </div>
                    )}
                    <div><Label>Observações</Label><Textarea value={fechamentoForm.obs} onChange={e => setFechamentoForm({ ...fechamentoForm, obs: e.target.value })} placeholder="Observações do fechamento..." /></div>
                    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setFechamentoOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleFecharCaixa}>Fechar Caixa</Button></div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Movimentação</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova Movimentação</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div><Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Descrição *</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
                  <div><Label>Valor *</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                  <div><Label>Categoria</Label>
                    <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vendas">Vendas</SelectItem><SelectItem value="Combustível">Combustível</SelectItem>
                        <SelectItem value="Alimentação">Alimentação</SelectItem><SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Troco">Troco</SelectItem><SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSubmit}>Registrar</Button></div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={exportPDF}><FileDown className="h-4 w-4 mr-2" />PDF</Button>
            <Button variant="outline" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
          </div>
        </div>

        {/* Status do caixa */}
        {sessao && (
          <Card className={sessao.status === "aberto" ? "border-success/50 bg-success/5" : "border-muted"}>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {sessao.status === "aberto" ? <DoorOpen className="h-5 w-5 text-success" /> : <DoorClosed className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="font-medium">Caixa {sessao.status === "aberto" ? "Aberto" : "Fechado"}</p>
                    <p className="text-sm text-muted-foreground">
                      Aberto às {new Date(sessao.aberto_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      {sessao.fechado_em && ` • Fechado às ${new Date(sessao.fechado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div><span className="text-muted-foreground">Abertura:</span> <strong>R$ {Number(sessao.valor_abertura).toFixed(2)}</strong></div>
                  {sessao.valor_fechamento != null && (
                    <>
                      <div><span className="text-muted-foreground">Fechamento:</span> <strong>R$ {Number(sessao.valor_fechamento).toFixed(2)}</strong></div>
                      <div><span className="text-muted-foreground">Diferença:</span> <strong className={Number(sessao.diferenca || 0) === 0 ? "text-success" : "text-destructive"}>R$ {Number(sessao.diferenca || 0).toFixed(2)}</strong></div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><ShoppingCart className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">R$ {totalVendas.toFixed(2)}</p><p className="text-sm text-muted-foreground">{qtdPedidos} vendas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-success/10"><TrendingUp className="h-6 w-6 text-success" /></div><div><p className="text-2xl font-bold text-success">R$ {totalEntradas.toFixed(2)}</p><p className="text-sm text-muted-foreground">Entradas Caixa</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-destructive/10"><TrendingDown className="h-6 w-6 text-destructive" /></div><div><p className="text-2xl font-bold text-destructive">R$ {totalSaidas.toFixed(2)}</p><p className="text-sm text-muted-foreground">Saídas Caixa</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><DollarSign className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">R$ {saldo.toFixed(2)}</p><p className="text-sm text-muted-foreground">Saldo Caixa</p></div></div></CardContent></Card>
        </div>

        {/* Abas */}
        <Tabs defaultValue="movimentacoes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
            <TabsTrigger value="produtos">Produtos Vendidos</TabsTrigger>
            <TabsTrigger value="pagamentos">Formas de Pagamento</TabsTrigger>
          </TabsList>

          <TabsContent value="movimentacoes">
            <Card>
              <CardHeader><CardTitle>Movimentações do Dia</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : movs.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhuma movimentação</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Hora</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {movs.map(mov => (
                        <TableRow key={mov.id}>
                          <TableCell className="text-muted-foreground">{new Date(mov.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                          <TableCell><Badge variant={mov.tipo === "entrada" ? "default" : "destructive"}>{mov.tipo === "entrada" ? "Entrada" : "Saída"}</Badge></TableCell>
                          <TableCell>{mov.descricao}</TableCell>
                          <TableCell><Badge variant="outline">{mov.categoria || "—"}</Badge></TableCell>
                          <TableCell className={`text-right font-medium ${mov.tipo === "entrada" ? "text-success" : "text-destructive"}`}>
                            {mov.tipo === "entrada" ? "+" : "-"} R$ {Number(mov.valor).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produtos">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Produtos Vendidos</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : produtosVendidos.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhuma venda registrada</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead className="text-center">Qtd</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {produtosVendidos.map(p => (
                        <TableRow key={p.nome}>
                          <TableCell className="font-medium">{p.nome}</TableCell>
                          <TableCell className="text-center"><Badge variant="secondary">{p.quantidade}</Badge></TableCell>
                          <TableCell className="text-right font-medium">R$ {p.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-center">{produtosVendidos.reduce((a, p) => a + p.quantidade, 0)}</TableCell>
                        <TableCell className="text-right">R$ {produtosVendidos.reduce((a, p) => a + p.total, 0).toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagamentos">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Formas de Pagamento</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : formasPagamento.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhuma venda registrada</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Forma</TableHead><TableHead className="text-center">Pedidos</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {formasPagamento.map(fp => (
                        <TableRow key={fp.forma}>
                          <TableCell className="font-medium capitalize">{fp.forma}</TableCell>
                          <TableCell className="text-center"><Badge variant="secondary">{fp.quantidade}</Badge></TableCell>
                          <TableCell className="text-right font-medium">R$ {fp.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-center">{formasPagamento.reduce((a, f) => a + f.quantidade, 0)}</TableCell>
                        <TableCell className="text-right">R$ {formasPagamento.reduce((a, f) => a + f.total, 0).toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
