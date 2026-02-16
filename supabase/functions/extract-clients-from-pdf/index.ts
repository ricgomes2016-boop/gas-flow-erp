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

    console.log("Auth OK - processing PDF request");

    const { pdf_base64 } = await req.json();

    if (!pdf_base64) {
      return new Response(
        JSON.stringify({ error: "PDF não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const prompt = `Analise este documento PDF que contém dados de clientes (pode ser uma lista, planilha, relatório, etc).

Extraia TODOS os clientes encontrados no documento. Para cada cliente, extraia os seguintes campos quando disponíveis:
- nome (obrigatório)
- telefone
- endereco (rua/logradouro)
- numero (número do endereço)
- bairro
- cidade
- cep
- cpf
- email
- tipo (residencial, comercial ou industrial - se não especificado, use "residencial")
- observacoes

IMPORTANTE:
- Se houver múltiplos clientes, retorne todos em um array
- Se algum campo não estiver legível ou não existir, use string vazia ""
- Formate telefones como (XX) XXXXX-XXXX quando possível
- Formate CEP como XXXXX-XXX quando possível
- Separe corretamente rua e número quando estiverem juntos
- Se o documento contiver uma lista/tabela, extraia cada linha como um cliente separado

Retorne APENAS um JSON válido no formato:
{
  "clientes": [
    {
      "nome": "Nome do Cliente",
      "telefone": "(00) 00000-0000",
      "endereco": "Rua Exemplo",
      "numero": "123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "cep": "00000-000",
      "cpf": "",
      "email": "",
      "tipo": "residencial",
      "observacoes": ""
    }
  ]
}`;

    // Use inline_data with proper PDF mime type for Gemini
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
                image_url: {
                  url: `data:application/pdf;base64,${pdf_base64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      
      // If PDF format fails, try converting first pages as images approach
      // Fallback: send as plain text extraction request
      console.log("Trying fallback approach - treating PDF content as text");
      
      const fallbackResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                { 
                  type: "text", 
                  text: `${prompt}\n\nO conteúdo do PDF está codificado em base64 abaixo. Decodifique e extraia os dados:\n\n${pdf_base64.substring(0, 50000)}` 
                },
              ],
            },
          ],
          temperature: 0.1,
        }),
      });

      if (!fallbackResponse.ok) {
        const fallbackError = await fallbackResponse.text();
        console.error("Fallback AI API error:", fallbackError);
        throw new Error("Erro ao processar PDF com IA");
      }

      const fallbackData = await fallbackResponse.json();
      const fallbackContent = fallbackData.choices?.[0]?.message?.content || "";
      const fallbackJsonMatch = fallbackContent.match(/\{[\s\S]*\}/);
      
      if (!fallbackJsonMatch) {
        throw new Error("Não foi possível extrair dados do PDF");
      }

      const fallbackParsed = JSON.parse(fallbackJsonMatch[0]);
      return new Response(
        JSON.stringify(fallbackParsed),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Não foi possível extrair dados do PDF");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar PDF" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
