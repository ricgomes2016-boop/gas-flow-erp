
-- Helper: check if a unidade belongs to the current user's empresa
CREATE OR REPLACE FUNCTION public.unidade_belongs_to_user_empresa(_unidade_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.unidades 
    WHERE id = _unidade_id 
    AND empresa_id = public.get_user_empresa_id()
  )
$$;

-- ============================================
-- MOVIMENTACOES_ESTOQUE: isolate by empresa via unidade_id
-- ============================================
DROP POLICY IF EXISTS "Users can view movimentacoes_estoque" ON public.movimentacoes_estoque;
DROP POLICY IF EXISTS "Movimentacoes estoque isoladas por empresa" ON public.movimentacoes_estoque;

CREATE POLICY "Movimentacoes estoque isoladas por empresa" ON public.movimentacoes_estoque
FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);

DROP POLICY IF EXISTS "Users can insert movimentacoes_estoque" ON public.movimentacoes_estoque;
DROP POLICY IF EXISTS "Mov estoque insert isolado" ON public.movimentacoes_estoque;
CREATE POLICY "Mov estoque insert isolado" ON public.movimentacoes_estoque
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);

DROP POLICY IF EXISTS "Users can update movimentacoes_estoque" ON public.movimentacoes_estoque;
DROP POLICY IF EXISTS "Mov estoque update isolado" ON public.movimentacoes_estoque;
CREATE POLICY "Mov estoque update isolado" ON public.movimentacoes_estoque
FOR UPDATE USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.unidade_belongs_to_user_empresa(unidade_id)
);
