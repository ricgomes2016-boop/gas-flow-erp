import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useValeGas } from "@/contexts/ValeGasContext";
import { 
  Plus, 
  Package,
  Calendar,
  Hash,
  Banknote,
  FileText,
  CreditCard
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function ValeGasEmissao() {
  const { parceiros, lotes, emitirLote, registrarPagamentoLote, proximoNumeroVale } = useValeGas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagamentoDialog, setPagamentoDialog] = useState<string | null>(null);
  const [valorPagamento, setValorPagamento] = useState("");
  
  const [formData, setFormData] = useState({
    parceiroId: "",
    quantidade: "",
    valorUnitario: "105",
    dataVencimento: "",
    observacao: "",
  });

  const parceiro = parceiros.find(p => p.id === formData.parceiroId);
  const valorTotal = (parseInt(formData.quantidade) || 0) * (parseFloat(formData.valorUnitario) || 0);

  const handleSubmit = (e: React.FormEvent) => {
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
    });

    toast.success(`Lote emitido! Vales de ${lote.numeroInicial} a ${lote.numeroFinal}`);
    setDialogOpen(false);
    setFormData({ parceiroId: "", quantidade: "", valorUnitario: "105", dataVencimento: "", observacao: "" });
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

  const totais = {
    lotes: lotes.length,
    valesEmitidos: lotes.reduce((sum, l) => sum + l.quantidade, 0),
    valorTotal: lotes.reduce((sum, l) => sum + l.valorTotal, 0),
    valorRecebido: lotes.reduce((sum, l) => sum + l.valorPago, 0),
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Emissão de Vales Gás</h1>
            <p className="text-muted-foreground">Emita lotes de vales para os parceiros</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Emitir Lote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Emitir Novo Lote de Vales</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Parceiro</Label>
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
                      Tipo: {parceiro.tipo === "prepago" ? "Pré-pago" : "Consignado"}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade de Vales</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantidade}
                      onChange={e => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                      placeholder="Ex: 50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Unitário (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valorUnitario}
                      onChange={e => setFormData(prev => ({ ...prev, valorUnitario: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-primary/10 rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Numeração:</span>
                    <span className="font-mono">
                      {proximoNumeroVale} a {proximoNumeroVale + (parseInt(formData.quantidade) || 1) - 1}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Valor Total:</span>
                    <span>R$ {valorTotal.toFixed(2)}</span>
                  </div>
                </div>

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
                  <Button type="submit">Emitir Lote</Button>
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
                  <p className="text-sm text-muted-foreground">Lotes Emitidos</p>
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
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Numeração</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Pago</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotes.map(lote => (
                  <TableRow key={lote.id}>
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
                      <p className="font-medium">{lote.parceiroNome}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lote.tipoParceiro === "prepago" ? "default" : "secondary"}>
                        {lote.tipoParceiro === "prepago" ? "Pré-pago" : "Consignado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {lote.numeroInicial} - {lote.numeroFinal}
                    </TableCell>
                    <TableCell className="text-center">{lote.quantidade}</TableCell>
                    <TableCell className="text-right">R$ {lote.valorTotal.toFixed(2)}</TableCell>
                    <TableCell className="text-right">R$ {lote.valorPago.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={
                          lote.statusPagamento === "pago" ? "default" :
                          lote.statusPagamento === "parcial" ? "secondary" : "destructive"
                        }
                      >
                        {lote.statusPagamento === "pago" ? "Pago" :
                         lote.statusPagamento === "parcial" ? "Parcial" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lote.statusPagamento !== "pago" && lote.tipoParceiro === "prepago" && (
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
