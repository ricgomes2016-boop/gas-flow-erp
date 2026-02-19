
-- Allow clients to insert items into their own pedidos
CREATE POLICY "Clientes podem inserir itens de pedido"
ON public.pedido_itens
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'cliente'
  )
);

-- Allow clients to view items of their pedidos
CREATE POLICY "Clientes podem ver itens de seus pedidos"
ON public.pedido_itens
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'cliente'
  )
);
