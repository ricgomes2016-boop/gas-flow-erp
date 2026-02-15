import { supabase } from "@/integrations/supabase/client";

export interface ValeGasValidationResult {
  valido: boolean;
  parceiro: string;
  codigo: string;
  valor: number;
  valorVenda: number;
  valeId?: string;
  erro?: string;
}

/**
 * Validates a Vale Gás code against the database.
 * Accepts either the full code (VG-2026-00001) or just the number (1).
 * Returns both valor (cost) and valorVenda (what the customer paid to the partner).
 */
export async function validarValeGasNoBanco(codigo: string): Promise<ValeGasValidationResult> {
  const fail = (parceiro: string, cod: string, valor: number, erro: string): ValeGasValidationResult => ({
    valido: false, parceiro, codigo: cod, valor, valorVenda: 0, erro,
  });

  try {
    const trimmed = codigo.trim();
    const numInput = parseInt(trimmed);
    const isNumericOnly = !isNaN(numInput) && String(numInput) === trimmed;

    const selectFields = `
      id, numero, codigo, valor, valor_venda, status,
      vale_gas_parceiros:parceiro_id (nome)
    `;

    let data: any = null;
    let error: any = null;

    // If user typed just a number, search by numero first
    if (isNumericOnly) {
      const res = await (supabase as any).from("vale_gas").select(selectFields).eq("numero", numInput).maybeSingle();
      data = res.data;
      error = res.error;
    }

    // Fallback: search by codigo field
    if (!data && !error) {
      const res = await (supabase as any).from("vale_gas").select(selectFields).eq("codigo", trimmed).maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (error) return fail("", trimmed, 0, error.message);
    if (!data) return fail("", trimmed, 0, "Vale não encontrado");

    const parceiro = data.vale_gas_parceiros?.nome || "Parceiro";
    const cod = data.codigo;
    const valor = Number(data.valor) || 0;
    const valorVenda = Number(data.valor_venda) || valor;

    if (data.status === "utilizado") {
      return fail(parceiro, cod, valor, "Vale já foi utilizado");
    }
    if (data.status === "cancelado") {
      return fail(parceiro, cod, valor, "Vale cancelado");
    }

    return {
      valido: true,
      parceiro,
      codigo: cod,
      valor,
      valorVenda,
      valeId: data.id,
    };
  } catch (err: any) {
    return fail("", codigo, 0, err.message);
  }
}
