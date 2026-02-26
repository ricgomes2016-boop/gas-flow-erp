import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { unidade_id } = await req.json().catch(() => ({ unidade_id: null }));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Get authenticated user's empresa_id
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("empresa_id")
      .eq("user_id", user.id)
      .single();

    const empresaId = profile?.empresa_id;
    if (!empresaId) {
      console.warn("User has no empresa_id, returning empty insights");
      return new Response(JSON.stringify({ insights: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get unidade IDs belonging to this empresa
    const { data: unidades } = await supabase
      .from("unidades")
      .select("id")
      .eq("empresa_id", empresaId)
      .eq("ativo", true);
    const unidadeIds = (unidades || []).map((u: any) => u.id);

    if (unidadeIds.length === 0) {
      return new Response(JSON.stringify({ insights: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build empresa-scoped filter
    const unidadeList = unidadeIds.map((id: string) => `'${id}'`).join(",");
    const unidadeFilter = unidade_id
      ? `AND unidade_id = '${unidade_id}'`
      : `AND unidade_id IN (${unidadeList})`;

    const queries = [
      `SELECT 
        COALESCE(SUM(CASE WHEN created_at::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date THEN valor_total ELSE 0 END), 0) as vendas_hoje,
        COALESCE(SUM(CASE WHEN created_at::date = ((NOW() AT TIME ZONE 'America/Sao_Paulo') - interval '1 day')::date THEN valor_total ELSE 0 END), 0) as vendas_ontem,
        COUNT(CASE WHEN created_at::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date AND status = 'pendente' THEN 1 END) as pendentes_hoje
      FROM pedidos WHERE status != 'cancelado' ${unidadeFilter}
        AND created_at >= (NOW() AT TIME ZONE 'America/Sao_Paulo' - interval '2 days')`,
      `SELECT nome, estoque, estoque_minimo FROM produtos WHERE ativo = true AND estoque <= estoque_minimo ${unidadeFilter} LIMIT 5`,
      `SELECT pi.produto_nome, SUM(pi.quantidade) as qtd FROM pedido_itens pi
        JOIN pedidos p ON p.id = pi.pedido_id
        WHERE p.status != 'cancelado' ${unidadeFilter.replace('unidade_id', 'p.unidade_id')}
        AND p.created_at >= date_trunc('week', NOW() AT TIME ZONE 'America/Sao_Paulo')
        GROUP BY pi.produto_nome ORDER BY qtd DESC LIMIT 5`,
      `SELECT COUNT(*) as qtd, COALESCE(SUM(valor), 0) as total FROM contas_pagar 
        WHERE status = 'pendente' ${unidadeFilter}
        AND vencimento <= (NOW() AT TIME ZONE 'America/Sao_Paulo' + interval '3 days')::date`,
      `SELECT COUNT(DISTINCT c.id) as inativos FROM clientes c
        WHERE c.ativo = true AND c.empresa_id = '${empresaId}' AND NOT EXISTS (
          SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id AND p.created_at >= NOW() - interval '30 days'
        )`,
    ];

    const results = await Promise.all(
      queries.map(async (sql) => {
        try {
          const { data, error } = await supabase.rpc("execute_readonly_query", { query_text: sql });
          if (error) return null;
          return data;
        } catch {
          return null;
        }
      })
    );

    const [vendasData, estoqueCritico, topProdutos, contasVencer, clientesInativos] = results;

    const now = new Date();
    const brHour = parseInt(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false }));
    const dayOfWeek = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long" });

    const contextData = JSON.stringify({
      vendas: vendasData,
      estoque_critico: estoqueCritico,
      top_produtos: topProdutos,
      contas_vencer: contasVencer,
      clientes_inativos: clientesInativos,
      hora: brHour,
      dia_semana: dayOfWeek,
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Você é um consultor de negócios de uma distribuidora de gás. Analise os dados e gere EXATAMENTE 3-4 insights acionáveis e concisos.

Regras:
- Cada insight deve ter no máximo 2 frases
- Comece cada insight com um emoji relevante
- Foque em ações práticas que o gestor pode tomar AGORA
- Priorize alertas urgentes (estoque baixo, contas vencendo)
- Inclua comparações quando possível (hoje vs ontem)
- Use linguagem direta e números específicos
- Responda em JSON array: [{"emoji": "🔥", "titulo": "...", "descricao": "...", "prioridade": "alta|media|baixa"}]
- NÃO use markdown, apenas JSON puro`,
          },
          {
            role: "user",
            content: `Dados atuais do negócio:\n${contextData}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_insights",
              description: "Retorna os insights gerados",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        emoji: { type: "string" },
                        titulo: { type: "string" },
                        descricao: { type: "string" },
                        prioridade: { type: "string", enum: ["alta", "media", "baixa"] },
                      },
                      required: ["emoji", "titulo", "descricao", "prioridade"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit atingido" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ insights: parsed.insights }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ insights: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dashboard-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
