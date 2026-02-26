import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, Truck, CheckCircle, XCircle, CreditCard, Loader2, Ban } from "lucide-react";
import { PedidoStatus } from "@/types/pedido";

interface StatusDropdownProps {
  status: PedidoStatus | string;
  onStatusChange: (newStatus: PedidoStatus) => void;
  disabled?: boolean;
}

const statusConfig: Record<string, { label: string; variant: "secondary" | "default" | "outline" | "destructive"; icon: typeof Clock }> = {
  pendente: { label: "Pendente", variant: "secondary", icon: Clock },
  em_rota: { label: "Em Rota", variant: "default", icon: Truck },
  entregue: { label: "Entregue", variant: "outline", icon: CheckCircle },
  finalizado: { label: "Finalizado", variant: "outline", icon: CheckCircle },
  cancelado: { label: "Cancelado", variant: "destructive", icon: XCircle },
  aguardando_pagamento_cartao: { label: "Aguard. Cartão", variant: "secondary", icon: CreditCard },
  pagamento_em_processamento: { label: "Processando", variant: "default", icon: Loader2 },
  pago_cartao: { label: "Pago (Cartão)", variant: "outline", icon: CreditCard },
  pagamento_negado: { label: "Pgto Negado", variant: "destructive", icon: Ban },
};

const defaultConfig = { label: "Desconhecido", variant: "secondary" as const, icon: Clock };

const statusOptions: PedidoStatus[] = ["pendente", "em_rota", "entregue", "cancelado"];

export function StatusDropdown({ status, onStatusChange, disabled }: StatusDropdownProps) {
  const config = statusConfig[status] || defaultConfig;
  const StatusIcon = config.icon;

  // Status já finalizados ou de pagamento não podem ser alterados
  const readonlyStatuses = ["cancelado", "entregue", "finalizado", "pago_cartao", "aguardando_pagamento_cartao", "pagamento_em_processamento"];
  const isEditable = !readonlyStatuses.includes(status) && !disabled;

  if (!isEditable) {
    return (
      <Badge variant={config.variant} className="gap-1 cursor-default">
        <StatusIcon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge 
          variant={config.variant} 
          className="gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => {
          const optionConfig = statusConfig[option];
          const OptionIcon = optionConfig.icon;
          return (
            <DropdownMenuItem
              key={option}
              onClick={() => onStatusChange(option)}
              className="gap-2"
              disabled={option === status}
            >
              <OptionIcon className="h-4 w-4" />
              {optionConfig.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
