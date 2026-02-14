import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "Imagem não fornecida" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um assistente especializado em ler documentos financeiros brasileiros: boletos, contas de luz/água/telefone/internet, recibos, notas de serviço, faturas e despesas em geral.

Extraia as informações da imagem e retorne EXCLUSIVAMENTE um JSON válido (sem markdown, sem texto extra) com esta estrutura:
{
  "despesas": [
    {
      "fornecedor": "string (nome da empresa/prestador)",
      "descricao": "string (descrição da despesa, ex: Conta de energia elétrica ref. Jan/2026)",
      "valor": number (valor total em decimal, ex: 350.90),
      "vencimento": "YYYY-MM-DD (data de vencimento)",
      "categoria": "string (uma das categorias: Fornecedores, Frota, Infraestrutura, Utilidades, RH, Compras, Outros)",
      "observacoes": "string ou null (informações adicionais como código de barras, nº documento, etc)"
    }
  ]
}

Regras:
- Se houver múltiplas despesas na imagem, retorne todas no array.
- Classifique a categoria automaticamente com base no tipo de despesa:
  - Energia, água, gás, telefone, internet → "Utilidades"
  - Aluguel, IPTU, condomínio, reformas → "Infraestrutura"
  - Combustível, manutenção veicular → "Frota"
  - Salários, benefícios, VT, VR → "RH"
  - Mercadorias, insumos, matéria-prima → "Compras"
  - Se for de um fornecedor/prestador → "Fornecedores"
  - Caso não se encaixe → "Outros"
- Valores monetários em número decimal (ex: 150.50)
- Se não conseguir ler algum campo, use null.
- A descrição deve ser clara e incluir referência do período quando visível.`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              },
              {
                type: "text",
                text: "Leia este documento de despesa/conta/boleto e extraia todas as informações. Retorne APENAS o JSON."
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Não foi possível interpretar o documento" }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
