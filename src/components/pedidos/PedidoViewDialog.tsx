import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer, MessageCircle, XCircle, Clock, Truck, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pedido {
  id: string;
  cliente: string;
  endereco: string;
  produtos: string;
  valor: number;
  status: "pendente" | "em_rota" | "entregue" | "cancelado";
  data: string;
  entregador?: string;
}

interface PedidoViewDialogProps {
  pedido: Pedido | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelar: (pedidoId: string) => void;
}

const statusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const, icon: Clock },
  em_rota: { label: "Em Rota", variant: "default" as const, icon: Truck },
  entregue: { label: "Entregue", variant: "outline" as const, icon: CheckCircle },
  cancelado: { label: "Cancelado", variant: "destructive" as const, icon: XCircle },
};

export function PedidoViewDialog({ pedido, open, onOpenChange, onCancelar }: PedidoViewDialogProps) {
  const { toast } = useToast();

  if (!pedido) return null;

  const config = statusConfig[pedido.status];
  const StatusIcon = config.icon;

  const handlePrint = () => {
    // Criar conteúdo para impressão
    const printContent = `
      <html>
        <head>
          <title>Pedido #${pedido.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin: 10px 0; }
            .label { font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
            .separator { border-top: 1px dashed #ccc; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PEDIDO #${pedido.id}</h2>
            <p>${pedido.data}</p>
          </div>
          <div class="separator"></div>
          <div class="info"><span class="label">Cliente:</span> ${pedido.cliente}</div>
          <div class="info"><span class="label">Endereço:</span> ${pedido.endereco}</div>
          <div class="info"><span class="label">Produtos:</span> ${pedido.produtos}</div>
          ${pedido.entregador ? `<div class="info"><span class="label">Entregador:</span> ${pedido.entregador}</div>` : ''}
          <div class="separator"></div>
          <div class="total">TOTAL: R$ ${pedido.valor.toFixed(2)}</div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    toast({
      title: "Impressão iniciada",
      description: `Pedido #${pedido.id} enviado para impressão.`,
    });
  };

  const handleWhatsApp = () => {
    const mensagem = encodeURIComponent(
      `*Pedido #${pedido.id}*\n\n` +
      `📦 *Produtos:* ${pedido.produtos}\n` +
      `💰 *Valor:* R$ ${pedido.valor.toFixed(2)}\n` +
      `📍 *Endereço:* ${pedido.endereco}\n` +
      `📅 *Data:* ${pedido.data}\n\n` +
      `Obrigado pela preferência!`
    );
    
    window.open(`https://wa.me/?text=${mensagem}`, '_blank');
    
    toast({
      title: "WhatsApp aberto",
      description: "Compartilhe o pedido via WhatsApp.",
    });
  };

  const handleCancelar = () => {
    onCancelar(pedido.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pedido #{pedido.id}</span>
            <Badge variant={config.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data/Hora</span>
              <span className="font-medium">{pedido.data}</span>
            </div>
            <Separator />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Cliente</h4>
            <p className="text-sm">{pedido.cliente}</p>
            <p className="text-sm text-muted-foreground">{pedido.endereco}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Produtos</h4>
            <p className="text-sm">{pedido.produtos}</p>
          </div>

          {pedido.entregador && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Entregador</h4>
                <p className="text-sm">{pedido.entregador}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold text-primary">
              R$ {pedido.valor.toFixed(2)}
            </span>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>
            {pedido.status !== "cancelado" && pedido.status !== "entregue" && (
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCancelar}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Pedido
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
