import { Lock } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useCaixaBloqueado } from "@/hooks/useCaixaBloqueado";

/**
 * Banner que exibe aviso quando o caixa do dia está fechado/bloqueado.
 * Use em telas de vendas, estoque e caixa para alertar o operador.
 */
export function CaixaBloqueadoBanner() {
  const { bloqueado, loading } = useCaixaBloqueado();

  if (loading || !bloqueado) return null;

  return (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
      <Lock className="h-4 w-4" />
      <AlertTitle>Caixa Fechado</AlertTitle>
      <AlertDescription>
        O caixa do dia está fechado. Novas vendas, movimentações de estoque e lançamentos estão bloqueados. Solicite ao gestor para reabrir.
      </AlertDescription>
    </Alert>
  );
}
