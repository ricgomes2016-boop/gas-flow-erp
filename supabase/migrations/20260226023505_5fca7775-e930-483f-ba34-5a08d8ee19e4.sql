
-- Fix INSERT policy to only allow authenticated users
DROP POLICY "Service role insere pagamentos" ON public.pagamentos_cartao;

CREATE POLICY "Autenticados inserem pagamentos"
  ON public.pagamentos_cartao FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
