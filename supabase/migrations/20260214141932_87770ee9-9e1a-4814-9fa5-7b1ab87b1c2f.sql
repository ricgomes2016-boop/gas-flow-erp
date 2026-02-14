
-- Fix: Restrict entregador access to clientes - only see customers from their assigned deliveries
DROP POLICY "Staff and entregadores can view clientes" ON public.clientes;

-- Staff can view all clients
CREATE POLICY "Staff can view clientes"
ON public.clientes
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR 
  public.has_role(auth.uid(), 'operacional')
);

-- Entregadores can only view clients from their assigned deliveries
CREATE POLICY "Entregadores can view assigned clientes"
ON public.clientes
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'entregador') AND
  id IN (
    SELECT p.cliente_id FROM pedidos p
    JOIN entregadores e ON p.entregador_id = e.id
    WHERE e.user_id = auth.uid()
      AND p.cliente_id IS NOT NULL
  )
);
