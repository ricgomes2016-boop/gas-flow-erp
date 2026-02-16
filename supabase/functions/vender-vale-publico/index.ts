import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { parceiroId, nome, cpf, telefone } = await req.json();

    if (!parceiroId || !nome?.trim() || !telefone?.trim()) {
      return new Response(
        JSON.stringify({ error: "Nome, telefone e parceiro são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify partner exists
    const { data: parceiro, error: parceiroError } = await supabase
      .from("vale_gas_parceiros")
      .select("id, nome")
      .eq("id", parceiroId)
      .single();

    if (parceiroError || !parceiro) {
      return new Response(
        JSON.stringify({ error: "Parceiro não encontrado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find next available vale for this partner (oldest first)
    const { data: vale, error: valeError } = await supabase
      .from("vale_gas")
      .select("id, numero, codigo, valor, valor_venda, produto_nome")
      .eq("parceiro_id", parceiroId)
      .eq("status", "disponivel")
      .order("numero", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (valeError) {
      return new Response(
        JSON.stringify({ error: "Erro ao buscar vale disponível." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!vale) {
      return new Response(
        JSON.stringify({ error: "Nenhum vale disponível para este parceiro no momento." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use existing valor_venda if set, otherwise default to 125.00
    const valorVendaFinal = vale.valor_venda || 125.00;

    // Update vale to "vendido" with consumer data
    const { error: updateError } = await supabase
      .from("vale_gas")
      .update({
        status: "vendido",
        consumidor_nome: nome.trim(),
        consumidor_cpf: cpf?.trim() || null,
        consumidor_telefone: telefone.trim(),
        valor_venda: valorVendaFinal,
      })
      .eq("id", vale.id)
      .eq("status", "disponivel"); // double-check to prevent race conditions

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Erro ao registrar venda. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        vale: {
          numero: vale.numero,
          codigo: vale.codigo,
          valor: valorVendaFinal,
          produto_nome: vale.produto_nome,
        },
        parceiro: {
          nome: parceiro.nome,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
