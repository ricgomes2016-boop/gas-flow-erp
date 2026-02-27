import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeScanner } from "@/components/entregador/QRCodeScanner";
import { CreditCard, QrCode, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TerminalQRScannerProps {
  entregadorId: string;
  terminalFixoNome?: string | null;
  terminalAtivoNome?: string | null;
  onTerminalVinculado: () => void;
}

export function TerminalQRScanner({
  entregadorId,
  terminalFixoNome,
  terminalAtivoNome,
  onTerminalVinculado,
}: TerminalQRScannerProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQRScan = async (decodedText: string) => {
    setIsProcessing(true);
    try {
      // QR format expected: terminal:<terminal_id> or just the UUID
      const terminalId = decodedText.startsWith("terminal:")
        ? decodedText.replace("terminal:", "")
        : decodedText;

      // Validate it's a real terminal
      const { data: terminal } = await (supabase.from("terminais_cartao" as any).select("id, nome, numero_serie").eq("id", terminalId).maybeSingle() as any);

      if (!terminal) {
        toast.error("QR Code inválido. Não foi possível identificar a maquininha.");
        setShowScanner(false);
        setIsProcessing(false);
        return;
      }

      // Check if another entregador already has this terminal active (conflict detection)
      const { data: conflito } = await supabase
        .from("entregadores")
        .select("id, nome")
        .eq("terminal_ativo_id", terminalId)
        .neq("id", entregadorId)
        .maybeSingle();

      if (conflito) {
        const confirmar = window.confirm(
          `⚠️ A maquininha "${terminal.nome}" está vinculada ao entregador "${conflito.nome}". Deseja desvincular e usar para você?`
        );
        if (!confirmar) {
          setShowScanner(false);
          setIsProcessing(false);
          return;
        }
        // Remove from other entregador
        await supabase.from("entregadores").update({ terminal_ativo_id: null }).eq("id", conflito.id);
      }

      // Update entregador with active terminal
      const { error: updateError } = await supabase
        .from("entregadores")
        .update({ terminal_ativo_id: terminalId })
        .eq("id", entregadorId);

      if (updateError) throw updateError;

      toast.success(`Maquininha "${terminal.nome}" vinculada com sucesso!`);
      setShowScanner(false);
      onTerminalVinculado();
    } catch (err: any) {
      toast.error("Erro ao vincular: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDesvincular = async () => {
    try {
      await supabase
        .from("entregadores")
        .update({ terminal_ativo_id: null })
        .eq("id", entregadorId);
      toast.success("Maquininha desvinculada.");
      onTerminalVinculado();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const nomeAtivo = terminalAtivoNome || terminalFixoNome;

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Maquininha de Cartão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nomeAtivo ? (
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{nomeAtivo}</p>
                <p className="text-xs text-muted-foreground">
                  {terminalAtivoNome ? "Vinculada via QR Code" : "Vinculação fixa"}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {terminalAtivoNome && (
                <Button size="sm" variant="ghost" onClick={handleDesvincular}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setShowScanner(true)}>
                <QrCode className="h-4 w-4 mr-1" />
                Trocar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Nenhuma maquininha vinculada</p>
            </div>
            <Button size="sm" onClick={() => setShowScanner(true)}>
              <QrCode className="h-4 w-4 mr-1" />
              Escanear
            </Button>
          </div>
        )}

        {showScanner && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Escanear QR da Maquininha</p>
              <Button size="sm" variant="ghost" onClick={() => setShowScanner(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {isProcessing ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-sm">Vinculando...</span>
              </div>
            ) : (
              <QRCodeScanner onScan={handleQRScan} />
            )}
          </div>
        )}

        {!terminalFixoNome && !terminalAtivoNome && !showScanner && (
          <p className="text-xs text-muted-foreground">
            Peça ao gestor para vincular uma maquininha fixa ou escaneie o QR Code da máquina.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
