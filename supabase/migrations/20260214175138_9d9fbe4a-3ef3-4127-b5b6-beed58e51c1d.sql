
-- Allow entregadores to view vehicles (needed for Iniciar Jornada)
CREATE POLICY "Entregadores can view veiculos"
ON public.veiculos
FOR SELECT
USING (has_role(auth.uid(), 'entregador'::app_role));

-- Allow entregadores to view unassigned pending pedidos (so they can accept them)
CREATE POLICY "Entregadores can view unassigned pendente pedidos"
ON public.pedidos
FOR SELECT
USING (
  has_role(auth.uid(), 'entregador'::app_role) 
  AND status = 'pendente' 
  AND entregador_id IS NULL
);

-- Allow entregadores to update pedidos (to accept/assign themselves)
CREATE POLICY "Entregadores can update pedidos"
ON public.pedidos
FOR UPDATE
USING (
  has_role(auth.uid(), 'entregador'::app_role)
  AND (
    entregador_id IN (SELECT id FROM entregadores WHERE user_id = auth.uid())
    OR (entregador_id IS NULL AND status = 'pendente')
  )
);
