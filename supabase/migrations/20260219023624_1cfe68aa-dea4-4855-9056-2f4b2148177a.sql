
-- Drop permissive policies and replace with role-based ones
DROP POLICY "Authenticated users can manage tags" ON public.cliente_tags;
DROP POLICY "Authenticated users can manage tag associations" ON public.cliente_tag_associacoes;
DROP POLICY "Authenticated users can manage observations" ON public.cliente_observacoes;

-- cliente_tags
CREATE POLICY "Staff can manage cliente_tags" ON public.cliente_tags
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can view cliente_tags" ON public.cliente_tags
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- cliente_tag_associacoes
CREATE POLICY "Staff can manage tag associations" ON public.cliente_tag_associacoes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can view tag associations" ON public.cliente_tag_associacoes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- cliente_observacoes
CREATE POLICY "Staff can manage observacoes" ON public.cliente_observacoes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can view observacoes" ON public.cliente_observacoes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));
