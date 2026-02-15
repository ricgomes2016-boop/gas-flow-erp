import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package, CreditCard, Plus, QrCode, CheckCircle, Trash2, AlertCircle,
  Keyboard, Loader2, Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeScanner } from "@/components/entregador/QRCodeScanner";
import { supabase } from "@/integrations/supabase/client";
import { validarValeGasNoBanco } from "@/hooks/useValeGasValidation";
import { Skeleton } from "@/components/ui/skeleton";

const formasPagamento = [
  "Dinheiro", "PIX", "Cartão Crédito", "Cartão Débito", "Vale Gás",
];

interface Pagamento {
  forma: string;
  valor: number;
  valeGasInfo?: { parceiro: string; codigo: string; valido: boolean; valeId?: string };
}

interface PedidoItem {
  id: string;
  quantidade: number;
  preco_unitario: number;
  produtos: { nome: string } | null;
}

interface PedidoData {
  id: string;
  valor_total: number | null;
  endereco_entrega: string | null;
  observacoes: string | null;
  forma_pagamento: string | null;
  clientes: { nome: string; telefone: string | null; bairro: string | null } | null;
  pedido_itens: PedidoItem[];
}

export default function FinalizarEntrega() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [novoPagamentoForma, setNovoPagamentoForma] = useState("");
  const [novoPagamentoValor, setNovoPagamentoValor] = useState("");
  const [dialogPagamentoAberto, setDialogPagamentoAberto] = useState(false);
  const [dialogQRAberto, setDialogQRAberto] = useState(false);
  const [modoEntradaManual, setModoEntradaManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [valeGasLido, setValeGasLido] = useState<{
    parceiro: string; codigo: string; valor: number; valorVenda: number; valido: boolean; valeId?: string;
  } | null>(null);
  // Editable items state
  const [editableItens, setEditableItens] = useState<PedidoItem[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Fetch real pedido data
  useEffect(() => {
    const fetchPedido = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          id, valor_total, endereco_entrega, observacoes, forma_pagamento,
          clientes:cliente_id (nome, telefone, bairro),
          pedido_itens (
            id, quantidade, preco_unitario,
            produtos:produto_id (nome)
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        toast({ title: "Erro ao carregar pedido", description: error.message, variant: "destructive" });
      } else if (data) {
        const pedidoData = data as unknown as PedidoData;
        setPedido(pedidoData);
        setEditableItens(pedidoData.pedido_itens.map(i => ({ ...i })));
        const total = Number(data.valor_total) || 0;
        if (total > 0) {
          setPagamentos([{ forma: "Dinheiro", valor: total }]);
        }
      }
      setIsLoading(false);
    };
    fetchPedido();
  }, [id, toast]);

  const totalItens = editableItens.reduce(
    (acc, item) => acc + (item.quantidade || 0) * Number(item.preco_unitario || 0), 0
  );

  const totalPagamentos = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const diferenca = totalItens - totalPagamentos;

  const removerPagamento = (index: number) => {
    setPagamentos((prev) => prev.filter((_, i) => i !== index));
  };

  const adicionarPagamento = () => {
    if (novoPagamentoForma && Number(novoPagamentoValor) > 0) {
      setPagamentos((prev) => [
        ...prev,
        { forma: novoPagamentoForma, valor: Number(novoPagamentoValor) },
      ]);
      setNovoPagamentoForma("");
      setNovoPagamentoValor("");
      setDialogPagamentoAberto(false);
    }
  };

  const updateItem = (index: number, field: "quantidade" | "preco_unitario", value: number) => {
    setEditableItens(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const validarValeGas = async (codigo: string) => {
    setValidandoCodigo(true);
    try {
      const result = await validarValeGasNoBanco(codigo);
      if (result.valido) {
        setValeGasLido({ parceiro: result.parceiro, codigo: result.codigo, valor: result.valor, valorVenda: result.valorVenda, valido: true, valeId: result.valeId });
        toast({ title: "Vale Gás validado!", description: `Parceiro: ${result.parceiro} - Valor de venda: R$ ${result.valorVenda.toFixed(2)}` });
      } else {
        setValeGasLido({ parceiro: "", codigo, valor: 0, valorVenda: 0, valido: false });
        toast({ title: "Vale Gás inválido", description: result.erro || "Código não encontrado.", variant: "destructive" });
      }
    } catch {
      setValeGasLido({ parceiro: "", codigo, valor: 0, valorVenda: 0, valido: false });
      toast({ title: "Erro na validação", description: "Não foi possível validar o vale.", variant: "destructive" });
    } finally {
      setValidandoCodigo(false);
    }
  };

  const handleQRCodeScan = (decodedText: string) => validarValeGas(decodedText);

  const validarCodigoManual = () => {
    if (codigoManual.trim()) validarValeGas(codigoManual.trim());
  };

  const confirmarValeGas = () => {
    if (valeGasLido) {
      setPagamentos((prev) => [
        ...prev,
        { forma: "Vale Gás", valor: valeGasLido.valorVenda, valeGasInfo: { parceiro: valeGasLido.parceiro, codigo: valeGasLido.codigo, valido: valeGasLido.valido, valeId: valeGasLido.valeId } },
      ]);
      setValeGasLido(null);
      setDialogQRAberto(false);
    }
  };

  const finalizarEntrega = async () => {
    if (diferenca !== 0) {
      toast({ title: "Atenção", description: "O valor dos pagamentos deve ser igual ao total da entrega.", variant: "destructive" });
      return;
    }
    if (!id) return;
    setIsSaving(true);

    try {
      // Save edited items
      for (const item of editableItens) {
        const { error } = await supabase
          .from("pedido_itens")
          .update({ quantidade: item.quantidade, preco_unitario: item.preco_unitario })
          .eq("id", item.id);
        if (error) throw error;
      }

      const formaStr = pagamentos.map(p => p.forma).join(", ");
      const { error } = await supabase
        .from("pedidos")
        .update({ status: "entregue", forma_pagamento: formaStr, valor_total: totalItens })
        .eq("id", id);
      if (error) throw error;

      // Vincular vales gás utilizados ao cliente e pedido
      const valeGasPagamentos = pagamentos.filter(p => p.forma === "Vale Gás" && p.valeGasInfo?.valeId);
      if (valeGasPagamentos.length > 0) {
        const clienteNomeAtual = pedido?.clientes?.nome || null;
        const clienteIdAtual = (pedido as any)?.cliente_id || null;

        // Buscar entregador_id do pedido
        const { data: pedidoData } = await supabase
          .from("pedidos")
          .select("entregador_id, cliente_id")
          .eq("id", id)
          .single();

        for (const pag of valeGasPagamentos) {
          await (supabase as any)
            .from("vale_gas")
            .update({
              status: "utilizado",
              data_utilizacao: new Date().toISOString(),
              cliente_id: pedidoData?.cliente_id || clienteIdAtual,
              cliente_nome: clienteNomeAtual,
              consumidor_nome: clienteNomeAtual,
              consumidor_endereco: pedido?.endereco_entrega || null,
              consumidor_telefone: pedido?.clientes?.telefone || null,
              entregador_id: pedidoData?.entregador_id || null,
              venda_id: id,
            })
            .eq("id", pag.valeGasInfo!.valeId);
        }
      }

      toast({ title: "Entrega finalizada!", description: "Os dados foram salvos com sucesso." });
      navigate("/entregador/entregas");
    } catch (err: any) {
      toast({ title: "Erro ao finalizar", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <EntregadorLayout title="Finalizar Entrega">
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </EntregadorLayout>
    );
  }

  if (!pedido) {
    return (
      <EntregadorLayout title="Finalizar Entrega">
        <div className="p-4 text-center text-muted-foreground py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Pedido não encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/entregador/entregas")}>Voltar</Button>
        </div>
      </EntregadorLayout>
    );
  }

  const clienteNome = pedido.clientes?.nome || "Cliente";

  return (
    <EntregadorLayout title="Finalizar Entrega">
      <div className="p-4 space-y-4">
        {/* Cabeçalho */}
        <Card className="border-none shadow-md gradient-primary text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Pedido #{id?.slice(-6).toUpperCase()}</p>
                <p className="font-bold text-lg">{clienteNome}</p>
                {pedido.endereco_entrega && <p className="text-sm text-white/80">{pedido.endereco_entrega}</p>}
              </div>
              <Package className="h-12 w-12 text-white/50" />
            </div>
          </CardContent>
        </Card>

        {/* Produtos (editáveis) */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Produtos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editableItens.map((item, index) => (
              <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm flex-1">{item.produtos?.nome || "Produto"}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingItemIndex(editingItemIndex === index ? null : index)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {editingItemIndex === index ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Quantidade</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantidade}
                        onChange={(e) => updateItem(index, "quantidade", Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Preço (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={item.preco_unitario}
                        onChange={(e) => updateItem(index, "preco_unitario", Math.max(0, parseFloat(e.target.value) || 0))}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">R$ {Number(item.preco_unitario).toFixed(2)} un.</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.quantidade}x</span>
                      <span className="font-bold text-sm">R$ {(item.quantidade * Number(item.preco_unitario)).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="font-medium">Total dos produtos:</span>
              <span className="font-bold text-lg">R$ {totalItens.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pagamentos */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Pagamentos
              </CardTitle>
              <div className="flex gap-2">
                <Dialog open={dialogQRAberto} onOpenChange={setDialogQRAberto}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <QrCode className="h-4 w-4 mr-1" />Vale Gás
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Validar Vale Gás</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      {!valeGasLido ? (
                        <>
                          <div className="flex gap-2 p-1 bg-muted rounded-lg">
                            <Button variant={!modoEntradaManual ? "default" : "ghost"} size="sm" className={`flex-1 ${!modoEntradaManual ? "gradient-primary text-white" : ""}`} onClick={() => setModoEntradaManual(false)}>
                              <QrCode className="h-4 w-4 mr-2" />Câmera
                            </Button>
                            <Button variant={modoEntradaManual ? "default" : "ghost"} size="sm" className={`flex-1 ${modoEntradaManual ? "gradient-primary text-white" : ""}`} onClick={() => setModoEntradaManual(true)}>
                              <Keyboard className="h-4 w-4 mr-2" />Digitar
                            </Button>
                          </div>
                          {modoEntradaManual ? (
                            <div className="space-y-4">
                              <div>
                              <Label>Código ou Número do Vale Gás</Label>
                                <Input placeholder="Ex: 1 ou VG-2026-00001" value={codigoManual} onChange={(e) => setCodigoManual(e.target.value)} className="font-mono" />
                                <p className="text-xs text-muted-foreground mt-1">Digite apenas o número (ex: 1) ou o código completo</p>
                              </div>
                              <Button onClick={validarCodigoManual} disabled={!codigoManual.trim() || validandoCodigo} className="w-full gradient-primary text-white">
                                {validandoCodigo ? "Validando..." : "Validar Código"}
                              </Button>
                            </div>
                          ) : (
                            <QRCodeScanner onScan={handleQRCodeScan} onError={(err) => toast({ title: "Erro na câmera", description: err, variant: "destructive" })} />
                          )}
                        </>
                      ) : (
                        <div className="space-y-4">
                          {valeGasLido.valido ? (
                            <div className="p-4 bg-success/10 rounded-lg border border-success/30">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="h-5 w-5 text-success" />
                                <span className="font-semibold text-success">Vale Gás Válido</span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Parceiro:</span><span className="font-medium">{valeGasLido.parceiro}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Código:</span><span className="font-mono">{valeGasLido.codigo}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Valor:</span><span className="font-bold text-lg">R$ {valeGasLido.valorVenda.toFixed(2)}</span></div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                <span className="font-semibold text-destructive">Vale Gás Inválido</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">Código: {valeGasLido.codigo}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => { setValeGasLido(null); setCodigoManual(""); }} className="flex-1">Tentar outro</Button>
                            {valeGasLido.valido && <Button onClick={confirmarValeGas} className="flex-1 gradient-primary text-white">Confirmar</Button>}
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={dialogPagamentoAberto} onOpenChange={setDialogPagamentoAberto}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <Plus className="h-4 w-4 mr-1" />Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar Pagamento</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Forma de Pagamento</Label>
                        <Select value={novoPagamentoForma} onValueChange={setNovoPagamentoForma}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {formasPagamento.filter((f) => f !== "Vale Gás").map((forma) => (
                              <SelectItem key={forma} value={forma}>{forma}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Valor (R$)</Label>
                        <Input type="number" step="0.01" value={novoPagamentoValor} onChange={(e) => setNovoPagamentoValor(e.target.value)} placeholder="0,00" />
                      </div>
                      <Button onClick={adicionarPagamento} className="w-full gradient-primary text-white">Adicionar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pagamentos.map((pag, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{pag.forma}</p>
                  {pag.valeGasInfo && <p className="text-xs text-muted-foreground">{pag.valeGasInfo.parceiro} • {pag.valeGasInfo.codigo}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">R$ {pag.valor.toFixed(2)}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removerPagamento(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="font-medium">Total pago:</span>
              <span className="font-bold text-lg">R$ {totalPagamentos.toFixed(2)}</span>
            </div>
            {diferenca !== 0 && (
              <div className={`flex justify-between p-2 rounded-lg ${diferenca > 0 ? "bg-destructive/10" : "bg-success/10"}`}>
                <span className="text-sm">{diferenca > 0 ? "Falta pagar:" : "Troco:"}</span>
                <span className={`font-bold ${diferenca > 0 ? "text-destructive" : "text-success"}`}>
                  R$ {Math.abs(diferenca).toFixed(2)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão Finalizar */}
        <Button
          onClick={finalizarEntrega}
          className="w-full h-14 text-lg gradient-primary text-white shadow-glow"
          disabled={diferenca !== 0 || isSaving}
        >
          {isSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle className="h-5 w-5 mr-2" />}
          {isSaving ? "Salvando..." : "Finalizar Entrega"}
        </Button>
      </div>
    </EntregadorLayout>
  );
}
