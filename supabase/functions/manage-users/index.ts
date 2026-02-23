import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin");

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Acesso restrito a administradores" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    // LIST users
    if (action === "list") {
      const { data: profiles, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const [{ data: roles }, { data: userUnidades }] = await Promise.all([
        supabaseAdmin.from("user_roles").select("*"),
        supabaseAdmin.from("user_unidades").select("*"),
      ]);

      const usersWithRoles = profiles?.map((p: any) => ({
        ...p,
        roles: roles?.filter((r: any) => r.user_id === p.user_id).map((r: any) => r.role) || [],
        unidade_ids: userUnidades?.filter((uu: any) => uu.user_id === p.user_id).map((uu: any) => uu.unidade_id) || [],
      }));

      return new Response(JSON.stringify({ users: usersWithRoles }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CREATE user
    if (action === "create") {
      const { email, password, full_name, phone, role, unidade_ids } = params;

      if (!email || !password || !full_name || !role) {
        return new Response(JSON.stringify({ error: "Campos obrigatórios: email, password, full_name, role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check plan user limit
      const { data: callerProfile } = await supabaseAdmin
        .from("profiles")
        .select("empresa_id")
        .eq("user_id", caller.id)
        .single();

      if (callerProfile?.empresa_id) {
        const { data: empresa } = await supabaseAdmin
          .from("empresas")
          .select("plano_max_usuarios, plano")
          .eq("id", callerProfile.empresa_id)
          .single();

        if (empresa) {
          const { count } = await supabaseAdmin
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("empresa_id", callerProfile.empresa_id);

          if ((count || 0) >= empresa.plano_max_usuarios) {
            return new Response(JSON.stringify({
              error: `Limite de ${empresa.plano_max_usuarios} usuários atingido no plano ${empresa.plano}. Faça upgrade para adicionar mais.`
            }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

      if (createError) throw createError;

      if (newUser.user) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (phone) {
          await supabaseAdmin
            .from("profiles")
            .update({ phone })
            .eq("user_id", newUser.user.id);
        }

        // Delete any auto-created role and insert the correct one
        await supabaseAdmin
          .from("user_roles")
          .delete()
          .eq("user_id", newUser.user.id);

        await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: newUser.user.id, role });

        // Assign unidades if provided
        if (unidade_ids && Array.isArray(unidade_ids) && unidade_ids.length > 0) {
          const unidadeRows = unidade_ids.map((uid: string) => ({
            user_id: newUser.user!.id,
            unidade_id: uid,
          }));
          await supabaseAdmin.from("user_unidades").insert(unidadeRows);
        }
      }

      return new Response(JSON.stringify({ success: true, user_id: newUser.user?.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // UPDATE user (profile + role + unidades)
    if (action === "update") {
      const { user_id, full_name, phone, role, unidade_ids } = params;

      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update profile fields
      const profileUpdate: Record<string, string> = {};
      if (full_name !== undefined) profileUpdate.full_name = full_name;
      if (phone !== undefined) profileUpdate.phone = phone;

      if (Object.keys(profileUpdate).length > 0) {
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update(profileUpdate)
          .eq("user_id", user_id);
        if (profileError) throw profileError;
      }

      if (full_name !== undefined) {
        await supabaseAdmin.auth.admin.updateUserById(user_id, {
          user_metadata: { full_name },
        });
      }

      if (role) {
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .update({ role })
          .eq("user_id", user_id);
        if (roleError) throw roleError;
      }

      // Update unidades assignment
      if (unidade_ids !== undefined && Array.isArray(unidade_ids)) {
        // Delete existing assignments
        await supabaseAdmin
          .from("user_unidades")
          .delete()
          .eq("user_id", user_id);

        // Insert new assignments
        if (unidade_ids.length > 0) {
          const unidadeRows = unidade_ids.map((uid: string) => ({
            user_id,
            unidade_id: uid,
          }));
          await supabaseAdmin.from("user_unidades").insert(unidadeRows);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // UPDATE role (kept for backward compatibility)
    if (action === "update_role") {
      const { user_id, role } = params;

      if (!user_id || !role) {
        return new Response(JSON.stringify({ error: "user_id e role são obrigatórios" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin
        .from("user_roles")
        .update({ role })
        .eq("user_id", user_id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE user
    if (action === "delete") {
      const { user_id } = params;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Você não pode excluir sua própria conta" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Manage users error:", error);
    return new Response(JSON.stringify({ error: "Erro ao gerenciar usuário. Tente novamente." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
