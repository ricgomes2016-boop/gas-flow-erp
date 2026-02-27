
-- Allow entregadores to read contas_bancarias (needed for PIX key selection during delivery)
CREATE POLICY "Entregador visualiza contas bancárias"
ON public.contas_bancarias
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'entregador'::app_role));

-- Allow entregadores to read operadoras_cartao (needed for card payment during delivery)
CREATE POLICY "Entregador visualiza operadoras_cartao"
ON public.operadoras_cartao
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'entregador'::app_role));
