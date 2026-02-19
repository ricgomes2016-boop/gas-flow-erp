
-- Allow authenticated users with 'cliente' role to insert pedidos
CREATE POLICY "Clientes podem criar pedidos"
ON public.pedidos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'cliente'
  )
);

-- Allow clients to view their own pedidos (by cliente_id or canal_venda = Aplicativo)
CREATE POLICY "Clientes podem ver seus pedidos"
ON public.pedidos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'cliente'
  )
  AND canal_venda = 'Aplicativo'
);
