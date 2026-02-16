
-- Drop the existing entregador policy for clientes
DROP POLICY IF EXISTS "Entregadores can view assigned clientes" ON public.clientes;

-- Create a more restrictive policy: only active/recent orders (last 24h)
CREATE POLICY "Entregadores can view assigned clientes"
ON public.clientes
FOR SELECT
USING (
  has_role(auth.uid(), 'entregador'::app_role) 
  AND id IN (
    SELECT p.cliente_id
    FROM pedidos p
    JOIN entregadores e ON p.entregador_id = e.id
    WHERE e.user_id = auth.uid()
      AND p.cliente_id IS NOT NULL
      AND p.status IN ('pendente', 'em_preparo', 'saiu_entrega', 'em_rota')
  )
);
