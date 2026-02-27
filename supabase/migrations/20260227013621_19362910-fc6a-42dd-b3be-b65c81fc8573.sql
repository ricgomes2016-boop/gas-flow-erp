
-- Allow entregadores to see other entregadores in the same empresa (for ranking)
CREATE POLICY "Entregador ve colegas da empresa"
ON public.entregadores
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'entregador'::app_role)
  AND unidade_belongs_to_user_empresa(unidade_id)
);

-- Allow entregadores to see all delivered pedidos in their empresa (for ranking)
CREATE POLICY "Entregador ve pedidos entregues da empresa para ranking"
ON public.pedidos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'entregador'::app_role)
  AND status = 'entregue'
  AND unidade_belongs_to_user_empresa(unidade_id)
);
