import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TABLES_SCHEMA = `
Tabelas disponíveis no sistema:
- pedidos: id, cliente_id, entregador_id, valor_total, forma_pagamento, status (pendente/em_preparo/saiu_entrega/entregue/cancelado), canal_venda, endereco_entrega, created_at, unidade_id
- pedido_itens: id, pedido_id, produto_id, quantidade, preco_unitario
- clientes: id, nome, telefone, cpf, email, endereco, bairro, cidade, ativo, created_at
- produtos: id, nome, preco, estoque, categoria, ativo, codigo_barras, unidade_id
- entregadores: id, nome, telefone, status (disponivel/em_rota/indisponivel), ativo, unidade_id
- movimentacoes_caixa: id, tipo (entrada/saida), valor, descricao, categoria, created_at, unidade_id
- contas_pagar: id, fornecedor, descricao, valor, vencimento, status (pendente/pago/vencido), categoria, unidade_id
- contas_receber: id, cliente, descricao, valor, vencimento, status, forma_pagamento, unidade_id
- funcionarios: id, nome, cargo, salario, setor, ativo, data_admissao, unidade_id
- veiculos: id (tabela existe mas não detalhada aqui)
- abastecimentos: id, valor, litros, km, motorista, data, veiculo_id, status, unidade_id
- manutencoes: id, veiculo_id, tipo, descricao, valor, data, status, unidade_id
- compras: id, fornecedor_id, valor_total, status, data_compra, unidade_id
- unidades: id, nome, tipo, cidade, estado, ativo
- fidelidade_clientes: id, cliente_id, pontos, nivel, indicacoes_realizadas
- metas: id, titulo, tipo, valor_objetivo, valor_atual, status, prazo
- campanhas: id, nome, tipo, status, alcance, enviados
- bonus: id, funcionario_id, tipo, valor, status
- carregamentos_rota: id, entregador_id, status, data_saida, data_retorno
- rotas: id, entregador_id, status, data_inicio, data_fim, km_inicial, km_final
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, unidade_id } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Ask AI to generate SQL based on the question
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // First call: generate SQL query
    const sqlResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um assistente de BI para uma distribuidora de gás. Gere APENAS consultas SQL SELECT seguras baseadas no schema abaixo. 
NUNCA gere INSERT, UPDATE, DELETE, DROP, ALTER ou qualquer comando que modifique dados.
Retorne APENAS o SQL puro sem markdown, sem explicação, sem backticks.
Se a pergunta não puder ser respondida com SQL, retorne exatamente: NO_SQL
${unidade_id ? `Filtre por unidade_id = '${unidade_id}' quando a tabela tiver essa coluna.` : ''}
Use timezone 'America/Sao_Paulo' para datas. Use NOW() para data atual.
Limite resultados a no máximo 50 linhas.
Para perguntas sobre "hoje", use: created_at::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
Para "este mês": date_trunc('month', created_at AT TIME ZONE 'America/Sao_Paulo') = date_trunc('month', NOW() AT TIME ZONE 'America/Sao_Paulo')

${TABLES_SCHEMA}`,
          },
          { role: "user", content: lastUserMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_sql",
              description: "Gera uma query SQL SELECT para responder a pergunta do usuário",
              parameters: {
                type: "object",
                properties: {
                  sql: { type: "string", description: "A query SQL SELECT ou NO_SQL se não aplicável" },
                  description: { type: "string", description: "Breve descrição do que a query faz" },
                },
                required: ["sql", "description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_sql" } },
      }),
    });

    if (!sqlResponse.ok) {
      const status = sqlResponse.status;
      const txt = await sqlResponse.text();
      console.error("AI SQL generation error:", status, txt);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Falha ao gerar consulta");
    }

    const sqlResult = await sqlResponse.json();
    const toolCall = sqlResult.choices?.[0]?.message?.tool_calls?.[0];
    let sqlQuery = "NO_SQL";
    let queryDescription = "";

    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      sqlQuery = args.sql || "NO_SQL";
      queryDescription = args.description || "";
    }

    let queryData: any[] | null = null;
    let queryError: string | null = null;

    // Validate: only SELECT allowed
    if (sqlQuery !== "NO_SQL") {
      const normalized = sqlQuery.trim().toUpperCase();
      if (!normalized.startsWith("SELECT")) {
        sqlQuery = "NO_SQL";
      }
    }

    // Execute query
    if (sqlQuery !== "NO_SQL") {
      try {
        const { data, error } = await supabase.rpc("execute_readonly_query", { query_text: sqlQuery });
        if (error) {
          console.error("Query error:", error);
          queryError = error.message;
        } else {
          queryData = data;
        }
      } catch (e) {
        console.error("Query execution error:", e);
        queryError = e instanceof Error ? e.message : "Erro ao executar consulta";
      }
    }

    // Step 2: Generate natural language response with data
    const dataContext = queryData
      ? `\nResultado da consulta (${queryDescription}):\n${JSON.stringify(queryData, null, 2)}`
      : queryError
      ? `\nErro na consulta: ${queryError}`
      : "\nNenhuma consulta de banco foi necessária.";

    const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é o assistente inteligente de uma distribuidora de gás. Responda de forma clara e objetiva em português brasileiro.
Use markdown para formatar: tabelas, negrito, listas, etc.
Formate valores monetários como R$ X.XXX,XX.
Se os dados retornaram vazio, diga que não foram encontrados registros para o período/filtro.
Se houve erro na consulta, peça ao usuário reformular a pergunta.
Seja proativo: além de responder, sugira insights ou ações baseadas nos dados.
${dataContext}`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!finalResponse.ok) {
      const status = finalResponse.status;
      await finalResponse.text();
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Falha ao gerar resposta");
    }

    return new Response(finalResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
