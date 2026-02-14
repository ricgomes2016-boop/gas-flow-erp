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
    const { comando } = await req.json();
    if (!comando) {
      return new Response(JSON.stringify({ error: "Comando vazio" }), {
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

    const systemPrompt = `Você é um assistente de vendas de uma distribuidora de gás. O usuário vai digitar ou ditar por voz um comando em linguagem natural para lançar uma venda e você deve interpretar e retornar JSON estruturado.

CLIENTES CADASTRADOS:
${clientesList}

PRODUTOS DISPONÍVEIS:
${produtosList}

REGRAS:
1. Identifique o cliente pelo nome (busca parcial, case insensitive). Se não encontrar, retorne cliente_id como null e preencha os campos de endereço separadamente.
2. Identifique o(s) produto(s). Se o usuário diz "gás", "gas", "botijão", "botijao" sem especificar, assuma "P13" ou o produto de gás mais comum. Se diz "1 gas" ou "2 gas" interprete como quantidade.
3. Identifique a quantidade. Se não especificada, assuma 1.
4. Identifique a forma de pagamento se mencionada (dinheiro, pix, cartao_credito, cartao_debito, fiado). "crédito" = cartao_credito, "débito" = cartao_debito. Se não mencionada, retorne null.
5. Identifique o canal de venda se mencionado (telefone, whatsapp, balcao, portaria). Se não mencionado, retorne "telefone".
6. IMPORTANTE: Extraia o endereço separado em campos: endereco (rua/logradouro), numero, complemento, bairro, cep, cidade. 
7. Comandos de voz podem ter erros de transcrição. Interprete da melhor forma possível.

Retorne APENAS um JSON válido neste formato:
{
  "cliente_id": "uuid ou null",
  "cliente_nome": "nome encontrado ou digitado",
  "cliente_telefone": "telefone se mencionado ou null",
  "endereco": "rua/logradouro sem número",
  "numero": "número do endereço ou null",
  "complemento": "complemento ou null",
  "bairro": "bairro ou null",
  "cep": "cep ou null",
  "cidade": "cidade ou null",
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
