import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image_url } = await req.json();
    if (!image_url) throw new Error("image_url is required");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "GasFacil",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise esta foto de um cheque bancário brasileiro e extraia os dados. Retorne APENAS um JSON válido (sem markdown, sem backticks) com os campos:
{
  "numero_cheque": "número do cheque (campo nº ou número impresso)",
  "banco_emitente": "nome do banco (ex: Itaú, Bradesco, BB, Caixa, Santander)",
  "agencia": "número da agência (sem dígito verificador)",
  "conta": "número da conta corrente",
  "valor": "valor em formato numérico com ponto decimal (ex: 1500.00)",
  "data_emissao": "data no formato YYYY-MM-DD se visível",
  "data_vencimento": "data de bom para no formato YYYY-MM-DD se visível"
}
Se algum campo não for legível, use string vazia "". Para valor não legível use "".`
              },
              {
                type: "image_url",
                image_url: { url: image_url },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response, handling possible markdown wrapping
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```(?:json)?\n?/g, "").trim();
    }

    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error parsing cheque photo:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
