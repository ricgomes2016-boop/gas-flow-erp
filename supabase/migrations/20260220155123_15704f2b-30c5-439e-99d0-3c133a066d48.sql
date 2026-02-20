
-- Replace the permissive policy with a role-based one
DROP POLICY IF EXISTS "Authenticated users can manage visual configs" ON public.configuracoes_visuais;

CREATE POLICY "Admin and gestor can manage visual configs"
  ON public.configuracoes_visuais
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor')
  );
