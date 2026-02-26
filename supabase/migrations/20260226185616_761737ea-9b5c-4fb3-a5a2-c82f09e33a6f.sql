
-- FIX restrictive policies: remove OR IS NULL clause that caused data leakage

-- Tables with unidade_id
DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'abastecimentos','alertas_jornada','atestados_faltas','avaliacoes_desempenho',
    'banco_horas','boletos_emitidos','bonus','caixa_sessoes','campanhas','canais_venda',
    'carregamentos_rota','categorias_despesa','chamadas_recebidas','checklist_saida_veiculo',
    'cheques','cliente_unidades','comissao_config','comodatos','compras',
    'comunicados_contador','conferencia_cartao','config_destino_pagamento',
    'contas_bancarias','contas_pagar','contas_receber','entregadores',
    'ferias','funcionarios',
    'licitacoes','manutencoes','metas','movimentacoes_bancarias',
    'movimentacoes_caixa','movimentacoes_estoque','notas_fiscais',
    'orcamentos','pagamentos_cartao','pedidos','ponto_eletronico',
    'premiacoes','produtos','rotas_definidas','terminais_cartao',
    'vale_gas','veiculos','vendas_antecipadas'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_%I ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation_%I ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (
        has_role(auth.uid(), ''super_admin''::app_role) OR unidade_belongs_to_user_empresa(unidade_id)
      ) WITH CHECK (
        has_role(auth.uid(), ''super_admin''::app_role) OR unidade_belongs_to_user_empresa(unidade_id)
      )', tbl, tbl
    );
  END LOOP;
END $$;

-- Tables with empresa_id (not unidade_id)
DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY['clientes','fornecedores','cliente_tags','configuracoes_empresa','plano_contas'];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_%I ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation_%I ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (
        has_role(auth.uid(), ''super_admin''::app_role) OR empresa_id = get_user_empresa_id()
      ) WITH CHECK (
        has_role(auth.uid(), ''super_admin''::app_role) OR empresa_id = get_user_empresa_id()
      )', tbl, tbl
    );
  END LOOP;
END $$;

-- Special tables
DROP POLICY IF EXISTS tenant_isolation_unidades ON public.unidades;
CREATE POLICY tenant_isolation_unidades ON public.unidades AS RESTRICTIVE FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR empresa_id = get_user_empresa_id()
) WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR empresa_id = get_user_empresa_id()
);

DROP POLICY IF EXISTS tenant_isolation_audit_log ON public.audit_log;
CREATE POLICY tenant_isolation_audit_log ON public.audit_log AS RESTRICTIVE FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR empresa_id = get_user_empresa_id()
) WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR empresa_id = get_user_empresa_id()
);

DROP POLICY IF EXISTS tenant_isolation_profiles ON public.profiles;
CREATE POLICY tenant_isolation_profiles ON public.profiles AS RESTRICTIVE FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR user_id = auth.uid() OR empresa_id = get_user_empresa_id()
) WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR user_id = auth.uid() OR empresa_id = get_user_empresa_id()
);

DROP POLICY IF EXISTS tenant_isolation_notificacoes ON public.notificacoes;
CREATE POLICY tenant_isolation_notificacoes ON public.notificacoes AS RESTRICTIVE FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR user_id = auth.uid()
) WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR user_id = auth.uid()
);

DROP POLICY IF EXISTS tenant_isolation_anotacoes ON public.anotacoes;
CREATE POLICY tenant_isolation_anotacoes ON public.anotacoes AS RESTRICTIVE FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR user_id = auth.uid()
) WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR user_id = auth.uid()
);

DROP POLICY IF EXISTS tenant_isolation_ai_conversas ON public.ai_conversas;
CREATE POLICY tenant_isolation_ai_conversas ON public.ai_conversas AS RESTRICTIVE FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR user_id = auth.uid()
) WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR user_id = auth.uid()
);
