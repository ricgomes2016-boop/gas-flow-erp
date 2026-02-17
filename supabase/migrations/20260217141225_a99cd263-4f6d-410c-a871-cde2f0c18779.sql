
-- Allow entregadores to insert their own fuel records
CREATE POLICY "Entregadores can insert own abastecimentos"
ON public.abastecimentos
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'entregador'::app_role)
  AND entregador_id IN (
    SELECT id FROM public.entregadores WHERE user_id = auth.uid()
  )
);

-- Allow entregadores to view their own fuel records
CREATE POLICY "Entregadores can view own abastecimentos"
ON public.abastecimentos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'entregador'::app_role)
  AND entregador_id IN (
    SELECT id FROM public.entregadores WHERE user_id = auth.uid()
  )
);
