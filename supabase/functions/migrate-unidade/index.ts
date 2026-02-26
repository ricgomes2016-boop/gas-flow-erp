import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Validate JWT - must be super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Token inválido");

    // Check super_admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .single();

    if (!roleData) throw new Error("Apenas super_admin pode executar esta operação");

    const { unidade_id, nova_empresa_nome, nova_empresa_cnpj, nova_empresa_email } = await req.json();

    if (!unidade_id || !nova_empresa_nome) {
      throw new Error("unidade_id e nova_empresa_nome são obrigatórios");
    }

    // 1. Fetch the unit being migrated
    const { data: unidade, error: unidadeErr } = await supabase
      .from("unidades")
      .select("*")
      .eq("id", unidade_id)
      .single();

    if (unidadeErr || !unidade) throw new Error("Unidade não encontrada");

    const oldEmpresaId = unidade.empresa_id;

    // 2. Create new empresa
    const slug = nova_empresa_nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

    const { data: novaEmpresa, error: empresaErr } = await supabase
      .from("empresas")
      .insert({
        nome: nova_empresa_nome,
        slug,
        cnpj: nova_empresa_cnpj || null,
        email: nova_empresa_email || null,
        plano: "starter",
        plano_max_unidades: 1,
        plano_max_usuarios: 5,
      })
      .select()
      .single();

    if (empresaErr) throw new Error("Erro ao criar empresa: " + empresaErr.message);

    const newEmpresaId = novaEmpresa.id;

    // 3. Move the unidade to the new empresa
    const { error: moveErr } = await supabase
      .from("unidades")
      .update({ empresa_id: newEmpresaId, tipo: "matriz" })
      .eq("id", unidade_id);

    if (moveErr) throw new Error("Erro ao mover unidade: " + moveErr.message);

    // 4. Move clientes that are ONLY linked to this unidade
    // First get all cliente_ids linked to this unidade
    const { data: clienteLinks } = await supabase
      .from("cliente_unidades")
      .select("cliente_id")
      .eq("unidade_id", unidade_id);

    if (clienteLinks && clienteLinks.length > 0) {
      const clienteIds = clienteLinks.map((cl) => cl.cliente_id);

      // For each client, check if they have links to OTHER unidades in the old empresa
      for (const clienteId of clienteIds) {
        const { data: otherLinks } = await supabase
          .from("cliente_unidades")
          .select("unidade_id")
          .eq("cliente_id", clienteId)
          .neq("unidade_id", unidade_id);

        // Check if any of the other links belong to the old empresa
        let hasOtherEmpresaLink = false;
        if (otherLinks && otherLinks.length > 0) {
          const { data: otherUnidades } = await supabase
            .from("unidades")
            .select("id")
            .in("id", otherLinks.map((l) => l.unidade_id))
            .eq("empresa_id", oldEmpresaId);

          hasOtherEmpresaLink = (otherUnidades && otherUnidades.length > 0);
        }

        // If client is ONLY in the migrating unidade, move empresa_id
        if (!hasOtherEmpresaLink) {
          await supabase
            .from("clientes")
            .update({ empresa_id: newEmpresaId })
            .eq("id", clienteId);
        }
      }
    }

    // 5. Move cliente_tags that belong to old empresa and are used by migrated clients
    // (skip - tags stay shared, new empresa will create their own over time)

    // 6. Move profiles/users - get users linked to only this unidade
    const { data: userLinks } = await supabase
      .from("user_unidades")
      .select("user_id")
      .eq("unidade_id", unidade_id);

    const migratedUserIds: string[] = [];

    if (userLinks && userLinks.length > 0) {
      for (const ul of userLinks) {
        // Check if user has other unidade links in old empresa
        const { data: otherUserLinks } = await supabase
          .from("user_unidades")
          .select("unidade_id")
          .eq("user_id", ul.user_id)
          .neq("unidade_id", unidade_id);

        let hasOtherLink = false;
        if (otherUserLinks && otherUserLinks.length > 0) {
          const { data: otherUnidades } = await supabase
            .from("unidades")
            .select("id")
            .in("id", otherUserLinks.map((l) => l.unidade_id))
            .eq("empresa_id", oldEmpresaId);
          hasOtherLink = (otherUnidades && otherUnidades.length > 0);
        }

        if (!hasOtherLink) {
          await supabase
            .from("profiles")
            .update({ empresa_id: newEmpresaId })
            .eq("user_id", ul.user_id);
          migratedUserIds.push(ul.user_id);
        }
      }
    }

    // Summary
    const summary = {
      nova_empresa_id: newEmpresaId,
      nova_empresa_nome: nova_empresa_nome,
      unidade_migrada: unidade.nome,
      clientes_migrados: clienteLinks?.length || 0,
      usuarios_migrados: migratedUserIds.length,
    };

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
