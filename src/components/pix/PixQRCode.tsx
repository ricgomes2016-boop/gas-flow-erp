import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PixQRCodeProps {
  chavePix: string;
  valor: number;
  beneficiario?: string;
}

/**
 * Generates a PIX "copia e cola" payload (simplified, not full EMV).
 * For production, consider using a proper PIX payload library.
 */
function buildPixPayload(chavePix: string, valor: number, beneficiario?: string): string {
  // Simplified PIX static payload
  // Format: key + value for basic QR code reading
  const valorStr = valor.toFixed(2);
  return `00020126${String(26 + chavePix.length).padStart(2, "0")}0014br.gov.bcb.pix01${String(chavePix.length).padStart(2, "0")}${chavePix}52040000530398654${String(valorStr.length).padStart(2, "0")}${valorStr}5802BR${beneficiario ? `59${String(beneficiario.length).padStart(2, "0")}${beneficiario}` : "5900"}6009SAO PAULO62070503***6304`;
}

function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}

function buildPixBRCode(chavePix: string, valor: number, beneficiario?: string): string {
  const gui = "0014br.gov.bcb.pix";
  const key = `01${String(chavePix.length).padStart(2, "0")}${chavePix}`;
  const merchantAccountInfo = `${gui}${key}`;
  const mai = `26${String(merchantAccountInfo.length).padStart(2, "0")}${merchantAccountInfo}`;

  const mcc = "52040000";
  const currency = "5303986";

  const valorStr = valor.toFixed(2);
  const transactionAmount = `54${String(valorStr.length).padStart(2, "0")}${valorStr}`;

  const country = "5802BR";

  const nome = beneficiario || "LOJA";
  const merchantName = `59${String(nome.substring(0, 25).length).padStart(2, "0")}${nome.substring(0, 25)}`;

  const city = "6009SAO PAULO";
  const additional = "62070503***";

  const payloadWithoutCRC = `000201${mai}${mcc}${currency}${transactionAmount}${country}${merchantName}${city}${additional}6304`;
  const crc = calculateCRC16(payloadWithoutCRC);
  
  return `${payloadWithoutCRC}${crc}`;
}

export function PixQRCode({ chavePix, valor, beneficiario }: PixQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const payload = buildPixBRCode(chavePix, valor, beneficiario);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast({ title: "Copiado!", description: "Código PIX copiado para a área de transferência." });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 justify-center text-primary">
          <Smartphone className="h-5 w-5" />
          <span className="font-semibold text-sm">Pagamento via PIX</span>
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={payload} size={200} level="M" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-2xl font-bold text-primary">R$ {valor.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Peça ao cliente para escanear o QR Code</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2 text-success" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copiar código PIX
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
