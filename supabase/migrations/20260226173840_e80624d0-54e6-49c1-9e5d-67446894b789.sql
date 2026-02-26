
-- ============================================
-- PEDIDOS
-- ============================================
DROP POLICY IF EXISTS "Users can view pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Users can view their unidade pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Clientes can view own pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Clientes can create pedidos" ON public.pedidos;

CREATE POLICY "Pedidos isolados por empresa" ON public.pedidos
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);

DROP POLICY IF EXISTS "Users can insert pedidos" ON public.pedidos;
CREATE POLICY "Pedidos insert isolado" ON public.pedidos
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);

DROP POLICY IF EXISTS "Users can update pedidos" ON public.pedidos;
CREATE POLICY "Pedidos update isolado" ON public.pedidos
FOR UPDATE USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);

-- ============================================
-- CLIENTES
-- ============================================
DROP POLICY IF EXISTS "Users can view clientes" ON public.clientes;
CREATE POLICY "Clientes isolados por empresa" ON public.clientes
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR empresa_id = public.get_user_empresa_id()
);

DROP POLICY IF EXISTS "Users can insert clientes" ON public.clientes;
CREATE POLICY "Clientes insert isolado" ON public.clientes
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR empresa_id = public.get_user_empresa_id()
);

DROP POLICY IF EXISTS "Users can update clientes" ON public.clientes;
CREATE POLICY "Clientes update isolado" ON public.clientes
FOR UPDATE USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR empresa_id = public.get_user_empresa_id()
);

DROP POLICY IF EXISTS "Users can delete clientes" ON public.clientes;
CREATE POLICY "Clientes delete isolado" ON public.clientes
FOR DELETE USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR empresa_id = public.get_user_empresa_id()
);

-- ============================================
-- ENTREGADORES
-- ============================================
DROP POLICY IF EXISTS "Users can view entregadores" ON public.entregadores;
CREATE POLICY "Entregadores isolados por empresa" ON public.entregadores
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR (public.has_role(auth.uid(), 'entregador'::app_role) AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert entregadores" ON public.entregadores;
CREATE POLICY "Entregadores insert isolado" ON public.entregadores
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);

DROP POLICY IF EXISTS "Users can update entregadores" ON public.entregadores;
CREATE POLICY "Entregadores update isolado" ON public.entregadores
FOR UPDATE USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR (public.has_role(auth.uid(), 'entregador'::app_role) AND user_id = auth.uid())
);

-- ============================================
-- PRODUTOS
-- ============================================
DROP POLICY IF EXISTS "Users can view produtos" ON public.produtos;
CREATE POLICY "Produtos isolados por empresa" ON public.produtos
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR unidade_id IS NULL
);

DROP POLICY IF EXISTS "Users can insert produtos" ON public.produtos;
CREATE POLICY "Produtos insert isolado" ON public.produtos
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);

DROP POLICY IF EXISTS "Users can update produtos" ON public.produtos;
CREATE POLICY "Produtos update isolado" ON public.produtos
FOR UPDATE USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);

-- ============================================
-- PEDIDO_ITENS
-- ============================================
DROP POLICY IF EXISTS "Users can view pedido_itens" ON public.pedido_itens;
CREATE POLICY "Pedido itens isolados por empresa" ON public.pedido_itens
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.pedidos p 
    WHERE p.id = pedido_id 
    AND public.unidade_belongs_to_user_empresa(p.unidade_id)
  )
);

DROP POLICY IF EXISTS "Users can insert pedido_itens" ON public.pedido_itens;
CREATE POLICY "Pedido itens insert isolado" ON public.pedido_itens
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.pedidos p 
    WHERE p.id = pedido_id 
    AND public.unidade_belongs_to_user_empresa(p.unidade_id)
  )
);

-- ============================================
-- FUNCIONARIOS
-- ============================================
DROP POLICY IF EXISTS "Users can view funcionarios" ON public.funcionarios;
CREATE POLICY "Funcionarios isolados por empresa" ON public.funcionarios
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR unidade_id IS NULL
);

DROP POLICY IF EXISTS "Users can insert funcionarios" ON public.funcionarios;
CREATE POLICY "Funcionarios insert isolado" ON public.funcionarios
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);

DROP POLICY IF EXISTS "Users can update funcionarios" ON public.funcionarios;
CREATE POLICY "Funcionarios update isolado" ON public.funcionarios
FOR UPDATE USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);

-- ============================================
-- MOVIMENTACOES_CAIXA
-- ============================================
DROP POLICY IF EXISTS "Users can view movimentacoes_caixa" ON public.movimentacoes_caixa;
CREATE POLICY "Movimentacoes isoladas por empresa" ON public.movimentacoes_caixa
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR unidade_id IS NULL
);

-- ============================================
-- CAIXA_SESSOES
-- ============================================
DROP POLICY IF EXISTS "Users can view caixa_sessoes" ON public.caixa_sessoes;
CREATE POLICY "Caixa sessoes isoladas por empresa" ON public.caixa_sessoes
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR unidade_id IS NULL
);

-- ============================================
-- CONTAS_PAGAR
-- ============================================
DROP POLICY IF EXISTS "Users can view contas_pagar" ON public.contas_pagar;
CREATE POLICY "Contas pagar isoladas por empresa" ON public.contas_pagar
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR unidade_id IS NULL
);

-- ============================================
-- CONTAS_RECEBER
-- ============================================
DROP POLICY IF EXISTS "Users can view contas_receber" ON public.contas_receber;
CREATE POLICY "Contas receber isoladas por empresa" ON public.contas_receber
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR unidade_id IS NULL
);

-- ============================================
-- VEICULOS
-- ============================================
DROP POLICY IF EXISTS "Users can view veiculos" ON public.veiculos;
CREATE POLICY "Veiculos isolados por empresa" ON public.veiculos
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR unidade_id IS NULL
);

-- ============================================
-- CAMPANHAS
-- ============================================
DROP POLICY IF EXISTS "Users can view campanhas" ON public.campanhas;
CREATE POLICY "Campanhas isoladas por empresa" ON public.campanhas
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR unidade_id IS NULL
);

-- ============================================
-- CARREGAMENTOS_ROTA
-- ============================================
DROP POLICY IF EXISTS "Users can view carregamentos_rota" ON public.carregamentos_rota;
CREATE POLICY "Carregamentos isolados por empresa" ON public.carregamentos_rota
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR (public.has_role(auth.uid(), 'entregador'::app_role) AND entregador_id IN (
    SELECT id FROM public.entregadores WHERE user_id = auth.uid()
  ))
);

-- ============================================
-- ABASTECIMENTOS
-- ============================================
DROP POLICY IF EXISTS "Users can view abastecimentos" ON public.abastecimentos;
CREATE POLICY "Abastecimentos isolados por empresa" ON public.abastecimentos
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
  OR unidade_id IS NULL
);
