import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Pagamento {
  id: string;
  forma: string;
  valor: number;
}

interface PaymentSectionProps {
  pagamentos: Pagamento[];
  onChange: (pagamentos: Pagamento[]) => void;
  totalVenda: number;
}

const formasPagamento = [
  { value: "dinheiro", label: "Dinheiro", icon: "💵" },
  { value: "pix", label: "PIX", icon: "📱" },
  { value: "cartao_debito", label: "Cartão Débito", icon: "💳" },
  { value: "cartao_credito", label: "Cartão Crédito", icon: "💳" },
  { value: "fiado", label: "Fiado", icon: "📝" },
];

export function PaymentSection({ pagamentos, onChange, totalVenda }: PaymentSectionProps) {
  const [forma, setForma] = useState("");
  const [valor, setValor] = useState("");

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const diferenca = totalVenda - totalPago;

  const addPagamento = () => {
    const valorNum = parseFloat(valor);
    if (!forma || isNaN(valorNum) || valorNum <= 0) return;

    const novoPagamento: Pagamento = {
      id: crypto.randomUUID(),
      forma,
      valor: valorNum,
    };

    onChange([...pagamentos, novoPagamento]);
    setForma("");
    setValor("");
  };

  const removePagamento = (id: string) => {
    onChange(pagamentos.filter((p) => p.id !== id));
  };

  const getFormaLabel = (formaValue: string) => {
    return formasPagamento.find((f) => f.value === formaValue)?.label || formaValue;
  };

  const getFormaIcon = (formaValue: string) => {
    return formasPagamento.find((f) => f.value === formaValue)?.icon || "💰";
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5" />
          Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de pagamentos adicionados */}
        {pagamentos.length > 0 && (
          <div className="space-y-2">
            {pagamentos.map((pag) => (
              <div
                key={pag.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getFormaIcon(pag.forma)}</span>
                  <span className="font-medium text-sm">{getFormaLabel(pag.forma)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">R$ {pag.valor.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removePagamento(pag.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar novo pagamento */}
        <div className="flex gap-2">
          <Select value={forma} onValueChange={setForma}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              {formasPagamento.map((fp) => (
                <SelectItem key={fp.value} value={fp.value}>
                  <span className="flex items-center gap-2">
                    <span>{fp.icon}</span>
                    <span>{fp.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            step="0.01"
            placeholder="Valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-28"
          />
          <Button onClick={addPagamento} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Status do pagamento */}
        {totalVenda > 0 && (
          <div
            className={cn(
              "p-3 rounded-lg flex items-center gap-2 text-sm",
              diferenca > 0 && "bg-destructive/10 text-destructive",
              diferenca < 0 && "bg-warning/10 text-warning",
              diferenca === 0 && "bg-success/10 text-success"
            )}
          >
            {diferenca > 0 ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Falta pagar: R$ {diferenca.toFixed(2)}</span>
              </>
            ) : diferenca < 0 ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Troco: R$ {Math.abs(diferenca).toFixed(2)}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Pagamento completo!</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
