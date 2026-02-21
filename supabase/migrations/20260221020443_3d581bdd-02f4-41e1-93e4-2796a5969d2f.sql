
-- Allow clients to see and manage their own subscriptions
CREATE POLICY "clientes_veem_seus_contratos"
  ON public.contratos_recorrentes FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'gestor'::app_role) 
    OR has_role(auth.uid(), 'operacional'::app_role)
    OR (
      has_role(auth.uid(), 'cliente'::app_role) 
      AND cliente_id IN (SELECT id FROM public.clientes WHERE telefone IN (
        SELECT phone FROM auth.users WHERE auth.users.id = auth.uid()
      ))
    )
  );

-- Allow clients to create their own subscriptions
CREATE POLICY "clientes_criam_contratos"
  ON public.contratos_recorrentes FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'gestor'::app_role)
    OR has_role(auth.uid(), 'operacional'::app_role)
    OR has_role(auth.uid(), 'cliente'::app_role)
  );

-- Allow clients to update (pause/cancel) their own subscriptions
CREATE POLICY "clientes_atualizam_contratos"
  ON public.contratos_recorrentes FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'gestor'::app_role)
    OR has_role(auth.uid(), 'operacional'::app_role)
    OR (
      has_role(auth.uid(), 'cliente'::app_role)
      AND cliente_id IN (SELECT id FROM public.clientes WHERE telefone IN (
        SELECT phone FROM auth.users WHERE auth.users.id = auth.uid()
      ))
    )
  );

-- Drop old policies that will conflict
DROP POLICY IF EXISTS contratos_select ON public.contratos_recorrentes;
DROP POLICY IF EXISTS contratos_insert ON public.contratos_recorrentes;
DROP POLICY IF EXISTS contratos_update ON public.contratos_recorrentes;
