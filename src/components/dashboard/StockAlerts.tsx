import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { AlertTriangle } from "lucide-react";

const LOW_STOCK_THRESHOLD = 10;

export function StockAlerts() {
  const { unidadeAtual } = useUnidade();

  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ["low-stock-alerts", unidadeAtual?.id],
    enabled: !!unidadeAtual?.id,
    queryFn: async () => {
      let query = supabase
        .from("produtos")
        .select("id, nome, estoque")
        .eq("ativo", true)
        .lt("estoque", LOW_STOCK_THRESHOLD)
        .order("estoque", { ascending: true });

      if (unidadeAtual?.id) {
        query = query.eq("unidade_id", unidadeAtual.id);
      }

      const { data } = await query;
      return data || [];
    },
  });

  if (lowStockProducts.length === 0) return null;

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="text-sm font-semibold text-destructive">Estoque Crítico</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {lowStockProducts.map((p: any) => (
          <span
            key={p.id}
            className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
          >
            {p.nome}: {p.estoque ?? 0} un
          </span>
        ))}
      </div>
    </div>
  );
}
