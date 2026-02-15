import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const token = authHeader.replace("Bearer ", "");
    let userId = "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid token format" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const allowedRoles = ["admin", "gestor", "operacional", "entregador"];
    if (!roles?.some((r: any) => allowedRoles.includes(r.role))) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "Imagem não fornecida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const [{ data: clientes }, { data: produtos }] = await Promise.all([
      sb.from("clientes").select("id, nome, telefone, endereco, bairro, cep, cidade").eq("ativo", true).limit(200),
      sb.from("produtos").select("id, nome, preco, estoque, categoria").eq("ativo", true).or("tipo_botijao.is.null,tipo_botijao.neq.vazio").limit(100),
    ]);

    const clientesList = (clientes || []).map((c: any) => `- "${c.nome}" endereco:"${c.endereco || ''}" bairro:"${c.bairro || ''}" (id: ${c.id})`).join("\n");
    const produtosList = (produtos || []).map((p: any) => `- "${p.nome}" R$${p.preco} (id: ${p.id})`).join("\n");

    const systemPrompt = `Você é um assistente de vendas de uma distribuidora de gás. O usuário vai enviar uma foto de uma anotação/relatório com dados de vendas. Pode haver MÚLTIPLOS pedidos anotados. Você deve identificar TODOS e retornar um array JSON.

CLIENTES CADASTRADOS:
${clientesList}

PRODUTOS DISPONÍVEIS:
${produtosList}

REGRAS:
1. Identifique CADA linha/item de venda separadamente.
2. Para cada venda, identifique o cliente pelo nome (busca parcial, case insensitive). Se não encontrar no cadastro, retorne cliente_id como null.
3. Identifique o(s) produto(s). Se diz "gás", "gas", "botijão" sem especificar, assuma o produto P13 ou gás mais comum.
4. Identifique a quantidade. Se diz "1 gas" ou "2 gas" interprete como quantidade. Se não especificada, assuma 1.
5. Identifique a forma de pagamento se mencionada (dinheiro, pix, cartao_credito, cartao_debito, fiado).
6. Extraia endereço separado: endereco (rua/logradouro), numero, complemento, bairro, cep, cidade.
7. A foto pode ter caligrafia difícil. Interprete da melhor forma possível.

Retorne APENAS um JSON válido neste formato (array de vendas):
{
  "vendas": [
    {
      "cliente_id": "uuid ou null",
      "cliente_nome": "nome encontrado ou digitado",
      "cliente_telefone": "telefone ou null",
      "endereco": "rua/logradouro sem número",
      "numero": "número ou null",
      "complemento": "complemento ou null",
      "bairro": "bairro ou null",
      "cep": "cep ou null",
      "cidade": "cidade ou null",
      "itens": [{ "produto_id": "uuid", "nome": "nome do produto", "quantidade": 1, "preco_unitario": 100 }],
      "forma_pagamento": "dinheiro|pix|cartao_credito|cartao_debito|fiado|null",
      "canal_venda": "telefone",
      "observacoes": "qualquer info extra"
    }
  ]
}`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    
    // Build content with image
    const imageContent = image.startsWith("data:") 
      ? image 
      : `data:image/jpeg;base64,${image}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              { type: "text", text: "Analise esta anotação de vendas e extraia todos os pedidos:" },
              { type: "image_url", image_url: { url: imageContent } }
            ]
          },
        ],
        temperature: 0.1,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "Não foi possível interpretar a anotação", raw: content }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
