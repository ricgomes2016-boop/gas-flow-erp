
-- ================================================================
-- COMPREHENSIVE MULTI-TENANT ISOLATION via RESTRICTIVE POLICIES
-- 
-- RESTRICTIVE policies are ANDed with existing PERMISSIVE ones.
-- This means: even if a role-only permissive policy grants access,
-- the restrictive policy MUST ALSO pass, enforcing empresa isolation.
-- ================================================================

-- ================================================================
-- STEP 1: Add empresa_id to tables that lack both empresa_id and unidade_id
-- ================================================================
ALTER TABLE public.fornecedores ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);
ALTER TABLE public.configuracoes_empresa ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- ================================================================
-- STEP 2: RESTRICTIVE policies for ALL tables with unidade_id
-- ================================================================
DO $$
DECLARE
  tables_unidade TEXT[] := ARRAY[
    'abastecimentos', 'alertas_jornada', 'atestados_faltas', 'avaliacoes_desempenho',
    'banco_horas', 'boletos_emitidos', 'bonus', 'caixa_sessoes', 'campanhas',
    'canais_venda', 'carregamentos_rota', 'categorias_despesa', 'chamadas_recebidas',
    'checklist_saida_veiculo', 'cheques', 'cliente_unidades', 'comissao_config',
    'comodatos', 'compras', 'comunicados_contador', 'conferencia_cartao',
    'config_destino_pagamento', 'configuracoes_visuais', 'contas_bancarias',
    'contas_pagar', 'contas_receber', 'contratos_recorrentes', 'cupons_desconto',
    'devolucoes', 'documentos_contabeis', 'documentos_empresa', 'emprestimos',
    'entregadores', 'escalas_entregador', 'extrato_bancario', 'faturas_cartao',
    'ferias', 'fidelidade_clientes', 'folhas_pagamento', 'funcionarios',
    'gamificacao_ranking', 'horarios_funcionario', 'licitacoes', 'manutencoes',
    'metas', 'movimentacoes_bancarias', 'movimentacoes_caixa', 'movimentacoes_estoque',
    'multas_frota', 'notas_fiscais', 'onboarding_checklists', 'operadoras_cartao',
    'orcamentos', 'pedidos', 'ponto_eletronico', 'premiacoes', 'produtos',
    'promocoes', 'rotas_definidas', 'solicitacoes_contador', 'terminais_cartao',
    'user_unidades', 'vale_gas', 'vale_gas_acertos', 'vale_gas_lotes',
    'vale_gas_parceiros', 'vales_funcionario', 'veiculos', 'vendas_antecipadas'
  ];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables_unidade LOOP
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%s" ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY "tenant_isolation_%s" ON public.%I
       AS RESTRICTIVE FOR ALL TO authenticated
       USING (
         public.has_role(auth.uid(), ''super_admin''::public.app_role)
         OR public.unidade_belongs_to_user_empresa(unidade_id)
         OR unidade_id IS NULL
       )
       WITH CHECK (
         public.has_role(auth.uid(), ''super_admin''::public.app_role)
         OR public.unidade_belongs_to_user_empresa(unidade_id)
       )', tbl, tbl
    );
  END LOOP;
END $$;

-- ================================================================
-- STEP 3: RESTRICTIVE policies for tables with empresa_id
-- ================================================================
DO $$
DECLARE
  tables_empresa TEXT[] := ARRAY[
    'clientes', 'cliente_tags', 'conquistas', 'pagamentos_cartao',
    'plano_contas', 'fornecedores', 'configuracoes_empresa'
  ];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables_empresa LOOP
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%s" ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY "tenant_isolation_%s" ON public.%I
       AS RESTRICTIVE FOR ALL TO authenticated
       USING (
         public.has_role(auth.uid(), ''super_admin''::public.app_role)
         OR empresa_id = public.get_user_empresa_id()
         OR empresa_id IS NULL
       )
       WITH CHECK (
         public.has_role(auth.uid(), ''super_admin''::public.app_role)
         OR empresa_id = public.get_user_empresa_id()
       )', tbl, tbl
    );
  END LOOP;
END $$;

-- ================================================================
-- STEP 4: RESTRICTIVE policies for child tables (join-based)
-- Parent RLS filters the subquery automatically
-- ================================================================

-- pedido_itens → pedidos
DROP POLICY IF EXISTS "tenant_isolation_pedido_itens" ON public.pedido_itens;
CREATE POLICY "tenant_isolation_pedido_itens" ON public.pedido_itens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR pedido_id IN (SELECT id FROM public.pedidos)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR pedido_id IN (SELECT id FROM public.pedidos)
);

-- carregamento_rota_itens → carregamentos_rota
DROP POLICY IF EXISTS "tenant_isolation_carregamento_rota_itens" ON public.carregamento_rota_itens;
CREATE POLICY "tenant_isolation_carregamento_rota_itens" ON public.carregamento_rota_itens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR carregamento_id IN (SELECT id FROM public.carregamentos_rota)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR carregamento_id IN (SELECT id FROM public.carregamentos_rota)
);

-- compra_itens → compras
DROP POLICY IF EXISTS "tenant_isolation_compra_itens" ON public.compra_itens;
CREATE POLICY "tenant_isolation_compra_itens" ON public.compra_itens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR compra_id IN (SELECT id FROM public.compras)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR compra_id IN (SELECT id FROM public.compras)
);

-- devolucao_itens → devolucoes
DROP POLICY IF EXISTS "tenant_isolation_devolucao_itens" ON public.devolucao_itens;
CREATE POLICY "tenant_isolation_devolucao_itens" ON public.devolucao_itens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR devolucao_id IN (SELECT id FROM public.devolucoes)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR devolucao_id IN (SELECT id FROM public.devolucoes)
);

-- fatura_cartao_itens → faturas_cartao
DROP POLICY IF EXISTS "tenant_isolation_fatura_cartao_itens" ON public.fatura_cartao_itens;
CREATE POLICY "tenant_isolation_fatura_cartao_itens" ON public.fatura_cartao_itens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR fatura_id IN (SELECT id FROM public.faturas_cartao)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR fatura_id IN (SELECT id FROM public.faturas_cartao)
);

-- folha_pagamento_itens → folhas_pagamento
DROP POLICY IF EXISTS "tenant_isolation_folha_pagamento_itens" ON public.folha_pagamento_itens;
CREATE POLICY "tenant_isolation_folha_pagamento_itens" ON public.folha_pagamento_itens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR folha_id IN (SELECT id FROM public.folhas_pagamento)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR folha_id IN (SELECT id FROM public.folhas_pagamento)
);

-- licitacao_documentos → licitacoes
DROP POLICY IF EXISTS "tenant_isolation_licitacao_documentos" ON public.licitacao_documentos;
CREATE POLICY "tenant_isolation_licitacao_documentos" ON public.licitacao_documentos
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR licitacao_id IN (SELECT id FROM public.licitacoes)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR licitacao_id IN (SELECT id FROM public.licitacoes)
);

-- licitacao_ocorrencias → licitacoes
DROP POLICY IF EXISTS "tenant_isolation_licitacao_ocorrencias" ON public.licitacao_ocorrencias;
CREATE POLICY "tenant_isolation_licitacao_ocorrencias" ON public.licitacao_ocorrencias
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR licitacao_id IN (SELECT id FROM public.licitacoes)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR licitacao_id IN (SELECT id FROM public.licitacoes)
);

-- nota_fiscal_itens → notas_fiscais
DROP POLICY IF EXISTS "tenant_isolation_nota_fiscal_itens" ON public.nota_fiscal_itens;
CREATE POLICY "tenant_isolation_nota_fiscal_itens" ON public.nota_fiscal_itens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR nota_fiscal_id IN (SELECT id FROM public.notas_fiscais)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR nota_fiscal_id IN (SELECT id FROM public.notas_fiscais)
);

-- onboarding_itens → onboarding_checklists
DROP POLICY IF EXISTS "tenant_isolation_onboarding_itens" ON public.onboarding_itens;
CREATE POLICY "tenant_isolation_onboarding_itens" ON public.onboarding_itens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR checklist_id IN (SELECT id FROM public.onboarding_checklists)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR checklist_id IN (SELECT id FROM public.onboarding_checklists)
);

-- orcamento_itens → orcamentos
DROP POLICY IF EXISTS "tenant_isolation_orcamento_itens" ON public.orcamento_itens;
CREATE POLICY "tenant_isolation_orcamento_itens" ON public.orcamento_itens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR orcamento_id IN (SELECT id FROM public.orcamentos)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR orcamento_id IN (SELECT id FROM public.orcamentos)
);

-- vale_gas_acerto_vales → vale_gas_acertos
DROP POLICY IF EXISTS "tenant_isolation_vale_gas_acerto_vales" ON public.vale_gas_acerto_vales;
CREATE POLICY "tenant_isolation_vale_gas_acerto_vales" ON public.vale_gas_acerto_vales
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR acerto_id IN (SELECT id FROM public.vale_gas_acertos)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR acerto_id IN (SELECT id FROM public.vale_gas_acertos)
);

-- transferencia_estoque_itens → transferencias_estoque
DROP POLICY IF EXISTS "tenant_isolation_transferencia_estoque_itens" ON public.transferencia_estoque_itens;
CREATE POLICY "tenant_isolation_transferencia_estoque_itens" ON public.transferencia_estoque_itens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR transferencia_id IN (SELECT id FROM public.transferencias_estoque)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR transferencia_id IN (SELECT id FROM public.transferencias_estoque)
);

-- transferencias_estoque (has unidade_origem_id and unidade_destino_id, no plain unidade_id)
DROP POLICY IF EXISTS "tenant_isolation_transferencias_estoque" ON public.transferencias_estoque;
CREATE POLICY "tenant_isolation_transferencias_estoque" ON public.transferencias_estoque
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_origem_id)
  OR public.unidade_belongs_to_user_empresa(unidade_destino_id)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_origem_id)
);

-- transferencias_bancarias → contas_bancarias
DROP POLICY IF EXISTS "tenant_isolation_transferencias_bancarias" ON public.transferencias_bancarias;
CREATE POLICY "tenant_isolation_transferencias_bancarias" ON public.transferencias_bancarias
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR conta_origem_id IN (SELECT id FROM public.contas_bancarias)
  OR conta_destino_id IN (SELECT id FROM public.contas_bancarias)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR conta_origem_id IN (SELECT id FROM public.contas_bancarias)
);

-- rotas → entregadores
DROP POLICY IF EXISTS "tenant_isolation_rotas" ON public.rotas;
CREATE POLICY "tenant_isolation_rotas" ON public.rotas
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR entregador_id IN (SELECT id FROM public.entregadores)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR entregador_id IN (SELECT id FROM public.entregadores)
);

-- rota_historico → rotas
DROP POLICY IF EXISTS "tenant_isolation_rota_historico" ON public.rota_historico;
CREATE POLICY "tenant_isolation_rota_historico" ON public.rota_historico
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR rota_id IN (SELECT id FROM public.rotas)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR rota_id IN (SELECT id FROM public.rotas)
);

-- mdfe_nfes_vinculadas → notas_fiscais
DROP POLICY IF EXISTS "tenant_isolation_mdfe_nfes_vinculadas" ON public.mdfe_nfes_vinculadas;
CREATE POLICY "tenant_isolation_mdfe_nfes_vinculadas" ON public.mdfe_nfes_vinculadas
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR nfe_id IN (SELECT id FROM public.notas_fiscais)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR nfe_id IN (SELECT id FROM public.notas_fiscais)
);

-- ================================================================
-- STEP 5: Special tables
-- ================================================================

-- unidades (empresa_id based)
DROP POLICY IF EXISTS "tenant_isolation_unidades" ON public.unidades;
CREATE POLICY "tenant_isolation_unidades" ON public.unidades
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR empresa_id = public.get_user_empresa_id()
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR empresa_id = public.get_user_empresa_id()
);

-- audit_log (empresa_id based)
DROP POLICY IF EXISTS "tenant_isolation_audit_log" ON public.audit_log;
CREATE POLICY "tenant_isolation_audit_log" ON public.audit_log
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR empresa_id = public.get_user_empresa_id()
  OR empresa_id IS NULL
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR empresa_id = public.get_user_empresa_id()
);

-- profiles: users see own profile + staff see profiles from same empresa
DROP POLICY IF EXISTS "tenant_isolation_profiles" ON public.profiles;
CREATE POLICY "tenant_isolation_profiles" ON public.profiles
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
  OR empresa_id = public.get_user_empresa_id()
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
  OR empresa_id = public.get_user_empresa_id()
);

-- cliente_observacoes → clientes
DROP POLICY IF EXISTS "tenant_isolation_cliente_observacoes" ON public.cliente_observacoes;
CREATE POLICY "tenant_isolation_cliente_observacoes" ON public.cliente_observacoes
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR cliente_id IN (SELECT id FROM public.clientes)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR cliente_id IN (SELECT id FROM public.clientes)
);

-- cliente_tag_associacoes → clientes
DROP POLICY IF EXISTS "tenant_isolation_cliente_tag_associacoes" ON public.cliente_tag_associacoes;
CREATE POLICY "tenant_isolation_cliente_tag_associacoes" ON public.cliente_tag_associacoes
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR cliente_id IN (SELECT id FROM public.clientes)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR cliente_id IN (SELECT id FROM public.clientes)
);

-- cliente_enderecos → clientes (staff can see addresses of their empresa's clients)
DROP POLICY IF EXISTS "tenant_isolation_cliente_enderecos" ON public.cliente_enderecos;
CREATE POLICY "tenant_isolation_cliente_enderecos" ON public.cliente_enderecos
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
  OR cliente_id IN (SELECT id FROM public.clientes)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
  OR cliente_id IN (SELECT id FROM public.clientes)
);

-- entregador_conquistas → entregadores
DROP POLICY IF EXISTS "tenant_isolation_entregador_conquistas" ON public.entregador_conquistas;
CREATE POLICY "tenant_isolation_entregador_conquistas" ON public.entregador_conquistas
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR entregador_id IN (SELECT id FROM public.entregadores)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR entregador_id IN (SELECT id FROM public.entregadores)
);

-- avaliacoes_entrega → pedidos/entregadores
DROP POLICY IF EXISTS "tenant_isolation_avaliacoes_entrega" ON public.avaliacoes_entrega;
CREATE POLICY "tenant_isolation_avaliacoes_entrega" ON public.avaliacoes_entrega
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
  OR entregador_id IN (SELECT id FROM public.entregadores)
  OR pedido_id IN (SELECT id FROM public.pedidos)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
);

-- chat_mensagens: isolate by empresa context
DROP POLICY IF EXISTS "tenant_isolation_chat_mensagens" ON public.chat_mensagens;
CREATE POLICY "tenant_isolation_chat_mensagens" ON public.chat_mensagens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR remetente_id = auth.uid()
  OR destinatario_id = auth.uid()
  OR remetente_id IN (SELECT user_id FROM public.profiles WHERE empresa_id = public.get_user_empresa_id())
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR remetente_id = auth.uid()
);

-- notificacoes: user-owned
DROP POLICY IF EXISTS "tenant_isolation_notificacoes" ON public.notificacoes;
CREATE POLICY "tenant_isolation_notificacoes" ON public.notificacoes
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
);

-- ai_conversas: user-owned (already has permissive policy, add restrictive for safety)
DROP POLICY IF EXISTS "tenant_isolation_ai_conversas" ON public.ai_conversas;
CREATE POLICY "tenant_isolation_ai_conversas" ON public.ai_conversas
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
);

-- ai_mensagens: via ai_conversas
DROP POLICY IF EXISTS "tenant_isolation_ai_mensagens" ON public.ai_mensagens;
CREATE POLICY "tenant_isolation_ai_mensagens" ON public.ai_mensagens
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR conversa_id IN (SELECT id FROM public.ai_conversas)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR conversa_id IN (SELECT id FROM public.ai_conversas)
);

-- anotacoes: user-owned
DROP POLICY IF EXISTS "tenant_isolation_anotacoes" ON public.anotacoes;
CREATE POLICY "tenant_isolation_anotacoes" ON public.anotacoes
AS RESTRICTIVE FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR user_id = auth.uid()
);
