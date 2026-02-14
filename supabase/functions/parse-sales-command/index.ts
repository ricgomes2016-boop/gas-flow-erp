import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comando } = await req.json();
    if (!comando) {
      return new Response(JSON.stringify({ error: "Comando vazio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch clients and products from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const [{ data: clientes }, { data: produtos }] = await Promise.all([
      sb.from("clientes").select("id, nome, telefone, endereco, bairro, cep").eq("ativo", true).limit(200),
      sb.from("produtos").select("id, nome, preco, estoque, categoria").eq("ativo", true).or("tipo_botijao.is.null,tipo_botijao.neq.vazio").limit(100),
    ]);

    const clientesList = (clientes || []).map((c: any) => `- "${c.nome}" (id: ${c.id})`).join("\n");
    const produtosList = (produtos || []).map((p: any) => `- "${p.nome}" R$${p.preco} (id: ${p.id})`).join("\n");

    const systemPrompt = `Você é um assistente de vendas de uma distribuidora de gás. O usuário vai digitar um comando em linguagem natural para lançar uma venda e você deve interpretar e retornar JSON estruturado.

CLIENTES CADASTRADOS:
${clientesList}

PRODUTOS DISPONÍVEIS:
${produtosList}

REGRAS:
1. Identifique o cliente pelo nome (busca parcial, case insensitive). Se não encontrar, retorne cliente_id como null e cliente_nome com o texto digitado.
2. Identifique o(s) produto(s). Se não especificado, assuma "P13" ou o produto de gás mais comum. 
3. Identifique a quantidade. Se não especificada, assuma 1.
4. Identifique a forma de pagamento se mencionada (dinheiro, pix, cartao_credito, cartao_debito, fiado). Se não mencionada, retorne null.
5. Identifique o canal de venda se mencionado (telefone, whatsapp, balcao, portaria). Se não mencionado, retorne "telefone".

Retorne APENAS um JSON válido neste formato:
{
  "cliente_id": "uuid ou null",
  "cliente_nome": "nome encontrado ou digitado",
  "itens": [{ "produto_id": "uuid", "nome": "nome do produto", "quantidade": 1, "preco_unitario": 100 }],
  "forma_pagamento": "dinheiro|pix|cartao_credito|cartao_debito|fiado|null",
  "canal_venda": "telefone|whatsapp|balcao|portaria",
  "observacoes": "qualquer info extra do comando"
}`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
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
          { role: "user", content: comando },
        ],
        temperature: 0.1,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "Não foi possível interpretar o comando", raw: content }), {
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
