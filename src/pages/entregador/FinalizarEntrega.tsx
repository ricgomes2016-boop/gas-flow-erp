import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  CreditCard,
  Plus,
  Minus,
  QrCode,
  CheckCircle,
  Trash2,
  AlertCircle,
  Keyboard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeScanner } from "@/components/entregador/QRCodeScanner";

const produtos = [
  { id: 1, nome: "Botijão P13", preco: 120.0 },
  { id: 2, nome: "Botijão P20", preco: 180.0 },
  { id: 3, nome: "Botijão P45", preco: 450.0 },
  { id: 4, nome: "Água Mineral 20L", preco: 15.0 },
];

const formasPagamento = [
  "Dinheiro",
  "PIX",
  "Cartão Crédito",
  "Cartão Débito",
  "Vale Gás",
];

interface ItemVenda {
  produtoId: number;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

interface Pagamento {
  forma: string;
  valor: number;
  valeGasInfo?: {
    parceiro: string;
    codigo: string;
    valido: boolean;
  };
}

export default function FinalizarEntrega() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [itens, setItens] = useState<ItemVenda[]>([
    { produtoId: 1, nome: "Botijão P13", quantidade: 2, precoUnitario: 120.0 },
  ]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([
    { forma: "Dinheiro", valor: 240.0 },
  ]);
  const [novoPagamentoForma, setNovoPagamentoForma] = useState("");
  const [novoPagamentoValor, setNovoPagamentoValor] = useState("");
  const [dialogPagamentoAberto, setDialogPagamentoAberto] = useState(false);
  const [dialogQRAberto, setDialogQRAberto] = useState(false);
  const [modoEntradaManual, setModoEntradaManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [valeGasLido, setValeGasLido] = useState<{
    parceiro: string;
    codigo: string;
    valor: number;
    valido: boolean;
  } | null>(null);

  const totalItens = itens.reduce(
    (acc, item) => acc + item.quantidade * item.precoUnitario,
    0
  );
  const totalPagamentos = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const diferenca = totalItens - totalPagamentos;

  const alterarQuantidade = (index: number, delta: number) => {
    setItens((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const novaQtd = Math.max(1, item.quantidade + delta);
          return { ...item, quantidade: novaQtd };
        }
        return item;
      })
    );
  };

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const adicionarProduto = (produtoId: string) => {
    const produto = produtos.find((p) => p.id === Number(produtoId));
    if (produto) {
      const existente = itens.findIndex((i) => i.produtoId === produto.id);
      if (existente >= 0) {
        alterarQuantidade(existente, 1);
      } else {
        setItens((prev) => [
          ...prev,
          {
            produtoId: produto.id,
            nome: produto.nome,
            quantidade: 1,
            precoUnitario: produto.preco,
          },
        ]);
      }
    }
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

  const removerPagamento = (index: number) => {
    setPagamentos((prev) => prev.filter((_, i) => i !== index));
  };

  // Função para validar o código do Vale Gás (simulação)
  const validarValeGas = (codigo: string) => {
    setValidandoCodigo(true);
    
    // Simula validação do código (em produção, chamaria uma API)
    setTimeout(() => {
      // Verifica se o código segue o padrão esperado (ex: VG-XXXX-XXXXXX)
      const padraoValido = /^VG-\d{4}-\d{6}$/.test(codigo) || codigo.length > 5;
      
      if (padraoValido) {
        const valeSemulado = {
          parceiro: "Supergás Parceiros",
          codigo: codigo,
          valor: 120.0,
          valido: true,
        };
        setValeGasLido(valeSemulado);
        toast({
          title: "Vale Gás validado!",
          description: `Parceiro: ${valeSemulado.parceiro} - Valor: R$ ${valeSemulado.valor.toFixed(2)}`,
        });
      } else {
        setValeGasLido({
          parceiro: "",
          codigo: codigo,
          valor: 0,
          valido: false,
        });
        toast({
          title: "Vale Gás inválido",
          description: "O código informado não é válido.",
          variant: "destructive",
        });
      }
      setValidandoCodigo(false);
    }, 1000);
  };

  // Callback quando QR Code é lido pela câmera
  const handleQRCodeScan = (decodedText: string) => {
    validarValeGas(decodedText);
  };

  // Validar código digitado manualmente
  const validarCodigoManual = () => {
    if (codigoManual.trim()) {
      validarValeGas(codigoManual.trim());
    }
  };

  const confirmarValeGas = () => {
    if (valeGasLido) {
      setPagamentos((prev) => [
        ...prev,
        {
          forma: "Vale Gás",
          valor: valeGasLido.valor,
          valeGasInfo: {
            parceiro: valeGasLido.parceiro,
            codigo: valeGasLido.codigo,
            valido: valeGasLido.valido,
          },
        },
      ]);
      setValeGasLido(null);
      setDialogQRAberto(false);
    }
  };

  const finalizarEntrega = () => {
    if (diferenca !== 0) {
      toast({
        title: "Atenção",
        description: "O valor dos pagamentos deve ser igual ao total da entrega.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Entrega finalizada!",
      description: "Os dados foram enviados ao sistema.",
    });
    navigate("/entregador/entregas");
  };

  return (
    <EntregadorLayout title="Finalizar Entrega">
      <div className="p-4 space-y-4">
        {/* Cabeçalho */}
        <Card className="border-none shadow-md gradient-primary text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Pedido #{id}</p>
                <p className="font-bold text-lg">Carlos Ferreira</p>
                <p className="text-sm text-white/80">Rua Minas Gerais, 321</p>
              </div>
              <Package className="h-12 w-12 text-white/50" />
            </div>
          </CardContent>
        </Card>

        {/* Produtos */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Produtos
              </CardTitle>
              <Select onValueChange={adicionarProduto}>
                <SelectTrigger className="w-auto h-8 text-xs">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nome} - R$ {p.preco.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {itens.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    R$ {item.precoUnitario.toFixed(2)} un.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => alterarQuantidade(index, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-bold">{item.quantidade}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => alterarQuantidade(index, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {itens.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removerItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                      <QrCode className="h-4 w-4 mr-1" />
                      Vale Gás
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Validar Vale Gás</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {!valeGasLido ? (
                        <>
                          {/* Tabs para alternar entre câmera e entrada manual */}
                          <div className="flex gap-2 p-1 bg-muted rounded-lg">
                            <Button
                              variant={!modoEntradaManual ? "default" : "ghost"}
                              size="sm"
                              className={`flex-1 ${!modoEntradaManual ? "gradient-primary text-white" : ""}`}
                              onClick={() => setModoEntradaManual(false)}
                            >
                              <QrCode className="h-4 w-4 mr-2" />
                              Câmera
                            </Button>
                            <Button
                              variant={modoEntradaManual ? "default" : "ghost"}
                              size="sm"
                              className={`flex-1 ${modoEntradaManual ? "gradient-primary text-white" : ""}`}
                              onClick={() => setModoEntradaManual(true)}
                            >
                              <Keyboard className="h-4 w-4 mr-2" />
                              Digitar
                            </Button>
                          </div>

                          {modoEntradaManual ? (
                            <div className="space-y-4">
                              <div>
                                <Label>Código do Vale Gás</Label>
                                <Input
                                  placeholder="Ex: VG-2024-001234"
                                  value={codigoManual}
                                  onChange={(e) => setCodigoManual(e.target.value)}
                                  className="font-mono"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Digite o código impresso no vale
                                </p>
                              </div>
                              <Button
                                onClick={validarCodigoManual}
                                disabled={!codigoManual.trim() || validandoCodigo}
                                className="w-full gradient-primary text-white"
                              >
                                {validandoCodigo ? "Validando..." : "Validar Código"}
                              </Button>
                            </div>
                          ) : (
                            <QRCodeScanner
                              onScan={handleQRCodeScan}
                              onError={(err) => {
                                toast({
                                  title: "Erro na câmera",
                                  description: err,
                                  variant: "destructive",
                                });
                              }}
                            />
                          )}
                        </>
                      ) : (
                        <div className="space-y-4">
                          {valeGasLido.valido ? (
                            <div className="p-4 bg-success/10 rounded-lg border border-success/30">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="h-5 w-5 text-success" />
                                <span className="font-semibold text-success">
                                  Vale Gás Válido
                                </span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Parceiro:</span>
                                  <span className="font-medium">{valeGasLido.parceiro}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Código:</span>
                                  <span className="font-mono">{valeGasLido.codigo}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Valor:</span>
                                  <span className="font-bold text-lg">
                                    R$ {valeGasLido.valor.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                <span className="font-semibold text-destructive">
                                  Vale Gás Inválido
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Código: {valeGasLido.codigo}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setValeGasLido(null);
                                setCodigoManual("");
                              }}
                              className="flex-1"
                            >
                              Tentar outro
                            </Button>
                            {valeGasLido.valido && (
                              <Button
                                onClick={confirmarValeGas}
                                className="flex-1 gradient-primary text-white"
                              >
                                Confirmar
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={dialogPagamentoAberto}
                  onOpenChange={setDialogPagamentoAberto}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Pagamento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Forma de Pagamento</Label>
                        <Select
                          value={novoPagamentoForma}
                          onValueChange={setNovoPagamentoForma}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {formasPagamento
                              .filter((f) => f !== "Vale Gás")
                              .map((forma) => (
                                <SelectItem key={forma} value={forma}>
                                  {forma}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={novoPagamentoValor}
                          onChange={(e) => setNovoPagamentoValor(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <Button
                        onClick={adicionarPagamento}
                        className="w-full gradient-primary text-white"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pagamentos.map((pag, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{pag.forma}</p>
                  {pag.valeGasInfo && (
                    <p className="text-xs text-muted-foreground">
                      {pag.valeGasInfo.parceiro} • {pag.valeGasInfo.codigo}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">R$ {pag.valor.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removerPagamento(index)}
                  >
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
              <div
                className={`flex justify-between p-2 rounded-lg ${
                  diferenca > 0 ? "bg-destructive/10" : "bg-success/10"
                }`}
              >
                <span className="text-sm">
                  {diferenca > 0 ? "Falta pagar:" : "Troco:"}
                </span>
                <span
                  className={`font-bold ${
                    diferenca > 0 ? "text-destructive" : "text-success"
                  }`}
                >
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
          disabled={diferenca !== 0}
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Finalizar Entrega
        </Button>
      </div>
    </EntregadorLayout>
  );
}
