import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { pdf_base64 } = await req.json();
    if (!pdf_base64) {
      return new Response(
        JSON.stringify({ error: "PDF não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const prompt = `Analise este PDF de extrato/relatório de operadora de cartão (PagBank, PagSeguro, Cielo, Rede, Stone, SafraPay, GetNet, SumUp ou similar).

Extraia TODAS as transações de cartão encontradas. Para cada transação, extraia:
- data_venda (formato YYYY-MM-DD)
- tipo: "credito" ou "debito"
- bandeira: "Visa", "Mastercard", "Elo", "Hipercard", "Amex" ou "Outras"
- valor_bruto: valor da venda (número decimal, ex: 150.00)
- taxa_percentual: percentual de taxa cobrado (número, ex: 3.19). Se não encontrar, use 0
- valor_taxa: valor da taxa em reais (número). Se não encontrar, calcule de valor_bruto * taxa_percentual / 100
- valor_liquido: valor líquido recebido/a receber (número). Se não encontrar, calcule valor_bruto - valor_taxa
- parcelas: número de parcelas (inteiro, mínimo 1)
- nsu: número NSU da transação (string). Se não encontrar, use ""
- autorizacao: código de autorização (string). Se não encontrar, use ""
- data_deposito: data do depósito/liquidação se disponível (formato YYYY-MM-DD ou "")

IMPORTANTE:
- Extraia TODAS as transações, mesmo que sejam muitas
- Se os valores estiverem em formato brasileiro (1.234,56), converta para decimal (1234.56)
- Se a data estiver em formato DD/MM/YYYY, converta para YYYY-MM-DD
- Se não conseguir identificar crédito/débito, use "credito"
- Identifique corretamente parcelas (ex: "2/3" significa 3 parcelas)

Retorne APENAS JSON válido:
{
  "transacoes": [
    {
      "data_venda": "2025-01-15",
      "tipo": "credito",
      "bandeira": "Visa",
      "valor_bruto": 150.00,
      "taxa_percentual": 3.19,
      "valor_taxa": 4.79,
      "valor_liquido": 145.21,
      "parcelas": 1,
      "nsu": "123456",
      "autorizacao": "ABC123",
      "data_deposito": "2025-02-14"
    }
  ],
  "operadora_detectada": "PagBank"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:application/pdf;base64,${pdf_base64}` },
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    let content = "";

    if (!response.ok) {
      console.error("Primary AI error:", await response.text());
      // Fallback: send as text
      const fallback = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{
            role: "user",
            content: `${prompt}\n\nConteúdo PDF em base64:\n${pdf_base64.substring(0, 80000)}`,
          }],
          temperature: 0.1,
        }),
      });
      if (!fallback.ok) throw new Error("Erro ao processar PDF com IA");
      const fd = await fallback.json();
      content = fd.choices?.[0]?.message?.content || "";
    } else {
      const data = await response.json();
      content = data.choices?.[0]?.message?.content || "";
    }

    console.log("AI response length:", content.length);

    let parsed: any = null;

    // Try JSON with "transacoes" key
    const jsonMatch = content.match(/\{[\s\S]*"transacoes"[\s\S]*\}/);
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[0]); } catch (e) { console.error("Parse error:", e); }
    }

    // Fallback: array
    if (!parsed?.transacoes) {
      const arrMatch = content.match(/\[[\s\S]*\]/);
      if (arrMatch) {
        try { parsed = { transacoes: JSON.parse(arrMatch[0]) }; } catch (e) { /* */ }
      }
    }

    if (!parsed?.transacoes?.length) {
      return new Response(
        JSON.stringify({ transacoes: [], message: "Nenhuma transação encontrada no PDF" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Extracted ${parsed.transacoes.length} transactions`);

    return new Response(
      JSON.stringify({ transacoes: parsed.transacoes, operadora_detectada: parsed.operadora_detectada || null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar PDF do extrato" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
