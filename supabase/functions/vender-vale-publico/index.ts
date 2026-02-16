import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { parceiroId, nome, cpf, telefone } = body;

    // Input validation with length limits
    if (!parceiroId || typeof parceiroId !== "string" || parceiroId.length > 50) {
      return new Response(
        JSON.stringify({ error: "Parceiro inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!nome || typeof nome !== "string" || nome.trim().length < 2 || nome.trim().length > 200) {
      return new Response(
        JSON.stringify({ error: "Nome deve ter entre 2 e 200 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!telefone || typeof telefone !== "string" || telefone.trim().length < 8 || telefone.trim().length > 20) {
      return new Response(
        JSON.stringify({ error: "Telefone inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CPF validation (optional but must be valid format if provided)
    if (cpf && (typeof cpf !== "string" || cpf.trim().length > 20)) {
      return new Response(
        JSON.stringify({ error: "CPF inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Rate limiting: check recent sales for this phone number (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("vale_gas")
      .select("id", { count: "exact", head: true })
      .eq("consumidor_telefone", telefone.trim())
      .gte("updated_at", fiveMinutesAgo)
      .eq("status", "vendido");

    if (recentCount && recentCount >= 3) {
      return new Response(
        JSON.stringify({ error: "Muitas solicitações. Aguarde alguns minutos." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
      console.error("Erro ao buscar vale:", valeError);
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
        consumidor_nome: nome.trim().substring(0, 200),
        consumidor_cpf: cpf?.trim()?.substring(0, 20) || null,
        consumidor_telefone: telefone.trim().substring(0, 20),
        valor_venda: valorVendaFinal,
      })
      .eq("id", vale.id)
      .eq("status", "disponivel"); // double-check to prevent race conditions

    if (updateError) {
      console.error("Erro ao registrar venda:", updateError);
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
    console.error("Erro interno:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
