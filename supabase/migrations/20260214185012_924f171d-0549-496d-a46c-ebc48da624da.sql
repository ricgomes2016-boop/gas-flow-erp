-- Add entregador_id to movimentacoes_caixa for linking driver expenses
ALTER TABLE public.movimentacoes_caixa 
ADD COLUMN IF NOT EXISTS entregador_id uuid REFERENCES public.entregadores(id);

-- Allow entregadores to insert their own expenses
CREATE POLICY "Entregadores can insert own despesas"
ON public.movimentacoes_caixa
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'entregador'::app_role) 
  AND entregador_id IN (SELECT id FROM entregadores WHERE user_id = auth.uid())
  AND tipo = 'saida'
);

-- Allow entregadores to view their own expenses
CREATE POLICY "Entregadores can view own despesas"
ON public.movimentacoes_caixa
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'entregador'::app_role) 
  AND entregador_id IN (SELECT id FROM entregadores WHERE user_id = auth.uid())
);