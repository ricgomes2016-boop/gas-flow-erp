import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

interface Pedido {
  id: string;
  created_at: string;
  valor_total: number | null;
  status: string | null;
}

interface VendasPorHoraChartProps {
  pedidos: Pedido[];
  isLoading: boolean;
}

export function VendasPorHoraChart({ pedidos, isLoading }: VendasPorHoraChartProps) {
  const dadosPorHora = useMemo(() => {
    // Inicializa todas as horas do dia comercial (6h às 22h)
    const horas: Record<number, { hora: string; vendas: number; quantidade: number }> = {};
    for (let h = 6; h <= 22; h++) {
      horas[h] = {
        hora: `${h.toString().padStart(2, "0")}h`,
        vendas: 0,
        quantidade: 0,
      };
    }

    // Agrupa pedidos por hora (excluindo cancelados)
    pedidos
      .filter((p) => p.status !== "cancelado")
      .forEach((pedido) => {
        const hora = new Date(pedido.created_at).getHours();
        if (horas[hora]) {
          horas[hora].vendas += pedido.valor_total || 0;
          horas[hora].quantidade += 1;
        }
      });

    return Object.values(horas);
  }, [pedidos]);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Vendas por Hora
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosPorHora} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="hora" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
                width={70}
                className="fill-muted-foreground"
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "vendas" ? "Total" : name,
                ]}
                labelFormatter={(label) => `Horário: ${label}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Bar 
                dataKey="vendas" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="vendas"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
