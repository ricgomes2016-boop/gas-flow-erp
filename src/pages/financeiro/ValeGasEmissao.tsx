import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useValeGas } from "@/contexts/ValeGasContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Package,
  Calendar,
  Hash,
  Banknote,
  FileText,
  CreditCard,
  Eye,
  Trash2,
  XCircle,
  ShoppingBag,
  User,
  Receipt
} from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function ValeGasEmissao() {
  const { parceiros, lotes, emitirLote, cancelarLote, registrarPagamentoLote, proximoNumeroVale } = useValeGas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagamentoDialog, setPagamentoDialog] = useState<string | null>(null);
  const [valorPagamento, setValorPagamento] = useState("");
  const [previewVales, setPreviewVales] = useState<Array<{ numero: number; codigo: string; valor: number }>>([]);
  const [detalhesLoteId, setDetalhesLoteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    parceiroId: "",
    quantidade: "",
    valorUnitario: "105",
    dataVencimento: "",
    observacao: "",
    descricao: "VALE GÁS",
    clienteId: "",
    produtoId: "",
    gerarContaReceber: false,
    dataVencimentoConta: "",
  });

  // Buscar clientes do Supabase
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-vale"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id, nome").eq("ativo", true).order("nome");
      return data || [];
    },
  });

  // Buscar produtos do Supabase
  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos-vale"],
    queryFn: async () => {
      const { data } = await supabase.from("produtos").select("id, nome, preco").eq("ativo", true).order("nome");
      return data || [];
    },
  });

  const parceiro = parceiros.find(p => p.id === formData.parceiroId);
  const clienteSelecionado = clientes.find(c => c.id === formData.clienteId);
  const produtoSelecionado = produtos.find(p => p.id === formData.produtoId);
  const valorTotal = (parseInt(formData.quantidade) || 0) * (parseFloat(formData.valorUnitario) || 0);

  // Gerar preview dos vales
  const gerarPreview = () => {
    const qtd = parseInt(formData.quantidade) || 0;
    const valor = parseFloat(formData.valorUnitario) || 0;
    if (qtd <= 0 || valor <= 0) {
      toast.error("Informe quantidade e valor válidos");
      return;
    }
    const preview = [];
    for (let i = 0; i < qtd; i++) {
      const num = proximoNumeroVale + i;
      const ano = new Date().getFullYear();
      preview.push({
        numero: num,
        codigo: `VG-${ano}-${num.toString().padStart(5, "0")}`,
        valor,
      });
    }
    setPreviewVales(preview);
  };

  const limparPreview = () => setPreviewVales([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.parceiroId || !formData.quantidade) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const lote = emitirLote({
      parceiroId: formData.parceiroId,
      quantidade: parseInt(formData.quantidade),
      valorUnitario: parseFloat(formData.valorUnitario),
      dataVencimento: formData.dataVencimento ? new Date(formData.dataVencimento) : undefined,
      observacao: formData.observacao || undefined,
      descricao: formData.descricao || undefined,
      clienteId: formData.clienteId || undefined,
      clienteNome: clienteSelecionado?.nome || undefined,
      produtoId: formData.produtoId || undefined,
      produtoNome: produtoSelecionado?.nome || undefined,
      gerarContaReceber: formData.gerarContaReceber,
    });

    // Gerar conta a receber no Supabase se marcado
    if (formData.gerarContaReceber && formData.clienteId) {
      try {
        const vencimento = formData.dataVencimentoConta || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        await supabase.from("contas_receber").insert({
          cliente: clienteSelecionado?.nome || parceiro?.nome || "Vale Gás",
          descricao: `${formData.descricao || "Vale Gás"} - Lote ${lote.numeroInicial}-${lote.numeroFinal}`,
          valor: lote.valorTotal,
          vencimento,
          status: "pendente",
          forma_pagamento: "vale_gas",
          observacoes: `Lote de ${lote.quantidade} vales. Parceiro: ${parceiro?.nome}`,
        });
        toast.success("Conta a receber gerada automaticamente!");
      } catch {
        toast.error("Erro ao gerar conta a receber");
      }
    }

    toast.success(`Lote emitido! Vales de ${lote.numeroInicial} a ${lote.numeroFinal}`);
    setDialogOpen(false);
    setPreviewVales([]);
    setFormData({ parceiroId: "", quantidade: "", valorUnitario: "105", dataVencimento: "", observacao: "", descricao: "VALE GÁS", clienteId: "", produtoId: "", gerarContaReceber: false, dataVencimentoConta: "" });
  };

  const handlePagamento = (loteId: string) => {
    const valor = parseFloat(valorPagamento);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    registrarPagamentoLote(loteId, valor);
    toast.success("Pagamento registrado!");
    setPagamentoDialog(null);
    setValorPagamento("");
  };

  const handleCancelarLote = (loteId: string) => {
    cancelarLote(loteId);
    toast.success("Lote cancelado! Vales disponíveis foram marcados como cancelados.");
  };

  const lotesAtivos = lotes.filter(l => !l.cancelado);
  const lotesCancelados = lotes.filter(l => l.cancelado);

  const totais = useMemo(() => ({
    lotes: lotesAtivos.length,
    valesEmitidos: lotesAtivos.reduce((sum, l) => sum + l.quantidade, 0),
    valorTotal: lotesAtivos.reduce((sum, l) => sum + l.valorTotal, 0),
    valorRecebido: lotesAtivos.reduce((sum, l) => sum + l.valorPago, 0),
  }), [lotesAtivos]);

  const loteDetalhe = lotes.find(l => l.id === detalhesLoteId);

  return (
    <MainLayout>
      <Header title="Emissão de Vale Gás" subtitle="Emita e gerencie lotes de vales" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Emissão de Vales Gás</h1>
            <p className="text-muted-foreground">Emita lotes de vales para os parceiros</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setPreviewVales([]); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Emitir Lote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Lançamento de Vale Gás</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Descrição */}
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={formData.descricao}
                    onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Ex: VALE GÁS, VALE COMPRAS"
                  />
                </div>

                {/* Parceiro */}
                <div className="space-y-2">
                  <Label>Parceiro *</Label>
                  <Select
                    value={formData.parceiroId}
                    onValueChange={v => setFormData(prev => ({ ...prev, parceiroId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o parceiro" />
                    </SelectTrigger>
                    <SelectContent>
                      {parceiros.filter(p => p.ativo).map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} ({p.tipo === "prepago" ? "Pré-pago" : "Consignado"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {parceiro && (
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <p className="font-medium">{parceiro.nome}</p>
                    <p className="text-muted-foreground">
                      Tipo: {parceiro.tipo === "prepago" ? "Pré-pago" : "Consignado"} | CNPJ: {parceiro.cnpj}
                    </p>
                  </div>
                )}

                {/* Cliente */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente (opcional)
                  </Label>
                  <Select
                    value={formData.clienteId}
                    onValueChange={v => setFormData(prev => ({ ...prev, clienteId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vincular a um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                      {clientes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Produto */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Produto (qual item o vale pode ser usado)
                  </Label>
                  <Select
                    value={formData.produtoId}
                    onValueChange={v => setFormData(prev => ({ ...prev, produtoId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer produto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualquer">Qualquer produto</SelectItem>
                      {produtos.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} - R$ {Number(p.preco).toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantidade e Valor */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade de Vales *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantidade}
                      onChange={e => { setFormData(prev => ({ ...prev, quantidade: e.target.value })); setPreviewVales([]); }}
                      placeholder="Ex: 50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor de cada Vale (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valorUnitario}
                      onChange={e => { setFormData(prev => ({ ...prev, valorUnitario: e.target.value })); setPreviewVales([]); }}
                      required
                    />
                  </div>
                </div>

                {/* Resumo + Preview button */}
                <div className="p-3 bg-primary/10 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Numeração:</span>
                    <span className="font-mono">
                      {proximoNumeroVale} a {proximoNumeroVale + (parseInt(formData.quantidade) || 1) - 1}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-lg">
                    <span>Valor Total:</span>
                    <span className="text-green-600">R$ {valorTotal.toFixed(2)}</span>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={gerarPreview}>
                    <Eye className="h-4 w-4" />
                    Visualizar Vales
                  </Button>
                </div>

                {/* Preview Table */}
                {previewVales.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-muted">
                      <span className="text-sm font-medium">Preview: {previewVales.length} vales</span>
                      <Button type="button" variant="ghost" size="sm" onClick={limparPreview}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nº</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewVales.map(v => (
                            <TableRow key={v.numero}>
                              <TableCell className="font-mono font-bold">{v.numero}</TableCell>
                              <TableCell className="font-mono text-xs">{v.codigo}</TableCell>
                              <TableCell className="text-right">R$ {v.valor.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {parceiro?.tipo === "prepago" && (
                  <div className="space-y-2">
                    <Label>Data de Vencimento do Pagamento</Label>
                    <Input
                      type="date"
                      value={formData.dataVencimento}
                      onChange={e => setFormData(prev => ({ ...prev, dataVencimento: e.target.value }))}
                    />
                  </div>
                )}

                {/* Gerar Contas a Receber */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gerarConta"
                      checked={formData.gerarContaReceber}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gerarContaReceber: checked === true }))}
                    />
                    <Label htmlFor="gerarConta" className="flex items-center gap-2 cursor-pointer">
                      <Receipt className="h-4 w-4" />
                      Gerar contas a receber com o valor total dos vales
                    </Label>
                  </div>
                  {formData.gerarContaReceber && (
                    <div className="space-y-2 pl-6">
                      <Label>Vencimento da Conta</Label>
                      <Input
                        type="date"
                        value={formData.dataVencimentoConta}
                        onChange={e => setFormData(prev => ({ ...prev, dataVencimentoConta: e.target.value }))}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Observação</Label>
                  <Textarea
                    value={formData.observacao}
                    onChange={e => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                    placeholder="Observações sobre o lote..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Gravar Lote
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totais.lotes}</p>
                  <p className="text-sm text-muted-foreground">Lotes Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totais.valesEmitidos}</p>
                  <p className="text-sm text-muted-foreground">Vales Emitidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Banknote className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {totais.valorRecebido.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Recebido</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <Package className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {(totais.valorTotal - totais.valorRecebido).toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">A Receber</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próxima numeração */}
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Próximo número de vale disponível</p>
                <p className="text-xl font-mono font-bold">{proximoNumeroVale}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de lotes */}
        <Card>
          <CardHeader>
            <CardTitle>Lotes Emitidos</CardTitle>
            <CardDescription>Histórico de emissão de vales gás</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição / Parceiro</TableHead>
                  <TableHead>Cliente / Produto</TableHead>
                  <TableHead className="text-center">Numeração</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotes.map(lote => (
                  <TableRow key={lote.id} className={lote.cancelado ? "opacity-50" : ""}>
                    <TableCell>
                      <div>
                        <p>{format(lote.dataEmissao, "dd/MM/yyyy", { locale: ptBR })}</p>
                        {lote.dataVencimentoPagamento && (
                          <p className="text-xs text-muted-foreground">
                            Venc: {format(lote.dataVencimentoPagamento, "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {lote.descricao && <p className="font-medium text-xs text-muted-foreground">{lote.descricao}</p>}
                        <p className="font-medium">{lote.parceiroNome}</p>
                        <Badge variant={lote.tipoParceiro === "prepago" ? "default" : "secondary"} className="text-xs">
                          {lote.tipoParceiro === "prepago" ? "Pré-pago" : "Consignado"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {lote.clienteNome && (
                          <p className="text-sm flex items-center gap-1">
                            <User className="h-3 w-3" /> {lote.clienteNome}
                          </p>
                        )}
                        {lote.produtoNome && (
                          <p className="text-sm flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3" /> {lote.produtoNome}
                          </p>
                        )}
                        {!lote.clienteNome && !lote.produtoNome && (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {lote.numeroInicial} - {lote.numeroFinal}
                    </TableCell>
                    <TableCell className="text-center">{lote.quantidade}</TableCell>
                    <TableCell className="text-right">R$ {lote.valorTotal.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      {lote.cancelado ? (
                        <Badge variant="destructive">Cancelado</Badge>
                      ) : (
                        <Badge 
                          variant={
                            lote.statusPagamento === "pago" ? "default" :
                            lote.statusPagamento === "parcial" ? "secondary" : "destructive"
                          }
                        >
                          {lote.statusPagamento === "pago" ? "Pago" :
                           lote.statusPagamento === "parcial" ? "Parcial" : "Pendente"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!lote.cancelado && lote.statusPagamento !== "pago" && lote.tipoParceiro === "prepago" && (
                          <Dialog 
                            open={pagamentoDialog === lote.id} 
                            onOpenChange={(open) => setPagamentoDialog(open ? lote.id : null)}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Receber
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Registrar Pagamento</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="font-medium">{lote.parceiroNome}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Pendente: R$ {(lote.valorTotal - lote.valorPago).toFixed(2)}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Valor do Pagamento</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={valorPagamento}
                                    onChange={e => setValorPagamento(e.target.value)}
                                    placeholder="0,00"
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={() => setPagamentoDialog(null)}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={() => handlePagamento(lote.id)}>
                                    Confirmar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {!lote.cancelado && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancelar Lote?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso cancelará todos os vales disponíveis do lote {lote.numeroInicial}-{lote.numeroFinal} ({lote.parceiroNome}).
                                  Vales já vendidos ou utilizados não serão afetados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Voltar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleCancelarLote(lote.id)}
                                >
                                  Cancelar Lote
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
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
