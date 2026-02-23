import { useEmpresa } from "@/contexts/EmpresaContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";
import { toast } from "sonner";

export function usePlanLimits() {
  const { empresa } = useEmpresa();

  const checkUserLimit = useCallback(async (): Promise<boolean> => {
    if (!empresa) return false;

    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresa.id);

    if (error) {
      console.error("Error checking user limit:", error);
      return false;
    }

    const current = count || 0;
    if (current >= empresa.plano_max_usuarios) {
      toast.error(
        `Limite de ${empresa.plano_max_usuarios} usuários atingido no plano ${empresa.plano}. Faça upgrade para adicionar mais.`
      );
      return false;
    }

    return true;
  }, [empresa]);

  const checkUnidadeLimit = useCallback(async (): Promise<boolean> => {
    if (!empresa) return false;

    const { count, error } = await supabase
      .from("unidades")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresa.id)
      .eq("ativo", true);

    if (error) {
      console.error("Error checking unidade limit:", error);
      return false;
    }

    const current = count || 0;
    if (current >= empresa.plano_max_unidades) {
      toast.error(
        `Limite de ${empresa.plano_max_unidades} unidades atingido no plano ${empresa.plano}. Faça upgrade para adicionar mais.`
      );
      return false;
    }

    return true;
  }, [empresa]);

  return { checkUserLimit, checkUnidadeLimit };
}
