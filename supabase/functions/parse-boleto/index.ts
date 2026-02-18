import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageBase64, isPdf } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "Arquivo não fornecido" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `Você é um assistente especializado em ler boletos bancários brasileiros.

Extraia as informações do boleto e retorne EXCLUSIVAMENTE um JSON válido (sem markdown, sem texto extra):
{
  "fornecedor": "string (beneficiário/cedente do boleto)",
  "descricao": "string (descrição ou instruções do boleto)",
  "valor": number (valor do documento em decimal, ex: 350.90),
  "vencimento": "YYYY-MM-DD (data de vencimento)",
  "codigo_barras": "string ou null (código de barras numérico completo, 44 ou 47 dígitos)",
  "linha_digitavel": "string ou null (linha digitável formatada com pontos e espaços)",
  "categoria": "string (classifique: Fornecedores, Frota, Infraestrutura, Utilidades, RH, Compras, Outros)",
  "observacoes": "string ou null (nº documento, nosso número, banco, etc)"
}

Regras:
- Se conseguir ler o código de barras ou linha digitável, inclua-os.
- Valores monetários em número decimal.
- Se não conseguir ler algum campo, use null.
- A descrição deve incluir referência do período quando visível.
- Classifique automaticamente a categoria baseado no tipo de despesa.`;

    const userContent: any[] = [
      {
        type: "image_url",
        image_url: {
          url: imageBase64.startsWith("data:") ? imageBase64 : `data:${isPdf ? 'application/pdf' : 'image/jpeg'};base64,${imageBase64}`
        }
      },
      {
        type: "text",
        text: "Leia este boleto bancário e extraia todas as informações. Retorne APENAS o JSON."
      }
    ];

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
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
      return new Response(JSON.stringify({ error: "Não foi possível interpretar o boleto" }), {
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
