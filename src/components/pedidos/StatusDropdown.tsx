import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, Truck, CheckCircle, XCircle } from "lucide-react";

type PedidoStatus = "pendente" | "em_rota" | "entregue" | "cancelado";

interface StatusDropdownProps {
  status: PedidoStatus;
  onStatusChange: (newStatus: PedidoStatus) => void;
  disabled?: boolean;
}

const statusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const, icon: Clock },
  em_rota: { label: "Em Rota", variant: "default" as const, icon: Truck },
  entregue: { label: "Entregue", variant: "outline" as const, icon: CheckCircle },
  cancelado: { label: "Cancelado", variant: "destructive" as const, icon: XCircle },
};

const statusOptions: PedidoStatus[] = ["pendente", "em_rota", "entregue", "cancelado"];

export function StatusDropdown({ status, onStatusChange, disabled }: StatusDropdownProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Status já finalizados não podem ser alterados
  const isEditable = status !== "cancelado" && status !== "entregue" && !disabled;

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
