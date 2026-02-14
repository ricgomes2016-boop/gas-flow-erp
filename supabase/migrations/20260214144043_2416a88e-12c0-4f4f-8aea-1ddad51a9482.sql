
-- ============================================================
-- Fix overly permissive SELECT policies on error-level tables
-- Replace USING (true) with proper role-based access
-- ============================================================

-- FINANCIAL TABLES (admin, gestor, financeiro)
DROP POLICY "Authenticated users can view contas_pagar" ON public.contas_pagar;
CREATE POLICY "Staff can view contas_pagar" ON public.contas_pagar FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro'));

DROP POLICY "Authenticated users can view contas_receber" ON public.contas_receber;
CREATE POLICY "Staff can view contas_receber" ON public.contas_receber FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro'));

DROP POLICY "Authenticated users can view extrato_bancario" ON public.extrato_bancario;
CREATE POLICY "Staff can view extrato_bancario" ON public.extrato_bancario FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro'));

-- PROCUREMENT (admin, gestor, operacional)
DROP POLICY "Authenticated users can view compras" ON public.compras;
CREATE POLICY "Staff can view compras" ON public.compras FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'operacional'));

DROP POLICY "Authenticated users can view compra_itens" ON public.compra_itens;
CREATE POLICY "Staff can view compra_itens" ON public.compra_itens FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'operacional'));

-- ORDERS (staff + entregadores for assigned only)
DROP POLICY "Authenticated users can view pedidos" ON public.pedidos;
CREATE POLICY "Staff can view pedidos" ON public.pedidos FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'operacional'));
CREATE POLICY "Entregadores can view assigned pedidos" ON public.pedidos FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'entregador') AND entregador_id IN (
  SELECT id FROM entregadores WHERE user_id = auth.uid()
));

DROP POLICY "Authenticated users can view pedido_itens" ON public.pedido_itens;
CREATE POLICY "Staff can view pedido_itens" ON public.pedido_itens FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'operacional'));
CREATE POLICY "Entregadores can view assigned pedido_itens" ON public.pedido_itens FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'entregador') AND pedido_id IN (
  SELECT p.id FROM pedidos p JOIN entregadores e ON p.entregador_id = e.id WHERE e.user_id = auth.uid()
));

-- CASH MOVEMENTS (admin, gestor, financeiro, operacional)
DROP POLICY "Authenticated users can view movimentacoes_caixa" ON public.movimentacoes_caixa;
CREATE POLICY "Staff can view movimentacoes_caixa" ON public.movimentacoes_caixa FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro') OR has_role(auth.uid(), 'operacional'));

-- HR TABLES (admin, gestor + financeiro for vales)
DROP POLICY "Authenticated users can view vales_funcionario" ON public.vales_funcionario;
CREATE POLICY "Staff can view vales_funcionario" ON public.vales_funcionario FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro'));

DROP POLICY "Authenticated users can view bonus" ON public.bonus;
CREATE POLICY "Staff can view bonus" ON public.bonus FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

DROP POLICY "Authenticated users can view banco_horas" ON public.banco_horas;
CREATE POLICY "Staff can view banco_horas" ON public.banco_horas FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- OPERATIONS (admin, gestor, operacional)
DROP POLICY "Authenticated users can view metas" ON public.metas;
CREATE POLICY "Staff can view metas" ON public.metas FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'operacional'));

DROP POLICY "Authenticated users can view fidelidade_clientes" ON public.fidelidade_clientes;
CREATE POLICY "Staff can view fidelidade_clientes" ON public.fidelidade_clientes FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- FLEET (admin, gestor + operacional for veiculos)
DROP POLICY "Authenticated users can view abastecimentos" ON public.abastecimentos;
CREATE POLICY "Staff can view abastecimentos" ON public.abastecimentos FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

DROP POLICY "Authenticated users can view manutencoes" ON public.manutencoes;
CREATE POLICY "Staff can view manutencoes" ON public.manutencoes FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

DROP POLICY "Authenticated users can view veiculos" ON public.veiculos;
CREATE POLICY "Staff can view veiculos" ON public.veiculos FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'operacional'));

-- ROUTES (staff + entregadores for own)
DROP POLICY "Authenticated users can view rotas" ON public.rotas;
CREATE POLICY "Staff can view rotas" ON public.rotas FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'operacional'));
-- Note: entregadores already have ALL policy for their own routes

DROP POLICY "Authenticated users can view rota_historico" ON public.rota_historico;
CREATE POLICY "Staff can view rota_historico" ON public.rota_historico FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'operacional'));
CREATE POLICY "Entregadores can view own rota_historico" ON public.rota_historico FOR SELECT TO authenticated
USING (rota_id IN (
  SELECT r.id FROM rotas r JOIN entregadores e ON r.entregador_id = e.id WHERE e.user_id = auth.uid()
));
