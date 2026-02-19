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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const ZAPI_INSTANCE_ID = Deno.env.get("ZAPI_INSTANCE_ID");
    const ZAPI_TOKEN = Deno.env.get("ZAPI_TOKEN");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
      throw new Error("Z-API credentials not configured");
    }

    const body = await req.json();
    console.log("Z-API webhook received:", JSON.stringify(body).substring(0, 500));

    // Skip messages sent by the bot itself (prevents infinite loop)
    if (body.fromMe === true) {
      return new Response(JSON.stringify({ ok: true, skipped: "fromMe" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Z-API sends different event types
    const isMessage = body.type === "ReceivedCallback" || body.isNewMsg === true;
    if (!isMessage) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const phone = body.phone || body.from || "";
    const messageText = body.text?.message || body.body || body.text || "";
    const senderName = body.senderName || body.chatName || "";
    const isGroup = body.isGroup === true;

    // Skip group messages
    if (isGroup || !phone || !messageText) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize phone: extract digits, last 10-11
    const digits = phone.replace(/\D/g, "");
    const normalized = digits.slice(-11);
    const searchPatterns = [normalized, normalized.slice(-10)];

    // Find client by phone
    let clienteId: string | null = null;
    let clienteNome: string | null = null;
    let clienteEndereco: string | null = null;

    const { data: clientes } = await supabase
      .from("clientes")
      .select("id, nome, telefone, endereco, bairro, numero")
      .or(searchPatterns.map((p) => `telefone.ilike.%${p}%`).join(","))
      .limit(1);

    if (clientes && clientes.length > 0) {
      clienteId = clientes[0].id;
      clienteNome = clientes[0].nome;
      clienteEndereco = [clientes[0].endereco, clientes[0].numero, clientes[0].bairro]
        .filter(Boolean)
        .join(", ");
    }

    // Get recent orders for context
    let recentOrders = "";
    if (clienteId) {
      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("id, valor_total, status, created_at")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (pedidos && pedidos.length > 0) {
        recentOrders = pedidos
          .map((p: any) => `- Pedido ${p.id.slice(0, 8)}: R$${p.valor_total} (${p.status})`)
          .join("\n");
      }
    }

    // Get available products
    const { data: produtos } = await supabase
      .from("produtos")
      .select("nome, preco, estoque")
      .eq("ativo", true)
      .gt("estoque", 0)
      .order("nome")
      .limit(15);

    const productList = produtos
      ? produtos.map((p: any) => `- ${p.nome}: R$${Number(p.preco).toFixed(2)}`).join("\n")
      : "Produtos indisponíveis no momento.";

    // Build AI prompt
    const systemPrompt = `Você é a Bia, atendente da Forte Gás pelo WhatsApp. Converse como uma pessoa real — simpática, acolhedora e com jeitinho brasileiro.

PERSONALIDADE:
- Fale de forma natural, como se fosse uma conversa entre amigos. Use "vc", "tá", "tô", "blz" quando fizer sentido.
- Use emojis com moderação e naturalidade (1-2 por mensagem no máximo).
- Varie suas saudações: "Oi!", "E aí, tudo bem?", "Oii, como posso te ajudar?", "Fala, ${clienteNome?.split(' ')[0] || 'amigo'}!"
- Se o cliente já é conhecido, seja mais íntima: "Oi ${clienteNome?.split(' ')[0] || ''}, bom te ver de novo!"
- Responda de forma curta e direta. Nada de textão.
- Demonstre empatia: "entendo", "com certeza", "sem problemas"
- Se o cliente demorar pra responder ou parecer confuso, seja paciente e ofereça ajuda
- Quando confirmar pedido, demonstre entusiasmo genuíno: "Show!", "Perfeito!", "Fechou!"

PRODUTOS DISPONÍVEIS:
${productList}

${clienteNome ? `CLIENTE: ${clienteNome} (já cadastrado ✓)` : "CLIENTE NOVO (não cadastrado ainda)"}
${clienteEndereco ? `ENDEREÇO SALVO: ${clienteEndereco}` : ""}
${recentOrders ? `ÚLTIMOS PEDIDOS:\n${recentOrders}` : ""}

REGRAS:
1. Se o cliente quer pedir, confirme: produto, quantidade, endereço e pagamento (dinheiro, pix, cartão).
2. Se ele já tem endereço cadastrado, pergunte: "Entrego no mesmo endereço de sempre?" ao invés de pedir tudo de novo.
3. Se o cliente é recorrente, sugira com base no histórico: "O de sempre? 😄"
4. Quando tiver todos os dados, responda com:
   [PEDIDO_CONFIRMADO]
   produto: Nome do Produto
   quantidade: X
   endereco: Endereço completo
   pagamento: forma
   troco: valor (se dinheiro)
   [/PEDIDO_CONFIRMADO]
5. Pagamentos: Dinheiro, PIX ou Cartão.
6. Se for dinheiro, pergunte naturalmente: "Vai precisar de troco? Pra quanto?"
7. Prazo de entrega: 30 a 60 minutinhos.
8. Se não é cadastrado, peça nome e endereço de forma natural, sem parecer formulário.
9. NÃO invente preços. Use APENAS os produtos listados.
10. Se o cliente mandar áudio ou algo que vc não entende, peça pra repetir de boa: "Desculpa, não consegui entender. Pode repetir? 😅"
11. Se perguntar sobre algo fora do escopo (tipo política, futebol), responda de boa e redirecione: "Haha, boa! Mas vamos falar de gás? 😄"`;

    // Generate a deterministic UUID from the phone number
    const conversationUUID = await generateUUIDFromString(`whatsapp_${normalized}`);

    // Get conversation history from DB
    const { data: historyRows } = await supabase
      .from("ai_mensagens")
      .select("role, content, created_at")
      .eq("conversa_id", conversationUUID)
      .order("created_at", { ascending: true })
      .limit(20);

    const history = historyRows
      ? historyRows.map((m: any) => ({ role: m.role, content: m.content }))
      : [];

    // Save user message
    await supabase.from("ai_mensagens").insert({
      conversa_id: conversationUUID,
      role: "user",
      content: messageText,
    });

    // Ensure conversation record exists
    await supabase.from("ai_conversas").upsert(
      {
        id: conversationUUID,
        user_id: "00000000-0000-0000-0000-000000000000",
        titulo: `WhatsApp: ${clienteNome || senderName || normalized}`,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    // Call AI
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: messageText },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      console.error("AI error:", status);
      const fallback =
        status === 429
          ? "Desculpe, estamos com muitas mensagens no momento. Tente novamente em instantes! 😊"
          : "Desculpe, tive um problema técnico. Tente novamente ou ligue para nós! 📞";

      await sendWhatsAppMessage(ZAPI_INSTANCE_ID, ZAPI_TOKEN, phone, fallback);
      return new Response(JSON.stringify({ ok: true, fallback: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    let reply = aiResult.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    // Save assistant message
    await supabase.from("ai_mensagens").insert({
      conversa_id: conversationUUID,
      role: "assistant",
      content: reply,
    });

    // Check for confirmed order
    const orderMatch = reply.match(/\[PEDIDO_CONFIRMADO\]([\s\S]*?)\[\/PEDIDO_CONFIRMADO\]/);
    if (orderMatch) {
      const orderData = parseOrderData(orderMatch[1]);
      if (orderData) {
        await createOrder(supabase, orderData, clienteId, clienteNome, senderName, normalized);
        // Remove the tag from the reply sent to customer
        reply = reply.replace(/\[PEDIDO_CONFIRMADO\][\s\S]*?\[\/PEDIDO_CONFIRMADO\]/, "").trim();
        reply += "\n\n✅ Pedido registrado com sucesso! Você receberá atualizações sobre a entrega.";
      }
    }

    // Also register as incoming call/message for CallerID popup
    await supabase.from("chamadas_recebidas").insert({
      telefone: phone,
      cliente_id: clienteId,
      cliente_nome: clienteNome || senderName,
      tipo: "whatsapp",
      status: "recebida",
    });

    // Send reply via Z-API
    await sendWhatsAppMessage(ZAPI_INSTANCE_ID, ZAPI_TOKEN, phone, reply);

    return new Response(JSON.stringify({ ok: true, reply: reply.substring(0, 100) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Z-API webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendWhatsAppMessage(instanceId: string, token: string, phone: string, message: string) {
  try {
    const ZAPI_SECURITY_TOKEN = Deno.env.get("ZAPI_SECURITY_TOKEN") || "";
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (ZAPI_SECURITY_TOKEN) {
      headers["Client-Token"] = ZAPI_SECURITY_TOKEN;
    }
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ phone, message }),
    });
    if (!resp.ok) {
      console.error("Z-API send error:", resp.status, await resp.text());
    }
  } catch (e) {
    console.error("Failed to send WhatsApp message:", e);
  }
}

function parseOrderData(raw: string): Record<string, string> | null {
  const lines = raw.trim().split("\n");
  const data: Record<string, string> = {};
  for (const line of lines) {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length) {
      data[key.trim().toLowerCase()] = valueParts.join(":").trim();
    }
  }
  return data.produto && data.quantidade ? data : null;
}

async function createOrder(
  supabase: any,
  orderData: Record<string, string>,
  clienteId: string | null,
  clienteNome: string | null,
  senderName: string,
  phone: string
) {
  try {
    // Find matching product
    const { data: produtos } = await supabase
      .from("produtos")
      .select("id, nome, preco")
      .eq("ativo", true)
      .ilike("nome", `%${orderData.produto}%`)
      .limit(1);

    const produto = produtos?.[0];
    if (!produto) {
      console.error("Product not found:", orderData.produto);
      return;
    }

    const quantidade = parseInt(orderData.quantidade) || 1;
    const valorTotal = produto.preco * quantidade;

    const paymentMap: Record<string, string> = {
      dinheiro: "dinheiro",
      pix: "pix",
      "cartão": "cartao",
      cartao: "cartao",
      "crédito": "cartao",
      credito: "cartao",
      "débito": "cartao",
      debito: "cartao",
    };

    const formaPagamento = paymentMap[orderData.pagamento?.toLowerCase()] || "dinheiro";

    const { data: pedido, error } = await supabase
      .from("pedidos")
      .insert({
        cliente_id: clienteId,
        valor_total: valorTotal,
        forma_pagamento: formaPagamento,
        status: "pendente",
        canal_venda: "whatsapp",
        endereco_entrega: orderData.endereco || "",
        observacoes: `Pedido via WhatsApp - ${clienteNome || senderName} (${phone})`,
        troco_para: orderData.troco ? parseFloat(orderData.troco) || null : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Order insert error:", error);
      return;
    }

    // Add order items
    await supabase.from("pedido_itens").insert({
      pedido_id: pedido.id,
      produto_id: produto.id,
      quantidade,
      preco_unitario: produto.preco,
      produto_nome: produto.nome,
    });

    console.log("Order created:", pedido.id);
  } catch (e) {
    console.error("Create order error:", e);
  }
}

async function generateUUIDFromString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  // Format as UUID v4-like
  const hex = Array.from(bytes.slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${(parseInt(hex[16], 16) & 0x3 | 0x8).toString(16)}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
