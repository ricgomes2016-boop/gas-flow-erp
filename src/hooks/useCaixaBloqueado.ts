import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { getBrasiliaDate } from "@/lib/utils";
import { format } from "date-fns";

/**
 * Hook que verifica se o caixa do dia atual está bloqueado (fechado).
 * Retorna { bloqueado, loading } para uso em telas de vendas, estoque, etc.
 */
export function useCaixaBloqueado() {
  const [bloqueado, setBloqueado] = useState(false);
  const [loading, setLoading] = useState(true);
  const { unidadeAtual } = useUnidade();

  useEffect(() => {
    const check = async () => {
      setLoading(true);
      const dataHoje = format(getBrasiliaDate(), "yyyy-MM-dd");

      let query = supabase
        .from("caixa_sessoes")
        .select("bloqueado")
        .eq("data", dataHoje)
        .eq("bloqueado", true)
        .limit(1);

      if (unidadeAtual?.id) {
        query = query.eq("unidade_id", unidadeAtual.id);
      }

      const { data } = await query;
      setBloqueado((data && data.length > 0) || false);
      setLoading(false);
    };

    check();
  }, [unidadeAtual]);

  return { bloqueado, loading };
}
