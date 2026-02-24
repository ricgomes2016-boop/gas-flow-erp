import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, platform, topic, tone, imagePrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Image generation
    if (type === "image") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            { role: "user", content: imagePrompt || "Crie uma imagem promocional para revenda de gás" },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos ao workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI gateway error: ${status}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Text content generation
    const platformGuides: Record<string, string> = {
      instagram: "Post para Instagram: use emojis moderados, até 2200 caracteres, inclua 5-10 hashtags relevantes do setor de gás/energia. Formato: legenda + hashtags separadas.",
      facebook: "Post para Facebook: texto mais longo permitido, use emojis com moderação, inclua 2-3 hashtags. Formato conversacional que incentive compartilhamentos.",
      tiktok: "Legenda para TikTok: curta e impactante (até 300 chars), use emojis e hashtags virais. Inclua sugestão de áudio/trend se aplicável.",
      whatsapp: "Mensagem para WhatsApp Business: direta e pessoal, use emojis com moderação, inclua CTA claro (link ou número). Formato: saudação + oferta + CTA. Máximo 500 caracteres.",
    };

    const toneGuide = tone === "informal" 
      ? "Use linguagem informal, gírias leves e muitos emojis." 
      : tone === "promocional"
      ? "Foco em urgência, escassez e call-to-action forte. Use palavras como 'últimas unidades', 'só hoje', 'aproveite'."
      : "Tom profissional e amigável. Educado mas acessível, sem gírias.";

    const systemPrompt = `Você é um especialista em marketing digital para revendas de gás (GLP). 
Crie conteúdo de marketing de alta qualidade seguindo estas regras:
- ${toneGuide}
- Sempre mencione benefícios para o cliente (entrega rápida, segurança, preço justo)
- Adapte o formato para a plataforma especificada
- Retorne APENAS o conteúdo pronto para publicar, sem explicações adicionais
- Se gerar hashtags, coloque em linha separada no final
${platformGuides[platform] || ""}`;

    const calendarPrompt = type === "calendar" 
      ? `Liste as 10 próximas datas comemorativas e oportunidades de marketing para uma revenda de gás nos próximos 60 dias. Para cada data, sugira:
- Data e nome do evento/data comemorativa
- Ideia de post (1 frase)
- Plataforma ideal (Instagram, Facebook, WhatsApp ou TikTok)

Formato: lista numerada, clara e objetiva. Considere datas brasileiras, sazonalidade de gás (inverno = mais consumo), e datas comerciais (Black Friday, etc).`
      : `Crie um post sobre o tema: "${topic}"\nPlataforma: ${platform}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: calendarPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos ao workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("marketing-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
