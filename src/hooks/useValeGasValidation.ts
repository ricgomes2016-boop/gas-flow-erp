import { supabase } from "@/integrations/supabase/client";

export interface ValeGasValidationResult {
  valido: boolean;
  parceiro: string;
  codigo: string;
  valor: number;
  valeId?: string;
  erro?: string;
}

/**
 * Validates a Vale Gás code against the database.
 * Used by both the delivery app and the admin settlement screens.
 */
export async function validarValeGasNoBanco(codigo: string): Promise<ValeGasValidationResult> {
  try {
    // Try finding by code first
    let query = (supabase as any).from("vale_gas").select(`
      id, numero, codigo, valor, status,
      vale_gas_parceiros:parceiro_id (nome)
    `).eq("codigo", codigo).maybeSingle();

    let { data, error } = await query;

    // If not found by code, try by number
    if (!data && !error) {
      const num = parseInt(codigo);
      if (!isNaN(num)) {
        const res = await (supabase as any).from("vale_gas").select(`
          id, numero, codigo, valor, status,
          vale_gas_parceiros:parceiro_id (nome)
        `).eq("numero", num).maybeSingle();
        data = res.data;
        error = res.error;
      }
    }

    if (error) return { valido: false, parceiro: "", codigo, valor: 0, erro: error.message };
    if (!data) return { valido: false, parceiro: "", codigo, valor: 0, erro: "Vale não encontrado" };

    if (data.status === "utilizado") {
      return { valido: false, parceiro: data.vale_gas_parceiros?.nome || "", codigo: data.codigo, valor: Number(data.valor), erro: "Vale já foi utilizado" };
    }
    if (data.status === "cancelado") {
      return { valido: false, parceiro: data.vale_gas_parceiros?.nome || "", codigo: data.codigo, valor: Number(data.valor), erro: "Vale cancelado" };
    }

    return {
      valido: true,
      parceiro: data.vale_gas_parceiros?.nome || "Parceiro",
      codigo: data.codigo,
      valor: Number(data.valor),
      valeId: data.id,
    };
  } catch (err: any) {
    return { valido: false, parceiro: "", codigo, valor: 0, erro: err.message };
  }
}
