import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Banknote, CreditCard, Smartphone, Receipt } from "lucide-react";
import { PixQRCode } from "@/components/pix/PixQRCode";
import { useUnidade } from "@/contexts/UnidadeContext";

interface PDVPaymentProps {
  open: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (formaPagamento: string, valorRecebido: number) => void;
  isLoading: boolean;
}

const formasPagamento = [
  { value: "dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "pix", label: "PIX", icon: Smartphone },
  { value: "pix_maquininha", label: "PIX Maquininha", icon: Smartphone },
  { value: "credito", label: "Cartão Crédito", icon: CreditCard },
  { value: "debito", label: "Cartão Débito", icon: CreditCard },
  { value: "vale_gas", label: "Vale Gás", icon: Receipt },
  { value: "cheque", label: "Cheque", icon: Receipt },
];

export function PDVPayment({ open, onClose, total, onConfirm, isLoading }: PDVPaymentProps) {
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [valorRecebido, setValorRecebido] = useState("");
  const { unidadeAtual } = useUnidade();

  const chavePix = (unidadeAtual as any)?.chave_pix as string | null;

  const valorRecebidoNum = parseFloat(valorRecebido.replace(",", ".")) || 0;
  const troco = formaPagamento === "dinheiro" ? Math.max(0, valorRecebidoNum - total) : 0;
  const canFinalize = formaPagamento !== "dinheiro" || valorRecebidoNum >= total;

  const handleConfirm = () => {
    onConfirm(formaPagamento, valorRecebidoNum);
  };

  const setQuickValue = (value: number) => {
    setValorRecebido(value.toFixed(2).replace(".", ","));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Finalizar Venda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total */}
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Total a Pagar</p>
            <p className="text-4xl font-bold text-primary">
              R$ {total.toFixed(2)}
            </p>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              {formasPagamento.map((forma) => {
                const Icon = forma.icon;
                return (
                  <Button
                    key={forma.value}
                    variant={formaPagamento === forma.value ? "default" : "outline"}
                    className="h-14 flex-col gap-1"
                    onClick={() => setFormaPagamento(forma.value)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{forma.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* PIX QR Code */}
          {formaPagamento === "pix" && chavePix && (
            <PixQRCode
              chavePix={chavePix}
              valor={total}
              beneficiario={unidadeAtual?.nome}
            />
          )}

          {formaPagamento === "pix" && !chavePix && (
            <div className="p-3 rounded-lg bg-warning/10 text-warning text-sm text-center">
              Chave PIX não configurada para esta unidade. Configure em Configurações → Unidades.
            </div>
          )}

          {/* Valor Recebido (só para dinheiro) */}
          {formaPagamento === "dinheiro" && (
            <div className="space-y-2">
              <Label>Valor Recebido</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={valorRecebido}
                onChange={(e) => setValorRecebido(e.target.value)}
                className="text-lg text-center font-mono"
              />
              <div className="flex gap-2">
                {[50, 100, 150, 200].map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setQuickValue(value)}
                  >
                    R$ {value}
                  </Button>
                ))}
              </div>

              {valorRecebidoNum > 0 && (
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Troco</p>
                  <p className="text-2xl font-bold text-success">
                    R$ {troco.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              disabled={!canFinalize || isLoading}
              onClick={handleConfirm}
            >
              {isLoading ? "Processando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
